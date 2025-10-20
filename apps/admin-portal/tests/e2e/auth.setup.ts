/**
 * Authentication Setup for E2E Tests
 *
 * This file sets up authenticated sessions for different user roles
 * before running E2E tests. It creates auth state files that can be
 * reused across tests to avoid repeated login flows.
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authDir = path.join(__dirname, '.auth');

/**
 * Setup authentication for Farmer user
 */
setup('authenticate as farmer', async ({ page }) => {
  await page.goto('/login');

  // Fill in login form
  await page.fill('input[name="email"]', process.env.TEST_FARMER_EMAIL || 'farmer@test.com');
  await page.fill('input[name="password"]', process.env.TEST_FARMER_PASSWORD || 'TestPassword123!');

  // Submit login
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // Verify user is logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();

  // Save authentication state
  await page.context().storageState({
    path: path.join(authDir, 'farmer.json'),
  });

  console.log('✅ Farmer authentication setup complete');
});

/**
 * Setup authentication for Admin user
 */
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');

  // Fill in login form
  await page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@test.com');
  await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!');

  // Submit login
  await page.click('button[type="submit"]');

  // Wait for redirect to admin dashboard
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 });

  // Verify admin is logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();

  // Save authentication state
  await page.context().storageState({
    path: path.join(authDir, 'admin.json'),
  });

  console.log('✅ Admin authentication setup complete');
});

/**
 * Setup authentication for Inspector user
 */
setup('authenticate as inspector', async ({ page }) => {
  await page.goto('/login');

  // Fill in login form
  await page.fill('input[name="email"]', process.env.TEST_INSPECTOR_EMAIL || 'inspector@test.com');
  await page.fill(
    'input[name="password"]',
    process.env.TEST_INSPECTOR_PASSWORD || 'InspectorPass123!',
  );

  // Submit login
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // Verify inspector is logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();

  // Save authentication state
  await page.context().storageState({
    path: path.join(authDir, 'inspector.json'),
  });

  console.log('✅ Inspector authentication setup complete');
});

/**
 * Setup unauthenticated state (for testing login/registration)
 */
setup('setup guest state', async ({ page }) => {
  await page.goto('/');

  // Just visit the home page to establish basic session
  await page.waitForLoadState('networkidle');

  // Save empty authentication state
  await page.context().storageState({
    path: path.join(authDir, 'guest.json'),
  });

  console.log('✅ Guest state setup complete');
});
