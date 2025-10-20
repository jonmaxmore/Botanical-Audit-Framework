/**
 * 🎯 COMPREHENSIVE QA SIMULATION TEST
 *
 * Simulates 200 QA Testers:
 * - 100 QA (0% Knowledge) - Novice Users
 * - 50 QA (50% Knowledge) - Intermediate Users
 * - 50 QA (100% Knowledge) - Expert Users
 *
 * Plus DTAM Staff Testing:
 * - 20 Admin
 * - 20 Reviewer
 * - 20 Manager
 *
 * Total: 260 Concurrent Users
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = process.env.API_URL || 'http://localhost:3004';
const TEST_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const RAMP_UP_TIME_MS = 60 * 1000; // 1 minute to start all users

// ============================================================================
// QA USER GROUPS
// ============================================================================

const QA_GROUPS = {
  NOVICE: {
    count: 100,
    knowledgeLevel: 0,
    behavior: 'exploratory', // Random clicks, mistakes, confusion
    errorRate: 0.4, // 40% error rate
    thinkTime: [5000, 15000], // 5-15 seconds between actions
    description: 'ไม่รู้จักระบบเลย - ทดลองกดดู',
  },
  INTERMEDIATE: {
    count: 50,
    knowledgeLevel: 50,
    behavior: 'semi-guided', // Know some features
    errorRate: 0.15, // 15% error rate
    thinkTime: [2000, 8000], // 2-8 seconds
    description: 'รู้โครงการ 50% - ทำตามเอกสาร',
  },
  EXPERT: {
    count: 50,
    knowledgeLevel: 100,
    behavior: 'efficient', // Direct to target
    errorRate: 0.05, // 5% error rate
    thinkTime: [1000, 3000], // 1-3 seconds
    description: 'รู้ระบบ 100% - ทดสอบอย่างเป็นระบบ',
  },
};

const DTAM_ROLES = {
  ADMIN: { count: 20, username: 'admin.dtam', password: 'Admin@123' },
  REVIEWER: { count: 20, username: 'reviewer.dtam', password: 'Reviewer@123' },
  MANAGER: { count: 20, username: 'manager.dtam', password: 'Manager@123' },
};

// ============================================================================
// TEST STATISTICS
// ============================================================================

const stats = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  errors: [],
  responseTimesms: [],
  userJourneys: {},
  byGroup: {
    novice: { tests: 0, passed: 0, failed: 0, errors: 0 },
    intermediate: { tests: 0, passed: 0, failed: 0, errors: 0 },
    expert: { tests: 0, passed: 0, failed: 0, errors: 0 },
    dtam_admin: { tests: 0, passed: 0, failed: 0, errors: 0 },
    dtam_reviewer: { tests: 0, passed: 0, failed: 0, errors: 0 },
    dtam_manager: { tests: 0, passed: 0, failed: 0, errors: 0 },
  },
  apiEndpoints: {},
  startTime: null,
  endTime: null,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldMakeError(errorRate) {
  return Math.random() < errorRate;
}

function generateFarmerData(userId) {
  return {
    email: `qa_farmer_${userId}_${Date.now()}@test.com`,
    password: 'TestPass@123',
    fullName: `QA Tester ${userId}`,
    phoneNumber: `08${String(userId).padStart(8, '0')}`,
    farmName: `QA Test Farm ${userId}`,
    farmAddress: `123 Test Street, QA District`,
    farmSize: randomBetween(1, 100),
    cropTypes: ['rice', 'vegetables', 'fruits'][randomBetween(0, 2)],
  };
}

function logAction(userId, group, action, status, responseTime, error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    userId,
    group,
    action,
    status,
    responseTime,
    error: error ? error.message : null,
  };

  // Update stats
  stats.totalTests++;
  if (status === 'PASS') {
    stats.passed++;
    stats.byGroup[group].passed++;
  } else {
    stats.failed++;
    stats.byGroup[group].failed++;
    if (error) {
      stats.byGroup[group].errors++;
      stats.errors.push(logEntry);
    }
  }

  stats.byGroup[group].tests++;
  stats.responseTimesms.push(responseTime);

  // Track API endpoint
  if (!stats.apiEndpoints[action]) {
    stats.apiEndpoints[action] = { calls: 0, avgTime: 0, errors: 0 };
  }
  stats.apiEndpoints[action].calls++;
  stats.apiEndpoints[action].avgTime =
    (stats.apiEndpoints[action].avgTime * (stats.apiEndpoints[action].calls - 1) + responseTime) /
    stats.apiEndpoints[action].calls;
  if (status === 'FAIL') {
    stats.apiEndpoints[action].errors++;
  }

  // Color coding
  const statusColor = status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
  const resetColor = '\x1b[0m';

  console.log(
    `[${timestamp}] ${statusColor}${status}${resetColor} | ` +
      `User ${userId} (${group}) | ${action} | ${responseTime}ms` +
      (error ? ` | ERROR: ${error.message}` : '')
  );
}

// ============================================================================
// FARMER USER ACTIONS
// ============================================================================

class FarmerQATester {
  constructor(userId, group, knowledgeLevel) {
    this.userId = userId;
    this.group = group;
    this.knowledgeLevel = knowledgeLevel;
    this.token = null;
    this.userData = generateFarmerData(userId);
    this.config = QA_GROUPS[group];
  }

  async thinkTime() {
    const [min, max] = this.config.thinkTime;
    await sleep(randomBetween(min, max));
  }

  async register() {
    const startTime = Date.now();
    try {
      // Novice users might make mistakes
      if (this.config.behavior === 'exploratory' && shouldMakeError(this.config.errorRate)) {
        // Intentional error: missing required field
        const badData = { ...this.userData };
        delete badData.email;

        await axios.post(`${BASE_URL}/api/auth/register`, badData);
        logAction(
          this.userId,
          this.group,
          'REGISTER',
          'FAIL',
          Date.now() - startTime,
          new Error('Missing required field (intentional)')
        );
        return false;
      }

      const response = await axios.post(`${BASE_URL}/api/auth/register`, this.userData);

      if (response.data.success) {
        logAction(this.userId, this.group, 'REGISTER', 'PASS', Date.now() - startTime);
        return true;
      }

      logAction(this.userId, this.group, 'REGISTER', 'FAIL', Date.now() - startTime);
      return false;
    } catch (error) {
      logAction(this.userId, this.group, 'REGISTER', 'FAIL', Date.now() - startTime, error);
      return false;
    }
  }

  async login() {
    const startTime = Date.now();
    try {
      // Intermediate users might typo password
      if (this.config.behavior === 'semi-guided' && shouldMakeError(this.config.errorRate)) {
        await axios.post(`${BASE_URL}/api/auth/login`, {
          email: this.userData.email,
          password: 'WrongPassword123',
        });
        logAction(
          this.userId,
          this.group,
          'LOGIN',
          'FAIL',
          Date.now() - startTime,
          new Error('Wrong password (intentional)')
        );
        return false;
      }

      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: this.userData.email,
        password: this.userData.password,
      });

      if (response.data.success && response.data.token) {
        this.token = response.data.token;
        logAction(this.userId, this.group, 'LOGIN', 'PASS', Date.now() - startTime);
        return true;
      }

      logAction(this.userId, this.group, 'LOGIN', 'FAIL', Date.now() - startTime);
      return false;
    } catch (error) {
      logAction(this.userId, this.group, 'LOGIN', 'FAIL', Date.now() - startTime, error);
      return false;
    }
  }

  async getDashboard() {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/api/farmer/dashboard`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      logAction(this.userId, this.group, 'GET_DASHBOARD', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      logAction(this.userId, this.group, 'GET_DASHBOARD', 'FAIL', Date.now() - startTime, error);
      return false;
    }
  }

  async uploadDocument() {
    const startTime = Date.now();
    try {
      // Create mock file
      const testFile = Buffer.from('Mock PDF Content for QA Testing');
      const formData = new FormData();

      formData.append('documentTitle', `QA Test Document ${this.userId}`);
      formData.append('documentType', 'FARM_REGISTRATION');
      formData.append('description', `Uploaded by QA Tester ${this.userId} (${this.group})`);
      formData.append('document', testFile, {
        filename: `qa_test_${this.userId}.pdf`,
        contentType: 'application/pdf',
      });

      const response = await axios.post(`${BASE_URL}/api/documents/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${this.token}`,
        },
      });

      logAction(this.userId, this.group, 'UPLOAD_DOCUMENT', 'PASS', Date.now() - startTime);
      return response.data.data;
    } catch (error) {
      logAction(this.userId, this.group, 'UPLOAD_DOCUMENT', 'FAIL', Date.now() - startTime, error);
      return null;
    }
  }

  async getDocuments() {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${this.token}` },
        params: { page: 1, limit: 10 },
      });

      logAction(this.userId, this.group, 'GET_DOCUMENTS', 'PASS', Date.now() - startTime);
      return response.data.data;
    } catch (error) {
      logAction(this.userId, this.group, 'GET_DOCUMENTS', 'FAIL', Date.now() - startTime, error);
      return null;
    }
  }

  async runFullJourney() {
    console.log(`\n🚀 Starting QA Journey for User ${this.userId} (${this.group})`);

    // 1. Register
    const registered = await this.register();
    if (!registered) {
      console.log(`❌ User ${this.userId} failed to register, retrying...`);
      await this.thinkTime();
      await this.register(); // Retry
    }
    await this.thinkTime();

    // 2. Login
    const loggedIn = await this.login();
    if (!loggedIn) {
      console.log(`❌ User ${this.userId} failed to login, retrying...`);
      await this.thinkTime();
      await this.login(); // Retry
    }
    await this.thinkTime();

    // 3. Get Dashboard
    await this.getDashboard();
    await this.thinkTime();

    // 4. Upload Document
    const doc = await this.uploadDocument();
    await this.thinkTime();

    // 5. Get Documents
    await this.getDocuments();
    await this.thinkTime();

    // 6. Novice users might try random things
    if (this.config.behavior === 'exploratory') {
      // Try to access documents without proper params
      const startTime = Date.now();
      try {
        await axios.get(`${BASE_URL}/api/documents/invalid-id`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
      } catch (error) {
        logAction(
          this.userId,
          this.group,
          'RANDOM_EXPLORATION',
          'FAIL',
          Date.now() - startTime,
          error
        );
      }
    }

    console.log(`✅ User ${this.userId} completed journey`);
  }
}

// ============================================================================
// DTAM STAFF ACTIONS
// ============================================================================

class DTAMQATester {
  constructor(userId, role, credentials) {
    this.userId = userId;
    this.role = role;
    this.credentials = credentials;
    this.token = null;
    this.group = `dtam_${role.toLowerCase()}`;
  }

  async login() {
    const startTime = Date.now();
    try {
      const response = await axios.post(`${BASE_URL}/api/dtam/auth/login`, {
        username: this.credentials.username,
        password: this.credentials.password,
      });

      if (response.data.success && response.data.dtam_token) {
        this.token = response.data.dtam_token;
        logAction(this.userId, this.group, 'DTAM_LOGIN', 'PASS', Date.now() - startTime);
        return true;
      }

      logAction(this.userId, this.group, 'DTAM_LOGIN', 'FAIL', Date.now() - startTime);
      return false;
    } catch (error) {
      logAction(this.userId, this.group, 'DTAM_LOGIN', 'FAIL', Date.now() - startTime, error);
      return false;
    }
  }

  async getDashboard() {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/api/dtam/dashboard`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      logAction(this.userId, this.group, 'DTAM_DASHBOARD', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      logAction(this.userId, this.group, 'DTAM_DASHBOARD', 'FAIL', Date.now() - startTime, error);
      return false;
    }
  }

  async getApplications() {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/api/dtam/applications`, {
        headers: { Authorization: `Bearer ${this.token}` },
        params: { page: 1, limit: 10 },
      });

      logAction(this.userId, this.group, 'GET_APPLICATIONS', 'PASS', Date.now() - startTime);
      return response.data.data;
    } catch (error) {
      logAction(this.userId, this.group, 'GET_APPLICATIONS', 'FAIL', Date.now() - startTime, error);
      return null;
    }
  }

  async reviewApplication(applicationId) {
    const startTime = Date.now();
    try {
      const response = await axios.put(
        `${BASE_URL}/api/dtam/applications/${applicationId}/review`,
        {
          status: Math.random() > 0.5 ? 'approved' : 'rejected',
          reviewComment: `Reviewed by DTAM ${this.role} QA Tester ${this.userId}`,
        },
        { headers: { Authorization: `Bearer ${this.token}` } }
      );

      logAction(this.userId, this.group, 'REVIEW_APPLICATION', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      logAction(
        this.userId,
        this.group,
        'REVIEW_APPLICATION',
        'FAIL',
        Date.now() - startTime,
        error
      );
      return false;
    }
  }

  async getStatistics() {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/api/dtam/statistics`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      logAction(this.userId, this.group, 'GET_STATISTICS', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      logAction(this.userId, this.group, 'GET_STATISTICS', 'FAIL', Date.now() - startTime, error);
      return false;
    }
  }

  async runFullJourney() {
    console.log(`\n🔐 Starting DTAM Journey for ${this.role} ${this.userId}`);

    // 1. Login
    const loggedIn = await this.login();
    if (!loggedIn) return;
    await sleep(2000);

    // 2. Get Dashboard
    await this.getDashboard();
    await sleep(2000);

    // 3. Get Applications
    const apps = await this.getApplications();
    await sleep(2000);

    // 4. Get Statistics
    await this.getStatistics();
    await sleep(2000);

    // 5. Review application if available
    if (apps && apps.applications && apps.applications.length > 0) {
      const randomApp = apps.applications[randomBetween(0, apps.applications.length - 1)];
      await this.reviewApplication(randomApp._id);
    }

    console.log(`✅ DTAM ${this.role} ${this.userId} completed journey`);
  }
}

// ============================================================================
// TEST ORCHESTRATION
// ============================================================================

async function runLoadTest() {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 COMPREHENSIVE QA SIMULATION TEST');
  console.log('═'.repeat(80));
  console.log('\n📊 Test Configuration:');
  console.log(`   Total Users: 260`);
  console.log(`   - Novice (0%): ${QA_GROUPS.NOVICE.count} users`);
  console.log(`   - Intermediate (50%): ${QA_GROUPS.INTERMEDIATE.count} users`);
  console.log(`   - Expert (100%): ${QA_GROUPS.EXPERT.count} users`);
  console.log(`   - DTAM Admin: ${DTAM_ROLES.ADMIN.count} users`);
  console.log(`   - DTAM Reviewer: ${DTAM_ROLES.REVIEWER.count} users`);
  console.log(`   - DTAM Manager: ${DTAM_ROLES.MANAGER.count} users`);
  console.log(`\n⏱️  Test Duration: ${TEST_DURATION_MS / 1000}s`);
  console.log(`🚀 Ramp-up Time: ${RAMP_UP_TIME_MS / 1000}s`);
  console.log(`🌐 Target: ${BASE_URL}\n`);
  console.log('═'.repeat(80) + '\n');

  stats.startTime = new Date();

  // Check server health
  try {
    console.log('🏥 Checking server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ Server is healthy: ${health.data.status}\n`);
  } catch (error) {
    console.error('❌ Server is not responding! Please start the server first.');
    process.exit(1);
  }

  const allTesters = [];

  // Create Farmer QA Testers
  let userId = 1;

  // Novice users
  for (let i = 0; i < QA_GROUPS.NOVICE.count; i++) {
    allTesters.push(new FarmerQATester(userId++, 'NOVICE', 0));
  }

  // Intermediate users
  for (let i = 0; i < QA_GROUPS.INTERMEDIATE.count; i++) {
    allTesters.push(new FarmerQATester(userId++, 'INTERMEDIATE', 50));
  }

  // Expert users
  for (let i = 0; i < QA_GROUPS.EXPERT.count; i++) {
    allTesters.push(new FarmerQATester(userId++, 'EXPERT', 100));
  }

  // Create DTAM QA Testers
  let dtamId = 1;

  for (let i = 0; i < DTAM_ROLES.ADMIN.count; i++) {
    allTesters.push(new DTAMQATester(dtamId++, 'ADMIN', DTAM_ROLES.ADMIN));
  }

  for (let i = 0; i < DTAM_ROLES.REVIEWER.count; i++) {
    allTesters.push(new DTAMQATester(dtamId++, 'REVIEWER', DTAM_ROLES.REVIEWER));
  }

  for (let i = 0; i < DTAM_ROLES.MANAGER.count; i++) {
    allTesters.push(new DTAMQATester(dtamId++, 'MANAGER', DTAM_ROLES.MANAGER));
  }

  console.log(`\n🚀 Starting ${allTesters.length} concurrent users...\n`);

  // Ramp up users gradually
  const delayBetweenUsers = RAMP_UP_TIME_MS / allTesters.length;
  const promises = allTesters.map((tester, index) => {
    return sleep(delayBetweenUsers * index).then(() => tester.runFullJourney());
  });

  // Wait for all tests to complete
  await Promise.allSettled(promises);

  stats.endTime = new Date();

  // Print results
  printResults();
}

// ============================================================================
// RESULTS REPORTING
// ============================================================================

function printResults() {
  const duration = (stats.endTime - stats.startTime) / 1000;
  const avgResponseTime =
    stats.responseTimesms.reduce((a, b) => a + b, 0) / stats.responseTimesms.length;
  const maxResponseTime = Math.max(...stats.responseTimesms);
  const minResponseTime = Math.min(...stats.responseTimesms);

  console.log('\n' + '═'.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(80));

  console.log('\n⏱️  Execution Time:');
  console.log(`   Duration: ${duration.toFixed(2)}s`);
  console.log(`   Start: ${stats.startTime.toISOString()}`);
  console.log(`   End: ${stats.endTime.toISOString()}`);

  console.log('\n✅ Overall Results:');
  console.log(`   Total Tests: ${stats.totalTests}`);
  console.log(
    `   Passed: ${stats.passed} (${((stats.passed / stats.totalTests) * 100).toFixed(2)}%)`
  );
  console.log(
    `   Failed: ${stats.failed} (${((stats.failed / stats.totalTests) * 100).toFixed(2)}%)`
  );
  console.log(`   Success Rate: ${((stats.passed / stats.totalTests) * 100).toFixed(2)}%`);

  console.log('\n⚡ Performance Metrics:');
  console.log(`   Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   Min Response Time: ${minResponseTime}ms`);
  console.log(`   Max Response Time: ${maxResponseTime}ms`);
  console.log(`   Requests/Second: ${(stats.totalTests / duration).toFixed(2)}`);

  console.log('\n👥 Results by Group:');
  Object.entries(stats.byGroup).forEach(([group, data]) => {
    if (data.tests > 0) {
      const successRate = ((data.passed / data.tests) * 100).toFixed(2);
      console.log(`   ${group.toUpperCase()}:`);
      console.log(
        `      Tests: ${data.tests} | Passed: ${data.passed} | Failed: ${data.failed} | Success: ${successRate}%`
      );
    }
  });

  console.log('\n🔌 API Endpoint Performance:');
  Object.entries(stats.apiEndpoints)
    .sort((a, b) => b[1].calls - a[1].calls)
    .forEach(([endpoint, data]) => {
      const errorRate = ((data.errors / data.calls) * 100).toFixed(2);
      console.log(`   ${endpoint}:`);
      console.log(
        `      Calls: ${data.calls} | Avg Time: ${data.avgTime.toFixed(2)}ms | Errors: ${data.errors} (${errorRate}%)`
      );
    });

  if (stats.errors.length > 0) {
    console.log('\n❌ Top Errors (First 10):');
    stats.errors.slice(0, 10).forEach((error, index) => {
      console.log(`   ${index + 1}. [${error.group}] ${error.action}: ${error.error}`);
    });
  }

  console.log('\n' + '═'.repeat(80));
  console.log('🎯 TEST COMPLETE!');
  console.log('═'.repeat(80) + '\n');

  // Save detailed report
  saveDetailedReport();
}

function saveDetailedReport() {
  const reportPath = path.join(__dirname, `qa-load-test-report-${Date.now()}.json`);

  const report = {
    summary: {
      totalTests: stats.totalTests,
      passed: stats.passed,
      failed: stats.failed,
      successRate: ((stats.passed / stats.totalTests) * 100).toFixed(2) + '%',
      duration: ((stats.endTime - stats.startTime) / 1000).toFixed(2) + 's',
      avgResponseTime:
        (stats.responseTimesms.reduce((a, b) => a + b, 0) / stats.responseTimesms.length).toFixed(
          2
        ) + 'ms',
    },
    byGroup: stats.byGroup,
    apiEndpoints: stats.apiEndpoints,
    errors: stats.errors,
    config: {
      baseUrl: BASE_URL,
      qaGroups: QA_GROUPS,
      dtamRoles: DTAM_ROLES,
      testDuration: TEST_DURATION_MS,
      rampUpTime: RAMP_UP_TIME_MS,
    },
    timestamp: stats.endTime.toISOString(),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

if (require.main === module) {
  runLoadTest().catch(error => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runLoadTest, FarmerQATester, DTAMQATester };
