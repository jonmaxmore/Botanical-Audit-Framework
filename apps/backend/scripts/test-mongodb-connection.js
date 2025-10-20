/**
 * MongoDB Connection Test Script
 * Tests resilience and reconnection capabilities
 */

const mongoManager = require('../config/mongodb-manager');
const logger = require('../shared').logger;
const testLogger = logger.createLogger('mongodb-test');

async function runTests() {
  testLogger.info('=== MONGODB CONNECTION TEST SUITE ===');

  // Test 1: Basic connection
  testLogger.info('Test 1: Basic connection test');
  const connected = await mongoManager.connect();
  if (!connected) {
    testLogger.error('Initial connection failed, check your MongoDB URI');
    process.exit(1);
  }

  // Test 2: Health check
  testLogger.info('Test 2: Health check');
  const health = await mongoManager.healthCheck();
  testLogger.info(`Health check status: ${health.status}`);
  testLogger.info(`Collections found: ${Object.keys(health.collections || {}).length}`);

  // Test 3: Forced disconnect and reconnect
  testLogger.info('Test 3: Testing disconnect and auto-reconnect');
  testLogger.info('Forcing disconnect...');
  await mongoManager.disconnect();

  // Wait for auto-reconnect
  testLogger.info('Waiting for auto-reconnect (10s)...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Check if reconnected
  const status = mongoManager.getStatus();
  testLogger.info(`Reconnection status: ${status.isConnected ? 'SUCCESS' : 'FAILED'}`);

  // Test 4: Force reconnect API
  testLogger.info('Test 4: Testing force reconnect API');
  const reconnected = await mongoManager.forceReconnect();
  testLogger.info(`Force reconnect: ${reconnected ? 'SUCCESS' : 'FAILED'}`);

  testLogger.info('=== TESTS COMPLETED ===');

  // Keep process running to observe any connection events
  testLogger.info('Monitoring connection for 30 seconds...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  testLogger.info('Test suite complete, exiting');
  process.exit(0);
}

// Run the tests
runTests().catch(err => {
  testLogger.error('Test suite error:', err);
  process.exit(1);
});
