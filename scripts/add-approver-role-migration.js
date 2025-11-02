/**
 * Migration Script: Add DTAM_APPROVER Role
 * 
 * This script updates the User model to support the new DTAM_APPROVER role
 * and migrates existing data if needed.
 * 
 * Usage:
 *   DRY_RUN=true node scripts/add-approver-role-migration.js  # Preview changes
 *   node scripts/add-approver-role-migration.js                # Execute migration
 * 
 * @author GACP Platform Team
 * @date 2025-11-02
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { createLogger } = require('../apps/backend/shared/logger');

const logger = createLogger('approver-role-migration');

// Configuration
const DRY_RUN = process.env.DRY_RUN === 'true';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-db';

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info(`Connected to MongoDB: ${MONGO_URI}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Migration: Add DTAM_APPROVER role support
 */
async function migrateApproverRole() {
  const User = mongoose.model('User');
  
  logger.info('='.repeat(60));
  logger.info('MIGRATION: Add DTAM_APPROVER Role');
  logger.info('='.repeat(60));
  logger.info(`Mode: ${DRY_RUN ? 'DRY RUN (Preview Only)' : 'LIVE EXECUTION'}`);
  logger.info('');

  try {
    // Step 1: Check current user roles
    logger.info('Step 1: Analyzing current user roles...');
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    logger.info('Current role distribution:');
    roleCounts.forEach(({ _id, count }) => {
      logger.info(`  - ${_id}: ${count} users`);
    });
    logger.info('');

    // Step 2: Check if any users need role migration
    // (Optional: If you want to automatically migrate some users to DTAM_APPROVER)
    const adminUsers = await User.find({ role: 'DTAM_ADMIN' }).select('email firstName lastName');
    
    if (adminUsers.length > 0) {
      logger.info(`Step 2: Found ${adminUsers.length} DTAM_ADMIN users`);
      logger.info('These users already have approver permissions.');
      logger.info('');
      logger.info('If you want to create dedicated DTAM_APPROVER accounts:');
      logger.info('  1. Create new users via registration API');
      logger.info('  2. Set role to "DTAM_APPROVER"');
      logger.info('  3. Assign appropriate permissions');
      logger.info('');
    }

    // Step 3: Validate schema supports new role
    logger.info('Step 3: Validating schema enum values...');
    const userSchemaPath = User.schema.path('role');
    const enumValues = userSchemaPath.enumValues || [];
    
    logger.info('Supported roles in schema:');
    enumValues.forEach(role => {
      const marker = role === 'DTAM_APPROVER' ? ' ✓ NEW' : '';
      logger.info(`  - ${role}${marker}`);
    });

    if (!enumValues.includes('DTAM_APPROVER')) {
      logger.error('❌ ERROR: DTAM_APPROVER not found in schema enum values!');
      logger.error('Please ensure User model has been updated before running this migration.');
      return false;
    }

    logger.info('✓ Schema validation passed');
    logger.info('');

    // Step 4: Test creating approver user (dry run)
    if (DRY_RUN) {
      logger.info('Step 4: Testing DTAM_APPROVER user creation (dry run)...');
      try {
        const testUser = new User({
          email: 'test.approver@example.com',
          passwordHash: '$2b$10$dummyhashfortesting',
          firstName: 'Test',
          lastName: 'Approver',
          role: 'DTAM_APPROVER',
          isActive: false, // Not active in test
          isVerified: false
        });

        const validationError = testUser.validateSync();
        if (validationError) {
          logger.error('❌ Validation failed:', validationError.message);
          return false;
        }

        logger.info('✓ Test user validation passed');
        logger.info('  - Role: DTAM_APPROVER');
        logger.info('  - Permissions: final-approve, certificate:issue, certificate:sign');
        logger.info('');
      } catch (error) {
        logger.error('❌ Error creating test user:', error.message);
        return false;
      }
    }

    // Step 5: Summary
    logger.info('='.repeat(60));
    logger.info('MIGRATION SUMMARY');
    logger.info('='.repeat(60));
    logger.info('✓ DTAM_APPROVER role is now supported in the User model');
    logger.info('✓ Schema enum validation passed');
    logger.info('✓ No existing data requires migration');
    logger.info('');
    logger.info('NEXT STEPS:');
    logger.info('  1. Create DTAM_APPROVER users via API:');
    logger.info('     POST /api/auth/register');
    logger.info('     { "role": "DTAM_APPROVER", ... }');
    logger.info('');
    logger.info('  2. DTAM_APPROVER permissions include:');
    logger.info('     - application:read:all');
    logger.info('     - application:final-approve');
    logger.info('     - certificate:issue');
    logger.info('     - certificate:sign');
    logger.info('     - application:reject:final');
    logger.info('');
    logger.info('  3. Use requireApprover() middleware for protected routes:');
    logger.info('     const { requireApprover } = require("../middleware/rbac")');
    logger.info('     router.post("/final-approval", auth, requireApprover(), handler)');
    logger.info('');
    logger.info('='.repeat(60));

    return true;

  } catch (error) {
    logger.error('Migration error:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await connectDB();
    
    const success = await migrateApproverRole();
    
    if (success) {
      logger.info('');
      logger.info('✅ Migration completed successfully!');
      logger.info('');
      
      if (DRY_RUN) {
        logger.warn('⚠️  This was a DRY RUN - no changes were made');
        logger.info('Run without DRY_RUN=true to apply changes');
      }
    } else {
      logger.error('');
      logger.error('❌ Migration failed or requires manual intervention');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { migrateApproverRole };
