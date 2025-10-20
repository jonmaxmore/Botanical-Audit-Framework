/**
 * UAT Test Runner
 * Automated test execution for all user roles and modules
 */

const axios = require('axios');
const colors = require('colors');

// Test Configuration
const config = {
  baseURL: process.env.UAT_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
};

// Test Results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  blocked: 0,
  tests: [],
};

// Test Users
const testUsers = {
  farmer: { username: 'farmer001', password: 'Test@1234' },
  reviewer: { username: 'reviewer001', password: 'Rev@1234' },
  inspector: { username: 'inspector001', password: 'Insp@1234' },
  approver: { username: 'approver001', password: 'App@1234' },
  admin: { username: 'admin001', password: 'Admin@1234' },
};

// Helper Functions
const log = {
  info: msg => console.log(`ℹ️  ${msg}`.cyan),
  success: msg => console.log(`✅ ${msg}`.green),
  error: msg => console.log(`❌ ${msg}`.red),
  warning: msg => console.log(`⚠️  ${msg}`.yellow),
  section: msg => console.log(`\n${'='.repeat(60)}`.gray),
};

const recordTest = (name, status, details = '') => {
  results.total++;
  results[status]++;
  results.tests.push({ name, status, details });

  const icon = {
    passed: '✅',
    failed: '❌',
    blocked: '⚠️',
  }[status];

  console.log(`${icon} ${name} - ${status.toUpperCase()}`.gray);
  if (details) console.log(`   ${details}`.gray);
};

// Authentication Helper
const authenticate = async role => {
  try {
    const user = testUsers[role];
    const response = await axios.post(`${config.baseURL}/api/auth/login`, user, {
      timeout: config.timeout,
    });

    if (response.data.token) {
      log.success(`${role} authenticated`);
      return response.data.token;
    }
    throw new Error('No token received');
  } catch (error) {
    log.error(`${role} authentication failed: ${error.message}`);
    return null;
  }
};

// ===================================
// FARMER TESTS
// ===================================
const testFarmerRole = async () => {
  log.section();
  log.info('Starting Farmer Role Tests...');

  const token = await authenticate('farmer');
  if (!token) {
    recordTest('TC-F001: Farmer Login', 'failed', 'Authentication failed');
    return;
  }
  recordTest('TC-F001: Farmer Login', 'passed');

  const headers = { Authorization: `Bearer ${token}` };

  // TC-F002: View Farm Profile
  try {
    const response = await axios.get(`${config.baseURL}/api/farms/my-farms`, {
      headers,
      timeout: config.timeout,
    });
    recordTest(
      'TC-F002: View Farm Profile',
      response.data.farms ? 'passed' : 'failed',
      `Found ${response.data.farms?.length || 0} farms`,
    );
  } catch (error) {
    recordTest('TC-F002: View Farm Profile', 'failed', error.message);
  }

  // TC-F003: Submit GACP Application
  try {
    const applicationData = {
      farmId: 'FRM-C001',
      applicationType: 'GACP Certification',
      documents: [],
    };
    const response = await axios.post(
      `${config.baseURL}/api/applications/submit`,
      applicationData,
      { headers, timeout: config.timeout },
    );
    recordTest(
      'TC-F003: Submit Application',
      response.data.applicationId ? 'passed' : 'failed',
      `Application ID: ${response.data.applicationId || 'N/A'}`,
    );
  } catch (error) {
    recordTest('TC-F003: Submit Application', 'failed', error.message);
  }

  // TC-F004: Complete Survey
  try {
    const surveyData = {
      surveyId: 'SURVEY-001',
      region: 'Central',
      responses: [
        { questionId: 'Q1', answer: 'Yes' },
        { questionId: 'Q2', answer: '5 rai' },
      ],
    };
    const response = await axios.post(`${config.baseURL}/api/surveys/submit`, surveyData, {
      headers,
      timeout: config.timeout,
    });
    recordTest('TC-F004: Complete Survey', response.data.success ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-F004: Complete Survey', 'failed', error.message);
  }

  // TC-F005: Track & Trace Recording
  try {
    const activityData = {
      farmId: 'FRM-C001',
      activityType: 'planting',
      quantity: 100,
      date: new Date().toISOString(),
    };
    const response = await axios.post(`${config.baseURL}/api/tracktrace/record`, activityData, {
      headers,
      timeout: config.timeout,
    });
    recordTest('TC-F005: Track & Trace', response.data.activityId ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-F005: Track & Trace', 'failed', error.message);
  }

  // TC-F006: GACP Standards Comparison
  try {
    const response = await axios.get(`${config.baseURL}/api/standards/compare?farmId=FRM-C001`, {
      headers,
      timeout: config.timeout,
    });
    recordTest(
      'TC-F006: GACP Standards',
      response.data.complianceScore !== undefined ? 'passed' : 'failed',
      `Score: ${response.data.complianceScore || 'N/A'}`,
    );
  } catch (error) {
    recordTest('TC-F006: GACP Standards', 'failed', error.message);
  }
};

// ===================================
// REVIEWER TESTS
// ===================================
const testReviewerRole = async () => {
  log.section();
  log.info('Starting Reviewer Role Tests...');

  const token = await authenticate('reviewer');
  if (!token) {
    recordTest('TC-R001: Reviewer Login', 'failed');
    return;
  }
  recordTest('TC-R001: Reviewer Login', 'passed');

  const headers = { Authorization: `Bearer ${token}` };

  // TC-R002: View Assigned Applications
  try {
    const response = await axios.get(`${config.baseURL}/api/applications/assigned`, {
      headers,
      timeout: config.timeout,
    });
    recordTest(
      'TC-R002: View Applications',
      response.data.applications ? 'passed' : 'failed',
      `Found ${response.data.applications?.length || 0} applications`,
    );
  } catch (error) {
    recordTest('TC-R002: View Applications', 'failed', error.message);
  }

  // TC-R003: Review Application
  try {
    const reviewData = {
      applicationId: 'APP-2025-001',
      status: 'under_review',
      comments: 'Initial review completed',
    };
    const response = await axios.post(`${config.baseURL}/api/applications/review`, reviewData, {
      headers,
      timeout: config.timeout,
    });
    recordTest('TC-R003: Review Application', response.data.success ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-R003: Review Application', 'failed', error.message);
  }

  // TC-R004: Assign Inspector
  try {
    const assignData = {
      applicationId: 'APP-2025-001',
      inspectorId: 'inspector001',
      inspectionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const response = await axios.post(
      `${config.baseURL}/api/applications/assign-inspector`,
      assignData,
      { headers, timeout: config.timeout },
    );
    recordTest('TC-R004: Assign Inspector', response.data.success ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-R004: Assign Inspector', 'failed', error.message);
  }
};

// ===================================
// INSPECTOR TESTS
// ===================================
const testInspectorRole = async () => {
  log.section();
  log.info('Starting Inspector Role Tests...');

  const token = await authenticate('inspector');
  if (!token) {
    recordTest('TC-I001: Inspector Login', 'failed');
    return;
  }
  recordTest('TC-I001: Inspector Login', 'passed');

  const headers = { Authorization: `Bearer ${token}` };

  // TC-I002: View Assigned Inspections
  try {
    const response = await axios.get(`${config.baseURL}/api/inspections/assigned`, {
      headers,
      timeout: config.timeout,
    });
    recordTest(
      'TC-I002: View Inspections',
      response.data.inspections ? 'passed' : 'failed',
      `Found ${response.data.inspections?.length || 0} inspections`,
    );
  } catch (error) {
    recordTest('TC-I002: View Inspections', 'failed', error.message);
  }

  // TC-I003: Complete Inspection Checklist
  try {
    const checklistData = {
      inspectionId: 'INS-001',
      items: [
        { itemId: 'CHK-001', status: 'pass', notes: 'Water quality good' },
        { itemId: 'CHK-002', status: 'pass', notes: 'Pest control adequate' },
      ],
    };
    const response = await axios.post(
      `${config.baseURL}/api/inspections/checklist`,
      checklistData,
      { headers, timeout: config.timeout },
    );
    recordTest('TC-I003: Complete Checklist', response.data.success ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-I003: Complete Checklist', 'failed', error.message);
  }

  // TC-I004: Submit Inspection Report
  try {
    const reportData = {
      inspectionId: 'INS-001',
      recommendation: 'approve',
      summary: 'All standards met',
    };
    const response = await axios.post(
      `${config.baseURL}/api/inspections/submit-report`,
      reportData,
      { headers, timeout: config.timeout },
    );
    recordTest('TC-I004: Submit Report', response.data.success ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-I004: Submit Report', 'failed', error.message);
  }
};

// ===================================
// APPROVER TESTS
// ===================================
const testApproverRole = async () => {
  log.section();
  log.info('Starting Approver Role Tests...');

  const token = await authenticate('approver');
  if (!token) {
    recordTest('TC-A001: Approver Login', 'failed');
    return;
  }
  recordTest('TC-A001: Approver Login', 'passed');

  const headers = { Authorization: `Bearer ${token}` };

  // TC-A002: View Pending Approvals
  try {
    const response = await axios.get(`${config.baseURL}/api/approvals/pending`, {
      headers,
      timeout: config.timeout,
    });
    recordTest(
      'TC-A002: View Pending',
      response.data.approvals ? 'passed' : 'failed',
      `Found ${response.data.approvals?.length || 0} pending`,
    );
  } catch (error) {
    recordTest('TC-A002: View Pending', 'failed', error.message);
  }

  // TC-A003: Approve Certificate
  try {
    const approvalData = {
      applicationId: 'APP-2025-009',
      decision: 'approved',
      validityPeriod: 365,
      notes: 'All requirements met',
    };
    const response = await axios.post(`${config.baseURL}/api/approvals/approve`, approvalData, {
      headers,
      timeout: config.timeout,
    });
    recordTest('TC-A003: Approve Certificate', response.data.certificateId ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-A003: Approve Certificate', 'failed', error.message);
  }

  // TC-A004: Download Certificate
  try {
    const response = await axios.get(
      `${config.baseURL}/api/certificates/download?certId=CERT-001`,
      { headers, timeout: config.timeout, responseType: 'blob' },
    );
    recordTest('TC-A004: Download Certificate', response.data ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-A004: Download Certificate', 'failed', error.message);
  }
};

// ===================================
// ADMIN TESTS
// ===================================
const testAdminRole = async () => {
  log.section();
  log.info('Starting Admin Role Tests...');

  const token = await authenticate('admin');
  if (!token) {
    recordTest('TC-AD001: Admin Login', 'failed');
    return;
  }
  recordTest('TC-AD001: Admin Login', 'passed');

  const headers = { Authorization: `Bearer ${token}` };

  // TC-AD002: View Dashboard
  try {
    const response = await axios.get(`${config.baseURL}/api/admin/dashboard`, {
      headers,
      timeout: config.timeout,
    });
    recordTest('TC-AD002: Dashboard', response.data.stats ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-AD002: Dashboard', 'failed', error.message);
  }

  // TC-AD003: User Management
  try {
    const response = await axios.get(`${config.baseURL}/api/admin/users`, {
      headers,
      timeout: config.timeout,
    });
    recordTest(
      'TC-AD003: User Management',
      response.data.users ? 'passed' : 'failed',
      `Total users: ${response.data.users?.length || 0}`,
    );
  } catch (error) {
    recordTest('TC-AD003: User Management', 'failed', error.message);
  }

  // TC-AD004: Generate Report
  try {
    const reportData = {
      reportType: 'monthly_certification',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    };
    const response = await axios.post(`${config.baseURL}/api/admin/reports`, reportData, {
      headers,
      timeout: config.timeout,
    });
    recordTest('TC-AD004: Generate Report', response.data.reportId ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-AD004: Generate Report', 'failed', error.message);
  }

  // TC-AD005: View Audit Logs
  try {
    const response = await axios.get(`${config.baseURL}/api/admin/audit-logs`, {
      headers,
      timeout: config.timeout,
    });
    recordTest('TC-AD005: Audit Logs', response.data.logs ? 'passed' : 'failed');
  } catch (error) {
    recordTest('TC-AD005: Audit Logs', 'failed', error.message);
  }
};

// ===================================
// MAIN TEST RUNNER
// ===================================
const runAllTests = async () => {
  console.log('\n🧪 UAT TEST RUNNER'.bold.cyan);
  console.log('='.repeat(60).gray);
  log.info(`Base URL: ${config.baseURL}`);
  log.info(`Timeout: ${config.timeout}ms`);

  try {
    await testFarmerRole();
    await testReviewerRole();
    await testInspectorRole();
    await testApproverRole();
    await testAdminRole();
  } catch (error) {
    log.error(`Test execution error: ${error.message}`);
  }

  // Print Summary
  log.section();
  console.log('\n📊 TEST SUMMARY'.bold.cyan);
  console.log('='.repeat(60).gray);
  console.log(`Total Tests: ${results.total}`.white);
  console.log(`✅ Passed: ${results.passed}`.green);
  console.log(`❌ Failed: ${results.failed}`.red);
  console.log(`⚠️  Blocked: ${results.blocked}`.yellow);
  console.log(`📈 Pass Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`.cyan);

  // Failed Tests Details
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:'.red.bold);
    results.tests
      .filter(t => t.status === 'failed')
      .forEach(t => {
        console.log(`   - ${t.name}`.red);
        if (t.details) console.log(`     ${t.details}`.gray);
      });
  }

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
};

// Run tests
runAllTests().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
