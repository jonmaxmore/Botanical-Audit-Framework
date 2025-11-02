const mongoose = require('mongoose');

/**
 * Notification Types - Different events that trigger notifications
 */
const NotificationType = {
  // Application-related
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_REJECTED: 'application_rejected',
  APPLICATION_REVISION_REQUIRED: 'application_revision_required',

  // Certificate-related
  CERTIFICATE_ISSUED: 'certificate_issued',
  CERTIFICATE_EXPIRING_SOON: 'certificate_expiring_soon',
  CERTIFICATE_EXPIRED: 'certificate_expired',
  CERTIFICATE_REVOKED: 'certificate_revoked',

  // Inspection-related
  INSPECTION_SCHEDULED: 'inspection_scheduled',
  INSPECTION_RESCHEDULED: 'inspection_rescheduled',
  INSPECTION_COMPLETED: 'inspection_completed',
  INSPECTION_CANCELLED: 'inspection_cancelled',
  INSPECTION_REMINDER: 'inspection_reminder',

  // Document-related
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_APPROVED: 'document_approved',
  DOCUMENT_REJECTED: 'document_rejected',
  DOCUMENT_EXPIRING: 'document_expiring',

  // Payment-related
  PAYMENT_REQUIRED: 'payment_required',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',

  // System-related (legacy types preserved)
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  ACCOUNT_UPDATED: 'account_updated',
  PASSWORD_CHANGED: 'password_changed',
  TASK: 'task',
  REPORT: 'report',
  MESSAGE: 'message',
  SYSTEM: 'system'
};

/**
 * Notification Priority Levels
 */
const NotificationPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Delivery Methods for Notifications
 */
const DeliveryMethod = {
  REALTIME: 'realtime', // Socket.io push notification
  EMAIL: 'email', // Email notification
  SMS: 'sms', // SMS notification (for critical alerts)
  IN_APP: 'in_app' // In-app notification only
};

/**
 * Notification Status
 */
const NotificationStatus = {
  PENDING: 'pending', // Created but not yet sent
  SENT: 'sent', // Successfully sent
  DELIVERED: 'delivered', // Confirmed delivery (for email/SMS)
  FAILED: 'failed', // Failed to send
  READ: 'read' // Read by user
};

/**
 * NotificationSchema - Stores all user notifications
 */
const NotificationSchema = new mongoose.Schema(
  {
    // Recipient (renamed from recipient for consistency)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Sender (optional, for user-generated notifications)
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Notification Details
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },

    title: {
      type: String,
      required: true,
      maxlength: 200
    },

    message: {
      type: String,
      required: true,
      maxlength: 1000
    },

    // Priority
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM
    },

    // Related Entity (optional)
    relatedEntity: {
      entityType: {
        type: String,
        enum: [
          'application',
          'certificate',
          'inspection',
          'document',
          'payment',
          'user',
          'task',
          'report',
          null
        ]
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId
      }
    },

    // Delivery Configuration
    deliveryMethods: [
      {
        type: String,
        enum: Object.values(DeliveryMethod)
      }
    ],

    // Status Tracking
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING
    },

    // Delivery Status per Method
    deliveryStatus: {
      realtime: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      },
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        deliveredAt: Date,
        error: String
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        deliveredAt: Date,
        error: String
      }
    },

    // Read Status (renamed from read for clarity)
    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date
    },

    // Action Button (optional)
    actionUrl: {
      type: String
    },

    actionLabel: {
      type: String,
      maxlength: 50
    },

    // Legacy data field (preserved for backwards compatibility)
    data: {
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      },
      reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'
      },
      priority: String,
      url: String
    },

    // Additional Data (flexible JSON)
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },

    // Expiry (for temporary notifications)
    expiresAt: {
      type: Date
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for Performance
 */
// Find notifications for a user
NotificationSchema.index({ userId: 1, createdAt: -1 });

// Filter by read status
NotificationSchema.index({ userId: 1, isRead: 1 });

// Filter by type
NotificationSchema.index({ userId: 1, type: 1 });

// Filter by priority
NotificationSchema.index({ userId: 1, priority: 1 });

// Find by related entity
NotificationSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });

// Find pending notifications for processing
NotificationSchema.index({ status: 1, createdAt: 1 });

// Cleanup expired notifications
NotificationSchema.index({ expiresAt: 1 }, { sparse: true });

// Exclude soft-deleted
NotificationSchema.index({ isDeleted: 1 });

// Legacy recipient field support
NotificationSchema.index({ recipient: 1 });

/**
 * Virtual Fields
 */

// Legacy 'recipient' virtual field (for backwards compatibility)
NotificationSchema.virtual('recipient').get(function () {
  return this.userId;
});

NotificationSchema.virtual('recipient').set(function (value) {
  this.userId = value;
});

// Legacy 'sender' virtual field (for backwards compatibility)
NotificationSchema.virtual('sender').get(function () {
  return this.senderId;
});

NotificationSchema.virtual('sender').set(function (value) {
  this.senderId = value;
});

// Legacy 'read' virtual field (for backwards compatibility)
NotificationSchema.virtual('read').get(function () {
  return this.isRead;
});

NotificationSchema.virtual('read').set(function (value) {
  this.isRead = value;
});

// Time ago (for display)
NotificationSchema.virtual('timeAgo').get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${days} วันที่แล้ว`;
});

/**
 * Static Methods
 */

// Find notifications for a user with filters
NotificationSchema.statics.findByUser = async function (userId, filters = {}) {
  const query = {
    userId,
    isDeleted: false
  };

  // Apply filters
  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'fullName email')
    .populate('senderId', 'fullName email')
    .lean();

  const total = await this.countDocuments(query);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Get unread count for a user
NotificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({
    userId,
    isRead: false,
    isDeleted: false
  });
};

// Mark notifications as read
NotificationSchema.statics.markAsRead = async function (notificationIds, userId) {
  return await this.updateMany(
    {
      _id: { $in: notificationIds },
      userId
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
        status: NotificationStatus.READ
      }
    }
  );
};

// Mark all as read for a user
NotificationSchema.statics.markAllAsRead = async function (userId) {
  return await this.updateMany(
    {
      userId,
      isRead: false,
      isDeleted: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
        status: NotificationStatus.READ
      }
    }
  );
};

// Create notification with automatic delivery
NotificationSchema.statics.createAndSend = async function (notificationData) {
  const notification = await this.create(notificationData);

  try {
    // Import services dynamically to avoid circular dependencies
    const realtimeService = require('../services/realtime.service');
    const emailService = require('../services/email.service');

    // Send via configured delivery methods
    const deliveryPromises = [];

    if (
      notificationData.deliveryMethods &&
      notificationData.deliveryMethods.includes(DeliveryMethod.REALTIME)
    ) {
      deliveryPromises.push(
        realtimeService
          .sendNotification(notification)
          .then(() => {
            notification.deliveryStatus.realtime.sent = true;
            notification.deliveryStatus.realtime.sentAt = new Date();
          })
          .catch(error => {
            notification.deliveryStatus.realtime.error = error.message;
          })
      );
    }

    if (
      notificationData.deliveryMethods &&
      notificationData.deliveryMethods.includes(DeliveryMethod.EMAIL)
    ) {
      deliveryPromises.push(
        emailService
          .sendNotificationEmail(notification)
          .then(() => {
            notification.deliveryStatus.email.sent = true;
            notification.deliveryStatus.email.sentAt = new Date();
          })
          .catch(error => {
            notification.deliveryStatus.email.error = error.message;
          })
      );
    }

    // Wait for all delivery attempts
    if (deliveryPromises.length > 0) {
      await Promise.allSettled(deliveryPromises);

      // Update status
      const allSent =
        notification.deliveryStatus.realtime.sent || notification.deliveryStatus.email.sent;
      notification.status = allSent ? NotificationStatus.SENT : NotificationStatus.FAILED;
      await notification.save();
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    notification.status = NotificationStatus.FAILED;
    await notification.save();
  }

  return notification;
};

// Find by related entity
NotificationSchema.statics.findByEntity = async function (entityType, entityId) {
  return await this.find({
    'relatedEntity.entityType': entityType,
    'relatedEntity.entityId': entityId,
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName email')
    .populate('senderId', 'fullName email');
};

// Cleanup expired notifications (run as cron job)
NotificationSchema.statics.cleanupExpired = async function () {
  const now = new Date();
  return await this.updateMany(
    {
      expiresAt: { $lte: now },
      isDeleted: false
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: now
      }
    }
  );
};

/**
 * Instance Methods
 */

// Mark notification as read
NotificationSchema.methods.markRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  this.status = NotificationStatus.READ;
  return await this.save();
};

// Soft delete notification
NotificationSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

// Check if notification is expired
NotificationSchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt < new Date();
};

/**
 * NotificationPreferencesSchema - User notification preferences
 */
const NotificationPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    // Global notification toggle
    enabled: {
      type: Boolean,
      default: true
    },

    // Delivery method preferences
    deliveryPreferences: {
      realtime: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },

    // Notification type preferences (which types to receive)
    typePreferences: {
      application: { type: Boolean, default: true },
      certificate: { type: Boolean, default: true },
      inspection: { type: Boolean, default: true },
      document: { type: Boolean, default: true },
      payment: { type: Boolean, default: true },
      system: { type: Boolean, default: true }
    },

    // Priority filter (minimum priority to receive)
    minimumPriority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.LOW
    },

    // Quiet hours (no notifications during this time)
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String }, // Format: "22:00"
      endTime: { type: String } // Format: "08:00"
    },

    // Email digest (batch notifications)
    emailDigest: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'never'],
        default: 'never'
      },
      time: { type: String, default: '09:00' } // Format: "09:00"
    }
  },
  {
    timestamps: true
  }
);

// Index for quick lookup
NotificationPreferencesSchema.index({ userId: 1 }, { unique: true });

/**
 * Static Methods for Preferences
 */

// Get or create preferences for a user
NotificationPreferencesSchema.statics.getOrCreate = async function (userId) {
  let preferences = await this.findOne({ userId });

  if (!preferences) {
    preferences = await this.create({ userId });
  }

  return preferences;
};

// Check if notification should be sent based on preferences
NotificationPreferencesSchema.statics.shouldSendNotification = async function (
  userId,
  notificationType,
  priority,
  deliveryMethod
) {
  const preferences = await this.findOne({ userId });

  if (!preferences || !preferences.enabled) {
    return false;
  }

  // Check delivery method preference
  if (!preferences.deliveryPreferences[deliveryMethod]) {
    return false;
  }

  // Check notification type preference
  const typeCategory = notificationType.split('_')[0]; // e.g., 'application' from 'application_submitted'
  if (preferences.typePreferences[typeCategory] === false) {
    return false;
  }

  // Check priority filter
  const priorityLevels = [
    NotificationPriority.LOW,
    NotificationPriority.MEDIUM,
    NotificationPriority.HIGH,
    NotificationPriority.URGENT
  ];
  const minPriorityIndex = priorityLevels.indexOf(preferences.minimumPriority);
  const currentPriorityIndex = priorityLevels.indexOf(priority);

  if (currentPriorityIndex < minPriorityIndex) {
    return false;
  }

  // Check quiet hours
  if (preferences.quietHours.enabled && deliveryMethod !== 'realtime') {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (
      currentTime >= preferences.quietHours.startTime ||
      currentTime <= preferences.quietHours.endTime
    ) {
      return false;
    }
  }

  return true;
};

const Notification = mongoose.model('Notification', NotificationSchema);
const NotificationPreferences = mongoose.model(
  'NotificationPreferences',
  NotificationPreferencesSchema
);

module.exports = {
  Notification,
  NotificationPreferences,
  NotificationType,
  NotificationPriority,
  DeliveryMethod,
  NotificationStatus
};
