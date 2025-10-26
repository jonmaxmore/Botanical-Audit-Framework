/**
 * Playwright Configuration for GACP System E2E Tests
 * 
 * This configuration handles end-to-end testing across all three portals:
 * - Farmer Portal (localhost:3001)
 * - Admin/DTAM Portal (localhost:3002)
 * - Certificate Verification Portal (localhost:3003)
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  /* Maximum time one test can run */
  timeout: 120000,

  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential for workflow tests

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : 1, // Serial execution for E2E

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for Farmer Portal */
    baseURL: 'http://localhost:3001',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Timeout for each action */
    actionTimeout: 15000,

    /* Navigation timeout */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - authenticate users
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Main E2E tests
    {
      name: 'e2e-chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },

    // Optional: Test on Firefox
    // {
    //   name: 'e2e-firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  /* Global timeout for entire test run */
  globalTimeout: process.env.CI ? 1800000 : 3600000, // 30 min CI, 60 min local

  /* Expect timeout for assertions */
  expect: {
    timeout: 10000,
  },

  /* Output folder for test artifacts */
  outputDir: 'test-results/e2e-artifacts',

  /* Folder for test artifacts such as screenshots, videos, traces */
  snapshotDir: 'tests/e2e/__snapshots__',

  /* Whether to preserve output between test runs */
  preserveOutput: 'failures-only',
});
