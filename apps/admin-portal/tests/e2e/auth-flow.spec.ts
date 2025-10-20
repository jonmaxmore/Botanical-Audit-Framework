/**
 * E2E Tests - User Authentication Flow
 *
 * Tests complete authentication workflows including login, logout,
 * registration, password reset, and session management.
 */

import { test, expect } from '@playwright/test';
import { LoginPage, RegistrationPage, DashboardPage } from '../page-objects';

test.describe('User Authentication Flow', () => {
  test.describe('User Login', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      await loginPage.goto('/login');
      await loginPage.login('farmer@test.com', 'TestPassword123!');

      // Verify redirect to dashboard
      await page.waitForURL('/dashboard');
      await dashboardPage.verifyDashboardLoaded();
    });

    test('should show error with invalid email', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto('/login');
      await loginPage.login('invalid@test.com', 'TestPassword123!');

      // Verify error message
      await loginPage.verifyLoginError('Invalid email or password');
    });

    test('should show error with invalid password', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto('/login');
      await loginPage.login('farmer@test.com', 'WrongPassword');

      // Verify error message
      await loginPage.verifyLoginError('Invalid email or password');
    });

    test('should show validation error with empty fields', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto('/login');
      await loginPage.loginButton.click();

      // Verify validation errors
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should redirect authenticated user from login page', async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Login first
      await loginPage.goto('/login');
      await loginPage.login('farmer@test.com', 'TestPassword123!');
      await page.waitForURL('/dashboard');

      // Try to access login page again
      await page.goto('/login');

      // Should redirect to dashboard
      await page.waitForURL('/dashboard');
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });
  });

  test.describe('User Registration', () => {
    test('should register new user successfully', async ({ page }) => {
      const registrationPage = new RegistrationPage(page);
      const timestamp = Date.now();

      await registrationPage.goto('/register');

      await registrationPage.register({
        email: `newuser-${timestamp}@test.com`,
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '0812345678',
      });

      // Verify success message or redirect
      await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });
    });

    test('should show error with duplicate email', async ({ page }) => {
      const registrationPage = new RegistrationPage(page);

      await registrationPage.goto('/register');

      await registrationPage.register({
        email: 'farmer@test.com', // Existing email
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '0812345678',
      });

      // Verify error message
      await expect(page.locator('text=Email already exists')).toBeVisible();
    });

    test('should show error with password mismatch', async ({ page }) => {
      const registrationPage = new RegistrationPage(page);
      const timestamp = Date.now();

      await registrationPage.goto('/register');

      await registrationPage.register({
        email: `newuser-${timestamp}@test.com`,
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '0812345678',
      });

      // Verify error message
      await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      const registrationPage = new RegistrationPage(page);

      await registrationPage.goto('/register');
      await registrationPage.registerButton.click();

      // Verify validation errors
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
      await expect(page.locator('text=First name is required')).toBeVisible();
      await expect(page.locator('text=Last name is required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      const registrationPage = new RegistrationPage(page);

      await registrationPage.goto('/register');

      await registrationPage.emailInput.fill('invalid-email');
      await registrationPage.registerButton.click();

      // Verify email format error
      await expect(page.locator('text=Invalid email format')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      const registrationPage = new RegistrationPage(page);
      const timestamp = Date.now();

      await registrationPage.goto('/register');

      await registrationPage.register({
        email: `newuser-${timestamp}@test.com`,
        password: 'weak', // Weak password
        confirmPassword: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '0812345678',
      });

      // Verify password strength error
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });
  });

  test.describe('User Logout', () => {
    test('should logout successfully', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      // Login first
      await loginPage.goto('/login');
      await loginPage.login('farmer@test.com', 'TestPassword123!');
      await page.waitForURL('/dashboard');

      // Logout
      await dashboardPage.logout();

      // Verify redirect to login
      await page.waitForURL('/login');
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('should clear session after logout', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      // Login
      await loginPage.goto('/login');
      await loginPage.login('farmer@test.com', 'TestPassword123!');
      await page.waitForURL('/dashboard');

      // Logout
      await dashboardPage.logout();
      await page.waitForURL('/login');

      // Try to access protected page
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForURL('/login');
      await expect(loginPage.loginButton).toBeVisible();
    });
  });

  test.describe('Password Reset', () => {
    test('should request password reset', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto('/login');
      await loginPage.clickForgotPassword();

      // Verify redirect to password reset page
      await page.waitForURL('/forgot-password');
      await expect(page.locator('h1:has-text("Forgot Password")')).toBeVisible();

      // Fill email and submit
      await page.fill('input[name="email"]', 'farmer@test.com');
      await page.click('button:has-text("Send Reset Link")');

      // Verify success message
      await expect(page.locator('text=Password reset link sent')).toBeVisible({ timeout: 10000 });
    });

    test('should show error for non-existent email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[name="email"]', 'nonexistent@test.com');
      await page.click('button:has-text("Send Reset Link")');

      // Verify error message
      await expect(page.locator('text=Email not found')).toBeVisible();
    });

    test('should reset password with valid token', async ({ page }) => {
      // This would require a valid reset token
      // In a real scenario, you'd get this from the database or email
      const mockResetToken = 'valid-reset-token-123';

      await page.goto(`/reset-password?token=${mockResetToken}`);

      // Fill new password
      await page.fill('input[name="password"]', 'NewPassword123!');
      await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
      await page.click('button:has-text("Reset Password")');

      // Verify success and redirect to login
      await expect(page.locator('text=Password reset successful')).toBeVisible({ timeout: 10000 });

      await page.waitForURL('/login');
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      // Login
      await loginPage.goto('/login');
      await loginPage.login('farmer@test.com', 'TestPassword123!');
      await page.waitForURL('/dashboard');

      // Refresh page
      await page.reload();

      // Verify still logged in
      await dashboardPage.verifyDashboardLoaded();
    });

    test('should redirect to login when accessing protected route without auth', async ({
      page,
    }) => {
      await page.goto('/applications');

      // Should redirect to login
      await page.waitForURL('/login');
      await expect(page.locator('h1:has-text("Login")')).toBeVisible();
    });

    test('should preserve return URL after login', async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Try to access protected page
      await page.goto('/applications/new');

      // Should redirect to login with return URL
      await page.waitForURL(/\/login\?.*returnUrl/);

      // Login
      await loginPage.login('farmer@test.com', 'TestPassword123!');

      // Should redirect back to original page
      await page.waitForURL('/applications/new');
      await expect(page.locator('h1:has-text("New Application")')).toBeVisible();
    });

    test('should handle concurrent sessions', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();

      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      const loginPage1 = new LoginPage(page1);
      const loginPage2 = new LoginPage(page2);

      // Login in first context
      await loginPage1.goto('/login');
      await loginPage1.login('farmer@test.com', 'TestPassword123!');
      await page1.waitForURL('/dashboard');

      // Login in second context
      await loginPage2.goto('/login');
      await loginPage2.login('farmer@test.com', 'TestPassword123!');
      await page2.waitForURL('/dashboard');

      // Both sessions should be active
      await expect(page1.locator('h1:has-text("Dashboard")')).toBeVisible();
      await expect(page2.locator('h1:has-text("Dashboard")')).toBeVisible();

      await context1.close();
      await context2.close();
    });
  });

  test.describe('Role-Based Access', () => {
    test('should allow farmer to access farmer routes', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto('/login');
      await loginPage.login('farmer@test.com', 'TestPassword123!');
      await page.waitForURL('/dashboard');

      // Access farmer routes
      await page.goto('/applications');
      await expect(page.locator('h1:has-text("Applications")')).toBeVisible();

      await page.goto('/applications/new');
      await expect(page.locator('h1:has-text("New Application")')).toBeVisible();
    });

    test('should allow admin to access admin routes', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto('/login');
      await loginPage.login('admin@test.com', 'AdminPassword123!');
      await page.waitForURL(/\/(dashboard|admin)/);

      // Access admin routes
      await page.goto('/admin/users');
      await expect(page.locator('h1:has-text("User Management")')).toBeVisible();

      await page.goto('/admin/applications');
      await expect(page.locator('h1:has-text("Application Review")')).toBeVisible();
    });

    test('should deny farmer access to admin routes', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto('/login');
      await loginPage.login('farmer@test.com', 'TestPassword123!');
      await page.waitForURL('/dashboard');

      // Try to access admin route
      await page.goto('/admin/users');

      // Should redirect or show access denied
      await expect(page.locator('text=Access Denied')).toBeVisible({ timeout: 5000 });
    });
  });
});
