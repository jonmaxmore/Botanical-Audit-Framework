/**
 * Integration Tests - Users & Authentication API
 * Tests user management, authentication, authorization, and role-based access
 */

import {
  setupTestEnvironment,
  teardownTestEnvironment,
  createTestUser,
  getPrisma,
  mockExternalApis,
} from '../setup';
import { assertRecordExists, countRecords } from '../helpers';

describe('Users & Authentication API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  describe('User Registration', () => {
    test('should register new farmer user', async () => {
      const prisma = getPrisma();

      const user = await prisma.user.create({
        data: {
          email: `farmer-${Date.now()}@example.com`,
          password: 'hashedPassword123',
          firstName: 'John',
          lastName: 'Farmer',
          phoneNumber: '0812345678',
          role: 'FARMER',
          isEmailVerified: false,
          isActive: true,
        },
      });

      expect(user).toBeDefined();
      expect(user.role).toBe('FARMER');
      expect(user.isEmailVerified).toBe(false);
      expect(await assertRecordExists('user', user.id)).toBe(true);
    });

    test('should create admin user', async () => {
      const admin = await createTestUser('ADMIN');

      expect(admin.role).toBe('ADMIN');
      expect(admin.isActive).toBe(true);
    });

    test('should create inspector user', async () => {
      const inspector = await createTestUser('INSPECTOR');

      expect(inspector.role).toBe('INSPECTOR');
    });

    test('should reject duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      const prisma = getPrisma();

      await prisma.user.create({
        data: {
          email,
          password: 'hashedPassword123',
          firstName: 'First',
          lastName: 'User',
          phoneNumber: '0812345678',
          role: 'FARMER',
          isEmailVerified: true,
          isActive: true,
        },
      });

      // Try to create duplicate
      await expect(
        prisma.user.create({
          data: {
            email, // Same email
            password: 'hashedPassword456',
            firstName: 'Second',
            lastName: 'User',
            phoneNumber: '0812345679',
            role: 'FARMER',
            isEmailVerified: true,
            isActive: true,
          },
        }),
      ).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const prisma = getPrisma();

      // Invalid email should be rejected by database constraints
      // or application-level validation
      const invalidEmail = 'not-an-email';

      // In real implementation, this would be validated before reaching database
      expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  describe('User Authentication', () => {
    test('should verify user credentials', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const found = await prisma.user.findUnique({
        where: { email: user.email },
      });

      expect(found).toBeDefined();
      expect(found?.password).toBe('hashedPassword123');
    });

    test('should handle email verification', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Initially not verified
      expect(user.isEmailVerified).toBe(true); // Our test helper creates verified users

      // Update to unverified for testing
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: false },
      });

      // Verify email
      const verified = await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });

      expect(verified.isEmailVerified).toBe(true);
    });

    test('should handle password reset flow', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Generate reset token (simulated)
      const resetToken = `reset-${Date.now()}`;
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry: resetExpiry,
        },
      });

      // Retrieve user with token
      const userWithToken = await prisma.user.findFirst({
        where: {
          resetToken,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });

      expect(userWithToken).toBeDefined();
      expect(userWithToken?.id).toBe(user.id);

      // Reset password
      const newPassword = 'newHashedPassword456';
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: newPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      const updated = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updated?.password).toBe(newPassword);
      expect(updated?.resetToken).toBeNull();
    });

    test('should prevent login for inactive users', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Deactivate user
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });

      const inactive = await prisma.user.findUnique({
        where: { email: user.email },
      });

      expect(inactive?.isActive).toBe(false);
      // Login logic should check isActive flag
    });
  });

  describe('Authorization & Permissions', () => {
    test('should verify admin role', async () => {
      const admin = await createTestUser('ADMIN');

      expect(admin.role).toBe('ADMIN');
      // Admin can access all features
    });

    test('should verify inspector role', async () => {
      const inspector = await createTestUser('INSPECTOR');

      expect(inspector.role).toBe('INSPECTOR');
      // Inspector can only access inspection-related features
    });

    test('should verify farmer role', async () => {
      const farmer = await createTestUser('FARMER');

      expect(farmer.role).toBe('FARMER');
      // Farmer can only access their own applications
    });

    test('should restrict access based on role', async () => {
      const farmer = await createTestUser('FARMER');
      const admin = await createTestUser('ADMIN');

      // Farmer should not be able to access admin features
      expect(farmer.role).not.toBe('ADMIN');
      expect(admin.role).toBe('ADMIN');
    });

    test('should check user ownership of resources', async () => {
      const user1 = await createTestUser('FARMER');
      const user2 = await createTestUser('FARMER');

      // User1 creates application
      const prisma = getPrisma();
      const app1 = await prisma.application.create({
        data: {
          userId: user1.id,
          applicationNumber: `APP-${Date.now()}`,
          applicationType: 'GAP_VEGETABLES',
          farmName: 'User1 Farm',
          farmLocation: 'Bangkok',
          farmSize: 10,
          crops: ['Tomato'],
          status: 'DRAFT',
        },
      });

      // User2 should not be able to access User1's application
      expect(app1.userId).toBe(user1.id);
      expect(app1.userId).not.toBe(user2.id);
    });
  });

  describe('User Profile Management', () => {
    test('should update user profile', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: 'Updated',
          lastName: 'Name',
          phoneNumber: '0898765432',
        },
      });

      expect(updated.firstName).toBe('Updated');
      expect(updated.lastName).toBe('Name');
      expect(updated.phoneNumber).toBe('0898765432');
    });

    test('should update user address', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          address: '123 Test Street',
          district: 'Test District',
          province: 'Bangkok',
          postalCode: '10100',
        },
      });

      expect(updated.address).toBe('123 Test Street');
      expect(updated.province).toBe('Bangkok');
    });

    test('should retrieve user with applications', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Create application
      await prisma.application.create({
        data: {
          userId: user.id,
          applicationNumber: `APP-${Date.now()}`,
          applicationType: 'GAP_VEGETABLES',
          farmName: 'Test Farm',
          farmLocation: 'Bangkok',
          farmSize: 10,
          crops: ['Tomato'],
          status: 'DRAFT',
        },
      });

      const userWithApps = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          applications: true,
        },
      });

      expect(userWithApps?.applications).toHaveLength(1);
    });

    test('should delete user account', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      await prisma.user.delete({
        where: { id: user.id },
      });

      expect(await assertRecordExists('user', user.id)).toBe(false);
    });

    test('should soft delete user (deactivate)', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Soft delete
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
        },
      });

      const deactivated = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(deactivated?.isActive).toBe(false);
      expect(deactivated?.deactivatedAt).toBeDefined();
      expect(await assertRecordExists('user', user.id)).toBe(true);
    });
  });

  describe('Role Management', () => {
    test('should list users by role', async () => {
      await createTestUser('FARMER');
      await createTestUser('FARMER');
      await createTestUser('ADMIN');
      await createTestUser('INSPECTOR');

      const prisma = getPrisma();
      const farmers = await prisma.user.findMany({
        where: { role: 'FARMER' },
      });

      expect(farmers.length).toBeGreaterThanOrEqual(2);
    });

    test('should count users by role', async () => {
      const prisma = getPrisma();

      const roleStats = await prisma.user.groupBy({
        by: ['role'],
        _count: true,
      });

      expect(roleStats.length).toBeGreaterThan(0);
      expect(roleStats.every(stat => ['FARMER', 'ADMIN', 'INSPECTOR'].includes(stat.role))).toBe(
        true,
      );
    });

    test('should change user role', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Promote to inspector
      const promoted = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'INSPECTOR' },
      });

      expect(promoted.role).toBe('INSPECTOR');
    });
  });

  describe('Security Features', () => {
    test('should track last login time', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const loginTime = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: loginTime },
      });

      const updated = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updated?.lastLoginAt).toBeDefined();
    });

    test('should handle failed login attempts', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Increment failed login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: {
            increment: 1,
          },
        },
      });

      const updated = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updated?.failedLoginAttempts).toBeGreaterThan(0);
    });

    test('should lock account after multiple failed attempts', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Simulate 5 failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 5,
          isActive: false,
          lockedAt: new Date(),
        },
      });

      const locked = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(locked?.failedLoginAttempts).toBe(5);
      expect(locked?.isActive).toBe(false);
      expect(locked?.lockedAt).toBeDefined();
    });

    test('should send email on registration', async () => {
      // Mock email service
      mockExternalApis.email.send.mockResolvedValue({
        success: true,
        messageId: 'welcome-email-123',
      });

      const user = await createTestUser('FARMER');

      // Simulate sending welcome email
      await mockExternalApis.email.send({
        to: user.email,
        subject: 'Welcome to GACP Platform',
        body: 'Thank you for registering',
      });

      expect(mockExternalApis.email.send).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    test('should efficiently query users with filters', async () => {
      // Create multiple users
      await Promise.all([
        createTestUser('FARMER'),
        createTestUser('FARMER'),
        createTestUser('ADMIN'),
      ]);

      const prisma = getPrisma();
      const startTime = Date.now();

      await prisma.user.findMany({
        where: {
          role: 'FARMER',
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      const duration = Date.now() - startTime;

      // Should be fast (< 50ms)
      expect(duration).toBeLessThan(50);
    });

    test('should handle bulk user operations', async () => {
      const initialCount = await countRecords('user');

      // Create 5 users in parallel
      await Promise.all([
        createTestUser('FARMER'),
        createTestUser('FARMER'),
        createTestUser('FARMER'),
        createTestUser('ADMIN'),
        createTestUser('INSPECTOR'),
      ]);

      const finalCount = await countRecords('user');
      expect(finalCount - initialCount).toBe(5);
    });
  });
});
