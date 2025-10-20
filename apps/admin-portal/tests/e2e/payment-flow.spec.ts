import { test, expect, Page } from '@playwright/test';
import { LoginPage, DashboardPage, ApplicationFormPage, PaymentPage } from './page-objects';

/**
 * E2E Tests: Payment Processing Flow
 *
 * Coverage:
 * - PromptPay QR code generation and display
 * - Payment verification via webhook
 * - Payment timeout handling
 * - Multiple payment methods
 * - Payment history and receipts
 * - Refund processing
 * - Payment status synchronization
 *
 * Test Strategy:
 * - Mock external payment gateway API
 * - Test real-time payment status updates
 * - Verify transaction integrity
 * - Test edge cases (timeouts, failures)
 */

test.describe('Payment Processing Flow', () => {
  test.use({ storageState: 'tests/e2e/.auth/farmer.json' });

  test.beforeEach(async ({ page }) => {
    // Navigate to applications page
    await page.goto('/applications');
  });

  test.describe('PromptPay QR Code Generation', () => {
    test('should generate valid PromptPay QR code for application fee', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      // Create a draft application first
      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Test Farm for Payment');
      await page.fill('input[name="location"]', 'Bangkok');
      await page.click('button:has-text("Save Draft")');

      // Navigate to payment
      await page.click('button:has-text("Proceed to Payment")');

      // Verify QR code is generated
      await expect(paymentPage.qrCodeImage).toBeVisible();
      await expect(page.locator('text=฿2,000.00')).toBeVisible(); // Application fee

      // Verify payment details
      await expect(page.locator('text=PromptPay ID:')).toBeVisible();
      await expect(page.locator('text=Reference:')).toBeVisible();

      // Verify QR code has data
      const qrImage = await paymentPage.qrCodeImage.getAttribute('src');
      expect(qrImage).toBeTruthy();
      expect(qrImage).toContain('data:image');
    });

    test('should display payment instructions in Thai', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      // Create and submit application
      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Test Farm Thai');
      await page.fill('input[name="location"]', 'Chiang Mai');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Verify Thai instructions
      await expect(page.locator('text=สแกน QR Code')).toBeVisible();
      await expect(page.locator('text=ชำระเงิน')).toBeVisible();
      await expect(page.locator('text=รอการตรวจสอบ')).toBeVisible();
    });

    test('should show payment expiry countdown', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Expiry Test Farm');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Verify countdown timer exists
      await expect(page.locator('text=Time Remaining:')).toBeVisible();
      await expect(page.locator('[data-testid="payment-countdown"]')).toBeVisible();

      // Verify timer format (MM:SS)
      const timerText = await page.locator('[data-testid="payment-countdown"]').textContent();
      expect(timerText).toMatch(/\d{2}:\d{2}/);
    });
  });

  test.describe('Payment Verification', () => {
    test('should verify payment via webhook callback', async ({ page, context }) => {
      const paymentPage = new PaymentPage(page);

      // Create application and go to payment
      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Webhook Test Farm');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Get payment reference
      const referenceText = await page.locator('[data-testid="payment-reference"]').textContent();
      const reference = referenceText?.replace('Reference: ', '').trim();

      // Mock webhook callback
      await page.evaluate(async ref => {
        await fetch('/api/payments/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: ref,
            status: 'SUCCESS',
            amount: 2000,
            transactionId: 'TXN' + Date.now(),
            timestamp: new Date().toISOString(),
          }),
        });
      }, reference);

      // Wait for payment verification
      await expect(page.locator('text=Payment Verified')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Success')).toBeVisible();

      // Verify redirect to application details
      await page.waitForURL('**/applications/**');
      await expect(page.locator('text=PENDING_REVIEW')).toBeVisible();
    });

    test('should handle failed payment verification', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Failed Payment Farm');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      const referenceText = await page.locator('[data-testid="payment-reference"]').textContent();
      const reference = referenceText?.replace('Reference: ', '').trim();

      // Mock failed webhook
      await page.evaluate(async ref => {
        await fetch('/api/payments/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: ref,
            status: 'FAILED',
            errorCode: 'INSUFFICIENT_FUNDS',
            timestamp: new Date().toISOString(),
          }),
        });
      }, reference);

      // Verify error message
      await expect(page.locator('text=Payment Failed')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Please try again')).toBeVisible();

      // Verify retry option
      await expect(page.locator('button:has-text("Retry Payment")')).toBeVisible();
    });

    test('should poll for payment status updates', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Polling Test Farm');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Monitor network requests for polling
      let pollCount = 0;
      page.on('request', request => {
        if (request.url().includes('/api/payments/status')) {
          pollCount++;
        }
      });

      // Wait for at least 3 polling requests (15 seconds at 5s interval)
      await page.waitForTimeout(16000);
      expect(pollCount).toBeGreaterThanOrEqual(3);

      // Verify status still shows pending
      await expect(page.locator('text=Waiting for Payment')).toBeVisible();
    });
  });

  test.describe('Payment Timeout Handling', () => {
    test('should expire payment after timeout period', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Timeout Test Farm');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Fast-forward time using mock
      await page.evaluate(() => {
        const futureTime = Date.now() + 30 * 60 * 1000; // 30 minutes
        Date.now = () => futureTime;
      });

      // Reload to trigger timeout check
      await page.reload();

      // Verify timeout message
      await expect(page.locator('text=Payment Expired')).toBeVisible();
      await expect(page.locator('text=30 minutes')).toBeVisible();
      await expect(page.locator('button:has-text("Generate New QR")')).toBeVisible();
    });

    test('should allow regenerating expired QR code', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Regenerate Test Farm');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Get first QR code
      const firstQR = await paymentPage.qrCodeImage.getAttribute('src');

      // Expire payment
      await page.evaluate(() => {
        const futureTime = Date.now() + 30 * 60 * 1000;
        Date.now = () => futureTime;
      });
      await page.reload();

      // Regenerate QR
      await page.click('button:has-text("Generate New QR")');

      // Verify new QR is different
      await expect(paymentPage.qrCodeImage).toBeVisible();
      const secondQR = await paymentPage.qrCodeImage.getAttribute('src');
      expect(secondQR).not.toBe(firstQR);

      // Verify new countdown
      await expect(page.locator('[data-testid="payment-countdown"]')).toBeVisible();
    });
  });

  test.describe('Multiple Payment Methods', () => {
    test('should support PromptPay payment method', async ({ page }) => {
      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'PromptPay Test');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Verify PromptPay is default
      await expect(page.locator('[data-testid="payment-method-promptpay"].active')).toBeVisible();
      await expect(page.locator('text=Scan QR Code with Banking App')).toBeVisible();
    });

    test('should support bank transfer payment method', async ({ page }) => {
      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Bank Transfer Test');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Switch to bank transfer
      await page.click('[data-testid="payment-method-bank"]');

      // Verify bank details displayed
      await expect(page.locator('text=Bank Account Details')).toBeVisible();
      await expect(page.locator('text=Account Number:')).toBeVisible();
      await expect(page.locator('text=Account Name:')).toBeVisible();
      await expect(page.locator('text=Bank:')).toBeVisible();

      // Verify upload slip option
      await expect(page.locator('button:has-text("Upload Payment Slip")')).toBeVisible();
    });

    test('should support credit card payment method', async ({ page }) => {
      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Credit Card Test');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Switch to credit card
      await page.click('[data-testid="payment-method-card"]');

      // Verify credit card form
      await expect(page.locator('input[name="cardNumber"]')).toBeVisible();
      await expect(page.locator('input[name="cardName"]')).toBeVisible();
      await expect(page.locator('input[name="expiryDate"]')).toBeVisible();
      await expect(page.locator('input[name="cvv"]')).toBeVisible();
      await expect(page.locator('button:has-text("Pay Now")')).toBeVisible();
    });
  });

  test.describe('Payment History', () => {
    test('should display payment transaction history', async ({ page }) => {
      // Navigate to profile/payments
      await page.goto('/profile/payments');

      // Verify payment history table
      await expect(page.locator('h1:has-text("Payment History")')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();

      // Verify table headers
      await expect(page.locator('th:has-text("Date")')).toBeVisible();
      await expect(page.locator('th:has-text("Application")')).toBeVisible();
      await expect(page.locator('th:has-text("Amount")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Receipt")')).toBeVisible();
    });

    test('should download payment receipt', async ({ page }) => {
      await page.goto('/profile/payments');

      // Wait for payment history to load
      await expect(page.locator('table tbody tr')).toHaveCount(
        await page.locator('table tbody tr').count(),
        { timeout: 5000 }
      );

      // Click download receipt for first successful payment
      const downloadPromise = page.waitForEvent('download');
      await page.click('tr:has-text("SUCCESS"):first-of-type button:has-text("Download")');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain('receipt');
      expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('should filter payment history by status', async ({ page }) => {
      await page.goto('/profile/payments');

      // Apply status filter
      await page.click('select[name="statusFilter"]');
      await page.selectOption('select[name="statusFilter"]', 'SUCCESS');

      // Verify all rows show SUCCESS
      const statusCells = await page.locator('td[data-status]').allTextContents();
      statusCells.forEach(status => {
        expect(status).toContain('Success');
      });

      // Change to PENDING filter
      await page.selectOption('select[name="statusFilter"]', 'PENDING');

      // Verify all rows show PENDING
      const pendingCells = await page.locator('td[data-status]').allTextContents();
      pendingCells.forEach(status => {
        expect(status).toContain('Pending');
      });
    });
  });

  test.describe('Refund Processing', () => {
    test('should allow admin to process refund', async ({ page, context }) => {
      // Switch to admin user
      const adminPage = await context.newPage();
      await adminPage.goto('/admin/payments');

      // Find a payment to refund
      await adminPage.click('tr:has-text("SUCCESS"):first-of-type');

      // Click refund button
      await adminPage.click('button:has-text("Process Refund")');

      // Fill refund form
      await adminPage.fill('textarea[name="refundReason"]', 'Application cancelled by user');
      await adminPage.fill('input[name="refundAmount"]', '2000');
      await adminPage.click('button:has-text("Confirm Refund")');

      // Verify success message
      await expect(adminPage.locator('text=Refund processed successfully')).toBeVisible();

      // Verify status changed to REFUNDED
      await expect(adminPage.locator('text=REFUNDED')).toBeVisible();

      await adminPage.close();
    });

    test('should notify user of refund completion', async ({ page }) => {
      // Assume refund was processed
      await page.goto('/profile/payments');

      // Look for refunded payment
      await expect(page.locator('tr:has-text("REFUNDED")')).toBeVisible();

      // Click to view refund details
      await page.click('tr:has-text("REFUNDED"):first-of-type');

      // Verify refund information
      await expect(page.locator('text=Refund Amount:')).toBeVisible();
      await expect(page.locator('text=Refund Date:')).toBeVisible();
      await expect(page.locator('text=Refund Reason:')).toBeVisible();
      await expect(page.locator('text=฿2,000.00')).toBeVisible();
    });
  });

  test.describe('Payment Status Synchronization', () => {
    test('should update application status after successful payment', async ({ page }) => {
      const paymentPage = new PaymentPage(page);

      // Create application
      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Sync Test Farm');
      await page.click('button:has-text("Save Draft")');

      // Verify initial status is DRAFT
      await expect(page.locator('text=DRAFT')).toBeVisible();

      // Go to payment
      await page.click('button:has-text("Proceed to Payment")');

      // Mock successful payment
      const referenceText = await page.locator('[data-testid="payment-reference"]').textContent();
      const reference = referenceText?.replace('Reference: ', '').trim();

      await page.evaluate(async ref => {
        await fetch('/api/payments/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: ref,
            status: 'SUCCESS',
            amount: 2000,
            transactionId: 'TXN' + Date.now(),
            timestamp: new Date().toISOString(),
          }),
        });
      }, reference);

      // Wait for redirect
      await page.waitForURL('**/applications/**');

      // Verify status changed to PENDING_REVIEW
      await expect(page.locator('text=PENDING_REVIEW')).toBeVisible();

      // Verify payment badge
      await expect(page.locator('[data-testid="payment-status"]')).toContainText('Paid');
    });

    test('should send payment confirmation email', async ({ page, context }) => {
      // This test would verify email sending in a real scenario
      // For E2E, we can check the API call was made

      await page.click('button:has-text("New Application")');
      await page.fill('input[name="farmName"]', 'Email Test Farm');
      await page.click('button:has-text("Save Draft")');
      await page.click('button:has-text("Proceed to Payment")');

      // Monitor API calls
      let emailSent = false;
      page.on('request', request => {
        if (request.url().includes('/api/emails/payment-confirmation')) {
          emailSent = true;
        }
      });

      // Mock payment success
      const referenceText = await page.locator('[data-testid="payment-reference"]').textContent();
      const reference = referenceText?.replace('Reference: ', '').trim();

      await page.evaluate(async ref => {
        await fetch('/api/payments/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: ref,
            status: 'SUCCESS',
            amount: 2000,
            transactionId: 'TXN' + Date.now(),
            timestamp: new Date().toISOString(),
          }),
        });
      }, reference);

      // Wait for processing
      await page.waitForTimeout(3000);

      // Verify email API was called
      expect(emailSent).toBeTruthy();
    });
  });
});
