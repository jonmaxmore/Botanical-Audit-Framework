/**
 * Quick UAT API Test
 * Tests basic authentication and API endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let farmerToken = '';
let reviewerToken = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    await fn();
    await log(`✅ ${name}`, colors.green);
    return true;
  } catch (error) {
    await log(`❌ ${name}`, colors.red);
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
    return false;
  }
}

async function main() {
  console.log('\n🧪 Starting Quick UAT API Tests...\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Test 1: Health Check
  results.total++;
  if (await test('Health Check', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    if (!response.data) throw new Error('No response data');
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 2: Farmer Login
  results.total++;
  if (await test('Farmer Login (farmer001)', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'farmer001',
      password: 'Test@1234',
    });
    if (!response.data.token) throw new Error('No token received');
    farmerToken = response.data.token;
    await log(`   Token: ${farmerToken.substring(0, 20)}...`, colors.blue);
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 3: Get Farmer Profile
  results.total++;
  if (await test('Get Farmer Profile', async () => {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    if (!response.data) throw new Error('No profile data');
    await log(`   User: ${response.data.firstName} ${response.data.lastName}`, colors.blue);
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 4: DTAM Reviewer Login
  results.total++;
  if (await test('DTAM Reviewer Login (reviewer001)', async () => {
    const response = await axios.post(`${BASE_URL}/api/dtam/auth/login`, {
      username: 'reviewer001',
      password: 'Rev@1234',
    });
    if (!response.data.token) throw new Error('No token received');
    reviewerToken = response.data.token;
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 5: List Farms (Farmer)
  results.total++;
  if (await test('List Farms (Farmer)', async () => {
    const response = await axios.get(`${BASE_URL}/api/farm`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    await log(`   Farms found: ${response.data.length || 0}`, colors.blue);
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 6: List Applications (DTAM)
  results.total++;
  if (await test('List Applications (DTAM Reviewer)', async () => {
    const response = await axios.get(`${BASE_URL}/api/applications`, {
      headers: { Authorization: `Bearer ${reviewerToken}` },
    });
    await log(`   Applications found: ${response.data.length || 0}`, colors.blue);
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.total}`);
  await log(`✅ Passed: ${results.passed}`, colors.green);
  await log(`❌ Failed: ${results.failed}`, colors.red);
  console.log(`📈 Pass Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(50) + '\n');

  if (results.failed === 0) {
    await log('🎉 All tests passed!', colors.green);
    process.exit(0);
  } else {
    await log('⚠️  Some tests failed', colors.yellow);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
