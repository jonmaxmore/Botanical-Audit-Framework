/**
 * Authentication Setup for E2E Tests
 *
 * This setup file handles authentication for all three portals before tests run.
 * It creates storage states that can be reused across test sessions.
 */

import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const farmerAuthFile = 'tests/e2e/.auth/farmer.json';
const dtamAuthFile = 'tests/e2e/.auth/dtam.json';
const adminAuthFile = 'tests/e2e/.auth/admin.json';

// Ensure auth directory exists
const authDir = path.dirname(farmerAuthFile);
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

/**
 * Setup: Authenticate as Farmer
 */
setup('authenticate as farmer', async ({ page }) => {
  await page.goto('http://localhost:3001/login');

  // Fill in farmer login credentials
  await page.fill('input[name="email"]', 'farmer@test.com');
  await page.fill('input[name="password"]', 'password123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL('http://localhost:3001/dashboard');

  // Verify we're logged in
  await expect(page.locator('text=แดชบอร์ด')).toBeVisible();

  // Save signed-in state
  await page.context().storageState({ path: farmerAuthFile });
});

/**
 * Setup: Authenticate as DTAM Officer
 */
setup('authenticate as dtam', async ({ page }) => {
  await page.goto('http://localhost:3002/login');

  // Fill in DTAM login credentials
  await page.fill('input[name="email"]', 'dtam@test.com');
  await page.fill('input[name="password"]', 'password123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL('http://localhost:3002/dashboard');

  // Verify we're logged in
  await expect(page.locator('text=แดชบอร์ด')).toBeVisible();

  // Save signed-in state
  await page.context().storageState({ path: dtamAuthFile });
});

/**
 * Setup: Authenticate as Admin
 */
setup('authenticate as admin', async ({ page }) => {
  await page.goto('http://localhost:3002/login');

  // Fill in admin login credentials
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'password123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL('http://localhost:3002/dashboard');

  // Verify we're logged in as admin
  await expect(page.locator('text=แดชบอร์ด')).toBeVisible();

  // Save signed-in state
  await page.context().storageState({ path: adminAuthFile });
});
