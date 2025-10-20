/**
 * GACP Standards Comparison System - Module Index
 * ไฟล์ประกอบหลักของ Standards Comparison System Module
 *
 * Business Logic & Process Workflow:
 * 1. Dependency Injection Setup - การจัดการ dependencies ระหว่าง layers
 * 2. Module Integration - การรวม domain, application, infrastructure, presentation layers
 * 3. Configuration Management - การจัดการค่าตั้งต้นของ module
 * 4. Error Handling Setup - การจัดการข้อผิดพลาดระดับ module
 *
 * Technical Implementation:
 * - Clean Architecture pattern implementation
 * - Dependency injection for loose coupling
 * - Module lifecycle management
 * - Comprehensive error boundaries
 */

const StandardsComparison = require('./domain/entities/StandardsComparison');
const StandardsComparisonManagementUseCase = require('./application/useCases/StandardsComparisonManagementUseCase');
const StandardsComparisonRepository = require('./infrastructure/repositories/StandardsComparisonRepository');
const StandardsComparisonController = require('./presentation/controllers/StandardsComparisonController');
const setupStandardsComparisonRoutes = require('./presentation/routes/standardsComparisonRoutes');

/**
 * Standards Comparison Module Factory
 * โรงงานสำหรับสร้าง Standards Comparison Module พร้อมทั้ง dependencies
 *
 * @param {Object} dependencies - External dependencies
 * @param {Object} dependencies.database - Database connection
 * @param {Object} dependencies.logger - Logger instance
 * @param {Object} dependencies.eventBus - Event bus for inter-module communication
 * @param {Object} dependencies.fileService - File management service
 * @param {Object} dependencies.authService - Authentication service
 * @param {Object} dependencies.auditService - Audit logging service
 * @param {Object} dependencies.farmManagementModule - Farm Management module
 * @param {Object} dependencies.surveyModule - Survey module
 * @param {Object} dependencies.trackTraceModule - Track & Trace module
 *
 * @returns {Object} Configured Standards Comparison module
 */
class StandardsComparisonModule {
  constructor(dependencies = {}) {
    this.dependencies = dependencies;
    this.initialized = false;
    this.moduleId = 'standards-comparison-system';
    this.version = '1.0.0';

    // Validate required dependencies
    this._validateDependencies();

    // Initialize module components
    this._initializeComponents();

    // Setup module integrations
    this._setupIntegrations();

    // Configure error handling
    this._setupErrorHandling();

    this.initialized = true;

    this.dependencies.logger?.info('Standards Comparison Module initialized successfully', {
      moduleId: this.moduleId,
      version: this.version,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validate Required Dependencies
   * ตรวจสอบ dependencies ที่จำเป็นสำหรับการทำงาน
   */
  _validateDependencies() {
    const requiredDependencies = ['database', 'logger', 'eventBus'];

    const optionalDependencies = [
      'fileService',
      'authService',
      'auditService',
      'farmManagementModule',
      'surveyModule',
      'trackTraceModule',
    ];

    // ตรวจสอบ required dependencies
    for (const dep of requiredDependencies) {
      if (!this.dependencies[dep]) {
        throw new Error(`Required dependency '${dep}' is missing for Standards Comparison Module`);
      }
    }

    // Log optional dependencies status
    this.dependencies.logger?.info('Dependencies validation completed', {
      required: requiredDependencies.map(dep => ({
        name: dep,
        available: !!this.dependencies[dep],
      })),
      optional: optionalDependencies.map(dep => ({
        name: dep,
        available: !!this.dependencies[dep],
      })),
    });
  }

  /**
   * Initialize Module Components
   * เริ่มต้นการทำงานของ components ต่างๆ ในโมดูล
   */
  _initializeComponents() {
    try {
      // Initialize Infrastructure Layer
      this.repository = new StandardsComparisonRepository({
        database: this.dependencies.database,
        logger: this.dependencies.logger,
        auditService: this.dependencies.auditService,
      });

      // Initialize Application Layer
      this.useCase = new StandardsComparisonManagementUseCase({
        standardsComparisonRepository: this.repository,
        farmManagementRepository: this.dependencies.farmManagementModule?.repository,
        surveyRepository: this.dependencies.surveyModule?.repository,
        trackTraceRepository: this.dependencies.trackTraceModule?.repository,
        eventBus: this.dependencies.eventBus,
        logger: this.dependencies.logger,
        auditService: this.dependencies.auditService,
      });

      // Initialize Presentation Layer
      this.controller = new StandardsComparisonController({
        standardsComparisonUseCase: this.useCase,
        logger: this.dependencies.logger,
        authService: this.dependencies.authService,
        fileService: this.dependencies.fileService,
      });

      // Initialize Routes
      this.routes = setupStandardsComparisonRoutes({
        standardsComparisonController: this.controller,
        authMiddleware:
          this.dependencies.authService?.middleware || this._createMockAuthMiddleware(),
        validationMiddleware: this._createValidationMiddleware(),
        rateLimitMiddleware: this._createRateLimitMiddleware(),
        auditMiddleware:
          this.dependencies.auditService?.middleware || this._createMockAuditMiddleware(),
        fileMiddleware:
          this.dependencies.fileService?.middleware || this._createMockFileMiddleware(),
        progressMiddleware: this._createProgressMiddleware(),
        logger: this.dependencies.logger,
      });

      this.dependencies.logger?.info('Standards Comparison Module components initialized', {
        components: ['repository', 'useCase', 'controller', 'routes'],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.dependencies.logger?.error(
        'Failed to initialize Standards Comparison Module components',
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw error;
    }
  }

  /**
   * Setup Module Integrations
   * จัดตั้งการเชื่อมโยงระหว่างโมดูลต่างๆ
   */
  _setupIntegrations() {
    // Event listeners for inter-module communication
    if (this.dependencies.eventBus) {
      // Listen for farm updates
      this.dependencies.eventBus.on('farm.updated', farmData => {
        this.dependencies.logger?.info('Farm updated event received', { farmId: farmData.id });
        // Handle farm update in standards comparisons
        this._handleFarmUpdate(farmData);
      });

      // Listen for survey completion
      this.dependencies.eventBus.on('survey.completed', surveyData => {
        this.dependencies.logger?.info('Survey completed event received', {
          surveyId: surveyData.id,
        });
        // Update related standards comparisons with new survey data
        this._handleSurveyCompletion(surveyData);
      });

      // Listen for track & trace updates
      this.dependencies.eventBus.on('track-trace.updated', trackData => {
        this.dependencies.logger?.info('Track & trace updated event received', {
          trackId: trackData.id,
        });
        // Update related standards comparisons with new tracking data
        this._handleTrackTraceUpdate(trackData);
      });
    }

    // Setup periodic tasks
    this._setupPeriodicTasks();

    this.dependencies.logger?.info('Standards Comparison Module integrations configured');
  }

  /**
   * Setup Error Handling
   * จัดตั้งการจัดการข้อผิดพลาดระดับโมดูล
   */
  _setupErrorHandling() {
    // Global error handler for the module
    this.errorHandler = (error, context = {}) => {
      this.dependencies.logger?.error('Standards Comparison Module Error', {
        error: error.message,
        stack: error.stack,
        context,
        moduleId: this.moduleId,
        timestamp: new Date().toISOString(),
      });

      // Emit error event for system monitoring
      if (this.dependencies.eventBus) {
        this.dependencies.eventBus.emit('module.error', {
          moduleId: this.moduleId,
          error: error.message,
          context,
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Handle uncaught errors in the module
    process.on('uncaughtException', error => {
      if (error.source === this.moduleId) {
        this.errorHandler(error, { type: 'uncaughtException' });
      }
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.errorHandler(new Error(reason), {
        type: 'unhandledRejection',
        promise: promise.toString(),
      });
    });
  }

  // =============================================================================
  // EVENT HANDLERS FOR INTER-MODULE COMMUNICATION
  // =============================================================================

  /**
   * Handle Farm Update Event
   * จัดการเหตุการณ์เมื่อข้อมูลฟาร์มมีการอัปเดต
   */
  async _handleFarmUpdate(farmData) {
    try {
      // Find active standards comparisons for this farm
      const activeComparisons = await this.repository.findByFarmId(farmData.id, {
        status: ['in_progress', 'data_collection', 'analyzing'],
      });

      // Update comparisons with new farm data
      for (const comparison of activeComparisons) {
        await this.useCase.refreshFarmData(comparison.id, farmData);

        this.dependencies.logger?.info('Standards comparison updated with farm data', {
          comparisonId: comparison.id,
          farmId: farmData.id,
        });
      }
    } catch (error) {
      this.errorHandler(error, {
        operation: 'handleFarmUpdate',
        farmId: farmData.id,
      });
    }
  }

  /**
   * Handle Survey Completion Event
   * จัดการเหตุการณ์เมื่อแบบสำรวจเสร็จสิ้น
   */
  async _handleSurveyCompletion(surveyData) {
    try {
      // Find standards comparisons using this survey data
      const relatedComparisons = await this.repository.findBySurveyId(surveyData.id);

      // Update comparisons with new survey results
      for (const comparison of relatedComparisons) {
        await this.useCase.integrateSurveyResults(comparison.id, surveyData);

        this.dependencies.logger?.info('Standards comparison updated with survey data', {
          comparisonId: comparison.id,
          surveyId: surveyData.id,
        });
      }
    } catch (error) {
      this.errorHandler(error, {
        operation: 'handleSurveyCompletion',
        surveyId: surveyData.id,
      });
    }
  }

  /**
   * Handle Track & Trace Update Event
   * จัดการเหตุการณ์เมื่อข้อมูล Track & Trace มีการอัปเดต
   */
  async _handleTrackTraceUpdate(trackData) {
    try {
      // Find standards comparisons using this tracking data
      const relatedComparisons = await this.repository.findByFarmId(trackData.farmId, {
        includeTrackingData: true,
      });

      // Update comparisons with new tracking data
      for (const comparison of relatedComparisons) {
        await this.useCase.integrateTrackingData(comparison.id, trackData);

        this.dependencies.logger?.info('Standards comparison updated with tracking data', {
          comparisonId: comparison.id,
          trackId: trackData.id,
        });
      }
    } catch (error) {
      this.errorHandler(error, {
        operation: 'handleTrackTraceUpdate',
        trackId: trackData.id,
      });
    }
  }

  // =============================================================================
  // PERIODIC TASKS
  // =============================================================================

  /**
   * Setup Periodic Tasks
   * จัดตั้งงานที่ต้องทำซ้ำเป็นระยะ
   */
  _setupPeriodicTasks() {
    // Auto-refresh data for active comparisons (every hour)
    if (this.dependencies.scheduler) {
      this.dependencies.scheduler.schedule('refresh-comparison-data', '0 */1 * * *', async () => {
        await this._refreshActiveComparisons();
      });

      // Generate periodic compliance reports (daily at midnight)
      this.dependencies.scheduler.schedule('generate-compliance-reports', '0 0 * * *', async () => {
        await this._generatePeriodicReports();
      });

      // Cleanup old comparison data (weekly)
      this.dependencies.scheduler.schedule('cleanup-old-data', '0 2 * * 0', async () => {
        await this._cleanupOldData();
      });
    }
  }

  /**
   * Refresh Active Comparisons
   * รีเฟรชข้อมูลของการเปรียบเทียบที่กำลังดำเนินการ
   */
  async _refreshActiveComparisons() {
    try {
      const activeComparisons = await this.repository.findActiveComparisons();

      for (const comparison of activeComparisons) {
        await this.useCase.refreshComparisonData(comparison.id);
      }

      this.dependencies.logger?.info('Active comparisons refreshed', {
        count: activeComparisons.length,
      });
    } catch (error) {
      this.errorHandler(error, { operation: 'refreshActiveComparisons' });
    }
  }

  // =============================================================================
  // MOCK MIDDLEWARE CREATORS (for development/testing)
  // =============================================================================

  _createMockAuthMiddleware() {
    return {
      authenticate: (req, res, next) => {
        req.user = { id: 'dev-user', role: 'admin' };
        next();
      },
    };
  }

  _createValidationMiddleware() {
    return {
      validateCreateStandardsComparison: (req, res, next) => next(),
      validateUpdateComparisonConfiguration: (req, res, next) => next(),
      validateDataCollectionOptions: (req, res, next) => next(),
      validateAnalysisOptions: (req, res, next) => next(),
      validateReportOptions: (req, res, next) => next(),
      validateFarmId: (req, res, next) => next(),
      validateSearchCriteria: (req, res, next) => next(),
    };
  }

  _createRateLimitMiddleware() {
    return {
      createStandardsComparison: (req, res, next) => next(),
      getStandardsComparison: (req, res, next) => next(),
      updateStandardsComparison: (req, res, next) => next(),
      collectData: (req, res, next) => next(),
      analyzeStandards: (req, res, next) => next(),
      getProgress: (req, res, next) => next(),
      getFarmComparisons: (req, res, next) => next(),
      generateReport: (req, res, next) => next(),
      downloadReport: (req, res, next) => next(),
      searchComparisons: (req, res, next) => next(),
      getStatistics: (req, res, next) => next(),
    };
  }

  _createMockAuditMiddleware() {
    return {
      logActivity: action => (req, res, next) => {
        this.dependencies.logger?.info('Activity logged', { action, user: req.user?.id });
        next();
      },
    };
  }

  _createMockFileMiddleware() {
    return {
      validateFileAccess: (req, res, next) => next(),
    };
  }

  _createProgressMiddleware() {
    return {
      initializeProgress: (req, res, next) => {
        req.progressTracker = {
          start: () => {},
          update: () => {},
          complete: () => {},
        };
        next();
      },
    };
  }

  // =============================================================================
  // PUBLIC API METHODS
  // =============================================================================

  /**
   * Get Module Health Status
   * ดึงสถานะสุขภาพของโมดูล
   */
  getHealthStatus() {
    return {
      moduleId: this.moduleId,
      version: this.version,
      initialized: this.initialized,
      status: 'healthy',
      components: {
        repository: !!this.repository,
        useCase: !!this.useCase,
        controller: !!this.controller,
        routes: !!this.routes,
      },
      dependencies: {
        database: !!this.dependencies.database,
        logger: !!this.dependencies.logger,
        eventBus: !!this.dependencies.eventBus,
        fileService: !!this.dependencies.fileService,
        authService: !!this.dependencies.authService,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get Module Statistics
   * ดึงสถิติการใช้งานของโมดูล
   */
  async getModuleStatistics() {
    try {
      const stats = await this.repository.getSystemStatistics();

      return {
        moduleId: this.moduleId,
        statistics: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.errorHandler(error, { operation: 'getModuleStatistics' });
      return {
        moduleId: this.moduleId,
        error: 'Failed to retrieve statistics',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Shutdown Module
   * ปิดการทำงานของโมดูลอย่างปลอดภัย
   */
  async shutdown() {
    try {
      this.dependencies.logger?.info('Shutting down Standards Comparison Module');

      // Close database connections
      if (this.repository && typeof this.repository.close === 'function') {
        await this.repository.close();
      }

      // Clear event listeners
      if (this.dependencies.eventBus) {
        this.dependencies.eventBus.removeAllListeners('farm.updated');
        this.dependencies.eventBus.removeAllListeners('survey.completed');
        this.dependencies.eventBus.removeAllListeners('track-trace.updated');
      }

      this.initialized = false;

      this.dependencies.logger?.info('Standards Comparison Module shutdown completed');
    } catch (error) {
      this.errorHandler(error, { operation: 'shutdown' });
    }
  }
}

/**
 * Module Factory Function
 * ฟังก์ชันโรงงานสำหรับสร้าง Standards Comparison Module
 */
function createStandardsComparisonModule(dependencies) {
  return new StandardsComparisonModule(dependencies);
}

// Export both class and factory function
module.exports = {
  StandardsComparisonModule,
  createStandardsComparisonModule,
  // Export individual components for direct access if needed
  StandardsComparison,
  StandardsComparisonManagementUseCase,
  StandardsComparisonRepository,
  StandardsComparisonController,
  setupStandardsComparisonRoutes,
};
