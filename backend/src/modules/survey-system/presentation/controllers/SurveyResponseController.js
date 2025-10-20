/**
 * GACP Survey System - Survey Response Controller (Presentation Layer)
 * ระบบ Controller สำหรับจัดการ HTTP requests ของ Survey Response operations
 *
 * Business Logic & Process Workflow:
 * 1. Response Management API - การจัดการ endpoints สำหรับการตอบแบบสำรวจ
 * 2. Real-time Progress Tracking - การติดตามความคืบหน้าแบบเรียลไทม์
 * 3. Answer Recording & Validation - การบันทึกและตรวจสอบคำตอบ
 * 4. Completion Assessment - การประเมินความสมบูรณ์และคำนวณคะแนน
 *
 * Technical Implementation:
 * - RESTful API for survey response lifecycle management
 * - Real-time progress updates through WebSocket (future enhancement)
 * - Comprehensive validation for answer formats and constraints
 * - Detailed audit trail for response tracking
 */

/**
 * SurveyResponseController - คลาสสำหรับจัดการ HTTP requests ของ Survey Response
 *
 * Process Flow:
 * 1. Response Session Management - การจัดการ session การทำแบบสำรวจ
 * 2. Answer Recording - การบันทึกคำตอบแบบทีละคำถามหรือทั้งหมด
 * 3. Progress Monitoring - การติดตามและรายงานความคืบหน้า
 * 4. Completion Processing - การดำเนินการเมื่อทำแบบสำรวจเสร็จ
 *
 * API Endpoints:
 * - POST /responses - สร้าง response session ใหม่
 * - GET /responses/:id - ดึงข้อมูล response
 * - PUT /responses/:id/answers/:questionId - บันทึกคำตอบ
 * - POST /responses/:id/complete - ทำเครื่องหมายเสร็จสมบูรณ์
 * - GET /responses/:id/progress - ดึงความคืบหน้า
 *
 * Business Rules Integration:
 * - ตรวจสอบสิทธิ์ในการเข้าถึงและแก้ไข response
 * - บันทึก audit trail ทุกการเปลี่ยนแปลง
 * - คำนวณคะแนนและ quality metrics แบบเรียลไทม์
 * - รองรับการ pause และ resume การทำแบบสำรวจ
 */
class SurveyResponseController {
  constructor(surveyManagementUseCase, logger) {
    this.surveyManagementUseCase = surveyManagementUseCase;
    this.logger = logger;
  }

  /**
   * Start Survey Response
   * POST /api/survey-responses
   *
   * เริ่มต้นการทำแบบสำรวจใหม่
   *
   * Request Body:
   * {
   *   "surveyId": "survey123",
   *   "farmId": "farm123",
   *   "respondentName": "นายสมชาย ใจดี",
   *   "respondentRole": "เจ้าของฟาร์ม",
   *   "metadata": {
   *     "deviceType": "mobile",
   *     "location": "Thailand"
   *   }
   * }
   *
   * Business Process:
   * 1. Validate survey availability และ farm permissions
   * 2. Check for existing incomplete responses
   * 3. Create new response session or return existing
   * 4. Initialize progress tracking
   *
   * Response:
   * - Returns response object with sessionId for tracking
   * - Includes survey metadata และ progress information
   * - Provides next steps or resumption point
   */
  async startSurveyResponse(req, res) {
    try {
      this.logger.info('Survey response start request', {
        userId: req.user?.id,
        surveyId: req.body?.surveyId,
        farmId: req.body?.farmId,
      });

      // Input validation
      const validationResult = this.validateStartResponseInput(req.body);
      if (!validationResult.isValid) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Input validation failed',
          validationResult.errors,
        );
      }

      // Authorization check
      const authResult = await this.checkResponseCreatePermission(
        req.user,
        req.body.surveyId,
        req.body.farmId,
      );
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to start survey response',
        );
      }

      // Execute business logic
      const responseData = {
        ...req.body,
        createdBy: req.user.id,
        metadata: {
          ...req.body.metadata,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
        },
      };

      const surveyResponse = await this.surveyManagementUseCase.startSurveyResponse(responseData);

      this.logger.info('Survey response started successfully', {
        responseId: surveyResponse.id,
        surveyId: surveyResponse.surveyId,
        sessionId: surveyResponse.sessionId,
      });

      return this.sendSuccessResponse(
        res,
        201,
        {
          response: surveyResponse,
          nextSteps: this.generateNextSteps(surveyResponse),
        },
        'Survey response started successfully',
      );
    } catch (error) {
      this.logger.error('Survey response start failed:', error);

      if (error.message.includes('not found')) {
        return this.sendErrorResponse(res, 404, 'SURVEY_NOT_FOUND', 'Survey not found or inactive');
      }

      return this.sendErrorResponse(res, 500, 'START_ERROR', 'Failed to start survey response', {
        details: error.message,
      });
    }
  }

  /**
   * Get Survey Response
   * GET /api/survey-responses/:id
   *
   * ดึงข้อมูลการตอบแบบสำรวจ
   *
   * URL Parameters:
   * - id: Response ID
   *
   * Query Parameters:
   * - includeAnswers: boolean - รวมคำตอบหรือไม่
   * - includeProgress: boolean - รวมข้อมูลความคืบหน้าหรือไม่
   * - includeScoring: boolean - รวมข้อมูลคะแนนหรือไม่
   */
  async getSurveyResponse(req, res) {
    try {
      const responseId = req.params.id;
      const includeAnswers = req.query.includeAnswers === 'true';
      const includeProgress = req.query.includeProgress !== 'false'; // default true
      const includeScoring = req.query.includeScoring === 'true';

      this.logger.info('Survey response retrieval request', {
        responseId,
        userId: req.user?.id,
        options: { includeAnswers, includeProgress, includeScoring },
      });

      // Validate response ID
      if (!this.isValidResponseId(responseId)) {
        return this.sendErrorResponse(res, 400, 'INVALID_ID', 'Invalid response ID format');
      }

      // Get response data
      const responseData = await this.surveyManagementUseCase.getSurveyResponse(responseId, {
        includeAnswers,
        includeProgress,
        includeScoring,
      });

      if (!responseData) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Survey response not found');
      }

      // Check access permissions
      const authResult = await this.checkResponseReadPermission(req.user, responseData);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to access survey response',
        );
      }

      // Add computed fields
      const enrichedData = {
        ...responseData,
        canEdit: await this.checkResponseEditPermission(req.user, responseData),
        estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(responseData),
        nextSteps:
          responseData.status === 'in_progress' ? this.generateNextSteps(responseData) : null,
      };

      this.logger.info('Survey response retrieved successfully', {
        responseId,
        status: responseData.status,
        progress: responseData.progressPercentage,
      });

      return this.sendSuccessResponse(
        res,
        200,
        enrichedData,
        'Survey response retrieved successfully',
      );
    } catch (error) {
      this.logger.error('Survey response retrieval failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'RETRIEVAL_ERROR',
        'Failed to retrieve survey response',
        { details: error.message },
      );
    }
  }

  /**
   * Record Answer
   * PUT /api/survey-responses/:id/answers/:questionId
   *
   * บันทึกคำตอบสำหรับคำถามเฉพาะ
   *
   * URL Parameters:
   * - id: Response ID
   * - questionId: Question ID
   *
   * Request Body:
   * {
   *   "answer": "คำตอบ",
   *   "metadata": {
   *     "timeSpent": 30,
   *     "confidence": "high"
   *   }
   * }
   *
   * Business Logic:
   * - Validate answer format according to question type
   * - Update progress percentage automatically
   * - Trigger auto-save for session persistence
   * - Calculate quality metrics
   */
  async recordAnswer(req, res) {
    try {
      const responseId = req.params.id;
      const questionId = req.params.questionId;
      const { answer, metadata } = req.body;

      this.logger.info('Answer recording request', {
        responseId,
        questionId,
        userId: req.user?.id,
        hasAnswer: !!answer,
      });

      // Input validation
      const validationResult = this.validateAnswerInput(answer, metadata);
      if (!validationResult.isValid) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Answer validation failed',
          validationResult.errors,
        );
      }

      // Check response exists and permissions
      const currentResponse = await this.surveyManagementUseCase.getSurveyResponse(responseId);
      if (!currentResponse) {
        return this.sendErrorResponse(res, 404, 'RESPONSE_NOT_FOUND', 'Survey response not found');
      }

      const authResult = await this.checkResponseEditPermission(req.user, currentResponse);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to modify survey response',
        );
      }

      // Check if response is still editable
      if (currentResponse.status === 'completed') {
        return this.sendErrorResponse(
          res,
          409,
          'RESPONSE_COMPLETED',
          'Cannot modify completed survey response',
        );
      }

      // Record the answer
      const updatedResponse = await this.surveyManagementUseCase.recordAnswer(
        responseId,
        questionId,
        answer,
        {
          ...metadata,
          answeredBy: req.user.id,
          timestamp: new Date(),
        },
      );

      // Generate progress update
      const progressUpdate = {
        previousProgress: currentResponse.progressPercentage,
        currentProgress: updatedResponse.progressPercentage,
        progressDelta: updatedResponse.progressPercentage - currentResponse.progressPercentage,
        estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(updatedResponse),
      };

      this.logger.info('Answer recorded successfully', {
        responseId,
        questionId,
        progress: updatedResponse.progressPercentage,
        progressDelta: progressUpdate.progressDelta,
      });

      return this.sendSuccessResponse(
        res,
        200,
        {
          response: updatedResponse,
          progressUpdate,
          nextSteps: this.generateNextSteps(updatedResponse),
        },
        'Answer recorded successfully',
      );
    } catch (error) {
      this.logger.error('Answer recording failed:', error);

      if (error.message.includes('invalid answer format')) {
        return this.sendErrorResponse(res, 400, 'INVALID_ANSWER_FORMAT', error.message);
      }

      return this.sendErrorResponse(res, 500, 'ANSWER_RECORDING_ERROR', 'Failed to record answer', {
        details: error.message,
      });
    }
  }

  /**
   * Record Multiple Answers
   * PUT /api/survey-responses/:id/answers
   *
   * บันทึกคำตอบหลายคำถามพร้อมกัน
   *
   * Request Body:
   * {
   *   "answers": {
   *     "question1": { "answer": "ใช่", "metadata": {...} },
   *     "question2": { "answer": "ไม่ใช่", "metadata": {...} }
   *   }
   * }
   */
  async recordMultipleAnswers(req, res) {
    try {
      const responseId = req.params.id;
      const { answers } = req.body;

      this.logger.info('Multiple answers recording request', {
        responseId,
        userId: req.user?.id,
        answersCount: Object.keys(answers || {}).length,
      });

      // Input validation
      if (!answers || typeof answers !== 'object') {
        return this.sendErrorResponse(res, 400, 'VALIDATION_ERROR', 'Answers object is required');
      }

      if (Object.keys(answers).length === 0) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'At least one answer is required',
        );
      }

      // Check response and permissions
      const currentResponse = await this.surveyManagementUseCase.getSurveyResponse(responseId);
      if (!currentResponse) {
        return this.sendErrorResponse(res, 404, 'RESPONSE_NOT_FOUND', 'Survey response not found');
      }

      const authResult = await this.checkResponseEditPermission(req.user, currentResponse);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to modify survey response',
        );
      }

      if (currentResponse.status === 'completed') {
        return this.sendErrorResponse(
          res,
          409,
          'RESPONSE_COMPLETED',
          'Cannot modify completed survey response',
        );
      }

      // Process multiple answers
      const updatedResponse = await this.surveyManagementUseCase.recordMultipleAnswers(
        responseId,
        answers,
        req.user.id,
      );

      const progressUpdate = {
        previousProgress: currentResponse.progressPercentage,
        currentProgress: updatedResponse.progressPercentage,
        progressDelta: updatedResponse.progressPercentage - currentResponse.progressPercentage,
      };

      this.logger.info('Multiple answers recorded successfully', {
        responseId,
        answersCount: Object.keys(answers).length,
        progress: updatedResponse.progressPercentage,
      });

      return this.sendSuccessResponse(
        res,
        200,
        {
          response: updatedResponse,
          progressUpdate,
          nextSteps: this.generateNextSteps(updatedResponse),
        },
        `${Object.keys(answers).length} answers recorded successfully`,
      );
    } catch (error) {
      this.logger.error('Multiple answers recording failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'MULTIPLE_ANSWERS_ERROR',
        'Failed to record multiple answers',
        { details: error.message },
      );
    }
  }

  /**
   * Complete Survey Response
   * POST /api/survey-responses/:id/complete
   *
   * ทำเครื่องหมายการตอบแบบสำรวจเป็นเสร็จสมบูรณ์
   *
   * Request Body (optional):
   * {
   *   "forceComplete": false,
   *   "completionNotes": "หมายเหตุเพิ่มเติม"
   * }
   *
   * Business Process:
   * 1. Validate response completeness
   * 2. Calculate final scores and quality metrics
   * 3. Generate completion certificate/report
   * 4. Update response status and timestamps
   * 5. Trigger completion notifications
   */
  async completeSurveyResponse(req, res) {
    try {
      const responseId = req.params.id;
      const { forceComplete = false, completionNotes } = req.body;

      this.logger.info('Survey response completion request', {
        responseId,
        userId: req.user?.id,
        forceComplete,
      });

      // Get current response
      const currentResponse = await this.surveyManagementUseCase.getSurveyResponse(responseId, {
        includeAnswers: true,
        includeProgress: true,
      });

      if (!currentResponse) {
        return this.sendErrorResponse(res, 404, 'RESPONSE_NOT_FOUND', 'Survey response not found');
      }

      // Check permissions
      const authResult = await this.checkResponseEditPermission(req.user, currentResponse);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to complete survey response',
        );
      }

      // Check if already completed
      if (currentResponse.status === 'completed') {
        return this.sendSuccessResponse(
          res,
          200,
          currentResponse,
          'Survey response is already completed',
        );
      }

      // Check completeness (unless forced)
      if (!forceComplete && currentResponse.progressPercentage < 100) {
        return this.sendErrorResponse(
          res,
          409,
          'INCOMPLETE_RESPONSE',
          'Survey response is not complete',
          {
            currentProgress: currentResponse.progressPercentage,
            canForceComplete: true,
          },
        );
      }

      // Execute completion
      const completedResponse = await this.surveyManagementUseCase.completeSurveyResponse(
        responseId,
        {
          completedBy: req.user.id,
          forceComplete,
          completionNotes,
          completionMetadata: {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
            timestamp: new Date(),
          },
        },
      );

      // Generate completion summary
      const completionSummary = {
        completionDate: completedResponse.completedDate,
        totalScore: completedResponse.totalScore,
        completionTime: completedResponse.completionTimeMinutes,
        qualityMetrics: completedResponse.qualityMetrics,
        certificateUrl: this.generateCertificateUrl(completedResponse),
        reportUrl: this.generateReportUrl(completedResponse),
      };

      this.logger.info('Survey response completed successfully', {
        responseId,
        totalScore: completedResponse.totalScore,
        completionTime: completedResponse.completionTimeMinutes,
      });

      return this.sendSuccessResponse(
        res,
        200,
        {
          response: completedResponse,
          completionSummary,
        },
        'Survey response completed successfully',
      );
    } catch (error) {
      this.logger.error('Survey response completion failed:', error);

      if (error.message.includes('incomplete')) {
        return this.sendErrorResponse(res, 409, 'COMPLETION_ERROR', error.message);
      }

      return this.sendErrorResponse(
        res,
        500,
        'COMPLETION_ERROR',
        'Failed to complete survey response',
        { details: error.message },
      );
    }
  }

  /**
   * Get Response Progress
   * GET /api/survey-responses/:id/progress
   *
   * ดึงข้อมูลความคืบหน้าของการทำแบบสำรวจ
   */
  async getResponseProgress(req, res) {
    try {
      const responseId = req.params.id;

      this.logger.info('Response progress request', {
        responseId,
        userId: req.user?.id,
      });

      // Get current response
      const currentResponse = await this.surveyManagementUseCase.getSurveyResponse(responseId, {
        includeProgress: true,
      });

      if (!currentResponse) {
        return this.sendErrorResponse(res, 404, 'RESPONSE_NOT_FOUND', 'Survey response not found');
      }

      // Check read permissions
      const authResult = await this.checkResponseReadPermission(req.user, currentResponse);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to access survey response progress',
        );
      }

      // Generate detailed progress information
      const progressInfo = {
        responseId: currentResponse.id,
        surveyId: currentResponse.surveyId,
        status: currentResponse.status,
        progressPercentage: currentResponse.progressPercentage,
        currentSection: currentResponse.currentSection,
        estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(currentResponse),
        lastActivity: currentResponse.lastAnswerDate || currentResponse.startDate,
        qualityMetrics: currentResponse.qualityMetrics,
        nextSteps:
          currentResponse.status === 'in_progress' ? this.generateNextSteps(currentResponse) : null,
      };

      return this.sendSuccessResponse(
        res,
        200,
        progressInfo,
        'Response progress retrieved successfully',
      );
    } catch (error) {
      this.logger.error('Response progress retrieval failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'PROGRESS_ERROR',
        'Failed to retrieve response progress',
        { details: error.message },
      );
    }
  }

  /**
   * Get Survey Responses by Survey
   * GET /api/surveys/:surveyId/responses
   *
   * ดึงรายการการตอบแบบสำรวจทั้งหมดของ Survey ที่ระบุ
   */
  async getSurveyResponses(req, res) {
    try {
      const surveyId = req.params.surveyId;
      const {
        page = 1,
        limit = 20,
        status,
        farmId,
        dateFrom,
        dateTo,
        sort = 'startDate',
        order = 'desc',
      } = req.query;

      this.logger.info('Survey responses request', {
        surveyId,
        userId: req.user?.id,
        filters: { status, farmId, dateFrom, dateTo },
      });

      // Validate survey ID
      if (!this.isValidSurveyId(surveyId)) {
        return this.sendErrorResponse(res, 400, 'INVALID_SURVEY_ID', 'Invalid survey ID format');
      }

      // Check permissions
      const authResult = await this.checkSurveyResponsesReadPermission(req.user, surveyId, farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to access survey responses',
        );
      }

      // Prepare options
      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 50),
        status: status ? (Array.isArray(status) ? status : [status]) : undefined,
        farmId,
        dateFrom,
        dateTo,
        sort: { [sort]: order === 'asc' ? 1 : -1 },
      };

      // Get responses
      const responsesData = await this.surveyManagementUseCase.getSurveyResponses(
        surveyId,
        options,
      );

      this.logger.info('Survey responses retrieved successfully', {
        surveyId,
        count: responsesData.responses.length,
        totalCount: responsesData.pagination.totalCount,
      });

      return this.sendSuccessResponse(
        res,
        200,
        responsesData,
        'Survey responses retrieved successfully',
      );
    } catch (error) {
      this.logger.error('Survey responses retrieval failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'RETRIEVAL_ERROR',
        'Failed to retrieve survey responses',
        { details: error.message },
      );
    }
  }

  /**
   * Input Validation Methods
   */

  validateStartResponseInput(data) {
    const errors = [];

    if (!data.surveyId || typeof data.surveyId !== 'string') {
      errors.push('Survey ID is required and must be a string');
    }

    if (!data.farmId || typeof data.farmId !== 'string') {
      errors.push('Farm ID is required and must be a string');
    }

    if (!data.respondentName || typeof data.respondentName !== 'string') {
      errors.push('Respondent name is required and must be a string');
    }

    if (data.respondentRole && typeof data.respondentRole !== 'string') {
      errors.push('Respondent role must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateAnswerInput(answer, metadata) {
    const errors = [];

    if (answer === undefined || answer === null) {
      errors.push('Answer is required');
    }

    if (metadata && typeof metadata !== 'object') {
      errors.push('Metadata must be an object');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Authorization Methods
   */

  async checkResponseCreatePermission(user, surveyId, farmId) {
    // Implement authorization logic
    return { authorized: !!user };
  }

  async checkResponseReadPermission(user, response) {
    return { authorized: !!user };
  }

  async checkResponseEditPermission(user, response) {
    return { authorized: !!user };
  }

  async checkSurveyResponsesReadPermission(user, surveyId, farmId) {
    return { authorized: !!user };
  }

  /**
   * Utility Methods
   */

  isValidResponseId(id) {
    return typeof id === 'string' && id.length > 0 && id.length <= 50;
  }

  isValidSurveyId(id) {
    return typeof id === 'string' && id.length > 0 && id.length <= 50;
  }

  calculateEstimatedTimeRemaining(response) {
    if (!response.completionTimeMinutes || response.progressPercentage <= 0) {
      return null;
    }

    const timePerPercent = response.completionTimeMinutes / response.progressPercentage;
    const remainingPercent = 100 - response.progressPercentage;

    return Math.round(timePerPercent * remainingPercent);
  }

  generateNextSteps(response) {
    if (response.status === 'completed') {
      return null;
    }

    return {
      currentSection: response.currentSection,
      nextAction: 'continue_survey',
      description: 'Continue answering questions to complete the survey',
      progress: response.progressPercentage,
    };
  }

  generateCertificateUrl(response) {
    return `/api/survey-responses/${response.id}/certificate`;
  }

  generateReportUrl(response) {
    return `/api/survey-responses/${response.id}/report`;
  }

  /**
   * Response Helper Methods
   */

  sendSuccessResponse(res, statusCode, data, message = '') {
    return res.status(statusCode).json({
      success: true,
      data: data,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }

  sendErrorResponse(res, statusCode, errorCode, message, details = null) {
    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: message,
        details: details,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(errorResponse);
  }
}

module.exports = SurveyResponseController;
