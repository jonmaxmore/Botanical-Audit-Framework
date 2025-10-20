/**
 * Track & Trace Engine - GACP Platform Phase 2
 *
 * Manages product traceability from seed to sale
 * Features:
 * - QR Code generation and management
 * - Activity logging (planting, harvest, processing, distribution)
 * - Timeline tracking
 * - Public verification
 * - Supply chain management
 *
 * @author GACP Development Team
 * @since Phase 2 - October 12, 2025
 */

const QRCode = require('qrcode');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class TrackTraceEngine {
  constructor(db = null) {
    this.db = db;
    this.trackTraces = null;
    this.activities = null;
    this.initialized = false;

    if (db) {
      this.trackTraces = db.collection('tracktraces');
      this.activities = db.collection('activities');
      this.initialized = true;
      console.log('[TrackTraceEngine] Initialized successfully');
    }
  }

  /**
   * Initialize engine with database connection
   */
  initialize(db) {
    if (!db) {
      throw new Error('Database connection required');
    }

    this.db = db;
    this.trackTraces = db.collection('tracktraces');
    this.activities = db.collection('activities');
    this.initialized = true;

    console.log('[TrackTraceEngine] Initialized with database');
    return this;
  }

  /**
   * Generate unique QR code for cultivation cycle
   * @param {Object} params - { cycleId, farmerId, farmName, cropType }
   * @returns {Promise<Object>} QR code data
   */
  async generateQRCode({ cycleId, farmerId, farmName, cropType }) {
    try {
      if (!this.initialized) {
        throw new Error('TrackTraceEngine not initialized');
      }

      // Generate unique QR code identifier
      const timestamp = Date.now();
      const random = crypto.randomBytes(8).toString('hex');
      const qrCodeId = `GACP-${timestamp}-${random}`;

      // Generate QR code image (base64)
      const qrCodeData = JSON.stringify({
        id: qrCodeId,
        cycleId,
        farmerId,
        farmName,
        cropType,
        generatedAt: new Date().toISOString(),
        verifyUrl: `https://gacp.go.th/verify/${qrCodeId}`,
      });

      const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Store in database
      const trackTrace = {
        _id: new ObjectId(),
        qrCodeId,
        cycleId,
        farmerId,
        farmName,
        cropType,
        qrCodeImage, // base64 encoded
        status: 'active',
        activities: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.trackTraces.insertOne(trackTrace);

      return {
        success: true,
        data: {
          qrCodeId,
          qrCodeImage,
          verifyUrl: `https://gacp.go.th/verify/${qrCodeId}`,
        },
      };
    } catch (error) {
      console.error('[TrackTraceEngine] QR generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Log activity for tracked item
   * @param {Object} activity - Activity details
   * @returns {Promise<Object>} Activity record
   */
  async logActivity({
    qrCodeId,
    type,
    description,
    location = {},
    photos = [],
    performedBy,
    metadata = {},
  }) {
    try {
      if (!this.initialized) {
        throw new Error('TrackTraceEngine not initialized');
      }

      // Validate QR code exists
      const trackTrace = await this.trackTraces.findOne({ qrCodeId });
      if (!trackTrace) {
        throw new Error(`QR Code not found: ${qrCodeId}`);
      }

      // Create activity record
      const activity = {
        _id: new ObjectId(),
        qrCodeId,
        cycleId: trackTrace.cycleId,
        type, // planting, fertilizing, watering, harvesting, processing, packaging, shipping, delivered
        description,
        location: {
          lat: location.lat || null,
          lng: location.lng || null,
          address: location.address || '',
        },
        photos, // array of image URLs
        performedBy: {
          userId: performedBy.userId,
          name: performedBy.name,
          role: performedBy.role,
        },
        metadata, // custom fields
        timestamp: new Date(),
        createdAt: new Date(),
      };

      // Insert activity
      await this.activities.insertOne(activity);

      // Update track trace record
      await this.trackTraces.updateOne(
        { qrCodeId },
        {
          $push: { activities: activity._id },
          $set: {
            lastActivity: activity.type,
            lastActivityDate: activity.timestamp,
            updatedAt: new Date(),
          },
        }
      );

      return {
        success: true,
        data: activity,
      };
    } catch (error) {
      console.error('[TrackTraceEngine] Activity logging error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get complete timeline for QR code
   * @param {String} qrCodeId - QR code identifier
   * @returns {Promise<Object>} Timeline data
   */
  async getTimeline(qrCodeId) {
    try {
      if (!this.initialized) {
        throw new Error('TrackTraceEngine not initialized');
      }

      // Get track trace record
      const trackTrace = await this.trackTraces.findOne({ qrCodeId });
      if (!trackTrace) {
        throw new Error(`QR Code not found: ${qrCodeId}`);
      }

      // Get all activities
      const activities = await this.activities.find({ qrCodeId }).sort({ timestamp: 1 }).toArray();

      return {
        success: true,
        data: {
          qrCodeId,
          cycleId: trackTrace.cycleId,
          farmName: trackTrace.farmName,
          cropType: trackTrace.cropType,
          status: trackTrace.status,
          activities,
          totalActivities: activities.length,
          createdAt: trackTrace.createdAt,
        },
      };
    } catch (error) {
      console.error('[TrackTraceEngine] Timeline error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify QR code authenticity (public endpoint)
   * @param {String} qrCodeId - QR code identifier
   * @returns {Promise<Object>} Verification result
   */
  async verifyQRCode(qrCodeId) {
    try {
      if (!this.initialized) {
        throw new Error('TrackTraceEngine not initialized');
      }

      const trackTrace = await this.trackTraces.findOne({ qrCodeId });

      if (!trackTrace) {
        return {
          success: false,
          verified: false,
          error: 'Invalid QR Code',
        };
      }

      // Get activity count
      const activityCount = await this.activities.countDocuments({ qrCodeId });

      return {
        success: true,
        verified: true,
        data: {
          qrCodeId,
          farmName: trackTrace.farmName,
          cropType: trackTrace.cropType,
          status: trackTrace.status,
          generatedAt: trackTrace.createdAt,
          lastActivity: trackTrace.lastActivity,
          lastActivityDate: trackTrace.lastActivityDate,
          totalActivities: activityCount,
          verifiedAt: new Date(),
        },
      };
    } catch (error) {
      console.error('[TrackTraceEngine] Verification error:', error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Get analytics for track & trace system
   * @param {Object} filters - Date range, farm, etc.
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(filters = {}) {
    try {
      if (!this.initialized) {
        throw new Error('TrackTraceEngine not initialized');
      }

      const query = {};

      if (filters.farmerId) {
        query.farmerId = filters.farmerId;
      }

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      const totalQRCodes = await this.trackTraces.countDocuments(query);
      const activeQRCodes = await this.trackTraces.countDocuments({
        ...query,
        status: 'active',
      });
      const totalActivities = await this.activities.countDocuments(
        filters.farmerId ? { 'performedBy.userId': filters.farmerId } : {}
      );

      // Activity types breakdown
      const activityTypes = await this.activities
        .aggregate([
          filters.farmerId
            ? { $match: { 'performedBy.userId': filters.farmerId } }
            : { $match: {} },
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      return {
        success: true,
        data: {
          totalQRCodes,
          activeQRCodes,
          totalActivities,
          activityTypes: activityTypes.map(a => ({
            type: a._id,
            count: a.count,
          })),
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      console.error('[TrackTraceEngine] Analytics error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update QR code status
   * @param {String} qrCodeId - QR code identifier
   * @param {String} status - New status (active, completed, revoked)
   * @returns {Promise<Object>} Update result
   */
  async updateStatus(qrCodeId, status) {
    try {
      if (!this.initialized) {
        throw new Error('TrackTraceEngine not initialized');
      }

      const validStatuses = ['active', 'completed', 'revoked'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const result = await this.trackTraces.updateOne(
        { qrCodeId },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new Error(`QR Code not found: ${qrCodeId}`);
      }

      return {
        success: true,
        message: `Status updated to: ${status}`,
      };
    } catch (error) {
      console.error('[TrackTraceEngine] Status update error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = TrackTraceEngine;
