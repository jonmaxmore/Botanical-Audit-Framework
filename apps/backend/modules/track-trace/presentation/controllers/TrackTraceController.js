/**
 * Track & Trace Controller - Presentation Layer
 *
 * Business Logic & API Design:
 * การจัดการ API endpoints สำหรับระบบติดตามเมล็ดพันธุ์และพืช
 *
 * Complete API Workflow:
 * 1. Request Validation → 2. Business Logic Orchestration → 3. Response Formatting →
 * 4. Error Handling → 5. Audit Logging → 6. Performance Monitoring
 *
 * Business Rules:
 * - API ต้องให้ข้อมูลที่ครบถ้วนและตรวจสอบได้
 * - การตอบสนองต้องรวดเร็วและมีประสิทธิภาพ
 * - รองรับการติดตามแบบ real-time และ batch
 * - มีระบบการแจ้งเตือนและการจัดการข้อผิดพลาด
 * - ปฏิบัติตามมาตรฐาน REST API และ GACP compliance
 */

class TrackTraceController {
  constructor(options = {}) {
    this.trackSeedUseCase = options.trackSeedUseCase;
    this.trackPlantUseCase = options.trackPlantUseCase;
    this.trackHarvestUseCase = options.trackHarvestUseCase;
    this.validationService = options.validationService;
    this.authService = options.authService;
    this.auditService = options.auditService;
    this.performanceMonitor = options.performanceMonitor;
    this.logger = options.logger || console;

    // API configuration
    this.apiConfig = {
      maxPageSize: 100,
      defaultPageSize: 20,
      maxBulkOperations: 1000,
      requestTimeout: 30000, // 30 seconds
      rateLimits: {
        standard: 100, // requests per minute
        bulk: 10, // bulk operations per minute
        reporting: 20, // report generations per minute
      },
    };

    // Response formats and templates
    this.responseFormats = {
      success: (data, metadata = {}) => ({
        success: true,
        data: data,
        metadata: {
          timestamp: new Date(),
          requestId: metadata.requestId,
          ...metadata,
        },
      }),

      error: (message, code = 'GENERAL_ERROR', details = {}) => ({
        success: false,
        error: {
          code: code,
          message: message,
          details: details,
          timestamp: new Date(),
        },
      }),

      pagination: (data, pagination) => ({
        success: true,
        data: data,
        pagination: pagination,
        metadata: {
          timestamp: new Date(),
        },
      }),
    };

    // Error codes for consistent error handling
    this.errorCodes = {
      VALIDATION_ERROR: 'VALIDATION_ERROR',
      NOT_FOUND: 'RESOURCE_NOT_FOUND',
      UNAUTHORIZED: 'UNAUTHORIZED_ACCESS',
      FORBIDDEN: 'FORBIDDEN_OPERATION',
      BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
      SYSTEM_ERROR: 'SYSTEM_ERROR',
      RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
      TIMEOUT: 'OPERATION_TIMEOUT',
    };
  }

  /**
   * API Endpoint: Initialize seed tracking
   * POST /api/v1/track-trace/seed/initialize
   *
   * Business Process:
   * 1. Validate seed registration data and compliance
   * 2. Initialize seed tracking with full traceability
   * 3. Set up quality monitoring and alerts
   * 4. Generate tracking documentation and QR codes
   */
  async initializeSeedTracking(req, res) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();

    try {
      this.logger.log(`[TrackTrace] Initialize seed tracking - Request: ${requestId}`);

      // Step 1: Authenticate and authorize request
      const userContext = await this.authService.authenticateRequest(req);
      await this.authService.authorizeOperation(userContext, 'SEED_TRACKING_INITIALIZE');

      // Step 2: Validate request data
      const validationResult = await this.validationService.validateSeedInitialization(req.body);
      if (!validationResult.valid) {
        return res
          .status(400)
          .json(
            this.responseFormats.error(
              'Invalid seed initialization data',
              this.errorCodes.VALIDATION_ERROR,
              validationResult.errors
            )
          );
      }

      // Step 3: Execute seed tracking initialization
      const seedTrackingResult = await this.trackSeedUseCase.initializeSeedTracking(req.body);

      // Step 4: Create audit log
      await this.auditService.log({
        action: 'SEED_TRACKING_INITIALIZED',
        userId: userContext.userId,
        requestId: requestId,
        data: {
          seedId: seedTrackingResult.seedId,
          batchNumber: req.body.batchNumber,
          supplierId: req.body.supplier?.supplierId,
        },
      });

      // Step 5: Performance monitoring
      const executionTime = Date.now() - startTime;
      this.performanceMonitor.recordMetric('api.seed.initialize', {
        duration: executionTime,
        success: true,
        userId: userContext.userId,
      });

      // Step 6: Format successful response
      const response = this.responseFormats.success(seedTrackingResult, {
        requestId: requestId,
        executionTime: executionTime,
      });

      this.logger.log(
        `[TrackTrace] Seed tracking initialized successfully - Request: ${requestId}, Duration: ${executionTime}ms`
      );

      res.status(201).json(response);
    } catch (error) {
      await this.handleControllerError(error, req, res, 'SEED_INITIALIZE', requestId, startTime);
    }
  }

  /**
   * API Endpoint: Get seed tracking information
   * GET /api/v1/track-trace/seed/:seedId
   *
   * Business Process:
   * 1. Validate access permissions for seed data
   * 2. Retrieve comprehensive seed tracking information
   * 3. Include traceability and compliance data
   * 4. Format response with proper caching headers
   */
  async getSeedTracking(req, res) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();

    try {
      this.logger.log(
        `[TrackTrace] Get seed tracking - Seed: ${req.params.seedId}, Request: ${requestId}`
      );

      // Step 1: Authenticate and authorize
      const userContext = await this.authService.authenticateRequest(req);
      await this.authService.authorizeResourceAccess(userContext, 'SEED', req.params.seedId);

      // Step 2: Validate seed ID format
      if (!this.validationService.isValidSeedId(req.params.seedId)) {
        return res
          .status(400)
          .json(
            this.responseFormats.error('Invalid seed ID format', this.errorCodes.VALIDATION_ERROR)
          );
      }

      // Step 3: Get seed tracking information
      const includeHistory = req.query.includeHistory === 'true';
      const includeQualityData = req.query.includeQuality === 'true';

      const seedTracking = await this.trackSeedUseCase.getSeedTrackingInfo(req.params.seedId, {
        includeHistory: includeHistory,
        includeQualityData: includeQualityData,
        userContext: userContext,
      });

      if (!seedTracking) {
        return res
          .status(404)
          .json(this.responseFormats.error('Seed not found', this.errorCodes.NOT_FOUND));
      }

      // Step 4: Set appropriate caching headers
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes
        ETag: this.generateETag(seedTracking),
        'Last-Modified': seedTracking.updatedAt,
      });

      // Step 5: Check conditional requests
      if (req.headers['if-none-match'] === res.get('ETag')) {
        return res.status(304).send();
      }

      // Step 6: Performance monitoring
      const executionTime = Date.now() - startTime;
      this.performanceMonitor.recordMetric('api.seed.get', {
        duration: executionTime,
        cacheHit: false,
        dataSize: JSON.stringify(seedTracking).length,
      });

      // Step 7: Format response
      const response = this.responseFormats.success(seedTracking, {
        requestId: requestId,
        executionTime: executionTime,
      });

      this.logger.log(
        `[TrackTrace] Seed tracking retrieved - Request: ${requestId}, Duration: ${executionTime}ms`
      );

      res.status(200).json(response);
    } catch (error) {
      await this.handleControllerError(error, req, res, 'SEED_GET', requestId, startTime);
    }
  }

  /**
   * API Endpoint: Initialize plant tracking
   * POST /api/v1/track-trace/plant/initialize
   *
   * Business Process:
   * 1. Validate planting data and seed traceability
   * 2. Initialize comprehensive plant lifecycle tracking
   * 3. Set up growth monitoring and environmental alerts
   * 4. Create plant tracking dashboard and notifications
   */
  async initializePlantTracking(req, res) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();

    try {
      this.logger.log(`[TrackTrace] Initialize plant tracking - Request: ${requestId}`);

      // Step 1: Authenticate and authorize
      const userContext = await this.authService.authenticateRequest(req);
      await this.authService.authorizeOperation(userContext, 'PLANT_TRACKING_INITIALIZE');

      // Step 2: Validate planting data
      const validationResult = await this.validationService.validatePlantInitialization(req.body);
      if (!validationResult.valid) {
        return res
          .status(400)
          .json(
            this.responseFormats.error(
              'Invalid plant initialization data',
              this.errorCodes.VALIDATION_ERROR,
              validationResult.errors
            )
          );
      }

      // Step 3: Verify seed traceability
      const seedValidation = await this.trackSeedUseCase.validateSeedForPlanting(req.body.seedId);
      if (!seedValidation.valid) {
        return res
          .status(400)
          .json(
            this.responseFormats.error(
              'Seed not available for planting',
              this.errorCodes.BUSINESS_RULE_VIOLATION,
              seedValidation.issues
            )
          );
      }

      // Step 4: Initialize plant tracking
      const plantTrackingResult = await this.trackPlantUseCase.initializePlantTracking(req.body);

      // Step 5: Update seed usage status
      await this.trackSeedUseCase.recordSeedUsage(req.body.seedId, {
        plantId: plantTrackingResult.plantId,
        plantingDate: req.body.plantingDate,
        quantityUsed: req.body.seedsPlanted,
      });

      // Step 6: Create audit trail
      await this.auditService.log({
        action: 'PLANT_TRACKING_INITIALIZED',
        userId: userContext.userId,
        requestId: requestId,
        data: {
          plantId: plantTrackingResult.plantId,
          seedId: req.body.seedId,
          farmId: req.body.farmId,
          plotId: req.body.plotId,
        },
      });

      // Step 7: Performance monitoring
      const executionTime = Date.now() - startTime;
      this.performanceMonitor.recordMetric('api.plant.initialize', {
        duration: executionTime,
        success: true,
      });

      // Step 8: Format response
      const response = this.responseFormats.success(plantTrackingResult, {
        requestId: requestId,
        executionTime: executionTime,
      });

      this.logger.log(
        `[TrackTrace] Plant tracking initialized - Plant: ${plantTrackingResult.plantId}, Request: ${requestId}`
      );

      res.status(201).json(response);
    } catch (error) {
      await this.handleControllerError(error, req, res, 'PLANT_INITIALIZE', requestId, startTime);
    }
  }

  /**
   * API Endpoint: Record plant growth measurement
   * PUT /api/v1/track-trace/plant/:plantId/measurement
   *
   * Business Process:
   * 1. Validate measurement data and timing
   * 2. Record growth measurement with quality checks
   * 3. Analyze growth patterns and detect anomalies
   * 4. Update monitoring schedules and alerts
   */
  async recordPlantMeasurement(req, res) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();

    try {
      this.logger.log(
        `[TrackTrace] Record plant measurement - Plant: ${req.params.plantId}, Request: ${requestId}`
      );

      // Step 1: Authenticate and authorize
      const userContext = await this.authService.authenticateRequest(req);
      await this.authService.authorizeResourceAccess(userContext, 'PLANT', req.params.plantId);

      // Step 2: Validate measurement data
      const validationResult = await this.validationService.validatePlantMeasurement(req.body);
      if (!validationResult.valid) {
        return res
          .status(400)
          .json(
            this.responseFormats.error(
              'Invalid measurement data',
              this.errorCodes.VALIDATION_ERROR,
              validationResult.errors
            )
          );
      }

      // Step 3: Record measurement
      const measurementResult = await this.trackPlantUseCase.recordGrowthMeasurement(
        req.params.plantId,
        {
          ...req.body,
          recordedBy: userContext.userId,
          recordedAt: new Date(),
        }
      );

      // Step 4: Handle alerts if any anomalies detected
      if (measurementResult.anomalies && measurementResult.anomalies.length > 0) {
        await this.handleMeasurementAnomalies(
          req.params.plantId,
          measurementResult.anomalies,
          userContext
        );
      }

      // Step 5: Create audit log
      await this.auditService.log({
        action: 'PLANT_MEASUREMENT_RECORDED',
        userId: userContext.userId,
        requestId: requestId,
        data: {
          plantId: req.params.plantId,
          measurementType: req.body.measurementType,
          value: req.body.value,
          growthRate: measurementResult.measurement?.growthRate,
        },
      });

      // Step 6: Performance monitoring
      const executionTime = Date.now() - startTime;
      this.performanceMonitor.recordMetric('api.plant.measurement', {
        duration: executionTime,
        measurementType: req.body.measurementType,
      });

      // Step 7: Format response
      const response = this.responseFormats.success(measurementResult, {
        requestId: requestId,
        executionTime: executionTime,
      });

      this.logger.log(
        `[TrackTrace] Plant measurement recorded - Plant: ${req.params.plantId}, Request: ${requestId}`
      );

      res.status(200).json(response);
    } catch (error) {
      await this.handleControllerError(error, req, res, 'PLANT_MEASUREMENT', requestId, startTime);
    }
  }

  /**
   * API Endpoint: Initialize harvest tracking
   * POST /api/v1/track-trace/harvest/initialize
   *
   * Business Process:
   * 1. Conduct pre-harvest assessment for multiple plants
   * 2. Validate harvest readiness and team preparation
   * 3. Initialize harvest batch tracking with complete documentation
   * 4. Set up post-harvest processing workflow
   */
  async initializeHarvestTracking(req, res) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();

    try {
      this.logger.log(
        `[TrackTrace] Initialize harvest tracking - Plants: ${req.body.plantIds?.length || 0}, Request: ${requestId}`
      );

      // Step 1: Authenticate and authorize
      const userContext = await this.authService.authenticateRequest(req);
      await this.authService.authorizeOperation(userContext, 'HARVEST_TRACKING_INITIALIZE');

      // Step 2: Validate harvest initialization data
      const validationResult = await this.validationService.validateHarvestInitialization(req.body);
      if (!validationResult.valid) {
        return res
          .status(400)
          .json(
            this.responseFormats.error(
              'Invalid harvest initialization data',
              this.errorCodes.VALIDATION_ERROR,
              validationResult.errors
            )
          );
      }

      // Step 3: Validate plant readiness for harvest
      const plantsValidation = await Promise.all(
        req.body.plantIds.map(plantId => this.trackPlantUseCase.validateHarvestReadiness(plantId))
      );

      const notReadyPlants = plantsValidation
        .filter(validation => !validation.ready)
        .map(validation => validation.plantId);

      if (notReadyPlants.length > 0) {
        return res
          .status(400)
          .json(
            this.responseFormats.error(
              'Some plants are not ready for harvest',
              this.errorCodes.BUSINESS_RULE_VIOLATION,
              { notReadyPlants: notReadyPlants }
            )
          );
      }

      // Step 4: Initialize harvest tracking
      const harvestTrackingResult = await this.trackHarvestUseCase.initializeHarvestTracking({
        ...req.body,
        initiatedBy: userContext.userId,
      });

      // Step 5: Create comprehensive audit log
      await this.auditService.log({
        action: 'HARVEST_TRACKING_INITIALIZED',
        userId: userContext.userId,
        requestId: requestId,
        data: {
          batchId: harvestTrackingResult.harvestBatch.batchId,
          plantCount: req.body.plantIds.length,
          estimatedYield: harvestTrackingResult.preHarvestSummary.estimatedTotalYield,
          farmId: req.body.farmId,
        },
      });

      // Step 6: Performance monitoring
      const executionTime = Date.now() - startTime;
      this.performanceMonitor.recordMetric('api.harvest.initialize', {
        duration: executionTime,
        plantCount: req.body.plantIds.length,
      });

      // Step 7: Format response
      const response = this.responseFormats.success(harvestTrackingResult, {
        requestId: requestId,
        executionTime: executionTime,
      });

      this.logger.log(
        `[TrackTrace] Harvest tracking initialized - Batch: ${harvestTrackingResult.harvestBatch.batchId}, Request: ${requestId}`
      );

      res.status(201).json(response);
    } catch (error) {
      await this.handleControllerError(error, req, res, 'HARVEST_INITIALIZE', requestId, startTime);
    }
  }

  /**
   * API Endpoint: Get comprehensive tracking report
   * GET /api/v1/track-trace/report/:entityType/:entityId
   *
   * Business Process:
   * 1. Generate comprehensive tracking report for seed/plant/harvest
   * 2. Include complete traceability chain and compliance data
   * 3. Format report with analytics and performance metrics
   * 4. Support multiple export formats (JSON, PDF, CSV)
   */
  async getTrackingReport(req, res) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();

    try {
      const { entityType, entityId } = req.params;

      this.logger.log(
        `[TrackTrace] Generate tracking report - Type: ${entityType}, ID: ${entityId}, Request: ${requestId}`
      );

      // Step 1: Authenticate and authorize
      const userContext = await this.authService.authenticateRequest(req);
      await this.authService.authorizeResourceAccess(
        userContext,
        entityType.toUpperCase(),
        entityId
      );

      // Step 2: Validate entity type and ID
      if (!this.validationService.isValidEntityType(entityType)) {
        return res
          .status(400)
          .json(
            this.responseFormats.error('Invalid entity type', this.errorCodes.VALIDATION_ERROR)
          );
      }

      // Step 3: Generate appropriate report based on entity type
      let reportData;

      switch (entityType.toLowerCase()) {
        case 'seed':
          reportData = await this.trackSeedUseCase.generateSeedTrackingReport(entityId);
          break;
        case 'plant':
          reportData = await this.trackPlantUseCase.generatePlantTrackingReport(entityId);
          break;
        case 'harvest':
          reportData = await this.trackHarvestUseCase.generateHarvestBatchReport(entityId);
          break;
        default:
          return res
            .status(400)
            .json(
              this.responseFormats.error(
                'Unsupported entity type for reporting',
                this.errorCodes.VALIDATION_ERROR
              )
            );
      }

      if (!reportData) {
        return res
          .status(404)
          .json(this.responseFormats.error(`${entityType} not found`, this.errorCodes.NOT_FOUND));
      }

      // Step 4: Handle export format
      const exportFormat = req.query.format || 'json';

      if (exportFormat !== 'json') {
        return await this.handleReportExport(reportData, exportFormat, res, requestId);
      }

      // Step 5: Create audit log for report access
      await this.auditService.log({
        action: 'TRACKING_REPORT_ACCESSED',
        userId: userContext.userId,
        requestId: requestId,
        data: {
          entityType: entityType,
          entityId: entityId,
          reportSize: JSON.stringify(reportData).length,
        },
      });

      // Step 6: Performance monitoring
      const executionTime = Date.now() - startTime;
      this.performanceMonitor.recordMetric('api.report.generate', {
        duration: executionTime,
        entityType: entityType,
        reportSize: JSON.stringify(reportData).length,
      });

      // Step 7: Format response with caching headers
      res.set({
        'Cache-Control': 'private, max-age=300', // 5 minutes private cache
        'Content-Type': 'application/json',
      });

      const response = this.responseFormats.success(reportData, {
        requestId: requestId,
        executionTime: executionTime,
        entityType: entityType,
        entityId: entityId,
      });

      this.logger.log(
        `[TrackTrace] Tracking report generated - Type: ${entityType}, ID: ${entityId}, Request: ${requestId}, Duration: ${executionTime}ms`
      );

      res.status(200).json(response);
    } catch (error) {
      await this.handleControllerError(error, req, res, 'REPORT_GENERATE', requestId, startTime);
    }
  }

  /**
   * API Endpoint: Search tracking entities with advanced filters
   * GET /api/v1/track-trace/search
   *
   * Business Process:
   * 1. Support advanced search across seeds, plants, and harvests
   * 2. Include faceted search and filtering capabilities
   * 3. Optimize for performance with proper pagination
   * 4. Provide search analytics and recommendations
   */
  async searchTrackingEntities(req, res) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || this.generateRequestId();

    try {
      this.logger.log(`[TrackTrace] Search tracking entities - Request: ${requestId}`);

      // Step 1: Authenticate and authorize
      const userContext = await this.authService.authenticateRequest(req);
      await this.authService.authorizeOperation(userContext, 'TRACKING_SEARCH');

      // Step 2: Validate search parameters
      const searchParams = {
        query: req.query.q,
        entityType: req.query.type,
        filters: this.parseSearchFilters(req.query),
        pagination: {
          page: parseInt(req.query.page) || 1,
          limit: Math.min(
            parseInt(req.query.limit) || this.apiConfig.defaultPageSize,
            this.apiConfig.maxPageSize
          ),
        },
        sort: req.query.sort || 'relevance',
      };

      const validationResult = await this.validationService.validateSearchParams(searchParams);
      if (!validationResult.valid) {
        return res
          .status(400)
          .json(
            this.responseFormats.error(
              'Invalid search parameters',
              this.errorCodes.VALIDATION_ERROR,
              validationResult.errors
            )
          );
      }

      // Step 3: Execute search based on entity type
      let searchResults;

      if (!searchParams.entityType || searchParams.entityType === 'all') {
        // Cross-entity search
        searchResults = await this.executeMultiEntitySearch(searchParams, userContext);
      } else {
        // Single entity type search
        searchResults = await this.executeSingleEntitySearch(searchParams, userContext);
      }

      // Step 4: Performance monitoring
      const executionTime = Date.now() - startTime;
      this.performanceMonitor.recordMetric('api.search', {
        duration: executionTime,
        entityType: searchParams.entityType,
        resultsCount: searchResults.totalResults,
      });

      // Step 5: Format paginated response
      const response = this.responseFormats.pagination(searchResults.results, {
        page: searchParams.pagination.page,
        limit: searchParams.pagination.limit,
        total: searchResults.totalResults,
        totalPages: Math.ceil(searchResults.totalResults / searchParams.pagination.limit),
        hasNext: searchResults.hasNext,
        hasPrev: searchParams.pagination.page > 1,
      });

      // Add search metadata
      response.searchMetadata = {
        query: searchParams.query,
        entityType: searchParams.entityType,
        filtersApplied: Object.keys(searchParams.filters).length,
        executionTime: executionTime,
        facets: searchResults.facets || null,
      };

      this.logger.log(
        `[TrackTrace] Search completed - Results: ${searchResults.totalResults}, Request: ${requestId}, Duration: ${executionTime}ms`
      );

      res.status(200).json(response);
    } catch (error) {
      await this.handleControllerError(error, req, res, 'SEARCH', requestId, startTime);
    }
  }

  // Helper methods for controller operations

  /**
   * Handle controller errors with consistent formatting and logging
   */
  async handleControllerError(error, req, res, operation, requestId, startTime) {
    const executionTime = Date.now() - startTime;

    this.logger.error(
      `[TrackTrace] ${operation} error - Request: ${requestId}, Duration: ${executionTime}ms, Error: ${error.message}`,
      {
        error: error.stack,
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
      }
    );

    // Record error metrics
    this.performanceMonitor.recordError(operation.toLowerCase(), {
      duration: executionTime,
      errorType: error.name,
      errorMessage: error.message,
    });

    // Audit error occurrence
    try {
      await this.auditService.log({
        action: `${operation}_ERROR`,
        requestId: requestId,
        error: {
          message: error.message,
          type: error.name,
          operation: operation,
        },
      });
    } catch (auditError) {
      this.logger.error(`[TrackTrace] Audit logging failed: ${auditError.message}`);
    }

    // Determine appropriate error response
    let errorCode = this.errorCodes.SYSTEM_ERROR;
    let statusCode = 500;
    let errorMessage = 'An internal error occurred';

    if (error.name === 'ValidationError') {
      errorCode = this.errorCodes.VALIDATION_ERROR;
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.name === 'NotFoundError') {
      errorCode = this.errorCodes.NOT_FOUND;
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.name === 'UnauthorizedError') {
      errorCode = this.errorCodes.UNAUTHORIZED;
      statusCode = 401;
      errorMessage = 'Unauthorized access';
    } else if (error.name === 'ForbiddenError') {
      errorCode = this.errorCodes.FORBIDDEN;
      statusCode = 403;
      errorMessage = 'Forbidden operation';
    } else if (error.name === 'BusinessRuleError') {
      errorCode = this.errorCodes.BUSINESS_RULE_VIOLATION;
      statusCode = 422;
      errorMessage = error.message;
    } else if (error.name === 'TimeoutError') {
      errorCode = this.errorCodes.TIMEOUT;
      statusCode = 408;
      errorMessage = 'Operation timeout';
    }

    const errorResponse = this.responseFormats.error(errorMessage, errorCode, {
      requestId: requestId,
      operation: operation,
      executionTime: executionTime,
    });

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Handle measurement anomalies with appropriate alerts and notifications
   */
  async handleMeasurementAnomalies(plantId, anomalies, userContext) {
    try {
      for (const anomaly of anomalies) {
        if (anomaly.severity === 'CRITICAL') {
          // Send immediate alerts for critical anomalies
          await this.alertService.sendCriticalAlert({
            type: 'PLANT_MEASUREMENT_ANOMALY',
            plantId: plantId,
            anomaly: anomaly,
            detectedBy: userContext.userId,
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      this.logger.error(`[TrackTrace] Error handling measurement anomalies: ${error.message}`);
    }
  }

  /**
   * Handle report export to different formats
   */
  async handleReportExport(reportData, format, res, requestId) {
    try {
      let exportResult;
      let contentType;
      let fileExtension;

      switch (format.toLowerCase()) {
        case 'pdf':
          exportResult = await this.exportService.generatePDF(reportData);
          contentType = 'application/pdf';
          fileExtension = 'pdf';
          break;
        case 'csv':
          exportResult = await this.exportService.generateCSV(reportData);
          contentType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'xlsx':
          exportResult = await this.exportService.generateExcel(reportData);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileExtension = 'xlsx';
          break;
        default:
          return res
            .status(400)
            .json(
              this.responseFormats.error(
                'Unsupported export format',
                this.errorCodes.VALIDATION_ERROR
              )
            );
      }

      const filename = `track-trace-report-${requestId}.${fileExtension}`;

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': exportResult.length,
      });

      res.send(exportResult);
    } catch (error) {
      this.logger.error(`[TrackTrace] Report export failed: ${error.message}`);
      throw error;
    }
  }

  // Utility methods
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateETag(data) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  parseSearchFilters(queryParams) {
    const filters = {};

    // Parse standard filter parameters
    if (queryParams.status) filters.status = queryParams.status;
    if (queryParams.farmId) filters.farmId = queryParams.farmId;
    if (queryParams.strain) filters.strain = queryParams.strain;
    if (queryParams.dateFrom) filters.dateFrom = queryParams.dateFrom;
    if (queryParams.dateTo) filters.dateTo = queryParams.dateTo;
    if (queryParams.qualityMin) filters.qualityMin = parseInt(queryParams.qualityMin);

    return filters;
  }

  // Placeholder methods for search operations
  async executeMultiEntitySearch(searchParams, userContext) {
    return { results: [], totalResults: 0 };
  }
  async executeSingleEntitySearch(searchParams, userContext) {
    return { results: [], totalResults: 0 };
  }
}

module.exports = TrackTraceController;
