/**
 * GACP Survey System - API Routes Configuration
 * ระบบกำหนดเส้นทาง API endpoints สำหรับ Survey System
 *
 * Business Logic & Process Workflow:
 * 1. Route Organization - การจัดระเบียบ API endpoints ตาม RESTful principles
 * 2. Middleware Integration - การผสานระบบ authentication และ validation
 * 3. Error Handling - การจัดการข้อผิดพลาดในระดับ route
 * 4. API Documentation - การสร้าง documentation สำหรับ endpoints
 *
 * Technical Implementation:
 * - Express.js router configuration
 * - Middleware chain setup for authentication และ validation
 * - Proper HTTP method mapping สำหรับแต่ละ operation
 * - Consistent API versioning และ endpoint structure
 */

const express = require('express');
const router = express.Router();

/**
 * Survey Routes Setup Function
 * ฟังก์ชันสำหรับกำหนดเส้นทาง API ของ Survey System
 *
 * Input Parameters:
 * @param {Object} dependencies - ออบเจ็กต์ที่มี controllers และ middleware
 *
 * Route Structure:
 * - /api/surveys/* - Survey management endpoints
 * - /api/survey-responses/* - Survey response management endpoints
 * - /api/farms/:farmId/surveys/* - Farm-specific survey endpoints
 *
 * Middleware Chain:
 * 1. Authentication middleware - ตรวจสอบการ login
 * 2. Authorization middleware - ตรวจสอบสิทธิ์การเข้าถึง
 * 3. Input validation middleware - ตรวจสอบความถูกต้องของข้อมูล
 * 4. Rate limiting middleware - จำกัดการเรียกใช้ API
 * 5. Audit logging middleware - บันทึก activity log
 */
function setupSurveyRoutes(dependencies) {
  const {
    surveyController,
    surveyResponseController,
    authMiddleware,
    validationMiddleware,
    rateLimitMiddleware,
    auditMiddleware,
    logger
  } = dependencies;

  // =============================================================================
  // SURVEY MANAGEMENT ROUTES
  // =============================================================================

  /**
   * Create New Survey
   * POST /api/surveys
   *
   * สร้างแบบสำรวจใหม่ในระบบ
   *
   * Middleware Chain:
   * - Authentication: ตรวจสอบการ login
   * - Rate Limiting: จำกัด 10 requests ต่อนาที
   * - Input Validation: ตรวจสอบ required fields
   * - Audit Logging: บันทึก activity
   *
   * Business Rules:
   * - ผู้ใช้ต้องมีสิทธิ์ในการสร้าง survey
   * - ข้อมูล survey ต้องถูกต้องตาม schema
   * - บันทึก audit trail การสร้าง
   */
  router.post(
    '/surveys',
    authMiddleware.authenticate,
    rateLimitMiddleware.createSurvey,
    validationMiddleware.validateCreateSurvey,
    auditMiddleware.logActivity('survey_create'),
    async(req, res) => {
      try {
        await surveyController.createSurvey(req, res);
      } catch (error) {
        logger.error('Survey creation route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Get Survey by ID
   * GET /api/surveys/:id
   *
   * ดึงข้อมูลแบบสำรวจตาม ID
   */
  router.get(
    '/surveys/:id',
    authMiddleware.authenticate,
    rateLimitMiddleware.getSurvey,
    auditMiddleware.logActivity('survey_view'),
    async(req, res) => {
      try {
        await surveyController.getSurveyById(req, res);
      } catch (error) {
        logger.error('Survey retrieval route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Update Survey
   * PUT /api/surveys/:id
   *
   * อัปเดตข้อมูลแบบสำรวจ
   */
  router.put(
    '/surveys/:id',
    authMiddleware.authenticate,
    rateLimitMiddleware.updateSurvey,
    validationMiddleware.validateUpdateSurvey,
    auditMiddleware.logActivity('survey_update'),
    async(req, res) => {
      try {
        await surveyController.updateSurvey(req, res);
      } catch (error) {
        logger.error('Survey update route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Delete Survey
   * DELETE /api/surveys/:id
   *
   * ลบแบบสำรวจ (soft delete)
   */
  router.delete(
    '/surveys/:id',
    authMiddleware.authenticate,
    rateLimitMiddleware.deleteSurvey,
    auditMiddleware.logActivity('survey_delete'),
    async(req, res) => {
      try {
        await surveyController.deleteSurvey(req, res);
      } catch (error) {
        logger.error('Survey deletion route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Search Surveys
   * POST /api/surveys/search
   *
   * ค้นหาแบบสำรวจด้วยเงื่อนไขที่หลากหลาย
   */
  router.post(
    '/surveys/search',
    authMiddleware.authenticate,
    rateLimitMiddleware.searchSurveys,
    validationMiddleware.validateSearchSurveys,
    auditMiddleware.logActivity('survey_search'),
    async(req, res) => {
      try {
        await surveyController.searchSurveys(req, res);
      } catch (error) {
        logger.error('Survey search route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Get Survey Statistics
   * GET /api/surveys/statistics
   *
   * ดึงสถิติของแบบสำรวจ
   */
  router.get(
    '/surveys/statistics',
    authMiddleware.authenticate,
    rateLimitMiddleware.getSurveyStatistics,
    auditMiddleware.logActivity('survey_statistics'),
    async(req, res) => {
      try {
        await surveyController.getSurveyStatistics(req, res);
      } catch (error) {
        logger.error('Survey statistics route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // FARM-SPECIFIC SURVEY ROUTES
  // =============================================================================

  /**
   * Get Farm Surveys
   * GET /api/farms/:farmId/surveys
   *
   * ดึงรายการแบบสำรวจของฟาร์มที่ระบุ
   */
  router.get(
    '/farms/:farmId/surveys',
    authMiddleware.authenticate,
    rateLimitMiddleware.getFarmSurveys,
    validationMiddleware.validateFarmId,
    auditMiddleware.logActivity('farm_surveys_view'),
    async(req, res) => {
      try {
        await surveyController.getFarmSurveys(req, res);
      } catch (error) {
        logger.error('Farm surveys retrieval route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // SURVEY RESPONSE ROUTES
  // =============================================================================

  /**
   * Start Survey Response
   * POST /api/survey-responses
   *
   * เริ่มต้นการทำแบบสำรวจ
   */
  router.post(
    '/survey-responses',
    authMiddleware.authenticate,
    rateLimitMiddleware.startSurveyResponse,
    validationMiddleware.validateStartResponse,
    auditMiddleware.logActivity('response_start'),
    async(req, res) => {
      try {
        await surveyResponseController.startSurveyResponse(req, res);
      } catch (error) {
        logger.error('Survey response start route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Get Survey Response
   * GET /api/survey-responses/:id
   *
   * ดึงข้อมูลการตอบแบบสำรวจ
   */
  router.get(
    '/survey-responses/:id',
    authMiddleware.authenticate,
    rateLimitMiddleware.getSurveyResponse,
    auditMiddleware.logActivity('response_view'),
    async(req, res) => {
      try {
        await surveyResponseController.getSurveyResponse(req, res);
      } catch (error) {
        logger.error('Survey response retrieval route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Record Single Answer
   * PUT /api/survey-responses/:id/answers/:questionId
   *
   * บันทึกคำตอบสำหรับคำถามเฉพาะ
   */
  router.put(
    '/survey-responses/:id/answers/:questionId',
    authMiddleware.authenticate,
    rateLimitMiddleware.recordAnswer,
    validationMiddleware.validateAnswerInput,
    auditMiddleware.logActivity('answer_record'),
    async(req, res) => {
      try {
        await surveyResponseController.recordAnswer(req, res);
      } catch (error) {
        logger.error('Answer recording route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Record Multiple Answers
   * PUT /api/survey-responses/:id/answers
   *
   * บันทึกคำตอบหลายคำถามพร้อมกัน
   */
  router.put(
    '/survey-responses/:id/answers',
    authMiddleware.authenticate,
    rateLimitMiddleware.recordMultipleAnswers,
    validationMiddleware.validateMultipleAnswers,
    auditMiddleware.logActivity('multiple_answers_record'),
    async(req, res) => {
      try {
        await surveyResponseController.recordMultipleAnswers(req, res);
      } catch (error) {
        logger.error('Multiple answers recording route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Complete Survey Response
   * POST /api/survey-responses/:id/complete
   *
   * ทำเครื่องหมายการตอบแบบสำรวจเป็นเสร็จสมบูรณ์
   */
  router.post(
    '/survey-responses/:id/complete',
    authMiddleware.authenticate,
    rateLimitMiddleware.completeSurveyResponse,
    validationMiddleware.validateCompletionInput,
    auditMiddleware.logActivity('response_complete'),
    async(req, res) => {
      try {
        await surveyResponseController.completeSurveyResponse(req, res);
      } catch (error) {
        logger.error('Survey response completion route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Get Response Progress
   * GET /api/survey-responses/:id/progress
   *
   * ดึงข้อมูลความคืบหน้าของการทำแบบสำรวจ
   */
  router.get(
    '/survey-responses/:id/progress',
    authMiddleware.authenticate,
    rateLimitMiddleware.getResponseProgress,
    auditMiddleware.logActivity('progress_view'),
    async(req, res) => {
      try {
        await surveyResponseController.getResponseProgress(req, res);
      } catch (error) {
        logger.error('Response progress route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  /**
   * Get Survey Responses
   * GET /api/surveys/:surveyId/responses
   *
   * ดึงรายการการตอบแบบสำรวจทั้งหมดของ Survey
   */
  router.get(
    '/surveys/:surveyId/responses',
    authMiddleware.authenticate,
    rateLimitMiddleware.getSurveyResponses,
    validationMiddleware.validateSurveyId,
    auditMiddleware.logActivity('survey_responses_view'),
    async(req, res) => {
      try {
        await surveyResponseController.getSurveyResponses(req, res);
      } catch (error) {
        logger.error('Survey responses retrieval route error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error occurred'
          }
        });
      }
    }
  );

  // =============================================================================
  // ADDITIONAL UTILITY ROUTES
  // =============================================================================

  /**
   * Health Check
   * GET /api/surveys/health
   *
   * ตรวจสอบสถานะการทำงานของ Survey System
   */
  router.get('/surveys/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      service: 'survey-system',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  /**
   * API Documentation
   * GET /api/surveys/docs
   *
   * ส่งคืน API documentation
   */
  router.get('/surveys/docs', (req, res) => {
    res.status(200).json({
      success: true,
      documentation: {
        title: 'GACP Survey System API',
        version: '1.0.0',
        description: 'API endpoints for GACP survey management and response tracking',
        endpoints: {
          surveys: [
            'POST /api/surveys - Create survey',
            'GET /api/surveys/:id - Get survey by ID',
            'PUT /api/surveys/:id - Update survey',
            'DELETE /api/surveys/:id - Delete survey',
            'POST /api/surveys/search - Search surveys',
            'GET /api/surveys/statistics - Get statistics'
          ],
          responses: [
            'POST /api/survey-responses - Start survey response',
            'GET /api/survey-responses/:id - Get response',
            'PUT /api/survey-responses/:id/answers/:questionId - Record answer',
            'PUT /api/survey-responses/:id/answers - Record multiple answers',
            'POST /api/survey-responses/:id/complete - Complete response',
            'GET /api/survey-responses/:id/progress - Get progress'
          ]
        }
      }
    });
  });

  // =============================================================================
  // ERROR HANDLING MIDDLEWARE
  // =============================================================================

  /**
   * Route Not Found Handler
   * จัดการกรณีที่เรียกใช้ route ที่ไม่มีอยู่
   */
  router.use('*', (req, res) => {
    logger.warn('Survey system route not found', {
      method: req.method,
      path: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested survey system endpoint was not found',
        path: req.originalUrl,
        method: req.method
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * General Error Handler
   * จัดการข้อผิดพลาดทั่วไปในระดับ route
   */
  router.use((error, req, res, next) => {
    logger.error('Survey system route error:', {
      error: error.message,
      stack: error.stack,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.id
    });

    // ตรวจสอบประเภทข้อผิดพลาด
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          details: error.message
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred in survey system'
      },
      timestamp: new Date().toISOString()
    });
  });

  logger.info('Survey System routes configured successfully', {
    totalRoutes: router.stack.length,
    timestamp: new Date().toISOString()
  });

  return router;
}

module.exports = setupSurveyRoutes;
