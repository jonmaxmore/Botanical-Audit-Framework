module.exports = {
  projects: [
    '<rootDir>/apps/admin-portal',
    '<rootDir>/apps/certificate-portal',
    '<rootDir>/apps/farmer-portal',
    '<rootDir>/apps/backend'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/frontend-nextjs/tests/e2e/',
    '<rootDir>/frontend-nextjs/test-results/',
    '<rootDir>/frontend-nextjs/playwright-report/'
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: false,
  coverageProvider: 'v8',
  verbose: true
};
