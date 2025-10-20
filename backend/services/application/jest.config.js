/**
 * Jest Configuration - Application Service
 *
 * Test configuration for GACP Application Service.
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-16
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test match patterns
  testMatch: ['**/tests/**/*.test.js', '**/?(*.)+(spec|test).js'],

  // Coverage configuration
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],

  // Test timeout
  testTimeout: 30000,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles (async operations)
  detectOpenHandles: true,

  // Maximum workers (run serially to avoid port conflicts)
  maxWorkers: 1,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Module paths
  moduleDirectories: ['node_modules', '../../../node_modules'],

  // Transform (none needed for Node.js)
  transform: {},
};
