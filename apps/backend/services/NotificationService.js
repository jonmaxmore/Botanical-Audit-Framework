/**
 * NotificationService
 * Real-time notification system using WebSocket/SSE
 * Supports job assignments, payment alerts, and delay warnings
 *
 * @module services/notification
 * @version 1.0.0
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class NotificationService extends EventEmitter {
  constructor(notificationRepository, webSocketServer) {
    super();
    this.notificationRepository = notificationRepository;
    this.webSocketServer = webSocketServer;

    // Notification types
    this.NOTIFICATION_TYPES = {
      JOB_ASSIGNED: 'job_assigned',
      PAYMENT_REQUIRED: 'payment_required',
      PAYMENT_COMPLETED: 'payment_completed',
      PAYMENT_ALERT: 'payment_alert',
      STATUS_UPDATE: 'status_update',
      DELAY_ALERT: 'delay_alert',
      DOCUMENT_REVIEWED: 'document_reviewed',
      INSPECTION_SCHEDULED: 'inspection_scheduled',
      INSPECTION_COMPLETED: 'inspection_completed',
      CERTIFICATE_ISSUED: 'certificate_issued',
      APPLICATION_REJECTED: 'application_rejected',
      SYSTEM_ALERT: 'system_alert',
    };

    // Priority levels
    this.PRIORITY_LEVELS = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical',
    };

    // Initialize WebSocket handlers
    this._initializeWebSocket();
  }

  /**
   * Initialize WebSocket event handlers
   * @private
   */
  _initializeWebSocket() {
    if (!this.webSocketServer) {
      logger.warn('[NotificationService] WebSocket server not available');
      return;
    }

    // Handle client connections
    this.webSocketServer.on('connection', (ws, req) => {
      logger.info('[NotificationService] Client connected');

      // Extract user ID from connection (from JWT token)
      const userId = req.user?.id;
      if (userId) {
        ws.userId = userId;
        logger.info(`[NotificationService] User ${userId} connected`);
      }

      // Handle disconnection
      ws.on('close', () => {
        logger.info(`[NotificationService] User ${userId} disconnected`);
      });
    });
  }

  /**
   * Send notification to user(s)
   * @param {Object} data - Notification data
   * @param {string|Array<string>} data.userId - User ID or array of user IDs
   * @param {string} data.type - Notification type
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {string} data.priority - Priority level (default: 'medium')
   * @param {Object} data.data - Additional data
   * @returns {Promise<Object|Array<Object>>} Created notification(s)
   */
  async sendNotification(data) {
    try {
      const {
        userId,
        type,
        title,
        message,
        priority = this.PRIORITY_LEVELS.MEDIUM,
        data: additionalData = {},
      } = data;

      // Validate notification type
      if (!Object.values(this.NOTIFICATION_TYPES).includes(type)) {
        throw new Error(`Invalid notification type: ${type}`);
      }

      // Validate priority
      if (!Object.values(this.PRIORITY_LEVELS).includes(priority)) {
        throw new Error(`Invalid priority level: ${priority}`);
      }

      // Handle multiple users
      if (Array.isArray(userId)) {
        const notifications = await Promise.all(
          userId.map(id =>
            this._createAndSendNotification({
              userId: id,
              type,
              title,
              message,
              priority,
              data: additionalData,
            })
          )
        );
        return notifications;
      }

      // Single user
      return await this._createAndSendNotification({
        userId,
        type,
        title,
        message,
        priority,
        data: additionalData,
      });
    } catch (error) {
      logger.error('[NotificationService] Send notification error:', error);
      throw error;
    }
  }

  /**
   * Create and send notification (internal)
   * @private
   */
  async _createAndSendNotification(data) {
    const { userId, type, title, message, priority, data: additionalData } = data;

    logger.info(`[NotificationService] Creating ${type} notification for user ${userId}`);

    // Create notification in database
    const notification = await this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      priority,
      data: additionalData,
      read: false,
      readAt: null,
      createdAt: new Date(),
    });

    // Send via WebSocket if user is connected
    this._sendWebSocketNotification(userId, notification);

    // Emit event
    this.emit('notification:sent', { notification, userId });

    logger.info(`[NotificationService] Notification created: ${notification.id}`);
    return notification;
  }

  /**
   * Send notification via WebSocket
   * @private
   */
  _sendWebSocketNotification(userId, notification) {
    if (!this.webSocketServer) return;

    // Find connected clients for this user
    this.webSocketServer.clients.forEach(client => {
      if (client.userId === userId && client.readyState === 1) {
        // OPEN state
        client.send(
          JSON.stringify({
            event: 'notification',
            data: notification,
          })
        );
        logger.info(`[NotificationService] WebSocket notification sent to user ${userId}`);
      }
    });
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await this.notificationRepository.findById(notificationId);

      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized to mark this notification as read');
      }

      if (notification.read) {
        return notification; // Already read
      }

      const updatedNotification = await this.notificationRepository.update(notificationId, {
        read: true,
        readAt: new Date(),
      });

      this.emit('notification:read', { notification: updatedNotification, userId });

      return updatedNotification;
    } catch (error) {
      logger.error('[NotificationService] Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of notifications marked as read
   */
  async markAllAsRead(userId) {
    try {
      const count = await this.notificationRepository.markAllAsRead(userId);
      this.emit('notification:all_read', { userId, count });
      return count;
    } catch (error) {
      logger.error('[NotificationService] Mark all as read error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Limit results
   * @param {boolean} options.unreadOnly - Only unread notifications
   * @returns {Promise<Array>} List of notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 50, unreadOnly = false } = options;
      return await this.notificationRepository.findByUser(userId, {
        limit,
        unreadOnly,
      });
    } catch (error) {
      logger.error('[NotificationService] Get user notifications error:', error);
      throw error;
    }
  }

  /**
   * Get unread count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread notification count
   */
  async getUnreadCount(userId) {
    try {
      return await this.notificationRepository.getUnreadCount(userId);
    } catch (error) {
      logger.error('[NotificationService] Get unread count error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await this.notificationRepository.findById(notificationId);

      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized to delete this notification');
      }

      await this.notificationRepository.delete(notificationId);
      this.emit('notification:deleted', { notificationId, userId });
    } catch (error) {
      logger.error('[NotificationService] Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Send job assignment notification
   * @param {string} userId - Assigned user ID
   * @param {Object} jobData - Job details
   */
  async notifyJobAssignment(userId, jobData) {
    const { applicationId, role, farmName, farmerName } = jobData;

    const messages = {
      reviewer: `มีใบสมัครใหม่รอตรวจสอบ: ${applicationId} จาก ${farmerName}`,
      inspector: `มีงานตรวจฟาร์มใหม่: ${farmName} (${applicationId})`,
      approver: `มีใบสมัครรออนุมัติ: ${applicationId} คะแนนตรวจ ${jobData.score || 'N/A'}/100`,
    };

    return await this.sendNotification({
      userId,
      type: this.NOTIFICATION_TYPES.JOB_ASSIGNED,
      title: 'มีงานใหม่',
      message: messages[role] || `มีงานใหม่: ${applicationId}`,
      priority: this.PRIORITY_LEVELS.HIGH,
      data: jobData,
    });
  }

  /**
   * Send delay alert notification
   * @param {string} userId - User ID
   * @param {Object} taskData - Task details
   */
  async notifyDelayAlert(userId, taskData) {
    const { applicationId, role, daysOverdue } = taskData;

    return await this.sendNotification({
      userId,
      type: this.NOTIFICATION_TYPES.DELAY_ALERT,
      title: 'งานล่าช้า',
      message: `${applicationId} ค้างที่ ${role} เกิน ${daysOverdue} วัน`,
      priority: this.PRIORITY_LEVELS.CRITICAL,
      data: taskData,
    });
  }

  /**
   * Send payment alert notification
   * @param {string} userId - User ID
   * @param {Object} paymentData - Payment details
   */
  async notifyPaymentAlert(userId, paymentData) {
    const { applicationId, amount, daysOverdue } = paymentData;

    return await this.sendNotification({
      userId,
      type: this.NOTIFICATION_TYPES.PAYMENT_ALERT,
      title: 'ค่าธรรมเนียมค้างชำระ',
      message: `${applicationId} ค้างชำระ ${amount} บาท (เกิน ${daysOverdue} วัน)`,
      priority: this.PRIORITY_LEVELS.HIGH,
      data: paymentData,
    });
  }

  /**
   * Broadcast notification to all users with specific role
   * @param {string} role - User role
   * @param {Object} notificationData - Notification data
   */
  async broadcastToRole(role, notificationData) {
    try {
      // Get all users with this role (implement in user repository)
      const users = await this._getUsersByRole(role);
      const userIds = users.map(u => u.id);

      return await this.sendNotification({
        ...notificationData,
        userId: userIds,
      });
    } catch (error) {
      logger.error('[NotificationService] Broadcast to role error:', error);
      throw error;
    }
  }

  /**
   * Get users by role (placeholder - implement with UserRepository)
   * @private
   */
  async _getUsersByRole(role) {
    // TODO: Implement with UserRepository
    logger.warn('[NotificationService] _getUsersByRole not implemented');
    return [];
  }

  /**
   * Get notification statistics
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Object>} Notification statistics
   */
  async getStatistics(userId = null) {
    try {
      return await this.notificationRepository.getStatistics(userId);
    } catch (error) {
      logger.error('[NotificationService] Get statistics error:', error);
      throw error;
    }
  }

  /**
   * Clean up old read notifications
   * @param {number} daysOld - Delete notifications older than this (default: 30)
   * @returns {Promise<number>} Number of notifications deleted
   */
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const count = await this.notificationRepository.deleteOldRead(cutoffDate);
      logger.info(`[NotificationService] Cleaned up ${count} old notifications`);

      return count;
    } catch (error) {
      logger.error('[NotificationService] Cleanup error:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
