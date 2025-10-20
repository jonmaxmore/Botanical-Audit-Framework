/**
 * Dashboard Routes - DTAM
 *
 * Defines HTTP routes for DTAM dashboard endpoints.
 * Handles authentication and authorization for staff.
 *
 * Part of Clean Architecture - Presentation Layer
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticateDTAM } = require('../../../../middleware/auth');

// Initialize routes with controller
function initializeDashboardDTAMRoutes(dashboardController) {
  /**
   * Get DTAM dashboard
   * GET /api/dtam/dashboard
   */
  router.get('/', authenticateDTAM, (req, res) => dashboardController.getDTAMDashboard(req, res));

  /**
   * Get system statistics
   * GET /api/dtam/dashboard/statistics
   */
  router.get('/statistics', authenticateDTAM, (req, res) =>
    dashboardController.getSystemStatistics(req, res),
  );

  /**
   * Get quick stats widget data
   * GET /api/dtam/dashboard/quick-stats
   */
  router.get('/quick-stats', authenticateDTAM, (req, res) =>
    dashboardController.getQuickStats(req, res),
  );

  /**
   * Get pending tasks
   * GET /api/dtam/dashboard/pending-tasks
   */
  router.get('/pending-tasks', authenticateDTAM, (req, res) =>
    dashboardController.getPendingTasks(req, res),
  );

  /**
   * Get recent activity
   * GET /api/dtam/dashboard/recent-activity
   */
  router.get('/recent-activity', authenticateDTAM, (req, res) =>
    dashboardController.getRecentActivity(req, res),
  );

  /**
   * Get trends data
   * GET /api/dtam/dashboard/trends
   */
  router.get('/trends', authenticateDTAM, (req, res) => dashboardController.getTrends(req, res));

  return router;
}

module.exports = { initializeDashboardDTAMRoutes };
