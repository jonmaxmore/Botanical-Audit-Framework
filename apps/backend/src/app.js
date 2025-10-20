/**
 * GACP Digital Platform - Main Application Server
 * Refactored Backend Structure with Clean Architecture
 * Version: 2.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');

// Import Configuration
const { connectDB } = require('./config/database');
const config = require('./config/environment');
const logger = require('./utils/logger');

// Import Error Handlers
const { globalErrorHandler, notFoundHandler } = require('./utils/errorHandler');

class GACAApplication {
  constructor() {
    this.app = express();
    this.port = config.port || 3000;
    this.environment = config.environment || 'development';

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize all middleware
   */
  initializeMiddleware() {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ['\'self\''],
            styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
            fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
            imgSrc: ['\'self\'', 'data:', 'https:'],
            scriptSrc: ['\'self\''],
            connectSrc: ['\'self\'']
          }
        },
        crossOriginEmbedderPolicy: false
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: config.cors?.origin || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
      })
    );

    // Compression and parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Logging middleware
    this.app.use(logger.middleware);

    // Custom middleware (will be implemented later)
    // this.app.use(rateLimiter);

    // Static files
    this.app.use('/public', express.static(path.join(__dirname, '../public')));
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

  /**
   * Initialize all routes
   */
  initializeRoutes() {
    // Import routes
    const apiRoutes = require('./routes');

    // Health check endpoint (no authentication required)
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'GACP Platform is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.environment,
        version: '2.0.0'
      });
    });

    // API routes
    this.app.use('/api/v1', apiRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'GACP Digital Platform API v2.0',
        version: '2.0.0',
        environment: this.environment,
        endpoints: {
          Authentication: '/api/v1/auth',
          Users: '/api/v1/users',
          'Health Check': '/health',
          'API Documentation': '/api/v1/docs'
        },
        documentation: '/api/v1/docs'
      });
    });

    // 404 handler for undefined routes
    this.app.use('*', notFoundHandler);
  }

  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    this.app.use(globalErrorHandler);
  }

  /**
   * Connect to database
   */
  async connectDatabase() {
    try {
      await connectDB();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error; // Let caller handle the error
    }
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Try to connect to database (non-blocking)
      try {
        await this.connectDatabase();
      } catch (dbError) {
        logger.warn('Database connection failed, starting server without DB:', dbError.message);
      }

      // Start HTTP server
      this.server = this.app.listen(this.port, () => {
        logger.info('🚀 GACP Platform Server v2.0 started successfully');
        logger.info(`📍 Environment: ${this.environment}`);
        logger.info(`🌐 Server running on port ${this.port}`);
        logger.info(`🔗 API Base URL: http://localhost:${this.port}/api/v1`);
        logger.info(`💚 Health Check: http://localhost:${this.port}/health`);
        logger.info(`📚 Documentation: http://localhost:${this.port}/api/v1/docs`);
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown
   */
  setupGracefulShutdown() {
    const shutdown = signal => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(err => {
          if (err) {
            logger.error('Error during server shutdown:', err);
            process.exit(1);
          }
          logger.info('Server closed successfully');
          process.exit(0);
        });
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', err => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  /**
   * Get Express app instance
   */
  getApp() {
    return this.app;
  }
}

// Export application class
module.exports = GACAApplication;

// Start server if this file is run directly
// Export for use as module
module.exports = { GACAApplication };

// Start server if this file is run directly
if (require.main === module) {
  const application = new GACAApplication();
  application.start();
}
