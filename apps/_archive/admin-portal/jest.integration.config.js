/** @type {import('jest').Config} */
module.exports = {
  displayName: 'integration',
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test match patterns
  testMatch: ['**/tests/integration/**/*.test.ts', '**/tests/integration/**/*.integration.test.ts'],

  // Setup files
  globalSetup: './tests/integration/global-setup.ts',
  globalTeardown: './tests/integration/global-teardown.ts',
  setupFilesAfterEnv: ['./tests/integration/jest-setup.ts'],

  // Coverage
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.tsx',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Timeouts
  testTimeout: 30000, // 30 seconds for integration tests

  // Transform
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  // Module extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Verbose output
  verbose: true,
};
