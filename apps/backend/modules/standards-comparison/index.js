/**
 * Standards Comparison Module
 *
 * Entry point for the standards comparison module
 * Provides functionality to compare farms against GACP/GAP standards
 */

const StandardsComparisonService = require('./services/standards-comparison.service');
const StandardsComparisonController = require('./controllers/standards-comparison.controller');
const initializeRoutes = require('./routes/standards-comparison.routes');

/**
 * Initialize the Standards Comparison module
 *
 * @param {Object} db - MongoDB database instance
 * @param {Function} authMiddleware - Authentication middleware
 * @returns {Object} { router, service }
 */
async function initializeStandardsComparison(db, authMiddleware) {
  try {
    // Create service instance
    const service = new StandardsComparisonService(db);

    // Initialize service (load standards)
    await service.initialize();

    // Create controller
    const controller = new StandardsComparisonController(service);

    // Create routes
    const router = initializeRoutes(controller, authMiddleware);

    console.log('✓ Standards Comparison module initialized successfully');

    return {
      router,
      service,
      controller,
    };
  } catch (error) {
    console.error('✗ Failed to initialize Standards Comparison module:', error);
    throw error;
  }
}

module.exports = {
  initializeStandardsComparison,
  StandardsComparisonService,
  StandardsComparisonController,
};
