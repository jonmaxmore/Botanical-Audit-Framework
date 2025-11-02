const express = require('express');
const router = express.Router();
const {
  Notification,
  NotificationPreferences,
  NotificationType,
  NotificationPriority,
  DeliveryMethod
} = require('../models/Notification');

/**
 * Authentication Middleware (Placeholder)
 * TODO: Replace with actual JWT authentication
 */
const authenticate = (req, res, next) => {
  // Mock authentication - extract userId from header or session
  const userId = req.headers['x-user-id'] || req.session?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  req.userId = userId;
  next();
};

/**
 * GET /api/notifications
 * List notifications for authenticated user with filters
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { isRead, type, priority, startDate, endDate, page, limit } = req.query;

    // Build filters
    const filters = {
      page,
      limit
    };

    if (isRead !== undefined) {
      filters.isRead = isRead === 'true';
    }

    if (type) {
      filters.type = type;
    }

    if (priority) {
      filters.priority = priority;
    }

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    // Get notifications using static method
    const result = await Notification.findByUser(req.userId, filters);

    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      details: error.message
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for authenticated user
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
      details: error.message
    });
  }
});

/**
 * GET /api/notifications/types
 * Get available notification types (for filters)
 */
router.get('/types', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        types: Object.entries(NotificationType).map(([key, value]) => ({
          key,
          value,
          label: key
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ')
        })),
        priorities: Object.entries(NotificationPriority).map(([key, value]) => ({
          key,
          value,
          label: key.charAt(0) + key.slice(1).toLowerCase()
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching notification types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification types',
      details: error.message
    });
  }
});

/**
 * GET /api/notifications/:id
 * Get notification detail by ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false
    })
      .populate('userId', 'fullName email')
      .populate('senderId', 'fullName email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification',
      details: error.message
    });
  }
});

/**
 * POST /api/notifications
 * Create a new notification (admin/system only)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      priority,
      relatedEntity,
      deliveryMethods,
      actionUrl,
      actionLabel,
      metadata,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, type, title, message are required'
      });
    }

    // Validate notification type
    if (!Object.values(NotificationType).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification type'
      });
    }

    // Create notification data
    const notificationData = {
      userId,
      senderId: req.userId,
      type,
      title,
      message,
      priority: priority || NotificationPriority.MEDIUM,
      relatedEntity,
      deliveryMethods: deliveryMethods || [DeliveryMethod.IN_APP],
      actionUrl,
      actionLabel,
      metadata,
      expiresAt
    };

    // Create and send notification
    const notification = await Notification.createAndSend(notificationData);

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created and sent successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification',
      details: error.message
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Mark as read
    await notification.markRead();

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      details: error.message
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for authenticated user
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.userId);

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      details: error.message
    });
  }
});

/**
 * PUT /api/notifications/:id/unread
 * Mark notification as unread
 */
router.put('/:id/unread', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Mark as unread
    notification.isRead = false;
    notification.readAt = null;
    await notification.save();

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as unread'
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as unread',
      details: error.message
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Soft delete notification
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Soft delete
    await notification.softDelete();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      details: error.message
    });
  }
});

/**
 * DELETE /api/notifications/batch
 * Batch delete notifications
 */
router.delete('/batch', authenticate, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: 'notificationIds array is required'
      });
    }

    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: req.userId,
        isDeleted: false
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      data: {
        deletedCount: result.modifiedCount
      },
      message: 'Notifications deleted successfully'
    });
  } catch (error) {
    console.error('Error batch deleting notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notifications',
      details: error.message
    });
  }
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences for authenticated user
 */
router.get('/preferences/current', authenticate, async (req, res) => {
  try {
    const preferences = await NotificationPreferences.getOrCreate(req.userId);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification preferences',
      details: error.message
    });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for authenticated user
 */
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const {
      enabled,
      deliveryPreferences,
      typePreferences,
      minimumPriority,
      quietHours,
      emailDigest
    } = req.body;

    // Get or create preferences
    let preferences = await NotificationPreferences.findOne({
      userId: req.userId
    });

    if (!preferences) {
      preferences = await NotificationPreferences.create({ userId: req.userId });
    }

    // Update fields
    if (enabled !== undefined) {
      preferences.enabled = enabled;
    }

    if (deliveryPreferences) {
      preferences.deliveryPreferences = {
        ...preferences.deliveryPreferences,
        ...deliveryPreferences
      };
    }

    if (typePreferences) {
      preferences.typePreferences = {
        ...preferences.typePreferences,
        ...typePreferences
      };
    }

    if (minimumPriority) {
      preferences.minimumPriority = minimumPriority;
    }

    if (quietHours) {
      preferences.quietHours = {
        ...preferences.quietHours,
        ...quietHours
      };
    }

    if (emailDigest) {
      preferences.emailDigest = {
        ...preferences.emailDigest,
        ...emailDigest
      };
    }

    await preferences.save();

    res.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences',
      details: error.message
    });
  }
});

/**
 * GET /api/notifications/entity/:entityType/:entityId
 * Get notifications related to a specific entity
 */
router.get('/entity/:entityType/:entityId', authenticate, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const notifications = await Notification.findByEntity(entityType, entityId);

    // Filter by user ownership (only show user's notifications)
    const userNotifications = notifications.filter(n => n.userId.equals(req.userId));

    res.json({
      success: true,
      data: userNotifications
    });
  } catch (error) {
    console.error('Error fetching entity notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entity notifications',
      details: error.message
    });
  }
});

module.exports = router;
