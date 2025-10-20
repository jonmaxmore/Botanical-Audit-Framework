const http = require('http');
const logger = require('./apps/backend/shared').logger;

/**
 * Test Backend Server Health and Endpoints
 * Tests server startup and API connectivity
 */

const appLogger = logger.createLogger('backend-test');

const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: 'API Root',
    path: '/api',
    method: 'GET',
    expectedStatus: [200, 404],
  },
  {
    name: 'Health Detailed',
    path: '/api/health',
    method: 'GET',
    expectedStatus: 200,
  },
];

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoint(test, port = 5001) {
  appLogger.info(`\nTesting: ${test.name}`);
  appLogger.info(`  Path: ${test.path}`);

  try {
    const startTime = Date.now();

    const options = {
      hostname: 'localhost',
      port: port,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await makeRequest(options);
    const responseTime = Date.now() - startTime;

    // Check status code
    const expectedStatuses = Array.isArray(test.expectedStatus)
      ? test.expectedStatus
      : [test.expectedStatus];

    if (expectedStatuses.includes(response.statusCode)) {
      appLogger.info(`  ✅ Status: ${response.statusCode} (${responseTime}ms)`);

      // Try to parse JSON response
      try {
        const json = JSON.parse(response.data);
        appLogger.info(`  Response: ${JSON.stringify(json, null, 2).substring(0, 200)}`);
      } catch (e) {
        appLogger.info(`  Response: ${response.data.substring(0, 100)}`);
      }

      return { success: true, responseTime, statusCode: response.statusCode };
    } else {
      appLogger.error(`  ❌ Status: ${response.statusCode} (expected ${test.expectedStatus})`);
      return { success: false, statusCode: response.statusCode };
    }
  } catch (error) {
    appLogger.error(`  ❌ Error: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      appLogger.info(`  💡 Backend server is not running on port ${port}`);
    }

    return { success: false, error: error.message };
  }
}

async function checkServerRunning(port = 5001) {
  appLogger.info(`\n${'='.repeat(60)}`);
  appLogger.info('Checking Backend Server');
  appLogger.info(`${'='.repeat(60)}`);
  appLogger.info(`Port: ${port}\n`);

  try {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 3000,
    };

    await makeRequest(options);
    appLogger.info('✅ Server is running\n');
    return true;
  } catch (error) {
    appLogger.warn('⚠️  Server is not running');
    appLogger.info('💡 Start the backend server with: cd apps/backend && node server.js\n');
    return false;
  }
}

async function runTests() {
  appLogger.info('\n🔧 Backend Server Test Suite');
  appLogger.info('='.repeat(60));

  const port = process.env.PORT || 5001;

  // Check if server is running
  const isRunning = await checkServerRunning(port);

  if (!isRunning) {
    appLogger.error('\n❌ Backend server is not accessible');
    appLogger.info('\nTo start the backend server:');
    appLogger.info('  1. cd apps/backend');
    appLogger.info('  2. node server.js');
    appLogger.info('     or');
    appLogger.info('     pnpm dev:backend\n');
    process.exit(1);
  }

  // Run endpoint tests
  const results = [];

  for (const test of tests) {
    const result = await testEndpoint(test, port);
    results.push({
      name: test.name,
      ...result,
    });

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  appLogger.info('\n\n📊 Test Summary');
  appLogger.info('='.repeat(60));

  let successCount = 0;
  let failCount = 0;

  results.forEach(result => {
    if (result.success) {
      appLogger.info(`✅ ${result.name}: Success (${result.responseTime}ms)`);
      successCount++;
    } else {
      appLogger.info(`❌ ${result.name}: Failed`);
      failCount++;
    }
  });

  const avgTime =
    results.filter(r => r.responseTime).reduce((sum, r) => sum + r.responseTime, 0) /
    results.filter(r => r.responseTime).length;

  appLogger.info('\n' + '='.repeat(60));
  appLogger.info(`Total: ${results.length} | Success: ${successCount} | Failed: ${failCount}`);
  appLogger.info(`Average Response Time: ${avgTime.toFixed(0)}ms`);
  appLogger.info('='.repeat(60) + '\n');

  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  appLogger.error('Fatal error:', error);
  process.exit(1);
});
