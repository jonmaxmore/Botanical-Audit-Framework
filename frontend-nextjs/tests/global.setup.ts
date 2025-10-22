import { test as setup } from '@playwright/test';

/**
 * Global Setup: Create Test Users
 * 
 * This runs once before all tests to ensure test users exist in the database.
 * Fixes BUG #1: Login test user doesn't exist
 */

const BACKEND_URL = 'http://localhost:3004';

const TEST_USERS = [
  {
    email: 'farmer-test-001@example.com',
    password: 'TestPass123!',
    name: 'สมชาย ใจดี',
    phoneNumber: '0812345678',
    role: 'FARMER'
  },
  {
    email: 'officer-test-001@example.com',
    password: 'TestPass123!',
    name: 'สมหญิง ดีใจ',
    phoneNumber: '0823456789',
    role: 'DTAM_OFFICER'
  }
];

setup('create test users', async ({ request }) => {
  console.log('🔧 Setting up test users...');

  for (const user of TEST_USERS) {
    try {
      // Try to register the user
      const response = await request.post(`${BACKEND_URL}/api/auth/register`, {
        data: user,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.ok()) {
        const data = await response.json();
        console.log(`✅ Created test user: ${user.email} (${user.role})`);
      } else {
        const status = response.status();
        if (status === 400 || status === 409) {
          // User already exists - that's fine
          console.log(`ℹ️  Test user already exists: ${user.email}`);
        } else {
          console.warn(`⚠️  Failed to create ${user.email}: ${status}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error);
      // Don't fail setup - user might already exist
    }
  }

  console.log('✅ Test user setup complete\n');
});
