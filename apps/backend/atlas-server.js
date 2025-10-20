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

// Import GACP Business Logic and Services
const {
  GACPApplicationStatus,
  GACPCriticalControlPoints,
  GACPScoringSystem,
} = require('./models/gacp-business-logic');

const GACPWorkflowEngine = require('../../business-logic/gacp-workflow-engine');
const GACPEnhancedInspectionService = require('./services/gacp-enhanced-inspection');

// Import Database Health Monitor
// eslint-disable-next-line no-unused-vars
const dbHealthMonitor = require('./services/database-health-monitor');

// Import Health Monitoring Service
const HealthMonitoringService = require('./services/health-monitoring');

// Clear mongoose cache to prevent model overwrite errors
mongoose.deleteModel = function (modelName) {
  delete mongoose.models[modelName];
  delete mongoose.modelSchemas[modelName];
};

// Clear any existing models
if (mongoose.models.User) mongoose.deleteModel('User');
if (mongoose.models.Application) mongoose.deleteModel('Application');
if (mongoose.models.Inspection) mongoose.deleteModel('Inspection');
if (mongoose.models.Certificate) mongoose.deleteModel('Certificate');

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
      connected: mongoManager.isConnected,
      status: mongoManager.getStatus(),
    },
  };

  res.json(health);
});

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
    database: mongoManager.isConnected ? 'Connected' : 'Disconnected',
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
    inspectionService.db = mongoManager.isConnected ? mongoose.connection.db : null;

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
    inspectionService.db = mongoManager.isConnected ? mongoose.connection.db : null;

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
      totalApplications: mongoManager.isConnected ? 'Loading from Atlas...' : 0,
      totalUsers: mongoManager.isConnected ? 'Loading from Atlas...' : 0,
      totalInspections: mongoManager.isConnected ? 'Loading from Atlas...' : 0,
      totalCertificates: mongoManager.isConnected ? 'Loading from Atlas...' : 0,
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
    if (mongoManager.isConnected) {
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

// Mount RHDA Analytics Routes
app.use('/api/rhda', require('./routes/rhda-analytics'));

// Mount GACP Business Logic Routes
app.use('/api/gacp', require('./routes/gacp-business-logic'));

// Mount Health Monitoring Routes
app.use('/api/monitoring', require('./routes/health-monitoring'));

// Mount API Documentation Routes
app.use('/api/docs', require('./routes/api-documentation'));

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_routes: [
      'GET /',
      'GET /health',
      'GET /api',
      'POST /api/auth/test-login',
      'GET /api/dashboard/test-stats',
      'GET /api/db/test',
      'GET /api/rhda/workplace-stats',
      'GET /api/rhda/analytics',
      'GET /api/rhda/warnings',
      'GET /api/rhda/status',
      'GET /api/rhda/config',
      'POST /api/rhda/warnings/resolve',
      'GET /api/gacp/workflow',
      'GET /api/gacp/ccps',
      'POST /api/gacp/test/score-calculation',
      'GET /api/gacp/workflow/:state/requirements',
      'POST /api/gacp/workflow/transition',
      'GET /api/gacp/compliance',
      'GET /api/monitoring/health',
      'GET /api/monitoring/health/detailed',
      'GET /api/monitoring/health/database',
      'POST /api/monitoring/health/database/reconnect',
      'GET /api/monitoring/health/metrics',
      'GET /api/monitoring/health/history',
      'GET /api/monitoring/status',
      'GET /api/docs/docs',
      'GET /api/docs/openapi',
      'GET /api/docs/health',
    ],
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

// Start the server
startServer();

module.exports = app;
