/**
 * 📦 Track & Trace Controller
 * HTTP handlers for product tracking system
 */

const { successResponse, errorResponse } = require('../../shared/utils/response-utils');
const logger = require('../../shared/utils/logger');

class TrackTraceController {
  constructor(trackTraceService) {
    this.trackTraceService = trackTraceService;
  }

  /**
   * Lookup product by batch code (Public)
   * GET /api/track-trace/lookup/:batchCode
   */
  lookupProduct = async (req, res) => {
    try {
      const { batchCode } = req.params;

      const result = await this.trackTraceService.getProductByBatchCode(batchCode);

      return successResponse(res, result.data, 'Product found');
    } catch (error) {
      logger.error('[TrackTraceController] Lookup error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Create product batch
   * POST /api/track-trace/products
   */
  createProduct = async (req, res) => {
    try {
      const { productName, variety, quantity, unit, farmId } = req.body;
      const userId = req.user.id;

      if (!productName || !quantity || !unit) {
        return errorResponse(res, {
          message: 'Product name, quantity, and unit are required',
          statusCode: 400
        });
      }

      const result = await this.trackTraceService.createProductBatch({
        userId,
        productName,
        variety,
        quantity,
        unit,
        farmId
      });

      return successResponse(res, result.data, 'Product batch created', 201);
    } catch (error) {
      logger.error('[TrackTraceController] Create product error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get user's products
   * GET /api/track-trace/products
   */
  getProducts = async (req, res) => {
    try {
      const userId = req.user.id;
      const filters = {
        stage: req.query.stage,
        certificationStatus: req.query.certificationStatus
      };

      const result = await this.trackTraceService.getUserProducts(userId, filters);

      return successResponse(res, {
        products: result.data,
        total: result.total
      });
    } catch (error) {
      logger.error('[TrackTraceController] Get products error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get product by ID
   * GET /api/track-trace/products/:id
   */
  getProductById = async (req, res) => {
    try {
      const { id } = req.params;
      const { ObjectId } = require('mongodb');

      const product = await this.trackTraceService.productsCollection.findOne({
        _id: new ObjectId(id)
      });

      if (!product) {
        return errorResponse(res, { message: 'Product not found', statusCode: 404 });
      }

      // Check ownership or admin
      if (product.userId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Unauthorized', statusCode: 403 });
      }

      // Get timeline
      const timeline = await this.trackTraceService.timelineCollection
        .find({ productId: id })
        .sort({ 'metadata.createdAt': 1 })
        .toArray();

      // Get QR code
      const qrData = await this.trackTraceService.qrCodesCollection.findOne({
        batchCode: product.batchCode
      });

      return successResponse(res, {
        ...product,
        timeline,
        qrData: qrData || null
      });
    } catch (error) {
      logger.error('[TrackTraceController] Get product error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Update product stage
   * PUT /api/track-trace/products/:id/stage
   */
  updateStage = async (req, res) => {
    try {
      const { id } = req.params;
      const { stage, description, location } = req.body;
      const userId = req.user.id;

      if (!stage) {
        return errorResponse(res, { message: 'Stage is required', statusCode: 400 });
      }

      await this.trackTraceService.updateProductStage(id, stage, userId, {
        description,
        location
      });

      return successResponse(res, null, 'Product stage updated');
    } catch (error) {
      logger.error('[TrackTraceController] Update stage error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Update product data
   * PUT /api/track-trace/products/:id
   */
  updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Remove protected fields
      delete updateData._id;
      delete updateData.userId;
      delete updateData.batchCode;
      delete updateData.metadata;

      await this.trackTraceService.updateProduct(id, userId, updateData);

      return successResponse(res, null, 'Product updated');
    } catch (error) {
      logger.error('[TrackTraceController] Update product error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Delete product
   * DELETE /api/track-trace/products/:id
   */
  deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await this.trackTraceService.deleteProduct(id, userId);

      return successResponse(res, null, 'Product deleted');
    } catch (error) {
      logger.error('[TrackTraceController] Delete product error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Generate QR code
   * GET /api/track-trace/products/:id/qrcode
   */
  generateQRCode = async (req, res) => {
    try {
      const { id } = req.params;
      const { ObjectId } = require('mongodb');

      const product = await this.trackTraceService.productsCollection.findOne({
        _id: new ObjectId(id)
      });

      if (!product) {
        return errorResponse(res, { message: 'Product not found', statusCode: 404 });
      }

      // Check ownership
      if (product.userId !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Unauthorized', statusCode: 403 });
      }

      const qrCode = await this.trackTraceService.generateQRCode(product.batchCode);

      return successResponse(res, { qrCode, batchCode: product.batchCode });
    } catch (error) {
      logger.error('[TrackTraceController] Generate QR error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Add timeline event
   * POST /api/track-trace/products/:id/timeline
   */
  addTimelineEvent = async (req, res) => {
    try {
      const { id } = req.params;
      const { stage, description, location } = req.body;
      const userId = req.user.id;

      if (!stage || !description) {
        return errorResponse(res, {
          message: 'Stage and description are required',
          statusCode: 400
        });
      }

      // Check product ownership
      const { ObjectId } = require('mongodb');
      const product = await this.trackTraceService.productsCollection.findOne({
        _id: new ObjectId(id)
      });

      if (!product) {
        return errorResponse(res, { message: 'Product not found', statusCode: 404 });
      }

      if (product.userId !== userId && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Unauthorized', statusCode: 403 });
      }

      await this.trackTraceService.addTimelineEvent({
        productId: id,
        stage,
        description,
        location: location || 'Not specified',
        verifiedBy: userId
      });

      return successResponse(res, null, 'Timeline event added', 201);
    } catch (error) {
      logger.error('[TrackTraceController] Add timeline error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get user statistics
   * GET /api/track-trace/statistics
   */
  getStatistics = async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await this.trackTraceService.getUserStatistics(userId);

      return successResponse(res, result.data);
    } catch (error) {
      logger.error('[TrackTraceController] Get statistics error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Update certification status (Admin only)
   * PUT /api/track-trace/products/:id/certification
   */
  updateCertification = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return errorResponse(res, {
          message: 'Admin access required',
          statusCode: 403
        });
      }

      const { id } = req.params;
      const { status, certificationNumber, issuedDate, expiryDate, authority } = req.body;

      if (!status) {
        return errorResponse(res, { message: 'Status is required', statusCode: 400 });
      }

      await this.trackTraceService.updateCertificationStatus(id, status, {
        number: certificationNumber,
        issuedDate,
        expiryDate,
        authority: authority || 'GACP Thailand Authority'
      });

      return successResponse(res, null, 'Certification updated');
    } catch (error) {
      logger.error('[TrackTraceController] Update certification error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Health check
   * GET /api/track-trace/health
   */
  healthCheck = async (req, res) => {
    try {
      return successResponse(res, {
        status: 'ok',
        service: 'track-trace',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  };
}

module.exports = TrackTraceController;
