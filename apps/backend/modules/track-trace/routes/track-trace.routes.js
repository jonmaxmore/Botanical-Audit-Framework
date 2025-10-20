/**
 * 📦 Track & Trace Routes
 * API endpoints for product tracking and QR code system
 */

const express = require('express');
const TrackTraceController = require('../controllers/track-trace.controller');

/**
 * Initialize track & trace routes
 */
function createTrackTraceRoutes(trackTraceService, authenticateToken) {
  const router = express.Router();
  const controller = new TrackTraceController(trackTraceService);

  // ==========================================
  // 🌍 Public Routes (No Auth Required)
  // ==========================================

  /**
   * @route   GET /api/track-trace/lookup/:batchCode
   * @desc    Lookup product by batch code (public for QR scanning)
   * @access  Public
   */
  router.get('/lookup/:batchCode', controller.lookupProduct);

  /**
   * @route   GET /api/track-trace/health
   * @desc    Health check
   * @access  Public
   */
  router.get('/health', controller.healthCheck);

  // ==========================================
  // 🔒 Protected Routes (Auth Required)
  // ==========================================

  // Apply authentication middleware
  router.use(authenticateToken);

  /**
   * @route   GET /api/track-trace/products
   * @desc    Get user's products
   * @access  Private (Farmer)
   * @query   stage (optional) - Filter by stage
   * @query   certificationStatus (optional) - Filter by status
   */
  router.get('/products', controller.getProducts);

  /**
   * @route   POST /api/track-trace/products
   * @desc    Create new product batch
   * @access  Private (Farmer)
   * @body    { productName, variety, quantity, unit, farmId }
   */
  router.post('/products', controller.createProduct);

  /**
   * @route   GET /api/track-trace/products/:id
   * @desc    Get product by ID with timeline
   * @access  Private (Farmer/Admin)
   */
  router.get('/products/:id', controller.getProductById);

  /**
   * @route   PUT /api/track-trace/products/:id
   * @desc    Update product data
   * @access  Private (Farmer)
   */
  router.put('/products/:id', controller.updateProduct);

  /**
   * @route   DELETE /api/track-trace/products/:id
   * @desc    Delete product (pending only)
   * @access  Private (Farmer)
   */
  router.delete('/products/:id', controller.deleteProduct);

  /**
   * @route   PUT /api/track-trace/products/:id/stage
   * @desc    Update product stage
   * @access  Private (Farmer)
   * @body    { stage, description, location }
   */
  router.put('/products/:id/stage', controller.updateStage);

  /**
   * @route   GET /api/track-trace/products/:id/qrcode
   * @desc    Generate/get QR code for product
   * @access  Private (Farmer)
   */
  router.get('/products/:id/qrcode', controller.generateQRCode);

  /**
   * @route   POST /api/track-trace/products/:id/timeline
   * @desc    Add timeline event manually
   * @access  Private (Farmer/Admin)
   * @body    { stage, description, location }
   */
  router.post('/products/:id/timeline', controller.addTimelineEvent);

  /**
   * @route   GET /api/track-trace/statistics
   * @desc    Get user's product statistics
   * @access  Private (Farmer)
   */
  router.get('/statistics', controller.getStatistics);

  /**
   * @route   PUT /api/track-trace/products/:id/certification
   * @desc    Update certification status (Admin only)
   * @access  Private (Admin)
   * @body    { status, certificationNumber, issuedDate, expiryDate }
   */
  router.put('/products/:id/certification', controller.updateCertification);

  return router;
}

module.exports = createTrackTraceRoutes;
