/**
 * Enhanced Application Processing Controller
 *
 * Comprehensive controller that orchestrates the complete GACP application
 * processing workflow with enterprise-grade features and integrations:
 *
 * Business Logic & Architecture:
 * 1. Advanced FSM Management - Complete 12-state application lifecycle
 * 2. Document Integration - Seamless document workflow coordination
 * 3. Government API Integration - Real-time government system connectivity
 * 4. Compliance Monitoring - Continuous regulatory compliance tracking
 * 5. Performance Analytics - Comprehensive metrics and reporting
 *
 * Controller Responsibilities:
 * - API endpoint management and request/response handling
 * - Service orchestration and workflow coordination
 * - Error handling and user feedback
 * - Security and authorization enforcement
 * - Audit trail generation and compliance logging
 *
 * Workflow Integration:
 * All application operations flow through this controller ensuring
 * consistent business logic application, proper error handling,
 * comprehensive audit trails, and optimal user experience.
 */

const { body, query, param } = require('express-validator');

class EnhancedApplicationProcessingController {
  constructor({
    advancedApplicationProcessingService,
    documentManagementIntegrationSystem,
    governmentApiIntegrationService,
    auditService,
    validationService,
    authorizationService,
    performanceMonitor,
    logger,
  }) {
    // Core service dependencies
    this.advancedApplicationProcessingService = advancedApplicationProcessingService;
    this.documentManagementIntegrationSystem = documentManagementIntegrationSystem;
    this.governmentApiIntegrationService = governmentApiIntegrationService;
    this.auditService = auditService;
    this.validationService = validationService;
    this.authorizationService = authorizationService;
    this.performanceMonitor = performanceMonitor;
    this.logger = logger;

    // Performance metrics tracking
    this.controllerMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTimes: {},
      endpointUsage: {},
      errorDistribution: {},
    };

    // Bind methods to maintain context
    this.createApplication = this.createApplication.bind(this);
    this.processStateTransition = this.processStateTransition.bind(this);
    this.getApplicationDashboard = this.getApplicationDashboard.bind(this);
    this.uploadDocument = this.uploadDocument.bind(this);
    this.verifyFarmerIdentity = this.verifyFarmerIdentity.bind(this);
    this.verifyLandOwnership = this.verifyLandOwnership.bind(this);
    this.submitToGovernment = this.submitToGovernment.bind(this);
    this.checkGovernmentStatus = this.checkGovernmentStatus.bind(this);
    this.getSystemHealth = this.getSystemHealth.bind(this);
    this.getAnalyticsDashboard = this.getAnalyticsDashboard.bind(this);
  }

  /**
   * Create new GACP application
   * POST /api/farmer/applications
   * POST /api/dtam/applications
   *
   * Business Logic: Complete application creation with advanced validation
   *
   * Workflow:
   * 1. Validate user authorization and input data
   * 2. Process farmer eligibility and requirements
   * 3. Create application with FSM initialization
   * 4. Setup document management workflow
   * 5. Initialize compliance monitoring
   * 6. Generate response with tracking information
   */
  async createApplication(req, res) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    try {
      this.logger.info(
        `[EnhancedApplicationController] Creating application - Request: ${requestId}`
      );

      // Validate request data
      const validationResult = await this.validationService.validateApplicationData(req.body);
      if (!validationResult.valid) {
        return this._sendValidationError(res, validationResult.errors, requestId);
      }

      // Authorize user for application creation
      const authorizationResult = await this.authorizationService.authorizeApplicationCreation(
        req.user,
        req.body
      );
      if (!authorizationResult.authorized) {
        return this._sendAuthorizationError(res, authorizationResult.reason, requestId);
      }

      // Extract and structure application data
      const farmerData = {
        userId: req.user.userId,
        role: req.user.role,
        citizenId: req.body.farmerCitizenId,
        firstName: req.body.farmerFirstName,
        lastName: req.body.farmerLastName,
        email: req.body.farmerEmail,
        phoneNumber: req.body.farmerPhoneNumber,
        address: req.body.farmerAddress,
      };

      const applicationData = {
        farmName: req.body.farmName,
        farmAddress: req.body.farmAddress,
        farmSize: req.body.farmSize,
        farmSizeUnit: req.body.farmSizeUnit || 'rai',
        cultivationType: req.body.cultivationType,
        cannabisVariety: req.body.cannabisVariety,
        farmType: req.body.farmType || 'OUTDOOR',
        productionCapacity: req.body.productionCapacity,
        marketIntent: req.body.marketIntent || 'DOMESTIC',
        certificationGoals: req.body.certificationGoals || [],
      };

      const options = {
        priority: req.body.priority || 'STANDARD',
        fastTrack: req.body.fastTrack || false,
        additionalServices: req.body.additionalServices || [],
      };

      // Create application through service
      const applicationResult = await this.advancedApplicationProcessingService.createApplication(
        farmerData,
        applicationData,
        options
      );

      // Create controller audit record
      await this._createControllerAuditRecord('APPLICATION_CREATED', {
        requestId,
        userId: req.user.userId,
        applicationId: applicationResult.data.applicationId,
        processingTime: Date.now() - startTime,
      });

      // Update controller metrics
      this._updateControllerMetrics('createApplication', true, Date.now() - startTime);

      // Send success response
      const response = {
        success: true,
        message: 'Application created successfully',
        data: {
          applicationId: applicationResult.data.applicationId,
          applicationNumber: applicationResult.data.applicationNumber,
          trackingCode: applicationResult.data.trackingCode,
          state: applicationResult.data.state,
          workflowStatus: applicationResult.data.workflowStatus,
          nextSteps: this._generateNextSteps(applicationResult.data),
          estimatedProcessingTime: applicationResult.data.workflowStatus.estimatedCompletion,
        },
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          operationId: applicationResult.operationId,
        },
      };

      this.logger.info(
        `[EnhancedApplicationController] Application created successfully - Request: ${requestId}`
      );

      res.status(201).json(response);
    } catch (error) {
      this.logger.error(
        `[EnhancedApplicationController] Application creation failed - Request: ${requestId}:`,
        error
      );

      // Update failure metrics
      this._updateControllerMetrics('createApplication', false, Date.now() - startTime);

      // Create error audit record
      await this._createControllerAuditRecord('APPLICATION_CREATION_FAILED', {
        requestId,
        userId: req.user?.userId,
        error: error.message,
        processingTime: Date.now() - startTime,
      });

      this._sendErrorResponse(res, error, requestId);
    }
  }

  /**
   * Process application state transition
   * PUT /api/dtam/applications/:applicationId/state
   *
   * Business Logic: FSM-based state management with comprehensive validation
   */
  async processStateTransition(req, res) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    try {
      this.logger.info(
        `[EnhancedApplicationController] Processing state transition - Request: ${requestId}`
      );

      const { applicationId } = req.params;
      const { targetState, notes, attachedDocuments, reasonCode } = req.body;

      // Validate state transition request
      const validationResult = await this.validationService.validateStateTransition({
        applicationId,
        targetState,
        notes,
        reasonCode,
      });

      if (!validationResult.valid) {
        return this._sendValidationError(res, validationResult.errors, requestId);
      }

      // Authorize state transition
      const authorizationResult = await this.authorizationService.authorizeStateTransition(
        req.user,
        applicationId,
        targetState
      );

      if (!authorizationResult.authorized) {
        return this._sendAuthorizationError(res, authorizationResult.reason, requestId);
      }

      // Prepare transition data
      const transitionData = {
        notes,
        reasonCode,
        attachedDocuments: attachedDocuments || [],
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          timestamp: new Date(),
        },
      };

      const actor = {
        userId: req.user.userId,
        role: req.user.role,
        name: req.user.fullName,
      };

      // Process state transition
      const transitionResult =
        await this.advancedApplicationProcessingService.processStateTransition(
          applicationId,
          targetState,
          transitionData,
          actor
        );

      // Create controller audit record
      await this._createControllerAuditRecord('STATE_TRANSITION_PROCESSED', {
        requestId,
        userId: req.user.userId,
        applicationId,
        fromState:
          transitionResult.data.stateHistory[transitionResult.data.stateHistory.length - 2]?.state,
        toState: targetState,
        processingTime: Date.now() - startTime,
      });

      // Update controller metrics
      this._updateControllerMetrics('processStateTransition', true, Date.now() - startTime);

      // Send success response
      const response = {
        success: true,
        message: `Application state updated to ${targetState}`,
        data: {
          applicationId,
          currentState: transitionResult.data.state,
          stateChangedAt: transitionResult.data.stateChangedAt,
          nextPossibleStates: this._getNextPossibleStates(targetState),
          workflowStatus: transitionResult.data.workflowStatus,
          nextSteps: this._generateNextSteps(transitionResult.data),
          notifications: transitionResult.data.postTransition.workflowProcessing.notifications,
        },
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          operationId: transitionResult.operationId,
        },
      };

      this.logger.info(
        `[EnhancedApplicationController] State transition processed successfully - Request: ${requestId}`
      );

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(
        `[EnhancedApplicationController] State transition failed - Request: ${requestId}:`,
        error
      );

      this._updateControllerMetrics('processStateTransition', false, Date.now() - startTime);

      await this._createControllerAuditRecord('STATE_TRANSITION_FAILED', {
        requestId,
        userId: req.user?.userId,
        applicationId: req.params.applicationId,
        targetState: req.body.targetState,
        error: error.message,
        processingTime: Date.now() - startTime,
      });

      this._sendErrorResponse(res, error, requestId);
    }
  }

  /**
   * Get comprehensive application dashboard
   * GET /api/farmer/applications/:applicationId/dashboard
   * GET /api/dtam/applications/:applicationId/dashboard
   *
   * Business Logic: Multi-dimensional application status with role-based views
   */
  async getApplicationDashboard(req, res) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    try {
      this.logger.info(
        `[EnhancedApplicationController] Getting application dashboard - Request: ${requestId}`
      );

      const { applicationId } = req.params;
      const viewerRole = req.user.role;

      // Authorize dashboard access
      const authorizationResult = await this.authorizationService.authorizeDashboardAccess(
        req.user,
        applicationId
      );

      if (!authorizationResult.authorized) {
        return this._sendAuthorizationError(res, authorizationResult.reason, requestId);
      }

      // Get comprehensive dashboard data
      const dashboardResult =
        await this.advancedApplicationProcessingService.getApplicationDashboard(
          applicationId,
          viewerRole
        );

      // Enhance dashboard with additional controller-level data
      const enhancedDashboard = {
        ...dashboardResult.data,
        userContext: {
          role: viewerRole,
          permissions: await this.authorizationService.getUserPermissions(req.user, applicationId),
          availableActions: await this._getAvailableUserActions(
            req.user,
            dashboardResult.data.application
          ),
        },
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          operationId: dashboardResult.operationId,
          lastRefreshed: new Date(),
        },
      };

      // Update controller metrics
      this._updateControllerMetrics('getApplicationDashboard', true, Date.now() - startTime);

      // Send success response
      const response = {
        success: true,
        message: 'Application dashboard retrieved successfully',
        data: enhancedDashboard,
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
        },
      };

      this.logger.info(
        `[EnhancedApplicationController] Dashboard retrieved successfully - Request: ${requestId}`
      );

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(
        `[EnhancedApplicationController] Dashboard retrieval failed - Request: ${requestId}:`,
        error
      );

      this._updateControllerMetrics('getApplicationDashboard', false, Date.now() - startTime);

      this._sendErrorResponse(res, error, requestId);
    }
  }

  /**
   * Upload application document
   * POST /api/farmer/applications/:applicationId/documents
   *
   * Business Logic: Comprehensive document processing with validation and workflow
   */
  async uploadDocument(req, res) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    try {
      this.logger.info(
        `[EnhancedApplicationController] Uploading document - Request: ${requestId}`
      );

      const { applicationId } = req.params;
      const { documentType } = req.body;

      // Validate file upload
      if (!req.file) {
        return this._sendValidationError(res, ['Document file is required'], requestId);
      }

      // Authorize document upload
      const authorizationResult = await this.authorizationService.authorizeDocumentUpload(
        req.user,
        applicationId,
        documentType
      );

      if (!authorizationResult.authorized) {
        return this._sendAuthorizationError(res, authorizationResult.reason, requestId);
      }

      // Prepare file data
      const fileData = {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        encoding: req.file.encoding,
      };

      const uploadedBy = {
        userId: req.user.userId,
        role: req.user.role,
        name: req.user.fullName,
      };

      // Process document upload
      const uploadResult = await this.documentManagementIntegrationSystem.processDocumentUpload(
        applicationId,
        documentType,
        fileData,
        uploadedBy
      );

      // Create controller audit record
      await this._createControllerAuditRecord('DOCUMENT_UPLOADED', {
        requestId,
        userId: req.user.userId,
        applicationId,
        documentId: uploadResult.data.documentId,
        documentType,
        fileName: fileData.originalName,
        processingTime: Date.now() - startTime,
      });

      // Update controller metrics
      this._updateControllerMetrics('uploadDocument', true, Date.now() - startTime);

      // Send success response
      const response = {
        success: true,
        message: 'Document uploaded successfully',
        data: {
          documentId: uploadResult.data.documentId,
          documentType,
          fileName: uploadResult.data.fileName,
          state: uploadResult.data.state,
          processingStatus: uploadResult.data.processingStatus,
          nextSteps: this._generateDocumentNextSteps(uploadResult.data),
        },
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          operationId: uploadResult.operationId,
        },
      };

      this.logger.info(
        `[EnhancedApplicationController] Document uploaded successfully - Request: ${requestId}`
      );

      res.status(201).json(response);
    } catch (error) {
      this.logger.error(
        `[EnhancedApplicationController] Document upload failed - Request: ${requestId}:`,
        error
      );

      this._updateControllerMetrics('uploadDocument', false, Date.now() - startTime);

      await this._createControllerAuditRecord('DOCUMENT_UPLOAD_FAILED', {
        requestId,
        userId: req.user?.userId,
        applicationId: req.params.applicationId,
        error: error.message,
        processingTime: Date.now() - startTime,
      });

      this._sendErrorResponse(res, error, requestId);
    }
  }

  /**
   * Verify farmer identity with government systems
   * POST /api/dtam/applications/:applicationId/verify-identity
   *
   * Business Logic: Government integration for identity verification
   */
  async verifyFarmerIdentity(req, res) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    try {
      this.logger.info(
        `[EnhancedApplicationController] Verifying farmer identity - Request: ${requestId}`
      );

      const { applicationId } = req.params;
      const identityData = req.body;

      // Validate identity data
      const validationResult = await this.validationService.validateIdentityData(identityData);
      if (!validationResult.valid) {
        return this._sendValidationError(res, validationResult.errors, requestId);
      }

      // Authorize identity verification
      const authorizationResult = await this.authorizationService.authorizeIdentityVerification(
        req.user,
        applicationId
      );

      if (!authorizationResult.authorized) {
        return this._sendAuthorizationError(res, authorizationResult.reason, requestId);
      }

      // Process identity verification
      const verificationResult = await this.governmentApiIntegrationService.verifyFarmerIdentity(
        identityData,
        {
          includePhoto: req.body.includePhoto || false,
          verificationLevel: req.body.verificationLevel || 'STANDARD',
        }
      );

      // Create controller audit record
      await this._createControllerAuditRecord('IDENTITY_VERIFIED', {
        requestId,
        userId: req.user.userId,
        applicationId,
        citizenId: identityData.citizenId,
        verificationStatus: verificationResult.data.verificationStatus,
        processingTime: Date.now() - startTime,
      });

      // Update controller metrics
      this._updateControllerMetrics('verifyFarmerIdentity', true, Date.now() - startTime);

      // Send success response
      const response = {
        success: true,
        message: 'Farmer identity verification completed',
        data: {
          verificationStatus: verificationResult.data.verificationStatus,
          verificationScore: verificationResult.data.verificationScore,
          verificationDetails: verificationResult.data.verificationDetails,
          recommendations: verificationResult.data.recommendations,
        },
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          operationId: verificationResult.operationId,
        },
      };

      this.logger.info(
        `[EnhancedApplicationController] Identity verification completed - Request: ${requestId}`
      );

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(
        `[EnhancedApplicationController] Identity verification failed - Request: ${requestId}:`,
        error
      );

      this._updateControllerMetrics('verifyFarmerIdentity', false, Date.now() - startTime);

      this._sendErrorResponse(res, error, requestId);
    }
  }

  /**
   * Verify land ownership with government systems
   * POST /api/dtam/applications/:applicationId/verify-land
   *
   * Business Logic: Government integration for land ownership verification
   */
  async verifyLandOwnership(req, res) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    try {
      this.logger.info(
        `[EnhancedApplicationController] Verifying land ownership - Request: ${requestId}`
      );

      const { applicationId } = req.params;
      const { landData, ownerData } = req.body;

      // Validate land data
      const validationResult = await this.validationService.validateLandData(landData);
      if (!validationResult.valid) {
        return this._sendValidationError(res, validationResult.errors, requestId);
      }

      // Authorize land verification
      const authorizationResult = await this.authorizationService.authorizeLandVerification(
        req.user,
        applicationId
      );

      if (!authorizationResult.authorized) {
        return this._sendAuthorizationError(res, authorizationResult.reason, requestId);
      }

      // Process land ownership verification
      const verificationResult = await this.governmentApiIntegrationService.verifyLandOwnership(
        landData,
        ownerData
      );

      // Create controller audit record
      await this._createControllerAuditRecord('LAND_OWNERSHIP_VERIFIED', {
        requestId,
        userId: req.user.userId,
        applicationId,
        titleDeedNumber: landData.titleDeedNumber,
        verificationStatus: verificationResult.data.verificationStatus,
        processingTime: Date.now() - startTime,
      });

      // Update controller metrics
      this._updateControllerMetrics('verifyLandOwnership', true, Date.now() - startTime);

      // Send success response
      const response = {
        success: true,
        message: 'Land ownership verification completed',
        data: {
          verificationStatus: verificationResult.data.verificationStatus,
          ownershipConfirmed: verificationResult.data.ownershipConfirmed,
          landDetails: verificationResult.data.landDetails,
          complianceStatus: verificationResult.data.complianceStatus,
        },
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          operationId: verificationResult.operationId,
        },
      };

      this.logger.info(
        `[EnhancedApplicationController] Land ownership verification completed - Request: ${requestId}`
      );

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(
        `[EnhancedApplicationController] Land ownership verification failed - Request: ${requestId}:`,
        error
      );

      this._updateControllerMetrics('verifyLandOwnership', false, Date.now() - startTime);

      this._sendErrorResponse(res, error, requestId);
    }
  }

  /**
   * Submit application to government systems
   * POST /api/dtam/applications/:applicationId/submit-government
   *
   * Business Logic: Multi-ministry application submission with tracking
   */
  async submitToGovernment(req, res) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    try {
      this.logger.info(
        `[EnhancedApplicationController] Submitting to government - Request: ${requestId}`
      );

      const { applicationId } = req.params;
      const submissionOptions = req.body;

      // Authorize government submission
      const authorizationResult = await this.authorizationService.authorizeGovernmentSubmission(
        req.user,
        applicationId
      );

      if (!authorizationResult.authorized) {
        return this._sendAuthorizationError(res, authorizationResult.reason, requestId);
      }

      // Get application and documents data
      const applicationData =
        await this.advancedApplicationProcessingService.getApplicationDashboard(applicationId);
      const documentsData =
        await this.documentManagementIntegrationSystem.getDocumentStatus(applicationId);

      // Submit to government systems
      const submissionResult = await this.governmentApiIntegrationService.submitGacpApplication(
        applicationData.data.application,
        documentsData.data
      );

      // Create controller audit record
      await this._createControllerAuditRecord('GOVERNMENT_SUBMISSION_COMPLETED', {
        requestId,
        userId: req.user.userId,
        applicationId,
        submissionStatus: submissionResult.data.overallStatus,
        governmentReferences: submissionResult.data.governmentReferences,
        processingTime: Date.now() - startTime,
      });

      // Update controller metrics
      this._updateControllerMetrics('submitToGovernment', true, Date.now() - startTime);

      // Send success response
      const response = {
        success: true,
        message: 'Application submitted to government systems',
        data: {
          submissionStatus: submissionResult.data.overallStatus,
          governmentReferences: submissionResult.data.governmentReferences,
          trackingInformation: submissionResult.data.trackingInformation,
          estimatedProcessingTime: submissionResult.data.estimatedProcessingTime,
        },
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          operationId: submissionResult.operationId,
        },
      };

      this.logger.info(
        `[EnhancedApplicationController] Government submission completed - Request: ${requestId}`
      );

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(
        `[EnhancedApplicationController] Government submission failed - Request: ${requestId}:`,
        error
      );

      this._updateControllerMetrics('submitToGovernment', false, Date.now() - startTime);

      this._sendErrorResponse(res, error, requestId);
    }
  }

  /**
   * Get comprehensive system health and analytics dashboard
   * GET /api/admin/applications/analytics/dashboard
   *
   * Business Logic: System-wide analytics and performance monitoring
   */
  async getAnalyticsDashboard(req, res) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    try {
      this.logger.info(
        `[EnhancedApplicationController] Getting analytics dashboard - Request: ${requestId}`
      );

      // Authorize analytics access
      const authorizationResult = await this.authorizationService.authorizeAnalyticsDashboard(
        req.user
      );
      if (!authorizationResult.authorized) {
        return this._sendAuthorizationError(res, authorizationResult.reason, requestId);
      }

      // Gather analytics from all services
      const analyticsPromises = [
        this.advancedApplicationProcessingService.getSystemHealth(),
        this.documentManagementIntegrationSystem.getSystemHealth(),
        this.governmentApiIntegrationService.getSystemHealth(),
      ];

      const analyticsResults = await Promise.allSettled(analyticsPromises);

      // Build comprehensive analytics dashboard
      const analyticsDashboard = {
        overview: {
          totalApplications: this.controllerMetrics.totalRequests,
          successRate: this._calculateSuccessRate(),
          averageProcessingTime: this._calculateAverageProcessingTime(),
          systemHealth: this._calculateOverallSystemHealth(analyticsResults),
        },
        services: {
          applicationProcessing: this._extractSettledResult(analyticsResults[0]),
          documentManagement: this._extractSettledResult(analyticsResults[1]),
          governmentIntegration: this._extractSettledResult(analyticsResults[2]),
        },
        performance: {
          controllerMetrics: this.controllerMetrics,
          endpointPerformance: this._getEndpointPerformance(),
          errorAnalysis: this._getErrorAnalysis(),
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      };

      // Update controller metrics
      this._updateControllerMetrics('getAnalyticsDashboard', true, Date.now() - startTime);

      // Send success response
      const response = {
        success: true,
        message: 'Analytics dashboard retrieved successfully',
        data: analyticsDashboard,
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
        },
      };

      this.logger.info(
        `[EnhancedApplicationController] Analytics dashboard retrieved - Request: ${requestId}`
      );

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(
        `[EnhancedApplicationController] Analytics dashboard failed - Request: ${requestId}:`,
        error
      );

      this._updateControllerMetrics('getAnalyticsDashboard', false, Date.now() - startTime);

      this._sendErrorResponse(res, error, requestId);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  _generateRequestId() {
    return `ctrl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _updateControllerMetrics(endpoint, success, processingTime) {
    this.controllerMetrics.totalRequests++;

    if (success) {
      this.controllerMetrics.successfulRequests++;
    } else {
      this.controllerMetrics.failedRequests++;
    }

    // Update endpoint usage
    if (!this.controllerMetrics.endpointUsage[endpoint]) {
      this.controllerMetrics.endpointUsage[endpoint] = 0;
    }
    this.controllerMetrics.endpointUsage[endpoint]++;

    // Update average response times
    if (!this.controllerMetrics.averageResponseTimes[endpoint]) {
      this.controllerMetrics.averageResponseTimes[endpoint] = processingTime;
    } else {
      const current = this.controllerMetrics.averageResponseTimes[endpoint];
      this.controllerMetrics.averageResponseTimes[endpoint] = (current + processingTime) / 2;
    }
  }

  async _createControllerAuditRecord(action, data) {
    try {
      if (this.auditService) {
        await this.auditService.createRecord({
          module: 'ENHANCED_APPLICATION_CONTROLLER',
          action,
          data,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error('[EnhancedApplicationController] Audit record creation failed:', error);
    }
  }

  _sendValidationError(res, errors, requestId) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: errors,
      metadata: {
        requestId,
        timestamp: new Date(),
      },
    });
  }

  _sendAuthorizationError(res, reason, requestId) {
    return res.status(403).json({
      success: false,
      error: 'AUTHORIZATION_ERROR',
      message: 'Access denied',
      details: reason,
      metadata: {
        requestId,
        timestamp: new Date(),
      },
    });
  }

  _sendErrorResponse(res, error, requestId) {
    const statusCode = error.statusCode || 500;
    const errorType = error.type || 'INTERNAL_SERVER_ERROR';

    // Update error distribution metrics
    if (!this.controllerMetrics.errorDistribution[errorType]) {
      this.controllerMetrics.errorDistribution[errorType] = 0;
    }
    this.controllerMetrics.errorDistribution[errorType]++;

    return res.status(statusCode).json({
      success: false,
      error: errorType,
      message: error.message || 'An unexpected error occurred',
      metadata: {
        requestId,
        timestamp: new Date(),
      },
    });
  }

  _generateNextSteps(applicationData) {
    const nextSteps = [];

    switch (applicationData.state) {
      case 'DRAFT':
        nextSteps.push('Complete application information');
        nextSteps.push('Upload required documents');
        nextSteps.push('Submit application for review');
        break;
      case 'SUBMITTED':
        nextSteps.push('Wait for initial review');
        nextSteps.push('Prepare for potential document requests');
        break;
      case 'UNDER_REVIEW':
        nextSteps.push('Wait for DTAM review completion');
        break;
      case 'DOCUMENT_REQUEST':
        nextSteps.push('Upload requested documents');
        nextSteps.push('Respond within specified deadline');
        break;
      case 'INSPECTION_SCHEDULED':
        nextSteps.push('Prepare farm for inspection');
        nextSteps.push('Ensure all facilities are accessible');
        break;
      // Additional states...
    }

    return nextSteps;
  }

  _generateDocumentNextSteps(documentData) {
    const nextSteps = [];

    switch (documentData.state) {
      case 'UPLOADED':
        nextSteps.push('Document is being processed');
        nextSteps.push('OCR and validation in progress');
        break;
      case 'VALIDATED':
        nextSteps.push('Document is under review');
        nextSteps.push('Quality assurance in progress');
        break;
      case 'APPROVED':
        nextSteps.push('Document approved and ready');
        break;
      // Additional states...
    }

    return nextSteps;
  }

  _getNextPossibleStates(currentState) {
    const stateTransitions = {
      DRAFT: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
      UNDER_REVIEW: ['DOCUMENT_REQUEST', 'INSPECTION_SCHEDULED', 'REJECTED'],
      // Additional state transitions...
    };

    return stateTransitions[currentState] || [];
  }

  async _getAvailableUserActions(user, application) {
    // Determine available actions based on user role and application state
    const actions = [];

    if (user.role === 'FARMER' && application.state === 'DRAFT') {
      actions.push('EDIT_APPLICATION', 'UPLOAD_DOCUMENT', 'SUBMIT_APPLICATION');
    } else if (user.role === 'DTAM_STAFF' && application.state === 'UNDER_REVIEW') {
      actions.push('APPROVE', 'REJECT', 'REQUEST_DOCUMENTS', 'SCHEDULE_INSPECTION');
    }
    // Additional role-based actions...

    return actions;
  }

  _calculateSuccessRate() {
    const total = this.controllerMetrics.totalRequests;
    const successful = this.controllerMetrics.successfulRequests;
    return total > 0 ? (successful / total) * 100 : 0;
  }

  _calculateAverageProcessingTime() {
    const times = Object.values(this.controllerMetrics.averageResponseTimes);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  _calculateOverallSystemHealth(analyticsResults) {
    const healthyServices = analyticsResults.filter(
      r => r.status === 'fulfilled' && r.value?.data?.overallStatus === 'HEALTHY'
    ).length;

    const totalServices = analyticsResults.length;
    const healthScore = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;

    return healthScore >= 80 ? 'HEALTHY' : healthScore >= 60 ? 'DEGRADED' : 'CRITICAL';
  }

  _extractSettledResult(settledPromise) {
    if (settledPromise?.status === 'fulfilled') {
      return settledPromise.value;
    } else if (settledPromise?.status === 'rejected') {
      return {
        error: settledPromise.reason.message,
        status: 'failed',
      };
    }
    return null;
  }

  _getEndpointPerformance() {
    return Object.entries(this.controllerMetrics.averageResponseTimes).map(
      ([endpoint, avgTime]) => ({
        endpoint,
        averageResponseTime: avgTime,
        usage: this.controllerMetrics.endpointUsage[endpoint] || 0,
      })
    );
  }

  _getErrorAnalysis() {
    return Object.entries(this.controllerMetrics.errorDistribution).map(([errorType, count]) => ({
      errorType,
      count,
      percentage: (count / this.controllerMetrics.totalRequests) * 100,
    }));
  }
}

module.exports = EnhancedApplicationProcessingController;
