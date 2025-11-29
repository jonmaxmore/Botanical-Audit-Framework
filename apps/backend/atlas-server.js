/**
 * GACP Platform - Atlas MongoDB Server
 * Production-ready server with MongoDB Atlas connection
 *
 * Features:
 * - MongoDB Atlas connection
 * - Business logic services
 * - Authentication & authorization
 * - File upload support
 * - Health monitoring
 * - Model caching fix
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 */

require('dotenv').config();

// Initialize AWS Secrets Manager (must be before other imports)
const secretsManager = require('./config/secrets-manager');
const { validateEnvironment } = require('./config/env-validator');

const express = require('express');
const cors = require('cors');
const { logger } = require('./shared');
const appLogger = logger.createLogger('atlas-server');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import MongoDB Manager
const mongoManager = require('./config/mongodb-manager');

// Ensure MongoDB is connected when running inside Jest tests
if (process.env.NODE_ENV === 'test') {
  mongoManager
    .connect()
    .then(() => appLogger.info('✅ MongoDB connected for test environment'))
    .catch(error =>
      appLogger.error('❌ Failed to connect MongoDB for tests:', error.message || error),
    );
}

// Import GACP Business Logic and Services
const {
  GACPApplicationStatus,
  GACPCriticalControlPoints,
  GACPScoringSystem,
} = require('./models/gacp-business-logic');

const {
  GACPWorkflowEngine,
} = require('./modules/application-workflow/domain/gacp-workflow-engine');
const GACPEnhancedInspectionService = require('./services/gacp-enhanced-inspection');

// Import Health Monitoring Service
const HealthMonitoringService = require('./services/health-monitoring');

// Clear mongoose cache to prevent model overwrite errors
mongoose.deleteModel = function (modelName) {
  delete mongoose.models[modelName];
  delete mongoose.modelSchemas[modelName];
};

// Clear any existing models
if (mongoose.models.User) {
  mongoose.deleteModel('User');
}
if (mongoose.models.Application) {
  mongoose.deleteModel('Application');
}
if (mongoose.models.Inspection) {
  mongoose.deleteModel('Inspection');
}
if (mongoose.models.Certificate) {
  mongoose.deleteModel('Certificate');
}

const app = express();
const port = process.env.PORT || 3005; // Different port to avoid conflicts

// Initialize GACP Business Logic Services
const workflowEngine = new GACPWorkflowEngine();
const inspectionService = new GACPEnhancedInspectionService();

appLogger.info('🚀 GACP Atlas Server Starting...');
appLogger.info('🌐 Using MongoDB Atlas');
appLogger.info('📋 GACP Business Logic Loaded');
appLogger.info('⚙️  Workflow Engine Initialized');
appLogger.info('🔍 Enhanced Inspection Service Ready');

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Initialize Health Monitoring Service
const healthMonitor = new HealthMonitoringService();
const healthRoutes = healthMonitor.getRouteHandlers();

// Health monitoring endpoints
app.get('/health', healthRoutes.health);
app.get('/status', healthRoutes.status);
app.get('/version', healthRoutes.version);

// Static files serving
app.use(express.static('public'));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await mongoManager.healthCheck();

  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0-atlas',
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    mongodb: {
      connected: mongoManager.isConnected(),
      status: mongoManager.getStatus(),
    },
  };

  res.json(health);
});

// ============================================================================
// API DOCUMENTATION & RATE LIMITING
// ============================================================================

// Import and mount Swagger UI for API documentation
const { mountSwagger, createDocsIndex } = require('./modules/auth-farmer/presentation/swagger');
try {
  mountSwagger(app, '/api/docs/auth-farmer');
  createDocsIndex(app);
  appLogger.info('✅ Swagger UI mounted at /api/docs/auth-farmer');
  appLogger.info('📚 API docs index available at /docs');
} catch (error) {
  appLogger.warn('⚠️  Failed to mount Swagger UI:', error.message);
}

// Rate limiting for auth endpoints
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply strict rate limiting to sensitive auth routes
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit to 20 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
});

// Rate limiting - Express 5 compatible path patterns
app.use('/api/auth', authLimiter);
app.use(/^\/api\/auth\/[^/]+\/login$/, strictAuthLimiter); // Match /api/auth/:role/login
app.use(/^\/api\/auth\/[^/]+\/register$/, authLimiter); // Match /api/auth/:role/register
appLogger.info('✅ Rate limiting applied to /api/auth/* routes');

// ============================================================================
// ROUTES
// ============================================================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GACP Certification System API (Atlas)',
    version: '1.0.0-atlas',
    description: 'Production API for GACP certification system with MongoDB Atlas',
    database: 'MongoDB Atlas',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health - System health check',
      api: '/api - API documentation',
      auth: '/api/auth - Authentication endpoints',
      applications: '/api/applications - Application management',
      dashboard: '/api/dashboard - Dashboard data',
    },
    message: 'Atlas server ready! Frontend: http://localhost:3001',
    demo: 'Live demo available at /demo.html',
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'GACP Atlas API',
    version: '1.0.0-atlas',
    mode: 'atlas',
  database: mongoManager.isConnected() ? 'Connected' : 'Disconnected',
    monitoring: 'Available at /monitoring-dashboard.html',
    endpoints: {
      'GET /health': 'Health check with database status',
      'GET /api/auth/me': 'Get current user (requires JWT)',
      'POST /api/auth/login': 'User login',
      'POST /api/auth/register': 'User registration',
      'GET /api/applications': 'List applications (requires auth)',
      'POST /api/applications': 'Create application (requires auth)',
      'GET /api/applications/:id': 'Get application details (requires auth)',
      'GET /api/dashboard/stats': 'Dashboard statistics (requires auth)',
    },
    authentication: 'JWT Bearer Token',
    example_request: {
      login: {
        url: '/api/auth/login',
        method: 'POST',
        body: {
          email: 'farmer@example.com',
          password: 'password123',
        },
      },
    },
  });
});

// GACP Business Logic API Endpoints

// Get GACP Workflow Information
app.get('/api/gacp/workflow', (req, res) => {
  const workflowGraph = workflowEngine.getWorkflowGraph();

  res.json({
    success: true,
    data: {
      applicationStatuses: Object.keys(GACPApplicationStatus),
      workflowStates: workflowGraph.nodes.length,
      transitions: workflowGraph.edges.length,
      framework: 'Thai FDA GACP Certification Process (2018)',
      compliance: ['WHO-GACP', 'FAO-Guidelines', 'Thai-FDA', 'ASEAN-TM'],
      workflowGraph: workflowGraph,
    },
    message: 'GACP workflow information retrieved',
  });
});

// Get Critical Control Points Framework
app.get('/api/gacp/ccps', (req, res) => {
  const ccpList = Object.entries(GACPCriticalControlPoints).map(([key, ccp]) => ({
    id: key,
    ...ccp,
    compliance_standards: ['WHO GACP 2003', 'Thai FDA 2018', 'FAO Guidelines'],
  }));

  res.json({
    success: true,
    data: {
      totalCCPs: ccpList.length,
      ccps: ccpList,
      scoringSystem: GACPScoringSystem,
      framework: '8 Critical Control Points for Medicinal Plants',
      methodology: 'HACCP-based Assessment',
    },
    message: 'GACP Critical Control Points framework retrieved',
  });
});

// Workflow Transition Validation
app.post('/api/gacp/workflow/transition', async (req, res) => {
  try {
    const { currentState, targetState, context, actor } = req.body;

    if (!currentState || !targetState || !actor) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: currentState, targetState, actor',
      });
    }

    // Validate transition using workflow engine
    const transitionResult = await workflowEngine.transitionTo(
      currentState,
      targetState,
      context || {},
      actor,
    );

    res.json({
      success: transitionResult.success,
      data: transitionResult,
      message: transitionResult.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Workflow transition validation failed',
      error: error.message,
    });
  }
});

// Get Available Transitions
app.post('/api/gacp/workflow/available-transitions', async (req, res) => {
  try {
    const { currentState, actor, context } = req.body;

    if (!currentState || !actor) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: currentState, actor',
      });
    }

    const availableTransitions = workflowEngine.getAvailableTransitions(
      currentState,
      actor,
      context || {},
    );

    const stateRequirements = workflowEngine.getStateRequirements(currentState);

    res.json({
      success: true,
      data: {
        currentState,
        availableTransitions,
        requirements: stateRequirements,
        actor: actor.role,
        timestamp: new Date(),
      },
      message: 'Available transitions retrieved',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get available transitions',
      error: error.message,
    });
  }
});

// Initialize GACP Inspection
app.post('/api/gacp/inspections/initialize', async (req, res) => {
  try {
    const { applicationId, inspector, scheduledDate } = req.body;

    if (!applicationId || !inspector || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: applicationId, inspector, scheduledDate',
      });
    }

    // Set database connection for inspection service
  inspectionService.db = mongoManager.isConnected() ? mongoose.connection.db : null;

    const result = await inspectionService.initializeInspection(
      applicationId,
      inspector,
      scheduledDate,
    );

    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Inspection initialization failed',
      error: error.message,
    });
  }
});

// Conduct CCP Assessment
app.post('/api/gacp/inspections/:inspectionId/ccp/:ccpId/assess', async (req, res) => {
  try {
    const { inspectionId, ccpId } = req.params;
    const { assessmentData, evidence } = req.body;

    if (!assessmentData) {
      return res.status(400).json({
        success: false,
        message: 'Assessment data required',
      });
    }

    // Set database connection for inspection service
  inspectionService.db = mongoManager.isConnected() ? mongoose.connection.db : null;

    const result = await inspectionService.conductCCPAssessment(
      inspectionId,
      ccpId,
      assessmentData,
      evidence || {},
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'CCP assessment failed',
      error: error.message,
    });
  }
});

// GACP Business Logic Test Endpoints
app.get('/api/gacp/test/score-calculation', (req, res) => {
  // Test score calculation with sample data
  const sampleCCPScores = {
    SEED_QUALITY: 85,
    SOIL_MANAGEMENT: 78,
    PEST_MANAGEMENT: 92,
    HARVESTING: 88,
    POST_HARVEST: 82,
    STORAGE_PACKAGING: 76,
    DOCUMENTATION: 94,
    PERSONNEL_TRAINING: 89,
  };

  const {
    calculateTotalScore,
    getCertificateLevel,
    validateCCPScores,
  } = require('./models/gacp-business-logic');

  const totalScore = calculateTotalScore(sampleCCPScores);
  const certificateLevel = getCertificateLevel(totalScore);
  const violations = validateCCPScores(sampleCCPScores);

  res.json({
    success: true,
    data: {
      ccpScores: sampleCCPScores,
      totalScore: totalScore,
      certificateLevel: certificateLevel,
      violations: violations,
      passed: violations.length === 0 && totalScore >= 75,
    },
    message: 'GACP score calculation test completed',
  });
});

app.get('/api/dashboard/test-stats', async (req, res) => {
  const dbHealth = await mongoManager.healthCheck();

  res.json({
    success: true,
    data: {
  totalApplications: mongoManager.isConnected() ? 'Loading from Atlas...' : 0,
  totalUsers: mongoManager.isConnected() ? 'Loading from Atlas...' : 0,
  totalInspections: mongoManager.isConnected() ? 'Loading from Atlas...' : 0,
  totalCertificates: mongoManager.isConnected() ? 'Loading from Atlas...' : 0,
      database_status: dbHealth.status,
      database_info: mongoManager.getStatus(),
      server_info: {
        port: port,
        version: '1.0.0-atlas',
        uptime: process.uptime(),
      },
    },
  });
});

// Database connection test
app.get('/api/db/test', async (req, res) => {
  try {
  if (mongoManager.isConnected()) {
      // Test basic database operations
      const collections = await mongoose.connection.db.listCollections().toArray();

      res.json({
        success: true,
        message: 'Database connection successful',
        database: mongoose.connection.db.databaseName,
        collections: collections.map(c => c.name),
        connection_info: mongoManager.getStatus(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Database not connected',
        status: mongoManager.getStatus(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
    });
  }
});

// ============================================================================
// AUTHENTICATION MODULES
// ============================================================================

// Mount Farmer Authentication Routes (Clean Architecture)
const createAuthFarmerModule = require('./modules/auth-farmer/container');
const farmerAuthModule = createAuthFarmerModule({
  database: mongoose.connection,
  jwtSecret: process.env.FARMER_JWT_SECRET || process.env.JWT_SECRET,
  jwtExpiresIn: '24h',
  bcryptSaltRounds: 12,
});
app.use('/api/auth/farmer', farmerAuthModule.router);
appLogger.info('✅ Farmer Auth routes mounted at /api/auth/farmer (Clean Architecture)');

// Mount DTAM Staff Authentication Routes
app.use('/api/auth-dtam', require('./modules/auth-dtam/routes/dtam-auth'));
appLogger.info('✅ DTAM Auth routes mounted at /api/auth-dtam');

// ============================================================================
// BUSINESS LOGIC MODULES
// ============================================================================

// Mount RHDA Analytics Routes
app.use('/api/rhda', require('./routes/rhda-analytics'));

// Mount GACP Business Logic Routes
app.use('/api/gacp', require('./routes/gacp-business-logic'));

// Mount Health Monitoring Routes
app.use('/api/monitoring', require('./routes/health-monitoring'));

// Mount API Documentation Routes
app.use('/api/docs', require('./routes/api-documentation'));

// ============================================================================
// AI & SMART FARMING MODULES
// ============================================================================

// Mount AI Fertilizer Recommendation Routes
app.use('/api/ai/fertilizer', require('./routes/ai/fertilizer.routes'));
app.use('/api/fertilizer-products', require('./routes/ai/fertilizer-products.routes'));
appLogger.info('✅ AI Fertilizer routes mounted');

// Mount Video Inspection Routes
app.use('/api/video', require('./routes/video-inspection.routes'));
app.use('/api', require('./routes/inspection-snapshots.routes'));
app.use('/api', require('./routes/inspection-report.routes'));
app.use('/api', require('./routes/inspection-scheduling.routes'));
app.use('/api', require('./routes/inspection-upcoming.routes'));
app.use('/api', require('./routes/inspection-kpi.routes'));
appLogger.info('✅ Video Inspection routes mounted');

// Mount PDF Export Routes
app.use('/api/pdf', require('./routes/pdf-export.routes'));
appLogger.info('✅ PDF Export routes mounted');

// ============================================================================
// MODULE INTEGRATIONS (Pending Configuration)
// ============================================================================
//
// The following modules require additional configuration and dependencies:
//
// 1. Farm Management Module
//    - Requires: farmService, auth middleware, mongoose models
//    - Routes: POST /api/farm/cycles, GET /api/farm/cycles
//    - Location: ./modules/farm-management/routes/farm.routes.js
//
// 2. Dashboard Module
//    - Requires: dashboardController, authMiddleware
//    - Routes: GET /api/dashboard/stats/realtime, GET /api/dashboard/:role
//    - Location: ./modules/dashboard/routes/dashboard.routes.js
//
// 3. Document Management Module
//    - Requires: documentController, authMiddleware
//    - Routes: POST /api/documents/upload, GET /api/documents/:id
//    - Location: ./modules/document/presentation/routes/
//
// 4. Certificate Management Module
//    - Requires: certificateService, authMiddleware
//    - Routes: GET /api/certificates/stats, POST /api/certificates/issue
//    - Location: ./modules/certificate-management/routes/certificate.routes.js
//
// 5. Payment Service Module (PromptPay)
//    - Requires: mongooseConnection, paymentRepository, applicationRepository
//    - Routes: POST /api/payments/create, POST /api/payments/webhook
//    - Location: ./modules/payment-service/
//    - Status: Complex dependencies - needs full initialization
//
// 6. Track & Trace Module (QR Codes)
//    - Requires: db, authenticateToken
//    - Routes: GET /api/track-trace/lookup/:batchCode, POST /api/track-trace/products
//    - Location: ./modules/track-trace/
//    - Status: Ready for integration
//
// 7. Cannabis Survey Module
//    - Requires: surveyController, authMiddleware
//    - Routes: POST /api/surveys/create, GET /api/surveys
//    - Location: ./modules/cannabis-survey/presentation/routes/survey.routes.js
//
// 8. Notification Service
//    - Requires: notificationService
//    - Routes: POST /api/notifications/send, GET /api/notifications/history
//    - Location: ./modules/notification-service/
//
// To integrate these modules, uncomment and configure the appropriate sections below:
//
// Example for Track & Trace:
// const { initializeTrackTrace } = require('./modules/track-trace-controller');
// const trackTrace = await initializeTrackTrace({
//   db: mongoManager.getDb(),
//   authenticateToken: require('./modules/shared').middleware.auth
// });
// app.use('/api/track-trace', trackTrace.router);
//
// ============================================================================

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_routes: {
      core: [
        'GET / - API information',
        'GET /health - System health check',
        'GET /api - API documentation',
      ],
      authentication: [
        'POST /api/auth/farmer/register - Farmer registration',
        'POST /api/auth/farmer/login - Farmer login',
        'GET /api/auth/farmer/profile - Get farmer profile (requires auth)',
        'PUT /api/auth/farmer/profile - Update farmer profile (requires auth)',
        'GET /api/auth/farmer/verify-email/:token - Verify email',
        'POST /api/auth/farmer/request-password-reset - Request password reset',
        'POST /api/auth/farmer/reset-password - Reset password with token',
        'POST /api/auth-dtam/login - DTAM staff login',
        'GET /api/auth-dtam/profile - Get DTAM profile (requires auth)',
        'GET /api/auth-dtam/staff-list - List all staff (admin only)',
        'POST /api/auth-dtam/create-staff - Create staff account (admin only)',
        'GET /api/auth-dtam/verify - Verify DTAM token',
        'GET /api/auth-dtam/health - DTAM auth health check',
      ],
      gacp: [
        'GET /api/gacp/workflow - GACP workflow information',
        'GET /api/gacp/ccps - Critical Control Points framework',
        'POST /api/gacp/workflow/transition - Validate workflow transition',
        'GET /api/gacp/compliance - GACP compliance standards',
      ],
      ai: [
        'POST /api/ai/fertilizer/recommend - Generate fertilizer recommendation',
        'GET /api/fertilizer-products - List GACP-approved fertilizers',
        'GET /api/fertilizer-products/search - Search fertilizer products',
        'GET /api/fertilizer-products/top-rated - Get top-rated products',
        'GET /api/fertilizer-products/:id - Get product details',
        'POST /api/fertilizer-products - Create product (admin)',
        'PUT /api/fertilizer-products/:id - Update product (admin)',
        'DELETE /api/fertilizer-products/:id - Delete product (admin)',
        'POST /api/fertilizer-products/:id/reviews - Add review',
      ],
      monitoring: [
        'GET /api/monitoring/health - System health',
        'GET /api/monitoring/health/detailed - Detailed health metrics',
        'GET /api/monitoring/health/database - Database health',
        'POST /api/monitoring/health/database/reconnect - Reconnect database',
        'GET /api/monitoring/status - Service status',
      ],
      analytics: [
        'GET /api/rhda/workplace-stats - Workplace statistics',
        'GET /api/rhda/analytics - RHDA analytics',
        'GET /api/rhda/warnings - System warnings',
        'POST /api/rhda/warnings/resolve - Resolve warnings',
      ],
      documentation: [
        'GET /api/docs/docs - API documentation',
        'GET /api/docs/openapi - OpenAPI specification',
      ],
    },
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  appLogger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server with database connection
async function startServer() {
  try {
    // Load secrets from AWS if in production
    await secretsManager.initialize();

    // Validate required environment variables
    validateEnvironment();

    appLogger.info('🔗 Connecting to MongoDB Atlas...');
    const connected = await mongoManager.connect();

    if (connected) {
      appLogger.info('✅ MongoDB Atlas connected successfully');
    } else {
      appLogger.info('⚠️  MongoDB Atlas connection failed - server starting without database');
    }

    app.listen(port, () => {
      appLogger.info('✅ GACP Atlas Server started successfully');
      appLogger.info(`🌐 Server: http://localhost:${port}`);
      appLogger.info(`📋 API Documentation: http://localhost:${port}/api`);
      appLogger.info(`❤️  Health Check: http://localhost:${port}/health`);
      appLogger.info(`🗄️  Database Test: http://localhost:${port}/api/db/test`);
      appLogger.info(
        `💾 Database: ${connected ? 'MongoDB Atlas Connected' : 'Disconnected - No Database'}`,
      );

      // Initialize Certificate Management Module
      if (connected) {
        try {
          const { initializeCertificateManagement } = require('./modules/certificate-management');
          const sharedModule = require('./modules/shared');

          const certModule = await initializeCertificateManagement(
            mongoose.connection.db,
            sharedModule.middleware.auth.authenticateToken
          );
          app.use('/api/certificates', certModule.router);
          appLogger.info('✅ Certificate Management module mounted at /api/certificates');
        } catch (err) {
          appLogger.error('❌ Failed to mount Certificate module:', err.message);
        }
      }

      appLogger.info('');
      appLogger.info('🎯 Test Endpoints:');
      appLogger.info(`   POST http://localhost:${port}/api/auth/test-login`);
      appLogger.info(`   GET  http://localhost:${port}/api/dashboard/test-stats`);
      appLogger.info('');
      appLogger.info('Ready for frontend development! 🚀');
    });
  } catch (error) {
    appLogger.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  appLogger.info('\n⏹️  SIGINT received, shutting down gracefully...');
  await mongoManager.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  appLogger.info('\n⏹️  SIGTERM received, shutting down gracefully...');
  await mongoManager.disconnect();
  process.exit(0);
});

// Start the server only when executing this file directly (skip during Jest imports)
if (require.main === module) {
  startServer();
}

module.exports = app;
