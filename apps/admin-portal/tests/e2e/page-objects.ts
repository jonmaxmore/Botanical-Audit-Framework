/**
 * Page Object Models for E2E Tests
 *
 * Centralized page interactions and selectors for better test maintainability.
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object with common functionality
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async clickButton(text: string) {
    await this.page.click(`button:has-text("${text}")`);
  }

  async fillInput(name: string, value: string) {
    await this.page.fill(`input[name="${name}"]`, value);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}

/**
 * Login Page Object
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    this.registerLink = page.locator('a:has-text("Register")');
    this.errorMessage = page.locator('[role="alert"]');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async verifyLoginError(expectedMessage: string) {
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async clickRegister() {
    await this.registerLink.click();
  }
}

/**
 * Registration Page Object
 */
export class RegistrationPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly registerButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.phoneInput = page.locator('input[name="phoneNumber"]');
    this.registerButton = page.locator('button[type="submit"]');
    this.loginLink = page.locator('a:has-text("Login")');
  }

  async register(userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) {
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.confirmPassword);
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.phoneInput.fill(userData.phoneNumber);
    await this.registerButton.click();
  }
}

/**
 * Dashboard Page Object
 */
export class DashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly statsCards: Locator;
  readonly applicationTable: Locator;
  readonly createApplicationButton: Locator;
  readonly profileMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("Dashboard")');
    this.statsCards = page.locator('[data-testid^="stats-card-"]');
    this.applicationTable = page.locator('[data-testid="application-table"]');
    this.createApplicationButton = page.locator('button:has-text("New Application")');
    this.profileMenu = page.locator('[data-testid="profile-menu"]');
    this.logoutButton = page.locator('button:has-text("Logout")');
  }

  async verifyDashboardLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  async getStatsCardValue(cardName: string): Promise<string> {
    const card = this.page.locator(`[data-testid="stats-card-${cardName}"]`);
    const value = await card.locator('[data-testid="stats-value"]').textContent();
    return value || '0';
  }

  async createNewApplication() {
    await this.createApplicationButton.click();
  }

  async logout() {
    await this.profileMenu.click();
    await this.logoutButton.click();
  }
}

/**
 * Application Form Page Object
 */
export class ApplicationFormPage extends BasePage {
  readonly farmNameInput: Locator;
  readonly farmLocationInput: Locator;
  readonly farmSizeInput: Locator;
  readonly applicationTypeSelect: Locator;
  readonly cropsInput: Locator;
  readonly saveButton: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.farmNameInput = page.locator('input[name="farmName"]');
    this.farmLocationInput = page.locator('input[name="farmLocation"]');
    this.farmSizeInput = page.locator('input[name="farmSize"]');
    this.applicationTypeSelect = page.locator('select[name="applicationType"]');
    this.cropsInput = page.locator('input[name="crops"]');
    this.saveButton = page.locator('button:has-text("Save Draft")');
    this.submitButton = page.locator('button:has-text("Submit")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.successMessage = page.locator('[role="alert"]:has-text("Success")');
  }

  async fillApplicationForm(data: {
    farmName: string;
    farmLocation: string;
    farmSize: string;
    applicationType?: string;
    crops?: string;
  }) {
    await this.farmNameInput.fill(data.farmName);
    await this.farmLocationInput.fill(data.farmLocation);
    await this.farmSizeInput.fill(data.farmSize);

    if (data.applicationType) {
      await this.applicationTypeSelect.selectOption(data.applicationType);
    }

    if (data.crops) {
      await this.cropsInput.fill(data.crops);
    }
  }

  async saveDraft() {
    await this.saveButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  async submitApplication() {
    await this.submitButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

/**
 * Application Review Page Object (Admin)
 */
export class ApplicationReviewPage extends BasePage {
  readonly applicationNumber: Locator;
  readonly applicationStatus: Locator;
  readonly farmDetails: Locator;
  readonly documentsSection: Locator;
  readonly reviewNotesTextarea: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly requestChangesButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.applicationNumber = page.locator('[data-testid="application-number"]');
    this.applicationStatus = page.locator('[data-testid="application-status"]');
    this.farmDetails = page.locator('[data-testid="farm-details"]');
    this.documentsSection = page.locator('[data-testid="documents-section"]');
    this.reviewNotesTextarea = page.locator('textarea[name="reviewNotes"]');
    this.approveButton = page.locator('button:has-text("Approve")');
    this.rejectButton = page.locator('button:has-text("Reject")');
    this.requestChangesButton = page.locator('button:has-text("Request Changes")');
    this.backButton = page.locator('button:has-text("Back")');
  }

  async verifyApplicationDetails(expectedNumber: string) {
    await expect(this.applicationNumber).toContainText(expectedNumber);
  }

  async addReviewNotes(notes: string) {
    await this.reviewNotesTextarea.fill(notes);
  }

  async approveApplication(notes: string) {
    await this.addReviewNotes(notes);
    await this.approveButton.click();
    await this.page.waitForURL(/\/applications/, { timeout: 10000 });
  }

  async rejectApplication(reason: string) {
    await this.addReviewNotes(reason);
    await this.rejectButton.click();
    await this.page.waitForURL(/\/applications/, { timeout: 10000 });
  }

  async requestChanges(notes: string) {
    await this.addReviewNotes(notes);
    await this.requestChangesButton.click();
  }
}

/**
 * Payment Page Object
 */
export class PaymentPage extends BasePage {
  readonly applicationNumber: Locator;
  readonly paymentAmount: Locator;
  readonly qrCodeImage: Locator;
  readonly paymentInstructions: Locator;
  readonly confirmPaymentButton: Locator;
  readonly cancelButton: Locator;
  readonly paymentStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.applicationNumber = page.locator('[data-testid="payment-application-number"]');
    this.paymentAmount = page.locator('[data-testid="payment-amount"]');
    this.qrCodeImage = page.locator('[data-testid="qr-code"]');
    this.paymentInstructions = page.locator('[data-testid="payment-instructions"]');
    this.confirmPaymentButton = page.locator('button:has-text("Confirm Payment")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.paymentStatus = page.locator('[data-testid="payment-status"]');
  }

  async verifyPaymentInfo(expectedAmount: string) {
    await expect(this.paymentAmount).toContainText(expectedAmount);
    await expect(this.qrCodeImage).toBeVisible();
  }

  async confirmPayment() {
    await this.confirmPaymentButton.click();
  }

  async waitForPaymentConfirmation(timeout = 30000) {
    await expect(this.paymentStatus).toContainText('Completed', { timeout });
  }
}

/**
 * Profile Page Object
 */
export class ProfilePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly addressTextarea: Locator;
  readonly saveButton: Locator;
  readonly changePasswordButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.phoneInput = page.locator('input[name="phoneNumber"]');
    this.addressTextarea = page.locator('textarea[name="address"]');
    this.saveButton = page.locator('button:has-text("Save Changes")');
    this.changePasswordButton = page.locator('button:has-text("Change Password")');
    this.successMessage = page.locator('[role="alert"]:has-text("Success")');
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
  }) {
    if (data.firstName) {
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName) {
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.phoneNumber) {
      await this.phoneInput.fill(data.phoneNumber);
    }
    if (data.address) {
      await this.addressTextarea.fill(data.address);
    }

    await this.saveButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }
}
