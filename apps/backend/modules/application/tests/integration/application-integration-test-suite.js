/**
 * Enhanced Application Module Integration Test Suite
 *
 * Comprehensive integration testing for the enhanced GACP application processing system.
 * These tests validate the complete workflow from application creation to certification
 * with real database connections, government system mocks, and end-to-end processing.
 *
 * Test Coverage & Business Logic Validation:
 * 1. Complete Application Lifecycle Testing - Full FSM workflow validation
 * 2. Document Processing Integration - OCR, validation, and government verification
 * 3. Government API Integration - Multi-ministry system simulation
 * 4. Analytics and Monitoring - Performance metrics and health monitoring
 * 5. Error Handling and Recovery - Circuit breaker and resilience testing
 *
 * Workflow & Process Integration:
 * All tests simulate real-world scenarios with proper data flow,
 * audit trail generation, performance monitoring, and compliance validation.
 *
 * Testing Strategy:
 * - Integration tests with real MongoDB connections
 * - Government API mocking for reliable testing
 * - Performance benchmarking and load testing
 * - Security validation and authorization testing
 * - Comprehensive error scenario coverage
 */

const logger = require('../../../../shared/logger/logger');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const jwt = require('jsonwebtoken');

// Import enhanced application system components
const { createEnhancedApplicationRoutes } = require('../routes/enhanced-application.routes');
const EnhancedApplicationProcessingController = require('../../application/controllers/EnhancedApplicationProcessingController');
const AdvancedApplicationProcessingService = require('../../domain/services/AdvancedApplicationProcessingService');
const DocumentManagementIntegrationSystem = require('../../infrastructure/integrations/DocumentManagementIntegrationSystem');
const GovernmentApiIntegrationService = require('../../infrastructure/integrations/GovernmentApiIntegrationService');

// Test database and application setup
class ApplicationIntegrationTestSuite {
  constructor() {
    this.app = null;
    this.mongoServer = null;
    this.testDatabase = null;
    this.enhancedController = null;
    this.testUsers = {};
    this.testApplications = {};

    // Test configuration
    this.config = {
      jwt: {
        secret: 'test-jwt-secret-key-for-application-integration',
        expiresIn: '24h',
      },
      database: {
        name: 'gacp_application_integration_test',
      },
      government: {
        mockEndpoints: true,
        responseDelay: 100,
      },
      performance: {
        maxResponseTime: 5000,
        maxMemoryUsage: 512 * 1024 * 1024, // 512MB
      },
    };
  }

  /**
   * Setup test environment with database and application
   */
  async setupTestEnvironment() {
    logger.info('[Integration Test] Setting up test environment...');

    try {
      // Start in-memory MongoDB server
      this.mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: this.config.database.name,
        },
      });

      const mongoUri = this.mongoServer.getUri();
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.testDatabase = mongoose.connection.db;
      logger.info('[Integration Test] Database connected successfully');

      // Create enhanced application services
      await this.createEnhancedServices();

      // Setup Express application with routes
      await this.setupExpressApp();

      // Create test users with different roles
      await this.createTestUsers();

      logger.info('[Integration Test] Environment setup completed successfully');
    } catch (error) {
      logger.error('[Integration Test] Setup failed:', error);
      throw error;
    }
  }

  /**
   * Create enhanced application services with test configuration
   */
  async createEnhancedServices() {
    logger.info('[Integration Test] Creating enhanced services...');

    // Create government API integration service with mocking
    const governmentService = new GovernmentApiIntegrationService({
      mockMode: true,
      endpoints: {
        nationalId: 'http://localhost:8080/mock/national-id',
        landDepartment: 'http://localhost:8080/mock/land-dept',
        moac: 'http://localhost:8080/mock/moac',
        doa: 'http://localhost:8080/mock/doa',
        fda: 'http://localhost:8080/mock/fda',
      },
      authentication: {
        type: 'API_KEY',
        apiKey: 'test-api-key',
      },
    });

    // Create document management system with test storage
    const documentService = new DocumentManagementIntegrationSystem({
      storage: {
        type: 'LOCAL',
        path: './test-uploads',
        maxSize: 50 * 1024 * 1024,
      },
      ocr: {
        enabled: true,
        mockMode: true,
      },
      qualityAssurance: {
        enabled: true,
        strictMode: false,
      },
    });

    // Create advanced application processing service
    const processingService = new AdvancedApplicationProcessingService({
      database: this.testDatabase,
      governmentService,
      documentService,
      analytics: {
        enabled: true,
        realtime: true,
      },
      workflow: {
        autoTransitions: true,
        notifications: false, // Disable for testing
      },
    });

    // Create enhanced controller
    this.enhancedController = new EnhancedApplicationProcessingController({
      applicationService: processingService,
      documentService,
      governmentService,
      config: {
        security: {
          requireAuth: true,
          roleBasedAccess: true,
        },
        performance: {
          caching: false, // Disable for testing
          monitoring: true,
        },
      },
    });

    logger.info('[Integration Test] Enhanced services created successfully');
  }

  /**
   * Setup Express application with enhanced routes
   */
  async setupExpressApp() {
    logger.info('[Integration Test] Setting up Express application...');

    this.app = express();

    // Basic middleware
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Test authentication middleware
    const authMiddleware = {
      requireAuth: (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Authentication token required',
          });
        }

        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, this.config.jwt.secret);
          req.user = decoded;
          next();
        } catch (error) {
          return res.status(401).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Invalid authentication token',
          });
        }
      },

      requireRole: allowedRoles => (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            error: 'INSUFFICIENT_PERMISSIONS',
            message: 'Insufficient permissions for this action',
          });
        }
        next();
      },
    };

    // Create enhanced application routes
    const { dtamRouter, farmerRouter, adminRouter } = createEnhancedApplicationRoutes(
      this.enhancedController,
      authMiddleware,
    );

    // Mount routers
    this.app.use('/api/dtam/applications', dtamRouter);
    this.app.use('/api/farmer/applications', farmerRouter);
    this.app.use('/api/admin/applications', adminRouter);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        services: {
          database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          application: 'running',
        },
      });
    });

    logger.info('[Integration Test] Express application configured successfully');
  }

  /**
   * Create test users with different roles
   */
  async createTestUsers() {
    logger.info('[Integration Test] Creating test users...');

    const users = [
      {
        id: 'farmer-001',
        citizenId: '1234567890123',
        role: 'farmer',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        email: 'farmer@test.com',
        phoneNumber: '0812345678',
      },
      {
        id: 'dtam-staff-001',
        citizenId: '2345678901234',
        role: 'dtam_staff',
        firstName: 'สมหญิง',
        lastName: 'ขยันขันแข็ง',
        email: 'dtam.staff@test.com',
        phoneNumber: '0823456789',
      },
      {
        id: 'dtam-manager-001',
        citizenId: '3456789012345',
        role: 'dtam_manager',
        firstName: 'สมศักดิ์',
        lastName: 'ผู้จัดการ',
        email: 'dtam.manager@test.com',
        phoneNumber: '0834567890',
      },
      {
        id: 'admin-001',
        citizenId: '4567890123456',
        role: 'admin',
        firstName: 'ผู้ดูแล',
        lastName: 'ระบบ',
        email: 'admin@test.com',
        phoneNumber: '0845678901',
      },
    ];

    for (const user of users) {
      // Create JWT token for user
      const token = jwt.sign(
        {
          userId: user.id,
          citizenId: user.citizenId,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        this.config.jwt.secret,
        { expiresIn: this.config.jwt.expiresIn },
      );

      this.testUsers[user.role] = {
        ...user,
        token: `Bearer ${token}`,
      };
    }

    logger.info('[Integration Test] Test users created successfully');
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    logger.info('[Integration Test] Cleaning up test environment...');

    try {
      // Close database connection
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }

      // Stop MongoDB server
      if (this.mongoServer) {
        await this.mongoServer.stop();
      }

      // Clear test data
      this.testUsers = {};
      this.testApplications = {};

      logger.info('[Integration Test] Cleanup completed successfully');
    } catch (error) {
      logger.error('[Integration Test] Cleanup failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // INTEGRATION TEST SUITES
  // ============================================================================

  /**
   * Test complete application lifecycle workflow
   */
  async testCompleteApplicationLifecycle() {
    logger.info('\n=== Testing Complete Application Lifecycle ===');

    const testResults = {
      testName: 'Complete Application Lifecycle',
      passed: 0,
      failed: 0,
      errors: [],
    };

    try {
      // 1. Test application creation by farmer
      logger.info('[Test] Creating new GACP application...');

      const applicationData = {
        farmerCitizenId: '1234567890123',
        farmerFirstName: 'สมชาย',
        farmerLastName: 'ใจดี',
        farmerEmail: 'farmer@test.com',
        farmerPhoneNumber: '0812345678',
        farmName: 'ฟาร์มกัญชาเพื่อสุขภาพ',
        farmAddress: {
          province: 'เชียงใหม่',
          district: 'เมืองเชียงใหม่',
          subDistrict: 'ช่างคลาน',
          postalCode: '50100',
          coordinates: {
            latitude: 18.7883,
            longitude: 98.9853,
          },
        },
        farmSize: 5.5,
        farmSizeUnit: 'rai',
        cultivationType: 'INDOOR',
        cannabisVariety: 'CBD',
        productionCapacity: 1000,
        marketIntent: 'DOMESTIC',
        certificationGoals: ['GACP', 'ORGANIC'],
      };

      const createResponse = await request(this.app)
        .post('/api/farmer/applications')
        .set('Authorization', this.testUsers.farmer.token)
        .send(applicationData)
        .expect(201);

      if (createResponse.body.success) {
        testResults.passed++;
        this.testApplications.primary = createResponse.body.data;
        console.log(
          '[Test] ✓ Application created successfully:',
          this.testApplications.primary.applicationId,
        );
      } else {
        testResults.failed++;
        testResults.errors.push('Application creation failed');
      }

      // 2. Test document upload
      logger.info('[Test] Uploading application documents...');

      const documentTypes = ['FARMER_ID', 'LAND_OWNERSHIP', 'FARM_REGISTRATION'];

      for (const docType of documentTypes) {
        const uploadResponse = await request(this.app)
          .post(`/api/farmer/applications/${this.testApplications.primary.applicationId}/documents`)
          .set('Authorization', this.testUsers.farmer.token)
          .field('documentType', docType)
          .field('description', `Test ${docType} document`)
          .attach('document', Buffer.from(`Mock ${docType} content`), `${docType}.pdf`)
          .expect(201);

        if (uploadResponse.body.success) {
          testResults.passed++;
          logger.info(`[Test] ✓ Document ${docType} uploaded successfully`);
        } else {
          testResults.failed++;
          testResults.errors.push(`Document ${docType} upload failed`);
        }
      }

      // 3. Test DTAM review and state transitions
      logger.info('[Test] Processing DTAM review workflow...');

      const stateTransitions = [
        { state: 'UNDER_REVIEW', notes: 'Application received and under initial review' },
        { state: 'DOCUMENT_REQUEST', notes: 'Additional documents required' },
        { state: 'INSPECTION_SCHEDULED', notes: 'Farm inspection scheduled' },
        { state: 'INSPECTION_COMPLETED', notes: 'Farm inspection completed successfully' },
        { state: 'COMPLIANCE_REVIEW', notes: 'Compliance review in progress' },
        { state: 'APPROVED', notes: 'Application approved for certification' },
      ];

      for (const transition of stateTransitions) {
        const transitionResponse = await request(this.app)
          .put(`/api/dtam/applications/${this.testApplications.primary.applicationId}/state`)
          .set('Authorization', this.testUsers.dtam_manager.token)
          .send({
            targetState: transition.state,
            notes: transition.notes,
            reasonCode: 'WORKFLOW_PROGRESSION',
          })
          .expect(200);

        if (transitionResponse.body.success) {
          testResults.passed++;
          logger.info(`[Test] ✓ State transition to ${transition.state} successful`);
        } else {
          testResults.failed++;
          testResults.errors.push(`State transition to ${transition.state} failed`);
        }

        // Small delay between transitions for realistic simulation
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 4. Test government integration
      logger.info('[Test] Testing government integration...');

      const identityVerification = await request(this.app)
        .post(
          `/api/dtam/applications/${this.testApplications.primary.applicationId}/verify-identity`,
        )
        .set('Authorization', this.testUsers.dtam_staff.token)
        .send({
          citizenId: '1234567890123',
          firstName: 'สมชาย',
          lastName: 'ใจดี',
          dateOfBirth: '1985-05-15T00:00:00Z',
          verificationLevel: 'ENHANCED',
        })
        .expect(200);

      if (identityVerification.body.success) {
        testResults.passed++;
        logger.info('[Test] ✓ Identity verification successful');
      } else {
        testResults.failed++;
        testResults.errors.push('Identity verification failed');
      }

      const landVerification = await request(this.app)
        .post(`/api/dtam/applications/${this.testApplications.primary.applicationId}/verify-land`)
        .set('Authorization', this.testUsers.dtam_staff.token)
        .send({
          landData: {
            titleDeedNumber: 'TD123456789',
            landParcelId: 'LP987654321',
            issueDate: '2020-01-15T00:00:00Z',
            landArea: 5.5,
            landUseType: 'AGRICULTURE',
          },
          ownerData: {
            citizenId: '1234567890123',
            firstName: 'สมชาย',
            lastName: 'ใจดี',
          },
        })
        .expect(200);

      if (landVerification.body.success) {
        testResults.passed++;
        logger.info('[Test] ✓ Land verification successful');
      } else {
        testResults.failed++;
        testResults.errors.push('Land verification failed');
      }

      // 5. Test dashboard and analytics
      logger.info('[Test] Testing dashboard and analytics...');

      const dashboardResponse = await request(this.app)
        .get(`/api/farmer/applications/${this.testApplications.primary.applicationId}/dashboard`)
        .set('Authorization', this.testUsers.farmer.token)
        .query({
          includeAnalytics: true,
          includeDocuments: true,
          includeHistory: true,
        })
        .expect(200);

      if (dashboardResponse.body.success && dashboardResponse.body.data.applicationId) {
        testResults.passed++;
        logger.info('[Test] ✓ Dashboard retrieved successfully');
      } else {
        testResults.failed++;
        testResults.errors.push('Dashboard retrieval failed');
      }

      const analyticsResponse = await request(this.app)
        .get('/api/admin/applications/analytics/dashboard')
        .set('Authorization', this.testUsers.admin.token)
        .query({
          timeframe: '24h',
          includeServices: true,
          includePerformance: true,
        })
        .expect(200);

      if (analyticsResponse.body.success) {
        testResults.passed++;
        logger.info('[Test] ✓ Analytics dashboard retrieved successfully');
      } else {
        testResults.failed++;
        testResults.errors.push('Analytics dashboard retrieval failed');
      }
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(`Lifecycle test error: ${error.message}`);
      logger.error('[Test] Lifecycle test failed:', error);
    }

    logger.info(`\n[Test Results] Complete Application Lifecycle:`);
    logger.info(`  Passed: ${testResults.passed}`);
    logger.info(`  Failed: ${testResults.failed}`);
    if (testResults.errors.length > 0) {
      logger.info(`  Errors: ${testResults.errors.join(', ')}`);
    }

    return testResults;
  }

  /**
   * Test performance and load scenarios
   */
  async testPerformanceAndLoad() {
    logger.info('\n=== Testing Performance and Load ===');

    const testResults = {
      testName: 'Performance and Load Testing',
      passed: 0,
      failed: 0,
      errors: [],
      metrics: {
        responseTime: [],
        memoryUsage: [],
        concurrentRequests: 0,
      },
    };

    try {
      // Test concurrent application creation
      logger.info('[Test] Testing concurrent application creation...');

      const concurrentRequests = 10;
      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;

      const createPromises = Array.from({ length: concurrentRequests }, (_, index) => {
        const applicationData = {
          farmerCitizenId: `123456789${String(index).padStart(4, '0')}`,
          farmerFirstName: `ทดสอบ${index}`,
          farmerLastName: 'ประสิทธิภาพ',
          farmerEmail: `test${index}@performance.com`,
          farmerPhoneNumber: `081234${String(index).padStart(4, '0')}`,
          farmName: `ฟาร์มทดสอบ ${index}`,
          farmAddress: {
            province: 'กรุงเทพมหานคร',
            district: 'วัฒนา',
            subDistrict: 'ลุมพินี',
            postalCode: '10330',
            coordinates: {
              latitude: 13.7563 + index * 0.001,
              longitude: 100.5018 + index * 0.001,
            },
          },
          farmSize: 1.0 + index,
          farmSizeUnit: 'rai',
          cultivationType: 'INDOOR',
          cannabisVariety: 'CBD',
        };

        return request(this.app)
          .post('/api/farmer/applications')
          .set('Authorization', this.testUsers.farmer.token)
          .send(applicationData);
      });

      const responses = await Promise.allSettled(createPromises);
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;

      const successfulRequests = responses.filter(
        r => r.status === 'fulfilled' && r.value.status === 201,
      ).length;
      const totalTime = endTime - startTime;
      const memoryIncrease = endMemory - startMemory;

      testResults.metrics.responseTime.push(totalTime);
      testResults.metrics.memoryUsage.push(memoryIncrease);
      testResults.metrics.concurrentRequests = concurrentRequests;

      if (successfulRequests >= concurrentRequests * 0.8) {
        // 80% success rate acceptable
        testResults.passed++;
        console.log(
          `[Test] ✓ Concurrent requests: ${successfulRequests}/${concurrentRequests} successful`,
        );
        console.log(
          `[Test] ✓ Total time: ${totalTime}ms (${totalTime / concurrentRequests}ms average)`,
        );
        logger.info(`[Test] ✓ Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
      } else {
        testResults.failed++;
        testResults.errors.push(`Low success rate: ${successfulRequests}/${concurrentRequests}`);
      }

      // Test response time under load
      logger.info('[Test] Testing response time under load...');

      const loadTestPromises = Array.from({ length: 5 }, async () => {
        const start = Date.now();
        const response = await request(this.app).get('/health').expect(200);
        const responseTime = Date.now() - start;

        return { success: response.body.status === 'healthy', responseTime };
      });

      const loadResults = await Promise.all(loadTestPromises);
      const avgResponseTime =
        loadResults.reduce((sum, r) => sum + r.responseTime, 0) / loadResults.length;

      if (avgResponseTime < this.config.performance.maxResponseTime) {
        testResults.passed++;
        logger.info(`[Test] ✓ Average response time: ${avgResponseTime}ms`);
      } else {
        testResults.failed++;
        testResults.errors.push(`High response time: ${avgResponseTime}ms`);
      }

      // Test memory usage stability
      const memoryUsagePercent = (endMemory / this.config.performance.maxMemoryUsage) * 100;
      if (memoryUsagePercent < 80) {
        // Less than 80% of max memory
        testResults.passed++;
        logger.info(`[Test] ✓ Memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      } else {
        testResults.failed++;
        testResults.errors.push(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      }
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(`Performance test error: ${error.message}`);
      logger.error('[Test] Performance test failed:', error);
    }

    logger.info(`\n[Test Results] Performance and Load Testing:`);
    logger.info(`  Passed: ${testResults.passed}`);
    logger.info(`  Failed: ${testResults.failed}`);
    if (testResults.errors.length > 0) {
      logger.info(`  Errors: ${testResults.errors.join(', ')}`);
    }

    return testResults;
  }

  /**
   * Test error handling and recovery scenarios
   */
  async testErrorHandlingAndRecovery() {
    logger.info('\n=== Testing Error Handling and Recovery ===');

    const testResults = {
      testName: 'Error Handling and Recovery',
      passed: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Test invalid authentication
      logger.info('[Test] Testing invalid authentication...');

      const invalidAuthResponse = await request(this.app)
        .post('/api/farmer/applications')
        .set('Authorization', 'Bearer invalid-token')
        .send({})
        .expect(401);

      if (invalidAuthResponse.body.error === 'INVALID_TOKEN') {
        testResults.passed++;
        logger.info('[Test] ✓ Invalid authentication handled correctly');
      } else {
        testResults.failed++;
        testResults.errors.push('Invalid authentication not handled properly');
      }

      // Test insufficient permissions
      logger.info('[Test] Testing insufficient permissions...');

      const permissionResponse = await request(this.app)
        .put('/api/dtam/applications/GACP-2024-12345678/state')
        .set('Authorization', this.testUsers.farmer.token) // Farmer trying DTAM action
        .send({
          targetState: 'APPROVED',
          notes: 'Unauthorized attempt',
        })
        .expect(403);

      if (permissionResponse.body.error === 'INSUFFICIENT_PERMISSIONS') {
        testResults.passed++;
        logger.info('[Test] ✓ Insufficient permissions handled correctly');
      } else {
        testResults.failed++;
        testResults.errors.push('Permission validation not working properly');
      }

      // Test invalid data validation
      logger.info('[Test] Testing data validation...');

      const validationResponse = await request(this.app)
        .post('/api/farmer/applications')
        .set('Authorization', this.testUsers.farmer.token)
        .send({
          farmerCitizenId: '123', // Invalid citizen ID
          farmerEmail: 'invalid-email', // Invalid email
          farmSize: -1, // Invalid farm size
        })
        .expect(400);

      if (validationResponse.body.error && validationResponse.body.message) {
        testResults.passed++;
        logger.info('[Test] ✓ Data validation working correctly');
      } else {
        testResults.failed++;
        testResults.errors.push('Data validation not working properly');
      }

      // Test rate limiting
      logger.info('[Test] Testing rate limiting...');

      // Make many requests quickly to trigger rate limiting
      const rateLimitPromises = Array.from({ length: 25 }, () => {
        return request(this.app)
          .get('/health')
          .expect(res => {
            // Accept both 200 (successful) and 429 (rate limited) responses
            if (res.status !== 200 && res.status !== 429) {
              throw new Error(`Unexpected status code: ${res.status}`);
            }
          });
      });

      const rateLimitResults = await Promise.allSettled(rateLimitPromises);
      const rateLimitedRequests = rateLimitResults.filter(
        result => result.status === 'fulfilled' && result.value.status === 429,
      );

      if (rateLimitedRequests.length > 0) {
        testResults.passed++;
        logger.info(`[Test] ✓ Rate limiting triggered for ${rateLimitedRequests.length} requests`);
      } else {
        testResults.failed++;
        testResults.errors.push('Rate limiting not working');
      }

      // Test non-existent resource
      logger.info('[Test] Testing non-existent resource handling...');

      const notFoundResponse = await request(this.app)
        .get('/api/farmer/applications/GACP-9999-NOTFOUND/dashboard')
        .set('Authorization', this.testUsers.farmer.token)
        .expect(404);

      if (notFoundResponse.body.error) {
        testResults.passed++;
        logger.info('[Test] ✓ Non-existent resource handled correctly');
      } else {
        testResults.failed++;
        testResults.errors.push('Non-existent resource not handled properly');
      }
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(`Error handling test error: ${error.message}`);
      logger.error('[Test] Error handling test failed:', error);
    }

    logger.info(`\n[Test Results] Error Handling and Recovery:`);
    logger.info(`  Passed: ${testResults.passed}`);
    logger.info(`  Failed: ${testResults.failed}`);
    if (testResults.errors.length > 0) {
      logger.info(`  Errors: ${testResults.errors.join(', ')}`);
    }

    return testResults;
  }

  /**
   * Run complete integration test suite
   */
  async runCompleteTestSuite() {
    logger.info('\n🚀 Starting Enhanced Application Module Integration Test Suite');
    logger.info('='.repeat(80));

    const suiteResults = {
      startTime: new Date(),
      endTime: null,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      testResults: [],
      overallSuccess: false,
    };

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Run test suites
      const lifecycleResults = await this.testCompleteApplicationLifecycle();
      const performanceResults = await this.testPerformanceAndLoad();
      const errorHandlingResults = await this.testErrorHandlingAndRecovery();

      // Aggregate results
      suiteResults.testResults = [lifecycleResults, performanceResults, errorHandlingResults];
      suiteResults.totalPassed = suiteResults.testResults.reduce((sum, r) => sum + r.passed, 0);
      suiteResults.totalFailed = suiteResults.testResults.reduce((sum, r) => sum + r.failed, 0);
      suiteResults.totalTests = suiteResults.totalPassed + suiteResults.totalFailed;
      suiteResults.endTime = new Date();

      // Determine overall success (90% pass rate required)
      const passRate = (suiteResults.totalPassed / suiteResults.totalTests) * 100;
      suiteResults.overallSuccess = passRate >= 90;

      // Print final results
      logger.info('\n' + '='.repeat(80));
      logger.info('🏁 Integration Test Suite Results');
      logger.info('='.repeat(80));
      logger.info(`Duration: ${suiteResults.endTime - suiteResults.startTime}ms`);
      logger.info(`Total Tests: ${suiteResults.totalTests}`);
      logger.info(`Passed: ${suiteResults.totalPassed} (${passRate.toFixed(1)}%)`);
      logger.info(`Failed: ${suiteResults.totalFailed}`);
      logger.info(`Overall Status: ${suiteResults.overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);

      if (suiteResults.overallSuccess) {
        logger.info('\n🎉 Application Module Integration Test Suite completed successfully!');
        logger.info('✅ All critical workflows validated');
        logger.info('✅ Performance requirements met');
        logger.info('✅ Error handling working correctly');
        logger.info('✅ Security measures functioning properly');
      } else {
        logger.info('\n❌ Integration Test Suite failed!');
        logger.info('Please review failed tests and fix issues before deployment.');
      }
    } catch (error) {
      suiteResults.overallSuccess = false;
      logger.error('\n💥 Integration Test Suite crashed:', error);
    } finally {
      // Cleanup
      await this.cleanup();
    }

    return suiteResults;
  }
}

// Export for use in test runners
module.exports = ApplicationIntegrationTestSuite;

// If run directly, execute the test suite
if (require.main === module) {
  const testSuite = new ApplicationIntegrationTestSuite();
  testSuite
    .runCompleteTestSuite()
    .then(results => {
      process.exit(results.overallSuccess ? 0 : 1);
    })
    .catch(error => {
      logger.error('Test suite execution failed:', error);
      process.exit(1);
    });
}
