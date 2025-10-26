/**
 * 📦 Track & Trace Service
 * Product tracking, QR code generation, supply chain visibility
 */

const QRCode = require('qrcode');
const logger = require('../../shared/utils/logger');
const { AppError } = require('../../shared/utils/errors');

class TrackTraceService {
  constructor(db) {
    this.db = db;
    this.productsCollection = db.collection('products');
    this.timelineCollection = db.collection('productTimeline');
    this.qrCodesCollection = db.collection('qrCodes');
  }

  /**
   * Create product batch
   */
  async createProductBatch({ userId, productName, variety, quantity, unit, farmId }) {
    try {
      // Generate batch code
      const year = new Date().getFullYear();
      const prefix = productName.substring(0, 2).toUpperCase();
      const count = (await this.productsCollection.countDocuments({ userId })) + 1;
      const batchCode = `${prefix}${year}-${String(count).padStart(3, '0')}`;

      const product = {
        userId,
        farmId,
        batchCode,
        productName,
        variety,
        quantity: Number(quantity),
        unit,
        stage: 'PLANTING',
        certificationStatus: 'PENDING',
        metadata: {
          createdAt: new Date(),
          lastUpdated: new Date(),
          createdBy: userId,
        },
      };

      const result = await this.productsCollection.insertOne(product);

      // Create initial timeline entry
      await this.addTimelineEvent({
        productId: result.insertedId.toString(),
        stage: 'PLANTING',
        description: 'Product batch created',
        location: 'Farm',
        verifiedBy: userId,
      });

      // Generate QR code
      const qrCode = await this.generateQRCode(batchCode);

      return {
        success: true,
        data: {
          ...product,
          _id: result.insertedId,
          qrCode,
        },
      };
    } catch (error) {
      logger.error('[TrackTrace] Create batch error:', error);
      throw new AppError('Failed to create product batch', 500);
    }
  }

  /**
   * Get product by batch code
   */
  async getProductByBatchCode(batchCode) {
    try {
      const product = await this.productsCollection.findOne({ batchCode });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Get timeline
      const timeline = await this.timelineCollection
        .find({ productId: product._id.toString() })
        .sort({ 'metadata.createdAt': 1 })
        .toArray();

      // Get QR code
      const qrCodeData = await this.qrCodesCollection.findOne({ batchCode });

      return {
        success: true,
        data: {
          ...product,
          timeline,
          qrData: qrCodeData || null,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[TrackTrace] Get product error:', error);
      throw new AppError('Failed to get product', 500);
    }
  }

  /**
   * Get user's products
   */
  async getUserProducts(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.stage) {
        query.stage = filters.stage;
      }

      if (filters.certificationStatus) {
        query.certificationStatus = filters.certificationStatus;
      }

      const products = await this.productsCollection
        .find(query)
        .sort({ 'metadata.createdAt': -1 })
        .toArray();

      return {
        success: true,
        data: products,
        total: products.length,
      };
    } catch (error) {
      logger.error('[TrackTrace] Get user products error:', error);
      throw new AppError('Failed to get products', 500);
    }
  }

  /**
   * Update product stage
   */
  async updateProductStage(productId, stage, userId, updateData = {}) {
    try {
      const { ObjectId } = require('mongodb');
      const product = await this.productsCollection.findOne({
        _id: new ObjectId(productId),
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Check ownership
      if (product.userId !== userId) {
        throw new AppError('Unauthorized access', 403);
      }

      // Valid stages
      const validStages = [
        'PLANTING',
        'GROWING',
        'HARVESTING',
        'PROCESSING',
        'PACKAGING',
        'DISTRIBUTION',
        'COMPLETED',
      ];
      if (!validStages.includes(stage)) {
        throw new AppError('Invalid stage', 400);
      }

      // Update product
      const update = {
        stage,
        ...updateData,
        'metadata.lastUpdated': new Date(),
        'metadata.updatedBy': userId,
      };

      await this.productsCollection.updateOne({ _id: new ObjectId(productId) }, { $set: update });

      // Add timeline event
      await this.addTimelineEvent({
        productId,
        stage,
        description: updateData.description || `Stage updated to ${stage}`,
        location: updateData.location || 'Farm',
        verifiedBy: userId,
      });

      return {
        success: true,
        message: 'Product stage updated',
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[TrackTrace] Update stage error:', error);
      throw new AppError('Failed to update stage', 500);
    }
  }

  /**
   * Update product data
   */
  async updateProduct(productId, userId, updateData) {
    try {
      const { ObjectId } = require('mongodb');
      const product = await this.productsCollection.findOne({
        _id: new ObjectId(productId),
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Check ownership
      if (product.userId !== userId) {
        throw new AppError('Unauthorized access', 403);
      }

      const update = {
        ...updateData,
        'metadata.lastUpdated': new Date(),
        'metadata.updatedBy': userId,
      };

      // const result = await this.productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $set: update },
      );

      return {
        success: true,
        message: 'Product updated',
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[TrackTrace] Update product error:', error);
      throw new AppError('Failed to update product', 500);
    }
  }

  /**
   * Delete product (pending only)
   */
  async deleteProduct(productId, userId) {
    try {
      const { ObjectId } = require('mongodb');
      const product = await this.productsCollection.findOne({
        _id: new ObjectId(productId),
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Check ownership
      if (product.userId !== userId) {
        throw new AppError('Unauthorized access', 403);
      }

      // Only allow deletion if pending
      if (product.certificationStatus !== 'PENDING') {
        throw new AppError('Cannot delete certified products', 400);
      }

      // Delete product and timeline
      await this.productsCollection.deleteOne({ _id: new ObjectId(productId) });
      await this.timelineCollection.deleteMany({ productId });
      await this.qrCodesCollection.deleteOne({ batchCode: product.batchCode });

      return {
        success: true,
        message: 'Product deleted',
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[TrackTrace] Delete product error:', error);
      throw new AppError('Failed to delete product', 500);
    }
  }

  /**
   * Add timeline event
   */
  async addTimelineEvent({ productId, stage, description, location, verifiedBy }) {
    try {
      const event = {
        productId,
        stage,
        description,
        location,
        verifiedBy,
        metadata: {
          createdAt: new Date(),
        },
      };

      await this.timelineCollection.insertOne(event);

      return { success: true };
    } catch (error) {
      logger.error('[TrackTrace] Add timeline error:', error);
      throw new AppError('Failed to add timeline event', 500);
    }
  }

  /**
   * Link SOP activity to product batch
   */
  async linkSOPActivity(batchCode, sopActivity) {
    try {
      const product = await this.productsCollection.findOne({ batchCode });
      if (!product) {
        throw new AppError('Product batch not found', 404);
      }

      // Add SOP activity to timeline
      await this.addTimelineEvent({
        productId: product._id.toString(),
        stage: 'SOP_ACTIVITY',
        description: `SOP: ${sopActivity.activityName} (${sopActivity.phase})`,
        location: sopActivity.gpsLocation
          ? `GPS: ${sopActivity.gpsLocation.latitude}, ${sopActivity.gpsLocation.longitude}`
          : 'Farm Location',
        verifiedBy: sopActivity.recordedBy,
      });

      // Update product with SOP compliance data
      const sopUpdate = {
        sopActivities: {
          $push: {
            activityId: sopActivity.activityId,
            activityName: sopActivity.activityName,
            phase: sopActivity.phase,
            compliancePoints: sopActivity.compliancePoints,
            recordedAt: sopActivity.recordedAt,
            gacpRequirement: sopActivity.gacpRequirement,
          },
        },
        'metadata.lastUpdated': new Date(),
      };

      await this.productsCollection.updateOne(
        { batchCode },
        { $addToSet: sopUpdate.sopActivities },
      );

      return {
        success: true,
        message: 'SOP activity linked to batch successfully',
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[TrackTrace] Link SOP activity error:', error);
      throw new AppError('Failed to link SOP activity', 500);
    }
  }

  /**
   * Get batch compliance score from SOP activities
   */
  async getBatchComplianceScore(batchCode) {
    try {
      const product = await this.productsCollection.findOne({ batchCode });
      if (!product) {
        throw new AppError('Product batch not found', 404);
      }

      const sopActivities = product.sopActivities || [];
      const totalPoints = sopActivities.reduce(
        (sum, activity) => sum + (activity.compliancePoints || 0),
        0,
      );

      // Calculate compliance percentage (345 is max possible points)
      const compliancePercentage = Math.min((totalPoints / 345) * 100, 100);

      // Count activities by phase
      const activitiesByPhase = sopActivities.reduce((acc, activity) => {
        acc[activity.phase] = (acc[activity.phase] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          batchCode,
          totalCompliancePoints: totalPoints,
          compliancePercentage: Math.round(compliancePercentage),
          totalSOPActivities: sopActivities.length,
          activitiesByPhase,
          sopActivities: sopActivities.map(activity => ({
            activityName: activity.activityName,
            phase: activity.phase,
            points: activity.compliancePoints,
            recordedAt: activity.recordedAt,
            requirement: activity.gacpRequirement,
          })),
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[TrackTrace] Get compliance score error:', error);
      throw new AppError('Failed to get compliance score', 500);
    }
  }

  /**
   * Generate enhanced QR code with SOP compliance data
   */
  async generateEnhancedQRCode(batchCode) {
    try {
      const product = await this.productsCollection.findOne({ batchCode });
      if (!product) {
        throw new AppError('Product batch not found', 404);
      }

      // Get compliance score
      const complianceData = await this.getBatchComplianceScore(batchCode);

      // Enhanced verification URL with compliance info
      const verifyUrl = `https://gacp-platform.com/verify/${batchCode}?type=enhanced&compliance=${complianceData.data.compliancePercentage}`;

      // Generate QR code
      const qrCodeImage = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
      });

      // Save enhanced QR code data
      const qrData = {
        batchCode,
        url: verifyUrl,
        qrCode: qrCodeImage,
        type: 'enhanced',
        complianceScore: complianceData.data.compliancePercentage,
        sopActivitiesCount: complianceData.data.totalSOPActivities,
        generatedAt: new Date(),
      };

      await this.qrCodesCollection.updateOne({ batchCode }, { $set: qrData }, { upsert: true });

      return {
        success: true,
        qrCode: qrCodeImage,
        verifyUrl,
        complianceData: complianceData.data,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[TrackTrace] Generate enhanced QR error:', error);
      throw new AppError('Failed to generate enhanced QR code', 500);
    }
  }

  /**
   * Generate QR code
   */
  async generateQRCode(batchCode) {
    try {
      // Check if QR code already exists
      const existing = await this.qrCodesCollection.findOne({ batchCode });
      if (existing) {
        return existing.qrCode;
      }

      // Generate QR code URL
      const verifyUrl = `https://gacp-platform.com/verify/${batchCode}`;

      // Generate QR code image (base64)
      const qrCodeImage = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
      });

      // Save QR code data
      const qrData = {
        batchCode,
        url: verifyUrl,
        qrCode: qrCodeImage,
        generatedAt: new Date(),
      };

      await this.qrCodesCollection.insertOne(qrData);

      return qrCodeImage;
    } catch (error) {
      logger.error('[TrackTrace] Generate QR error:', error);
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId) {
    try {
      const totalProducts = await this.productsCollection.countDocuments({ userId });

      const certified = await this.productsCollection.countDocuments({
        userId,
        certificationStatus: 'CERTIFIED',
      });

      const pending = await this.productsCollection.countDocuments({
        userId,
        certificationStatus: 'PENDING',
      });

      const inProgress = await this.productsCollection.countDocuments({
        userId,
        stage: { $in: ['PLANTING', 'GROWING', 'HARVESTING', 'PROCESSING'] },
      });

      // Get products by stage
      const byStage = await this.productsCollection
        .aggregate([{ $match: { userId } }, { $group: { _id: '$stage', count: { $sum: 1 } } }])
        .toArray();

      return {
        success: true,
        data: {
          totalProducts,
          certified,
          pending,
          inProgress,
          byStage: byStage.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      };
    } catch (error) {
      logger.error('[TrackTrace] Get statistics error:', error);
      throw new AppError('Failed to get statistics', 500);
    }
  }

  /**
   * Update certification status
   */
  async updateCertificationStatus(productId, status, certificationData = {}) {
    try {
      const { ObjectId } = require('mongodb');

      const update = {
        certificationStatus: status,
        certification: {
          status,
          ...certificationData,
          updatedAt: new Date(),
        },
        'metadata.lastUpdated': new Date(),
      };

      await this.productsCollection.updateOne({ _id: new ObjectId(productId) }, { $set: update });

      // Add timeline event
      await this.addTimelineEvent({
        productId,
        stage: 'CERTIFICATION',
        description: `Certification status: ${status}`,
        location: 'Certification Authority',
        verifiedBy: 'System',
      });

      return {
        success: true,
        message: 'Certification status updated',
      };
    } catch (error) {
      logger.error('[TrackTrace] Update certification error:', error);
      throw new AppError('Failed to update certification', 500);
    }
  }
}

module.exports = TrackTraceService;
