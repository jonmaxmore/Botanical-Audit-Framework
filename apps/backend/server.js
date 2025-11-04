/**
 * Botanical Audit Framework - Backend Server
 *
 * Enterprise-grade application server designed for scalability,
 * observability, and sustainability.
 */

// Load environment variables FIRST
require('dotenv').config();

// ?? CRITICAL: Validate all secrets BEFORE starting server
const { validateAllSecrets } = require('./modules/shared/utils/validateSecrets');
validateAllSecrets(); // Will exit process if any secret is invalid

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const { createCorsOptions, corsLoggingMiddleware } = require('./middleware/cors-config');
const mongoManager = require('./config/mongodb-manager');
const redisManager = require('./config/redis-manager');
const configManager = require('./config/config-manager');
const logger = require('./shared/logger');
const metrics = require('./shared/metrics');
const { errorMiddleware, requestValidator } = require('./middleware');
const appLogger = logger.createLogger('server');

// Initialize configuration
const config = configManager.getConfig();
const PORT = config.server.port || process.env.PORT || 5000;

// Create Express app
const app = express();
const server = http.createServer(app);

// Observability: Request tracking
metrics.initRequestTracking(app);

// HTTPS enforcement for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Security and performance middleware
app.use(
  helmet({
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  })
); // Security headers with HSTS
app.use(compression()); // Response compression

// Enhanced CORS configuration (Phase 3.3)
const corsOptions = createCorsOptions({
  environment: config.app.environment,
  customOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
  allowPatterns: process.env.NODE_ENV !== 'production',
  logRejected: true
});
app.use(cors(corsOptions));
app.use(corsLoggingMiddleware()); // Log CORS requests

// Add compression middleware (Phase 1 Optimization)
app.use(
  compression({
    level: 6, // Compression level (1-9)
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware (Phase 1 Optimization)
app.use((req, res, next) => {
  // Set request timeout to 30 seconds
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      appLogger.warn('Request timeout', {
        method: req.method,
        url: req.url,
        ip: req.ip
      });
      res.status(408).json({
        success: false,
        error: 'REQUEST_TIMEOUT',
        message: 'Request took too long to process'
      });
    }
  });

  // Set response timeout
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      appLogger.error('Response timeout', {
        method: req.method,
        url: req.url,
        ip: req.ip
      });
      res.status(503).json({
        success: false,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Server is overloaded'
      });
    }
  });

  next();
});

// Logging middleware
app.use(
  morgan('combined', {
    stream: { write: message => appLogger.info(message.trim()) }
  })
);

// Request validation middleware
app.use(requestValidator());

// Performance tracking middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    metrics.recordResponseTime(req.path, req.method, res.statusCode, duration);

    // Log slow requests
    if (duration > config.performance.slowRequestThreshold) {
      appLogger.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`, {
        method: req.method,
        path: req.path,
        duration,
        query: req.query,
        userAgent: req.get('User-Agent')
      });
    }
  });
  next();
});

// Enhanced error handling middleware
app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    appLogger.error('Unhandled request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      requestId: req.id
    });
  }
});

// Initialize Socket.IO with Redis adapter for horizontal scaling
const io = require('./services/socket-service').initialize(server, redisManager);

// Initialize real-time notification service
const realtimeService = require('./services/realtime.service');
realtimeService.initialize(io);

// Make socket.io available to routes
app.set('io', io);

// Basic route for testing
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Botanical Audit Framework API is running',
    version: config.app.version,
    environment: config.app.environment,
    apiVersion: 'v1',
    mongodb: mongoManager.getStatus(),
    redis: redisManager.getStatus(),
    uptime: process.uptime(),
    requestId: req.id
  });
});

// Health check endpoint with comprehensive diagnostics
app.get('/api/health', async (req, res) => {
  const mongoHealth = await mongoManager.healthCheck();
  const redisHealth = await redisManager.healthCheck();
  const systemHealth = await metrics.getSystemHealth();

  const services = {
    database: mongoHealth.status,
    cache: redisHealth.status,
    notifications: io ? 'operational' : 'unavailable',
    fileStorage: await metrics.checkStorageHealth(),
    system: systemHealth.status
  };

  // Consider system healthy if critical services (database, system) are healthy
  // Redis/cache is optional - disabled is acceptable
  const criticalServicesHealthy =
    services.database === 'healthy' &&
    (services.system === 'healthy' || services.system === 'operational');

  const isHealthy =
    criticalServicesHealthy &&
    (services.cache === 'disabled' ||
      services.cache === 'healthy' ||
      services.cache === 'operational');

  const health = {
    status: isHealthy ? 'healthy' : 'degraded',
    services,
    details: {
      mongodb: mongoHealth,
      redis: redisHealth,
      system: systemHealth
    },
    timestamp: new Date(),
    version: config.app.version,
    environment: config.app.environment
  };

  res.status(isHealthy ? 200 : 503).json(health);
});

// System routes - used for infrastructure management
// app.use('/api/system', require('./routes/system')); // Commented out - file not found

// API versioning and routing
// app.use('/api/v1', require('./routes')); // Commented out - will setup later

// Legacy routes (to maintain compatibility)
// const legacyRoutes = require('./routes/legacy');
// app.use('/api', legacyRoutes); // Commented out - will setup later

// Basic API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/health', require('./routes/health'));
app.use('/api/applications', require('./routes/applications')); // ? Enabled for real API
app.use('/api/farmer/application', require('./routes/farmer-application'));
app.use('/api/admin/applications', require('./routes/admin-application')); // Admin application management
app.use('/api/certificates', require('./routes/certificate')); // Certificate routes
app.use('/api/inspections', require('./routes/inspection')); // Inspection routes
app.use('/api/documents', require('./routes/document')); // Document Management System
app.use('/api/notifications', require('./routes/notification')); // Notification System
app.use('/api/analytics', require('./routes/analytics')); // Analytics Dashboard
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/smart-agriculture', require('./routes/smart-agriculture.routes')); // ? Smart Agriculture APIs
app.use('/api/traceability', require('./routes/traceability')); // ✅ Traceability System - QR code tracking
app.use('/api/farm-management', require('./routes/farm-management')); // ✅ Farm Management System
app.use('/api/standards', require('./routes/standards')); // ✅ Standards Comparison System
app.use('/api/questionnaires', require('./routes/questionnaires')); // ✅ Questionnaire/Survey System
// app.use('/api/inspectors', require('./routes/inspectors')); // Commented - has middleware issues
// app.use('/api/notifications', require('./routes/notifications')); // Commented - duplicate route (already enabled above)

// ✅ Phase 1: AI QC and Calendar Integration
app.use('/api/v1/ai-qc', require('./routes/aiQc.routes')); // AI Quality Control with Gemini
app.use('/api/v1/dtam/inspector', require('./routes/inspector.routes')); // Inspector Dashboard APIs
app.use('/api/v1/dtam/approver', require('./routes/approver.routes')); // Approver Dashboard APIs

// Global error handler
app.use(errorMiddleware());

// Graceful shutdown handler
const gracefulShutdown = async signal => {
  appLogger.info(`${signal} received. Starting graceful shutdown...`);

  // Create a timeout for forced shutdown if graceful shutdown takes too long
  const forceTimeout = setTimeout(() => {
    appLogger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, config.server.shutdownTimeout || 30000);

  try {
    // Close server to stop accepting new connections
    server.close(() => {
      appLogger.info('HTTP server closed');
    });

    // Disconnect socket.io
    io.close(() => {
      appLogger.info('Socket.IO server closed');
    });

    // Disconnect from MongoDB
    await mongoManager.disconnect();
    appLogger.info('MongoDB disconnected');

    // Disconnect from Redis
    await redisManager.disconnect();
    appLogger.info('Redis disconnected');

    // Clear force shutdown timeout
    clearTimeout(forceTimeout);

    appLogger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    appLogger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  appLogger.error('Uncaught Exception:', error);
  appLogger.error('Stack trace:', error.stack);

  // Attempt graceful shutdown
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  appLogger.error('Unhandled Promise Rejection at:', promise);
  appLogger.error('Reason:', reason);

  // Log but don't exit - let the application continue
  // In production, you might want to exit and let PM2 restart
});

// Handle warnings (useful for deprecation warnings)
process.on('warning', warning => {
  appLogger.warn('Node.js Warning:');
  appLogger.warn('Name:', warning.name);
  appLogger.warn('Message:', warning.message);
  appLogger.warn('Stack:', warning.stack);
});

// Start server
async function startServer() {
  try {
    // Initialize services
    await mongoManager.connect();
    await redisManager.connect();

    // Start the server
    server.listen(PORT, () => {
      appLogger.info(`Backend server running on http://localhost:${PORT}`);
      appLogger.info(`Environment: ${config.app.environment}`);
      appLogger.info(`MongoDB status: ${mongoManager.getStatus().readyState}`);
      appLogger.info(`Redis status: ${redisManager.getStatus()}`);
      appLogger.info(`Real-time notification system: active`);

      // Record server startup metric
      metrics.recordServerStart();
    });
  } catch (error) {
    appLogger.error('Failed to start server:', error);

    // Continue with limited functionality
    server.listen(PORT, () => {
      appLogger.warn(`?? Backend server running in limited mode on http://localhost:${PORT}`);
      appLogger.warn(`Some services may be unavailable`);

      // Record degraded startup
      metrics.recordServerStart(false);
    });
  }
}

startServer();
