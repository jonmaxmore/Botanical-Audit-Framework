/**
 * GACP Platform Comprehensive Test Suite
 * Integration tests for all API endpoints and services
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 */

const request = require('supertest');
const mongoose = require('mongoose');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3004',
  timeout: 30000,
  endpoints: {
    health: '/api/monitoring/health',
    gacpWorkflow: '/api/gacp/workflow',
    gacpCCPs: '/api/gacp/ccps',
    gacpScoreTest: '/api/gacp/test/score-calculation',
    gacpCompliance: '/api/gacp/compliance',
    apiDocs: '/api/docs/docs',
    monitoring: '/api/monitoring/status',
  },
};

class GACPTestSuite {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      details: [],
    };
    this.startTime = null;
  }

  /**
   * Run complete test suite
   */
  async runAllTests() {
    console.log('🧪 Starting GACP Platform Comprehensive Test Suite...');
    console.log('='.repeat(60));

    this.startTime = Date.now();

    try {
      // Health and monitoring tests
      await this.testHealthEndpoints();

      // GACP API tests
      await this.testGACPWorkflowAPI();
      await this.testGACPCCPsAPI();
      await this.testGACPScoreCalculation();
      await this.testGACPComplianceAPI();

      // Documentation tests
      await this.testAPIDocumentation();

      // Performance tests
      await this.testPerformance();

      // Database connectivity tests
      await this.testDatabaseConnectivity();

      this.printResults();
    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      this.results.errors.push({
        test: 'Test Suite Execution',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Test health and monitoring endpoints
   */
  async testHealthEndpoints() {
    console.log('🏥 Testing Health & Monitoring Endpoints...');

    const healthTests = [
      {
        name: 'Basic Health Check',
        endpoint: '/api/monitoring/health',
        expectedStatus: 200,
        expectedProperties: ['success', 'status', 'data'],
      },
      {
        name: 'Detailed Health Report',
        endpoint: '/api/monitoring/health/detailed',
        expectedStatus: 200,
        expectedProperties: ['success', 'data'],
      },
      {
        name: 'System Status',
        endpoint: '/api/monitoring/status',
        expectedStatus: 200,
        expectedProperties: ['success', 'data'],
      },
      {
        name: 'Performance Metrics',
        endpoint: '/api/monitoring/health/metrics',
        expectedStatus: 200,
        expectedProperties: ['success', 'data'],
      },
    ];

    for (const test of healthTests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Test GACP Workflow API
   */
  async testGACPWorkflowAPI() {
    console.log('🌿 Testing GACP Workflow API...');

    const workflowTests = [
      {
        name: 'GACP Workflow Information',
        endpoint: '/api/gacp/workflow',
        expectedStatus: 200,
        expectedProperties: ['success', 'data'],
        validateData: data => {
          return data.workflowStates && data.currentWorkflow && Array.isArray(data.states);
        },
      },
      {
        name: 'Workflow State Requirements',
        endpoint: '/api/gacp/workflow/initial-application/requirements',
        expectedStatus: 200,
        expectedProperties: ['success', 'data'],
      },
    ];

    for (const test of workflowTests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Test GACP CCPs API
   */
  async testGACPCCPsAPI() {
    console.log('🎯 Testing GACP Critical Control Points API...');

    const ccpTest = {
      name: 'CCP Framework Information',
      endpoint: '/api/gacp/ccps',
      expectedStatus: 200,
      expectedProperties: ['success', 'data'],
      validateData: data => {
        return (
          data.totalCCPs === 8 && data.methodology === 'HACCP-based' && Array.isArray(data.ccps)
        );
      },
    };

    await this.runSingleTest(ccpTest);
  }

  /**
   * Test GACP Score Calculation
   */
  async testGACPScoreCalculation() {
    console.log('📊 Testing GACP Score Calculation...');

    const scoreTest = {
      name: 'CCP Score Calculation',
      endpoint: '/api/gacp/test/score-calculation',
      method: 'POST',
      data: {
        scores: {
          CCP01: 85,
          CCP02: 90,
          CCP03: 80,
          CCP04: 88,
          CCP05: 92,
          CCP06: 78,
          CCP07: 85,
          CCP08: 87,
        },
      },
      expectedStatus: 200,
      expectedProperties: ['success', 'data'],
      validateData: data => {
        return (
          typeof data.totalScore === 'number' &&
          data.weightedScore &&
          data.certificateLevel &&
          data.breakdown
        );
      },
    };

    await this.runSingleTest(scoreTest);
  }

  /**
   * Test GACP Compliance API
   */
  async testGACPComplianceAPI() {
    console.log('📋 Testing GACP Compliance API...');

    const complianceTest = {
      name: 'Compliance Framework Information',
      endpoint: '/api/gacp/compliance',
      expectedStatus: 200,
      expectedProperties: ['success', 'data'],
      validateData: data => {
        return (
          Array.isArray(data.standards) &&
          data.standards.includes('WHO-GACP') &&
          data.version &&
          Array.isArray(data.categories)
        );
      },
    };

    await this.runSingleTest(complianceTest);
  }

  /**
   * Test API Documentation
   */
  async testAPIDocumentation() {
    console.log('📚 Testing API Documentation...');

    const docTests = [
      {
        name: 'API Documentation',
        endpoint: '/api/docs/docs',
        expectedStatus: 200,
        expectedProperties: ['success', 'data'],
      },
      {
        name: 'OpenAPI Specification',
        endpoint: '/api/docs/openapi',
        expectedStatus: 200,
        validateData: data => {
          return data.openapi && data.info && data.paths;
        },
      },
    ];

    for (const test of docTests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Test API performance
   */
  async testPerformance() {
    console.log('⚡ Testing API Performance...');

    const performanceTest = {
      name: 'API Response Time',
      endpoint: '/api/monitoring/health',
      maxResponseTime: 500, // 500ms max
      concurrent: 5,
    };

    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < performanceTest.concurrent; i++) {
      promises.push(this.makeRequest('GET', performanceTest.endpoint));
    }

    try {
      await Promise.all(promises);
      const responseTime = Date.now() - startTime;
      const avgResponseTime = responseTime / performanceTest.concurrent;

      if (avgResponseTime <= performanceTest.maxResponseTime) {
        this.recordTestResult(performanceTest.name, true, {
          avgResponseTime: `${avgResponseTime}ms`,
          concurrent: performanceTest.concurrent,
        });
      } else {
        this.recordTestResult(performanceTest.name, false, {
          error: `Average response time ${avgResponseTime}ms exceeds limit ${performanceTest.maxResponseTime}ms`,
        });
      }
    } catch (error) {
      this.recordTestResult(performanceTest.name, false, {
        error: error.message,
      });
    }
  }

  /**
   * Test database connectivity
   */
  async testDatabaseConnectivity() {
    console.log('🗄️ Testing Database Connectivity...');

    const dbTest = {
      name: 'Database Health Check',
      endpoint: '/api/monitoring/health/database',
      expectedStatus: 200,
      validateData: data => {
        return data.status && data.metrics;
      },
    };

    await this.runSingleTest(dbTest);
  }

  /**
   * Run a single test
   */
  async runSingleTest(test) {
    this.results.total++;

    try {
      const method = test.method || 'GET';
      const response = await this.makeRequest(method, test.endpoint, test.data);

      // Check status code
      if (test.expectedStatus && response.status !== test.expectedStatus) {
        throw new Error(`Expected status ${test.expectedStatus}, got ${response.status}`);
      }

      // Check response properties
      if (test.expectedProperties) {
        for (const prop of test.expectedProperties) {
          if (!this.hasProperty(response.data, prop)) {
            throw new Error(`Missing expected property: ${prop}`);
          }
        }
      }

      // Custom data validation
      if (test.validateData && response.data.data) {
        if (!test.validateData(response.data.data)) {
          throw new Error('Custom data validation failed');
        }
      }

      this.recordTestResult(test.name, true, {
        status: response.status,
        responseTime: response.responseTime,
      });
    } catch (error) {
      this.recordTestResult(test.name, false, {
        error: error.message,
        endpoint: test.endpoint,
      });
    }
  }

  /**
   * Make HTTP request
   */
  async makeRequest(method, endpoint, data = null) {
    const startTime = Date.now();

    try {
      let response;
      const fullUrl = `${TEST_CONFIG.baseUrl}${endpoint}`;

      if (method === 'POST') {
        response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch(fullUrl);
      }

      const responseData = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        status: response.status,
        data: responseData,
        responseTime: responseTime,
      };
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  /**
   * Check if object has nested property
   */
  hasProperty(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (!current || typeof current !== 'object' || !current.hasOwnProperty(key)) {
        return false;
      }
      current = current[key];
    }

    return true;
  }

  /**
   * Record test result
   */
  recordTestResult(testName, passed, details = {}) {
    if (passed) {
      this.results.passed++;
      console.log(`  ✅ ${testName}`);
    } else {
      this.results.failed++;
      console.log(`  ❌ ${testName}: ${details.error || 'Unknown error'}`);
      this.results.errors.push({
        test: testName,
        error: details.error || 'Unknown error',
        endpoint: details.endpoint,
        timestamp: new Date().toISOString(),
      });
    }

    this.results.details.push({
      test: testName,
      passed: passed,
      details: details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Print test results
   */
  printResults() {
    const duration = Date.now() - this.startTime;
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('🧪 GACP Platform Test Suite Results');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏱️ Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    if (this.results.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    }

    console.log('\n🎯 Test Summary:');
    if (successRate >= 95) {
      console.log('🟢 EXCELLENT: System is performing excellently');
    } else if (successRate >= 85) {
      console.log('🟡 GOOD: System is performing well with minor issues');
    } else if (successRate >= 70) {
      console.log('🟠 WARNING: System has some issues that need attention');
    } else {
      console.log('🔴 CRITICAL: System has significant issues requiring immediate attention');
    }

    // Generate JSON report
    const report = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: successRate,
        duration: duration,
        timestamp: new Date().toISOString(),
      },
      details: this.results.details,
      errors: this.results.errors,
      config: TEST_CONFIG,
    };

    console.log('\n📄 Detailed JSON report available in test results');
    return report;
  }
}

// Export for use in other test files
module.exports = GACPTestSuite;

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new GACPTestSuite();
  testSuite
    .runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}
