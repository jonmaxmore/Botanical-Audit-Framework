/**
 * KPI Model
 * MongoDB schema for KPI tracking collection
 *
 * @module models/kpi
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const KPISchema = new mongoose.Schema(
  {
    // Task identification
    taskId: {
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

    // User reference
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Role
    role: {
      type: String,
      required: true,
      enum: ['reviewer', 'inspector', 'approver'],
      index: true,
    },

    // Task status
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in_progress', 'completed', 'delayed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Time tracking
    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    endTime: {
      type: Date,
      default: null,
    },

    // Processing time (in minutes)
    processingTime: {
      type: Number,
      default: null,
    },

    // SLA threshold (in hours)
    slaThreshold: {
      type: Number,
      required: true,
      default: function () {
        const thresholds = {
          reviewer: 72,
          inspector: 120,
          approver: 48,
        };
        return thresholds[this.role] || 72;
      },
    },

    // Delay tracking
    isDelayed: {
      type: Boolean,
      default: false,
      index: true,
    },

    delayMinutes: {
      type: Number,
      default: 0,
    },

    // Feedback and comments
    comments: {
      type: String,
      default: null,
    },

    feedbackScore: {
      type: Number,
      min: 1,
      max: 5,
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
    collection: 'kpis',
  },
);

// Compound indexes for better query performance
KPISchema.index({ role: 1, status: 1 });
KPISchema.index({ userId: 1, status: 1 });
KPISchema.index({ applicationId: 1, role: 1 });
KPISchema.index({ status: 1, startTime: -1 });
KPISchema.index({ isDelayed: 1, status: 1 });

// Virtual for processing time in hours
KPISchema.virtual('processingHours').get(function () {
  if (!this.processingTime) return null;
  return (this.processingTime / 60).toFixed(2);
});

// Virtual for is completed
KPISchema.virtual('isCompleted').get(function () {
  return this.status === 'completed';
});

// Virtual for is overdue (in progress but past SLA)
KPISchema.virtual('isOverdue').get(function () {
  if (this.status !== 'in_progress') return false;
  const now = new Date();
  const elapsed = (now - this.startTime) / (1000 * 60 * 60); // hours
  return elapsed > this.slaThreshold;
});

// Instance method: Complete task
KPISchema.methods.completeTask = function (data = {}) {
  const endTime = data.endTime || new Date();
  const processingMinutes = (endTime - this.startTime) / (1000 * 60);
  const slaMinutes = this.slaThreshold * 60;
  const isDelayed = processingMinutes > slaMinutes;

  this.status = isDelayed ? 'delayed' : 'completed';
  this.endTime = endTime;
  this.processingTime = Math.round(processingMinutes);
  this.isDelayed = isDelayed;
  this.delayMinutes = isDelayed ? Math.round(processingMinutes - slaMinutes) : 0;

  if (data.comments) {
    this.comments = data.comments;
  }

  if (data.feedbackScore) {
    this.feedbackScore = data.feedbackScore;
  }

  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Mark as delayed
KPISchema.methods.markDelayed = function () {
  if (this.status === 'in_progress' && !this.isDelayed) {
    this.status = 'delayed';
    this.isDelayed = true;

    const now = new Date();
    const elapsedMinutes = (now - this.startTime) / (1000 * 60);
    const slaMinutes = this.slaThreshold * 60;
    this.delayMinutes = Math.round(elapsedMinutes - slaMinutes);

    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method: Cancel task
KPISchema.methods.cancelTask = function (reason) {
  this.status = 'cancelled';
  this.comments = reason || 'Task cancelled';
  this.updatedAt = new Date();
  return this.save();
};

// Static method: Find delayed tasks
KPISchema.statics.findDelayed = function () {
  return this.find({
    status: { $in: ['in_progress', 'delayed'] },
  }).sort({ startTime: 1 });
};

// Static method: Get role metrics
KPISchema.statics.getRoleMetrics = function (role, filters = {}) {
  const matchStage = { role };

  if (filters.startDate || filters.endDate) {
    matchStage.startTime = {};
    if (filters.startDate) {
      matchStage.startTime.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.startTime.$lte = new Date(filters.endDate);
    }
  }

  if (filters.status) {
    matchStage.status = filters.status;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        delayedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] },
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
        },
        avgProcessingTime: {
          $avg: {
            $cond: [{ $ifNull: ['$processingTime', false] }, '$processingTime', null],
          },
        },
        avgFeedbackScore: {
          $avg: {
            $cond: [{ $ifNull: ['$feedbackScore', false] }, '$feedbackScore', null],
          },
        },
      },
    },
  ]);
};

// Static method: Get user metrics
KPISchema.statics.getUserMetrics = function (userId, filters = {}) {
  const matchStage = { userId };

  if (filters.startDate || filters.endDate) {
    matchStage.startTime = {};
    if (filters.startDate) {
      matchStage.startTime.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.startTime.$lte = new Date(filters.endDate);
    }
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        delayedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] },
        },
        avgProcessingTime: {
          $avg: {
            $cond: [{ $ifNull: ['$processingTime', false] }, '$processingTime', null],
          },
        },
        avgFeedbackScore: {
          $avg: {
            $cond: [{ $ifNull: ['$feedbackScore', false] }, '$feedbackScore', null],
          },
        },
      },
    },
  ]);
};

// Static method: Get daily trends
KPISchema.statics.getDailyTrends = function (role = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchStage = {
    startTime: { $gte: startDate },
  };

  if (role) {
    matchStage.role = role;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
        },
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        delayed: {
          $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] },
        },
        avgProcessingTime: {
          $avg: {
            $cond: [{ $ifNull: ['$processingTime', false] }, '$processingTime', null],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Pre-save middleware
KPISchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtual fields are included in JSON
KPISchema.set('toJSON', { virtuals: true });
KPISchema.set('toObject', { virtuals: true });

const KPI = mongoose.model('KPI', KPISchema);

module.exports = KPI;
