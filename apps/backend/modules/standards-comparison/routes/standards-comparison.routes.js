/**
 * Standards Comparison Routes
 *
 * API endpoints for standards comparison functionality
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
        message: 'Standards Comparison service is not initialized yet',
      });
    }
    next();
  };

  // Apply initialization check to all routes
  router.use(checkInitialized);

  /**
   * @route   GET /api/standards-comparison/health
   * @desc    Health check endpoint
   * @access  Public
   */
  router.get('/health', (req, res) => controller.healthCheck(req, res));

  /**
   * @route   GET /api/standards-comparison
   * @desc    Get list of available standards
   * @access  Public
   */
  router.get('/', (req, res) => controller.getAvailableStandards(req, res));

  /**
   * @route   GET /api/standards-comparison/:id
   * @desc    Get standard details by ID
   * @access  Public
   */
  router.get('/:id', (req, res) => controller.getStandardDetails(req, res));

  /**
   * @route   POST /api/standards-comparison/compare
   * @desc    Compare farm against standards
   * @access  Private (requires authentication)
   */
  router.post('/compare', authMiddleware, (req, res) => controller.compareFarm(req, res));

  /**
   * @route   GET /api/standards-comparison/comparison/:id
   * @desc    Get comparison results by ID
   * @access  Private (requires authentication)
   */
  router.get('/comparison/:id', authMiddleware, (req, res) =>
    controller.getComparisonResults(req, res),
  );

  /**
   * @route   GET /api/standards-comparison/gaps/:comparisonId
   * @desc    Analyze gaps for a comparison
   * @access  Private (requires authentication)
   */
  router.get('/gaps/:comparisonId', authMiddleware, (req, res) => controller.analyzeGaps(req, res));

  /**
   * @route   GET /api/standards-comparison/history/:farmId
   * @desc    Get comparison history for a farm
   * @access  Private (requires authentication)
   */
  router.get('/history/:farmId', authMiddleware, (req, res) =>
    controller.getComparisonHistory(req, res),
  );

  /**
   * @route   GET /api/standards-comparison/recommendations/:comparisonId
   * @desc    Get recommendations for a comparison
   * @access  Private (requires authentication)
   */
  router.get('/recommendations/:comparisonId', authMiddleware, (req, res) =>
    controller.getRecommendations(req, res),
  );

  return router;
}

module.exports = initializeRoutes;
