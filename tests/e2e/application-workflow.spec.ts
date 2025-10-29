/**
 * End-to-End Test: Complete Application Workflow
 *
 * Tests the complete workflow from farmer application submission through
 * payment, DTAM review, admin approval, and certificate issuance.
 *
 * Flow:
 * 1. Farmer submits application
 * 2. Farmer completes payment
 * 3. DTAM reviews and approves application
 * 4. System generates certificate
 * 5. Certificate can be verified
 */

import { test, expect } from '@playwright/test';

// Generate unique identifiers for this test run
const timestamp = Date.now();
const farmName = `ฟาร์มทดสอบ E2E ${timestamp}`;
const farmerName = `นายทดสอบ E2E`;
const nationalId = `1234567890${timestamp.toString().slice(-3)}`;

test.describe('Complete Application Workflow', () => {
  let applicationId: string;
  let certificateNumber: string;

  test.describe.configure({ mode: 'serial' });

  test('Step 1: Farmer submits GACP application', async ({ browser }) => {
    // Use farmer auth context
    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/farmer.json'
    });
    const page = await context.newPage();

    // Navigate to applications page
    await page.goto('http://localhost:3001/applications');
    await expect(page.locator('h1')).toContainText('ใบสมัคร');

    // Click new application button
    await page.click('button:has-text("สร้างใบสมัครใหม่")');
    await expect(page).toHaveURL(/\/applications\/new/);

    // Fill in farm information
    await page.fill('input[name="farmName"]', farmName);
    await page.fill('input[name="farmSize"]', '10');
    await page.fill('input[name="cropType"]', 'มะม่วง');

    // Fill in farmer information
    await page.fill('input[name="farmerName"]', farmerName);
    await page.fill('input[name="nationalId"]', nationalId);
    await page.fill('input[name="phoneNumber"]', '081-234-5678');

    // Fill in address
    await page.fill('input[name="houseNumber"]', '123');
    await page.fill('input[name="village"]', 'หมู่ 5');
    await page.fill('input[name="subdistrict"]', 'ทุ่งสุขลา');
    await page.fill('input[name="district"]', 'ศรีราชา');
    await page.fill('input[name="province"]', 'ชลบุรี');
    await page.fill('input[name="postalCode"]', '20230');

    // Submit application
    await page.click('button[type="submit"]:has-text("ส่งใบสมัคร")');

    // Wait for success and capture application ID
    await expect(page.locator('text=สำเร็จ')).toBeVisible({ timeout: 10000 });

    // Get application ID from URL or page content
    await page.waitForURL(/\/applications\/\w+/);
    const url = page.url();
    applicationId = url.split('/applications/')[1];

    expect(applicationId).toBeTruthy();
    console.log(`✓ Application submitted: ${applicationId}`);

    await context.close();
  });

  test('Step 2: Farmer completes payment', async ({ browser }) => {
    test.skip(!applicationId, 'Application ID not available');

    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/farmer.json'
    });
    const page = await context.newPage();

    // Navigate to application detail
    await page.goto(`http://localhost:3001/applications/${applicationId}`);

    // Check application status
    await expect(page.locator('text=รอชำระเงิน')).toBeVisible();

    // Click payment button
    await page.click('button:has-text("ชำระเงิน")');
    await expect(page).toHaveURL(/\/payment/);

    // Verify payment details
    await expect(page.locator('text=฿500')).toBeVisible(); // Application fee

    // Generate QR Code
    await page.click('button:has-text("สร้าง QR Code")');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });

    // Simulate payment confirmation (in real scenario, this would be bank callback)
    await page.click('button:has-text("ยืนยันการชำระเงิน")');

    // Wait for payment success
    await expect(page.locator('text=ชำระเงินสำเร็จ')).toBeVisible({ timeout: 10000 });

    console.log(`✓ Payment completed for application: ${applicationId}`);

    await context.close();
  });

  test('Step 3: DTAM reviews application', async ({ browser }) => {
    test.skip(!applicationId, 'Application ID not available');

    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/dtam.json'
    });
    const page = await context.newPage();

    // Navigate to reviews queue
    await page.goto('http://localhost:3002/reviews');
    await expect(page.locator('h1')).toContainText('คิวตรวจสอบ');

    // Find the submitted application
    await page.fill('input[placeholder*="ค้นหา"]', farmName);
    await page.keyboard.press('Enter');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Click on the application to review
    await page.click(`text=${farmName}`);

    // Verify application details
    await expect(page.locator('text=รอตรวจสอบ')).toBeVisible();
    await expect(page.locator(`text=${farmerName}`)).toBeVisible();

    // Review documents
    await page.click('button:has-text("ตรวจสอบเอกสาร")');

    // Approve each document
    const approveButtons = await page.locator('button:has-text("อนุมัติ")').all();
    for (const button of approveButtons) {
      await button.click();
      await page.waitForTimeout(500);
    }

    // Schedule inspection
    await page.click('button:has-text("กำหนดการตรวจสอบ")');

    // Select inspector
    await page.click('select[name="inspector"]');
    await page.selectOption('select[name="inspector"]', { index: 1 });

    // Set inspection date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateStr);

    // Confirm inspection schedule
    await page.click('button:has-text("ยืนยัน")');

    // Wait for success
    await expect(page.locator('text=กำหนดการตรวจสอบสำเร็จ')).toBeVisible();

    console.log(`✓ DTAM scheduled inspection for: ${applicationId}`);

    await context.close();
  });

  test('Step 4: Inspector completes field inspection', async ({ browser }) => {
    test.skip(!applicationId, 'Application ID not available');

    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/dtam.json'
    });
    const page = await context.newPage();

    // Navigate to inspections page
    await page.goto('http://localhost:3002/inspections');

    // Find the scheduled inspection
    await page.fill('input[placeholder*="ค้นหา"]', farmName);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Open inspection
    await page.click(`text=${farmName}`);

    // Fill inspection form
    await page.click('button:has-text("เริ่มตรวจสอบ")');

    // Complete inspection checklist
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      await checkbox.check();
      await page.waitForTimeout(300);
    }

    // Add inspection notes
    await page.fill('textarea[name="notes"]', 'ฟาร์มมีความพร้อมสำหรับการรับรอง GACP');

    // Upload photos (mock)
    await page.click('button:has-text("อัพโหลดรูปภาพ")');
    await page.waitForTimeout(1000);

    // Submit inspection report
    await page.click('button:has-text("ส่งรายงาน")');
    await expect(page.locator('text=ส่งรายงานสำเร็จ')).toBeVisible();

    // Recommend approval
    await page.click('button:has-text("แนะนำให้อนุมัติ")');
    await page.fill('textarea[name="recommendation"]', 'แนะนำให้อนุมัติใบรับรอง GACP');
    await page.click('button:has-text("ยืนยันคำแนะนำ")');

    console.log(`✓ Inspection completed for: ${applicationId}`);

    await context.close();
  });

  test('Step 5: Admin approves and issues certificate', async ({ browser }) => {
    test.skip(!applicationId, 'Application ID not available');

    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/admin.json'
    });
    const page = await context.newPage();

    // Navigate to applications review page
    await page.goto('http://localhost:3002/applications');

    // Filter for approved inspections
    await page.click('button:has-text("สถานะ")');
    await page.click('text=รอการอนุมัติ');

    // Find the application
    await page.fill('input[placeholder*="ค้นหา"]', farmName);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Open application
    await page.click(`text=${farmName}`);

    // Review inspection report
    await expect(page.locator('text=รายงานการตรวจสอบ')).toBeVisible();
    await expect(page.locator('text=แนะนำให้อนุมัติ')).toBeVisible();

    // Approve application
    await page.click('button:has-text("อนุมัติใบสมัคร")');

    // Confirm approval
    await page.fill('textarea[name="approvalNotes"]', 'อนุมัติใบรับรอง GACP');
    await page.click('button:has-text("ยืนยันการอนุมัติ")');

    // Wait for certificate generation
    await expect(page.locator('text=สร้างใบรับรองสำเร็จ')).toBeVisible({ timeout: 10000 });

    // Capture certificate number
    const certElement = await page.locator('text=/GACP-\\d{4}-\\d+/').first();
    certificateNumber = (await certElement.textContent()) || '';

    expect(certificateNumber).toMatch(/GACP-\d{4}-\d+/);
    console.log(`✓ Certificate issued: ${certificateNumber}`);

    await context.close();
  });

  test('Step 6: Farmer views certificate', async ({ browser }) => {
    test.skip(!certificateNumber, 'Certificate number not available');

    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/farmer.json'
    });
    const page = await context.newPage();

    // Navigate to certificates page
    await page.goto('http://localhost:3001/certificates');
    await expect(page.locator('h1')).toContainText('ใบรับรอง');

    // Find the newly issued certificate
    await expect(page.locator(`text=${certificateNumber}`)).toBeVisible();

    // Click to view certificate details
    await page.click(`text=${certificateNumber}`);

    // Verify certificate details
    await expect(page.locator(`text=${farmName}`)).toBeVisible();
    await expect(page.locator(`text=${farmerName}`)).toBeVisible();
    await expect(page.locator('text=มะม่วง')).toBeVisible();
    await expect(page.locator('text=GACP')).toBeVisible();

    // Download certificate PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("ดาวน์โหลด PDF")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(certificateNumber);

    console.log(`✓ Farmer viewed certificate: ${certificateNumber}`);

    await context.close();
  });

  test('Step 7: Public certificate verification', async ({ page }) => {
    test.skip(!certificateNumber, 'Certificate number not available');

    // Navigate to public verification page (no auth needed)
    await page.goto('http://localhost:3003/verify');

    // Enter certificate number
    await page.fill('input[placeholder*="GACP"]', certificateNumber);

    // Click verify button
    await page.click('button:has-text("ตรวจสอบ")');

    // Wait for verification result
    await expect(page.locator('text=ใบรับรองถูกต้อง')).toBeVisible({ timeout: 5000 });

    // Verify certificate details are displayed
    await expect(page.locator(`text=${farmName}`)).toBeVisible();
    await expect(page.locator(`text=${farmerName}`)).toBeVisible();
    await expect(page.locator('text=สถานะ: ใช้งานได้')).toBeVisible();

    // Verify QR code is generated
    await expect(page.locator('canvas')).toBeVisible();

    console.log(`✓ Certificate verified publicly: ${certificateNumber}`);
  });

  test('Step 8: Admin monitors audit logs', async ({ browser }) => {
    test.skip(!applicationId, 'Application ID not available');

    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/admin.json'
    });
    const page = await context.newPage();

    // Navigate to audit logs
    await page.goto('http://localhost:3002/audit-logs');

    // Search for activities related to this application
    await page.fill('input[placeholder*="ค้นหา"]', applicationId);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Verify key activities are logged
    await expect(page.locator('text=สร้างใบสมัครใหม่')).toBeVisible();
    await expect(page.locator('text=ชำระเงิน')).toBeVisible();
    await expect(page.locator('text=อนุมัติใบสมัคร')).toBeVisible();
    await expect(page.locator('text=สร้างใบรับรอง')).toBeVisible();

    // Filter by success status
    await page.click('select[name="status"]');
    await page.selectOption('select[name="status"]', 'success');

    // Verify all activities succeeded
    const statusChips = await page.locator('text=สำเร็จ').all();
    expect(statusChips.length).toBeGreaterThan(0);

    console.log(`✓ Audit logs verified for application: ${applicationId}`);

    await context.close();
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test('Reject application with incomplete documents', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/farmer.json'
    });
    const page = await context.newPage();

    // Submit application without required documents
    await page.goto('http://localhost:3001/applications/new');

    await page.fill('input[name="farmName"]', 'ฟาร์มเอกสารไม่ครบ');
    await page.fill('input[name="cropType"]', 'ข้าว');

    // Try to submit without uploading documents
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=กรุณาอัพโหลดเอกสารที่จำเป็น')).toBeVisible();

    await context.close();
  });

  test('Invalid certificate verification', async ({ page }) => {
    await page.goto('http://localhost:3003/verify');

    // Enter invalid certificate number
    await page.fill('input[placeholder*="GACP"]', 'INVALID-CERT-999');
    await page.click('button:has-text("ตรวจสอบ")');

    // Verify error message
    await expect(page.locator('text=ไม่พบใบรับรอง')).toBeVisible({ timeout: 5000 });
  });

  test('Duplicate application prevention', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/farmer.json'
    });
    const page = await context.newPage();

    const duplicateFarmName = `ฟาร์มซ้ำ ${Date.now()}`;

    // Submit first application
    await page.goto('http://localhost:3001/applications/new');
    await page.fill('input[name="farmName"]', duplicateFarmName);
    await page.fill('input[name="cropType"]', 'กล้วย');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=สำเร็จ')).toBeVisible();

    // Try to submit duplicate
    await page.goto('http://localhost:3001/applications/new');
    await page.fill('input[name="farmName"]', duplicateFarmName);
    await page.fill('input[name="cropType"]', 'กล้วย');
    await page.click('button[type="submit"]');

    // Verify warning
    await expect(page.locator('text=ใบสมัครซ้ำ')).toBeVisible();

    await context.close();
  });
});
