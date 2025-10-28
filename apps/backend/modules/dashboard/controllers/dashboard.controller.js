const { createLogger } = require('../../../shared/logger');
const logger = createLogger('dashboard-dashboard.controller');

/**
 * Dashboard Controller
 *
 * HTTP request handlers for dashboard endpoints
 */

class DashboardController {
  constructor(service) {
    this.service = service;
  }

  /**
   * Get dashboard by role
   * GET /api/dashboard/:role
   */
  async getDashboardByRole(req, res) {
    try {
      const { role } = req.params;
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in request'
        });
      }

      const dashboard = await this.service.getDashboardByRole(userId, role);

      res.json({
        success: true,
        role,
        ...dashboard
      });
    } catch (error) {
      logger.error('Error getting dashboard by role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: error.message
      });
    }
  }

  /**
   * Get farmer dashboard
   * GET /api/dashboard/farmer/:userId
   */
  async getFarmerDashboard(req, res) {
    try {
      const { userId } = req.params;

      // Verify user has permission to view this dashboard
      const requestUserId = req.user?.userId || req.user?.id;
      if (requestUserId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const dashboard = await this.service.getFarmerDashboard(userId);

      res.json({
        success: true,
        userId,
        ...dashboard
      });
    } catch (error) {
      logger.error('Error getting farmer dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve farmer dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get reviewer dashboard
   * GET /api/dashboard/reviewer
   */
  async getReviewerDashboard(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const role = 'reviewer';

      const dashboard = await this.service.getDTAMDashboard(userId, role);

      res.json({
        success: true,
        role,
        ...dashboard
      });
    } catch (error) {
      logger.error('Error getting reviewer dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve reviewer dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get auditor dashboard
   * GET /api/dashboard/auditor
   */
  async getAuditorDashboard(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const role = 'auditor';

      const dashboard = await this.service.getDTAMDashboard(userId, role);

      res.json({
        success: true,
        role,
        ...dashboard
      });
    } catch (error) {
      logger.error('Error getting auditor dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve auditor dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get admin dashboard
   * GET /api/dashboard/admin
   */
  async getAdminDashboard(req, res) {
    try {
      // Verify admin role
      if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const dashboard = await this.service.getAdminDashboard();

      res.json({
        success: true,
        role: 'admin',
        ...dashboard
      });
    } catch (error) {
      logger.error('Error getting admin dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve admin dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get realtime statistics
   * GET /api/dashboard/stats/realtime
   */
  async getRealtimeStats(req, res) {
    try {
      const stats = await this.service.getRealtimeStats();

      res.json({
        success: true,
        ...stats
      });
    } catch (error) {
      logger.error('Error getting realtime stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve realtime statistics',
        error: error.message
      });
    }
  }

  /**
   * Get system health
   * GET /api/dashboard/health
   */
  async getSystemHealth(req, res) {
    try {
      const health = await this.service.getSystemHealth();

      res.json({
        success: true,
        ...health
      });
    } catch (error) {
      logger.error('Error getting system health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system health',
        error: error.message
      });
    }
  }

  /**
   * Get farmer statistics
   * GET /api/dashboard/stats/farmer/:userId
   */
  async getFarmerStats(req, res) {
    try {
      const { userId } = req.params;

      // Verify permission
      const requestUserId = req.user?.userId || req.user?.id;
      if (requestUserId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const stats = await this.service.getFarmerStats(userId);

      res.json({
        success: true,
        userId,
        stats
      });
    } catch (error) {
      logger.error('Error getting farmer stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve farmer statistics',
        error: error.message
      });
    }
  }

  /**
   * Get DTAM statistics
   * GET /api/dashboard/stats/dtam
   */
  async getDTAMStats(req, res) {
    try {
      const role = req.user?.role || 'reviewer';
      const stats = await this.service.getDTAMStats(role);

      res.json({
        success: true,
        role,
        stats
      });
    } catch (error) {
      logger.error('Error getting DTAM stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve DTAM statistics',
        error: error.message
      });
    }
  }

  /**
   * Get admin statistics
   * GET /api/dashboard/stats/admin
   */
  async getAdminStats(req, res) {
    try {
      // Verify admin role
      if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const stats = await this.service.getAdminStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      logger.error('Error getting admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve admin statistics',
        error: error.message
      });
    }
  }

  /**
   * Get recent activities
   * GET /api/dashboard/activities
   */
  async getRecentActivities(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const { limit = 10 } = req.query;

      // Admin can see all activities
      const targetUserId = req.user?.role === 'admin' ? null : userId;

      const activities = await this.service.getRecentActivities(targetUserId, parseInt(limit, 10));

      res.json({
        success: true,
        count: activities.length,
        activities
      });
    } catch (error) {
      logger.error('Error getting recent activities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent activities',
        error: error.message
      });
    }
  }

  /**
   * Get pending applications
   * GET /api/dashboard/applications/pending
   */
  async getPendingApplications(req, res) {
    try {
      const role = req.user?.role || 'reviewer';
      const { limit = 10 } = req.query;

      const applications = await this.service.getPendingApplications(role, parseInt(limit, 10));

      res.json({
        success: true,
        count: applications.length,
        applications
      });
    } catch (error) {
      logger.error('Error getting pending applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending applications',
        error: error.message
      });
    }
  }

  /**
   * Get notifications
   * GET /api/dashboard/notifications
   */
  async getNotifications(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      const role = req.user?.role || 'farmer';
      const { limit = 5 } = req.query;

      let notifications;

      if (role === 'farmer') {
        notifications = await this.service.getFarmerNotifications(userId, parseInt(limit, 10));
      } else if (role === 'admin' || role === 'super_admin') {
        notifications = await this.service.getAdminNotifications(parseInt(limit, 10));
      } else {
        notifications = await this.service.getDTAMNotifications(userId, parseInt(limit, 10));
      }

      res.json({
        success: true,
        count: notifications.length,
        notifications
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: error.message
      });
    }
  }
}

module.exports = DashboardController;
