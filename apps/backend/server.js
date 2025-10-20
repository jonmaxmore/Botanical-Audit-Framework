/**
 * Botanical Audit Framework - Backend Server
 *
 * Enterprise-grade application server designed for scalability,
 * observability, and sustainability.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const socketIo = require('socket.io');
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

// Security and performance middleware
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(
  cors({
    origin: config.server.cors.allowedOrigins,
    methods: config.server.cors.allowedMethods,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(
  morgan('combined', {
    stream: { write: message => appLogger.info(message.trim()) },
  }),
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
        userAgent: req.get('User-Agent'),
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
      requestId: req.id,
    });
  }
});

// Initialize Socket.IO with Redis adapter for horizontal scaling
const io = require('./services/socket-service').initialize(server, redisManager);

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
    requestId: req.id,
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
    system: systemHealth.status,
  };

  const isHealthy = Object.values(services).every(
    status => status === 'operational' || status === 'healthy',
  );

  const health = {
    status: isHealthy ? 'healthy' : 'degraded',
    services,
    details: {
      mongodb: mongoHealth,
      redis: redisHealth,
      system: systemHealth,
    },
    timestamp: new Date(),
    version: config.app.version,
    environment: config.app.environment,
  };

  res.status(isHealthy ? 200 : 503).json(health);
});

// System routes - used for infrastructure management
app.use('/api/system', require('./routes/system'));

// API versioning and routing
app.use('/api/v1', require('./routes'));

// Legacy routes (to maintain compatibility)
const legacyRoutes = require('./routes/legacy');
app.use('/api', legacyRoutes);

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
      appLogger.warn(`⚠️ Backend server running in limited mode on http://localhost:${PORT}`);
      appLogger.warn(`Some services may be unavailable`);

      // Record degraded startup
      metrics.recordServerStart(false);
    });
  }
}

startServer();
