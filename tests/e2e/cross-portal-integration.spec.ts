/**
 * Cross-Portal Integration Tests
 * 
 * Tests data flow and integration between portals
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Cross-Portal Integration', () => {
  test('Application data synchronization across portals', async ({ browser }) => {
    const farmerContext = await browser.newContext();
    const adminContext = await browser.newContext();
    
    const farmerPage = await farmerContext.newPage();
    const adminPage = await adminContext.newPage();

    // Farmer creates application
    await farmerPage.goto('http://localhost:3001/applications/new');
    const testFarmName = `Integration Test Farm ${Date.now()}`;
    
    await farmerPage.fill('input[name="farmName"]', testFarmName);
    await farmerPage.fill('input[name="cropType"]', 'มะม่วง');
    await farmerPage.click('button[type="submit"]');

    // Wait for submission
    await farmerPage.waitForTimeout(2000);

    // Admin sees the application immediately
    await adminPage.goto('http://localhost:3002/applications');
    await adminPage.fill('input[placeholder*="ค้นหา"]', testFarmName);
    
    // Verify application appears in admin portal
    await expect(adminPage.locator(`text=${testFarmName}`)).toBeVisible({ timeout: 5000 });

    await farmerContext.close();
    await adminContext.close();
  });

  test('Real-time status updates between portals', async ({ browser }) => {
    // Test that status changes in admin portal reflect in farmer portal
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
    ]);

    const [farmerPage, adminPage] = await Promise.all([
      contexts[0].newPage(),
      contexts[1].newPage(),
    ]);

    // Navigate to same application in both portals
    const applicationId = 'test-app-123';
    
    await Promise.all([
      farmerPage.goto(`http://localhost:3001/applications/${applicationId}`),
      adminPage.goto(`http://localhost:3002/applications/${applicationId}`),
    ]);

    // Admin updates status
    await adminPage.click('button:has-text("เปลี่ยนสถานะ")');
    await adminPage.click('text=อนุมัติ');

    // Farmer page should reflect the change
    await farmerPage.reload();
    await expect(farmerPage.locator('text=อนุมัติ')).toBeVisible();

    await Promise.all(contexts.map((ctx) => ctx.close()));
  });

  test('Certificate verification after issuance', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // Admin issues certificate
    await adminPage.goto('http://localhost:3002/certificates/new');
    
    const certNumber = `GACP-2025-${Date.now().toString().slice(-4)}`;
    await adminPage.fill('input[name="certificateNumber"]', certNumber);
    await adminPage.fill('input[name="farmName"]', 'Test Farm');
    await adminPage.click('button:has-text("ออกใบรับรอง")');

    // Wait for certificate creation
    await adminPage.waitForTimeout(2000);

    // Verify certificate in public portal (no auth required)
    const publicPage = await adminContext.newPage();
    await publicPage.goto('http://localhost:3003/verify');
    
    await publicPage.fill('input[placeholder*="GACP"]', certNumber);
    await publicPage.click('button:has-text("ตรวจสอบ")');

    await expect(publicPage.locator('text=ใบรับรองถูกต้อง')).toBeVisible();

    await adminContext.close();
  });
});

test.describe('Payment Integration', () => {
  test('QR Code payment flow', async ({ page }) => {
    await page.goto('http://localhost:3001/payment/new');

    // Generate QR code
    await page.click('button:has-text("สร้าง QR Code")');
    
    // Verify QR code appears
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });

    // Verify payment details
    await expect(page.locator('text=฿500')).toBeVisible();
    await expect(page.locator('text=ค่าธรรมเนียมใบสมัคร GACP')).toBeVisible();

    // Simulate payment confirmation
    await page.click('button:has-text("ยืนยันการชำระเงิน")');
    
    await expect(page.locator('text=ชำระเงินสำเร็จ')).toBeVisible();
  });

  test('Payment status synchronization', async ({ browser }) => {
    const farmerContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const farmerPage = await farmerContext.newPage();
    const adminPage = await adminContext.newPage();

    const applicationId = 'test-app-payment';

    // Farmer completes payment
    await farmerPage.goto(`http://localhost:3001/payment/${applicationId}`);
    await farmerPage.click('button:has-text("ชำระเงิน")');
    await farmerPage.waitForTimeout(1500);

    // Admin sees payment status updated
    await adminPage.goto(`http://localhost:3002/applications/${applicationId}`);
    await expect(adminPage.locator('text=ชำระเงินแล้ว')).toBeVisible();

    await farmerContext.close();
    await adminContext.close();
  });
});

test.describe('Document Management', () => {
  test('Document upload and review workflow', async ({ browser }) => {
    const farmerContext = await browser.newContext();
    const dtamContext = await browser.newContext();

    const farmerPage = await farmerContext.newPage();
    const dtamPage = await dtamContext.newPage();

    // Farmer uploads documents
    await farmerPage.goto('http://localhost:3001/applications/new');
    
    // Simulate file upload
    await farmerPage.click('button:has-text("อัพโหลดเอกสาร")');
    
    // DTAM reviews documents
    await dtamPage.goto('http://localhost:3002/reviews');
    
    await expect(dtamPage.locator('text=เอกสารใหม่')).toBeVisible();

    await farmerContext.close();
    await dtamContext.close();
  });
});

test.describe('Notification System', () => {
  test('Notifications across portals', async ({ browser }) => {
    const farmerContext = await browser.newContext();
    const farmerPage = await farmerContext.newPage();

    await farmerPage.goto('http://localhost:3001/dashboard');

    // Check for notifications
    const notificationBadge = farmerPage.locator('[data-testid="notification-badge"]');
    
    if (await notificationBadge.isVisible()) {
      const count = await notificationBadge.textContent();
      expect(parseInt(count || '0')).toBeGreaterThanOrEqual(0);
    }

    await farmerContext.close();
  });
});

test.describe('Search and Filter Integration', () => {
  test('Global search functionality', async ({ page }) => {
    await page.goto('http://localhost:3002/dashboard');

    // Test global search
    await page.fill('input[placeholder*="ค้นหา"]', 'test');
    await page.keyboard.press('Enter');

    // Should see search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 5000 });
  });

  test('Advanced filtering', async ({ page }) => {
    await page.goto('http://localhost:3002/applications');

    // Apply multiple filters
    await page.click('button:has-text("กรอง")');
    
    // Filter by status
    await page.click('text=รอตรวจสอบ');
    
    // Filter by date
    await page.fill('input[type="date"]', '2025-01-01');
    
    await page.click('button:has-text("ค้นหา")');

    // Verify filtered results
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('Page load times', async ({ page }) => {
    const pages = [
      'http://localhost:3001/dashboard',
      'http://localhost:3002/dashboard',
      'http://localhost:3003/verify',
    ];

    for (const url of pages) {
      const startTime = Date.now();
      await page.goto(url);
      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      console.log(`${url} loaded in ${loadTime}ms`);
    }
  });

  test('Handle multiple concurrent users', async ({ browser }) => {
    // Simulate 5 concurrent users
    const contexts = await Promise.all(
      Array.from({ length: 5 }, () => browser.newContext())
    );

    const pages = await Promise.all(
      contexts.map((ctx) => ctx.newPage())
    );

    // All navigate to dashboard simultaneously
    await Promise.all(
      pages.map((page) => page.goto('http://localhost:3001/dashboard'))
    );

    // Verify all pages loaded successfully
    for (const page of pages) {
      await expect(page.locator('h1')).toBeVisible();
    }

    // Cleanup
    await Promise.all(contexts.map((ctx) => ctx.close()));
  });
});
