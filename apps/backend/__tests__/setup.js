/**
 * ✅ Jest Setup (Botanical-Audit-Framework)
 * Purpose:
 *  - Ensure all async resources (DB, server, timers) are closed properly after test.
 *  - Prevent "Jest did not exit one second after the test run has completed" warning.
 */

const logger = console;
let mongoManager = null;
let redisService = null;
let startedServer = null;

/**
 * 🧩 Safe dynamic import helper
 * Because some services may be TypeScript or ESM
 */
function safeRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    logger.warn(`⚠️  Optional module not found: ${modulePath}`);
    return null;
  }
}

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep error and warn for debugging
  error: jest.fn(console.error),
  warn: jest.fn(console.warn),
  // Suppress info and debug in tests
  info: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

/**
 * 🧠 Before all tests start
 * - Load services dynamically to prepare teardown.
 */
beforeAll(async () => {
  try {
    // Load MongoDB manager
    mongoManager = safeRequire('../config/mongodb-manager');

    // Load Redis service (if exists)
    redisService = safeRequire('../services/redis-service');

    // If Express app/server started globally in tests
    startedServer = global.__APP_SERVER__;

    logger.info('🧪 Jest setup initialized.');
  } catch (err) {
    logger.error('❌ Jest setup initialization failed:', err);
  }
});

// Global cleanup for all tests
afterEach(() => {
  // Clear all timers after each test
  jest.clearAllTimers();
});

/**
 * 🧹 After all tests complete
 * - Close DB, Redis, Server, Timers safely.
 */
afterAll(async () => {
  try {
    // 🧩 Close MongoDB via mongodb-manager (if connected)
    if (mongoManager && typeof mongoManager.disconnect === 'function') {
      await mongoManager.disconnect();
      logger.info('✅ MongoDB disconnected via mongodb-manager');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 🧩 Close mongoose connection directly (fallback)
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close(false); // false = force close
        logger.info('✅ Mongoose connection closed');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      // Mongoose not used in this test
    }

    // 🧩 Close Redis (if connected)
    if (redisService && typeof redisService.disconnect === 'function') {
      await redisService.disconnect();
      logger.info('✅ Redis disconnected');
    }

    // 🧩 Close Express server (if started)
    if (startedServer && typeof startedServer.close === 'function') {
      await new Promise(resolve => {
        startedServer.close(() => {
          logger.info('✅ Express server closed');
          resolve();
        });
      });
    }

    // 🧩 Restore real timers and clear all
    jest.useRealTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();

    // Give time for all async operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info('🎉 Jest teardown completed successfully');
  } catch (error) {
    logger.error('❌ Jest teardown error:', error);
    // Don't throw - allow Jest to exit even if cleanup fails
  }
});

// Increase timeout for integration tests
jest.setTimeout(30000); // 30 seconds for E2E tests
