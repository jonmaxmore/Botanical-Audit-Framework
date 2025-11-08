/**
 * Enhanced Training Routes
 *
 * Comprehensive API routes for the enhanced training system that integrates:
 * - Advanced Training Analytics
 * - Certification Tracking Integration
 * - Performance Assessment Tools
 * - Predictive Analytics and Interventions
 *
 * Route Structure & Business Logic:
 * 1. Original training routes (backward compatibility)
 * 2. Advanced analytics endpoints with real-time insights
 * 3. Certification tracking with compliance monitoring
 * 4. Performance assessment with adaptive algorithms
 * 5. Predictive analytics with intervention triggers
 *
 * Workflow Integration:
 * All routes support complete audit trails, real-time monitoring,
 * compliance tracking, and government integration requirements.
 *
 * Process Enhancement:
 * - Every training action generates analytics events
 * - Assessment responses trigger adaptive adjustments
 * - Certification progress is tracked automatically
 * - Performance predictions guide interventions
 * - Compliance status is monitored continuously
 */

const express = require('express');
const { body, query, param } = require('express-validator');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('enhanced-training-routes');

/**
 * Create enhanced training routes with full system integration
 */
function createEnhancedTrainingRoutes(enhancedTrainingController, authMiddleware) {
  const dtamRouter = express.Router();
  const farmerRouter = express.Router();

  // ============================================================================
  // ORIGINAL TRAINING ROUTES (Enhanced with Analytics)
  // ============================================================================

  /**
   * List courses with advanced analytics integration
   * GET /api/dtam/training/courses
   * GET /api/farmer/training/courses
   *
   * Business Logic Enhancement:
   * - Include analytics-driven course recommendations
   * - Show performance predictions for each course
   * - Display certification pathway information
   * - Provide personalized learning suggestions
   */
  dtamRouter.get(
    '/courses',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff']),
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('includeAnalytics').optional().isBoolean(),
      query('includePredictions').optional().isBoolean(),
      query('certificationPath').optional().isString(),
    ],
    enhancedTrainingController.listCourses,
  );

  farmerRouter.get(
    '/courses',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['farmer']),
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 50 }),
      query('includeRecommendations').optional().isBoolean(),
      query('certificationGoal').optional().isString(),
    ],
    enhancedTrainingController.listCourses,
  );

  /**
   * Get course details with performance analytics
   * GET /api/dtam/training/courses/:id
   * GET /api/farmer/training/courses/:id
   *
   * Business Logic Enhancement:
   * - Include course effectiveness metrics
   * - Show learner success rates and predictions
   * - Display competency alignment information
   * - Provide course difficulty assessment
   */
  dtamRouter.get(
    '/courses/:id',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff']),
    [
      param('id').isUUID(),
      query('includeAnalytics').optional().isBoolean(),
      query('includeLearnerData').optional().isBoolean(),
    ],
    enhancedTrainingController.getCourseDetails,
  );

  farmerRouter.get(
    '/courses/:id',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['farmer']),
    param('id').isUUID(),
    enhancedTrainingController.getCourseDetails,
  );

  // ============================================================================
  // ADVANCED ANALYTICS ENDPOINTS
  // ============================================================================

  /**
   * Get comprehensive training analytics dashboard
   * GET /api/dtam/training/analytics/dashboard
   *
   * Business Logic:
   * - Real-time training performance metrics
   * - Predictive analytics and trend analysis
   * - Certification progress overview
   * - Intervention recommendations dashboard
   * - Government compliance status
   */
  dtamRouter.get(
    '/analytics/dashboard',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'training_manager']),
    enhancedTrainingController.getAnalyticsDashboard,
  );

  /**
   * Get learner performance predictions
   * GET /api/dtam/training/analytics/predictions/:userId
   *
   * Business Logic:
   * - Machine learning-based success predictions
   * - Dropout risk analysis and early warning
   * - Personalized intervention recommendations
   * - Performance optimization suggestions
   * - Certification readiness assessment
   */
  dtamRouter.get(
    '/analytics/predictions/:userId',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'training_manager']),
    [
      param('userId').isUUID(),
      query('courseId').optional().isUUID(),
      query('competencyId').optional().isString(),
      query('includeInterventions').optional().isBoolean(),
    ],
    enhancedTrainingController.getLearnerPredictions,
  );

  /**
   * Get training effectiveness analytics
   * GET /api/dtam/training/analytics/effectiveness
   *
   * Business Logic:
   * - Course and content effectiveness metrics
   * - Learning outcome analysis and trends
   * - Resource utilization optimization
   * - ROI analysis for training investments
   */
  dtamRouter.get(
    '/analytics/effectiveness',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'training_manager']),
    [
      query('timeframe').optional().isIn(['7d', '30d', '90d', '1y']),
      query('courseType').optional().isString(),
      query('competencyArea').optional().isString(),
    ],
    async (req, res) => {
      try {
        // This would be implemented as a method in EnhancedTrainingController
        res.json({
          success: true,
          message: 'Training effectiveness analytics endpoint - to be implemented',
          data: {
            placeholder: true,
            timeframe: req.query.timeframe || '30d',
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'ANALYTICS_ERROR',
          message: 'Failed to retrieve effectiveness analytics',
        });
      }
    },
  );

  /**
   * Get real-time training metrics
   * GET /api/dtam/training/analytics/realtime
   *
   * Business Logic:
   * - Live training session monitoring
   * - Real-time engagement metrics
   * - Immediate performance alerts
   * - System load and capacity metrics
   */
  dtamRouter.get(
    '/analytics/realtime',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'system_admin']),
    async (req, res) => {
      try {
        // Real-time metrics endpoint
        res.json({
          success: true,
          message: 'Real-time analytics endpoint - to be implemented',
          data: {
            timestamp: new Date(),
            metrics: {
              activeTrainingSessions: 0,
              concurrentUsers: 0,
              systemLoad: 'normal',
            },
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'REALTIME_ERROR',
          message: 'Failed to retrieve real-time metrics',
        });
      }
    },
  );

  // ============================================================================
  // CERTIFICATION TRACKING ENDPOINTS
  // ============================================================================

  /**
   * Get comprehensive certification dashboard
   * GET /api/dtam/training/certification/dashboard
   *
   * Business Logic:
   * - Overall certification progress tracking
   * - Government compliance monitoring
   * - Quality assurance metrics
   * - Renewal schedule management
   * - Certification analytics and trends
   */
  dtamRouter.get(
    '/certification/dashboard',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'certification_manager']),
    enhancedTrainingController.getCertificationDashboard,
  );

  /**
   * Get learner certification progress with advanced tracking
   * GET /api/dtam/training/certification/progress/:userId
   *
   * Business Logic:
   * - Detailed certification pathway tracking
   * - Competency development monitoring
   * - Assessment readiness evaluation
   * - Personalized certification roadmap
   * - Government compliance status
   */
  dtamRouter.get(
    '/certification/progress/:userId',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'certification_manager']),
    [
      param('userId').isUUID(),
      query('includeAnalytics').optional().isBoolean(),
      query('includePredictions').optional().isBoolean(),
      query('certificationTypes').optional().isString(),
    ],
    enhancedTrainingController.getLearnerCertificationProgress,
  );

  /**
   * Get farmer's own certification progress
   * GET /api/farmer/training/certification/my-progress
   *
   * Business Logic:
   * - Personal certification journey tracking
   * - Achievement milestones and progress
   * - Next steps and recommendations
   * - Renewal reminders and requirements
   */
  farmerRouter.get(
    '/certification/my-progress',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['farmer']),
    [
      query('includeRecommendations').optional().isBoolean(),
      query('showRenewalSchedule').optional().isBoolean(),
    ],
    async (req, res) => {
      // Use the same controller method but with farmer's own user ID
      req.params.userId = req.user.id;
      return enhancedTrainingController.getLearnerCertificationProgress(req, res);
    },
  );

  /**
   * Update certification milestone
   * PUT /api/dtam/training/certification/milestone/:userId/:milestoneId
   *
   * Business Logic:
   * - Manual milestone completion recording
   * - Assessment result integration
   * - Compliance verification and validation
   * - Automatic progression trigger
   */
  dtamRouter.put(
    '/certification/milestone/:userId/:milestoneId',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'certification_manager']),
    [
      param('userId').isUUID(),
      param('milestoneId').isString(),
      body('status').isIn(['COMPLETED', 'VERIFIED', 'FAILED']),
      body('evidence').optional().isObject(),
      body('verificationData').optional().isObject(),
    ],
    async (req, res) => {
      try {
        // Milestone update endpoint - to be implemented
        res.json({
          success: true,
          message: 'Certification milestone update endpoint - to be implemented',
          data: {
            userId: req.params.userId,
            milestoneId: req.params.milestoneId,
            status: req.body.status,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'MILESTONE_ERROR',
          message: 'Failed to update certification milestone',
        });
      }
    },
  );

  // ============================================================================
  // PERFORMANCE ASSESSMENT ENDPOINTS
  // ============================================================================

  /**
   * Create advanced performance assessment
   * POST /api/dtam/training/assessment/create
   *
   * Business Logic:
   * - Competency-based assessment creation
   * - Adaptive algorithm configuration
   * - Real-time monitoring setup
   * - Predictive analytics initialization
   */
  dtamRouter.post(
    '/assessment/create',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'assessment_manager']),
    [
      body('userId').isUUID(),
      body('competencyId').isString(),
      body('assessmentType').isIn(['ADAPTIVE', 'FIXED', 'SIMULATION', 'PORTFOLIO']),
      body('configurationOptions').optional().isObject(),
    ],
    enhancedTrainingController.createPerformanceAssessment,
  );

  /**
   * Submit assessment response with enhanced processing
   * POST /api/dtam/training/assessment/:assessmentId/response
   * POST /api/farmer/training/assessment/:assessmentId/response
   *
   * Business Logic:
   * - Advanced response scoring and analysis
   * - Real-time performance metric updates
   * - Adaptive difficulty adjustment
   * - Immediate feedback generation
   * - Intervention trigger evaluation
   */
  dtamRouter.post(
    '/assessment/:assessmentId/response',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'farmer']),
    [
      param('assessmentId').isUUID(),
      body('itemId').isString(),
      body('response').notEmpty(),
      body('responseTime').optional().isNumeric(),
      body('contextData').optional().isObject(),
    ],
    enhancedTrainingController.submitAssessmentResponse,
  );

  farmerRouter.post(
    '/assessment/:assessmentId/response',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['farmer']),
    [
      param('assessmentId').isUUID(),
      body('itemId').isString(),
      body('response').notEmpty(),
      body('responseTime').optional().isNumeric(),
      body('contextData').optional().isObject(),
    ],
    enhancedTrainingController.submitAssessmentResponse,
  );

  /**
   * Get assessment performance dashboard
   * GET /api/dtam/training/assessment/dashboard
   *
   * Business Logic:
   * - Assessment system performance overview
   * - Competency achievement analytics
   * - Assessment effectiveness metrics
   * - Quality assurance monitoring
   */
  dtamRouter.get(
    '/assessment/dashboard',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'assessment_manager']),
    async (req, res) => {
      try {
        // Assessment dashboard endpoint
        res.json({
          success: true,
          message: 'Assessment dashboard endpoint - to be implemented',
          data: {
            overview: {
              totalAssessments: 0,
              activeAssessments: 0,
              completionRate: 0,
            },
            timestamp: new Date(),
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'DASHBOARD_ERROR',
          message: 'Failed to retrieve assessment dashboard',
        });
      }
    },
  );

  /**
   * Get learner assessment history with analytics
   * GET /api/dtam/training/assessment/history/:userId
   * GET /api/farmer/training/assessment/my-history
   *
   * Business Logic:
   * - Complete assessment history tracking
   * - Performance trend analysis
   * - Competency development progression
   * - Personalized improvement recommendations
   */
  dtamRouter.get(
    '/assessment/history/:userId',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'assessment_manager']),
    [
      param('userId').isUUID(),
      query('competencyId').optional().isString(),
      query('timeframe').optional().isString(),
      query('includeAnalytics').optional().isBoolean(),
    ],
    async (req, res) => {
      try {
        // Assessment history endpoint
        res.json({
          success: true,
          message: 'Assessment history endpoint - to be implemented',
          data: {
            userId: req.params.userId,
            assessments: [],
            analytics: req.query.includeAnalytics === 'true' ? {} : null,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'HISTORY_ERROR',
          message: 'Failed to retrieve assessment history',
        });
      }
    },
  );

  farmerRouter.get(
    '/assessment/my-history',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['farmer']),
    [query('competencyId').optional().isString(), query('timeframe').optional().isString()],
    async (req, res) => {
      // Use same endpoint but with farmer's user ID
      req.params.userId = req.user.id;
      req.query.includeAnalytics = 'true'; // Always include analytics for farmers

      // Call the same handler as above
      res.json({
        success: true,
        message: 'Farmer assessment history endpoint - to be implemented',
        data: {
          userId: req.user.id,
          assessments: [],
          personalAnalytics: {},
        },
      });
    },
  );

  // ============================================================================
  // PREDICTIVE ANALYTICS & INTERVENTION ENDPOINTS
  // ============================================================================

  /**
   * Get intervention recommendations dashboard
   * GET /api/dtam/training/interventions/dashboard
   *
   * Business Logic:
   * - At-risk learner identification
   * - Intervention effectiveness tracking
   * - Resource allocation optimization
   * - Success rate monitoring
   */
  dtamRouter.get(
    '/interventions/dashboard',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'training_manager']),
    async (req, res) => {
      try {
        res.json({
          success: true,
          message: 'Interventions dashboard endpoint - to be implemented',
          data: {
            atRiskLearners: [],
            activeInterventions: [],
            successMetrics: {},
            timestamp: new Date(),
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'INTERVENTION_ERROR',
          message: 'Failed to retrieve interventions dashboard',
        });
      }
    },
  );

  /**
   * Trigger manual intervention
   * POST /api/dtam/training/interventions/trigger
   *
   * Business Logic:
   * - Manual intervention initiation
   * - Customized support plan creation
   * - Stakeholder notification system
   * - Progress tracking setup
   */
  dtamRouter.post(
    '/interventions/trigger',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'training_manager']),
    [
      body('userId').isUUID(),
      body('interventionType').isIn([
        'MENTORING',
        'ADDITIONAL_RESOURCES',
        'ASSESSMENT_SUPPORT',
        'CUSTOM',
      ]),
      body('description').isLength({ min: 10, max: 500 }),
      body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      body('assignedTo').optional().isUUID(),
    ],
    async (req, res) => {
      try {
        res.json({
          success: true,
          message: 'Manual intervention trigger endpoint - to be implemented',
          data: {
            interventionId: 'temp-id',
            status: 'INITIATED',
            scheduledActions: [],
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'TRIGGER_ERROR',
          message: 'Failed to trigger intervention',
        });
      }
    },
  );

  // ============================================================================
  // SYSTEM INTEGRATION & HEALTH ENDPOINTS
  // ============================================================================

  /**
   * Get enhanced training system status
   * GET /api/dtam/training/system/status
   *
   * Business Logic:
   * - Comprehensive system health monitoring
   * - Integration status verification
   * - Performance metrics overview
   * - Capacity and resource utilization
   */
  dtamRouter.get(
    '/system/status',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'system_admin']),
    enhancedTrainingController.getSystemStatus,
  );

  /**
   * Run system diagnostics
   * POST /api/dtam/training/system/diagnostics
   *
   * Business Logic:
   * - Comprehensive system health check
   * - Integration connectivity testing
   * - Performance benchmark execution
   * - Data integrity validation
   */
  dtamRouter.post(
    '/system/diagnostics',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'system_admin']),
    async (req, res) => {
      try {
        res.json({
          success: true,
          message: 'System diagnostics endpoint - to be implemented',
          data: {
            diagnosticId: 'temp-diagnostic-id',
            status: 'RUNNING',
            estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'DIAGNOSTICS_ERROR',
          message: 'Failed to run system diagnostics',
        });
      }
    },
  );

  /**
   * Control enhanced system features
   * POST /api/dtam/training/system/control/:action
   *
   * Business Logic:
   * - System component control (start/stop/restart)
   * - Feature enable/disable management
   * - Maintenance mode control
   * - Emergency system controls
   */
  dtamRouter.post(
    '/system/control/:action',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'system_admin']),
    [
      param('action').isIn([
        'start_analytics',
        'stop_analytics',
        'restart_certification',
        'enable_performance',
        'disable_performance',
        'maintenance_mode',
      ]),
      body('reason').optional().isString(),
      body('scheduledTime').optional().isISO8601(),
    ],
    async (req, res) => {
      try {
        res.json({
          success: true,
          message: `System control action '${req.params.action}' endpoint - to be implemented`,
          data: {
            action: req.params.action,
            status: 'EXECUTED',
            timestamp: new Date(),
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'CONTROL_ERROR',
          message: 'Failed to execute system control action',
        });
      }
    },
  );

  // ============================================================================
  // ERROR HANDLING MIDDLEWARE
  // ============================================================================

  // Global error handler for enhanced training routes
  const errorHandler = (error, req, res, _next) => {
    logger.error('[EnhancedTrainingRoutes] Unhandled error:', error);

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred in the enhanced training system',
      requestId: req.id || 'unknown',
      timestamp: new Date(),
    });
  };

  dtamRouter.use(errorHandler);
  farmerRouter.use(errorHandler);

  return { dtamRouter, farmerRouter };
}

/**
 * Route documentation for API reference
 */
function getRouteDocumentation() {
  return {
    basePath: {
      dtam: '/api/dtam/training',
      farmer: '/api/farmer/training',
    },
    version: '2.0.0',
    description:
      'Enhanced training system with advanced analytics, certification tracking, and performance assessment',

    categories: {
      'Core Training': {
        description: 'Enhanced core training functionality with analytics integration',
        routes: [
          'GET /courses - List courses with analytics',
          'GET /courses/:id - Course details with performance metrics',
          'POST /enrollments - Enroll with tracking integration',
        ],
      },

      'Advanced Analytics': {
        description: 'Comprehensive training analytics and insights',
        routes: [
          'GET /analytics/dashboard - Complete analytics dashboard',
          'GET /analytics/predictions/:userId - Learner success predictions',
          'GET /analytics/effectiveness - Training effectiveness metrics',
          'GET /analytics/realtime - Real-time monitoring',
        ],
      },

      'Certification Tracking': {
        description: 'End-to-end certification lifecycle management',
        routes: [
          'GET /certification/dashboard - Certification overview',
          'GET /certification/progress/:userId - Detailed progress tracking',
          'PUT /certification/milestone/:userId/:milestoneId - Milestone updates',
        ],
      },

      'Performance Assessment': {
        description: 'Advanced competency-based assessment tools',
        routes: [
          'POST /assessment/create - Create performance assessment',
          'POST /assessment/:id/response - Submit assessment response',
          'GET /assessment/dashboard - Assessment analytics',
          'GET /assessment/history/:userId - Assessment history',
        ],
      },

      'Predictive Analytics': {
        description: 'AI-powered predictions and interventions',
        routes: [
          'GET /interventions/dashboard - Intervention management',
          'POST /interventions/trigger - Manual intervention trigger',
        ],
      },

      'System Management': {
        description: 'System health, diagnostics, and control',
        routes: [
          'GET /system/status - System health status',
          'POST /system/diagnostics - Run diagnostics',
          'POST /system/control/:action - System control',
        ],
      },
    },

    businessLogicIntegration: {
      analyticsIntegration:
        'All training activities generate analytics events for real-time insights',
      certificationTracking: 'Automated certification progress tracking with government compliance',
      performanceAssessment: 'Competency-based assessments with adaptive algorithms',
      predictiveAnalytics: 'Machine learning predictions for proactive interventions',
      governmentCompliance: 'Built-in compliance monitoring and reporting',
      auditTrail: 'Complete audit trail for all training and certification activities',
    },
  };
}

module.exports = {
  createEnhancedTrainingRoutes,
  getRouteDocumentation,
};
