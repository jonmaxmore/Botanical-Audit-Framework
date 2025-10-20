/**
 * 📦 Track & Trace Module Entry Point
 * Product tracking, QR codes, supply chain visibility
 */

const TrackTraceService = require('./services/track-trace.service');
const createTrackTraceRoutes = require('./routes/track-trace.routes');
const logger = require('../shared/utils/logger');

/**
 * Initialize Track & Trace Module
 * @param {Object} dependencies - Module dependencies
 * @param {Object} dependencies.db - MongoDB database instance
 * @param {Function} dependencies.authenticateToken - Auth middleware
 * @returns {Object} Router and service instance
 */
async function initializeTrackTrace({ db, authenticateToken }) {
  try {
    logger.info('[TrackTrace] Initializing module...');

    // Validate dependencies
    if (!db) {
      throw new Error('Database instance is required');
    }
    if (!authenticateToken) {
      throw new Error('Authentication middleware is required');
    }

    // Initialize service
    const trackTraceService = new TrackTraceService(db);
    logger.info('[TrackTrace] Service initialized');

    // Create routes
    const router = createTrackTraceRoutes(trackTraceService, authenticateToken);

    logger.info('[TrackTrace] Module initialized successfully');

    return {
      router,
      service: trackTraceService,
    };
  } catch (error) {
    logger.error('[TrackTrace] Initialization failed:', error);
    throw error;
  }
}

/**
 * Track & Trace Configuration
 */
const config = {
  moduleName: 'track-trace',
  version: '1.0.0',
  description: 'Product tracking, QR codes, and supply chain visibility',

  // Product stages
  stages: [
    { name: 'PLANTING', description: 'Seed/plant cultivation', order: 1 },
    { name: 'GROWING', description: 'Growth phase', order: 2 },
    { name: 'HARVESTING', description: 'Harvest time', order: 3 },
    { name: 'PROCESSING', description: 'Product processing', order: 4 },
    { name: 'PACKAGING', description: 'Product packaging', order: 5 },
    { name: 'DISTRIBUTION', description: 'Ready for distribution', order: 6 },
    { name: 'COMPLETED', description: 'Journey completed', order: 7 },
  ],

  // Certification statuses
  certificationStatuses: [
    { name: 'PENDING', description: 'Awaiting certification' },
    { name: 'IN_REVIEW', description: 'Under review' },
    { name: 'CERTIFIED', description: 'GACP certified' },
    { name: 'REJECTED', description: 'Certification rejected' },
    { name: 'EXPIRED', description: 'Certification expired' },
  ],

  // Quantity units
  units: ['kg', 'ton', 'gram', 'piece', 'liter'],

  // Quality grades
  grades: ['A', 'B', 'C', 'D', 'Premium', 'Standard'],

  // API endpoints
  endpoints: {
    public: {
      lookup: 'GET /api/track-trace/lookup/:batchCode',
      health: 'GET /api/track-trace/health',
    },
    private: {
      getProducts: 'GET /api/track-trace/products',
      createProduct: 'POST /api/track-trace/products',
      getProduct: 'GET /api/track-trace/products/:id',
      updateProduct: 'PUT /api/track-trace/products/:id',
      deleteProduct: 'DELETE /api/track-trace/products/:id',
      updateStage: 'PUT /api/track-trace/products/:id/stage',
      getQRCode: 'GET /api/track-trace/products/:id/qrcode',
      addTimeline: 'POST /api/track-trace/products/:id/timeline',
      getStatistics: 'GET /api/track-trace/statistics',
    },
    admin: {
      updateCertification: 'PUT /api/track-trace/products/:id/certification',
    },
  },
};

module.exports = {
  initializeTrackTrace,
  config,
};
