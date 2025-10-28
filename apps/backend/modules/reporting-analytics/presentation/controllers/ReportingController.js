/**
 * Reporting Controller - RESTful API for Analytics and Reporting
 *
 * HTTP API controller providing comprehensive reporting and analytics endpoints
 * for the GACP platform. This controller orchestrates report generation,
 * dashboard data, and compliance reporting with proper authentication and validation.
 *
 * Business Logic Flow:
 * 1. Request Validation → Authentication → Authorization → Service Orchestration → Response
 * 2. Role-based access control for different report types
 * 3. Input validation and sanitization for security
 * 4. Error handling with detailed logging
 * 5. Response formatting with metadata and pagination
 *
 * API Endpoints:
 * - GET /reports/dashboard - Real-time dashboard metrics
 * - GET /reports/applications - Application processing reports
 * - GET /reports/financial - Financial performance reports
 * - GET /reports/users - User activity and engagement reports
 * - GET /reports/compliance - Compliance and audit reports
 * - POST /reports/custom - Custom report generation
 * - GET /reports/:reportId - Retrieve specific report
 * - GET /analytics/business - Business intelligence analytics
 * - GET /analytics/predictive - Predictive modeling and forecasts
 *
 * Security Features:
 * - JWT authentication on all endpoints
 * - Role-based authorization (DTAM_ADMIN, DTAM_REVIEWER access)
 * - Input validation with express-validator
 * - Rate limiting for resource-intensive operations
 * - Audit logging for all report generation activities
 *
 * Integration Points:
 * - ReportingService: Core report generation engine
 * - DashboardService: Real-time metrics and KPIs
 * - AnalyticsService: Business intelligence and insights
 * - ComplianceReportService: Government compliance reporting
 * - Authentication: JWT-based security and audit logging
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const { validationResult, query, _body, param } = require('express-validator');

class ReportingController {
  constructor(dependencies = {}) {
    this.reportingService = dependencies.reportingService;
    this.dashboardService = dependencies.dashboardService;
    this.analyticsService = dependencies.analyticsService;
    this.complianceService = dependencies.complianceService;
    this.auditService = dependencies.auditService;
    this.config = dependencies.config;

    logger.info('[ReportingController] Initializing reporting API endpoints...');
  }

  /**
   * Get real-time dashboard metrics
   * Business Logic: Provide comprehensive operational overview for administrators
   *
   * GET /dashboard
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDashboardMetrics(req, res) {
    try {
      // Validate request parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid dashboard parameters',
          details: errors.array()
        });
      }

      const criteria = {
        timeframe: req.query.timeframe || '24h',
        modules: req.query.modules ? req.query.modules.split(',') : undefined,
        userRole: req.userRole,
        includeAlerts: req.query.includeAlerts !== 'false',
        includeTrends: req.query.includeTrends !== 'false'
      };

      // Generate dashboard metrics
      const dashboardData = await this.dashboardService.getDashboardMetrics(criteria);

      // Log dashboard access for audit
      await this._logAuditEvent('DASHBOARD_ACCESSED', {
        userId: req.userId,
        criteria,
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        data: dashboardData,
        metadata: {
          requestId: req.id,
          generatedAt: new Date(),
          cacheStatus: dashboardData.metadata?.cached || false
        }
      });
    } catch (error) {
      logger.error('[ReportingController] Dashboard metrics error:', error);

      await this._logAuditEvent('DASHBOARD_ERROR', {
        userId: req.userId,
        error: error.message,
        timestamp: new Date()
      });

      res.status(500).json({
        success: false,
        error: 'DASHBOARD_ERROR',
        message: 'Error retrieving dashboard metrics',
        requestId: req.id
      });
    }
  }

  /**
   * Generate application processing report
   * Business Logic: Analyze application workflow performance and bottlenecks
   *
   * GET /reports/applications
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateApplicationReport(req, res) {
    try {
      // Validate request parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid application report parameters',
          details: errors.array()
        });
      }

      const criteria = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        format: req.query.format || 'json',
        includeStates: req.query.states ? req.query.states.split(',') : undefined,
        includeMetrics: req.query.includeMetrics !== 'false',
        includeRawData: req.query.includeRawData === 'true'
      };

      // Generate application report
      const applicationReport = await this.reportingService.generateApplicationReport(criteria);

      // Log report generation for audit
      await this._logAuditEvent('APPLICATION_REPORT_GENERATED', {
        userId: req.userId,
        criteria,
        reportId: applicationReport.metadata?.reportId,
        timestamp: new Date()
      });

      // Handle different response formats
      if (criteria.format === 'pdf' || criteria.format === 'excel' || criteria.format === 'csv') {
        return this._handleFileDownload(res, applicationReport, 'application_report');
      }

      res.status(200).json({
        success: true,
        data: applicationReport,
        metadata: {
          requestId: req.id,
          generatedAt: new Date(),
          format: criteria.format
        }
      });
    } catch (error) {
      logger.error('[ReportingController] Application report error:', error);

      await this._logAuditEvent('APPLICATION_REPORT_ERROR', {
        userId: req.userId,
        error: error.message,
        timestamp: new Date()
      });

      res.status(500).json({
        success: false,
        error: 'REPORT_GENERATION_ERROR',
        message: 'Error generating application report',
        requestId: req.id
      });
    }
  }

  /**
   * Generate financial performance report
   * Business Logic: Analyze revenue, payment success rates, and financial trends
   *
   * GET /reports/financial
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateFinancialReport(req, res) {
    try {
      // Validate request parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid financial report parameters',
          details: errors.array()
        });
      }

      const criteria = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        format: req.query.format || 'json',
        includeTransactions: req.query.includeTransactions === 'true',
        includeForecasting: req.query.includeForecasting === 'true',
        groupBy: req.query.groupBy || 'day'
      };

      // Generate financial report
      const financialReport = await this.reportingService.generateFinancialReport(criteria);

      // Log report generation for audit
      await this._logAuditEvent('FINANCIAL_REPORT_GENERATED', {
        userId: req.userId,
        criteria,
        reportId: financialReport.metadata?.reportId,
        timestamp: new Date()
      });

      // Handle different response formats
      if (criteria.format === 'pdf' || criteria.format === 'excel' || criteria.format === 'csv') {
        return this._handleFileDownload(res, financialReport, 'financial_report');
      }

      res.status(200).json({
        success: true,
        data: financialReport,
        metadata: {
          requestId: req.id,
          generatedAt: new Date(),
          format: criteria.format
        }
      });
    } catch (error) {
      logger.error('[ReportingController] Financial report error:', error);

      await this._logAuditEvent('FINANCIAL_REPORT_ERROR', {
        userId: req.userId,
        error: error.message,
        timestamp: new Date()
      });

      res.status(500).json({
        success: false,
        error: 'REPORT_GENERATION_ERROR',
        message: 'Error generating financial report',
        requestId: req.id
      });
    }
  }

  /**
   * Generate user activity and engagement report
   * Business Logic: Analyze user behavior and platform engagement patterns
   *
   * GET /reports/users
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateUserActivityReport(req, res) {
    try {
      // Validate request parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid user activity report parameters',
          details: errors.array()
        });
      }

      const criteria = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        format: req.query.format || 'json',
        userRoles: req.query.roles ? req.query.roles.split(',') : undefined,
        includeAnalytics: req.query.includeAnalytics === 'true',
        includeBehavioralInsights: req.query.includeBehavioralInsights === 'true'
      };

      // Generate user activity report
      const userReport = await this.reportingService.generateUserActivityReport(criteria);

      // Log report generation for audit
      await this._logAuditEvent('USER_ACTIVITY_REPORT_GENERATED', {
        userId: req.userId,
        criteria,
        reportId: userReport.metadata?.reportId,
        timestamp: new Date()
      });

      // Handle different response formats
      if (criteria.format === 'pdf' || criteria.format === 'excel' || criteria.format === 'csv') {
        return this._handleFileDownload(res, userReport, 'user_activity_report');
      }

      res.status(200).json({
        success: true,
        data: userReport,
        metadata: {
          requestId: req.id,
          generatedAt: new Date(),
          format: criteria.format
        }
      });
    } catch (error) {
      logger.error('[ReportingController] User activity report error:', error);

      await this._logAuditEvent('USER_ACTIVITY_REPORT_ERROR', {
        userId: req.userId,
        error: error.message,
        timestamp: new Date()
      });

      res.status(500).json({
        success: false,
        error: 'REPORT_GENERATION_ERROR',
        message: 'Error generating user activity report',
        requestId: req.id
      });
    }
  }

  /**
   * Generate compliance and audit report
   * Business Logic: Ensure regulatory compliance and provide audit trails
   *
   * GET /reports/compliance
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateComplianceReport(req, res) {
    try {
      // Validate request parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid compliance report parameters',
          details: errors.array()
        });
      }

      const criteria = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        reportType: req.query.reportType || 'monthly',
        complianceAreas: req.query.areas ? req.query.areas.split(',') : undefined,
        includeRecommendations: req.query.includeRecommendations !== 'false',
        format: req.query.format || 'pdf' // Default to PDF for compliance reports
      };

      // Generate compliance report using specialized service
      const complianceReport = await this.complianceService.generateDTAMComplianceReport(criteria);

      // Log compliance report generation for audit
      await this._logAuditEvent('COMPLIANCE_REPORT_GENERATED', {
        userId: req.userId,
        criteria,
        reportId: complianceReport.metadata?.reportId,
        timestamp: new Date()
      });

      // Handle file download for compliance reports
      if (criteria.format === 'pdf' || criteria.format === 'excel') {
        return this._handleFileDownload(res, complianceReport, 'compliance_report');
      }

      res.status(200).json({
        success: true,
        data: complianceReport,
        metadata: {
          requestId: req.id,
          generatedAt: new Date(),
          format: criteria.format,
          complianceFramework: 'DTAM GACP Standards'
        }
      });
    } catch (error) {
      logger.error('[ReportingController] Compliance report error:', error);

      await this._logAuditEvent('COMPLIANCE_REPORT_ERROR', {
        userId: req.userId,
        error: error.message,
        timestamp: new Date()
      });

      res.status(500).json({
        success: false,
        error: 'COMPLIANCE_REPORT_ERROR',
        message: 'Error generating compliance report',
        requestId: req.id
      });
    }
  }

  /**
   * Get business intelligence analytics
   * Business Logic: Provide comprehensive business analytics and insights
   *
   * GET /analytics/business
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBusinessAnalytics(req, res) {
    try {
      // Validate request parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid business analytics parameters',
          details: errors.array()
        });
      }

      const criteria = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        analysisTypes: req.query.analysisTypes ? req.query.analysisTypes.split(',') : undefined,
        granularity: req.query.granularity || 'daily',
        includePredictions: req.query.includePredictions === 'true'
      };

      // Generate business analytics
      const businessAnalytics = await this.analyticsService.getBusinessAnalytics(criteria);

      // Log analytics access for audit
      await this._logAuditEvent('BUSINESS_ANALYTICS_ACCESSED', {
        userId: req.userId,
        criteria,
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        data: businessAnalytics,
        metadata: {
          requestId: req.id,
          generatedAt: new Date(),
          analyticsScope: 'comprehensive'
        }
      });
    } catch (error) {
      logger.error('[ReportingController] Business analytics error:', error);

      await this._logAuditEvent('BUSINESS_ANALYTICS_ERROR', {
        userId: req.userId,
        error: error.message,
        timestamp: new Date()
      });

      res.status(500).json({
        success: false,
        error: 'ANALYTICS_ERROR',
        message: 'Error generating business analytics',
        requestId: req.id
      });
    }
  }

  /**
   * Get predictive analytics and forecasting
   * Business Logic: Provide predictive models and business forecasting
   *
   * GET /analytics/predictive
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPredictiveAnalytics(req, res) {
    try {
      // Validate request parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid predictive analytics parameters',
          details: errors.array()
        });
      }

      const criteria = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        modelTypes: req.query.models ? req.query.models.split(',') : undefined,
        forecastPeriod: parseInt(req.query.forecastPeriod) || 90, // days
        includeConfidenceIntervals: req.query.includeConfidence === 'true'
      };

      // Generate predictive models and forecasts
      const predictiveAnalytics = await this.analyticsService.generatePredictiveModels(criteria);

      // Log predictive analytics access for audit
      await this._logAuditEvent('PREDICTIVE_ANALYTICS_ACCESSED', {
        userId: req.userId,
        criteria,
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        data: predictiveAnalytics,
        metadata: {
          requestId: req.id,
          generatedAt: new Date(),
          forecastPeriod: criteria.forecastPeriod,
          modelAccuracy: predictiveAnalytics.modelPerformance?.averageAccuracy || 'N/A'
        }
      });
    } catch (error) {
      logger.error('[ReportingController] Predictive analytics error:', error);

      await this._logAuditEvent('PREDICTIVE_ANALYTICS_ERROR', {
        userId: req.userId,
        error: error.message,
        timestamp: new Date()
      });

      res.status(500).json({
        success: false,
        error: 'PREDICTIVE_ANALYTICS_ERROR',
        message: 'Error generating predictive analytics',
        requestId: req.id
      });
    }
  }

  /**
   * Get service health status
   *
   * GET /health
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getHealthStatus(req, res) {
    try {
      const healthChecks = await Promise.all([
        this.reportingService.healthCheck(),
        this.dashboardService.healthCheck(),
        this.analyticsService.healthCheck(),
        this.complianceService.healthCheck()
      ]);

      const overallHealth = {
        status: healthChecks.every(h => h.status === 'healthy') ? 'healthy' : 'degraded',
        timestamp: new Date(),
        services: {
          reporting: healthChecks[0],
          dashboard: healthChecks[1],
          analytics: healthChecks[2],
          compliance: healthChecks[3]
        }
      };

      const statusCode = overallHealth.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: overallHealth.status === 'healthy',
        data: overallHealth
      });
    } catch (error) {
      logger.error('[ReportingController] Health check error:', error);

      res.status(503).json({
        success: false,
        error: 'HEALTH_CHECK_ERROR',
        message: 'Error checking service health'
      });
    }
  }

  /**
   * Handle file download responses for reports
   * @private
   */
  _handleFileDownload(res, reportData, baseFilename) {
    const format = reportData.format || 'pdf';
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${baseFilename}_${timestamp}.${format}`;

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', this._getContentType(format));

    if (reportData.buffer) {
      res.send(reportData.buffer);
    } else {
      res.json(reportData);
    }
  }

  /**
   * Get content type for different file formats
   * @private
   */
  _getContentType(format) {
    const contentTypes = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      json: 'application/json'
    };

    return contentTypes[format] || 'application/octet-stream';
  }

  /**
   * Log audit events for compliance
   * @private
   */
  async _logAuditEvent(eventType, eventData) {
    try {
      if (this.auditService) {
        await this.auditService.log({
          type: eventType,
          ...eventData
        });
      }
    } catch (error) {
      logger.error('[ReportingController] Audit logging error:', error);
    }
  }

  /**
   * Static validation rules for endpoints
   */
  static getValidationRules() {
    return {
      dashboard: [
        query('timeframe')
          .optional()
          .isIn(['1h', '6h', '24h', '7d', '30d'])
          .withMessage('Invalid timeframe parameter'),
        query('modules')
          .optional()
          .isString()
          .withMessage('Modules must be a comma-separated string'),
        query('includeAlerts').optional().isBoolean().withMessage('includeAlerts must be boolean'),
        query('includeTrends').optional().isBoolean().withMessage('includeTrends must be boolean')
      ],
      reports: [
        query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
        query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
        query('format')
          .optional()
          .isIn(['json', 'pdf', 'excel', 'csv'])
          .withMessage('Invalid format parameter'),
        query('includeRawData').optional().isBoolean().withMessage('includeRawData must be boolean')
      ],
      analytics: [
        query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
        query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
        query('granularity')
          .optional()
          .isIn(['hourly', 'daily', 'weekly', 'monthly'])
          .withMessage('Invalid granularity parameter'),
        query('includePredictions')
          .optional()
          .isBoolean()
          .withMessage('includePredictions must be boolean')
      ]
    };
  }
}

module.exports = ReportingController;
