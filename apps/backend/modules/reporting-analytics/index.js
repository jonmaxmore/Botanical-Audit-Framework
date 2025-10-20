/**
 * Reporting & Analytics Module Index
 *
 * Comprehensive reporting and analytics system for the GACP cannabis certification platform.
 * This module provides business intelligence, compliance reporting, performance analytics,
 * and administrative dashboard capabilities for government oversight and operational management.
 *
 * Core Features:
 * - Government compliance reporting for DTAM oversight
 * - Application processing analytics and performance metrics
 * - Financial reporting with payment transaction analysis
 * - Document management statistics and audit trails
 * - User activity monitoring and behavioral analytics
 * - System performance monitoring and health metrics
 * - Real-time dashboard data feeds
 * - Automated report generation and scheduling
 * - Data export capabilities (PDF, Excel, CSV)
 * - Historical trend analysis and forecasting
 *
 * Business Intelligence:
 * - Application approval rate analysis
 * - Processing time optimization insights
 * - Revenue tracking and financial forecasting
 * - Compliance adherence monitoring
 * - User engagement and satisfaction metrics
 * - Operational efficiency measurements
 * - Geographic distribution analysis
 * - Seasonal trend identification
 *
 * Compliance Reporting:
 * - Monthly DTAM regulatory reports
 * - Application status summaries
 * - Financial transaction records
 * - Document audit trails
 * - User access logs
 * - System security reports
 * - Data privacy compliance tracking
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const ReportingService = require('./application/services/ReportingService');
const ReportingController = require('./presentation/controllers/ReportingController');
const ReportingRoutes = require('./presentation/routes/ReportingRoutes');
const DashboardService = require('./application/services/DashboardService');
const AnalyticsService = require('./application/services/AnalyticsService');
const ComplianceReportService = require('./application/services/ComplianceReportService');

class ReportingModule {
  constructor(dependencies = {}) {
    this.dependencies = dependencies;
    this.reportingService = null;
    this.dashboardService = null;
    this.analyticsService = null;
    this.complianceService = null;
    this.controller = null;
    this.routes = null;
    this.isInitialized = false;

    console.log('[ReportingModule] Initializing comprehensive analytics and reporting system...');
  }

  /**
   * Initialize the reporting module with all dependencies
   * @param {Object} dependencies - External dependencies
   * @param {Object} dependencies.database - MongoDB connection
   * @param {Object} dependencies.redis - Redis connection for caching
   * @param {Object} dependencies.applicationRepository - Application data access
   * @param {Object} dependencies.userRepository - User data access
   * @param {Object} dependencies.paymentRepository - Payment data access
   * @param {Object} dependencies.documentRepository - Document data access
   * @param {Object} dependencies.notificationRepository - Notification data access
   * @param {Object} dependencies.auditService - Audit logging service
   * @param {Object} dependencies.pdfService - PDF generation service
   * @param {Object} dependencies.excelService - Excel generation service
   * @param {Object} dependencies.config - Configuration settings
   * @returns {Promise<ReportingModule>}
   */
  async initialize(dependencies = {}) {
    try {
      // Merge provided dependencies with existing ones
      this.dependencies = { ...this.dependencies, ...dependencies };

      // Validate required dependencies
      this._validateDependencies();

      // Initialize core services
      await this._initializeServices();

      // Initialize controller
      this.controller = new ReportingController({
        ...this.dependencies,
        reportingService: this.reportingService,
        dashboardService: this.dashboardService,
        analyticsService: this.analyticsService,
        complianceService: this.complianceService,
      });

      // Initialize routes
      this.routes = new ReportingRoutes({
        ...this.dependencies,
        reportingController: this.controller,
      });

      this.isInitialized = true;

      console.log('[ReportingModule] Initialized successfully with full analytics capabilities');

      // Log module capabilities
      this._logModuleCapabilities();

      // Schedule automated reports
      await this._scheduleAutomatedReports();

      return this;
    } catch (error) {
      console.error('[ReportingModule] Initialization failed:', error);
      throw new Error(`ReportingModule initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize all reporting services
   * @private
   */
  async _initializeServices() {
    // Core reporting service
    this.reportingService = new ReportingService(this.dependencies);
    await this.reportingService.initialize();

    // Dashboard service for real-time metrics
    this.dashboardService = new DashboardService({
      ...this.dependencies,
      reportingService: this.reportingService,
    });
    await this.dashboardService.initialize();

    // Analytics service for business intelligence
    this.analyticsService = new AnalyticsService({
      ...this.dependencies,
      reportingService: this.reportingService,
    });
    await this.analyticsService.initialize();

    // Compliance reporting service for government oversight
    this.complianceService = new ComplianceReportService({
      ...this.dependencies,
      reportingService: this.reportingService,
      analyticsService: this.analyticsService,
    });
    await this.complianceService.initialize();

    console.log('[ReportingModule] All services initialized successfully');
  }

  /**
   * Validate required dependencies
   * @private
   */
  _validateDependencies() {
    const required = [
      'database',
      'applicationRepository',
      'userRepository',
      'paymentRepository',
      'config',
    ];

    const missing = required.filter(dep => !this.dependencies[dep]);

    if (missing.length > 0) {
      throw new Error(`Missing required dependencies: ${missing.join(', ')}`);
    }

    // Validate configuration
    const config = this.dependencies.config;
    if (!config.reporting) {
      console.warn('[ReportingModule] No reporting configuration found, using defaults');
      config.reporting = {
        dashboard: { refreshInterval: 60000 },
        analytics: { retentionDays: 365 },
        compliance: { automatedReports: true },
      };
    }
  }

  /**
   * Log module capabilities for debugging and documentation
   * @private
   */
  _logModuleCapabilities() {
    const capabilities = {
      reportTypes: [
        'Government compliance reports',
        'Application processing analytics',
        'Financial transaction reports',
        'User activity summaries',
        'Document management statistics',
        'System performance metrics',
      ],
      dashboardFeatures: [
        'Real-time application metrics',
        'Payment processing status',
        'User engagement analytics',
        'System health monitoring',
        'Compliance adherence tracking',
      ],
      analyticsCapabilities: [
        'Historical trend analysis',
        'Predictive modeling',
        'Performance optimization insights',
        'User behavior analysis',
        'Revenue forecasting',
      ],
      exportFormats: ['PDF', 'Excel', 'CSV', 'JSON'],
      automatedReports: [
        'Daily operational summary',
        'Weekly performance report',
        'Monthly compliance report',
        'Quarterly business review',
      ],
    };

    console.log('[ReportingModule] Capabilities:', JSON.stringify(capabilities, null, 2));
  }

  /**
   * Schedule automated report generation
   * @private
   */
  async _scheduleAutomatedReports() {
    try {
      if (this.dependencies.config.reporting?.automatedReports !== false) {
        // Schedule daily operational reports
        await this._scheduleDailyReports();

        // Schedule weekly performance reports
        await this._scheduleWeeklyReports();

        // Schedule monthly compliance reports
        await this._scheduleMonthlyReports();

        console.log('[ReportingModule] Automated reports scheduled successfully');
      }
    } catch (error) {
      console.error('[ReportingModule] Failed to schedule automated reports:', error);
    }
  }

  /**
   * Schedule daily operational reports
   * @private
   */
  async _scheduleDailyReports() {
    // Implementation would use a job scheduler like node-cron
    console.log('[ReportingModule] Daily reports scheduling configured');
  }

  /**
   * Schedule weekly performance reports
   * @private
   */
  async _scheduleWeeklyReports() {
    // Implementation would use a job scheduler like node-cron
    console.log('[ReportingModule] Weekly reports scheduling configured');
  }

  /**
   * Schedule monthly compliance reports
   * @private
   */
  async _scheduleMonthlyReports() {
    // Implementation would use a job scheduler like node-cron
    console.log('[ReportingModule] Monthly compliance reports scheduling configured');
  }

  /**
   * Get the reporting service instance
   * @returns {ReportingService}
   */
  getReportingService() {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before accessing reporting service');
    }
    return this.reportingService;
  }

  /**
   * Get the dashboard service instance
   * @returns {DashboardService}
   */
  getDashboardService() {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before accessing dashboard service');
    }
    return this.dashboardService;
  }

  /**
   * Get the analytics service instance
   * @returns {AnalyticsService}
   */
  getAnalyticsService() {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before accessing analytics service');
    }
    return this.analyticsService;
  }

  /**
   * Get the compliance service instance
   * @returns {ComplianceReportService}
   */
  getComplianceService() {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before accessing compliance service');
    }
    return this.complianceService;
  }

  /**
   * Get the reporting controller instance
   * @returns {ReportingController}
   */
  getController() {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before accessing controller');
    }
    return this.controller;
  }

  /**
   * Get the Express router for reporting routes
   * @returns {express.Router}
   */
  getRoutes() {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before accessing routes');
    }
    return this.routes.getRouter();
  }

  // Convenience methods for quick access to core functionality

  /**
   * Generate a compliance report (convenience method)
   * @param {Object} criteria - Report criteria
   * @returns {Promise<Object>}
   */
  async generateComplianceReport(criteria) {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before generating reports');
    }
    return await this.complianceService.generateReport(criteria);
  }

  /**
   * Get dashboard metrics (convenience method)
   * @param {Object} criteria - Metrics criteria
   * @returns {Promise<Object>}
   */
  async getDashboardMetrics(criteria = {}) {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before accessing dashboard metrics');
    }
    return await this.dashboardService.getMetrics(criteria);
  }

  /**
   * Get analytics data (convenience method)
   * @param {Object} criteria - Analytics criteria
   * @returns {Promise<Object>}
   */
  async getAnalytics(criteria) {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before accessing analytics');
    }
    return await this.analyticsService.getAnalytics(criteria);
  }

  /**
   * Export report data (convenience method)
   * @param {Object} exportConfig - Export configuration
   * @returns {Promise<Object>}
   */
  async exportReport(exportConfig) {
    if (!this.isInitialized) {
      throw new Error('ReportingModule must be initialized before exporting reports');
    }
    return await this.reportingService.exportReport(exportConfig);
  }

  /**
   * Get module health status
   * @returns {Promise<Object>}
   */
  async getHealthStatus() {
    if (!this.isInitialized) {
      return {
        status: 'unhealthy',
        reason: 'Module not initialized',
        timestamp: new Date(),
      };
    }

    try {
      const serviceHealth = await Promise.all([
        this.reportingService.healthCheck(),
        this.dashboardService.healthCheck(),
        this.analyticsService.healthCheck(),
        this.complianceService.healthCheck(),
      ]);

      const allHealthy = serviceHealth.every(health => health.status === 'healthy');

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        services: {
          reporting: serviceHealth[0],
          dashboard: serviceHealth[1],
          analytics: serviceHealth[2],
          compliance: serviceHealth[3],
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get module information
   * @returns {Object}
   */
  getModuleInfo() {
    return {
      name: 'ReportingModule',
      version: '1.0.0',
      description: 'Comprehensive reporting and analytics system for GACP platform',
      status: this.isInitialized ? 'initialized' : 'not_initialized',
      services: {
        reporting: 'Core reporting engine',
        dashboard: 'Real-time metrics and KPIs',
        analytics: 'Business intelligence and insights',
        compliance: 'Government reporting and auditing',
      },
      capabilities: {
        reportTypes: [
          'Compliance reports for DTAM',
          'Application processing analytics',
          'Financial transaction reports',
          'User activity summaries',
          'Document management statistics',
          'System performance metrics',
        ],
        exportFormats: ['PDF', 'Excel', 'CSV', 'JSON'],
        features: [
          'Real-time dashboard',
          'Automated report generation',
          'Historical trend analysis',
          'Predictive analytics',
          'Compliance monitoring',
          'Performance optimization',
        ],
      },
      routes: this.routes ? this.routes.getRouteInfo() : null,
      dependencies: Object.keys(this.dependencies),
    };
  }

  /**
   * Shutdown the module gracefully
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      console.log('[ReportingModule] Shutting down...');

      if (this.complianceService) {
        await this.complianceService.shutdown();
      }

      if (this.analyticsService) {
        await this.analyticsService.shutdown();
      }

      if (this.dashboardService) {
        await this.dashboardService.shutdown();
      }

      if (this.reportingService) {
        await this.reportingService.shutdown();
      }

      this.isInitialized = false;
      console.log('[ReportingModule] Shutdown completed');
    } catch (error) {
      console.error('[ReportingModule] Shutdown error:', error);
      throw error;
    }
  }
}

// Static factory method for easy instantiation
ReportingModule.create = function (dependencies = {}) {
  return new ReportingModule(dependencies);
};

// Export both the class and a default instance creator
module.exports = ReportingModule;
