/**
 * JobAssignment Model
 * MongoDB schema for job assignment collection
 *
 * @module models/jobassignment
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const JobAssignmentSchema = new mongoose.Schema(
  {
    // Assignment identification
    assignmentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // Application reference
    applicationId: {
      type: String,
      required: true,
      index: true
    },

    // User assignment
    assignedTo: {
      type: String,
      required: true,
      index: true
    },

    assignedBy: {
      type: String,
      required: true,
      default: 'system'
    },

    // Role
    role: {
      type: String,
      required: true,
      enum: ['reviewer', 'inspector', 'approver'],
      index: true
    },

    // Job Type (NEW)
    jobType: {
      type: String,
      enum: [
        'DOCUMENT_REVIEW',
        'FARM_INSPECTION',
        'VIDEO_CALL_INSPECTION',
        'ONSITE_INSPECTION',
        'FINAL_APPROVAL',
        'GENERAL'
      ],
      default: 'GENERAL'
    },

    // Assignment status
    status: {
      type: String,
      required: true,
      enum: [
        'assigned',
        'accepted',
        'in_progress',
        'completed',
        'rejected',
        'cancelled',
        'reassigned'
      ],
      default: 'assigned',
      index: true
    },

    // Priority level
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },

    // Assignment strategy
    strategy: {
      type: String,
      required: true,
      enum: ['round_robin', 'workload_based', 'performance_based', 'manual'],
      default: 'workload_based'
    },

    // Time tracking
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },

    acceptedAt: {
      type: Date,
      default: null
    },

    startedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    // Reassignment tracking
    reassignedTo: {
      type: String,
      default: null
    },

    reassignedBy: {
      type: String,
      default: null
    },

    reassignReason: {
      type: String,
      default: null
    },

    reassignedAt: {
      type: Date,
      default: null
    },

    // Cancellation tracking
    cancellationReason: {
      type: String,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    },

    // Notes (Legacy - kept for backward compatibility)
    notes: {
      type: String,
      default: null
    },

    // Comments Thread (NEW)
    comments: [
      {
        commentId: {
          type: String,
          default: () => `CMT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        },
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        userRole: { type: String },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        attachments: [
          {
            fileName: String,
            fileUrl: String,
            fileType: String,
            fileSize: Number
          }
        ]
      }
    ],

    // Job-level Attachments (NEW)
    attachments: [
      {
        attachmentId: {
          type: String,
          default: () => `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        },
        type: {
          type: String,
          enum: ['assignment_note', 'requirement', 'instruction', 'evidence', 'other'],
          default: 'other'
        },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: String,
        fileSize: Number,
        uploadedBy: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    // Completion Evidence (NEW)
    completionEvidence: {
      completedBy: String,
      completedAt: Date,
      reportUrl: String,
      score: Number,
      recommendation: {
        type: String,
        enum: ['Approve', 'Reject', 'Request More Info']
      },
      summary: String,
      checklistResults: mongoose.Schema.Types.Mixed
    },

    // SLA Tracking (NEW)
    sla: {
      expectedDuration: { type: Number, default: 7 }, // days
      dueDate: Date,
      actualDuration: Number, // days
      isOnTime: { type: Boolean, default: true },
      delayReason: String
    },

    // History/Audit Trail (NEW)
    history: [
      {
        action: {
          type: String,
          enum: [
            'JOB_CREATED',
            'JOB_ACCEPTED',
            'JOB_REJECTED',
            'JOB_STARTED',
            'JOB_COMPLETED',
            'JOB_CANCELLED',
            'JOB_REASSIGNED',
            'COMMENT_ADDED',
            'ATTACHMENT_ADDED',
            'STATUS_CHANGED',
            'SLA_BREACHED'
          ],
          required: true
        },
        timestamp: { type: Date, default: Date.now },
        actor: { type: String, required: true },
        actorRole: String,
        details: String,
        metadata: mongoose.Schema.Types.Mixed
      }
    ],

    // Related Entities (NEW)
    relatedEntities: {
      scheduleId: String,
      inspectionId: String,
      paymentId: String,
      certificateId: String
    },

    // Notification Settings (NEW)
    notifications: {
      onCreated: { type: Boolean, default: true },
      onAccepted: { type: Boolean, default: true },
      onRejected: { type: Boolean, default: true },
      onCompleted: { type: Boolean, default: true },
      onComment: { type: Boolean, default: true },
      recipientIds: [String]
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'job_assignments'
  }
);

// Compound indexes for better query performance
JobAssignmentSchema.index({ assignedTo: 1, status: 1 });
JobAssignmentSchema.index({ applicationId: 1, role: 1 });
JobAssignmentSchema.index({ status: 1, priority: 1 });
JobAssignmentSchema.index({ role: 1, status: 1 });
JobAssignmentSchema.index({ assignedAt: -1 });
JobAssignmentSchema.index({ 'sla.dueDate': 1 }); // NEW: For SLA queries
JobAssignmentSchema.index({ jobType: 1 }); // NEW: For job type filtering

// Virtual for time to accept (in minutes)
JobAssignmentSchema.virtual('timeToAcceptMinutes').get(function () {
  if (!this.acceptedAt) return null;
  return Math.floor((this.acceptedAt - this.assignedAt) / (1000 * 60));
});

// Virtual for time to complete (in minutes)
JobAssignmentSchema.virtual('timeToCompleteMinutes').get(function () {
  if (!this.completedAt) return null;
  return Math.floor((this.completedAt - this.assignedAt) / (1000 * 60));
});

// Virtual for is active
JobAssignmentSchema.virtual('isActive').get(function () {
  return ['assigned', 'accepted', 'in_progress'].includes(this.status);
});

// Virtual for is overdue (24 hours without acceptance)
JobAssignmentSchema.virtual('isOverdue').get(function () {
  if (this.status !== 'assigned') return false;
  const now = new Date();
  const hours = (now - this.assignedAt) / (1000 * 60 * 60);
  return hours > 24;
});

// Instance method: Accept assignment
JobAssignmentSchema.methods.accept = function () {
  if (this.status === 'assigned') {
    this.status = 'accepted';
    this.acceptedAt = new Date();
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Cannot accept assignment with status: ${this.status}`));
};

// Instance method: Start assignment
JobAssignmentSchema.methods.start = function () {
  if (['assigned', 'accepted'].includes(this.status)) {
    this.status = 'in_progress';
    this.startedAt = new Date();
    if (!this.acceptedAt) {
      this.acceptedAt = new Date();
    }
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Cannot start assignment with status: ${this.status}`));
};

// Instance method: Complete assignment
JobAssignmentSchema.methods.complete = function (data = {}) {
  if (['assigned', 'accepted', 'in_progress'].includes(this.status)) {
    this.status = 'completed';
    this.completedAt = new Date();

    if (data.notes) {
      this.notes = data.notes;
    }

    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Cannot complete assignment with status: ${this.status}`));
};

// Instance method: Reject assignment
JobAssignmentSchema.methods.reject = function (reason) {
  if (this.status === 'assigned') {
    this.status = 'rejected';
    this.notes = reason || 'Assignment rejected';
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Cannot reject assignment with status: ${this.status}`));
};

// Instance method: Cancel assignment
JobAssignmentSchema.methods.cancel = function (reason) {
  if (this.status !== 'completed' && this.status !== 'reassigned') {
    this.status = 'cancelled';
    this.cancellationReason = reason || 'Assignment cancelled';
    this.cancelledAt = new Date();
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Cannot cancel assignment with status: ${this.status}`));
};

// Instance method: Reassign to another user
JobAssignmentSchema.methods.reassign = function (newUserId, reassignedBy, reason) {
  if (this.status !== 'completed' && this.status !== 'reassigned') {
    this.status = 'reassigned';
    this.reassignedTo = newUserId;
    this.reassignedBy = reassignedBy;
    this.reassignReason = reason || 'Reassigned to another user';
    this.reassignedAt = new Date();
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Cannot reassign assignment with status: ${this.status}`));
};

// ============================================
// NEW INSTANCE METHODS (Smart Platform 360°)
// ============================================

// Instance method: Add comment
JobAssignmentSchema.methods.addComment = function (commentData) {
  const comment = {
    commentId: `CMT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    userId: commentData.userId,
    userName: commentData.userName,
    userRole: commentData.userRole,
    message: commentData.message,
    timestamp: new Date(),
    attachments: commentData.attachments || []
  };

  this.comments.push(comment);
  this.updatedAt = new Date();

  // Record in history
  this.recordHistory({
    action: 'COMMENT_ADDED',
    actor: commentData.userId,
    actorRole: commentData.userRole,
    details: `Added comment: ${commentData.message.substring(0, 50)}...`
  });

  return this.save();
};

// Instance method: Add attachment
JobAssignmentSchema.methods.addAttachment = function (attachmentData) {
  const attachment = {
    attachmentId: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: attachmentData.type || 'other',
    fileName: attachmentData.fileName,
    fileUrl: attachmentData.fileUrl,
    fileType: attachmentData.fileType,
    fileSize: attachmentData.fileSize,
    uploadedBy: attachmentData.uploadedBy,
    uploadedAt: new Date()
  };

  this.attachments.push(attachment);
  this.updatedAt = new Date();

  // Record in history
  this.recordHistory({
    action: 'ATTACHMENT_ADDED',
    actor: attachmentData.uploadedBy,
    details: `Uploaded: ${attachmentData.fileName}`
  });

  return this.save();
};

// Instance method: Record history entry
JobAssignmentSchema.methods.recordHistory = function (historyData) {
  const entry = {
    action: historyData.action,
    timestamp: new Date(),
    actor: historyData.actor,
    actorRole: historyData.actorRole,
    details: historyData.details,
    metadata: historyData.metadata || {}
  };

  this.history.push(entry);
  this.updatedAt = new Date();
  // Don't save here - let the calling method save
  return this;
};

// Instance method: Calculate SLA
JobAssignmentSchema.methods.calculateSLA = function () {
  if (!this.sla) {
    this.sla = {};
  }

  // Set due date based on expected duration (default 7 days)
  if (!this.sla.dueDate && this.assignedAt) {
    const expectedDays = this.sla.expectedDuration || 7;
    const dueDate = new Date(this.assignedAt);
    dueDate.setDate(dueDate.getDate() + expectedDays);
    this.sla.dueDate = dueDate;
  }

  // Calculate actual duration if completed
  if (this.completedAt && this.assignedAt) {
    const diffMs = this.completedAt - this.assignedAt;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    this.sla.actualDuration = Math.round(diffDays * 10) / 10; // Round to 1 decimal

    // Check if on time
    this.sla.isOnTime = diffDays <= (this.sla.expectedDuration || 7);
  } else if (this.sla.dueDate && !this.completedAt) {
    // Check if currently overdue
    const now = new Date();
    if (now > this.sla.dueDate) {
      this.sla.isOnTime = false;

      // Record SLA breach in history (once)
      const hasBreachRecord = this.history.some(h => h.action === 'SLA_BREACHED');
      if (!hasBreachRecord) {
        this.recordHistory({
          action: 'SLA_BREACHED',
          actor: 'system',
          details: `SLA breached. Due date: ${this.sla.dueDate.toISOString()}`
        });
      }
    }
  }

  this.updatedAt = new Date();
  return this;
};

// Instance method: Complete with evidence
JobAssignmentSchema.methods.completeWithEvidence = function (evidenceData) {
  if (['assigned', 'accepted', 'in_progress'].includes(this.status)) {
    this.status = 'completed';
    this.completedAt = new Date();

    // Set completion evidence
    this.completionEvidence = {
      completedBy: evidenceData.userId,
      completedAt: new Date(),
      reportUrl: evidenceData.reportUrl,
      score: evidenceData.score,
      recommendation: evidenceData.recommendation,
      summary: evidenceData.summary,
      checklistResults: evidenceData.checklistResults || {}
    };

    // Calculate SLA
    this.calculateSLA();

    // Record in history
    this.recordHistory({
      action: 'JOB_COMPLETED',
      actor: evidenceData.userId,
      details: `Completed with score: ${evidenceData.score}, Recommendation: ${evidenceData.recommendation}`,
      metadata: { score: evidenceData.score, recommendation: evidenceData.recommendation }
    });

    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Cannot complete assignment with status: ${this.status}`));
};

// ============================================
// END NEW INSTANCE METHODS
// ============================================

// Static method: Find active assignments by user
JobAssignmentSchema.statics.findActiveByUser = function (userId) {
  return this.find({
    assignedTo: userId,
    status: { $in: ['assigned', 'accepted', 'in_progress'] }
  }).sort({ assignedAt: -1 });
};

// Static method: Find overdue assignments
JobAssignmentSchema.statics.findOverdue = function (hoursThreshold = 24) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursThreshold);

  return this.find({
    status: { $in: ['assigned', 'accepted'] },
    assignedAt: { $lte: cutoffDate }
  }).sort({ assignedAt: 1 });
};

// Static method: Get user workload
JobAssignmentSchema.statics.getUserWorkload = function (userId) {
  return this.aggregate([
    {
      $match: {
        assignedTo: userId,
        status: { $in: ['assigned', 'accepted', 'in_progress'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status',
            priority: '$priority'
          }
        }
      }
    }
  ]);
};

// Static method: Get assignment statistics
JobAssignmentSchema.statics.getStatistics = function (filters = {}) {
  const matchStage = {};

  if (filters.role) {
    matchStage.role = filters.role;
  }

  if (filters.startDate || filters.endDate) {
    matchStage.assignedAt = {};
    if (filters.startDate) {
      matchStage.assignedAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.assignedAt.$lte = new Date(filters.endDate);
    }
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status'
          }
        },
        byRole: {
          $push: {
            role: '$role'
          }
        },
        byStrategy: {
          $push: {
            strategy: '$strategy'
          }
        },
        avgTimeToComplete: {
          $avg: {
            $cond: [
              { $and: [{ $eq: ['$status', 'completed'] }, { $ifNull: ['$completedAt', false] }] },
              { $subtract: ['$completedAt', '$assignedAt'] },
              null
            ]
          }
        }
      }
    }
  ]);
};

// ============================================
// NEW STATIC METHODS (Smart Platform 360°)
// ============================================

// Static method: Find assignments near deadline
JobAssignmentSchema.statics.findNearDeadline = function (hoursThreshold = 24) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);

  return this.find({
    status: { $in: ['assigned', 'accepted', 'in_progress'] },
    'sla.dueDate': {
      $gte: now,
      $lte: futureDate
    }
  }).sort({ 'sla.dueDate': 1 });
};

// Static method: Find SLA breached assignments
JobAssignmentSchema.statics.findSLABreached = function () {
  const now = new Date();

  return this.find({
    status: { $in: ['assigned', 'accepted', 'in_progress'] },
    'sla.dueDate': { $lt: now }
  }).sort({ 'sla.dueDate': 1 });
};

// Static method: Get SLA statistics
JobAssignmentSchema.statics.getSLAStatistics = function (filters = {}) {
  const matchStage = { status: 'completed' };

  if (filters.role) {
    matchStage.role = filters.role;
  }

  if (filters.startDate || filters.endDate) {
    matchStage.completedAt = {};
    if (filters.startDate) {
      matchStage.completedAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.completedAt.$lte = new Date(filters.endDate);
    }
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        onTime: {
          $sum: { $cond: [{ $eq: ['$sla.isOnTime', true] }, 1, 0] }
        },
        delayed: {
          $sum: { $cond: [{ $eq: ['$sla.isOnTime', false] }, 1, 0] }
        },
        avgActualDuration: { $avg: '$sla.actualDuration' },
        avgExpectedDuration: { $avg: '$sla.expectedDuration' }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        onTime: 1,
        delayed: 1,
        onTimePercentage: {
          $multiply: [{ $divide: ['$onTime', '$total'] }, 100]
        },
        avgActualDuration: { $round: ['$avgActualDuration', 1] },
        avgExpectedDuration: { $round: ['$avgExpectedDuration', 1] }
      }
    }
  ]);
};

// Static method: Find assignments by job type
JobAssignmentSchema.statics.findByJobType = function (jobType, filters = {}) {
  const query = { jobType };

  if (filters.status) {
    query.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
  }

  if (filters.role) {
    query.role = filters.role;
  }

  return this.find(query).sort({ assignedAt: -1 });
};

// Static method: Get comment count for assignment
JobAssignmentSchema.statics.getCommentCount = function (assignmentId) {
  return this.findById(assignmentId).then(assignment => {
    return assignment ? assignment.comments.length : 0;
  });
};

// ============================================
// END NEW STATIC METHODS
// ============================================

// Pre-save middleware
JobAssignmentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtual fields are included in JSON
JobAssignmentSchema.set('toJSON', { virtuals: true });
JobAssignmentSchema.set('toObject', { virtuals: true });

const JobAssignment = mongoose.model('JobAssignment', JobAssignmentSchema);

module.exports = JobAssignment;
