/**
 * GACP Survey System - Survey Controller (Presentation Layer)
 * ระบบ Controller สำหรับจัดการ HTTP requests ของ Survey System
 *
 * Business Logic & Process Workflow:
 * 1. API Endpoint Management - การจัดการ endpoints สำหรับ Survey operations
 * 2. Request/Response Handling - การจัดการ HTTP requests และ responses
 * 3. Input Validation - การตรวจสอบความถูกต้องของข้อมูลที่เข้ามา
 * 4. Error Handling - การจัดการข้อผิดพลาดและส่งคืน error responses ที่เหมาะสม
 *
 * Technical Implementation:
 * - RESTful API Design following HTTP standards
 * - Comprehensive input validation and sanitization
 * - Structured error responses with appropriate HTTP status codes
 * - Integration with Survey Management Use Cases
 */

/**
 * SurveyController - คลาสสำหรับจัดการ HTTP requests ของ Survey System
 *
 * Process Flow:
 * 1. HTTP Request Reception - รับ HTTP requests จาก clients
 * 2. Input Validation - ตรวจสอบและทำความสะอาดข้อมูลที่เข้ามา
 * 3. Business Logic Execution - เรียกใช้ use cases สำหรับ business logic
 * 4. Response Generation - สร้างและส่งคืน HTTP responses
 *
 * API Design Principles:
 * - RESTful endpoints ตาม HTTP standards
 * - Consistent response format สำหรับทุก endpoints
 * - Proper HTTP status codes สำหรับแต่ละสถานการณ์
 * - Comprehensive error handling พร้อม error details
 *
 * Security Considerations:
 * - Input validation เพื่อป้องกัน injection attacks
 * - Authorization checking สำหรับแต่ละ endpoint
 * - Rate limiting สำหรับป้องกัน abuse
 * - Audit logging สำหรับการติดตาม
 */
class SurveyController {
  constructor(surveyManagementUseCase, logger) {
    this.surveyManagementUseCase = surveyManagementUseCase;
    this.logger = logger;
  }

  /**
   * Create Survey
   * POST /api/surveys
   *
   * สร้างแบบสำรวจใหม่ในระบบ
   *
   * Request Body:
   * {
   *   "title": "แบบสำรวจ GACP ปลูกกัญชา",
   *   "description": "แบบสำรวจสำหรับการประเมินการปฏิบัติตามมาตรฐาน GACP",
   *   "category": "gacp_compliance",
   *   "farmId": "farm123",
   *   "sections": [...],
   *   "gacpStandards": [...],
   *   "scoringCriteria": {...}
   * }
   *
   * Business Process:
   * 1. Validate input data structure และ required fields
   * 2. Check authorization - ตรวจสอบสิทธิ์ในการสร้าง survey
   * 3. Execute survey creation through use case
   * 4. Return success response with created survey data
   *
   * Response Format:
   * Success (201): { success: true, data: survey, message: "Survey created successfully" }
   * Error (400/500): { success: false, error: {...}, message: "Error description" }
   */
  async createSurvey(req, res) {
    try {
      this.logger.info('Survey creation request received', {
        userId: req.user?.id,
        farmId: req.body?.farmId,
        title: req.body?.title,
      });

      // Input validation
      const validationResult = this.validateCreateSurveyInput(req.body);
      if (!validationResult.isValid) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Input validation failed',
          validationResult.errors
        );
      }

      // Authorization check
      const authResult = await this.checkSurveyCreatePermission(req.user, req.body.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to create survey'
        );
      }

      // Execute business logic
      const surveyData = {
        ...req.body,
        createdBy: req.user.id,
      };

      const createdSurvey = await this.surveyManagementUseCase.createSurvey(surveyData);

      // Audit logging
      this.logger.info('Survey created successfully', {
        surveyId: createdSurvey.id,
        farmId: createdSurvey.farmId,
        createdBy: req.user.id,
      });

      // Success response
      return this.sendSuccessResponse(res, 201, createdSurvey, 'Survey created successfully');
    } catch (error) {
      this.logger.error('Survey creation failed:', error);
      return this.sendErrorResponse(res, 500, 'CREATION_ERROR', 'Failed to create survey', {
        details: error.message,
      });
    }
  }

  /**
   * Get Survey by ID
   * GET /api/surveys/:id
   *
   * ดึงข้อมูลแบบสำรวจตาม ID ที่ระบุ
   *
   * URL Parameters:
   * - id: Survey ID
   *
   * Query Parameters:
   * - includeResponses: boolean - รวมข้อมูล responses หรือไม่
   * - responseLimit: number - จำนวน responses ที่ต้องการ
   *
   * Business Logic:
   * 1. Validate survey ID format
   * 2. Check read permissions for the survey
   * 3. Retrieve survey data with optional response data
   * 4. Return formatted survey information
   */
  async getSurveyById(req, res) {
    try {
      const surveyId = req.params.id;
      const includeResponses = req.query.includeResponses === 'true';
      const responseLimit = parseInt(req.query.responseLimit) || 10;

      this.logger.info('Survey retrieval request', {
        surveyId,
        userId: req.user?.id,
        includeResponses,
      });

      // Validate survey ID
      if (!this.isValidSurveyId(surveyId)) {
        return this.sendErrorResponse(res, 400, 'INVALID_ID', 'Invalid survey ID format');
      }

      // Get survey data
      const surveyData = await this.surveyManagementUseCase.getSurveyById(surveyId, {
        includeResponses,
        responseLimit,
      });

      if (!surveyData) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Survey not found');
      }

      // Check read permissions
      const authResult = await this.checkSurveyReadPermission(req.user, surveyData.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to access survey'
        );
      }

      this.logger.info('Survey retrieved successfully', {
        surveyId,
        farmId: surveyData.farmId,
      });

      return this.sendSuccessResponse(res, 200, surveyData, 'Survey retrieved successfully');
    } catch (error) {
      this.logger.error('Survey retrieval failed:', error);
      return this.sendErrorResponse(res, 500, 'RETRIEVAL_ERROR', 'Failed to retrieve survey', {
        details: error.message,
      });
    }
  }

  /**
   * Get Surveys by Farm
   * GET /api/farms/:farmId/surveys
   *
   * ดึงรายการแบบสำรวจทั้งหมดของฟาร์มที่ระบุ
   *
   * URL Parameters:
   * - farmId: Farm ID
   *
   * Query Parameters:
   * - page: number (default: 1)
   * - limit: number (default: 10)
   * - category: string - กรองตามหมวดหมู่
   * - status: string - กรองตามสถานะ (active/inactive)
   * - sort: string - การเรียงลำดับ (createdDate, title, category)
   * - order: string - ทิศทางการเรียง (asc/desc)
   */
  async getFarmSurveys(req, res) {
    try {
      const farmId = req.params.farmId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category;
      const status = req.query.status;
      const sort = req.query.sort || 'createdDate';
      const order = req.query.order || 'desc';

      this.logger.info('Farm surveys request', {
        farmId,
        userId: req.user?.id,
        pagination: { page, limit },
        filters: { category, status, sort, order },
      });

      // Validate farm ID
      if (!this.isValidFarmId(farmId)) {
        return this.sendErrorResponse(res, 400, 'INVALID_FARM_ID', 'Invalid farm ID format');
      }

      // Check authorization for farm access
      const authResult = await this.checkFarmAccessPermission(req.user, farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to access farm surveys'
        );
      }

      // Prepare query options
      const options = {
        page,
        limit: Math.min(limit, 50), // จำกัดไม่เกิน 50 records per request
        category,
        includeInactive: status === 'inactive',
        sort: this.buildSortOptions(sort, order),
      };

      // Get surveys data
      const surveysData = await this.surveyManagementUseCase.getFarmSurveys(farmId, options);

      this.logger.info('Farm surveys retrieved successfully', {
        farmId,
        count: surveysData.surveys.length,
        totalCount: surveysData.pagination.totalCount,
      });

      return this.sendSuccessResponse(res, 200, surveysData, 'Farm surveys retrieved successfully');
    } catch (error) {
      this.logger.error('Farm surveys retrieval failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'RETRIEVAL_ERROR',
        'Failed to retrieve farm surveys',
        { details: error.message }
      );
    }
  }

  /**
   * Update Survey
   * PUT /api/surveys/:id
   *
   * อัปเดตข้อมูลแบบสำรวจ
   *
   * Request Body: Partial survey data ที่ต้องการอัปเดต
   *
   * Business Rules:
   * - ไม่สามารถแก้ไข survey ที่มี active responses
   * - การเปลี่ยนแปลง sections จะสร้าง version ใหม่
   * - บันทึก audit trail ทุกการเปลี่ยนแปลง
   */
  async updateSurvey(req, res) {
    try {
      const surveyId = req.params.id;
      const updateData = req.body;

      this.logger.info('Survey update request', {
        surveyId,
        userId: req.user?.id,
        updateFields: Object.keys(updateData),
      });

      // Validate survey ID and input data
      if (!this.isValidSurveyId(surveyId)) {
        return this.sendErrorResponse(res, 400, 'INVALID_ID', 'Invalid survey ID format');
      }

      const validationResult = this.validateUpdateSurveyInput(updateData);
      if (!validationResult.isValid) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Input validation failed',
          validationResult.errors
        );
      }

      // Check if survey exists and get current data
      const currentSurvey = await this.surveyManagementUseCase.getSurveyById(surveyId);
      if (!currentSurvey) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Survey not found');
      }

      // Check update permissions
      const authResult = await this.checkSurveyUpdatePermission(req.user, currentSurvey.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to update survey'
        );
      }

      // Execute update
      const updatedSurvey = await this.surveyManagementUseCase.updateSurvey(
        surveyId,
        updateData,
        req.user.id
      );

      this.logger.info('Survey updated successfully', {
        surveyId,
        version: updatedSurvey.version,
        updatedBy: req.user.id,
      });

      return this.sendSuccessResponse(res, 200, updatedSurvey, 'Survey updated successfully');
    } catch (error) {
      this.logger.error('Survey update failed:', error);

      if (error.message.includes('active responses')) {
        return this.sendErrorResponse(
          res,
          409,
          'CONFLICT',
          'Cannot update survey with active responses'
        );
      }

      return this.sendErrorResponse(res, 500, 'UPDATE_ERROR', 'Failed to update survey', {
        details: error.message,
      });
    }
  }

  /**
   * Delete Survey
   * DELETE /api/surveys/:id
   *
   * ลบแบบสำรวจ (soft delete)
   *
   * Business Rules:
   * - ใช้ soft delete เพื่อรักษาประวัติข้อมูล
   * - ตรวจสอบว่าไม่มี active responses ก่อนลบ
   * - บันทึก audit trail การลบ
   */
  async deleteSurvey(req, res) {
    try {
      const surveyId = req.params.id;

      this.logger.info('Survey deletion request', {
        surveyId,
        userId: req.user?.id,
      });

      // Validate survey ID
      if (!this.isValidSurveyId(surveyId)) {
        return this.sendErrorResponse(res, 400, 'INVALID_ID', 'Invalid survey ID format');
      }

      // Get survey for authorization check
      const currentSurvey = await this.surveyManagementUseCase.getSurveyById(surveyId);
      if (!currentSurvey) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Survey not found');
      }

      // Check delete permissions
      const authResult = await this.checkSurveyDeletePermission(req.user, currentSurvey.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to delete survey'
        );
      }

      // Execute deletion
      const deletionResult = await this.surveyManagementUseCase.deleteSurvey(surveyId, req.user.id);

      this.logger.info('Survey deleted successfully', {
        surveyId,
        deletedBy: req.user.id,
      });

      return this.sendSuccessResponse(res, 200, deletionResult, 'Survey deleted successfully');
    } catch (error) {
      this.logger.error('Survey deletion failed:', error);

      if (error.message.includes('active responses')) {
        return this.sendErrorResponse(
          res,
          409,
          'CONFLICT',
          'Cannot delete survey with active responses'
        );
      }

      return this.sendErrorResponse(res, 500, 'DELETION_ERROR', 'Failed to delete survey', {
        details: error.message,
      });
    }
  }

  /**
   * Search Surveys
   * POST /api/surveys/search
   *
   * ค้นหาแบบสำรวจด้วยเงื่อนไขที่หลากหลาย
   *
   * Request Body:
   * {
   *   "searchText": "GACP compliance",
   *   "category": "gacp_compliance",
   *   "farmId": "farm123",
   *   "dateFrom": "2024-01-01",
   *   "dateTo": "2024-12-31",
   *   "includeInactive": false,
   *   "page": 1,
   *   "limit": 20,
   *   "sortOrder": "desc"
   * }
   */
  async searchSurveys(req, res) {
    try {
      const searchCriteria = req.body;

      this.logger.info('Survey search request', {
        userId: req.user?.id,
        searchCriteria: {
          ...searchCriteria,
          searchText: searchCriteria.searchText ? '***' : undefined, // ซ่อนข้อความค้นหาใน log
        },
      });

      // Validate search input
      const validationResult = this.validateSearchSurveyInput(searchCriteria);
      if (!validationResult.isValid) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Search criteria validation failed',
          validationResult.errors
        );
      }

      // Check search permissions (based on farmId if specified)
      if (searchCriteria.farmId) {
        const authResult = await this.checkFarmAccessPermission(req.user, searchCriteria.farmId);
        if (!authResult.authorized) {
          return this.sendErrorResponse(
            res,
            403,
            'AUTHORIZATION_ERROR',
            'Insufficient permissions to search farm surveys'
          );
        }
      }

      // Prepare search options
      const options = {
        page: parseInt(searchCriteria.page) || 1,
        limit: Math.min(parseInt(searchCriteria.limit) || 20, 50),
        sortOrder: searchCriteria.sortOrder || 'desc',
      };

      // Execute search
      const searchResults = await this.surveyManagementUseCase.searchSurveys(
        searchCriteria,
        options
      );

      this.logger.info('Survey search completed', {
        userId: req.user?.id,
        resultsCount: searchResults.surveys.length,
        totalCount: searchResults.pagination.totalCount,
      });

      return this.sendSuccessResponse(
        res,
        200,
        searchResults,
        'Survey search completed successfully'
      );
    } catch (error) {
      this.logger.error('Survey search failed:', error);
      return this.sendErrorResponse(res, 500, 'SEARCH_ERROR', 'Failed to search surveys', {
        details: error.message,
      });
    }
  }

  /**
   * Get Survey Statistics
   * GET /api/surveys/statistics
   *
   * ดึงสถิติของแบบสำรวจสำหรับการรายงาน
   *
   * Query Parameters:
   * - farmId: string (optional) - สำหรับสถิติของฟาร์มเฉพาะ
   * - dateFrom: string (optional) - วันที่เริ่มต้น
   * - dateTo: string (optional) - วันที่สิ้นสุด
   * - category: string (optional) - กรองตามหมวดหมู่
   */
  async getSurveyStatistics(req, res) {
    try {
      const { farmId, dateFrom, dateTo, category } = req.query;

      this.logger.info('Survey statistics request', {
        userId: req.user?.id,
        filters: { farmId, dateFrom, dateTo, category },
      });

      // Check permissions
      if (farmId) {
        const authResult = await this.checkFarmAccessPermission(req.user, farmId);
        if (!authResult.authorized) {
          return this.sendErrorResponse(
            res,
            403,
            'AUTHORIZATION_ERROR',
            'Insufficient permissions to access farm statistics'
          );
        }
      }

      // Validate date range
      if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        return this.sendErrorResponse(
          res,
          400,
          'INVALID_DATE_RANGE',
          'Date from must be before date to'
        );
      }

      // Get statistics
      const dateRange = {};
      if (dateFrom) dateRange.from = dateFrom;
      if (dateTo) dateRange.to = dateTo;

      const statistics = await this.surveyManagementUseCase.getSurveyStatistics(farmId, dateRange, {
        category,
      });

      this.logger.info('Survey statistics generated successfully', {
        userId: req.user?.id,
        farmId,
        totalSurveys: statistics.overview.totalSurveys,
      });

      return this.sendSuccessResponse(
        res,
        200,
        statistics,
        'Survey statistics generated successfully'
      );
    } catch (error) {
      this.logger.error('Survey statistics generation failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'STATISTICS_ERROR',
        'Failed to generate survey statistics',
        { details: error.message }
      );
    }
  }

  /**
   * Input Validation Methods
   * ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลที่เข้ามา
   */

  validateCreateSurveyInput(data) {
    const errors = [];

    // Required fields
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    }

    if (!data.farmId || typeof data.farmId !== 'string') {
      errors.push('Farm ID is required and must be a string');
    }

    if (!data.category || typeof data.category !== 'string') {
      errors.push('Category is required and must be a string');
    }

    // Optional fields validation
    if (data.description && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    }

    if (data.sections && !Array.isArray(data.sections)) {
      errors.push('Sections must be an array');
    }

    // Title length validation
    if (data.title && data.title.length > 200) {
      errors.push('Title must not exceed 200 characters');
    }

    // Description length validation
    if (data.description && data.description.length > 1000) {
      errors.push('Description must not exceed 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateUpdateSurveyInput(data) {
    const errors = [];

    // ตรวจสอบว่ามีข้อมูลที่จะอัปเดต
    if (!data || Object.keys(data).length === 0) {
      errors.push('Update data is required');
      return { isValid: false, errors };
    }

    // Validate individual fields if they exist
    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim().length === 0) {
        errors.push('Title must be a non-empty string');
      } else if (data.title.length > 200) {
        errors.push('Title must not exceed 200 characters');
      }
    }

    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 1000) {
        errors.push('Description must not exceed 1000 characters');
      }
    }

    if (data.category !== undefined) {
      if (typeof data.category !== 'string' || data.category.trim().length === 0) {
        errors.push('Category must be a non-empty string');
      }
    }

    if (data.sections !== undefined && !Array.isArray(data.sections)) {
      errors.push('Sections must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateSearchSurveyInput(criteria) {
    const errors = [];

    if (criteria.page !== undefined && (!Number.isInteger(criteria.page) || criteria.page < 1)) {
      errors.push('Page must be a positive integer');
    }

    if (
      criteria.limit !== undefined &&
      (!Number.isInteger(criteria.limit) || criteria.limit < 1 || criteria.limit > 50)
    ) {
      errors.push('Limit must be an integer between 1 and 50');
    }

    if (criteria.dateFrom && !this.isValidDate(criteria.dateFrom)) {
      errors.push('Date from must be a valid date string');
    }

    if (criteria.dateTo && !this.isValidDate(criteria.dateTo)) {
      errors.push('Date to must be a valid date string');
    }

    if (criteria.sortOrder && !['asc', 'desc'].includes(criteria.sortOrder)) {
      errors.push('Sort order must be either "asc" or "desc"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Authorization Methods
   * ฟังก์ชันสำหรับตรวจสอบสิทธิ์การเข้าถึง
   */

  async checkSurveyCreatePermission(user, farmId) {
    // Implement authorization logic here
    // For now, allow all authenticated users
    return { authorized: !!user };
  }

  async checkSurveyReadPermission(user, farmId) {
    return { authorized: !!user };
  }

  async checkSurveyUpdatePermission(user, farmId) {
    return { authorized: !!user };
  }

  async checkSurveyDeletePermission(user, farmId) {
    return { authorized: !!user };
  }

  async checkFarmAccessPermission(user, farmId) {
    return { authorized: !!user };
  }

  /**
   * Utility Methods
   * ฟังก์ชันช่วยเหลือต่างๆ
   */

  isValidSurveyId(id) {
    return typeof id === 'string' && id.length > 0 && id.length <= 50;
  }

  isValidFarmId(id) {
    return typeof id === 'string' && id.length > 0 && id.length <= 50;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  buildSortOptions(sort, order) {
    const validSortFields = ['createdDate', 'title', 'category', 'lastModified'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdDate';
    const sortOrder = order === 'asc' ? 1 : -1;

    return { [sortField]: sortOrder };
  }

  /**
   * Response Methods
   * ฟังก์ชันสำหรับส่งคืน HTTP responses
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

module.exports = SurveyController;
