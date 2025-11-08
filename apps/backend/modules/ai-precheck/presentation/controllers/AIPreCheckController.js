/**
 * AI Pre-Check Controller
 *
 * HTTP request handlers for AI Pre-Check endpoints
 */

class AIPreCheckController {
  constructor({ documentValidationService, riskScoringService, aiConfigRepository, logger }) {
    this.documentValidationService = documentValidationService;
    this.riskScoringService = riskScoringService;
    this.aiConfigRepository = aiConfigRepository;
    this.logger = logger;
  }

  /**
   * Validate application (POST /api/ai-precheck/validate)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async validateApplication(req, res) {
    const startTime = Date.now();

    try {
      const { applicationId } = req.body;

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: 'Application ID is required',
        });
      }

      this.logger.info('AI Pre-Check validation started', {
        applicationId,
        userId: req.user?._id,
      });

      // TODO: Fetch application from database
      // const application = await this.applicationRepository.findById(applicationId);

      // Mock application for now
      const application = {
        _id: applicationId,
        farmer: {
          name: 'สมชาย ใจดี',
          nationalId: '1234567890123',
          phone: '081-234-5678',
          address: 'จ.เชียงใหม่',
          history: {
            previousCertified: false,
            previousRejected: false,
            violations: [],
          },
        },
        farm: {
          location: 'ต.แม่เหียะ อ.เมือง จ.เชียงใหม่',
          size: 10,
          province: 'เชียงใหม่',
          isRemote: false,
        },
        documents: {
          nationalId: 'doc-123.pdf',
          landDeed: 'doc-456.pdf',
          farmPhotos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
        },
        cropType: 'cannabis',
        paymentStatus: 'PAID',
      };

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      // Perform validation
      const validationResult =
        await this.documentValidationService.validateApplication(application);

      // Calculate processing time
      const processingTimeMs = Date.now() - startTime;

      // Update AI config performance metrics
      // TODO: Update after human review confirms accuracy
      // await this.updatePerformanceMetrics(validationResult);

      this.logger.info('AI Pre-Check validation completed', {
        applicationId,
        riskLevel: validationResult.riskLevel,
        processingTimeMs,
      });

      res.json({
        success: true,
        message: 'AI Pre-Check completed',
        data: {
          ...validationResult,
          processingTimeMs,
        },
      });
    } catch (error) {
      this.logger.error('AI Pre-Check validation failed', {
        applicationId: req.body.applicationId,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: 'AI Pre-Check validation failed',
        error: error.message,
      });
    }
  }

  /**
   * Get AI configuration (GET /api/ai-precheck/config)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getConfig(req, res) {
    try {
      const config = await this.aiConfigRepository.getByModule('PRE_CHECK');

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'AI Pre-Check configuration not found',
        });
      }

      this.logger.info('AI config retrieved', {
        module: 'PRE_CHECK',
        userId: req.user?._id,
      });

      res.json({
        success: true,
        data: {
          enabled: config.enabled,
          thresholds: config.config.thresholds,
          weights: config.config.weights,
          performance: {
            accuracy: config.performance.accuracy,
            totalProcessed: config.performance.totalProcessed,
            precision: config.precision,
            recall: config.recall,
            f1Score: config.f1Score,
          },
          version: config.version,
          lastUpdated: config.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error('Failed to get AI config', {
        error: error.message,
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get configuration',
        error: error.message,
      });
    }
  }

  /**
   * Update AI configuration (PUT /api/ai-precheck/config)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async updateConfig(req, res) {
    try {
      const { thresholds, weights, enabled } = req.body;

      // Validate weights sum to 100
      if (weights) {
        const sum = Object.values(weights).reduce((acc, val) => acc + val, 0);
        if (sum < 99 || sum > 101) {
          return res.status(400).json({
            success: false,
            message: 'Weights must sum to 100',
          });
        }
      }

      const updates = {};
      if (thresholds) {
        updates['config.thresholds'] = thresholds;
      }
      if (weights) {
        updates['config.weights'] = weights;
      }
      if (enabled !== undefined) {
        updates.enabled = enabled;
      }

      const config = await this.aiConfigRepository.updateConfig('PRE_CHECK', updates);

      this.logger.info('AI config updated', {
        module: 'PRE_CHECK',
        userId: req.user?._id,
        updates: Object.keys(updates),
      });

      res.json({
        success: true,
        message: 'Configuration updated',
        data: {
          enabled: config.enabled,
          thresholds: config.config.thresholds,
          weights: config.config.weights,
          version: config.version,
        },
      });
    } catch (error) {
      this.logger.error('Failed to update AI config', {
        error: error.message,
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update configuration',
        error: error.message,
      });
    }
  }

  /**
   * Get AI Pre-Check statistics (GET /api/ai-precheck/statistics)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // TODO: Query real statistics from database
      // For now, return mock data

      const stats = {
        totalProcessed: 1250,
        byRiskLevel: {
          LOW: 650,
          MEDIUM: 450,
          HIGH: 150,
        },
        byRecommendation: {
          FAST_TRACK: 600,
          STANDARD_REVIEW: 500,
          MANUAL_REVIEW: 120,
          REJECT: 30,
        },
        avgProcessingTime: '2.3 seconds',
        accuracy: 94.5,
        topFlags: [
          { type: 'MISSING_DOCUMENTS', count: 85 },
          { type: 'DOCUMENT_QUALITY_ISSUES', count: 62 },
          { type: 'INCOMPLETE_PROFILE', count: 48 },
          { type: 'PREVIOUS_REJECTION', count: 35 },
          { type: 'NAME_MISMATCH', count: 22 },
        ],
        performance: {
          precision: 95.2,
          recall: 93.8,
          f1Score: 94.5,
        },
        timeRange: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate || new Date(),
        },
      };

      this.logger.info('AI statistics retrieved', {
        userId: req.user?._id,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      this.logger.error('Failed to get AI statistics', {
        error: error.message,
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message,
      });
    }
  }

  /**
   * Validate document quality (POST /api/ai-precheck/validate-document)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async validateDocument(req, res) {
    try {
      const { document, documentType } = req.body;

      if (!document || !documentType) {
        return res.status(400).json({
          success: false,
          message: 'Document and document type are required',
        });
      }

      // TODO: Implement document validation
      // const validation = await this.documentValidationService.validateSingleDocument(document, documentType);

      // Mock response for now
      const validation = {
        documentType,
        quality: {
          passed: true,
          score: 92,
          issues: [],
        },
        extracted: {
          confidence: 0.95,
          data: {
            name: 'สมชาย ใจดี',
            id: '1234567890123',
          },
        },
      };

      this.logger.info('Document validated', {
        documentType,
        userId: req.user?._id,
      });

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      this.logger.error('Document validation failed', {
        error: error.message,
      });

      res.status(500).json({
        success: false,
        message: 'Document validation failed',
        error: error.message,
      });
    }
  }

  /**
   * Update performance metrics after human review
   * @param {string} applicationId
   * @param {boolean} wasCorrect
   */
  async updatePerformanceMetrics(applicationId, wasCorrect) {
    try {
      const config = await this.aiConfigRepository.getByModule('PRE_CHECK');

      if (config) {
        await config.updatePerformance(
          wasCorrect,
          !wasCorrect, // False positive
          !wasCorrect, // False negative
        );

        this.logger.info('Performance metrics updated', {
          applicationId,
          wasCorrect,
          accuracy: config.performance.accuracy,
        });
      }
    } catch (error) {
      this.logger.error('Failed to update performance metrics', {
        applicationId,
        error: error.message,
      });
    }
  }
}

module.exports = AIPreCheckController;
