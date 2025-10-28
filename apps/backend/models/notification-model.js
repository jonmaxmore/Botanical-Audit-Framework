/**
 * Notification Model
 * MongoDB schema for notification collection
 *
 * @module models/notification
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    // Notification identification
    notificationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // User reference
    userId: {
      type: String,
      required: true,
      index: true
    },

    // Notification type
    type: {
      type: String,
      required: true,
      enum: [
        'job_assigned',
        'payment_required',
        'payment_completed',
        'payment_alert',
        'status_update',
        'delay_alert',
        'document_reviewed',
        'inspection_scheduled',
        'inspection_completed',
        'certificate_issued',
        'application_rejected',
        'system_alert'
      ],
      index: true
    },

    // Priority level
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    },

    // Notification content
    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    // Related data
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Application reference (optional)
    applicationId: {
      type: String,
      default: null,
      index: true
    },

    // Action URL (optional)
    actionUrl: {
      type: String,
      default: null
    },

    // Action label (optional)
    actionLabel: {
      type: String,
      default: null
    },

    // Read status
    read: {
      type: Boolean,
      required: true,
      default: false,
      index: true
    },

    readAt: {
      type: Date,
      default: null
    },

    // Delivery status
    delivered: {
      type: Boolean,
      default: false
    },

    deliveredAt: {
      type: Date,
      default: null
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
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'notifications'
  }
);

// Compound indexes for better query performance
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ userId: 1, priority: 1 });
NotificationSchema.index({ read: 1, createdAt: -1 });

// Virtual for notification age (in hours)
NotificationSchema.virtual('ageInHours').get(function () {
  const now = new Date();
  const created = this.createdAt;
  return Math.floor((now - created) / (1000 * 60 * 60));
});

// Virtual for is new (less than 24 hours old)
NotificationSchema.virtual('isNew').get(function () {
  return this.ageInHours < 24;
});

// Instance method: Mark as read
NotificationSchema.methods.markAsRead = function () {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method: Mark as delivered
NotificationSchema.methods.markAsDelivered = function () {
  if (!this.delivered) {
    this.delivered = true;
    this.deliveredAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method: Find unread by user
NotificationSchema.statics.findUnreadByUser = function (userId, limit = 50) {
  return this.find({ userId, read: false }).sort({ createdAt: -1 }).limit(limit);
};

// Static method: Count unread by user
NotificationSchema.statics.countUnreadByUser = function (userId) {
  return this.countDocuments({ userId, read: false });
};

// Static method: Mark all as read for user
NotificationSchema.statics.markAllAsReadForUser = function (userId) {
  return this.updateMany(
    { userId, read: false },
    {
      $set: {
        read: true,
        readAt: new Date()
      }
    }
  );
};

// Static method: Delete old read notifications
NotificationSchema.statics.deleteOldRead = function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    read: true,
    readAt: { $lte: cutoffDate }
  });
};

// Static method: Get user statistics
NotificationSchema.statics.getUserStatistics = function (userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
        },
        byType: {
          $push: {
            type: '$type',
            read: '$read'
          }
        },
        byPriority: {
          $push: {
            priority: '$priority',
            read: '$read'
          }
        }
      }
    }
  ]);
};

// Static method: Create notification with auto-generated ID
NotificationSchema.statics.createNotification = function (data) {
  const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return this.create({
    notificationId,
    ...data,
    createdAt: new Date()
  });
};

// Static method: Create multiple notifications
NotificationSchema.statics.createMany = function (notificationsData) {
  const notifications = notificationsData.map(data => ({
    notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    read: false,
    createdAt: new Date()
  }));

  return this.insertMany(notifications);
};

// Ensure virtual fields are included in JSON
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
