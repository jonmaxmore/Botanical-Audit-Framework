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
      index: true,
    },

    // Application reference
    applicationId: {
      type: String,
      required: true,
      index: true,
    },

    // User assignment
    assignedTo: {
      type: String,
      required: true,
      index: true,
    },

    assignedBy: {
      type: String,
      required: true,
      default: 'system',
    },

    // Role
    role: {
      type: String,
      required: true,
      enum: ['reviewer', 'inspector', 'approver'],
      index: true,
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
        'reassigned',
      ],
      default: 'assigned',
      index: true,
    },

    // Priority level
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },

    // Assignment strategy
    strategy: {
      type: String,
      required: true,
      enum: ['round_robin', 'workload_based', 'performance_based', 'manual'],
      default: 'workload_based',
    },

    // Time tracking
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Reassignment tracking
    reassignedTo: {
      type: String,
      default: null,
    },

    reassignedBy: {
      type: String,
      default: null,
    },

    reassignReason: {
      type: String,
      default: null,
    },

    reassignedAt: {
      type: Date,
      default: null,
    },

    // Cancellation tracking
    cancellationReason: {
      type: String,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // Notes and comments
    notes: {
      type: String,
      default: null,
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'job_assignments',
  },
);

// Compound indexes for better query performance
JobAssignmentSchema.index({ assignedTo: 1, status: 1 });
JobAssignmentSchema.index({ applicationId: 1, role: 1 });
JobAssignmentSchema.index({ status: 1, priority: 1 });
JobAssignmentSchema.index({ role: 1, status: 1 });
JobAssignmentSchema.index({ assignedAt: -1 });

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

// Static method: Find active assignments by user
JobAssignmentSchema.statics.findActiveByUser = function (userId) {
  return this.find({
    assignedTo: userId,
    status: { $in: ['assigned', 'accepted', 'in_progress'] },
  }).sort({ assignedAt: -1 });
};

// Static method: Find overdue assignments
JobAssignmentSchema.statics.findOverdue = function (hoursThreshold = 24) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursThreshold);

  return this.find({
    status: { $in: ['assigned', 'accepted'] },
    assignedAt: { $lte: cutoffDate },
  }).sort({ assignedAt: 1 });
};

// Static method: Get user workload
JobAssignmentSchema.statics.getUserWorkload = function (userId) {
  return this.aggregate([
    {
      $match: {
        assignedTo: userId,
        status: { $in: ['assigned', 'accepted', 'in_progress'] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status',
            priority: '$priority',
          },
        },
      },
    },
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
            status: '$status',
          },
        },
        byRole: {
          $push: {
            role: '$role',
          },
        },
        byStrategy: {
          $push: {
            strategy: '$strategy',
          },
        },
        avgTimeToComplete: {
          $avg: {
            $cond: [
              { $and: [{ $eq: ['$status', 'completed'] }, { $ifNull: ['$completedAt', false] }] },
              { $subtract: ['$completedAt', '$assignedAt'] },
              null,
            ],
          },
        },
      },
    },
  ]);
};

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
