/**
 * Jest Setup for Integration Tests
 * Runs before each test file
 */

import { clearAllMocks } from './helpers';

// Set test timeouts
jest.setTimeout(30000); // 30 seconds

// Clear all mocks before each test
beforeEach(() => {
  clearAllMocks();
});

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
