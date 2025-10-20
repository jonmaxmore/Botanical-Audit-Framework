/**
 * Dashboard Routes - Farmer
 *
 * Defines HTTP routes for farmer dashboard endpoints.
 * Handles authentication and authorization.
 *
 * Part of Clean Architecture - Presentation Layer
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticateFarmer } = require('../../../../middleware/auth');

// Initialize routes with controller
function initializeDashboardFarmerRoutes(dashboardController) {
  /**
   * Get farmer dashboard
   * GET /api/farmer/dashboard
   */
  router.get('/', authenticateFarmer, (req, res) =>
    dashboardController.getFarmerDashboard(req, res),
  );

  /**
   * Get farmer alerts
   * GET /api/farmer/dashboard/alerts
   */
  router.get('/alerts', authenticateFarmer, (req, res) =>
    dashboardController.getFarmerAlerts(req, res),
  );

  /**
   * Get farmer quick actions
   * GET /api/farmer/dashboard/quick-actions
   */
  router.get('/quick-actions', authenticateFarmer, (req, res) =>
    dashboardController.getFarmerQuickActions(req, res),
  );

  return router;
}

module.exports = { initializeDashboardFarmerRoutes };
