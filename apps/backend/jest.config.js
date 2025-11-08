/**
 * Jest configuration for Backend (Node.js) - NOT Next.js
 * Prevents Next.js config from interfering with backend tests
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/modules'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/build/'
  ],
  moduleFileExtensions: ['js', 'ts', 'json'],
  verbose: true,
  maxWorkers: 1, // Run tests serially to avoid DB conflicts
  detectOpenHandles: true, // Detect async operations that prevent Jest from exiting
  forceExit: false, // Don't force exit - fix the root cause instead
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'], // Global cleanup
  collectCoverageFrom: [
    'modules/**/domain/**/*.js',
    'modules/**/application/**/*.js',
    'modules/**/infrastructure/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80
    }
  }
};
