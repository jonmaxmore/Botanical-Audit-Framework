/**
 * Government API Integration Service
 *
 * Enterprise-grade government integration service for GACP application processing
 * that provides seamless integration with government systems and APIs:
 *
 * Business Logic & Architecture:
 * 1. Multi-Ministry Integration - Connect with multiple government agencies
 * 2. Real-time Verification - Live document and identity verification
 * 3. Compliance Monitoring - Continuous regulatory compliance tracking
 * 4. Automated Reporting - Scheduled and event-driven government reporting
 * 5. Security & Authentication - Government-grade security protocols
 *
 * Government Systems Integration:
 * - Ministry of Agriculture (MOAC) - Farm registration and certification
 * - Department of Agriculture (DOA) - Technical standards and compliance
 * - Food and Drug Administration (FDA) - Product safety and quality
 * - Digital Government Development Agency (DGA) - Digital identity verification
 * - National ID System - Citizen identity verification
 * - Land Department - Land ownership verification
 *
 * Workflow Process:
 * Request → Authentication → API Call → Response Processing → Compliance Check → Audit Trail
 *    ↓           ↓            ↓           ↓                   ↓                  ↓
 * Validation → Token Mgmt → Rate Limit → Data Transform → Status Update → Report Generation
 *
 * Process Integration:
 * - All government interactions are logged and audited for compliance
 * - Real-time status updates are provided to applications and users
 * - Automated retry mechanisms handle temporary service failures
 * - Data transformation ensures compatibility between systems
 */

const EventEmitter = require('events');
const axios = require('axios');
const crypto = require('crypto');

class GovernmentApiIntegrationService extends EventEmitter {
  constructor({
    governmentApiConfig,
    authenticationService,
    rateLimitService,
    dataTransformService,
    complianceService,
    auditService,
    cacheService,
    notificationService,
    logger
  }) {
    super();

    // Core service dependencies
    this.governmentApiConfig = governmentApiConfig;
    this.authenticationService = authenticationService;
    this.rateLimitService = rateLimitService;
    this.dataTransformService = dataTransformService;
    this.complianceService = complianceService;
    this.auditService = auditService;
    this.cacheService = cacheService;
    this.notificationService = notificationService;
    this.logger = logger;

    // Government API endpoints configuration
    this.governmentEndpoints = {
      MOAC: {
        name: 'Ministry of Agriculture and Cooperatives',
        baseUrl: process.env.MOAC_API_BASE_URL || 'https://api.moac.go.th/v1',
        endpoints: {
          farmRegistration: '/farm/register',
          farmVerification: '/farm/verify',
          certificationSubmit: '/certification/submit',
          certificationStatus: '/certification/status',
          complianceReport: '/compliance/report'
        },
        authentication: {
          type: 'API_KEY_AND_OAUTH2',
          apiKeyHeader: 'X-MOAC-API-Key',
          oauthEndpoint: '/oauth/token',
          scope: 'farm_management certification_authority'
        },
        rateLimit: {
          requestsPerMinute: 60,
          burstLimit: 10,
          backoffStrategy: 'exponential'
        },
        timeout: 30000,
        retryConfig: {
          maxRetries: 3,
          retryDelay: 2000,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT', '503', '502']
        }
      },

      DOA: {
        name: 'Department of Agriculture',
        baseUrl: process.env.DOA_API_BASE_URL || 'https://api.doa.go.th/v1',
        endpoints: {
          technicalStandards: '/standards/gacp',
          qualityAssessment: '/quality/assess',
          inspectionSchedule: '/inspection/schedule',
          inspectionReport: '/inspection/report',
          complianceCheck: '/compliance/check'
        },
        authentication: {
          type: 'MUTUAL_TLS',
          clientCertPath: process.env.DOA_CLIENT_CERT_PATH,
          clientKeyPath: process.env.DOA_CLIENT_KEY_PATH,
          caCertPath: process.env.DOA_CA_CERT_PATH
        },
        rateLimit: {
          requestsPerMinute: 30,
          burstLimit: 5,
          backoffStrategy: 'linear'
        },
        timeout: 45000,
        retryConfig: {
          maxRetries: 2,
          retryDelay: 5000,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
        }
      },

      FDA: {
        name: 'Food and Drug Administration',
        baseUrl: process.env.FDA_API_BASE_URL || 'https://api.fda.moph.go.th/v1',
        endpoints: {
          productRegistration: '/product/register',
          safetyCompliance: '/safety/compliance',
          qualityControl: '/quality/control',
          marketAuthorization: '/market/authorization'
        },
        authentication: {
          type: 'JWT_TOKEN',
          tokenEndpoint: '/auth/token',
          credentials: {
            clientId: process.env.FDA_CLIENT_ID,
            clientSecret: process.env.FDA_CLIENT_SECRET
          }
        },
        rateLimit: {
          requestsPerMinute: 45,
          burstLimit: 8,
          backoffStrategy: 'exponential'
        },
        timeout: 25000,
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1500,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT', '503']
        }
      },

      DGA: {
        name: 'Digital Government Development Agency',
        baseUrl: process.env.DGA_API_BASE_URL || 'https://api.dga.or.th/v1',
        endpoints: {
          citizenVerification: '/citizen/verify',
          digitalIdentity: '/identity/validate',
          eKYC: '/ekyc/process',
          businessRegistration: '/business/verify'
        },
        authentication: {
          type: 'OAUTH2_CLIENT_CREDENTIALS',
          tokenEndpoint: '/oauth2/token',
          credentials: {
            clientId: process.env.DGA_CLIENT_ID,
            clientSecret: process.env.DGA_CLIENT_SECRET,
            scope: 'citizen_verification digital_identity'
          }
        },
        rateLimit: {
          requestsPerMinute: 100,
          burstLimit: 20,
          backoffStrategy: 'exponential'
        },
        timeout: 15000,
        retryConfig: {
          maxRetries: 2,
          retryDelay: 1000,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT', '429']
        }
      },

      NATIONAL_ID: {
        name: 'National ID Verification System',
        baseUrl: process.env.NATIONAL_ID_API_BASE_URL || 'https://api.nid.go.th/v1',
        endpoints: {
          citizenLookup: '/citizen/lookup',
          identityVerification: '/identity/verify',
          addressVerification: '/address/verify'
        },
        authentication: {
          type: 'HMAC_SIGNATURE',
          secretKey: process.env.NATIONAL_ID_SECRET_KEY,
          algorithm: 'sha256'
        },
        rateLimit: {
          requestsPerMinute: 120,
          burstLimit: 15,
          backoffStrategy: 'linear'
        },
        timeout: 10000,
        retryConfig: {
          maxRetries: 1,
          retryDelay: 500,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
        }
      },

      LAND_DEPT: {
        name: 'Department of Lands',
        baseUrl: process.env.LAND_DEPT_API_BASE_URL || 'https://api.dol.go.th/v1',
        endpoints: {
          landVerification: '/land/verify',
          ownershipCheck: '/ownership/check',
          titleDeedValidation: '/deed/validate',
          landUsePermit: '/permit/landuse'
        },
        authentication: {
          type: 'API_KEY',
          apiKeyHeader: 'X-DOL-API-Key',
          apiKey: process.env.LAND_DEPT_API_KEY
        },
        rateLimit: {
          requestsPerMinute: 40,
          burstLimit: 6,
          backoffStrategy: 'exponential'
        },
        timeout: 35000,
        retryConfig: {
          maxRetries: 2,
          retryDelay: 3000,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT', '503']
        }
      }
    };

    // Authentication tokens cache
    this.authTokens = new Map();

    // Performance and monitoring metrics
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTimes: {},
      rateLimitHits: 0,
      authenticationFailures: 0,
      governmentSystemStatus: {}
    };

    // Circuit breaker configurations
    this.circuitBreakers = new Map();

    // Initialize service
    this._initializeService();
  }

  /**
   * Verify farmer identity with government systems
   * Business Logic: Multi-system identity verification with cross-validation
   *
   * Workflow:
   * 1. Validate input data format and completeness
   * 2. Perform National ID verification
   * 3. Cross-validate with DGA digital identity system
   * 4. Check business registration if applicable
   * 5. Generate comprehensive verification report
   */
  async verifyFarmerIdentity(identityData, options = {}) {
    const operationId = this._generateOperationId();
    const startTime = Date.now();

    try {
      this.logger.info(
        `[GovernmentApiIntegration] Starting farmer identity verification - Operation: ${operationId}`
      );

      // Validate input data
      await this._validateIdentityData(identityData);

      // Parallel verification from multiple systems
      const verificationPromises = [
        // National ID verification
        this._callGovernmentApi('NATIONAL_ID', 'citizenLookup', {
          citizenId: identityData.citizenId,
          firstName: identityData.firstName,
          lastName: identityData.lastName,
          dateOfBirth: identityData.dateOfBirth
        }),

        // DGA digital identity verification
        this._callGovernmentApi('DGA', 'citizenVerification', {
          citizenId: identityData.citizenId,
          verificationType: 'ENHANCED',
          includePhoto: options.includePhoto || false
        }),

        // Address verification if provided
        identityData.address
          ? this._callGovernmentApi('NATIONAL_ID', 'addressVerification', {
            citizenId: identityData.citizenId,
            address: identityData.address
          })
          : Promise.resolve(null)
      ];

      // Execute verifications
      const verificationResults = await Promise.allSettled(verificationPromises);

      // Process and cross-validate results
      const verificationReport = await this._processIdentityVerificationResults(
        verificationResults,
        identityData,
        operationId
      );

      // Create audit record
      await this._createAuditRecord('IDENTITY_VERIFICATION', {
        operationId,
        citizenId: identityData.citizenId,
        verificationResults: verificationResults.map(r => ({
          status: r.status,
          success: r.status === 'fulfilled'
        })),
        verificationReport,
        processingTime: Date.now() - startTime
      });

      // Update performance metrics
      this._updatePerformanceMetrics('IDENTITY_VERIFICATION', true, Date.now() - startTime);

      this.logger.info(
        `[GovernmentApiIntegration] Identity verification completed - Operation: ${operationId}`
      );

      return {
        success: true,
        data: verificationReport,
        operationId
      };
    } catch (error) {
      this.logger.error(
        `[GovernmentApiIntegration] Identity verification failed - Operation: ${operationId}:`,
        error
      );

      this._updatePerformanceMetrics('IDENTITY_VERIFICATION', false, Date.now() - startTime);

      await this._createAuditRecord('IDENTITY_VERIFICATION_FAILED', {
        operationId,
        citizenId: identityData?.citizenId,
        error: error.message,
        processingTime: Date.now() - startTime
      });

      throw error;
    }
  }

  /**
   * Verify land ownership with Department of Lands
   * Business Logic: Comprehensive land ownership verification with legal validation
   */
  async verifyLandOwnership(landData, ownerData) {
    const operationId = this._generateOperationId();
    const startTime = Date.now();

    try {
      this.logger.info(
        `[GovernmentApiIntegration] Starting land ownership verification - Operation: ${operationId}`
      );

      // Validate land data
      await this._validateLandData(landData);

      // Land ownership verification
      const ownershipVerification = await this._callGovernmentApi('LAND_DEPT', 'ownershipCheck', {
        titleDeedNumber: landData.titleDeedNumber,
        landParcelId: landData.landParcelId,
        ownerCitizenId: ownerData.citizenId,
        ownerName: `${ownerData.firstName} ${ownerData.lastName}`
      });

      // Title deed validation
      const titleDeedValidation = await this._callGovernmentApi(
        'LAND_DEPT',
        'titleDeedValidation',
        {
          titleDeedNumber: landData.titleDeedNumber,
          issueDate: landData.issueDate,
          validateChain: true
        }
      );

      // Land use permit check if applicable
      let landUsePermit = null;
      if (landData.landUseType && landData.landUseType !== 'AGRICULTURE') {
        landUsePermit = await this._callGovernmentApi('LAND_DEPT', 'landUsePermit', {
          titleDeedNumber: landData.titleDeedNumber,
          requestedUse: landData.landUseType
        });
      }

      // Process verification results
      const verificationReport = await this._processLandVerificationResults({
        ownershipVerification,
        titleDeedValidation,
        landUsePermit,
        landData,
        ownerData,
        operationId
      });

      // Create audit record
      await this._createAuditRecord('LAND_OWNERSHIP_VERIFICATION', {
        operationId,
        titleDeedNumber: landData.titleDeedNumber,
        ownerCitizenId: ownerData.citizenId,
        verificationReport,
        processingTime: Date.now() - startTime
      });

      this.logger.info(
        `[GovernmentApiIntegration] Land ownership verification completed - Operation: ${operationId}`
      );

      return {
        success: true,
        data: verificationReport,
        operationId
      };
    } catch (error) {
      this.logger.error(
        `[GovernmentApiIntegration] Land ownership verification failed - Operation: ${operationId}:`,
        error
      );

      await this._createAuditRecord('LAND_OWNERSHIP_VERIFICATION_FAILED', {
        operationId,
        titleDeedNumber: landData?.titleDeedNumber,
        error: error.message,
        processingTime: Date.now() - startTime
      });

      throw error;
    }
  }

  /**
   * Submit GACP application to government systems
   * Business Logic: Multi-ministry application submission with workflow coordination
   */
  async submitGacpApplication(applicationData, documentsData) {
    const operationId = this._generateOperationId();
    const startTime = Date.now();

    try {
      this.logger.info(
        `[GovernmentApiIntegration] Submitting GACP application - Operation: ${operationId}`
      );

      // Validate application completeness
      await this._validateApplicationCompleteness(applicationData, documentsData);

      // Transform data for government systems
      const transformedData = await this.dataTransformService.transformForGovernmentSubmission({
        applicationData,
        documentsData,
        targetSystems: ['MOAC', 'DOA', 'FDA']
      });

      // Parallel submission to multiple government systems
      const submissionPromises = [
        // MOAC - Farm registration and primary application
        this._callGovernmentApi('MOAC', 'farmRegistration', transformedData.moac),

        // DOA - Technical standards compliance
        this._callGovernmentApi('DOA', 'technicalStandards', transformedData.doa),

        // FDA - Product safety and quality (if applicable)
        applicationData.productType !== 'CULTIVATION_ONLY'
          ? this._callGovernmentApi('FDA', 'safetyCompliance', transformedData.fda)
          : Promise.resolve(null)
      ];

      // Execute submissions
      const submissionResults = await Promise.allSettled(submissionPromises);

      // Process submission results
      const submissionReport = await this._processApplicationSubmissionResults({
        submissionResults,
        applicationData,
        transformedData,
        operationId
      });

      // Schedule follow-up tracking
      if (submissionReport.overallStatus === 'SUBMITTED') {
        await this._scheduleApplicationTracking(submissionReport, applicationData);
      }

      // Create comprehensive audit record
      await this._createAuditRecord('GACP_APPLICATION_SUBMISSION', {
        operationId,
        applicationId: applicationData.applicationId,
        submissionResults: submissionResults.map(r => ({
          status: r.status,
          success: r.status === 'fulfilled'
        })),
        submissionReport,
        processingTime: Date.now() - startTime
      });

      // Send submission notifications
      await this._sendSubmissionNotifications(submissionReport, applicationData);

      this.logger.info(
        `[GovernmentApiIntegration] GACP application submission completed - Operation: ${operationId}`
      );

      return {
        success: true,
        data: submissionReport,
        operationId
      };
    } catch (error) {
      this.logger.error(
        `[GovernmentApiIntegration] GACP application submission failed - Operation: ${operationId}:`,
        error
      );

      await this._createAuditRecord('GACP_APPLICATION_SUBMISSION_FAILED', {
        operationId,
        applicationId: applicationData?.applicationId,
        error: error.message,
        processingTime: Date.now() - startTime
      });

      throw error;
    }
  }

  /**
   * Check application status across government systems
   * Business Logic: Multi-system status aggregation with intelligent polling
   */
  async checkApplicationStatus(applicationTrackingData) {
    const operationId = this._generateOperationId();
    const startTime = Date.now();

    try {
      this.logger.info(
        `[GovernmentApiIntegration] Checking application status - Operation: ${operationId}`
      );

      // Parallel status checks across systems
      const statusPromises = [];

      if (applicationTrackingData.moacReferenceId) {
        statusPromises.push(
          this._callGovernmentApi('MOAC', 'certificationStatus', {
            referenceId: applicationTrackingData.moacReferenceId
          })
        );
      }

      if (applicationTrackingData.doaReferenceId) {
        statusPromises.push(
          this._callGovernmentApi('DOA', 'complianceCheck', {
            referenceId: applicationTrackingData.doaReferenceId
          })
        );
      }

      if (applicationTrackingData.fdaReferenceId) {
        statusPromises.push(
          this._callGovernmentApi('FDA', 'marketAuthorization', {
            referenceId: applicationTrackingData.fdaReferenceId
          })
        );
      }

      // Execute status checks
      const statusResults = await Promise.allSettled(statusPromises);

      // Process and aggregate status information
      const statusReport = await this._processStatusResults({
        statusResults,
        applicationTrackingData,
        operationId
      });

      // Update application tracking data if needed
      if (statusReport.hasUpdates) {
        await this._updateApplicationTracking(statusReport, applicationTrackingData);
      }

      // Create audit record
      await this._createAuditRecord('APPLICATION_STATUS_CHECK', {
        operationId,
        applicationId: applicationTrackingData.applicationId,
        statusReport,
        processingTime: Date.now() - startTime
      });

      this.logger.info(
        `[GovernmentApiIntegration] Application status check completed - Operation: ${operationId}`
      );

      return {
        success: true,
        data: statusReport,
        operationId
      };
    } catch (error) {
      this.logger.error(
        `[GovernmentApiIntegration] Application status check failed - Operation: ${operationId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Generate compliance report for government submission
   * Business Logic: Automated compliance report generation with multi-system data
   */
  async generateComplianceReport(applicationId, reportType = 'STANDARD') {
    const operationId = this._generateOperationId();
    const startTime = Date.now();

    try {
      this.logger.info(
        `[GovernmentApiIntegration] Generating compliance report - Operation: ${operationId}`
      );

      // Gather compliance data from multiple sources
      const complianceData =
        await this.complianceService.getApplicationComplianceData(applicationId);

      // Transform data for government reporting format
      const reportData = await this.dataTransformService.transformForComplianceReport({
        complianceData,
        reportType,
        targetAuthority: 'MOAC'
      });

      // Submit report to government system
      const reportSubmission = await this._callGovernmentApi('MOAC', 'complianceReport', {
        applicationId,
        reportType,
        reportData,
        submissionTimestamp: new Date().toISOString()
      });

      // Process submission response
      const reportResult = {
        reportId: reportSubmission.reportId,
        submissionStatus: reportSubmission.status,
        governmentReferenceId: reportSubmission.referenceId,
        submittedAt: new Date(),
        reportType,
        applicationId,
        operationId,
        processingTime: Date.now() - startTime
      };

      // Create audit record
      await this._createAuditRecord('COMPLIANCE_REPORT_SUBMITTED', {
        operationId,
        applicationId,
        reportResult,
        processingTime: Date.now() - startTime
      });

      this.logger.info(
        `[GovernmentApiIntegration] Compliance report generated - Operation: ${operationId}`
      );

      return {
        success: true,
        data: reportResult,
        operationId
      };
    } catch (error) {
      this.logger.error(
        `[GovernmentApiIntegration] Compliance report generation failed - Operation: ${operationId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get comprehensive system health and performance metrics
   */
  async getSystemHealth() {
    try {
      const systemHealth = {
        governmentEndpoints: {},
        authenticationStatus: {},
        rateLimitStatus: {},
        performanceMetrics: { ...this.performanceMetrics },
        circuitBreakerStatus: {},
        timestamp: new Date()
      };

      // Check each government endpoint
      for (const [systemName, config] of Object.entries(this.governmentEndpoints)) {
        try {
          const healthCheck = await this._performHealthCheck(systemName);
          systemHealth.governmentEndpoints[systemName] = {
            status: healthCheck.status,
            responseTime: healthCheck.responseTime,
            lastChecked: new Date()
          };
        } catch (error) {
          systemHealth.governmentEndpoints[systemName] = {
            status: 'ERROR',
            error: error.message,
            lastChecked: new Date()
          };
        }
      }

      // Check authentication status
      for (const systemName of Object.keys(this.governmentEndpoints)) {
        systemHealth.authenticationStatus[systemName] = {
          hasValidToken: this.authTokens.has(systemName),
          tokenExpiry: this.authTokens.get(systemName)?.expiry || null
        };
      }

      // Calculate overall health score
      const healthyEndpoints = Object.values(systemHealth.governmentEndpoints).filter(
        endpoint => endpoint.status === 'HEALTHY'
      ).length;
      const totalEndpoints = Object.keys(systemHealth.governmentEndpoints).length;

      systemHealth.healthScore = totalEndpoints > 0 ? (healthyEndpoints / totalEndpoints) * 100 : 0;
      systemHealth.overallStatus =
        systemHealth.healthScore >= 80
          ? 'HEALTHY'
          : systemHealth.healthScore >= 60
            ? 'DEGRADED'
            : 'CRITICAL';

      return {
        success: true,
        data: systemHealth
      };
    } catch (error) {
      this.logger.error('[GovernmentApiIntegration] Health check failed:', error);

      return {
        success: false,
        error: error.message,
        data: {
          overallStatus: 'ERROR',
          timestamp: new Date()
        }
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  _initializeService() {
    this.logger.info('[GovernmentApiIntegration] Initializing service components');

    // Initialize circuit breakers
    for (const systemName of Object.keys(this.governmentEndpoints)) {
      this.circuitBreakers.set(systemName, {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: null,
        timeout: 60000 // 1 minute
      });
    }

    // Initialize performance metrics
    this._resetPerformanceMetrics();

    // Setup periodic token refresh
    this._setupTokenRefresh();
  }

  _resetPerformanceMetrics() {
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTimes: {},
      rateLimitHits: 0,
      authenticationFailures: 0,
      governmentSystemStatus: {}
    };

    // Initialize response times for each system
    for (const systemName of Object.keys(this.governmentEndpoints)) {
      this.performanceMetrics.averageResponseTimes[systemName] = 0;
      this.performanceMetrics.governmentSystemStatus[systemName] = 'UNKNOWN';
    }
  }

  _setupTokenRefresh() {
    // Setup periodic token refresh for OAuth2 systems
    setInterval(async() => {
      for (const [systemName, config] of Object.entries(this.governmentEndpoints)) {
        if (config.authentication.type.includes('OAUTH')) {
          await this._refreshAuthToken(systemName);
        }
      }
    }, 300000); // Refresh every 5 minutes
  }

  async _callGovernmentApi(systemName, endpoint, data, options = {}) {
    const config = this.governmentEndpoints[systemName];
    if (!config) {
      throw new Error(`Unknown government system: ${systemName}`);
    }

    // Check circuit breaker
    const circuitBreaker = this.circuitBreakers.get(systemName);
    if (circuitBreaker.isOpen) {
      const timeSinceFailure = Date.now() - circuitBreaker.lastFailureTime;
      if (timeSinceFailure < circuitBreaker.timeout) {
        throw new Error(`Circuit breaker open for ${systemName}`);
      } else {
        circuitBreaker.isOpen = false;
        circuitBreaker.failureCount = 0;
      }
    }

    // Check rate limits
    await this._checkRateLimit(systemName);

    // Prepare authentication
    const authHeaders = await this._prepareAuthentication(systemName);

    // Prepare request
    const requestConfig = {
      method: 'POST',
      url: `${config.baseUrl}${config.endpoints[endpoint]}`,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GACP-Platform/1.0',
        ...authHeaders
      },
      data,
      timeout: config.timeout,
      validateStatus: status => status < 500
    };

    const startTime = Date.now();

    try {
      // Execute request with retries
      const response = await this._executeWithRetry(requestConfig, config.retryConfig);

      // Update performance metrics
      this._updatePerformanceMetrics(systemName, true, Date.now() - startTime);

      // Process response
      return await this._processApiResponse(response, systemName, endpoint);
    } catch (error) {
      // Update circuit breaker on failure
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailureTime = Date.now();

      if (circuitBreaker.failureCount >= 3) {
        circuitBreaker.isOpen = true;
        this.logger.warn(`[GovernmentApiIntegration] Circuit breaker opened for ${systemName}`);
      }

      // Update performance metrics
      this._updatePerformanceMetrics(systemName, false, Date.now() - startTime);

      throw error;
    }
  }

  async _prepareAuthentication(systemName) {
    const config = this.governmentEndpoints[systemName];
    const authType = config.authentication.type;

    switch (authType) {
    case 'API_KEY':
      return {
        [config.authentication.apiKeyHeader]: config.authentication.apiKey
      };

    case 'API_KEY_AND_OAUTH2':
      const oauthToken = await this._getOAuthToken(systemName);
      return {
        [config.authentication.apiKeyHeader]: process.env[`${systemName}_API_KEY`],
        Authorization: `Bearer ${oauthToken}`
      };

    case 'JWT_TOKEN':
      const jwtToken = await this._getJwtToken(systemName);
      return {
        Authorization: `Bearer ${jwtToken}`
      };

    case 'OAUTH2_CLIENT_CREDENTIALS':
      const clientToken = await this._getClientCredentialsToken(systemName);
      return {
        Authorization: `Bearer ${clientToken}`
      };

    case 'HMAC_SIGNATURE':
      return this._generateHmacSignature(systemName, data);

    case 'MUTUAL_TLS':
      // Mutual TLS is handled at the HTTP client level
      return {};

    default:
      throw new Error(`Unsupported authentication type: ${authType}`);
    }
  }

  async _checkRateLimit(systemName) {
    if (this.rateLimitService) {
      const rateLimitResult = await this.rateLimitService.checkLimit(systemName);
      if (!rateLimitResult.allowed) {
        this.performanceMetrics.rateLimitHits++;
        throw new Error(
          `Rate limit exceeded for ${systemName}. Retry after: ${rateLimitResult.retryAfter}ms`
        );
      }
    }
  }

  async _executeWithRetry(requestConfig, retryConfig) {
    let lastError;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await axios(requestConfig);
        return response;
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = retryConfig.retryableErrors.some(
          retryableError =>
            error.code === retryableError || error.response?.status?.toString() === retryableError
        );

        if (!isRetryable || attempt === retryConfig.maxRetries) {
          break;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay * (attempt + 1)));
      }
    }

    throw lastError;
  }

  async _processApiResponse(response, systemName, endpoint) {
    if (response.status >= 400) {
      throw new Error(`Government API error: ${response.status} - ${response.statusText}`);
    }

    // Transform response data if needed
    const transformedData = await this.dataTransformService.transformFromGovernmentResponse({
      data: response.data,
      systemName,
      endpoint
    });

    return {
      success: true,
      data: transformedData,
      metadata: {
        systemName,
        endpoint,
        responseTime: response.headers['x-response-time'],
        requestId: response.headers['x-request-id']
      }
    };
  }

  _generateOperationId() {
    return `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _updatePerformanceMetrics(systemName, success, responseTime) {
    this.performanceMetrics.totalRequests++;

    if (success) {
      this.performanceMetrics.successfulRequests++;
      this.performanceMetrics.governmentSystemStatus[systemName] = 'HEALTHY';
    } else {
      this.performanceMetrics.failedRequests++;
      this.performanceMetrics.governmentSystemStatus[systemName] = 'ERROR';
    }

    // Update average response time
    const currentAvg = this.performanceMetrics.averageResponseTimes[systemName];
    this.performanceMetrics.averageResponseTimes[systemName] =
      currentAvg === 0 ? responseTime : (currentAvg + responseTime) / 2;
  }

  async _createAuditRecord(action, data) {
    try {
      if (this.auditService) {
        await this.auditService.createRecord({
          module: 'GOVERNMENT_API_INTEGRATION',
          action,
          data,
          timestamp: new Date()
        });
      }
    } catch (error) {
      this.logger.error('[GovernmentApiIntegration] Audit record creation failed:', error);
    }
  }

  // Additional helper methods would be implemented here...
  // Including OAuth token management, HMAC signature generation,
  // data validation, result processing, etc.
}

module.exports = GovernmentApiIntegrationService;
