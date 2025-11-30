/**
 * Manual Test Script for Priority 3: Authentication & Security
 * Run with: node __tests__/manual-auth-test.js
 */

const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3004';
const TESTS = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, body: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test runner
async function runTest(name, testFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await testFn();
    console.log(`✅ PASSED: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }
}

// Test 1: AI Routes - Unauthenticated Request
TESTS.push({
  name: 'AI Routes - Reject unauthenticated requests',
  fn: async () => {
    const res = await makeRequest('POST', '/api/ai/fertilizer/recommend', {
      farmId: '123',
      cultivationCycleId: '456',
    });

    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`);
    }

    if (res.body.success !== false) {
      throw new Error('Expected success: false');
    }
  },
});

// Test 2: Inspection Routes - Unauthenticated Request
TESTS.push({
  name: 'Inspection Routes - Reject unauthenticated requests',
  fn: async () => {
    const res = await makeRequest('POST', '/api/inspections/123/schedule', {
      scheduledDate: '2025-12-01',
      scheduledTime: '10:00',
      type: 'video_call',
    });

    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`);
    }
  },
});

// Test 3: Error Format
TESTS.push({
  name: 'Error Handling - Standardized format',
  fn: async () => {
    const res = await makeRequest('POST', '/api/ai/fertilizer/recommend', {});

    if (!res.body.hasOwnProperty('success')) {
      throw new Error('Missing "success" field');
    }

    if (!res.body.hasOwnProperty('error') && !res.body.hasOwnProperty('message')) {
      throw new Error('Missing error information');
    }
  },
});

// Test 4: 404 Handling
TESTS.push({
  name: 'Error Handling - 404 for non-existent routes',
  fn: async () => {
    const res = await makeRequest('GET', '/api/nonexistent-route');

    if (res.status !== 404) {
      throw new Error(`Expected 404, got ${res.status}`);
    }

    if (res.body.success !== false) {
      throw new Error('Expected success: false');
    }
  },
});

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('  Priority 3: Authentication & Security - Manual Tests');
  console.log('='.repeat(60));
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log('Make sure the backend server is running!\n');

  // Check if server is running
  try {
    await makeRequest('GET', '/health');
    console.log('✅ Server is running\n');
  } catch (error) {
    console.log('❌ Server is not running!');
    console.log('   Please start the server with: npm run dev');
    process.exit(1);
  }

  // Run all tests
  for (const test of TESTS) {
    await runTest(test.name, test.fn);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  Test Summary');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${TESTS.length}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / TESTS.length) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));

  process.exit(failedTests > 0 ? 1 : 0);
}

main();
