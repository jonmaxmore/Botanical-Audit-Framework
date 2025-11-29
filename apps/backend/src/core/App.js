/**
 * App Class
 * Encapsulates the Express application logic
 */

const express = require('express');
const mongoose = require('mongoose');
const { logger } = require('../../shared');
const ExpressConfig = require('../config/express');
const coreRoutes = require('../routes/core.routes');

// Import Modules
const createAuthFarmerModule = require('../../modules/auth-farmer/container');
const {
  GACPWorkflowEngine,
} = require('../../modules/application-workflow/domain/gacp-workflow-engine');
const GACPEnhancedInspectionService = require('../../services/gacp-enhanced-inspection');
const HealthMonitoringService = require('../../services/health-monitoring');

class App {
  constructor() {
    this.app = express();
    this.logger = logger.createLogger('app');
    this.workflowEngine = new GACPWorkflowEngine();
    this.inspectionService = new GACPEnhancedInspectionService();

    this.initialize();
  }

  initialize() {
    this.logger.info('🚀 Initializing GACP Application...');

    // Configure Express
    const expressConfig = new ExpressConfig(this.app);
    expressConfig.initialize();

    // Mount Routes
    this.mountRoutes();

    // Error Handling
    this.configureErrorHandling();
  }

  mountRoutes() {
    // Core Routes
    this.app.use('/', coreRoutes);

    // Health Monitoring
    const healthMonitor = new HealthMonitoringService();
    const healthRoutes = healthMonitor.getRouteHandlers();
    this.app.get('/health', healthRoutes.health);
    this.app.get('/status', healthRoutes.status);
    this.app.get('/version', healthRoutes.version);

    // Swagger UI
    this.mountSwagger();

    // Auth Modules
    this.mountAuthModules();

    // Business Logic Modules
    this.mountBusinessModules();

    // AI & Smart Farming
    this.mountAIModules();
  }

  mountSwagger() {
    try {
      const { mountSwagger, createDocsIndex } = require('../../modules/auth-farmer/presentation/swagger');
      mountSwagger(this.app, '/api/docs/auth-farmer');
      createDocsIndex(this.app);
      this.logger.info('✅ Swagger UI mounted');
    } catch (error) {
      this.logger.warn('⚠️  Failed to mount Swagger UI:', error.message);
    }
  }

  mountAuthModules() {
    // Farmer Auth
    const farmerAuthModule = createAuthFarmerModule({
      database: mongoose.connection,
      jwtSecret: process.env.FARMER_JWT_SECRET || process.env.JWT_SECRET,
      jwtExpiresIn: '24h',
      bcryptSaltRounds: 12,
    });
    this.app.use('/api/auth/farmer', farmerAuthModule.router);
    this.logger.info('✅ Farmer Auth routes mounted');

    // DTAM Auth
    this.app.use('/api/auth-dtam', require('../../modules/auth-dtam/routes/dtam-auth'));
    this.logger.info('✅ DTAM Auth routes mounted');
  }

  mountBusinessModules() {
    this.app.use('/api/rhda', require('../../routes/rhda-analytics'));
    this.app.use('/api/gacp', require('../../routes/gacp-business-logic'));
    this.app.use('/api/monitoring', require('../../routes/health-monitoring'));
    this.app.use('/api/docs', require('../../routes/api-documentation'));

    // Certificate Management
    // Note: This is mounted dynamically in Server.js after DB connection,
    // but we can prepare the route structure here if needed.
  }

  mountAIModules() {
    this.app.use('/api/ai/fertilizer', require('../../routes/ai/fertilizer.routes'));
    this.app.use('/api/fertilizer-products', require('../../routes/ai/fertilizer-products.routes'));
    this.app.use('/api/video', require('../../routes/video-inspection.routes'));
    this.app.use('/api', require('../../routes/inspection-snapshots.routes'));
    this.app.use('/api', require('../../routes/inspection-report.routes'));
    this.app.use('/api', require('../../routes/inspection-scheduling.routes'));
    this.app.use('/api', require('../../routes/inspection-upcoming.routes'));
    this.app.use('/api', require('../../routes/inspection-kpi.routes'));
    this.app.use('/api/pdf', require('../../routes/pdf-export.routes'));
  }

  configureErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
      });
    });

    this.app.use((err, req, res, next) => {
      this.logger.error(err.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      });
    });
  }
}

module.exports = App;
