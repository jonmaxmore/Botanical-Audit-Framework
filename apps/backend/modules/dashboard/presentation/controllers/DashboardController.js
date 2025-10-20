/**
 * Dashboard Controller
 *
 * Handles HTTP requests for dashboard analytics and statistics.
 * Provides endpoints for farmer and DTAM dashboards.
 *
 * Part of Clean Architecture - Presentation Layer
 */

const { DashboardDTO } = require('../dto/DashboardDTO');

class DashboardController {
  constructor(getFarmerDashboardUseCase, getDTAMDashboardUseCase, getSystemStatisticsUseCase) {
    this.getFarmerDashboardUseCase = getFarmerDashboardUseCase;
    this.getDTAMDashboardUseCase = getDTAMDashboardUseCase;
    this.getSystemStatisticsUseCase = getSystemStatisticsUseCase;
  }

  /**
   * Get farmer dashboard
   * GET /api/farmer/dashboard
   */
  async getFarmerDashboard(req, res) {
    try {
      const farmerId = req.user.id;

      const dashboard = await this.getFarmerDashboardUseCase.execute(farmerId);

      res.json({
        success: true,
        data: DashboardDTO.toFarmerDashboard(dashboard)
      });
    } catch (error) {
      console.error('Error getting farmer dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load dashboard',
        message: error.message
      });
    }
  }

  /**
   * Get DTAM dashboard
   * GET /api/dtam/dashboard
   */
  async getDTAMDashboard(req, res) {
    try {
      const staffId = req.user.id;

      const dashboard = await this.getDTAMDashboardUseCase.execute(staffId);

      res.json({
        success: true,
        data: DashboardDTO.toDTAMDashboard(dashboard)
      });
    } catch (error) {
      console.error('Error getting DTAM dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load dashboard',
        message: error.message
      });
    }
  }

  /**
   * Get system statistics (DTAM only)
   * GET /api/dtam/dashboard/statistics
   */
  async getSystemStatistics(req, res) {
    try {
      const filters = this._buildFilters(req.query);

      const statistics = await this.getSystemStatisticsUseCase.execute(filters);

      res.json({
        success: true,
        data: DashboardDTO.toSystemStatistics(statistics)
      });
    } catch (error) {
      console.error('Error getting system statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load statistics',
        message: error.message
      });
    }
  }

  /**
   * Get quick stats widget data (DTAM only)
   * GET /api/dtam/dashboard/quick-stats
   */
  async getQuickStats(req, res) {
    try {
      const staffId = req.user.id;

      const dashboard = await this.getDTAMDashboardUseCase.execute(staffId);

      res.json({
        success: true,
        data: dashboard.quickStats
      });
    } catch (error) {
      console.error('Error getting quick stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load quick stats',
        message: error.message
      });
    }
  }

  /**
   * Get alerts for farmer
   * GET /api/farmer/dashboard/alerts
   */
  async getFarmerAlerts(req, res) {
    try {
      const farmerId = req.user.id;

      const dashboard = await this.getFarmerDashboardUseCase.execute(farmerId);

      res.json({
        success: true,
        data: dashboard.alerts
      });
    } catch (error) {
      console.error('Error getting farmer alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load alerts',
        message: error.message
      });
    }
  }

  /**
   * Get quick actions for farmer
   * GET /api/farmer/dashboard/quick-actions
   */
  async getFarmerQuickActions(req, res) {
    try {
      const farmerId = req.user.id;

      const dashboard = await this.getFarmerDashboardUseCase.execute(farmerId);

      res.json({
        success: true,
        data: dashboard.quickActions
      });
    } catch (error) {
      console.error('Error getting farmer quick actions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load quick actions',
        message: error.message
      });
    }
  }

  /**
   * Get pending tasks (DTAM only)
   * GET /api/dtam/dashboard/pending-tasks
   */
  async getPendingTasks(req, res) {
    try {
      const staffId = req.user.id;

      const dashboard = await this.getDTAMDashboardUseCase.execute(staffId);

      res.json({
        success: true,
        data: dashboard.pendingTasks
      });
    } catch (error) {
      console.error('Error getting pending tasks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load pending tasks',
        message: error.message
      });
    }
  }

  /**
   * Get recent activity (DTAM only)
   * GET /api/dtam/dashboard/recent-activity
   */
  async getRecentActivity(req, res) {
    try {
      const staffId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;

      const dashboard = await this.getDTAMDashboardUseCase.execute(staffId);

      res.json({
        success: true,
        data: dashboard.recentActivity.slice(0, limit)
      });
    } catch (error) {
      console.error('Error getting recent activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load recent activity',
        message: error.message
      });
    }
  }

  /**
   * Get trends data (DTAM only)
   * GET /api/dtam/dashboard/trends
   */
  async getTrends(req, res) {
    try {
      const staffId = req.user.id;

      const dashboard = await this.getDTAMDashboardUseCase.execute(staffId);

      res.json({
        success: true,
        data: dashboard.trends
      });
    } catch (error) {
      console.error('Error getting trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load trends',
        message: error.message
      });
    }
  }

  // Helper methods

  _buildFilters(query) {
    const filters = {};

    // Date range
    if (query.startDate) {
      filters.startDate = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.endDate = new Date(query.endDate);
    }

    // Status filter
    if (query.status) {
      filters.status = query.status;
    }

    // Type filter
    if (query.type) {
      filters.type = query.type;
    }

    return filters;
  }
}

module.exports = DashboardController;
