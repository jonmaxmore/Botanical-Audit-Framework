/**
 * Real-time Notification Service using Socket.io
 * Wrapper around existing socket-service for notification-specific functionality
 * Works alongside the existing socket infrastructure
 */

const logger = require('../shared/logger');
const socketLogger = logger.createLogger('realtime-notifications');

let io = null;

/**
 * Initialize with existing Socket.io instance
 * @param {Socket.io Server} socketIoInstance - Existing Socket.io server instance
 */
function initialize(socketIoInstance) {
  io = socketIoInstance;

  // Add notification-specific event handlers to existing connection handler
  if (io) {
    io.on('connection', socket => {
      // Only handle if user is authenticated
      if (!socket.auth || !socket.auth.authenticated) {
        return;
      }

      const userId = socket.auth.user.id;

      // Handle mark notification as read
      socket.on('notification:read', async data => {
        try {
          const { Notification } = require('../models/Notification');
          const { notificationId } = data;

          const notification = await Notification.findOne({
            _id: notificationId,
            userId
          });

          if (notification) {
            await notification.markRead();

            // Broadcast to all user's connected devices
            io.to(`user:${userId}`).emit('notification:marked-read', {
              notificationId
            });
          }
        } catch (error) {
          socketLogger.error('Error marking notification as read:', error);
          socket.emit('notification:error', {
            message: 'Failed to mark notification as read',
            error: error.message
          });
        }
      });

      // Handle mark all as read
      socket.on('notifications:read-all', async () => {
        try {
          const { Notification } = require('../models/Notification');

          await Notification.markAllAsRead(userId);

          // Broadcast to all user's connected devices
          io.to(`user:${userId}`).emit('notifications:all-marked-read');
        } catch (error) {
          socketLogger.error('Error marking all notifications as read:', error);
          socket.emit('notification:error', {
            message: 'Failed to mark all notifications as read',
            error: error.message
          });
        }
      });

      // Handle delete notification
      socket.on('notification:delete', async data => {
        try {
          const { Notification } = require('../models/Notification');
          const { notificationId } = data;

          const notification = await Notification.findOne({
            _id: notificationId,
            userId
          });

          if (notification) {
            await notification.softDelete();

            // Broadcast to all user's connected devices
            io.to(`user:${userId}`).emit('notification:deleted', {
              notificationId
            });
          }
        } catch (error) {
          socketLogger.error('Error deleting notification:', error);
          socket.emit('notification:error', {
            message: 'Failed to delete notification',
            error: error.message
          });
        }
      });
    });

    socketLogger.info('Real-time notification handlers registered');
  }
}

/**
 * Send notification to a specific user
 * @param {Object} notification - Notification document
 * @returns {Promise<boolean>} - Success status
 */
async function sendNotification(notification) {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  try {
    const userId = notification.userId.toString();

    // Emit to user's room (all connected devices)
    io.to(`user:${userId}`).emit('notification:new', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      relatedEntity: notification.relatedEntity,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      isRead: notification.isRead
    });

    socketLogger.info(`Notification sent to user ${userId}: ${notification.title}`);

    return true;
  } catch (error) {
    socketLogger.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification to multiple users
 * @param {Array<String>} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data
 * @returns {Promise<number>} - Number of users notified
 */
async function sendBulkNotification(userIds, notificationData) {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  try {
    let count = 0;

    for (const userId of userIds) {
      io.to(`user:${userId}`).emit('notification:new', notificationData);
      count++;
    }

    socketLogger.info(`Bulk notification sent to ${count} users`);

    return count;
  } catch (error) {
    socketLogger.error('Error sending bulk notification:', error);
    throw error;
  }
}

/**
 * Update unread count for a user
 * @param {String} userId - User ID
 * @param {Number} count - Unread count
 */
function updateUnreadCount(userId, count) {
  if (!io) {
    socketLogger.warn('Not initialized, skipping unread count update');
    return;
  }

  io.to(`user:${userId}`).emit('notifications:unread-count', { count });
}

/**
 * Broadcast system announcement to all connected users
 * @param {Object} announcement - Announcement data
 */
function broadcastAnnouncement(announcement) {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  io.emit('system:announcement', announcement);
  socketLogger.info('System announcement broadcast to all users');
}

/**
 * Send maintenance notification to all users
 * @param {Object} maintenanceInfo - Maintenance details
 */
function notifyMaintenance(maintenanceInfo) {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  io.emit('system:maintenance', maintenanceInfo);
  socketLogger.info('Maintenance notification sent to all users');
}

/**
 * Get Socket.io instance
 * @returns {Server} - Socket.io server instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initialize() first');
  }
  return io;
}

module.exports = {
  initialize,
  sendNotification,
  sendBulkNotification,
  updateUnreadCount,
  broadcastAnnouncement,
  notifyMaintenance,
  getIO
};
