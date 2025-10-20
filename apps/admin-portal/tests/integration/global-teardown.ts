/**
 * Global Teardown for Integration Tests
 * Runs once after all test suites
 */

import { teardownTestEnvironment } from './setup';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up integration test environment...');

  try {
    await teardownTestEnvironment();
    console.log('✅ Test environment cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test environment:', error);
    throw error;
  }
}
