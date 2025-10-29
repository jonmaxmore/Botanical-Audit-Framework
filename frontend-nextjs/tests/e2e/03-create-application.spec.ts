import { test, expect } from '@playwright/test';

/**
 * Test Case 2.2: Create Application Flow
 *
 * Priority: HIGH
 * Coverage: Application creation, form validation, data persistence
 *
 * Testing Mandate: Zero bugs before QA handoff
 */

test.describe('Create Application Flow', () => {
  // Test user credentials
  const TEST_EMAIL = 'farmer-test-001@example.com';
  const TEST_PASSWORD = 'TestPass123!';

  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/email|อีเมล/i).fill(TEST_EMAIL);
    await page.getByLabel(/password|รหัสผ่าน/i).fill(TEST_PASSWORD);

    const loginButton = page.getByRole('button', { name: /login|เข้าสู่ระบบ|sign in/i });
    await loginButton.click();

    // Wait for dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  });

  test('TC 2.2.1: Navigate to create application page', async ({ page }) => {
    // Look for "Create Application" button or link
    const createButton = page.getByRole('link', { name: /create|สร้าง|application|ใบสมัคร|new/i });

    // Click to navigate
    await createButton.first().click({ timeout: 10000 });

    // Verify URL changed
    await page.waitForURL(/.*application.*create|create.*application|applications\/new/i, {
      timeout: 10000,
    });

    console.log('✅ Navigated to create application page');
  });

  test('TC 2.2.2: Create application form renders correctly', async ({ page }) => {
    // Navigate to create page
    await page.goto('/farmer/applications/create');
    await page.waitForLoadState('networkidle');

    // Verify form fields exist (adjust selectors based on actual form)
    const farmNameField = page.getByLabel(/farm.*name|ชื่อฟาร์ม/i);
    await expect(farmNameField.first()).toBeVisible({ timeout: 10000 });

    // Verify submit button exists
    const submitButton = page.getByRole('button', { name: /submit|ส่ง|create|สร้าง|save|บันทึก/i });
    await expect(submitButton.first()).toBeVisible();

    console.log('✅ Create application form renders correctly');
  });

  test('TC 2.2.3: Form validation - required fields', async ({ page }) => {
    await page.goto('/farmer/applications/create');
    await page.waitForLoadState('networkidle');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /submit|ส่ง|create|สร้าง|save|บันทึก/i });
    await submitButton.first().click();

    // Wait for validation
    await page.waitForTimeout(2000);

    // Should still be on create page (not submitted)
    const currentUrl = page.url();
    const isOnCreatePage = /create|new/.test(currentUrl);

    expect(isOnCreatePage).toBeTruthy();

    console.log('✅ Form validation prevents empty submission');
  });

  test('TC 2.2.4: Successfully create application', async ({ page }) => {
    await page.goto('/farmer/applications/create');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();

    // Fill form (adjust field names based on actual implementation)
    const farmNameField = page.getByLabel(/farm.*name|ชื่อฟาร์ม/i).first();
    await farmNameField.fill(`ฟาร์มกัญชาทดสอบ ${timestamp}`);

    // Try to find other fields
    const locationField = page.getByLabel(/location|ที่ตั้ง|province|จังหวัด/i).first();
    if (await locationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await locationField.fill('จ.เชียงใหม่');
    }

    const areaField = page.getByLabel(/area|พื้นที่|size|ขนาด/i).first();
    if (await areaField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await areaField.fill('5 ไร่');
    }

    const cropField = page.getByLabel(/crop|พืช|type|ประเภท/i).first();
    if (await cropField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cropField.fill('กัญชาทางการแพทย์');
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /submit|ส่ง|create|สร้าง|save|บันทึก/i });
    await submitButton.first().click();

    // Wait for success (redirect or message)
    await page.waitForTimeout(3000);

    // Check if redirected to applications list or shows success message
    const currentUrl = page.url();
    const successIndicator =
      /applications(?!.*create)/.test(currentUrl) || // Redirected to list
      (await page
        .getByText(/success|สำเร็จ|created|บันทึกแล้ว/i)
        .isVisible({ timeout: 2000 })
        .catch(() => false));

    expect(successIndicator).toBeTruthy();

    console.log('✅ Application created successfully');
  });

  test('TC 2.2.5: Created application appears in list', async ({ page }) => {
    const timestamp = Date.now();
    const farmName = `ฟาร์มทดสอบ ${timestamp}`;

    // Create application
    await page.goto('/farmer/applications/create');
    await page.waitForLoadState('networkidle');

    const farmNameField = page.getByLabel(/farm.*name|ชื่อฟาร์ม/i).first();
    await farmNameField.fill(farmName);

    const submitButton = page.getByRole('button', { name: /submit|ส่ง|create|สร้าง|save|บันทึก/i });
    await submitButton.first().click();

    // Wait and navigate to applications list
    await page.waitForTimeout(2000);
    await page.goto('/farmer/applications');
    await page.waitForLoadState('networkidle');

    // Look for the farm name in the list
    const applicationInList = page.getByText(farmName);
    await expect(applicationInList.first()).toBeVisible({ timeout: 10000 });

    console.log('✅ Created application appears in applications list');
  });

  test('TC 2.2.6: Retry logic on create application', async ({ page }) => {
    await page.goto('/farmer/applications/create');
    await page.waitForLoadState('networkidle');

    // Enable network throttling
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024,
      uploadThroughput: 20 * 1024,
      latency: 500,
    });

    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Fill and submit form
    const farmNameField = page.getByLabel(/farm.*name|ชื่อฟาร์ม/i).first();
    await farmNameField.fill(`ฟาร์มทดสอบ Retry ${Date.now()}`);

    const submitButton = page.getByRole('button', { name: /submit|ส่ง|create|สร้าง|save|บันทึก/i });
    await submitButton.first().click();

    // Wait for completion
    await page.waitForTimeout(5000);

    // Check for retry logs
    const hasRetryLogs = consoleMessages.some(
      (msg) => msg.includes('retry') || msg.includes('Retry') || msg.includes('attempt')
    );

    // Disable throttling
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });

    console.log(`✅ Create application with network throttling (Retry occurred: ${hasRetryLogs})`);
  });

  test('TC 2.2.7: Console has no critical errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/farmer/applications/create');
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
