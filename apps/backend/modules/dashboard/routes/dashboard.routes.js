/**
 * Dashboard Routes
 *
 * API endpoints for dashboard functionality
 */

const express = require('express');
const router = express.Router();

/**
 * Initialize routes with controller and middleware
 */
function initializeRoutes(controller, authMiddleware) {
  // Middleware to check if service is initialized
  const checkInitialized = (req, res, next) => {
    if (!controller.service.initialized) {
      return res.status(503).json({
        success: false,
        message: 'Dashboard service is not initialized yet',
      });
    }
    next();
  };

  // Apply initialization check to all routes
  router.use(checkInitialized);

  /**
   * @route   GET /api/dashboard/health
   * @desc    System health check
   * @access  Public
   */
  router.get('/health', (req, res) => controller.getSystemHealth(req, res));

  /**
   * @route   GET /api/dashboard/stats/realtime
   * @desc    Get realtime system statistics
   * @access  Private
   */
  router.get('/stats/realtime', authMiddleware, (req, res) =>
    controller.getRealtimeStats(req, res)
  );

  /**
   * @route   GET /api/dashboard/:role
   * @desc    Get dashboard by role (farmer, reviewer, auditor, admin)
   * @access  Private
   */
  router.get('/:role', authMiddleware, (req, res) => controller.getDashboardByRole(req, res));

  /**
   * @route   GET /api/dashboard/farmer/:userId
   * @desc    Get farmer-specific dashboard
   * @access  Private
   */
  router.get('/farmer/:userId', authMiddleware, (req, res) =>
    controller.getFarmerDashboard(req, res)
  );

  /**
   * @route   GET /api/dashboard/reviewer
   * @desc    Get reviewer dashboard
   * @access  Private (DTAM staff)
   */
  router.get('/reviewer', authMiddleware, (req, res) => controller.getReviewerDashboard(req, res));

  /**
   * @route   GET /api/dashboard/auditor
   * @desc    Get auditor dashboard
   * @access  Private (DTAM staff)
   */
  router.get('/auditor', authMiddleware, (req, res) => controller.getAuditorDashboard(req, res));

  /**
   * @route   GET /api/dashboard/admin
   * @desc    Get admin dashboard
   * @access  Private (Admin only)
   */
  router.get('/admin', authMiddleware, (req, res) => controller.getAdminDashboard(req, res));

  /**
   * @route   GET /api/dashboard/stats/farmer/:userId
   * @desc    Get farmer statistics
   * @access  Private
   */
  router.get('/stats/farmer/:userId', authMiddleware, (req, res) =>
    controller.getFarmerStats(req, res)
  );

  /**
   * @route   GET /api/dashboard/stats/dtam
   * @desc    Get DTAM staff statistics
   * @access  Private (DTAM staff)
   */
  router.get('/stats/dtam', authMiddleware, (req, res) => controller.getDTAMStats(req, res));

  /**
   * @route   GET /api/dashboard/stats/admin
   * @desc    Get admin statistics
   * @access  Private (Admin only)
   */
  router.get('/stats/admin', authMiddleware, (req, res) => controller.getAdminStats(req, res));

  /**
   * @route   GET /api/dashboard/activities
   * @desc    Get recent activities
   * @access  Private
   */
  router.get('/activities', authMiddleware, (req, res) => controller.getRecentActivities(req, res));

  /**
   * @route   GET /api/dashboard/applications/pending
   * @desc    Get pending applications
   * @access  Private (DTAM staff)
   */
  router.get('/applications/pending', authMiddleware, (req, res) =>
    controller.getPendingApplications(req, res)
  );

  /**
   * @route   GET /api/dashboard/notifications
   * @desc    Get user notifications
   * @access  Private
   */
  router.get('/notifications', authMiddleware, (req, res) => controller.getNotifications(req, res));

  return router;
}

module.exports = initializeRoutes;
