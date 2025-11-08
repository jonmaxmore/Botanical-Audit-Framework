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

afterAll(() => {
  // Ensure real timers are restored
  jest.useRealTimers();
  
  // Clear any remaining timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Increase timeout for integration tests
jest.setTimeout(10000); // 10 seconds
