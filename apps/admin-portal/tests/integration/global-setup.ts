/**
 * Global Setup for Integration Tests
 * Runs once before all test suites
 */

import { setupTestEnvironment } from './setup';

export default async function globalSetup() {
  console.log('🚀 Setting up integration test environment...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  process.env.REDIS_URL_TEST = process.env.REDIS_URL_TEST || 'redis://localhost:6379/1';

  // Initialize test environment
  try {
    await setupTestEnvironment();
    console.log('✅ Test environment ready');
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    throw error;
  }
}
