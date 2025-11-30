/**
 * V2 Notification Routes
 * In-app notification system for closed-loop communication
 */

const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
const { farmerOrStaff } = require('../../middleware/roleMiddleware');
const { ValidationError } = require('../../shared/errors');
const logger = require('../../shared/logger');

// All routes require authentication
router.use(farmerOrStaff);

/**
 * GET /api/v2/notifications
 * Get user's notifications
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 20, unreadOnly = false } = req.query;

    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'fullName role')
      .populate('relatedEntity.entityId');

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v2/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v2/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      throw new ValidationError('Notification not found');
    }

    await notification.markAsRead();

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v2/notifications/mark-all-read
 * Mark all notifications as read
 */
router.put('/mark-all-read', async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v2/notifications (Admin/Staff only)
 * Create a new notification
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      recipientId,
      type,
      title,
      message,
      priority = 1,
      actionButton,
      relatedEntity,
      expiresAt,
    } = req.body;

    if (!recipientId || !type || !title || !message) {
      throw new ValidationError('Missing required fields');
    }

    const notification = await Notification.createNotification({
      recipient: recipientId,
      sender: req.user._id,
      type,
      title,
      message,
      priority,
      actionButton,
      relatedEntity,
      expiresAt,
    });

    logger.info('Notification created', {
      notificationId: notification._id,
      type,
      recipient: recipientId,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
