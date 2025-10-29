import { test, expect } from '@playwright/test';

/**
 * Test Case 1.2: User Login Flow
 *
 * Priority: CRITICAL
 * Coverage: Login page, authentication, token storage, redirect
 *
 * Testing Mandate: Zero bugs before QA handoff
 */

test.describe('User Login Flow', () => {
  // Test user credentials (assumes user exists from registration tests)
  const TEST_EMAIL = 'farmer-test-001@example.com';
  const TEST_PASSWORD = 'TestPass123!';

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('TC 1.2.1: Login page renders correctly', async ({ page }) => {
    // Verify URL
    await expect(page).toHaveURL(/.*login/);

    // Verify form fields exist
    await expect(page.getByLabel(/email|อีเมล/i)).toBeVisible();
    await expect(page.getByLabel(/password|รหัสผ่าน/i)).toBeVisible();

    // Verify login button exists
    const loginButton = page.getByRole('button', { name: /login|เข้าสู่ระบบ|sign in/i });
    await expect(loginButton).toBeVisible();

    // Check for "Register" link
    const registerLink = page.getByRole('link', { name: /register|ลงทะเบียน|สมัครสมาชิก/i });
    await expect(registerLink.first()).toBeVisible();

    console.log('✅ Login page renders correctly');
  });

  test('TC 1.2.2: Form validation - required fields', async ({ page }) => {
    // Try to submit empty form
    const loginButton = page.getByRole('button', { name: /login|เข้าสู่ระบบ|sign in/i });
    await loginButton.click();

    // Wait for validation
    await page.waitForTimeout(1000);

    // Check email field validity
    const emailInput = page.getByLabel(/email|อีเมล/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    expect(isInvalid).toBeTruthy();

    console.log('✅ Form validation works for required fields');
  });

  test('TC 1.2.3: Form validation - invalid email format', async ({ page }) => {
    // Fill with invalid email
    await page.getByLabel(/email|อีเมล/i).fill('invalid-email');
    await page.getByLabel(/password|รหัสผ่าน/i).fill('SomePassword123!');

    const loginButton = page.getByRole('button', { name: /login|เข้าสู่ระบบ|sign in/i });
    await loginButton.click();

    // Wait for validation
    await page.waitForTimeout(1000);

    // Should still be on login page or show error
    const emailInput = page.getByLabel(/email|อีเมล/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    expect(isInvalid).toBeTruthy();

    console.log('✅ Email format validation works');
  });

  test('TC 1.2.4: Login with invalid credentials', async ({ page }) => {
    // Try to login with wrong credentials
    await page.getByLabel(/email|อีเมล/i).fill('wrong@example.com');
    await page.getByLabel(/password|รหัสผ่าน/i).fill('WrongPassword123!');

    const loginButton = page.getByRole('button', { name: /login|เข้าสู่ระบบ|sign in/i });
    await loginButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Should show error message or remain on login page
    const currentUrl = page.url();
    const isOnLoginPage = /login/.test(currentUrl);

    expect(isOnLoginPage).toBeTruthy();

    console.log('✅ Invalid credentials handled correctly');
  });

  test('TC 1.2.5: Successful login flow', async ({ page }) => {
    console.log(`🧪 Testing login with email: ${TEST_EMAIL}`);

    // Fill login form
    await page.getByLabel(/email|อีเมล/i).fill(TEST_EMAIL);
    await page.getByLabel(/password|รหัสผ่าน/i).fill(TEST_PASSWORD);

    const loginButton = page.getByRole('button', { name: /login|เข้าสู่ระบบ|sign in/i });
    await loginButton.click();

    // Wait for navigation
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify user is logged in
    const userMenu = page.getByRole('button', { name: /logout|ออกจากระบบ|profile|โปรไฟล์/i });
    await expect(userMenu.first()).toBeVisible({ timeout: 10000 });

    console.log('✅ Successful login with redirect to dashboard');
  });

  test('TC 1.2.6: Token stored in localStorage', async ({ page }) => {
    // Login
    await page.getByLabel(/email|อีเมล/i).fill(TEST_EMAIL);
    await page.getByLabel(/password|รหัสผ่าน/i).fill(TEST_PASSWORD);

    const loginButton = page.getByRole('button', { name: /login|เข้าสู่ระบบ|sign in/i });
    await loginButton.click();

    // Wait for login to complete
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });

    // Check localStorage for token
    const token = await page.evaluate(() => {
      // Check common token storage keys
      return (
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('jwt')
      );
    });

    expect(token).toBeTruthy();
    expect(token).not.toBe('');

    console.log('✅ JWT token stored in localStorage');
  });

  test('TC 1.2.7: Retry logic on network issues', async ({ page }) => {
    // Enable slow network
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024, // 50 KB/s
      uploadThroughput: 20 * 1024, // 20 KB/s
      latency: 500, // 500ms latency
    });

    // Try to login
    await page.getByLabel(/email|อีเมล/i).fill(TEST_EMAIL);
    await page.getByLabel(/password|รหัสผ่าน/i).fill(TEST_PASSWORD);

    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    const loginButton = page.getByRole('button', { name: /login|เข้าสู่ระบบ|sign in/i });
    await loginButton.click();

    // Wait for login (should retry if needed)
    await page.waitForURL(/.*dashboard/, { timeout: 30000 });

    // Check if retry happened (look for retry messages in console)
    const hasRetryLogs = consoleMessages.some(
      (msg) => msg.includes('retry') || msg.includes('Retry') || msg.includes('attempt')
    );

    // Disable network throttling
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });

    console.log(`✅ Login succeeded with network throttling (Retry occurred: ${hasRetryLogs})`);
  });

  test('TC 1.2.8: Console has no critical errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('favicon') && !error.includes('CRLF') && !error.includes('Warning')
    );

    expect(criticalErrors.length).toBe(0);

    if (criticalErrors.length > 0) {
      console.error('❌ Console errors found:', criticalErrors);
    } else {
      console.log('✅ No critical console errors');
    }
  });
});
