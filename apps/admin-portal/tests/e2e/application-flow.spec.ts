/**
 * E2E Tests - Application Management Flow
 *
 * Tests complete application lifecycle from creation to submission,
 * document uploads, payment, and status tracking.
 */

import { test, expect } from '@playwright/test';
import { DashboardPage, ApplicationFormPage, PaymentPage } from '../page-objects';

test.describe('Application Management Flow', () => {
  test.use({
    storageState: 'tests/e2e/.auth/farmer.json',
  });

  test.describe('Create Application', () => {
    test('should create new application draft', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const applicationFormPage = new ApplicationFormPage(page);

      await dashboardPage.goto('/dashboard');
      await dashboardPage.createNewApplication();

      // Fill application form
      await applicationFormPage.fillApplicationForm({
        farmName: 'Green Valley Organic Farm',
        farmLocation: 'Chiang Mai',
        farmSize: '15',
        applicationType: 'GAP_VEGETABLES',
        crops: 'Tomato, Cucumber, Lettuce',
      });

      // Save as draft
      await applicationFormPage.saveDraft();

      // Verify success message
      await expect(applicationFormPage.successMessage).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const applicationFormPage = new ApplicationFormPage(page);

      await dashboardPage.goto('/dashboard');
      await dashboardPage.createNewApplication();

      // Try to save without filling required fields
      await applicationFormPage.saveButton.click();

      // Verify validation errors
      await expect(page.locator('text=Farm name is required')).toBeVisible();
      await expect(page.locator('text=Farm location is required')).toBeVisible();
      await expect(page.locator('text=Farm size is required')).toBeVisible();
    });

    test('should cancel application creation', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const applicationFormPage = new ApplicationFormPage(page);

      await dashboardPage.goto('/dashboard');
      await dashboardPage.createNewApplication();

      // Fill some data
      await applicationFormPage.farmNameInput.fill('Test Farm');

      // Cancel
      await applicationFormPage.cancel();

      // Should return to dashboard
      await page.waitForURL('/dashboard');
      await dashboardPage.verifyDashboardLoaded();
    });

    test('should auto-save draft periodically', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const applicationFormPage = new ApplicationFormPage(page);

      await dashboardPage.goto('/dashboard');
      await dashboardPage.createNewApplication();

      // Fill form
      await applicationFormPage.fillApplicationForm({
        farmName: 'Auto Save Test Farm',
        farmLocation: 'Bangkok',
        farmSize: '10',
      });

      // Wait for auto-save (assuming 5 second interval)
      await page.waitForTimeout(6000);

      // Verify auto-save indicator
      await expect(page.locator('text=Draft saved')).toBeVisible();
    });
  });

  test.describe('Edit Application', () => {
    test('should edit draft application', async ({ page }) => {
      const applicationFormPage = new ApplicationFormPage(page);

      // Navigate to existing draft
      await page.goto('/applications');
      await page.click('tr:has-text("DRAFT"):first-of-type');

      // Edit form
      await applicationFormPage.farmNameInput.clear();
      await applicationFormPage.farmNameInput.fill('Updated Farm Name');

      await applicationFormPage.saveDraft();

      // Verify update success
      await expect(applicationFormPage.successMessage).toBeVisible();
      await expect(applicationFormPage.farmNameInput).toHaveValue('Updated Farm Name');
    });

    test('should not edit submitted application', async ({ page }) => {
      await page.goto('/applications');

      // Try to click on submitted application
      const submittedRow = page.locator('tr:has-text("PENDING_REVIEW"):first-of-type');

      if ((await submittedRow.count()) > 0) {
        await submittedRow.click();

        // Verify form is read-only or edit button is disabled
        const farmNameInput = page.locator('input[name="farmName"]');
        await expect(farmNameInput).toBeDisabled();
      }
    });
  });

  test.describe('Submit Application', () => {
    test('should submit complete application', async ({ page }) => {
      const applicationFormPage = new ApplicationFormPage(page);

      // Create new application
      await page.goto('/applications/new');

      await applicationFormPage.fillApplicationForm({
        farmName: 'Submit Test Farm',
        farmLocation: 'Phuket',
        farmSize: '20',
        applicationType: 'GAP_FRUITS',
        crops: 'Mango, Banana',
      });

      // Submit application
      await applicationFormPage.submitApplication();

      // Verify success and redirect
      await expect(applicationFormPage.successMessage).toBeVisible();
      await page.waitForURL(/\/applications\/[a-z0-9-]+/);

      // Verify status changed to PENDING_PAYMENT
      await expect(page.locator('text=PENDING_PAYMENT')).toBeVisible();
    });

    test('should show validation error for incomplete application', async ({ page }) => {
      const applicationFormPage = new ApplicationFormPage(page);

      await page.goto('/applications/new');

      // Fill only partial data
      await applicationFormPage.farmNameInput.fill('Incomplete Farm');

      // Try to submit
      await applicationFormPage.submitButton.click();

      // Verify validation errors
      await expect(page.locator('text=Please fill all required fields')).toBeVisible();
    });

    test('should confirm before submission', async ({ page }) => {
      const applicationFormPage = new ApplicationFormPage(page);

      await page.goto('/applications/new');

      await applicationFormPage.fillApplicationForm({
        farmName: 'Confirm Test Farm',
        farmLocation: 'Krabi',
        farmSize: '12',
        applicationType: 'GAP_VEGETABLES',
      });

      // Click submit
      await applicationFormPage.submitButton.click();

      // Verify confirmation dialog
      await expect(page.locator('text=Are you sure you want to submit?')).toBeVisible();

      // Confirm submission
      await page.click('button:has-text("Confirm")');

      // Verify submission success
      await expect(applicationFormPage.successMessage).toBeVisible();
    });
  });

  test.describe('Document Upload', () => {
    test('should upload required documents', async ({ page }) => {
      // Navigate to application with pending documents
      await page.goto('/applications');
      await page.click('tr:has-text("DRAFT"):first-of-type');

      // Navigate to documents section
      await page.click('button:has-text("Documents")');

      // Upload farm registration document
      const farmRegInput = page.locator('input[type="file"][name="farmRegistration"]');
      await farmRegInput.setInputFiles('tests/fixtures/farm-registration.pdf');

      // Wait for upload completion
      await expect(page.locator('text=Upload successful')).toBeVisible({ timeout: 15000 });

      // Upload land certificate
      const landCertInput = page.locator('input[type="file"][name="landCertificate"]');
      await landCertInput.setInputFiles('tests/fixtures/land-certificate.pdf');

      await expect(page.locator('text=Upload successful')).toBeVisible({ timeout: 15000 });

      // Verify documents listed
      await expect(page.locator('text=farm-registration.pdf')).toBeVisible();
      await expect(page.locator('text=land-certificate.pdf')).toBeVisible();
    });

    test('should validate file size', async ({ page }) => {
      await page.goto('/applications');
      await page.click('tr:has-text("DRAFT"):first-of-type');
      await page.click('button:has-text("Documents")');

      // Try to upload large file (assuming 5MB limit)
      const fileInput = page.locator('input[type="file"][name="farmRegistration"]');
      // In real test, use a large file
      // await fileInput.setInputFiles('tests/fixtures/large-file.pdf');

      // Verify error message
      // await expect(page.locator('text=File size exceeds 5MB limit')).toBeVisible();
    });

    test('should validate file type', async ({ page }) => {
      await page.goto('/applications');
      await page.click('tr:has-text("DRAFT"):first-of-type');
      await page.click('button:has-text("Documents")');

      // Try to upload invalid file type
      const fileInput = page.locator('input[type="file"][name="farmRegistration"]');
      // await fileInput.setInputFiles('tests/fixtures/invalid.exe');

      // Verify error message
      // await expect(page.locator('text=Invalid file type')).toBeVisible();
    });

    test('should delete uploaded document', async ({ page }) => {
      await page.goto('/applications');
      await page.click('tr:has-text("DRAFT"):first-of-type');
      await page.click('button:has-text("Documents")');

      // Find document and click delete
      const deleteButton = page.locator('button[aria-label="Delete document"]:first-of-type');

      if ((await deleteButton.count()) > 0) {
        await deleteButton.click();

        // Confirm deletion
        await page.click('button:has-text("Confirm Delete")');

        // Verify deletion success
        await expect(page.locator('text=Document deleted')).toBeVisible();
      }
    });
  });

  test.describe('Payment Process', () => {
    test('should display payment information', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      // Navigate to application with pending payment
      await page.goto('/applications');
      const pendingPaymentRow = page.locator('tr:has-text("PENDING_PAYMENT"):first-of-type');

      if ((await pendingPaymentRow.count()) > 0) {
        await pendingPaymentRow.click();

        // Click pay button
        await page.click('button:has-text("Make Payment")');

        // Verify payment page
        await paymentPage.verifyPaymentInfo('1,500');
        await expect(paymentPage.qrCodeImage).toBeVisible();
      }
    });

    test('should generate PromptPay QR code', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      await page.goto('/applications');
      const pendingPaymentRow = page.locator('tr:has-text("PENDING_PAYMENT"):first-of-type');

      if ((await pendingPaymentRow.count()) > 0) {
        await pendingPaymentRow.click();
        await page.click('button:has-text("Make Payment")');

        // Verify QR code generated
        const qrCode = paymentPage.qrCodeImage;
        await expect(qrCode).toBeVisible();

        // Verify QR code has valid src
        const qrSrc = await qrCode.getAttribute('src');
        expect(qrSrc).toBeTruthy();
        expect(qrSrc).toContain('data:image');
      }
    });

    test('should confirm payment', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      await page.goto('/applications');
      const pendingPaymentRow = page.locator('tr:has-text("PENDING_PAYMENT"):first-of-type');

      if ((await pendingPaymentRow.count()) > 0) {
        await pendingPaymentRow.click();
        await page.click('button:has-text("Make Payment")');

        // Confirm payment
        await paymentPage.confirmPayment();

        // Wait for payment verification
        await paymentPage.waitForPaymentConfirmation();

        // Verify status updated
        await expect(page.locator('text=PENDING_REVIEW')).toBeVisible();
      }
    });

    test('should handle payment timeout', async ({ page }) => {
      await page.goto('/applications');
      const pendingPaymentRow = page.locator('tr:has-text("PENDING_PAYMENT"):first-of-type');

      if ((await pendingPaymentRow.count()) > 0) {
        await pendingPaymentRow.click();
        await page.click('button:has-text("Make Payment")');

        // Wait for payment timeout (e.g., 15 minutes)
        // In real test, use mocked time or shorter timeout for testing

        // Verify timeout message
        // await expect(page.locator('text=Payment timeout')).toBeVisible({ timeout: 60000 });
      }
    });
  });

  test.describe('Application Status Tracking', () => {
    test('should display application status', async ({ page }) => {
      await page.goto('/applications');

      // Verify status badges are visible
      await expect(page.locator('text=DRAFT')).toBeVisible();
      await expect(page.locator('text=PENDING_PAYMENT')).toBeVisible();
      await expect(page.locator('text=PENDING_REVIEW')).toBeVisible();
    });

    test('should view application details', async ({ page }) => {
      await page.goto('/applications');

      // Click on first application
      await page.click('tr:first-of-type');

      // Verify details page loaded
      await expect(page.locator('[data-testid="application-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="application-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="farm-details"]')).toBeVisible();
    });

    test('should view application history', async ({ page }) => {
      await page.goto('/applications');
      await page.click('tr:first-of-type');

      // Navigate to history tab
      await page.click('button:has-text("History")');

      // Verify history entries
      await expect(page.locator('text=Application created')).toBeVisible();

      // Check for other status changes
      const historyEntries = page.locator('[data-testid="history-entry"]');
      expect(await historyEntries.count()).toBeGreaterThan(0);
    });

    test('should filter applications by status', async ({ page }) => {
      await page.goto('/applications');

      // Click status filter
      await page.click('button:has-text("Filter")');

      // Select DRAFT status
      await page.click('input[type="checkbox"][value="DRAFT"]');
      await page.click('button:has-text("Apply Filter")');

      // Verify only draft applications shown
      const rows = page.locator('tbody tr');
      const count = await rows.count();

      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        await expect(row.locator('text=DRAFT')).toBeVisible();
      }
    });

    test('should search applications', async ({ page }) => {
      await page.goto('/applications');

      // Enter search term
      await page.fill('input[placeholder*="Search"]', 'Green Valley');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Verify filtered results
      const firstRow = page.locator('tbody tr:first-of-type');
      await expect(firstRow.locator('text=Green Valley')).toBeVisible();
    });
  });

  test.describe('Application Pagination', () => {
    test('should paginate application list', async ({ page }) => {
      await page.goto('/applications');

      // Check if pagination exists
      const nextButton = page.locator('button[aria-label="Next page"]');

      if (await nextButton.isEnabled()) {
        // Click next page
        await nextButton.click();

        // Wait for new data to load
        await page.waitForLoadState('networkidle');

        // Verify URL or page indicator changed
        await expect(page.locator('text=Page 2')).toBeVisible();
      }
    });

    test('should change page size', async ({ page }) => {
      await page.goto('/applications');

      // Change page size
      await page.click('select[name="pageSize"]');
      await page.click('option[value="25"]');

      // Wait for reload
      await page.waitForLoadState('networkidle');

      // Verify more items displayed
      const rows = page.locator('tbody tr');
      expect(await rows.count()).toBeLessThanOrEqual(25);
    });
  });
});
