/**
 * Global Jest Setup
 * Ensures all timers and async resources are properly cleaned up
 */

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

// Global cleanup for all tests
afterEach(() => {
  // Clear all timers after each test
  jest.clearAllTimers();
});

afterAll(async () => {
  // Ensure real timers are restored
  jest.useRealTimers();
  
  // Clear any remaining timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Disconnect database if connected
  try {
    const mongoManager = require('../config/mongodb-manager');
    if (mongoManager && typeof mongoManager.disconnect === 'function') {
      await mongoManager.disconnect();
      // Wait for disconnect to complete
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    // Database not initialized in this test - safe to ignore
    console.error('Database cleanup warning:', error.message);
  }
  
  // Close any remaining mongoose connections
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    // Mongoose not used in this test
  }
  
  // Give time for all async operations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Increase timeout for integration tests
jest.setTimeout(30000); // 30 seconds for E2E tests
