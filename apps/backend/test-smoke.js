/**
 * Smoke Test Script for Backend API
 * Tests critical endpoints to ensure system is operational
 *
 * Usage: node test-smoke.js
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const USE_HTTPS = BASE_URL.startsWith('https');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Make HTTP request
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = USE_HTTPS ? https : http;

    const req = protocol.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }

    req.setTimeout(10000); // 10 second timeout
    req.end();
  });
}

/**
 * Test: GET request
 */
async function testGet(name, path, expectedStatus = 200, _expectedBody = null) {
  results.total++;

  const url = new URL(path, BASE_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || (USE_HTTPS ? 443 : 80),
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const startTime = Date.now();
    const response = await makeRequest(options);
    const duration = Date.now() - startTime;

    const passed = response.statusCode === expectedStatus;

    if (passed) {
      results.passed++;
      console.log(`${colors.green}✓${colors.reset} ${name} (${duration}ms)`);
    } else {
      results.failed++;
      console.log(
        `${colors.red}✗${colors.reset} ${name} - Expected ${expectedStatus}, got ${response.statusCode}`
      );
      console.log(
        `${colors.yellow}   Response: ${JSON.stringify(response.body).substring(0, 200)}${colors.reset}`
      );
    }

    results.tests.push({
      name,
      path,
      method: 'GET',
      expected: expectedStatus,
      actual: response.statusCode,
      duration,
      passed,
      response: response.body
    });

    return response;
  } catch (error) {
    results.failed++;
    console.log(`${colors.red}✗${colors.reset} ${name} - ${error.message}`);

    results.tests.push({
      name,
      path,
      method: 'GET',
      expected: expectedStatus,
      actual: 'ERROR',
      duration: 0,
      passed: false,
      error: error.message
    });

    return null;
  }
}

/**
 * Test: POST request
 */
async function testPost(name, path, data, expectedStatus = 200, token = null) {
  results.total++;

  const url = new URL(path, BASE_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || (USE_HTTPS ? 443 : 80),
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(data))
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const startTime = Date.now();
    const response = await makeRequest(options, data);
    const duration = Date.now() - startTime;

    const passed = response.statusCode === expectedStatus;

    if (passed) {
      results.passed++;
      console.log(`${colors.green}✓${colors.reset} ${name} (${duration}ms)`);
    } else {
      results.failed++;
      console.log(
        `${colors.red}✗${colors.reset} ${name} - Expected ${expectedStatus}, got ${response.statusCode}`
      );
    }

    results.tests.push({
      name,
      path,
      method: 'POST',
      expected: expectedStatus,
      actual: response.statusCode,
      duration,
      passed,
      response: response.body
    });

    return response;
  } catch (error) {
    results.failed++;
    console.log(`${colors.red}✗${colors.reset} ${name} - ${error.message}`);

    results.tests.push({
      name,
      path,
      method: 'POST',
      expected: expectedStatus,
      actual: 'ERROR',
      duration: 0,
      passed: false,
      error: error.message
    });

    return null;
  }
}

/**
 * Run all smoke tests
 */
async function runSmokeTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}${colors.reset} BACKEND SMOKE TEST`);
  console.log(`${colors.cyan}${colors.reset} Target: ${BASE_URL}`);
  console.log('='.repeat(60) + '\n');

  // Test 1: Health Checks
  console.log(`${colors.yellow}[1/5] Health Checks${colors.reset}`);
  await testGet('Server Health Check', '/health', 200);
  await testGet('DTAM Auth Health', '/api/auth-dtam/health', 200);

  // Test 2: Authentication - Farmer
  console.log(`\n${colors.yellow}[2/5] Farmer Authentication${colors.reset}`);

  // Register new farmer (should succeed or fail with 409 if exists)
  const randomEmail = `test-${Date.now()}@example.com`;
  const registerResponse = await testPost(
    'Farmer Registration',
    '/api/auth-farmer/register',
    {
      email: randomEmail,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '0812345678'
    },
    201
  );

  let farmerToken = null;
  if (registerResponse && registerResponse.body && registerResponse.body.data) {
    farmerToken = registerResponse.body.data.token;
  }

  // Login farmer
  const loginResponse = await testPost(
    'Farmer Login',
    '/api/auth-farmer/login',
    {
      email: randomEmail,
      password: 'TestPassword123!'
    },
    200
  );

  if (!farmerToken && loginResponse && loginResponse.body && loginResponse.body.data) {
    farmerToken = loginResponse.body.data.token;
  }

  // Verify token
  if (farmerToken) {
    await testGet('Farmer Token Verification', `/api/auth-farmer/verify?token=${farmerToken}`, 200);
  } else {
    console.log(
      `${colors.yellow}⚠${colors.reset} Skipping token verification - no token available`
    );
    results.skipped++;
  }

  // Test 3: Authentication - DTAM
  console.log(`\n${colors.yellow}[3/5] DTAM Authentication${colors.reset}`);

  // DTAM register should be blocked
  await testPost(
    'DTAM Registration (should be blocked)',
    '/api/auth-dtam/register',
    {
      username: 'test-dtam',
      password: 'TestPassword123!',
      email: 'test@dtam.go.th'
    },
    403
  );

  // Test 4: Application API (if token available)
  console.log(`\n${colors.yellow}[4/5] Application APIs${colors.reset}`);

  if (farmerToken) {
    // Try to get applications
    const url = new URL('/api/applications', BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (USE_HTTPS ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      }
    };

    try {
      const startTime = Date.now();
      const response = await makeRequest(options);
      const duration = Date.now() - startTime;

      results.total++;
      if (response.statusCode === 200 || response.statusCode === 401) {
        results.passed++;
        console.log(
          `${colors.green}✓${colors.reset} Get Applications Endpoint (${duration}ms) - Status: ${response.statusCode}`
        );
      } else {
        results.failed++;
        console.log(
          `${colors.red}✗${colors.reset} Get Applications Endpoint - Unexpected status: ${response.statusCode}`
        );
      }
    } catch (error) {
      results.total++;
      results.failed++;
      console.log(`${colors.red}✗${colors.reset} Get Applications Endpoint - ${error.message}`);
    }
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} Skipping Application API tests - no auth token`);
    results.skipped++;
  }

  // Test 5: Dashboard API
  console.log(`\n${colors.yellow}[5/5] Dashboard APIs${colors.reset}`);

  await testGet('Dashboard Health Check', '/api/dashboard/health', 200);

  if (farmerToken) {
    // Try to get dashboard stats
    const url = new URL('/api/dashboard/stats/realtime', BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (USE_HTTPS ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      }
    };

    try {
      const startTime = Date.now();
      const response = await makeRequest(options);
      const duration = Date.now() - startTime;

      results.total++;
      if (
        response.statusCode === 200 ||
        response.statusCode === 401 ||
        response.statusCode === 503
      ) {
        results.passed++;
        console.log(
          `${colors.green}✓${colors.reset} Dashboard Realtime Stats (${duration}ms) - Status: ${response.statusCode}`
        );
      } else {
        results.failed++;
        console.log(
          `${colors.red}✗${colors.reset} Dashboard Realtime Stats - Unexpected status: ${response.statusCode}`
        );
      }
    } catch (error) {
      results.total++;
      results.failed++;
      console.log(`${colors.red}✗${colors.reset} Dashboard Realtime Stats - ${error.message}`);
    }
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} Skipping Dashboard API tests - no auth token`);
    results.skipped++;
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}SMOKE TEST RESULTS${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`Total Tests:   ${results.total}`);
  console.log(`${colors.green}Passed:${colors.reset}        ${results.passed}`);
  console.log(`${colors.red}Failed:${colors.reset}        ${results.failed}`);
  console.log(`${colors.yellow}Skipped:${colors.reset}       ${results.skipped}`);

  const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  console.log(`Success Rate:  ${successRate}%`);
  console.log('='.repeat(60) + '\n');

  // Exit with appropriate code
  if (results.failed > 0) {
    console.log(`${colors.red}❌ SMOKE TEST FAILED${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ SMOKE TEST PASSED${colors.reset}\n`);
    process.exit(0);
  }
}

// Run tests
console.log(`${colors.cyan}Starting Backend Smoke Tests...${colors.reset}`);
console.log(`Checking if backend is running at ${BASE_URL}...\n`);

runSmokeTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
