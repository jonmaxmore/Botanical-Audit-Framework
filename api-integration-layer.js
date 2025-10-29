/**
 * 🔌 GACP API Integration Layer - Unified API Management
 * รวมการเชื่อมต่อ API ทุกระบบในที่เดียว พร้อม Error Handling และ Caching
 *
 * Features:
 * - Unified API endpoints for all systems
 * - Automatic error handling and retry logic
 * - Response caching and optimization
 * - Real-time data synchronization
 * - Comprehensive logging and monitoring
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
const redis = require('redis');
const { body, validationResult } = require('express-validator');

// Import all system services
const FarmManagementService = require('./apps/backend/modules/farm-management/services/farm-management.service');
const SOPWizardSystem = require('./business-logic/gacp-sop-wizard-system');
const TrackTraceService = require('./apps/backend/modules/track-trace/services/track-trace.service');
const GACPSurveySystem = require('./business-logic/gacp-survey-system');
const GACPStandardsComparisonSystem = require('./business-logic/gacp-standards-comparison-system');
const GACPAIAssistantSystem = require('./business-logic/gacp-ai-assistant-system');
const DatabaseManager = require('./config/mongodb-manager');

class GACPAPIIntegrationLayer {
  constructor() {
    this.app = express();
    this.port = process.env.GACP_API_PORT || 4000;
    this.cache = null;
    this.logger = this.setupLogger();

    // Initialize services
    this.farmService = new FarmManagementService();
    this.sopWizard = new SOPWizardSystem();
    this.trackTraceService = new TrackTraceService();
    this.surveySystem = new GACPSurveySystem();
    this.standardsComparison = new GACPStandardsComparisonSystem();
    this.aiAssistant = new GACPAIAssistantSystem();
    this.db = new DatabaseManager();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'gacp-api-integration' },
      transports: [
        new winston.transports.File({ filename: 'logs/gacp-api-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/gacp-api-combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(compression());

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', this.handleHealthCheck.bind(this));

    // Farm Management API Routes
    this.setupFarmManagementRoutes();

    // SOP Wizard API Routes
    this.setupSOPWizardRoutes();

    // Track & Trace API Routes
    this.setupTrackTraceRoutes();

    // Survey System API Routes
    this.setupSurveyRoutes();

    // Standards Comparison API Routes
    this.setupStandardsComparisonRoutes();

    // AI Assistant API Routes
    this.setupAIAssistantRoutes();

    // Dashboard API Routes
    this.setupDashboardRoutes();

    // Unified Search API
    this.setupSearchRoutes();
  }

  setupFarmManagementRoutes() {
    const router = express.Router();

    // Get all farms for user
    router.get(
      '/farms/:userId',
      this.asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const farms = await this.farmService.getFarmsByUser(userId);

        res.json({
          success: true,
          data: farms,
          timestamp: new Date().toISOString()
        });
      })
    );

    // Create new farm
    router.post(
      '/farms',
      [
        body('name').notEmpty().withMessage('Farm name is required'),
        body('userId').notEmpty().withMessage('User ID is required'),
        body('location').isObject().withMessage('Location object is required')
      ],
      this.asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            errors: errors.array()
          });
        }

        const farm = await this.farmService.createFarm(req.body);

        // Log activity
        this.logger.info('Farm created', { farmId: farm.id, userId: req.body.userId });

        res.status(201).json({
          success: true,
          data: farm,
          message: 'Farm created successfully'
        });
      })
    );

    // Record farm activity
    router.post(
      '/farms/:farmId/activities',
      [
        body('type').notEmpty().withMessage('Activity type is required'),
        body('phase').notEmpty().withMessage('Activity phase is required')
      ],
      this.asyncHandler(async (req, res) => {
        const { farmId } = req.params;
        const activity = await this.farmService.recordActivity(farmId, req.body);

        // Trigger SOP compliance check
        const sopSession = await this.sopWizard.getActiveSession(req.body.userId, farmId);
        if (sopSession) {
          await this.sopWizard.recordActivity(sopSession.sessionId, {
            activityType: req.body.type,
            phase: req.body.phase,
            data: req.body,
            completedAt: new Date()
          });
        }

        res.json({
          success: true,
          data: activity,
          sopUpdated: !!sopSession
        });
      })
    );

    // Get farm dashboard data
    router.get(
      '/dashboard/:userId',
      this.asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const cacheKey = `farm-dashboard-${userId}`;

        // Try cache first
        let data = await this.getFromCache(cacheKey);
        if (!data) {
          data = await this.farmService.getDashboardData(userId);
          await this.setCache(cacheKey, data, 300); // Cache for 5 minutes
        }

        res.json({
          success: true,
          data,
          cached: !!data.fromCache
        });
      })
    );

    this.app.use('/api/farm-management', router);
  }

  setupSOPWizardRoutes() {
    const router = express.Router();

    // Start new SOP session
    router.post(
      '/sessions',
      [
        body('userId').notEmpty().withMessage('User ID is required'),
        body('farmId').notEmpty().withMessage('Farm ID is required')
      ],
      this.asyncHandler(async (req, res) => {
        const { userId, farmId } = req.body;
        const session = await this.sopWizard.startSession(userId, farmId);

        this.logger.info('SOP session started', { sessionId: session.sessionId, userId, farmId });

        res.status(201).json({
          success: true,
          data: session,
          message: 'SOP session started successfully'
        });
      })
    );

    // Get active session
    router.get(
      '/sessions/:userId/:farmId',
      this.asyncHandler(async (req, res) => {
        const { userId, farmId } = req.params;
        const session = await this.sopWizard.getActiveSession(userId, farmId);

        res.json({
          success: true,
          data: session
        });
      })
    );

    // Record SOP activity
    router.post(
      '/sessions/:sessionId/activities',
      [
        body('activityType').notEmpty().withMessage('Activity type is required'),
        body('phase').notEmpty().withMessage('Phase is required')
      ],
      this.asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        const result = await this.sopWizard.recordActivity(sessionId, req.body);

        res.json({
          success: true,
          data: result,
          message: 'Activity recorded successfully'
        });
      })
    );

    // Get SOP dashboard data
    router.get(
      '/dashboard/:userId',
      this.asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const data = await this.sopWizard.getUserStatistics(userId);

        res.json({
          success: true,
          data
        });
      })
    );

    this.app.use('/api/sop', router);
  }

  setupTrackTraceRoutes() {
    const router = express.Router();

    // Generate QR code for batch
    router.post(
      '/batches/:batchId/qr',
      this.asyncHandler(async (req, res) => {
        const { batchId } = req.params;
        const qrData = await this.trackTraceService.generateQRCode(batchId);

        res.json({
          success: true,
          data: qrData
        });
      })
    );

    // Track batch movement
    router.post(
      '/batches/:batchId/track',
      [
        body('stage').notEmpty().withMessage('Stage is required'),
        body('location').isObject().withMessage('Location is required')
      ],
      this.asyncHandler(async (req, res) => {
        const { batchId } = req.params;
        const trackingUpdate = await this.trackTraceService.updateTrackingStage(batchId, req.body);

        res.json({
          success: true,
          data: trackingUpdate
        });
      })
    );

    // Get statistics
    router.get(
      '/statistics/:userId',
      this.asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const stats = await this.trackTraceService.getUserStatistics(userId);

        res.json({
          success: true,
          data: stats
        });
      })
    );

    this.app.use('/api/track-trace', router);
  }

  setupSurveyRoutes() {
    const router = express.Router();

    // Create new survey
    router.post(
      '/surveys',
      this.asyncHandler(async (req, res) => {
        const { templateId, customization } = req.body;
        const survey = await this.surveySystem.createSurvey(templateId, customization);

        res.status(201).json({
          success: true,
          data: survey,
          message: 'Survey created successfully'
        });
      })
    );

    // Get survey templates
    router.get(
      '/templates',
      this.asyncHandler(async (req, res) => {
        const templates = this.surveySystem.getSurveyTemplates();

        res.json({
          success: true,
          data: templates
        });
      })
    );

    // Start survey response
    router.post(
      '/responses/start',
      [
        body('surveyId').notEmpty().withMessage('Survey ID is required'),
        body('respondentId').notEmpty().withMessage('Respondent ID is required'),
        body('language').optional().isIn(['th', 'en']).withMessage('Language must be th or en')
      ],
      this.asyncHandler(async (req, res) => {
        const { surveyId, respondentId, language } = req.body;
        const response = await this.surveySystem.startSurveyResponse(
          surveyId,
          respondentId,
          language
        );

        res.status(201).json({
          success: true,
          data: response,
          message: 'Survey response started successfully'
        });
      })
    );

    // Submit step response
    router.post(
      '/responses/:responseId/steps/:stepId',
      [body().isObject().withMessage('Step data is required')],
      this.asyncHandler(async (req, res) => {
        const { responseId, stepId } = req.params;
        const result = await this.surveySystem.submitStepResponse(
          responseId,
          parseInt(stepId),
          req.body
        );

        res.json({
          success: true,
          data: result,
          message: result.isComplete
            ? 'Survey completed successfully'
            : 'Step submitted successfully'
        });
      })
    );

    // Get survey statistics
    router.get(
      '/statistics',
      this.asyncHandler(async (req, res) => {
        const stats = await this.surveySystem.getSystemStatistics();

        res.json({
          success: true,
          data: stats
        });
      })
    );

    // Get regional analytics
    router.get(
      '/analytics/:region?',
      this.asyncHandler(async (req, res) => {
        const { region } = req.params;
        const analytics = await this.surveySystem.getRegionalAnalytics(region);

        res.json({
          success: true,
          data: analytics
        });
      })
    );

    // Generate survey report
    router.get(
      '/surveys/:surveyId/report',
      this.asyncHandler(async (req, res) => {
        const { surveyId } = req.params;
        const report = await this.surveySystem.generateSurveyReport(surveyId);

        res.json({
          success: true,
          data: report
        });
      })
    );

    // Export survey data
    router.get(
      '/surveys/:surveyId/export',
      this.asyncHandler(async (req, res) => {
        const { surveyId } = req.params;
        const { format = 'json' } = req.query;
        const exportData = await this.surveySystem.exportSurveyData(surveyId, format);

        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=survey_${surveyId}.${format}`);
        res.send(exportData);
      })
    );

    this.app.use('/api/survey', router);
  }

  setupStandardsComparisonRoutes() {
    const router = express.Router();

    // Get available standards
    router.get(
      '/standards',
      this.asyncHandler(async (req, res) => {
        const standards = this.standardsComparison.getAvailableStandards();

        res.json({
          success: true,
          data: standards
        });
      })
    );

    // Get standard details
    router.get(
      '/standards/:standardId',
      this.asyncHandler(async (req, res) => {
        const { standardId } = req.params;
        const standard = this.standardsComparison.getStandardById(standardId);

        if (!standard) {
          return res.status(404).json({
            success: false,
            message: 'Standard not found'
          });
        }

        res.json({
          success: true,
          data: standard
        });
      })
    );

    // Compare two standards
    router.post(
      '/compare',
      [
        body('standardA').notEmpty().withMessage('Standard A ID is required'),
        body('standardB').notEmpty().withMessage('Standard B ID is required'),
        body('options').optional().isObject()
      ],
      this.asyncHandler(async (req, res) => {
        const { standardA, standardB, options } = req.body;
        const comparison = await this.standardsComparison.compareStandards(
          standardA,
          standardB,
          options
        );

        res.json({
          success: true,
          data: comparison,
          message: 'Standards comparison completed successfully'
        });
      })
    );

    // Get comparison by ID
    router.get(
      '/comparisons/:comparisonId',
      this.asyncHandler(async (req, res) => {
        const { comparisonId } = req.params;
        const comparison = this.standardsComparison.getComparisonById(comparisonId);

        if (!comparison) {
          return res.status(404).json({
            success: false,
            message: 'Comparison not found'
          });
        }

        res.json({
          success: true,
          data: comparison
        });
      })
    );

    // Search standards
    router.get(
      '/search',
      this.asyncHandler(async (req, res) => {
        const { q: query, products, minPoints, maxPoints } = req.query;
        const filters = {};

        if (products) {
          filters.applicableProducts = products.split(',');
        }
        if (minPoints) {
          filters.minPoints = parseInt(minPoints);
        }
        if (maxPoints) {
          filters.maxPoints = parseInt(maxPoints);
        }

        const results = await this.standardsComparison.searchStandards(query, filters);

        res.json({
          success: true,
          data: results,
          query: query || null,
          filters
        });
      })
    );

    // Find similar requirements
    router.get(
      '/requirements/:standardId/:requirementId/similar',
      this.asyncHandler(async (req, res) => {
        const { standardId, requirementId } = req.params;
        const { threshold = 0.7 } = req.query;

        const similarRequirements = await this.standardsComparison.findSimilarRequirements(
          requirementId,
          standardId,
          parseFloat(threshold)
        );

        res.json({
          success: true,
          data: similarRequirements
        });
      })
    );

    // Generate compliance profile
    router.post(
      '/compliance-profile',
      [
        body('organizationId').notEmpty().withMessage('Organization ID is required'),
        body('currentCompliance').isObject().withMessage('Current compliance data is required')
      ],
      this.asyncHandler(async (req, res) => {
        const { organizationId, currentCompliance } = req.body;
        const profile = await this.standardsComparison.generateComplianceProfile(
          organizationId,
          currentCompliance
        );

        res.status(201).json({
          success: true,
          data: profile,
          message: 'Compliance profile generated successfully'
        });
      })
    );

    // Export comparison
    router.get(
      '/comparisons/:comparisonId/export',
      this.asyncHandler(async (req, res) => {
        const { comparisonId } = req.params;
        const { format = 'json' } = req.query;

        const exportData = await this.standardsComparison.exportComparison(comparisonId, format);

        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=comparison_${comparisonId}.${format}`
        );
        res.send(exportData);
      })
    );

    // Get system statistics
    router.get(
      '/statistics',
      this.asyncHandler(async (req, res) => {
        const stats = await this.standardsComparison.getSystemStatistics();

        res.json({
          success: true,
          data: stats
        });
      })
    );

    this.app.use('/api/standards-comparison', router);
  }

  setupAIAssistantRoutes() {
    const router = express.Router();

    // Get AI guidance
    router.post(
      '/guidance',
      [
        body('query').notEmpty().withMessage('Query is required'),
        body('context').optional().isObject()
      ],
      this.asyncHandler(async (req, res) => {
        const guidance = await this.aiAssistant.getGuidance(req.body.query, req.body.context);

        res.json({
          success: true,
          data: guidance
        });
      })
    );

    // Validate SOP activity
    router.post(
      '/validate-sop',
      [
        body('activityType').notEmpty().withMessage('Activity type is required'),
        body('data').isObject().withMessage('Activity data is required')
      ],
      this.asyncHandler(async (req, res) => {
        const validation = await this.aiAssistant.validateSOPActivity(
          req.body.activityType,
          req.body.data
        );

        res.json({
          success: true,
          data: validation
        });
      })
    );

    this.app.use('/api/ai-assistant', router);
  }

  setupDashboardRoutes() {
    const router = express.Router();

    // Get unified dashboard data
    router.get(
      '/:userId',
      this.asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const cacheKey = `dashboard-${userId}`;

        // Try cache first
        let data = await this.getFromCache(cacheKey);
        if (!data) {
          // Fetch data from all systems in parallel
          const [farmData, sopData, surveyData, trackTraceData, standardsData] = await Promise.all([
            this.farmService.getDashboardData(userId),
            this.sopWizard.getUserStatistics(userId),
            this.surveySystem.getSystemStatistics(),
            this.trackTraceService.getUserStatistics(userId),
            this.standardsComparison.getSystemStatistics()
          ]);

          data = {
            farm: farmData,
            sop: sopData,
            survey: surveyData,
            trackTrace: trackTraceData,
            standards: standardsData,
            lastUpdated: new Date().toISOString()
          };

          await this.setCache(cacheKey, data, 300); // Cache for 5 minutes
        }

        res.json({
          success: true,
          data,
          cached: !!data.fromCache
        });
      })
    );

    // Get notifications
    router.get(
      '/notifications/:userId',
      this.asyncHandler(async (req, res) => {
        const { userId } = req.params;

        // Aggregate notifications from all systems
        const notifications = [];

        // Check for pending SOP activities
        const sopSession = await this.sopWizard.getActiveSession(userId);
        if (sopSession && sopSession.pendingActivities?.length > 0) {
          notifications.push({
            type: 'warning',
            title: 'Pending SOP Activities',
            message: `You have ${sopSession.pendingActivities.length} pending activities`,
            timestamp: new Date().toISOString()
          });
        }

        // Check for compliance issues
        const complianceScore = await this.sopWizard.calculateComplianceScore(userId);
        if (complianceScore < 70) {
          notifications.push({
            type: 'warning',
            title: 'Low Compliance Score',
            message: `Current compliance: ${complianceScore}%. Improve to meet GACP standards.`,
            timestamp: new Date().toISOString()
          });
        }

        res.json({
          success: true,
          data: { notifications }
        });
      })
    );

    this.app.use('/api/dashboard', router);
  }

  setupSearchRoutes() {
    const router = express.Router();

    // Unified search across all systems
    router.get(
      '/',
      this.asyncHandler(async (req, res) => {
        const { q: query, type, userId } = req.query;

        if (!query) {
          return res.status(400).json({
            success: false,
            message: 'Search query is required'
          });
        }

        const results = {};

        // Search farms if requested or no type specified
        if (!type || type === 'farms') {
          results.farms = await this.farmService.searchFarms(query, userId);
        }

        // Search SOP activities
        if (!type || type === 'sop') {
          results.sopActivities = await this.sopWizard.searchActivities(query, userId);
        }

        // Search track & trace batches
        if (!type || type === 'batches') {
          results.batches = await this.trackTraceService.searchBatches(query, userId);
        }

        res.json({
          success: true,
          data: results,
          query
        });
      })
    );

    this.app.use('/api/search', router);
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API endpoint not found'
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      this.logger.error('API Error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      const isDevelopment = process.env.NODE_ENV === 'development';

      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(isDevelopment && { stack: error.stack })
      });
    });
  }

  // Utility functions
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  async handleHealthCheck(req, res) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        cache: 'unknown',
        ai: 'unknown'
      }
    };

    try {
      // Check database connection
      await this.db.testConnection();
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }

    try {
      // Check cache connection
      if (this.cache) {
        await this.cache.ping();
        health.services.cache = 'healthy';
      }
    } catch (error) {
      health.services.cache = 'unhealthy';
    }

    try {
      // Check AI service
      await this.aiAssistant.healthCheck();
      health.services.ai = 'healthy';
    } catch (error) {
      health.services.ai = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  }

  async getFromCache(key) {
    if (!this.cache) return null;
    try {
      const data = await this.cache.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.warn('Cache get error', { key, error: error.message });
      return null;
    }
  }

  async setCache(key, data, ttl = 300) {
    if (!this.cache) return;
    try {
      await this.cache.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      this.logger.warn('Cache set error', { key, error: error.message });
    }
  }

  async initialize() {
    try {
      // Initialize database
      await this.db.connect();
      this.logger.info('Database connected successfully');

      // Initialize Redis cache (optional)
      if (process.env.REDIS_URL) {
        this.cache = redis.createClient({ url: process.env.REDIS_URL });
        await this.cache.connect();
        this.logger.info('Redis cache connected successfully');
      }

      // Initialize AI Assistant
      await this.aiAssistant.initialize();
      this.logger.info('AI Assistant initialized successfully');

      return true;
    } catch (error) {
      this.logger.error('Initialization failed', { error: error.message });
      throw error;
    }
  }

  async start() {
    try {
      await this.initialize();

      this.server = this.app.listen(this.port, () => {
        this.logger.info(`🚀 GACP API Integration Layer running on port ${this.port}`);
        this.logger.info(`📊 Health check available at http://localhost:${this.port}/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));
    } catch (error) {
      this.logger.error('Failed to start server', { error: error.message });
      process.exit(1);
    }
  }

  async shutdown() {
    this.logger.info('Shutting down GACP API Integration Layer...');

    if (this.server) {
      this.server.close();
    }

    if (this.cache) {
      await this.cache.quit();
    }

    await this.db.disconnect();

    this.logger.info('Shutdown complete');
    process.exit(0);
  }
}

// Export for use in other modules
module.exports = GACPAPIIntegrationLayer;

// Start server if this file is run directly
if (require.main === module) {
  const apiLayer = new GACPAPIIntegrationLayer();
  apiLayer.start().catch(console.error);
}
