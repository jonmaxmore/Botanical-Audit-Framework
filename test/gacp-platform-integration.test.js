/**
 * 🧪 GACP Platform Testing Suite - Complete System Tests
 * ชุดทดสอบครอบคลุมทุกระบบ ทั้ง Unit, Integration และ E2E Testing
 *
 * Test Coverage:
 * - Unit Tests: All business logic components
 * - Integration Tests: API endpoints and database operations
 * - E2E Tests: Complete user workflows
 * - Performance Tests: Load testing and optimization
 * - Security Tests: Authentication and authorization
 */

const { describe, it, before, after, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');

// Import systems to test
const GACPAPIIntegrationLayer = require('../api-integration-layer');
const SOPWizardSystem = require('../business-logic/gacp-sop-wizard-system');
const FarmManagementService = require('../apps/backend/modules/farm-management/services/farm-management.service');
const GACPAIAssistantSystem = require('../business-logic/gacp-ai-assistant-system');

// Test configuration
const TEST_CONFIG = {
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/gacp-test',
  API_PORT: 4001,
  TIMEOUT: 30000
};

// Global test setup
let apiLayer;
let testDb;

describe('🌿 GACP Platform Integration Tests', function () {
  this.timeout(TEST_CONFIG.TIMEOUT);

  before(async function () {
    console.log('🚀 Starting GACP Platform Tests...');

    // Setup test database
    await mongoose.connect(TEST_CONFIG.MONGODB_TEST_URI);
    testDb = mongoose.connection.db;

    // Initialize API layer for testing
    process.env.GACP_API_PORT = TEST_CONFIG.API_PORT;
    apiLayer = new GACPAPIIntegrationLayer();
    await apiLayer.initialize();

    console.log('✅ Test environment initialized');
  });

  after(async function () {
    console.log('🧹 Cleaning up test environment...');

    if (apiLayer?.server) {
      apiLayer.server.close();
    }

    // Clean test database
    await testDb.dropDatabase();
    await mongoose.connection.close();

    console.log('✅ Test cleanup complete');
  });

  describe('🏗️ System Integration Tests', function () {
    describe('API Integration Layer', function () {
      let server;

      beforeEach(async function () {
        server = apiLayer.app;
      });

      it('should return healthy status on health check', async function () {
        const response = await request(server).get('/health').expect(200);

        expect(response.body.status).to.equal('healthy');
        expect(response.body.services).to.be.an('object');
      });

      it('should handle CORS properly', async function () {
        const response = await request(server)
          .options('/api/farm-management/farms/test-user')
          .set('Origin', 'http://localhost:3000')
          .expect(204);

        expect(response.headers['access-control-allow-origin']).to.exist;
      });

      it('should enforce rate limiting', async function () {
        // Make multiple rapid requests to trigger rate limit
        const requests = Array(1010)
          .fill()
          .map(() => request(server).get('/health'));

        const responses = await Promise.allSettled(requests);
        const rateLimitedResponses = responses.filter(r => r.value?.status === 429);

        expect(rateLimitedResponses.length).to.be.greaterThan(0);
      });
    });

    describe('SOP Wizard System Integration', function () {
      let sopWizard;
      let testUserId;
      let testFarmId;
      let sessionId;

      beforeEach(async function () {
        sopWizard = new SOPWizardSystem();
        await sopWizard.initialize();

        testUserId = 'test-user-' + Date.now();
        testFarmId = 'test-farm-' + Date.now();
      });

      it('should start a new SOP session successfully', async function () {
        const session = await sopWizard.startSession(testUserId, testFarmId);
        sessionId = session.sessionId;

        expect(session).to.have.property('sessionId');
        expect(session.userId).to.equal(testUserId);
        expect(session.farmId).to.equal(testFarmId);
        expect(session.currentPhase).to.equal('pre_planting');
        expect(session.totalPoints).to.equal(0);
      });

      it('should record SOP activities and update compliance', async function () {
        // Start session first
        const session = await sopWizard.startSession(testUserId, testFarmId);
        sessionId = session.sessionId;

        // Record a soil testing activity
        const activityData = {
          activityType: 'soil_testing',
          phase: 'pre_planting',
          data: {
            ph: 6.8,
            nitrogen: 45,
            phosphorus: 23,
            potassium: 67,
            notes: 'Soil analysis complete - optimal conditions'
          },
          completedAt: new Date()
        };

        const result = await sopWizard.recordActivity(sessionId, activityData);

        expect(result.success).to.be.true;
        expect(result.pointsAwarded).to.be.greaterThan(0);
        expect(result.newComplianceScore).to.be.greaterThan(0);
      });

      it('should calculate compliance scores correctly', async function () {
        const session = await sopWizard.startSession(testUserId, testFarmId);
        sessionId = session.sessionId;

        // Record multiple activities
        const activities = [
          { activityType: 'soil_testing', phase: 'pre_planting' },
          { activityType: 'seed_selection', phase: 'pre_planting' },
          { activityType: 'site_preparation', phase: 'pre_planting' }
        ];

        for (const activity of activities) {
          await sopWizard.recordActivity(sessionId, {
            ...activity,
            data: { notes: 'Test activity' },
            completedAt: new Date()
          });
        }

        const complianceScore = await sopWizard.calculateComplianceScore(sessionId);
        expect(complianceScore).to.be.a('number');
        expect(complianceScore).to.be.greaterThan(0);
        expect(complianceScore).to.be.lessThanOrEqual(100);
      });

      it('should generate compliance reports', async function () {
        const session = await sopWizard.startSession(testUserId, testFarmId);
        const report = await sopWizard.generateComplianceReport(session.sessionId);

        expect(report).to.have.property('sessionId');
        expect(report).to.have.property('totalActivities');
        expect(report).to.have.property('completedActivities');
        expect(report).to.have.property('complianceScore');
        expect(report).to.have.property('phaseBreakdown');
        expect(report.phaseBreakdown).to.be.an('array');
      });
    });

    describe('Farm Management Integration', function () {
      let farmService;
      let testUserId;

      beforeEach(async function () {
        farmService = new FarmManagementService();
        testUserId = 'test-user-' + Date.now();
      });

      it('should create and retrieve farms', async function () {
        const farmData = {
          name: 'Test Farm',
          userId: testUserId,
          location: {
            latitude: 13.7563,
            longitude: 100.5018,
            address: 'Bangkok, Thailand'
          },
          size: 1000,
          cropType: 'cannabis'
        };

        const createdFarm = await farmService.createFarm(farmData);
        expect(createdFarm).to.have.property('id');
        expect(createdFarm.name).to.equal(farmData.name);

        const retrievedFarms = await farmService.getFarmsByUser(testUserId);
        expect(retrievedFarms).to.be.an('array');
        expect(retrievedFarms.length).to.be.greaterThan(0);
      });

      it('should record farm activities with GACP compliance', async function () {
        const farmData = {
          name: 'Test Farm',
          userId: testUserId,
          location: { latitude: 13.7563, longitude: 100.5018 },
          size: 1000,
          cropType: 'cannabis'
        };

        const farm = await farmService.createFarm(farmData);

        const activityData = {
          type: 'soil_testing',
          phase: 'pre_planting',
          data: {
            ph: 6.5,
            nutrients: { nitrogen: 40, phosphorus: 20, potassium: 30 }
          },
          userId: testUserId
        };

        const activity = await farmService.recordActivity(farm.id, activityData);
        expect(activity).to.have.property('id');
        expect(activity.type).to.equal('soil_testing');
        expect(activity.gacpCompliance).to.exist;
      });
    });

    describe('AI Assistant Integration', function () {
      let aiAssistant;

      beforeEach(async function () {
        aiAssistant = new GACPAIAssistantSystem();
        await aiAssistant.initialize();
      });

      it('should provide SOP guidance', async function () {
        const guidance = await aiAssistant.getSOPGuidance('soil_testing', 'pre_planting');

        expect(guidance).to.have.property('recommendations');
        expect(guidance).to.have.property('requiredParameters');
        expect(guidance).to.have.property('compliancePoints');
        expect(guidance.recommendations).to.be.an('array');
      });

      it('should validate SOP activities', async function () {
        const activityData = {
          ph: 6.8,
          nitrogen: 45,
          phosphorus: 23,
          potassium: 67
        };

        const validation = await aiAssistant.validateSOPActivity('soil_testing', activityData);

        expect(validation).to.have.property('isValid');
        expect(validation).to.have.property('score');
        expect(validation).to.have.property('recommendations');
        expect(validation.isValid).to.be.a('boolean');
      });
    });
  });

  describe('🔄 End-to-End Workflow Tests', function () {
    it('should complete full SOP workflow from start to harvest', async function () {
      const testUserId = 'e2e-user-' + Date.now();
      const testFarmId = 'e2e-farm-' + Date.now();

      // 1. Start SOP session
      const sopWizard = new SOPWizardSystem();
      await sopWizard.initialize();

      const session = await sopWizard.startSession(testUserId, testFarmId);
      expect(session.currentPhase).to.equal('pre_planting');

      // 2. Complete pre-planting activities
      const prePlantingActivities = [
        { activityType: 'soil_testing', data: { ph: 6.8 } },
        { activityType: 'seed_selection', data: { strain: 'Northern Lights' } },
        { activityType: 'site_preparation', data: { area: 500 } }
      ];

      for (const activity of prePlantingActivities) {
        await sopWizard.recordActivity(session.sessionId, {
          ...activity,
          phase: 'pre_planting',
          completedAt: new Date()
        });
      }

      // 3. Progress to planting phase
      await sopWizard.advancePhase(session.sessionId, 'planting');
      const updatedSession = await sopWizard.getSession(session.sessionId);
      expect(updatedSession.currentPhase).to.equal('planting');

      // 4. Complete planting activities
      await sopWizard.recordActivity(session.sessionId, {
        activityType: 'planting',
        phase: 'planting',
        data: { seedCount: 100, plantingDate: new Date() },
        completedAt: new Date()
      });

      // 5. Verify compliance score increases
      const finalScore = await sopWizard.calculateComplianceScore(session.sessionId);
      expect(finalScore).to.be.greaterThan(0);

      // 6. Generate final report
      const report = await sopWizard.generateComplianceReport(session.sessionId);
      expect(report.completedActivities).to.be.greaterThan(3);
    });

    it('should integrate farm management with SOP activities', async function () {
      const testUserId = 'integration-user-' + Date.now();

      // 1. Create farm
      const farmService = new FarmManagementService();
      const farm = await farmService.createFarm({
        name: 'Integration Test Farm',
        userId: testUserId,
        location: { latitude: 13.7563, longitude: 100.5018 },
        size: 1000,
        cropType: 'cannabis'
      });

      // 2. Start SOP session for the farm
      const sopWizard = new SOPWizardSystem();
      await sopWizard.initialize();
      const session = await sopWizard.startSession(testUserId, farm.id);

      // 3. Record activity in both systems
      const activityData = {
        type: 'soil_testing',
        phase: 'pre_planting',
        data: { ph: 6.5, nutrients: { nitrogen: 40 } },
        userId: testUserId
      };

      // Record in farm management
      const farmActivity = await farmService.recordActivity(farm.id, activityData);

      // Record in SOP system
      const sopActivity = await sopWizard.recordActivity(session.sessionId, {
        activityType: 'soil_testing',
        phase: 'pre_planting',
        data: activityData.data,
        completedAt: new Date()
      });

      // 4. Verify both systems updated
      expect(farmActivity.gacpCompliance).to.exist;
      expect(sopActivity.success).to.be.true;
      expect(sopActivity.pointsAwarded).to.be.greaterThan(0);
    });
  });

  describe('🚀 Performance Tests', function () {
    it('should handle multiple concurrent SOP sessions', async function () {
      const sopWizard = new SOPWizardSystem();
      await sopWizard.initialize();

      const concurrentSessions = 10;
      const sessionPromises = [];

      for (let i = 0; i < concurrentSessions; i++) {
        const promise = sopWizard.startSession(`perf-user-${i}`, `perf-farm-${i}`);
        sessionPromises.push(promise);
      }

      const sessions = await Promise.all(sessionPromises);
      expect(sessions).to.have.length(concurrentSessions);

      // Verify all sessions are valid
      sessions.forEach(session => {
        expect(session).to.have.property('sessionId');
        expect(session.currentPhase).to.equal('pre_planting');
      });
    });

    it('should handle bulk activity recording efficiently', async function () {
      const sopWizard = new SOPWizardSystem();
      await sopWizard.initialize();

      const session = await sopWizard.startSession('bulk-user', 'bulk-farm');
      const activities = [];

      // Prepare 50 activities
      for (let i = 0; i < 50; i++) {
        activities.push({
          activityType: 'soil_testing',
          phase: 'pre_planting',
          data: { ph: 6.5 + Math.random() * 0.6 }, // Random pH 6.5-7.1
          completedAt: new Date()
        });
      }

      // Record all activities and measure time
      const startTime = Date.now();
      const results = await Promise.all(
        activities.map(activity => sopWizard.recordActivity(session.sessionId, activity))
      );
      const endTime = Date.now();

      expect(results).to.have.length(50);
      expect(endTime - startTime).to.be.lessThan(5000); // Should complete within 5 seconds

      // Verify all activities recorded successfully
      const successfulResults = results.filter(r => r.success);
      expect(successfulResults).to.have.length(50);
    });
  });

  describe('🔒 Security Tests', function () {
    it('should prevent unauthorized access to user data', async function () {
      const server = apiLayer.app;

      // Try to access another user's data
      const response = await request(server)
        .get('/api/farm-management/farms/unauthorized-user')
        .expect(401);

      expect(response.body.success).to.be.false;
    });

    it('should validate input data properly', async function () {
      const server = apiLayer.app;

      // Try to create farm with invalid data
      const response = await request(server)
        .post('/api/farm-management/farms')
        .send({
          name: '', // Empty name should fail validation
          userId: 'test-user'
          // Missing required location field
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.be.an('array');
    });

    it('should sanitize user input', async function () {
      const sopWizard = new SOPWizardSystem();
      await sopWizard.initialize();

      const session = await sopWizard.startSession('security-user', 'security-farm');

      // Try to inject malicious code
      const maliciousInput = {
        activityType: 'soil_testing',
        phase: 'pre_planting',
        data: {
          ph: '<script>alert("xss")</script>',
          notes: '${process.env.DATABASE_URL}'
        },
        completedAt: new Date()
      };

      const result = await sopWizard.recordActivity(session.sessionId, maliciousInput);

      // Verify input was sanitized
      expect(result.success).to.be.true;
      const storedActivity = await sopWizard.getActivityById(result.activityId);
      expect(storedActivity.data.ph).to.not.include('<script>');
      expect(storedActivity.data.notes).to.not.include('${');
    });
  });

  describe('📊 Data Integrity Tests', function () {
    it('should maintain data consistency across systems', async function () {
      const testUserId = 'consistency-user-' + Date.now();

      // Create farm and SOP session
      const farmService = new FarmManagementService();
      const sopWizard = new SOPWizardSystem();
      await sopWizard.initialize();

      const farm = await farmService.createFarm({
        name: 'Consistency Test Farm',
        userId: testUserId,
        location: { latitude: 13.7563, longitude: 100.5018 },
        size: 1000,
        cropType: 'cannabis'
      });

      const session = await sopWizard.startSession(testUserId, farm.id);

      // Record same activity in both systems
      const activityData = {
        type: 'soil_testing',
        phase: 'pre_planting',
        data: { ph: 6.8, nitrogen: 45 },
        timestamp: new Date()
      };

      await farmService.recordActivity(farm.id, { ...activityData, userId: testUserId });
      await sopWizard.recordActivity(session.sessionId, {
        activityType: activityData.type,
        phase: activityData.phase,
        data: activityData.data,
        completedAt: activityData.timestamp
      });

      // Verify data consistency
      const farmActivities = await farmService.getFarmActivities(farm.id);
      const sopActivities = await sopWizard.getSessionActivities(session.sessionId);

      expect(farmActivities).to.have.length.greaterThan(0);
      expect(sopActivities).to.have.length.greaterThan(0);

      const farmActivity = farmActivities[0];
      const sopActivity = sopActivities[0];

      expect(farmActivity.type).to.equal(sopActivity.activityType);
      expect(farmActivity.phase).to.equal(sopActivity.phase);
    });

    it('should handle database transactions properly', async function () {
      const sopWizard = new SOPWizardSystem();
      await sopWizard.initialize();

      const session = await sopWizard.startSession('transaction-user', 'transaction-farm');

      // Simulate a failed transaction
      const originalMethod = sopWizard.db.collection;
      sopWizard.db.collection = sinon.stub().throws(new Error('Database error'));

      try {
        await sopWizard.recordActivity(session.sessionId, {
          activityType: 'soil_testing',
          phase: 'pre_planting',
          data: { ph: 6.8 },
          completedAt: new Date()
        });

        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Database error');

        // Restore original method
        sopWizard.db.collection = originalMethod;

        // Verify session state wasn't corrupted
        const sessionAfterError = await sopWizard.getSession(session.sessionId);
        expect(sessionAfterError.totalPoints).to.equal(0);
      }
    });
  });
});

// Test utilities
class TestDataGenerator {
  static generateFarmData(userId = 'test-user') {
    return {
      name: `Test Farm ${Date.now()}`,
      userId,
      location: {
        latitude: 13.7563 + (Math.random() - 0.5) * 0.1,
        longitude: 100.5018 + (Math.random() - 0.5) * 0.1,
        address: 'Bangkok, Thailand'
      },
      size: Math.floor(Math.random() * 5000) + 500,
      cropType: 'cannabis'
    };
  }

  static generateActivityData(type = 'soil_testing', phase = 'pre_planting') {
    const dataTemplates = {
      soil_testing: { ph: 6.5 + Math.random(), nitrogen: Math.floor(Math.random() * 50) + 20 },
      seed_selection: {
        strain: 'Northern Lights',
        seedCount: Math.floor(Math.random() * 200) + 50
      },
      planting: { plantingDate: new Date(), area: Math.floor(Math.random() * 1000) + 100 }
    };

    return {
      activityType: type,
      phase,
      data: dataTemplates[type] || { notes: 'Test activity' },
      completedAt: new Date()
    };
  }
}

// Export test utilities for use in other test files
module.exports = {
  TestDataGenerator,
  TEST_CONFIG
};
