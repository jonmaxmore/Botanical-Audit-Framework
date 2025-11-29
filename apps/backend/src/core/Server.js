/**
 * Server Class
 * Handles server lifecycle, database connection, and startup
 */

require('dotenv').config();
const mongoose = require('mongoose');
const secretsManager = require('../../config/secrets-manager');
const { validateEnvironment } = require('../../config/env-validator');
const mongoManager = require('../../config/mongodb-manager');
const { logger } = require('../../shared');
const App = require('./App');

class Server {
  constructor() {
    this.logger = logger.createLogger('server');
    this.app = new App();
    this.port = process.env.PORT || 3005;
    this.server = null;
  }

  async start() {
    try {
      // Initialize Secrets & Environment
      await secretsManager.initialize();
      validateEnvironment();

      // Connect to Database
      this.logger.info('🔗 Connecting to MongoDB Atlas...');
      const connected = await mongoManager.connect();

      if (connected) {
        this.logger.info('✅ MongoDB Atlas connected successfully');
        await this.initializeDependentModules();
      } else {
        this.logger.warn('⚠️  MongoDB Atlas connection failed - server starting without database');
      }

      // Start HTTP Server
      this.server = this.app.app.listen(this.port, () => {
        this.logStartupMessage(connected);
      });

      // Handle Shutdown Signals
      this.setupSignalHandlers();

    } catch (error) {
      this.logger.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  }

  async initializeDependentModules() {
    try {
      const { initializeCertificateManagement } = require('../../modules/certificate-management');
      const sharedModule = require('../../modules/shared');

      const certModule = await initializeCertificateManagement(
        mongoose.connection.db,
        sharedModule.middleware.auth.authenticateToken
      );
      this.app.app.use('/api/certificates', certModule.router);
      this.logger.info('✅ Certificate Management module mounted at /api/certificates');
    } catch (err) {
      this.logger.error('❌ Failed to mount Certificate module:', err.message);
    }
  }

  logStartupMessage(dbConnected) {
    this.logger.info('✅ GACP Atlas Server started successfully');
    this.logger.info(`🌐 Server: http://localhost:${this.port}`);
    this.logger.info(`📋 API Documentation: http://localhost:${this.port}/api`);
    this.logger.info(`❤️  Health Check: http://localhost:${this.port}/health`);
    this.logger.info(
      `💾 Database: ${dbConnected ? 'MongoDB Atlas Connected' : 'Disconnected - No Database'}`
    );
    this.logger.info('Ready for frontend development! 🚀');
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
  }

  async shutdown(signal) {
    this.logger.info(`\n⏹️  ${signal} received, shutting down gracefully...`);
    await mongoManager.disconnect();
    if (this.server) {
      this.server.close(() => {
        this.logger.info('HTTP server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

module.exports = Server;
