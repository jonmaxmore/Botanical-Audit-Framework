/**
 * Training Module Integration Tests
 *
 * Comprehensive test suite for the enhanced Training Module that validates:
 * - Integration between all enhanced training services
 * - End-to-end workflows and business processes
 * - Analytics, certification, and performance assessment integration
 * - Error handling, resilience, and performance characteristics
 * - Data consistency and audit trail compliance
 *
 * Test Architecture & Strategy:
 * 1. Unit Tests - Individual service component testing
 * 2. Integration Tests - Cross-service interaction validation
 * 3. End-to-End Tests - Complete workflow testing
 * 4. Performance Tests - Load and stress testing
 * 5. Resilience Tests - Circuit breaker and error handling
 *
 * Business Logic Validation:
 * All tests ensure that business rules are correctly implemented,
 * workflows execute as designed, and process integration maintains
 * data integrity while providing comprehensive audit trails.
 */

const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} = require('@jest/globals');
const logger = require('../../../../shared/logger/logger');
const request = require('supertest');
const mongoose = require('mongoose');

// Test utilities and mocks
const TestDatabase = require('../../__tests__/utils/test-database');
const TestDataFactory = require('../../__tests__/utils/test-data-factory');
const MockServices = require('../../__tests__/mocks/services');

// Services under test
const EnhancedTrainingServiceIntegration = require('../domain/services/EnhancedTrainingServiceIntegration');
const AdvancedTrainingAnalyticsSystem = require('../domain/services/AdvancedTrainingAnalyticsSystem');
const CertificationTrackingIntegrationSystem = require('../domain/services/CertificationTrackingIntegrationSystem');
const PerformanceAssessmentToolsSystem = require('../domain/services/PerformanceAssessmentToolsSystem');
const EnhancedTrainingController = require('../presentation/controllers/EnhancedTrainingController');

/**
 * Integration Test Suite for Enhanced Training Module
 *
 * Test Strategy:
 * - Validates complete training workflows from enrollment to certification
 * - Ensures proper integration between analytics, certification, and performance systems
 * - Tests error handling, resilience patterns, and performance characteristics
 * - Validates business logic compliance and audit trail generation
 */
describe('Enhanced Training Module Integration Tests', () => {
  let testDb;
  let mockServices;
  let testApp;
  let integrationService;
  let analyticsSystem;
  let certificationSystem;
  let performanceSystem;
  let enhancedController;
  let testUser;
  let testCourse;

  // ============================================================================
  // TEST SETUP AND TEARDOWN
  // ============================================================================

  beforeAll(async () => {
    logger.info('🚀 Setting up Enhanced Training Module Integration Tests');

    // Initialize test database
    testDb = new TestDatabase();
    await testDb.connect();

    // Create mock services
    mockServices = new MockServices();
    await mockServices.initialize();

    // Initialize enhanced training systems
    await initializeEnhancedTrainingSystems();

    // Create test application
    testApp = await createTestApplication();

    logger.info('✅ Enhanced Training Module Integration Tests setup complete');
  });

  beforeEach(async () => {
    logger.info('🧹 Setting up test data');

    // Clean test data
    await testDb.clean();

    // Create fresh test data
    testUser = await TestDataFactory.createUser({
      role: 'farmer',
      profile: {
        farmSize: 'medium',
        experienceLevel: 'intermediate',
        certificationGoals: ['basic_cultivation', 'quality_management'],
      },
    });

    testCourse = await TestDataFactory.createCourse({
      type: 'certification_pathway',
      competencies: ['plant_cultivation', 'quality_control'],
      difficulty: 'intermediate',
      estimatedDuration: '6_weeks',
    });

    logger.info('✅ Test data setup complete');
  });

  afterEach(async () => {
    // Clean up test data and reset mocks
    await testDb.clean();
    mockServices.reset();
  });

  afterAll(async () => {
    logger.info('🧹 Cleaning up Enhanced Training Module Integration Tests');

    // Shutdown services
    if (integrationService) {
      await integrationService.shutdown();
    }

    // Close database connection
    await testDb.disconnect();

    logger.info('✅ Enhanced Training Module Integration Tests cleanup complete');
  });

  // ============================================================================
  // CORE INTEGRATION TESTS
  // ============================================================================

  describe('Service Integration and Initialization', () => {
    test('should initialize all enhanced training services correctly', async () => {
      // Test service initialization workflow
      const initializationResult = await integrationService.initialize();

      expect(initializationResult.success).toBe(true);
      expect(initializationResult.serviceHealth).toBeDefined();
      expect(initializationResult.serviceHealth.analytics).toBe('healthy');
      expect(initializationResult.serviceHealth.certification).toBe('healthy');
      expect(initializationResult.serviceHealth.performance).toBe('healthy');
      expect(initializationResult.serviceHealth.originalTraining).toBe('healthy');

      // Validate performance metrics initialization
      expect(initializationResult.performanceMetrics).toBeDefined();
      expect(initializationResult.performanceMetrics.totalOperations).toBe(0);
    });

    test('should handle service initialization failures gracefully', async () => {
      // Mock analytics service failure
      mockServices.analyticsService.mockInitializationFailure();

      const newIntegrationService = new EnhancedTrainingServiceIntegration({
        originalTrainingService: mockServices.trainingService,
        advancedAnalyticsSystem: mockServices.analyticsService,
        certificationTrackingSystem: certificationSystem,
        performanceAssessmentSystem: performanceSystem,
        auditService: mockServices.auditService,
        notificationService: mockServices.notificationService,
        cacheService: mockServices.cacheService,
        logger: mockServices.logger,
      });

      await expect(newIntegrationService.initialize()).rejects.toThrow(/initialization failed/);
    });

    test('should perform comprehensive health checks', async () => {
      const healthResult = await integrationService.getSystemHealth();

      expect(healthResult.success).toBe(true);
      expect(healthResult.data.serviceHealth).toBeDefined();
      expect(healthResult.data.healthScore).toBeGreaterThanOrEqual(0);
      expect(healthResult.data.healthScore).toBeLessThanOrEqual(100);
      expect(healthResult.data.status).toMatch(/HEALTHY|DEGRADED|CRITICAL/);
      expect(healthResult.data.timestamp).toBeDefined();
    });
  });

  // ============================================================================
  // ENHANCED ENROLLMENT WORKFLOW TESTS
  // ============================================================================

  describe('Enhanced Course Enrollment Integration', () => {
    test('should process complete enrollment workflow with all integrations', async () => {
      logger.info('🎯 Testing enhanced course enrollment workflow');

      // Execute enhanced enrollment
      const enrollmentResult = await integrationService.enrollLearnerInCourse(
        testUser.id,
        testCourse.id,
        {
          enrollmentType: 'certification_track',
          analyticsTracking: true,
          predictiveAnalytics: true,
        },
      );

      // Validate core enrollment success
      expect(enrollmentResult.success).toBe(true);
      expect(enrollmentResult.data.enrollmentId).toBeDefined();
      expect(enrollmentResult.operationId).toBeDefined();

      // Validate analytics integration
      expect(enrollmentResult.data.analytics).toBeDefined();
      expect(enrollmentResult.data.analytics.trackingId).toBeDefined();
      expect(enrollmentResult.data.analytics.predictiveModels).toBeDefined();

      // Validate certification integration
      expect(enrollmentResult.data.certification).toBeDefined();
      expect(enrollmentResult.data.certification.pathwayId).toBeDefined();
      expect(enrollmentResult.data.certification.milestones).toBeDefined();

      // Validate performance assessment integration
      expect(enrollmentResult.data.performance).toBeDefined();
      expect(enrollmentResult.data.performance.profileId).toBeDefined();
      expect(enrollmentResult.data.performance.competencyMap).toBeDefined();

      // Validate predictions
      expect(enrollmentResult.data.predictions).toBeDefined();
      expect(enrollmentResult.data.predictions.successProbability).toBeGreaterThan(0);
      expect(enrollmentResult.data.predictions.estimatedCompletionTime).toBeDefined();

      // Validate processing performance
      expect(enrollmentResult.data.processingTime).toBeLessThan(5000); // Should complete within 5 seconds

      logger.info('✅ Enhanced enrollment workflow completed successfully');
    });

    test('should handle enrollment eligibility validation', async () => {
      // Create user with prerequisites not met
      const ineligibleUser = await TestDataFactory.createUser({
        role: 'farmer',
        profile: {
          experienceLevel: 'beginner',
          certificationStatus: 'none',
        },
      });

      // Create advanced course requiring prerequisites
      const advancedCourse = await TestDataFactory.createCourse({
        type: 'advanced_certification',
        prerequisites: ['basic_cultivation_cert'],
        difficulty: 'expert',
      });

      // Attempt enrollment - should validate eligibility
      const enrollmentResult = await integrationService.enrollLearnerInCourse(
        ineligibleUser.id,
        advancedCourse.id,
      );

      // Should succeed with recommendations for prerequisite courses
      expect(enrollmentResult.success).toBe(true);
      expect(enrollmentResult.data.analytics.recommendations).toBeDefined();
      expect(enrollmentResult.data.analytics.recommendations.prerequisiteCourses).toHaveLength(1);
    });

    test('should handle service failures with circuit breaker pattern', async () => {
      // Mock analytics service failure
      mockServices.analyticsService.mockServiceFailure();

      const enrollmentResult = await integrationService.enrollLearnerInCourse(
        testUser.id,
        testCourse.id,
      );

      // Should still succeed with degraded functionality
      expect(enrollmentResult.success).toBe(true);
      expect(enrollmentResult.data.enrollmentId).toBeDefined();

      // Analytics should show error status
      expect(enrollmentResult.data.analytics.error).toBeDefined();
      expect(enrollmentResult.data.analytics.status).toBe('failed');

      // Other services should still work
      expect(enrollmentResult.data.certification.pathwayId).toBeDefined();
      expect(enrollmentResult.data.performance.profileId).toBeDefined();
    });

    test('should generate comprehensive audit trail for enrollment', async () => {
      const enrollmentResult = await integrationService.enrollLearnerInCourse(
        testUser.id,
        testCourse.id,
      );

      // Verify audit record was created
      const auditRecords = mockServices.auditService.getRecords();
      const enrollmentAudit = auditRecords.find(r => r.action === 'COURSE_ENROLLMENT');

      expect(enrollmentAudit).toBeDefined();
      expect(enrollmentAudit.data.userId).toBe(testUser.id);
      expect(enrollmentAudit.data.courseId).toBe(testCourse.id);
      expect(enrollmentAudit.data.operationId).toBe(enrollmentResult.operationId);
      expect(enrollmentAudit.data.integrationResults).toBeDefined();
      expect(enrollmentAudit.data.predictions).toBeDefined();
    });
  });

  // ============================================================================
  // COURSE COMPLETION WORKFLOW TESTS
  // ============================================================================

  describe('Enhanced Course Completion Integration', () => {
    let enrollmentData;

    beforeEach(async () => {
      // Setup enrollment first
      enrollmentData = await integrationService.enrollLearnerInCourse(testUser.id, testCourse.id);
    });

    test('should process complete course completion workflow', async () => {
      logger.info('🎯 Testing enhanced course completion workflow');

      const completionData = {
        enrollmentId: enrollmentData.data.enrollmentId,
        finalScore: 87,
        performanceMetrics: {
          engagementLevel: 'high',
          completionRate: 100,
          assessmentScores: [85, 89, 92, 84],
        },
        learningOutcomes: [
          { competencyId: 'plant_cultivation', achievementLevel: 'proficient' },
          { competencyId: 'quality_control', achievementLevel: 'advanced' },
        ],
        competencies: ['plant_cultivation', 'quality_control'],
        achievementLevel: 'proficient',
      };

      const completionResult = await integrationService.processCourseCompletion(
        testUser.id,
        testCourse.id,
        completionData,
      );

      // Validate core completion success
      expect(completionResult.success).toBe(true);
      expect(completionResult.data.completionId).toBeDefined();
      expect(completionResult.operationId).toBeDefined();

      // Validate analytics integration
      expect(completionResult.data.analytics).toBeDefined();
      expect(completionResult.data.analytics.performanceAnalysis).toBeDefined();
      expect(completionResult.data.analytics.nextPredictions).toBeDefined();

      // Validate certification progression
      expect(completionResult.data.certification).toBeDefined();
      expect(completionResult.data.certification.milestonesAchieved).toBeDefined();
      expect(completionResult.data.certification.progressPercentage).toBeGreaterThan(0);

      // Validate performance assessment
      expect(completionResult.data.performance).toBeDefined();
      expect(completionResult.data.performance.competencyEvaluation).toBeDefined();
      expect(completionResult.data.performance.recommendedNextSteps).toBeDefined();

      // Validate achievements analysis
      expect(completionResult.data.achievements).toBeDefined();
      expect(completionResult.data.achievements.achievementLevel).toBe('proficient');
      expect(completionResult.data.achievements.certificationProgress).toBe('on-track');

      logger.info('✅ Enhanced completion workflow completed successfully');
    });

    test('should handle completion validation failures', async () => {
      const invalidCompletionData = {
        enrollmentId: enrollmentData.data.enrollmentId,
        finalScore: 45, // Below passing threshold
        performanceMetrics: {
          engagementLevel: 'low',
          completionRate: 60,
        },
      };

      // Should validate completion criteria
      await expect(
        integrationService.processCourseCompletion(
          testUser.id,
          testCourse.id,
          invalidCompletionData,
        ),
      ).rejects.toThrow(/completion validation failed/i);
    });

    test('should update certification milestones correctly', async () => {
      const completionData = {
        enrollmentId: enrollmentData.data.enrollmentId,
        finalScore: 92,
        competencies: ['plant_cultivation', 'quality_control'],
        achievementLevel: 'advanced',
      };

      const completionResult = await integrationService.processCourseCompletion(
        testUser.id,
        testCourse.id,
        completionData,
      );

      // Verify certification system received milestone update
      const certificationData = completionResult.data.certification;
      expect(certificationData.milestonesAchieved).toContain('plant_cultivation_proficient');
      expect(certificationData.milestonesAchieved).toContain('quality_control_proficient');
      expect(certificationData.progressPercentage).toBeGreaterThan(50);
    });
  });

  // ============================================================================
  // LEARNER DASHBOARD INTEGRATION TESTS
  // ============================================================================

  describe('Enhanced Learner Dashboard Integration', () => {
    beforeEach(async () => {
      // Setup enrollment and some course progress
      await integrationService.enrollLearnerInCourse(testUser.id, testCourse.id);

      // Simulate some learning activity
      await mockServices.trainingService.simulateLearningActivity(testUser.id, testCourse.id);
    });

    test('should build comprehensive learner dashboard', async () => {
      logger.info('🎯 Testing enhanced learner dashboard');

      const dashboardResult = await integrationService.getEnhancedLearnerDashboard(testUser.id, {
        timeframe: '30d',
        includeAnalytics: true,
        includePredictions: true,
      });

      // Validate core dashboard success
      expect(dashboardResult.success).toBe(true);
      expect(dashboardResult.data.operationId).toBeDefined();
      expect(dashboardResult.data.lastUpdated).toBeDefined();

      // Validate analytics insights
      expect(dashboardResult.data.analytics).toBeDefined();
      expect(dashboardResult.data.analytics.learningMetrics).toBeDefined();
      expect(dashboardResult.data.analytics.predictionsModel).toBeDefined();
      expect(dashboardResult.data.analytics.interventionRisk).toBeDefined();

      // Validate certification status
      expect(dashboardResult.data.certification).toBeDefined();
      expect(dashboardResult.data.certification.overallProgress).toBeDefined();
      expect(dashboardResult.data.certification.activeCertifications).toBeDefined();
      expect(dashboardResult.data.certification.renewalSchedule).toBeDefined();

      // Validate performance summary
      expect(dashboardResult.data.performance).toBeDefined();
      expect(dashboardResult.data.performance.competencyMatrix).toBeDefined();
      expect(dashboardResult.data.performance.performanceTrends).toBeDefined();
      expect(dashboardResult.data.performance.strengthsWeaknesses).toBeDefined();

      // Validate personalized recommendations
      expect(dashboardResult.data.recommendations).toBeDefined();
      expect(dashboardResult.data.recommendations.nextCourses).toBeDefined();
      expect(dashboardResult.data.recommendations.skillGaps).toBeDefined();

      // Validate performance
      expect(dashboardResult.data.processingTime).toBeLessThan(3000); // Should load within 3 seconds

      logger.info('✅ Enhanced learner dashboard built successfully');
    });

    test('should cache dashboard data for performance', async () => {
      // First request
      const firstRequest = await integrationService.getEnhancedLearnerDashboard(testUser.id);

      // Second request (should be cached)
      const secondRequest = await integrationService.getEnhancedLearnerDashboard(testUser.id);

      // Verify caching occurred
      const cacheKey = `learner_dashboard:${testUser.id}`;
      const cachedData = mockServices.cacheService.get(cacheKey);

      expect(cachedData).toBeDefined();
      expect(secondRequest.data.operationId).toBe(firstRequest.data.operationId);
    });

    test('should handle partial service failures gracefully', async () => {
      // Mock certification service failure
      mockServices.certificationService.mockServiceFailure();

      const dashboardResult = await integrationService.getEnhancedLearnerDashboard(testUser.id);

      // Should still succeed with available data
      expect(dashboardResult.success).toBe(true);

      // Analytics and performance should work
      expect(dashboardResult.data.analytics.learningMetrics).toBeDefined();
      expect(dashboardResult.data.performance.competencyMatrix).toBeDefined();

      // Certification should show error
      expect(dashboardResult.data.certification.error).toBeDefined();
      expect(dashboardResult.data.certification.status).toBe('failed');
    });
  });

  // ============================================================================
  // ANALYTICS SYSTEM INTEGRATION TESTS
  // ============================================================================

  describe('Advanced Analytics System Integration', () => {
    test('should generate learner predictions accurately', async () => {
      // Setup learning history
      await setupLearnerHistory(testUser.id);

      const predictions = await analyticsSystem.generateLearnerPredictions(
        testUser.id,
        testCourse.id,
        {
          includeInterventions: true,
          includeTrends: true,
        },
      );

      expect(predictions.successProbability).toBeGreaterThan(0);
      expect(predictions.successProbability).toBeLessThanOrEqual(1);
      expect(predictions.dropoutRisk).toBeDefined();
      expect(predictions.estimatedCompletionDate).toBeDefined();
      expect(predictions.recommendedInterventions).toBeDefined();
    });

    test('should trigger interventions based on risk analysis', async () => {
      // Setup at-risk scenario
      await mockServices.trainingService.simulateAtRiskBehavior(testUser.id, testCourse.id);

      const riskAnalysis = await analyticsSystem.analyzeDropoutRisk(testUser.id, testCourse.id);

      expect(riskAnalysis.riskLevel).toMatch(/medium|high|critical/i);
      expect(riskAnalysis.interventionTriggered).toBe(true);
      expect(riskAnalysis.recommendedActions).toHaveLength(1);

      // Verify intervention was created
      const interventions = mockServices.interventionService.getActiveInterventions(testUser.id);
      expect(interventions).toHaveLength(1);
      expect(interventions[0].type).toBe('DROPOUT_PREVENTION');
    });

    test('should generate real-time learning analytics', async () => {
      // Simulate active learning session
      await mockServices.trainingService.startLearningSession(testUser.id, testCourse.id);

      const realTimeMetrics = await analyticsSystem.getRealTimeLearningMetrics(testUser.id);

      expect(realTimeMetrics.currentEngagementLevel).toBeDefined();
      expect(realTimeMetrics.sessionDuration).toBeGreaterThan(0);
      expect(realTimeMetrics.comprehensionScore).toBeDefined();
      expect(realTimeMetrics.alertTriggers).toBeDefined();
    });
  });

  // ============================================================================
  // CERTIFICATION TRACKING INTEGRATION TESTS
  // ============================================================================

  describe('Certification Tracking System Integration', () => {
    test('should track certification progress accurately', async () => {
      // Complete some certification milestones
      await completeCertificationMilestones(testUser.id, testCourse.id);

      const certificationStatus = await certificationSystem.getLearnerCertificationStatus(
        testUser.id,
        {
          includeProgress: true,
          includeCompliance: true,
        },
      );

      expect(certificationStatus.overallProgress).toBeGreaterThan(0);
      expect(certificationStatus.activeCertifications).toHaveLength(1);
      expect(certificationStatus.completedMilestones).toHaveLength(2);
      expect(certificationStatus.complianceStatus).toBe('COMPLIANT');
    });

    test('should handle government integration compliance', async () => {
      const complianceReport = await certificationSystem.generateGovernmentComplianceReport(
        testUser.id,
      );

      expect(complianceReport.complianceStatus).toBe('COMPLIANT');
      expect(complianceReport.certifications).toBeDefined();
      expect(complianceReport.qualityAssurance).toBeDefined();
      expect(complianceReport.reportId).toBeDefined();
    });

    test('should manage certification renewals', async () => {
      // Setup certification with upcoming renewal
      await setupCertificationWithRenewal(testUser.id);

      const renewalSchedule = await certificationSystem.getRenewalSchedule(testUser.id);

      expect(renewalSchedule.upcomingRenewals).toHaveLength(1);
      expect(renewalSchedule.upcomingRenewals[0].dueDate).toBeDefined();
      expect(renewalSchedule.upcomingRenewals[0].requirements).toBeDefined();
    });
  });

  // ============================================================================
  // PERFORMANCE ASSESSMENT INTEGRATION TESTS
  // ============================================================================

  describe('Performance Assessment System Integration', () => {
    test('should create adaptive assessments', async () => {
      const assessmentConfig = {
        competencyId: 'plant_cultivation',
        assessmentType: 'ADAPTIVE',
        adaptiveAlgorithm: 'CAT_STANDARD',
      };

      const assessment = await performanceSystem.createPerformanceAssessment(
        testUser.id,
        assessmentConfig,
      );

      expect(assessment.assessmentId).toBeDefined();
      expect(assessment.adaptiveEngine).toBeDefined();
      expect(assessment.initialDifficulty).toBeDefined();
      expect(assessment.estimatedItems).toBeGreaterThan(0);
    });

    test('should process assessment responses with adaptive algorithms', async () => {
      // Create assessment first
      const assessment = await performanceSystem.createPerformanceAssessment(testUser.id, {
        competencyId: 'quality_control',
      });

      // Submit responses
      const responses = await submitTestResponses(assessment.assessmentId, testUser.id);

      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response.score).toBeDefined();
        expect(response.abilityEstimate).toBeDefined();
        expect(response.nextItemDifficulty).toBeDefined();
      });
    });

    test('should generate competency evaluations', async () => {
      // Complete assessment
      const assessment = await completeAssessment(testUser.id, 'plant_cultivation');

      const competencyEval = await performanceSystem.generateCompetencyEvaluation(
        testUser.id,
        'plant_cultivation',
      );

      expect(competencyEval.competencyLevel).toMatch(
        /novice|developing|proficient|advanced|expert/,
      );
      expect(competencyEval.strengths).toBeDefined();
      expect(competencyEval.improvementAreas).toBeDefined();
      expect(competencyEval.nextSteps).toBeDefined();
    });
  });

  // ============================================================================
  // API INTEGRATION TESTS
  // ============================================================================

  describe('Enhanced Training API Integration', () => {
    let authToken;

    beforeEach(async () => {
      // Get authentication token
      authToken = await getAuthToken(testUser);
    });

    test('should provide enhanced course enrollment endpoint', async () => {
      const response = await request(testApp)
        .post('/api/farmer/training/courses/enroll')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId: testCourse.id,
          enrollmentType: 'certification_track',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollmentId).toBeDefined();
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.certification).toBeDefined();
      expect(response.body.data.performance).toBeDefined();
    });

    test('should provide analytics dashboard endpoint', async () => {
      const response = await request(testApp)
        .get('/api/farmer/training/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.learningMetrics).toBeDefined();
      expect(response.body.data.predictions).toBeDefined();
      expect(response.body.data.recommendations).toBeDefined();
    });

    test('should provide certification progress endpoint', async () => {
      const response = await request(testApp)
        .get('/api/farmer/training/certification/my-progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overallProgress).toBeDefined();
      expect(response.body.data.activeCertifications).toBeDefined();
    });
  });

  // ============================================================================
  // PERFORMANCE AND STRESS TESTS
  // ============================================================================

  describe('Performance and Stress Tests', () => {
    test('should handle concurrent enrollments efficiently', async () => {
      const concurrentEnrollments = 10;
      const promises = [];

      for (let i = 0; i < concurrentEnrollments; i++) {
        const user = await TestDataFactory.createUser({ role: 'farmer' });
        promises.push(integrationService.enrollLearnerInCourse(user.id, testCourse.id));
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All enrollments should succeed
      expect(results).toHaveLength(concurrentEnrollments);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should complete within reasonable time (< 10 seconds)
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(10000);

      logger.info(`✅ ${concurrentEnrollments} concurrent enrollments completed in ${totalTime}ms`)
    });

    test('should maintain performance under load', async () => {
      const operationCount = 50;
      const operations = [];

      for (let i = 0; i < operationCount; i++) {
        operations.push(integrationService.getEnhancedLearnerDashboard(testUser.id));
      }

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();

      const averageTime = (endTime - startTime) / operationCount;

      // All operations should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Average response time should be reasonable (< 500ms)
      expect(averageTime).toBeLessThan(500);

      logger.info(`✅ ${operationCount} dashboard requests averaged ${averageTime}ms`)
    });
  });

  // ============================================================================
  // ERROR HANDLING AND RESILIENCE TESTS
  // ============================================================================

  describe('Error Handling and Resilience Tests', () => {
    test('should handle database connection failures', async () => {
      // Simulate database disconnection
      await mongoose.disconnect();

      try {
        const result = await integrationService.enrollLearnerInCourse(testUser.id, testCourse.id);

        // Should handle gracefully (might succeed with cached data or fail appropriately)
        if (result.success) {
          expect(result.data.analytics.status).toBe('degraded');
        }
      } catch (error) {
        expect(error.message).toMatch(/database|connection/i);
      }

      // Reconnect for other tests
      await testDb.connect();
    });

    test('should respect circuit breaker patterns', async () => {
      // Cause multiple failures to trigger circuit breaker
      mockServices.analyticsService.mockContinuousFailures(6);

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(integrationService.enrollLearnerInCourse(testUser.id, testCourse.id));
      }

      const results = await Promise.allSettled(promises);

      // Some should fail due to circuit breaker
      const failures = results.filter(r => r.status === 'rejected');
      expect(failures.length).toBeGreaterThan(0);

      // Circuit breaker should be activated
      const healthStatus = await integrationService.getSystemHealth();
      expect(healthStatus.data.circuitBreakers.analytics.isOpen).toBe(true);
    });

    test('should maintain data consistency during partial failures', async () => {
      // Mock certification service failure during enrollment
      mockServices.certificationService.mockServiceFailure();

      const enrollmentResult = await integrationService.enrollLearnerInCourse(
        testUser.id,
        testCourse.id,
      );

      expect(enrollmentResult.success).toBe(true);

      // Core enrollment should succeed
      expect(enrollmentResult.data.enrollmentId).toBeDefined();

      // Analytics should work
      expect(enrollmentResult.data.analytics.trackingId).toBeDefined();

      // Performance should work
      expect(enrollmentResult.data.performance.profileId).toBeDefined();

      // Certification should show failure but not break overall process
      expect(enrollmentResult.data.certification.error).toBeDefined();

      // Audit trail should record the partial failure
      const auditRecords = mockServices.auditService.getRecords();
      const enrollmentAudit = auditRecords.find(r => r.action === 'COURSE_ENROLLMENT');
      expect(enrollmentAudit.data.integrationResults[1].success).toBe(false); // Certification failed
    });
  });

  // ============================================================================
  // HELPER FUNCTIONS FOR TESTS
  // ============================================================================

  async function initializeEnhancedTrainingSystems() {
    // Initialize analytics system
    analyticsSystem = new AdvancedTrainingAnalyticsSystem({
      trainingService: mockServices.trainingService,
      assessmentService: mockServices.assessmentService,
      notificationService: mockServices.notificationService,
      auditService: mockServices.auditService,
      mlPlatform: mockServices.mlPlatform,
      logger: mockServices.logger,
    });

    // Initialize certification system
    certificationSystem = new CertificationTrackingIntegrationSystem({
      trainingService: mockServices.trainingService,
      assessmentService: mockServices.assessmentService,
      governmentIntegration: mockServices.governmentIntegration,
      notificationService: mockServices.notificationService,
      auditService: mockServices.auditService,
      logger: mockServices.logger,
    });

    // Initialize performance system
    performanceSystem = new PerformanceAssessmentToolsSystem({
      trainingService: mockServices.trainingService,
      analyticsService: mockServices.analyticsService,
      certificationService: mockServices.certificationService,
      notificationService: mockServices.notificationService,
      logger: mockServices.logger,
    });

    // Initialize integration service
    integrationService = new EnhancedTrainingServiceIntegration({
      originalTrainingService: mockServices.trainingService,
      advancedAnalyticsSystem: analyticsSystem,
      certificationTrackingSystem: certificationSystem,
      performanceAssessmentSystem: performanceSystem,
      auditService: mockServices.auditService,
      notificationService: mockServices.notificationService,
      cacheService: mockServices.cacheService,
      logger: mockServices.logger,
    });

    // Initialize enhanced controller
    enhancedController = new EnhancedTrainingController({
      enhancedTrainingService: integrationService,
      analyticsSystem: analyticsSystem,
      certificationSystem: certificationSystem,
      performanceSystem: performanceSystem,
      auditService: mockServices.auditService,
      logger: mockServices.logger,
    });
  }

  async function createTestApplication() {
    const express = require('express');
    const app = express();

    app.use(express.json());

    // Setup enhanced training routes
    const {
      createEnhancedTrainingRoutes,
    } = require('../presentation/routes/enhanced-training.routes');
    const routes = createEnhancedTrainingRoutes(enhancedController, mockServices.authMiddleware);

    app.use('/api/farmer/training', routes.farmerRouter);
    app.use('/api/dtam/training', routes.dtamRouter);

    return app;
  }

  async function setupLearnerHistory(userId) {
    // Create learning activity history for predictions
    await mockServices.trainingService.createLearningHistory(userId, {
      coursesCompleted: 2,
      averageScore: 85,
      engagementLevel: 'high',
      timeSpent: 120, // hours
    });
  }

  async function completeCertificationMilestones(userId, courseId) {
    await mockServices.certificationService.completeMilestone(userId, 'basic_knowledge');
    await mockServices.certificationService.completeMilestone(userId, 'practical_skills');
  }

  async function setupCertificationWithRenewal(userId) {
    await mockServices.certificationService.createCertification(userId, {
      type: 'basic_cultivation',
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      renewalRequired: true,
    });
  }

  async function submitTestResponses(assessmentId, userId) {
    const responses = [];

    for (let i = 0; i < 3; i++) {
      const response = await performanceSystem.submitAssessmentResponse(assessmentId, {
        userId: userId,
        itemId: `item_${i}`,
        response: i % 2 === 0 ? 'correct' : 'incorrect',
        responseTime: 30000 + Math.random() * 60000,
      });
      responses.push(response);
    }

    return responses;
  }

  async function completeAssessment(userId, competencyId) {
    const assessment = await performanceSystem.createPerformanceAssessment(userId, {
      competencyId,
    });
    await submitTestResponses(assessment.assessmentId, userId);
    return assessment;
  }

  async function getAuthToken(user) {
    return mockServices.authService.generateToken(user);
  }
});

/**
 * Test Results Summary and Business Logic Validation
 *
 * Expected Test Results:
 * ✅ Service Integration: All enhanced services initialize and integrate correctly
 * ✅ Enrollment Workflow: Complete enrollment with analytics, certification, and performance tracking
 * ✅ Completion Workflow: Comprehensive completion processing with multi-system updates
 * ✅ Learner Dashboard: Unified dashboard with real-time insights and recommendations
 * ✅ Analytics Integration: Predictive analytics, risk analysis, and intervention triggers
 * ✅ Certification Tracking: Progress monitoring, government compliance, and renewal management
 * ✅ Performance Assessment: Adaptive assessments, competency evaluation, and feedback
 * ✅ API Integration: RESTful endpoints with proper authentication and response formats
 * ✅ Performance: Concurrent operations, load handling, and response time optimization
 * ✅ Resilience: Circuit breakers, error handling, and data consistency during failures
 *
 * Business Logic Validation:
 * - Training workflows maintain audit trails and compliance requirements
 * - Analytics provide actionable insights with predictive capabilities
 * - Certification tracking ensures government compliance and quality assurance
 * - Performance assessments adapt to learner capabilities and provide meaningful feedback
 * - Error scenarios are handled gracefully without data loss or inconsistency
 * - System performance scales appropriately under concurrent load
 *
 * This comprehensive test suite validates that the enhanced Training Module
 * successfully integrates advanced analytics, certification tracking, and
 * performance assessment capabilities while maintaining system reliability,
 * performance, and business logic compliance.
 */

module.exports = {
  // Export for potential reuse in other test suites
  initializeTestEnvironment: async () => {
    const testDb = new TestDatabase();
    await testDb.connect();

    const mockServices = new MockServices();
    await mockServices.initialize();

    return { testDb, mockServices };
  },
};
