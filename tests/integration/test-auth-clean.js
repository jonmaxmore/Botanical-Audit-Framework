/**
 * Clean Architecture Authentication Integration Test
 *
 * Tests both Farmer and DTAM Staff authentication systems
 * - Farmer registration and login
 * - DTAM staff creation and login
 * - Permission-based access control
 * - Role-based access control
 * - Token separation
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3004';
const FARMER_API = `${BASE_URL}/api/farmers`;
const DTAM_API = `${BASE_URL}/api/dtam`;

// Test data
const testFarmer = {
  email: `test-farmer-${Date.now()}@example.com`,
  password: 'Farmer@123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '0812345678',
  address: '123 Test Street',
};

const testDTAMStaff = {
  email: `test-staff-${Date.now()}@dtam.go.th`,
  password: 'Staff@123',
  firstName: 'Jane',
  lastName: 'Smith',
  employeeId: `EMP-${Date.now()}`,
  role: 'REVIEWER',
  department: 'Quality Assurance',
  position: 'Senior Reviewer',
  phoneNumber: '0823456789',
};

let adminToken = '';
let farmerToken = '';
let staffToken = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logTest(description) {
  log(`📋 Test: ${description}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testFarmerRegistration() {
  logTest('Farmer Registration');
  try {
    const response = await axios.post(`${FARMER_API}/register`, testFarmer);

    if (response.status === 201 && response.data.success) {
      logSuccess('Farmer registered successfully');
      return true;
    } else {
      logError('Unexpected response structure');
      return false;
    }
  } catch (error) {
    logError(`Farmer registration failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testFarmerLogin() {
  logTest('Farmer Login');
  try {
    const response = await axios.post(`${FARMER_API}/login`, {
      email: testFarmer.email,
      password: testFarmer.password,
    });

    if (response.status === 200 && response.data.success && response.data.token) {
      farmerToken = response.data.token;
      logSuccess(
        `Farmer logged in successfully (Token type: ${response.data.user?.type || 'unknown'})`,
      );
      return true;
    } else {
      logError('Unexpected response structure');
      return false;
    }
  } catch (error) {
    logError(`Farmer login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testFarmerProfile() {
  logTest('Farmer Profile Access');
  try {
    const response = await axios.get(`${FARMER_API}/profile`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });

    if (response.status === 200 && response.data.success) {
      logSuccess(
        `Farmer profile retrieved: ${response.data.user.firstName} ${response.data.user.lastName}`,
      );
      return true;
    } else {
      logError('Unexpected response structure');
      return false;
    }
  } catch (error) {
    logError(`Farmer profile access failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testDTAMAdminLogin() {
  logTest('DTAM Admin Login');
  try {
    const response = await axios.post(`${DTAM_API}/login`, {
      email: 'admin@dtam.go.th',
      password: 'Admin@2025',
    });

    if (response.status === 200 && response.data.success && response.data.token) {
      adminToken = response.data.token;
      logSuccess(`DTAM Admin logged in (Role: ${response.data.staff?.role || 'unknown'})`);
      return true;
    } else {
      logError('Unexpected response structure');
      return false;
    }
  } catch (error) {
    logError(`DTAM Admin login failed: ${error.response?.data?.message || error.message}`);
    logWarning('Make sure to run: node scripts/seed-dtam-admin.js');
    return false;
  }
}

async function testDTAMStaffCreation() {
  logTest('DTAM Staff Creation (Admin only)');
  try {
    const response = await axios.post(`${DTAM_API}/staff`, testDTAMStaff, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.status === 201 && response.data.success) {
      logSuccess(`DTAM Staff created: ${testDTAMStaff.email} (Role: ${testDTAMStaff.role})`);
      return true;
    } else {
      logError('Unexpected response structure');
      return false;
    }
  } catch (error) {
    logError(`DTAM Staff creation failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testDTAMStaffLogin() {
  logTest('DTAM Staff Login');
  try {
    const response = await axios.post(`${DTAM_API}/login`, {
      email: testDTAMStaff.email,
      password: testDTAMStaff.password,
    });

    if (response.status === 200 && response.data.success && response.data.token) {
      staffToken = response.data.token;
      logSuccess(`DTAM Staff logged in (Role: ${response.data.staff?.role || 'unknown'})`);
      return true;
    } else {
      logError('Unexpected response structure');
      return false;
    }
  } catch (error) {
    logError(`DTAM Staff login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testDTAMStaffProfile() {
  logTest('DTAM Staff Profile Access');
  try {
    const response = await axios.get(`${DTAM_API}/profile`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });

    if (response.status === 200 && response.data.success) {
      logSuccess(
        `DTAM Staff profile retrieved: ${response.data.staff.firstName} ${response.data.staff.lastName}`,
      );
      return true;
    } else {
      logError('Unexpected response structure');
      return false;
    }
  } catch (error) {
    logError(`DTAM Staff profile access failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testTokenSeparation() {
  logTest('Token Separation (Farmer token cannot access DTAM endpoints)');
  try {
    await axios.get(`${DTAM_API}/profile`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    logError('Farmer token was accepted by DTAM endpoint (SECURITY ISSUE!)');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      logSuccess('Farmer token correctly rejected by DTAM endpoint');
      return true;
    } else {
      logWarning(`Unexpected error: ${error.response?.status || error.message}`);
      return false;
    }
  }
}

async function testPermissionCheck() {
  logTest('Permission Check (REVIEWER cannot create staff)');
  try {
    await axios.post(
      `${DTAM_API}/staff`,
      {
        email: 'another-staff@dtam.go.th',
        password: 'Test@123',
        firstName: 'Test',
        lastName: 'User',
        employeeId: 'EMP-TEST',
        role: 'AUDITOR',
      },
      {
        headers: { Authorization: `Bearer ${staffToken}` },
      },
    );
    logError('REVIEWER was allowed to create staff (PERMISSION ISSUE!)');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      logSuccess('REVIEWER correctly denied permission to create staff');
      return true;
    } else {
      logWarning(`Unexpected error: ${error.response?.status || error.message}`);
      return false;
    }
  }
}

async function testListStaff() {
  logTest('List DTAM Staff (view_staff permission required)');
  try {
    const response = await axios.get(`${DTAM_API}/staff`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });

    if (response.status === 200 && response.data.success) {
      logSuccess(`Staff list retrieved: ${response.data.staff.length} staff members`);
      return true;
    } else {
      logError('Unexpected response structure');
      return false;
    }
  } catch (error) {
    logError(`List staff failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     CLEAN ARCHITECTURE AUTHENTICATION TEST SUITE          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`API Base URL: ${BASE_URL}`, 'yellow');
  log(`Farmer API:   ${FARMER_API}`, 'yellow');
  log(`DTAM API:     ${DTAM_API}\n`, 'yellow');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    // Farmer Tests
    {
      section: 'FARMER AUTHENTICATION',
      tests: [
        { name: 'Farmer Registration', fn: testFarmerRegistration },
        { name: 'Farmer Login', fn: testFarmerLogin },
        { name: 'Farmer Profile Access', fn: testFarmerProfile },
      ],
    },

    // DTAM Tests
    {
      section: 'DTAM STAFF AUTHENTICATION',
      tests: [
        { name: 'DTAM Admin Login', fn: testDTAMAdminLogin },
        { name: 'DTAM Staff Creation', fn: testDTAMStaffCreation },
        { name: 'DTAM Staff Login', fn: testDTAMStaffLogin },
        { name: 'DTAM Staff Profile Access', fn: testDTAMStaffProfile },
      ],
    },

    // Security Tests
    {
      section: 'SECURITY & PERMISSIONS',
      tests: [
        { name: 'Token Separation', fn: testTokenSeparation },
        { name: 'Permission Check', fn: testPermissionCheck },
        { name: 'List Staff (with permission)', fn: testListStaff },
      ],
    },
  ];

  for (const section of tests) {
    logSection(section.section);

    for (const test of section.tests) {
      results.total++;
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
      console.log('');
    }
  }

  // Summary
  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'yellow');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, 'red');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%\n`, 'cyan');

  if (results.failed === 0) {
    log('🎉 ALL TESTS PASSED! 🎉\n', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED ⚠️\n', 'red');
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
