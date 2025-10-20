/**
 * GACP Standards Comparison System - Presentation Layer Controller
 * ระบบ Controller สำหรับจัดการ HTTP requests ของ Standards Comparison System
 *
 * Business Logic & Process Workflow:
 * 1. API Endpoint Management - การจัดการ endpoints สำหรับ standards comparison operations
 * 2. Complex Request Processing - การประมวลผล requests ที่ซับซ้อนสำหรับการวิเคราะห์
 * 3. Data Validation & Transformation - การตรวจสอบและแปลงข้อมูลสำหรับการเปรียบเทียบ
 * 4. Report Generation & Export - การสร้างและส่งออกรายงานการเปรียบเทียบ
 *
 * Technical Implementation:
 * - RESTful API design for complex comparison workflows
 * - Advanced input validation for multi-standard comparisons
 * - Asynchronous processing support for large analysis operations
 * - Comprehensive error handling for complex business scenarios
 */

/**
 * StandardsComparisonController - คลาสสำหรับจัดการ HTTP requests ของ Standards Comparison
 *
 * Process Flow:
 * 1. Request Reception & Validation - รับและตรวจสอบ HTTP requests
 * 2. Authorization & Permission Checks - ตรวจสอบสิทธิ์และการอนุญาต
 * 3. Business Logic Execution - เรียกใช้ use cases สำหรับ business logic
 * 4. Response Formatting & Return - จัดรูปแบบและส่งคืน responses
 *
 * API Design Features:
 * - Support for multi-step comparison workflows
 * - Real-time progress tracking for analysis operations
 * - Flexible filtering and search capabilities
 * - Export capabilities in multiple formats
 *
 * Business Value Integration:
 * - ให้บริการ API ที่รองรับการเปรียบเทียบมาตรฐาน GACP แบบครอบคลุม
 * - รองรับการสร้างรายงานและคำแนะนำการปรับปรุงที่เฉพาะเจาะจง
 * - เชื่อมโยงข้อมูลจากระบบย่อยต่างๆ เพื่อการวิเคราะห์ที่แม่นยำ
 */
class StandardsComparisonController {
  constructor(standardsComparisonManagementUseCase, logger) {
    this.standardsComparisonManagementUseCase = standardsComparisonManagementUseCase;
    this.logger = logger;
  }

  /**
   * Create Standards Comparison
   * POST /api/standards-comparisons
   *
   * สร้างการเปรียบเทียบมาตรฐานใหม่
   *
   * Request Body:
   * {
   *   "comparisonName": "การประเมิน GACP ครั้งที่ 1 ประจำปี 2024",
   *   "description": "การเปรียบเทียบมาตรฐาน GACP สำหรับการปรับปรุงฟาร์ม",
   *   "farmId": "farm123",
   *   "baselineStandardId": "GACP_THAILAND_2024",
   *   "targetStandards": [
   *     {
   *       "id": "WHO_GACP_2023",
   *       "name": "WHO GACP Guidelines 2023",
   *       "version": "1.0",
   *       "weight": 1.5
   *     }
   *   ],
   *   "analysisParameters": {
   *     "detailLevel": "comprehensive",
   *     "includeRecommendations": true,
   *     "priorityFocus": "high_impact"
   *   }
   * }
   *
   * Business Process:
   * 1. Validate input data และตรวจสอบความพร้อมของฟาร์ม
   * 2. Check authorization สำหรับการสร้าง comparison
   * 3. Initialize comparison configuration
   * 4. Set up data collection pipeline
   * 5. Return comparison entity พร้อม next steps
   */
  async createStandardsComparison(req, res) {
    try {
      this.logger.info('Standards comparison creation request received', {
        userId: req.user?.id,
        farmId: req.body?.farmId,
        comparisonName: req.body?.comparisonName,
      });

      // Input validation
      const validationResult = this.validateCreateComparisonInput(req.body);
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
      const authResult = await this.checkComparisonCreatePermission(req.user, req.body.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to create standards comparison'
        );
      }

      // Execute business logic
      const comparisonData = {
        ...req.body,
        createdBy: req.user.id,
      };

      const createdComparison =
        await this.standardsComparisonManagementUseCase.createStandardsComparison(comparisonData);

      // Generate next steps guidance
      const nextSteps = this.generateComparisonNextSteps(createdComparison);

      this.logger.info('Standards comparison created successfully', {
        comparisonId: createdComparison.id,
        farmId: createdComparison.farmId,
        createdBy: req.user.id,
      });

      return this.sendSuccessResponse(
        res,
        201,
        {
          comparison: createdComparison,
          nextSteps: nextSteps,
        },
        'Standards comparison created successfully'
      );
    } catch (error) {
      this.logger.error('Standards comparison creation failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'CREATION_ERROR',
        'Failed to create standards comparison',
        { details: error.message }
      );
    }
  }

  /**
   * Get Standards Comparison by ID
   * GET /api/standards-comparisons/:id
   *
   * ดึงข้อมูลการเปรียบเทียบมาตรฐานตาม ID
   *
   * URL Parameters:
   * - id: Comparison ID
   *
   * Query Parameters:
   * - includeLatestData: boolean - รวมข้อมูลล่าสุดหรือไม่
   * - includeProgress: boolean - รวมข้อมูลความคืบหน้าหรือไม่
   * - includeRecommendations: boolean - รวมคำแนะนำหรือไม่
   * - format: string - รูปแบบการส่งคืนข้อมูล (summary/detailed/full)
   */
  async getStandardsComparison(req, res) {
    try {
      const comparisonId = req.params.id;
      const includeLatestData = req.query.includeLatestData === 'true';
      const includeProgress = req.query.includeProgress === 'true';
      const includeRecommendations = req.query.includeRecommendations === 'true';
      const format = req.query.format || 'detailed';

      this.logger.info('Standards comparison retrieval request', {
        comparisonId,
        userId: req.user?.id,
        options: { includeLatestData, includeProgress, includeRecommendations, format },
      });

      // Validate comparison ID
      if (!this.isValidComparisonId(comparisonId)) {
        return this.sendErrorResponse(res, 400, 'INVALID_ID', 'Invalid comparison ID format');
      }

      // Get comparison data
      const comparisonData = await this.standardsComparisonManagementUseCase.getStandardsComparison(
        comparisonId,
        {
          includeLatestData,
          includeProgress,
          includeRecommendations,
        }
      );

      if (!comparisonData) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Standards comparison not found');
      }

      // Check read permissions
      const authResult = await this.checkComparisonReadPermission(req.user, comparisonData.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to access standards comparison'
        );
      }

      // Format response based on requested format
      const formattedData = this.formatComparisonData(comparisonData, format);

      this.logger.info('Standards comparison retrieved successfully', {
        comparisonId,
        farmId: comparisonData.farmId,
        status: comparisonData.status,
      });

      return this.sendSuccessResponse(
        res,
        200,
        formattedData,
        'Standards comparison retrieved successfully'
      );
    } catch (error) {
      this.logger.error('Standards comparison retrieval failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'RETRIEVAL_ERROR',
        'Failed to retrieve standards comparison',
        { details: error.message }
      );
    }
  }

  /**
   * Update Comparison Configuration
   * PUT /api/standards-comparisons/:id/configuration
   *
   * อัปเดตการกำหนดค่าการเปรียบเทียบ
   *
   * Request Body: Partial comparison configuration data
   *
   * Business Rules:
   * - อนุญาตการแก้ไขเฉพาะเมื่อสถานะเป็น 'draft' หรือ 'configuring'
   * - การเปลี่ยนแปลง analysis parameters จะ reset ผลการวิเคราะห์
   * - บันทึก audit trail ทุกการเปลี่ยนแปลง
   */
  async updateComparisonConfiguration(req, res) {
    try {
      const comparisonId = req.params.id;
      const updateData = req.body;

      this.logger.info('Comparison configuration update request', {
        comparisonId,
        userId: req.user?.id,
        updateFields: Object.keys(updateData),
      });

      // Validate input
      if (!this.isValidComparisonId(comparisonId)) {
        return this.sendErrorResponse(res, 400, 'INVALID_ID', 'Invalid comparison ID format');
      }

      const validationResult = this.validateUpdateConfigurationInput(updateData);
      if (!validationResult.isValid) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Configuration validation failed',
          validationResult.errors
        );
      }

      // Get current comparison for authorization
      const currentComparison =
        await this.standardsComparisonManagementUseCase.getStandardsComparison(comparisonId);

      if (!currentComparison) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Standards comparison not found');
      }

      // Check update permissions
      const authResult = await this.checkComparisonUpdatePermission(
        req.user,
        currentComparison.farmId
      );
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to update standards comparison'
        );
      }

      // Execute update
      const updatedComparison =
        await this.standardsComparisonManagementUseCase.updateComparisonConfiguration(
          comparisonId,
          updateData,
          req.user.id
        );

      this.logger.info('Comparison configuration updated successfully', {
        comparisonId,
        version: updatedComparison.version,
        updatedBy: req.user.id,
      });

      return this.sendSuccessResponse(
        res,
        200,
        updatedComparison,
        'Comparison configuration updated successfully'
      );
    } catch (error) {
      this.logger.error('Comparison configuration update failed:', error);

      if (error.message.includes('Cannot modify comparison in status')) {
        return this.sendErrorResponse(res, 409, 'INVALID_STATUS', error.message);
      }

      return this.sendErrorResponse(
        res,
        500,
        'UPDATE_ERROR',
        'Failed to update comparison configuration',
        { details: error.message }
      );
    }
  }

  /**
   * Collect Current Practices Data
   * POST /api/standards-comparisons/:id/collect-data
   *
   * เริ่มกระบวนการรวบรวมข้อมูลการปฏิบัติปัจจุบัน
   *
   * Request Body:
   * {
   *   "dateRange": {
   *     "from": "2024-01-01",
   *     "to": "2024-12-31"
   *   },
   *   "surveyTypes": ["gacp_assessment", "quality_control"],
   *   "includeHistoricalData": true,
   *   "dataValidationLevel": "comprehensive"
   * }
   *
   * Business Process:
   * 1. Validate collection parameters
   * 2. Start data collection from multiple sources
   * 3. Return collection status และ estimated completion time
   * 4. Provide progress tracking endpoint for monitoring
   */
  async collectCurrentPracticesData(req, res) {
    try {
      const comparisonId = req.params.id;
      const collectionOptions = req.body;

      this.logger.info('Data collection request', {
        comparisonId,
        userId: req.user?.id,
        options: collectionOptions,
      });

      // Validate comparison exists and is in correct state
      const comparison =
        await this.standardsComparisonManagementUseCase.getStandardsComparison(comparisonId);

      if (!comparison) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Standards comparison not found');
      }

      // Check permissions
      const authResult = await this.checkComparisonUpdatePermission(req.user, comparison.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to collect data for this comparison'
        );
      }

      // Validate collection options
      const validationResult = this.validateDataCollectionOptions(collectionOptions);
      if (!validationResult.isValid) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Data collection options validation failed',
          validationResult.errors
        );
      }

      // Start data collection process
      const collectionResult =
        await this.standardsComparisonManagementUseCase.collectCurrentPracticesData(
          comparisonId,
          collectionOptions
        );

      // Calculate estimated completion time
      const estimatedCompletion = this.calculateDataCollectionEstimate(
        comparison,
        collectionOptions
      );

      this.logger.info('Data collection started successfully', {
        comparisonId,
        estimatedCompletion,
      });

      return this.sendSuccessResponse(
        res,
        202,
        {
          comparison: collectionResult,
          collectionStatus: 'started',
          estimatedCompletion,
          progressEndpoint: `/api/standards-comparisons/${comparisonId}/progress`,
        },
        'Data collection started successfully'
      );
    } catch (error) {
      this.logger.error('Data collection initiation failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'COLLECTION_ERROR',
        'Failed to start data collection',
        { details: error.message }
      );
    }
  }

  /**
   * Run Standards Analysis
   * POST /api/standards-comparisons/:id/analyze
   *
   * ดำเนินการวิเคราะห์เปรียบเทียบมาตรฐาน
   *
   * Request Body:
   * {
   *   "analysisOptions": {
   *     "deepAnalysis": true,
   *     "includeProjections": true,
   *     "generateActionPlan": true
   *   },
   *   "reportOptions": {
   *     "format": "comprehensive",
   *     "language": "thai",
   *     "includeCharts": true
   *   }
   * }
   *
   * Business Process:
   * 1. Validate analysis readiness
   * 2. Execute comprehensive standards analysis
   * 3. Generate improvement recommendations
   * 4. Create implementation roadmap
   * 5. Return analysis results พร้อม next steps
   */
  async runStandardsAnalysis(req, res) {
    try {
      const comparisonId = req.params.id;
      const { analysisOptions, reportOptions } = req.body;

      this.logger.info('Standards analysis request', {
        comparisonId,
        userId: req.user?.id,
        analysisOptions,
        reportOptions,
      });

      // Validate comparison exists and is ready for analysis
      const comparison =
        await this.standardsComparisonManagementUseCase.getStandardsComparison(comparisonId);

      if (!comparison) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Standards comparison not found');
      }

      // Check analysis readiness
      if (!this.isReadyForAnalysis(comparison)) {
        return this.sendErrorResponse(
          res,
          409,
          'NOT_READY',
          'Comparison is not ready for analysis',
          {
            currentStatus: comparison.status,
            requiredStatus: 'data_collected',
          }
        );
      }

      // Check permissions
      const authResult = await this.checkComparisonAnalyzePermission(req.user, comparison.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to analyze this comparison'
        );
      }

      // Execute analysis
      const analysisResult = await this.standardsComparisonManagementUseCase.runStandardsAnalysis(
        comparisonId,
        analysisOptions || {}
      );

      // Generate analysis summary for response
      const analysisSummary = this.generateAnalysisSummary(analysisResult);

      this.logger.info('Standards analysis completed successfully', {
        comparisonId,
        overallScore: analysisResult.overallComplianceScore,
        criticalGaps: analysisResult.criticalGapsCount,
      });

      return this.sendSuccessResponse(
        res,
        200,
        {
          comparison: analysisResult,
          analysisSummary,
          nextSteps: {
            availableActions: ['generate_report', 'export_data', 'create_action_plan'],
            recommendations: 'Review analysis results and generate improvement report',
          },
        },
        'Standards analysis completed successfully'
      );
    } catch (error) {
      this.logger.error('Standards analysis failed:', error);

      if (error.message.includes('Cannot analyze comparison in status')) {
        return this.sendErrorResponse(res, 409, 'INVALID_STATUS', error.message);
      }

      return this.sendErrorResponse(
        res,
        500,
        'ANALYSIS_ERROR',
        'Failed to complete standards analysis',
        { details: error.message }
      );
    }
  }

  /**
   * Get Farm Standards Comparisons
   * GET /api/farms/:farmId/standards-comparisons
   *
   * ดึงรายการการเปรียบเทียบมาตรฐานทั้งหมดของฟาร์ม
   *
   * Query Parameters:
   * - page: number (default: 1)
   * - limit: number (default: 10)
   * - status: string/array - กรองตามสถานะ
   * - dateFrom: string - วันที่เริ่มต้น
   * - dateTo: string - วันที่สิ้นสุด
   * - includeMetrics: boolean - รวมสถิติหรือไม่
   * - includeTrends: boolean - รวมแนวโน้มหรือไม่
   */
  async getFarmStandardsComparisons(req, res) {
    try {
      const farmId = req.params.farmId;
      const {
        page = 1,
        limit = 10,
        status,
        dateFrom,
        dateTo,
        includeMetrics = false,
        includeTrends = false,
        sort = 'createdDate',
        order = 'desc',
      } = req.query;

      this.logger.info('Farm standards comparisons request', {
        farmId,
        userId: req.user?.id,
        filters: { status, dateFrom, dateTo },
        pagination: { page, limit },
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
          'Insufficient permissions to access farm standards comparisons'
        );
      }

      // Prepare query options
      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 50),
        status: status ? (Array.isArray(status) ? status : [status]) : undefined,
        dateFrom,
        dateTo,
        includeMetrics: includeMetrics === 'true',
        includeTrends: includeTrends === 'true',
        sort: { [sort]: order === 'asc' ? 1 : -1 },
      };

      // Get comparisons data
      const comparisonsData = await this.standardsComparisonManagementUseCase.getFarmComparisons(
        farmId,
        options
      );

      this.logger.info('Farm standards comparisons retrieved successfully', {
        farmId,
        count: comparisonsData.comparisons.length,
        totalCount: comparisonsData.pagination.totalCount,
      });

      return this.sendSuccessResponse(
        res,
        200,
        comparisonsData,
        'Farm standards comparisons retrieved successfully'
      );
    } catch (error) {
      this.logger.error('Farm standards comparisons retrieval failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'RETRIEVAL_ERROR',
        'Failed to retrieve farm standards comparisons',
        { details: error.message }
      );
    }
  }

  /**
   * Generate Improvement Report
   * POST /api/standards-comparisons/:id/reports
   *
   * สร้างรายงานคำแนะนำการปรับปรุง
   *
   * Request Body:
   * {
   *   "reportType": "improvement_plan",
   *   "format": "pdf",
   *   "language": "thai",
   *   "sections": ["executive_summary", "gap_analysis", "recommendations", "action_plan"],
   *   "includeCharts": true,
   *   "includeAppendix": true
   * }
   */
  async generateImprovementReport(req, res) {
    try {
      const comparisonId = req.params.id;
      const reportOptions = req.body;

      this.logger.info('Improvement report generation request', {
        comparisonId,
        userId: req.user?.id,
        reportOptions,
      });

      // Validate comparison exists and is completed
      const comparison =
        await this.standardsComparisonManagementUseCase.getStandardsComparison(comparisonId);

      if (!comparison) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Standards comparison not found');
      }

      if (comparison.status !== 'completed') {
        return this.sendErrorResponse(
          res,
          409,
          'NOT_COMPLETED',
          'Comparison must be completed before generating reports'
        );
      }

      // Check permissions
      const authResult = await this.checkComparisonReadPermission(req.user, comparison.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to generate report'
        );
      }

      // Validate report options
      const validationResult = this.validateReportOptions(reportOptions);
      if (!validationResult.isValid) {
        return this.sendErrorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Report options validation failed',
          validationResult.errors
        );
      }

      // Generate report
      const report = await this.standardsComparisonManagementUseCase.generateImprovementReport(
        comparisonId,
        reportOptions
      );

      this.logger.info('Improvement report generated successfully', {
        comparisonId,
        reportId: report.id,
        format: report.format,
      });

      // Return report info and download URL
      return this.sendSuccessResponse(
        res,
        201,
        {
          report: {
            id: report.id,
            type: report.type,
            format: report.format,
            language: report.language,
            generatedDate: report.generatedDate,
            pageCount: report.pageCount,
            fileSize: report.fileSize,
          },
          downloadUrl: `/api/standards-comparisons/${comparisonId}/reports/${report.id}/download`,
          expiresAt: report.expiresAt,
        },
        'Improvement report generated successfully'
      );
    } catch (error) {
      this.logger.error('Improvement report generation failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'REPORT_ERROR',
        'Failed to generate improvement report',
        { details: error.message }
      );
    }
  }

  /**
   * Get Comparison Progress
   * GET /api/standards-comparisons/:id/progress
   *
   * ดึงข้อมูลความคืบหน้าของการเปรียบเทียบ
   */
  async getComparisonProgress(req, res) {
    try {
      const comparisonId = req.params.id;

      this.logger.info('Comparison progress request', {
        comparisonId,
        userId: req.user?.id,
      });

      // Get comparison with progress info
      const comparison = await this.standardsComparisonManagementUseCase.getStandardsComparison(
        comparisonId,
        { includeProgress: true }
      );

      if (!comparison) {
        return this.sendErrorResponse(res, 404, 'NOT_FOUND', 'Standards comparison not found');
      }

      // Check read permissions
      const authResult = await this.checkComparisonReadPermission(req.user, comparison.farmId);
      if (!authResult.authorized) {
        return this.sendErrorResponse(
          res,
          403,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions to access comparison progress'
        );
      }

      // Generate progress information
      const progressInfo = {
        comparisonId: comparison.id,
        status: comparison.status,
        overallProgress: this.calculateOverallProgress(comparison),
        phases: {
          configuration: comparison.status !== 'draft' ? 100 : 50,
          dataCollection: this.calculateDataCollectionProgress(comparison),
          analysis: this.calculateAnalysisProgress(comparison),
          reporting: this.calculateReportingProgress(comparison),
        },
        estimatedCompletion: this.calculateEstimatedCompletion(comparison),
        lastActivity: comparison.lastAnalysisDate || comparison.createdDate,
        nextSteps: this.generateProgressNextSteps(comparison),
      };

      return this.sendSuccessResponse(
        res,
        200,
        progressInfo,
        'Comparison progress retrieved successfully'
      );
    } catch (error) {
      this.logger.error('Comparison progress retrieval failed:', error);
      return this.sendErrorResponse(
        res,
        500,
        'PROGRESS_ERROR',
        'Failed to retrieve comparison progress',
        { details: error.message }
      );
    }
  }

  /**
   * Input Validation Methods
   */

  validateCreateComparisonInput(data) {
    const errors = [];

    if (!data.comparisonName || typeof data.comparisonName !== 'string') {
      errors.push('Comparison name is required and must be a string');
    }

    if (!data.farmId || typeof data.farmId !== 'string') {
      errors.push('Farm ID is required and must be a string');
    }

    if (data.targetStandards && !Array.isArray(data.targetStandards)) {
      errors.push('Target standards must be an array');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateUpdateConfigurationInput(data) {
    const errors = [];

    if (!data || Object.keys(data).length === 0) {
      errors.push('Update data is required');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateDataCollectionOptions(options) {
    const errors = [];

    if (options.dateRange) {
      if (options.dateRange.from && !this.isValidDate(options.dateRange.from)) {
        errors.push('Invalid date format for dateRange.from');
      }
      if (options.dateRange.to && !this.isValidDate(options.dateRange.to)) {
        errors.push('Invalid date format for dateRange.to');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  validateReportOptions(options) {
    const errors = [];

    if (options.format && !['pdf', 'html', 'excel'].includes(options.format)) {
      errors.push('Invalid report format');
    }

    if (options.language && !['thai', 'english'].includes(options.language)) {
      errors.push('Invalid language option');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Authorization Methods
   */

  async checkComparisonCreatePermission(user, farmId) {
    return { authorized: !!user };
  }

  async checkComparisonReadPermission(user, farmId) {
    return { authorized: !!user };
  }

  async checkComparisonUpdatePermission(user, farmId) {
    return { authorized: !!user };
  }

  async checkComparisonAnalyzePermission(user, farmId) {
    return { authorized: !!user };
  }

  async checkFarmAccessPermission(user, farmId) {
    return { authorized: !!user };
  }

  /**
   * Utility Methods
   */

  isValidComparisonId(id) {
    return typeof id === 'string' && id.length > 0;
  }

  isValidFarmId(id) {
    return typeof id === 'string' && id.length > 0;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  isReadyForAnalysis(comparison) {
    return comparison.status === 'data_collected';
  }

  formatComparisonData(comparison, format) {
    switch (format) {
      case 'summary':
        return {
          id: comparison.id,
          comparisonName: comparison.comparisonName,
          status: comparison.status,
          overallComplianceScore: comparison.overallComplianceScore,
          createdDate: comparison.createdDate,
        };
      case 'full':
        return comparison;
      default: // detailed
        return {
          ...comparison,
          // Remove large data objects for better performance
          currentPractices: undefined,
          detailedReports: undefined,
        };
    }
  }

  generateComparisonNextSteps(comparison) {
    return {
      currentPhase: 'configuration',
      nextAction: 'collect_data',
      description: 'Configure comparison parameters and collect current practices data',
      estimatedTime: '2-4 hours',
    };
  }

  calculateDataCollectionEstimate(comparison, options) {
    const baseTime = 30; // minutes
    const complexityFactor = options.includeHistoricalData ? 2 : 1;
    return new Date(Date.now() + baseTime * complexityFactor * 60 * 1000);
  }

  generateAnalysisSummary(analysisResult) {
    return {
      overallScore: analysisResult.overallComplianceScore,
      criticalGaps: analysisResult.criticalGapsCount,
      improvementOpportunities: analysisResult.improvementOpportunities,
      completedDate: analysisResult.completedDate,
    };
  }

  calculateOverallProgress(comparison) {
    switch (comparison.status) {
      case 'draft':
      case 'configuring':
        return 25;
      case 'collecting_data':
      case 'data_collected':
        return 50;
      case 'analyzing':
        return 75;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  }

  calculateDataCollectionProgress(comparison) {
    return comparison.status === 'data_collected' || comparison.status === 'completed'
      ? 100
      : comparison.status === 'collecting_data'
        ? 50
        : 0;
  }

  calculateAnalysisProgress(comparison) {
    return comparison.status === 'completed' ? 100 : comparison.status === 'analyzing' ? 50 : 0;
  }

  calculateReportingProgress(comparison) {
    return comparison.detailedReports ? 100 : 0;
  }

  calculateEstimatedCompletion(comparison) {
    const now = new Date();
    let hoursToAdd = 0;

    switch (comparison.status) {
      case 'draft':
      case 'configuring':
        hoursToAdd = 8;
        break;
      case 'collecting_data':
        hoursToAdd = 4;
        break;
      case 'analyzing':
        hoursToAdd = 2;
        break;
      default:
        hoursToAdd = 0;
    }

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  generateProgressNextSteps(comparison) {
    switch (comparison.status) {
      case 'draft':
        return 'Complete comparison configuration';
      case 'collecting_data':
        return 'Data collection in progress';
      case 'data_collected':
        return 'Ready for analysis';
      case 'analyzing':
        return 'Analysis in progress';
      case 'completed':
        return 'Generate reports or create action plan';
      default:
        return 'Configure comparison parameters';
    }
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

module.exports = StandardsComparisonController;
