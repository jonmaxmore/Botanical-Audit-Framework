/**
 * Reporting Routes Configuration
 *
 * Express router for reporting and analytics endpoints with comprehensive
 * security, validation, and role-based access control for the GACP platform.
 *
 * Routes Overview:
 * GET    /dashboard                    - Real-time dashboard metrics
 * GET    /reports/applications         - Application processing reports
 * GET    /reports/financial            - Financial performance reports
 * GET    /reports/users                - User activity reports
 * GET    /reports/compliance           - Compliance and audit reports
 * GET    /analytics/business           - Business intelligence analytics
 * GET    /analytics/predictive         - Predictive modeling and forecasts
 * GET    /health                       - Service health check
 *
 * Security Features:
 * - JWT authentication on all routes
 * - Role-based authorization for sensitive reports
 * - Rate limiting for resource-intensive operations
 * - Input validation and sanitization
 * - Comprehensive audit logging
 *
 * Business Logic Integration:
 * - Real-time data aggregation and processing
 * - Multi-format export capabilities (PDF, Excel, CSV, JSON)
 * - Government compliance reporting automation
 * - Performance analytics and optimization insights
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const ReportingController = require('../controllers/ReportingController');
const AuthenticationMiddleware = require('../../../user-management/presentation/middleware/AuthenticationMiddleware');

class ReportingRoutes {
  constructor(dependencies = {}) {
    this.router = express.Router();
    this.reportingController = new ReportingController(dependencies);
    this.authMiddleware = new AuthenticationMiddleware(dependencies);

    // Configure rate limiting for different operations
    this.reportLimiter = this._configureReportRateLimit();
    this.analyticsLimiter = this._configureAnalyticsRateLimit();
    this.dashboardLimiter = this._configureDashboardRateLimit();

    this._setupRoutes();
    console.log('[ReportingRoutes] Initialized with comprehensive reporting endpoints');
  }

  /**
   * Setup all reporting routes with appropriate middleware
   * @private
   */
  _setupRoutes() {
    const router = this.router;
    const controller = this.reportingController;
    const auth = this.authMiddleware;
    const validationRules = ReportingController.getValidationRules();

    // Apply authentication to all routes
    router.use(auth.authenticateJWT.bind(auth));

    // Dashboard routes - Real-time metrics for administrators
    router.get(
      '/dashboard',
      auth.requireRole(['DTAM_ADMIN', 'DTAM_REVIEWER']),
      this.dashboardLimiter,
      validationRules.dashboard,
      controller.getDashboardMetrics.bind(controller)
    );

    // Application reporting routes
    router.get(
      '/reports/applications',
      auth.requireRole(['DTAM_ADMIN', 'DTAM_REVIEWER']),
      this.reportLimiter,
      validationRules.reports,
      controller.generateApplicationReport.bind(controller)
    );

    // Financial reporting routes
    router.get(
      '/reports/financial',
      auth.requireRole(['DTAM_ADMIN']), // More restrictive for financial data
      this.reportLimiter,
      validationRules.reports,
      controller.generateFinancialReport.bind(controller)
    );

    // User activity reporting routes
    router.get(
      '/reports/users',
      auth.requireRole(['DTAM_ADMIN', 'DTAM_REVIEWER']),
      this.reportLimiter,
      validationRules.reports,
      controller.generateUserActivityReport.bind(controller)
    );

    // Compliance reporting routes - Government oversight
    router.get(
      '/reports/compliance',
      auth.requireRole(['DTAM_ADMIN']), // Most restrictive for compliance reports
      this.reportLimiter,
      validationRules.reports,
      controller.generateComplianceReport.bind(controller)
    );

    // Business analytics routes
    router.get(
      '/analytics/business',
      auth.requireRole(['DTAM_ADMIN', 'DTAM_REVIEWER']),
      this.analyticsLimiter,
      validationRules.analytics,
      controller.getBusinessAnalytics.bind(controller)
    );

    // Predictive analytics routes
    router.get(
      '/analytics/predictive',
      auth.requireRole(['DTAM_ADMIN']), // Predictive models are admin-only
      this.analyticsLimiter,
      validationRules.analytics,
      controller.getPredictiveAnalytics.bind(controller)
    );

    // Service health check - No authentication required
    router.get('/health', controller.getHealthStatus.bind(controller));

    // Error handling middleware
    router.use(this._handleErrors.bind(this));
  }

  /**
   * Configure rate limiting for report generation
   * @private
   */
  _configureReportRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each user to 10 report requests per windowMs
      message: {
        success: false,
        error: 'REPORT_RATE_LIMIT',
        message: 'Too many report generation requests, please try again later',
        retryAfter: 15 * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: req => {
        return req.userId || req.ip;
      },
      skip: req => {
        // Skip rate limiting for health checks
        return req.path === '/health';
      },
      handler: (req, res) => {
        console.warn(`[ReportingRoutes] Report rate limit exceeded for user: ${req.userId}`);
        res.status(429).json({
          success: false,
          error: 'REPORT_RATE_LIMIT',
          message: 'Too many report generation requests, please try again later',
          retryAfter: 15 * 60
        });
      }
    });
  }

  /**
   * Configure rate limiting for analytics operations
   * @private
   */
  _configureAnalyticsRateLimit() {
    return rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 20, // limit each user to 20 analytics requests per windowMs
      message: {
        success: false,
        error: 'ANALYTICS_RATE_LIMIT',
        message: 'Too many analytics requests, please try again later',
        retryAfter: 10 * 60
      },
      keyGenerator: req => {
        return req.userId || req.ip;
      },
      handler: (req, res) => {
        console.warn(`[ReportingRoutes] Analytics rate limit exceeded for user: ${req.userId}`);
        res.status(429).json({
          success: false,
          error: 'ANALYTICS_RATE_LIMIT',
          message: 'Too many analytics requests, please try again later',
          retryAfter: 10 * 60
        });
      }
    });
  }

  /**
   * Configure rate limiting for dashboard operations
   * @private
   */
  _configureDashboardRateLimit() {
    return rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60, // limit each user to 60 dashboard requests per minute
      message: {
        success: false,
        error: 'DASHBOARD_RATE_LIMIT',
        message: 'Too many dashboard requests, please try again later',
        retryAfter: 60
      },
      keyGenerator: req => {
        return req.userId || req.ip;
      },
      handler: (req, res) => {
        console.warn(`[ReportingRoutes] Dashboard rate limit exceeded for user: ${req.userId}`);
        res.status(429).json({
          success: false,
          error: 'DASHBOARD_RATE_LIMIT',
          message: 'Too many dashboard requests, please try again later',
          retryAfter: 60
        });
      }
    });
  }

  /**
   * Error handling middleware
   * @private
   */
  _handleErrors(error, req, res, next) {
    console.error('[ReportingRoutes] Unhandled error:', error);

    // Log error details for debugging
    const errorDetails = {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      url: req.url,
      method: req.method,
      userId: req.userId,
      timestamp: new Date()
    };

    console.error('[ReportingRoutes] Error details:', errorDetails);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details: error.errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ID',
        message: 'Invalid ID format'
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'SERVICE_UNAVAILABLE',
        message: 'External service temporarily unavailable'
      });
    }

    if (error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'REQUEST_TIMEOUT',
        message: 'Request processing timeout'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while processing your request',
      requestId: req.id || 'unknown'
    });
  }

  /**
   * Get the configured router
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get route information for documentation
   */
  getRouteInfo() {
    return {
      module: 'ReportingRoutes',
      version: '1.0.0',
      endpoints: [
        {
          method: 'GET',
          path: '/dashboard',
          description: 'Get real-time dashboard metrics',
          authentication: 'required',
          authorization: 'DTAM_ADMIN, DTAM_REVIEWER',
          rateLimit: 'dashboard'
        },
        {
          method: 'GET',
          path: '/reports/applications',
          description: 'Generate application processing report',
          authentication: 'required',
          authorization: 'DTAM_ADMIN, DTAM_REVIEWER',
          rateLimit: 'report'
        },
        {
          method: 'GET',
          path: '/reports/financial',
          description: 'Generate financial performance report',
          authentication: 'required',
          authorization: 'DTAM_ADMIN',
          rateLimit: 'report'
        },
        {
          method: 'GET',
          path: '/reports/users',
          description: 'Generate user activity report',
          authentication: 'required',
          authorization: 'DTAM_ADMIN, DTAM_REVIEWER',
          rateLimit: 'report'
        },
        {
          method: 'GET',
          path: '/reports/compliance',
          description: 'Generate compliance and audit report',
          authentication: 'required',
          authorization: 'DTAM_ADMIN',
          rateLimit: 'report'
        },
        {
          method: 'GET',
          path: '/analytics/business',
          description: 'Get business intelligence analytics',
          authentication: 'required',
          authorization: 'DTAM_ADMIN, DTAM_REVIEWER',
          rateLimit: 'analytics'
        },
        {
          method: 'GET',
          path: '/analytics/predictive',
          description: 'Get predictive analytics and forecasts',
          authentication: 'required',
          authorization: 'DTAM_ADMIN',
          rateLimit: 'analytics'
        },
        {
          method: 'GET',
          path: '/health',
          description: 'Service health check',
          authentication: 'none',
          authorization: 'none',
          rateLimit: 'none'
        }
      ],
      rateLimits: {
        dashboard: '60 requests per minute',
        report: '10 requests per 15 minutes',
        analytics: '20 requests per 10 minutes'
      },
      security: {
        authentication: 'JWT Bearer token',
        authorization: 'Role-based access control',
        inputValidation: 'express-validator',
        rateLimiting: 'express-rate-limit',
        auditLogging: 'Comprehensive activity tracking'
      },
      exportFormats: {
        reports: ['json', 'pdf', 'excel', 'csv'],
        analytics: ['json'],
        dashboard: ['json']
      },
      businessIntegration: {
        realTimeData: 'Live metrics and KPIs',
        complianceReporting: 'DTAM regulatory compliance',
        businessIntelligence: 'Predictive analytics and insights',
        auditSupport: 'Complete audit trail generation'
      }
    };
  }
}

module.exports = ReportingRoutes;
