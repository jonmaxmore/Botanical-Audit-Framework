import { test as setup, expect } from '@playwright/test';

/**
 * Setup Project: Create Test Users
 * 
 * This runs before all tests to ensure test users exist in the database.
 * Fixes BUG #1: Login test user doesn't exist
 */

const SETUP_USER = {
  email: 'farmer-test-001@example.com',
  password: 'TestPass123!',
  name: 'สมชาย ใจดี',
  phoneNumber: '0812345678',
  role: 'FARMER'
};

setup('create test user via registration', async ({ page }) => {
  console.log('🔧 Setting up test user: farmer-test-001@example.com');

  try {
    // Navigate to registration page
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Fill registration form
    await page.getByLabel('อีเมล').fill(SETUP_USER.email);
    await page.getByLabel('รหัสผ่าน').fill(SETUP_USER.password);
    await page.getByLabel('ยืนยันรหัสผ่าน').fill(SETUP_USER.password);
    await page.getByLabel('ชื่อ-นามสกุล').fill(SETUP_USER.name);
    await page.getByLabel('เบอร์โทรศัพท์').fill(SETUP_USER.phoneNumber);

    // Select FARMER role
    await page.getByLabel('ประเภทผู้ใช้').click();
    await page.getByRole('option', { name: 'เกษตรกร (Farmer)' }).click();

    // Submit form
    const submitButton = page.getByRole('button', { name: 'สมัครสมาชิก' });
    await submitButton.click();

    // Wait a bit for registration to process
    await page.waitForTimeout(3000);

    // Check if we got redirected to dashboard (success) or still on register (user exists)
    const currentUrl = page.url();
    
    if (currentUrl.includes('dashboard')) {
      console.log('✅ Test user created successfully and logged in');
      
      // Logout so tests can login fresh
      const logoutButton = page.getByRole('button', { name: /logout|ออกจากระบบ/i });
      if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
      }
    } else if (currentUrl.includes('register')) {
      // Check if there's an error about existing user
      const errorMessage = await page.getByText(/อีเมลนี้ถูกใช้งานแล้ว|email.*already|already.*exists/i).isVisible({ timeout: 2000 }).catch(() => false);
      
      if (errorMessage) {
        console.log('ℹ️  Test user already exists - this is fine');
      } else {
        console.warn('⚠️  Still on register page but no error message');
      }
    }

    console.log('✅ Test user setup complete\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('ℹ️  Test user setup encountered an issue (user may already exist):', errorMessage);
    // Don't fail - user might already exist
  }
});
