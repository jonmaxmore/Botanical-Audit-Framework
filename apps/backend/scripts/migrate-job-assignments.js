/**
 * Migration Script: Job Ticket System - Add New Fields
 * 
 * This script migrates existing job assignments to include new fields
 * from the Job Ticket System enhancement:
 * - jobType (default: 'field_inspection')
 * - comments (empty array)
 * - attachments (empty array)
 * - completionEvidence (null)
 * - sla (calculated from existing timestamps)
 * - history (initial entry from createdAt)
 * - relatedEntities (empty object)
 * - notifications (empty object)
 * 
 * Usage: node migrate-job-assignments.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit';
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set to 'true' to preview changes without applying

// Default job type mapping based on inspection type
const DEFAULT_JOB_TYPES = {
  'on-site': 'field_inspection',
  'video-call': 'video_inspection',
  'document': 'document_review',
  'follow-up': 'follow_up',
  'certification': 'certification_audit'
};

// Default SLA duration in days
const DEFAULT_SLA_DAYS = 7;

async function migrateJobAssignments() {
  console.log('🚀 Starting Job Assignment Migration...');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'LIVE (will update database)'}`);
  console.log('');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    const db = mongoose.connection.db;
    const collection = db.collection('jobassignments');

    // Find all job assignments that need migration
    const assignmentsToMigrate = await collection.find({
      $or: [
        { jobType: { $exists: false } },
        { comments: { $exists: false } },
        { attachments: { $exists: false } },
        { sla: { $exists: false } },
        { history: { $exists: false } }
      ]
    }).toArray();

    console.log(`📊 Found ${assignmentsToMigrate.length} job assignments to migrate`);
    console.log('');

    if (assignmentsToMigrate.length === 0) {
      console.log('✨ No migrations needed. All job assignments are up to date!');
      await mongoose.connection.close();
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Migrate each assignment
    for (const assignment of assignmentsToMigrate) {
      try {
        const updates = {};

        // Add jobType if missing
        if (!assignment.jobType) {
          const inspectionType = assignment.inspectionType || assignment.type || 'on-site';
          updates.jobType = DEFAULT_JOB_TYPES[inspectionType] || 'field_inspection';
        }

        // Add comments array if missing
        if (!assignment.comments) {
          updates.comments = [];
        }

        // Add attachments array if missing
        if (!assignment.attachments) {
          updates.attachments = [];
        }

        // Add completionEvidence if missing
        if (!assignment.completionEvidence) {
          updates.completionEvidence = null;
        }

        // Calculate and add SLA if missing
        if (!assignment.sla) {
          const createdAt = assignment.createdAt || new Date();
          const dueDate = assignment.scheduledDate || 
                         new Date(createdAt.getTime() + DEFAULT_SLA_DAYS * 24 * 60 * 60 * 1000);
          
          const now = new Date();
          const remainingMs = dueDate.getTime() - now.getTime();
          const remainingHours = remainingMs / (1000 * 60 * 60);
          
          updates.sla = {
            dueDate: dueDate,
            breached: assignment.status === 'completed' 
              ? (assignment.completedAt && assignment.completedAt > dueDate)
              : (now > dueDate),
            remainingHours: Math.round(remainingHours * 100) / 100
          };

          if (assignment.status === 'completed' && assignment.completedAt) {
            updates.sla.completedAt = assignment.completedAt;
          }
        }

        // Add initial history entry if missing
        if (!assignment.history || assignment.history.length === 0) {
          const createdAt = assignment.createdAt || new Date();
          const createdBy = assignment.createdBy || assignment.assignedBy || {
            userId: 'system',
            name: 'System',
            role: 'system'
          };

          updates.history = [{
            action: 'created',
            performedBy: {
              userId: createdBy.userId || createdBy._id || 'system',
              name: createdBy.name || createdBy.fullName || 'System',
              role: createdBy.role || 'system'
            },
            changes: {
              status: 'pending',
              assignedTo: assignment.assignedTo
            },
            timestamp: createdAt
          }];

          // Add accepted entry if status is beyond pending
          if (assignment.acceptedAt && ['accepted', 'in_progress', 'completed'].includes(assignment.status)) {
            const acceptedBy = assignment.assignedTo || createdBy;
            updates.history.push({
              action: 'accepted',
              performedBy: {
                userId: acceptedBy.userId || acceptedBy._id || 'unknown',
                name: acceptedBy.name || acceptedBy.fullName || 'Unknown',
                role: acceptedBy.role || 'inspector'
              },
              changes: {
                status: 'accepted'
              },
              timestamp: assignment.acceptedAt
            });
          }

          // Add started entry if status is in_progress or completed
          if (assignment.startedAt && ['in_progress', 'completed'].includes(assignment.status)) {
            const startedBy = assignment.assignedTo || createdBy;
            updates.history.push({
              action: 'started',
              performedBy: {
                userId: startedBy.userId || startedBy._id || 'unknown',
                name: startedBy.name || startedBy.fullName || 'Unknown',
                role: startedBy.role || 'inspector'
              },
              changes: {
                status: 'in_progress'
              },
              timestamp: assignment.startedAt
            });
          }

          // Add completed entry if status is completed
          if (assignment.completedAt && assignment.status === 'completed') {
            const completedBy = assignment.assignedTo || createdBy;
            updates.history.push({
              action: 'completed',
              performedBy: {
                userId: completedBy.userId || completedBy._id || 'unknown',
                name: completedBy.name || completedBy.fullName || 'Unknown',
                role: completedBy.role || 'inspector'
              },
              changes: {
                status: 'completed',
                slaBreached: updates.sla?.breached || false
              },
              timestamp: assignment.completedAt
            });
          }
        }

        // Add relatedEntities if missing
        if (!assignment.relatedEntities) {
          updates.relatedEntities = {
            farmId: assignment.farmId || null,
            reviewerId: assignment.reviewerId || null
          };
        }

        // Add notifications object if missing
        if (!assignment.notifications) {
          updates.notifications = {
            assignmentCreated: true,
            dueDateReminder: false,
            slaBreached: updates.sla?.breached || false
          };
        }

        // Preview or apply updates
        if (DRY_RUN) {
          console.log(`📝 Would update assignment ${assignment._id}:`);
          console.log(JSON.stringify(updates, null, 2));
          console.log('');
        } else {
          await collection.updateOne(
            { _id: assignment._id },
            { $set: updates }
          );
          console.log(`✅ Migrated assignment ${assignment._id}`);
        }

        successCount++;
      } catch (err) {
        console.error(`❌ Error migrating assignment ${assignment._id}:`, err.message);
        errorCount++;
      }
    }

    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   Total: ${assignmentsToMigrate.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('');

    if (DRY_RUN) {
      console.log('💡 This was a DRY RUN. To apply changes, run: DRY_RUN=false node migrate-job-assignments.js');
    } else {
      console.log('✨ Migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run migration
migrateJobAssignments()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
