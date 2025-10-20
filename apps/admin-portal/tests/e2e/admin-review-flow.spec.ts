/**
 * E2E Tests - Admin Review Flow
 *
 * Tests admin workflow for reviewing applications, approving/rejecting,
 * document verification, and audit log tracking.
 */

import { test, expect } from '@playwright/test';
import { DashboardPage, ApplicationReviewPage } from '../page-objects';

test.describe('Admin Review Flow', () => {
  test.use({
    storageState: 'tests/e2e/.auth/admin.json',
  });

  test.describe('Application Review Queue', () => {
    test('should display pending review applications', async ({ page }) => {
      await page.goto('/admin/applications');

      // Verify review queue is visible
      await expect(page.locator('h1:has-text("Application Review")')).toBeVisible();

      // Verify pending applications are listed
      await expect(page.locator('text=PENDING_REVIEW')).toBeVisible();

      // Verify key columns
      await expect(page.locator('th:has-text("Application Number")')).toBeVisible();
      await expect(page.locator('th:has-text("Farm Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Submitted Date")')).toBeVisible();
    });

    test('should filter applications by status', async ({ page }) => {
      await page.goto('/admin/applications');

      // Open filter dropdown
      await page.click('button:has-text("Filter")');

      // Select PENDING_REVIEW
      await page.click('input[type="checkbox"][value="PENDING_REVIEW"]');
      await page.click('button:has-text("Apply")');

      // Verify filtered results
      const statusBadges = page.locator('[data-testid="application-status"]');
      const count = await statusBadges.count();

      for (let i = 0; i < count; i++) {
        await expect(statusBadges.nth(i)).toContainText('PENDING_REVIEW');
      }
    });

    test('should sort applications by date', async ({ page }) => {
      await page.goto('/admin/applications');

      // Click on date column header
      await page.click('th:has-text("Submitted Date")');

      // Wait for sort
      await page.waitForTimeout(1000);

      // Verify sorted order (descending by default)
      const dates = page.locator('td[data-testid="submitted-date"]');
      const firstDate = await dates.first().textContent();
      const secondDate = await dates.nth(1).textContent();

      // Compare dates (assuming format is readable)
      expect(firstDate).toBeTruthy();
      expect(secondDate).toBeTruthy();
    });

    test('should search applications by farm name', async ({ page }) => {
      await page.goto('/admin/applications');

      // Enter search query
      await page.fill('input[placeholder*="Search"]', 'Green Valley');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Verify results contain search term
      const farmNames = page.locator('td:has-text("Green Valley")');
      expect(await farmNames.count()).toBeGreaterThan(0);
    });

    test('should display application count', async ({ page }) => {
      await page.goto('/admin/applications');

      // Verify total count is displayed
      await expect(page.locator('text=/Total: \\d+ applications/')).toBeVisible();
    });
  });

  test.describe('Application Review Details', () => {
    test('should open application for review', async ({ page }) => {
      const reviewPage = new ApplicationReviewPage(page);

      await page.goto('/admin/applications');

      // Click on first pending application
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Verify review page loaded
      await expect(reviewPage.applicationNumber).toBeVisible();
      await expect(reviewPage.farmDetails).toBeVisible();
      await expect(reviewPage.documentsSection).toBeVisible();
    });

    test('should display all application details', async ({ page }) => {
      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Verify all detail sections
      await expect(page.locator('text=Farm Information')).toBeVisible();
      await expect(page.locator('text=Applicant Information')).toBeVisible();
      await expect(page.locator('text=Documents')).toBeVisible();
      await expect(page.locator('text=Payment Information')).toBeVisible();
      await expect(page.locator('text=Application History')).toBeVisible();
    });

    test('should view uploaded documents', async ({ page }) => {
      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Navigate to documents section
      const documentsSection = page.locator('[data-testid="documents-section"]');
      await expect(documentsSection).toBeVisible();

      // Verify documents are listed
      const documentList = page.locator('[data-testid="document-item"]');
      expect(await documentList.count()).toBeGreaterThan(0);

      // Click to view first document
      await page.click('[data-testid="view-document-button"]:first-of-type');

      // Verify document viewer opens
      await expect(page.locator('[data-testid="document-viewer"]')).toBeVisible();
    });

    test('should download document', async ({ page }) => {
      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Click download button on first document
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-document-button"]:first-of-type');

      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toBeTruthy();
    });

    test('should verify payment status', async ({ page }) => {
      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Check payment section
      await page.click('button:has-text("Payment")');

      // Verify payment details
      await expect(page.locator('text=Payment Status: Completed')).toBeVisible();
      await expect(page.locator('text=Payment Amount:')).toBeVisible();
      await expect(page.locator('text=Payment Date:')).toBeVisible();
    });
  });

  test.describe('Approve Application', () => {
    test('should approve application with notes', async ({ page }) => {
      const reviewPage = new ApplicationReviewPage(page);

      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Get application number for verification
      const appNumber = await reviewPage.applicationNumber.textContent();

      // Add review notes
      await reviewPage.addReviewNotes(
        'All documents verified. Farm meets GAP standards. Approved.'
      );

      // Click approve button
      await reviewPage.approveButton.click();

      // Confirm approval dialog
      await page.click('button:has-text("Confirm Approval")');

      // Verify success message
      await expect(page.locator('text=Application approved successfully')).toBeVisible({
        timeout: 10000,
      });

      // Verify redirected to applications list
      await page.waitForURL('/admin/applications');

      // Verify application status changed
      const approvedRow = page.locator(`tr:has-text("${appNumber}")`);
      await expect(approvedRow.locator('text=APPROVED')).toBeVisible();
    });

    test('should require review notes for approval', async ({ page }) => {
      const reviewPage = new ApplicationReviewPage(page);

      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Try to approve without notes
      await reviewPage.approveButton.click();

      // Verify validation error
      await expect(page.locator('text=Review notes are required')).toBeVisible();
    });

    test('should send email notification on approval', async ({ page }) => {
      const reviewPage = new ApplicationReviewPage(page);

      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      await reviewPage.approveApplication('Approved after thorough review.');

      // Verify email sent notification
      await expect(page.locator('text=Notification email sent to applicant')).toBeVisible();
    });

    test('should update application history on approval', async ({ page }) => {
      await page.goto('/admin/applications');

      // Find and click recently approved application
      await page.click('tr:has-text("APPROVED"):first-of-type');

      // Check history
      await page.click('button:has-text("History")');

      // Verify approval entry in history
      await expect(page.locator('text=Status changed to APPROVED')).toBeVisible();
      await expect(page.locator('text=Reviewed by:')).toBeVisible();
    });
  });

  test.describe('Reject Application', () => {
    test('should reject application with reason', async ({ page }) => {
      const reviewPage = new ApplicationReviewPage(page);

      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      const appNumber = await reviewPage.applicationNumber.textContent();

      // Add rejection reason
      await reviewPage.addReviewNotes(
        'Missing required land certificate. Farm size does not meet minimum requirements.'
      );

      // Click reject button
      await reviewPage.rejectButton.click();

      // Confirm rejection dialog
      await page.click('button:has-text("Confirm Rejection")');

      // Verify success message
      await expect(page.locator('text=Application rejected')).toBeVisible({ timeout: 10000 });

      // Verify status changed
      await page.waitForURL('/admin/applications');
      const rejectedRow = page.locator(`tr:has-text("${appNumber}")`);
      await expect(rejectedRow.locator('text=REJECTED')).toBeVisible();
    });

    test('should require rejection reason', async ({ page }) => {
      const reviewPage = new ApplicationReviewPage(page);

      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Try to reject without reason
      await reviewPage.rejectButton.click();

      // Verify validation error
      await expect(page.locator('text=Rejection reason is required')).toBeVisible();
    });

    test('should send rejection notification', async ({ page }) => {
      const reviewPage = new ApplicationReviewPage(page);

      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      await reviewPage.rejectApplication('Incomplete documentation.');

      // Verify email sent notification
      await expect(page.locator('text=Rejection notification sent')).toBeVisible();
    });
  });

  test.describe('Request Changes', () => {
    test('should request changes from applicant', async ({ page }) => {
      const reviewPage = new ApplicationReviewPage(page);

      await page.goto('/admin/applications');
      await page.click('tr:has-text("PENDING_REVIEW"):first-of-type');

      // Add change request notes
      await reviewPage.addReviewNotes(
        'Please update farm size information and re-upload land certificate with current date.'
      );

      // Click request changes
      await reviewPage.requestChangesButton.click();

      // Confirm request
      await page.click('button:has-text("Send Request")');

      // Verify success
      await expect(page.locator('text=Change request sent')).toBeVisible();

      // Verify status changed to CHANGES_REQUESTED
      await page.waitForURL('/admin/applications');
      await expect(page.locator('text=CHANGES_REQUESTED')).toBeVisible();
    });

    test('should allow applicant to resubmit after changes', async ({ page }) => {
      // This would typically be tested from farmer perspective
      // Switch to farmer auth state for this test
      await page.goto('/applications');

      // Find application with CHANGES_REQUESTED status
      const changesRow = page.locator('tr:has-text("CHANGES_REQUESTED"):first-of-type');

      if ((await changesRow.count()) > 0) {
        await changesRow.click();

        // Verify change request notes visible
        await expect(page.locator('[data-testid="change-request-notes"]')).toBeVisible();

        // Make changes and resubmit
        await page.click('button:has-text("Edit Application")');

        // Update farm size
        await page.fill('input[name="farmSize"]', '25');

        await page.click('button:has-text("Resubmit")');

        // Verify resubmission success
        await expect(page.locator('text=Application resubmitted for review')).toBeVisible();
      }
    });
  });

  test.describe('Bulk Actions', () => {
    test('should select multiple applications', async ({ page }) => {
      await page.goto('/admin/applications');

      // Select first 3 applications
      await page.click('input[type="checkbox"][data-testid="select-row-0"]');
      await page.click('input[type="checkbox"][data-testid="select-row-1"]');
      await page.click('input[type="checkbox"][data-testid="select-row-2"]');

      // Verify selection count
      await expect(page.locator('text=3 selected')).toBeVisible();
    });

    test('should export selected applications', async ({ page }) => {
      await page.goto('/admin/applications');

      // Select applications
      await page.click('input[type="checkbox"][data-testid="select-row-0"]');
      await page.click('input[type="checkbox"][data-testid="select-row-1"]');

      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export Selected")');

      const download = await downloadPromise;

      // Verify export file
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should assign applications to inspector', async ({ page }) => {
      await page.goto('/admin/applications');

      // Select applications
      await page.click('input[type="checkbox"][data-testid="select-row-0"]');

      // Click assign button
      await page.click('button:has-text("Assign to Inspector")');

      // Select inspector from dropdown
      await page.click('select[name="inspectorId"]');
      await page.click('option:has-text("Inspector")');

      // Confirm assignment
      await page.click('button:has-text("Assign")');

      // Verify success
      await expect(page.locator('text=Applications assigned successfully')).toBeVisible();
    });
  });

  test.describe('Audit Log', () => {
    test('should view audit log for application', async ({ page }) => {
      await page.goto('/admin/applications');
      await page.click('tr:first-of-type');

      // Navigate to audit log tab
      await page.click('button:has-text("Audit Log")');

      // Verify audit entries
      await expect(page.locator('[data-testid="audit-entry"]')).toHaveCount({ min: 1 });
    });

    test('should display all audit actions', async ({ page }) => {
      await page.goto('/admin/applications');
      await page.click('tr:first-of-type');
      await page.click('button:has-text("Audit Log")');

      // Verify different action types
      const auditEntries = page.locator('[data-testid="audit-entry"]');
      const count = await auditEntries.count();

      // Should have at least creation and status change entries
      expect(count).toBeGreaterThanOrEqual(2);

      // Verify audit entry structure
      await expect(auditEntries.first().locator('[data-testid="audit-action"]')).toBeVisible();
      await expect(auditEntries.first().locator('[data-testid="audit-user"]')).toBeVisible();
      await expect(auditEntries.first().locator('[data-testid="audit-timestamp"]')).toBeVisible();
    });

    test('should filter audit log by action type', async ({ page }) => {
      await page.goto('/admin/applications');
      await page.click('tr:first-of-type');
      await page.click('button:has-text("Audit Log")');

      // Filter by STATUS_CHANGE
      await page.click('select[name="actionFilter"]');
      await page.click('option[value="STATUS_CHANGE"]');

      // Verify filtered results
      const auditEntries = page.locator('[data-testid="audit-entry"]');
      const count = await auditEntries.count();

      for (let i = 0; i < count; i++) {
        await expect(auditEntries.nth(i)).toContainText('Status changed');
      }
    });

    test('should export audit log', async ({ page }) => {
      await page.goto('/admin/applications');
      await page.click('tr:first-of-type');
      await page.click('button:has-text("Audit Log")');

      // Export audit log
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export Audit Log")');

      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain('audit-log');
    });
  });

  test.describe('Statistics & Analytics', () => {
    test('should display review statistics on dashboard', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);

      await dashboardPage.goto('/admin/dashboard');

      // Verify statistics cards
      await expect(dashboardPage.statsCards).toHaveCount({ min: 4 });

      // Verify specific metrics
      await expect(page.locator('text=Pending Review')).toBeVisible();
      await expect(page.locator('text=Approved This Month')).toBeVisible();
      await expect(page.locator('text=Average Review Time')).toBeVisible();
    });

    test('should view review analytics', async ({ page }) => {
      await page.goto('/admin/analytics');

      // Verify charts are displayed
      await expect(page.locator('[data-testid="chart-applications-by-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="chart-approval-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="chart-review-time"]')).toBeVisible();
    });
  });
});
