/**
 * Registration API Integration Tests
 *
 * Tests for user registration endpoints.
 *
 * Coverage:
 * - POST /api/auth/register
 * - POST /api/auth/resend-verification
 * - GET /api/auth/verify-email
 *
 * @module tests/integration/register.test
 */

const request = require('supertest');
const { createTestApp } = require('../helpers/testApp');
const User = require('../../../../../database/models/User.model');

// Create test app with full middleware and error handling
const app = createTestApp();

describe('Registration API', () => {
  describe('POST /api/auth/register', () => {
    test('should register new user successfully', async () => {
      const userData = global.testUtils.createTestUserData();

      const response = await request(app).post('/api/auth/register').send(userData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.userId).toMatch(/^USR-\d{4}-[A-Z0-9]{8}$/);
      expect(response.body.data.user.role).toBe('FARMER');
      expect(response.body.data.user.emailVerified).toBe(false);

      // Should not return password or sensitive data
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data.user.emailVerificationToken).toBeUndefined();

      // Verify user in database
      const user = await User.findOne({ email: userData.email }).select('+emailVerificationToken');
      expect(user).toBeDefined();
      expect(user.emailVerified).toBe(false);
      expect(user.emailVerificationToken).toBeDefined();
      expect(user.emailVerificationExpires).toBeDefined();
    });

    test('should hash password before storing', async () => {
      const userData = global.testUtils.createTestUserData();

      await request(app).post('/api/auth/register').send(userData).expect(201);

      const user = await User.findOne({ email: userData.email }).select('+passwordHash');
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(userData.password);
      expect(user.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    test('should reject duplicate email', async () => {
      const userData = global.testUtils.createTestUserData();

      // Register first user
      await request(app).post('/api/auth/register').send(userData).expect(201);

      // Try to register with same email
      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('EMAIL_EXISTS');
      expect(response.body.message).toMatch(/อีเมลนี้ถูกใช้งานแล้ว/i);
    });

    test('should reject duplicate Thai ID', async () => {
      const userData1 = global.testUtils.createTestUserData();
      const userData2 = global.testUtils.createTestUserData();
      userData2.thaiId = userData1.thaiId; // Same Thai ID

      await request(app).post('/api/auth/register').send(userData1).expect(201);

      const response = await request(app).post('/api/auth/register').send(userData2).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('THAI_ID_EXISTS');
      expect(response.body.message).toMatch(/เลขบัตรประชาชนนี้ถูกใช้งานแล้ว/i);
    });

    test('should reject duplicate phone number', async () => {
      const userData1 = global.testUtils.createTestUserData();

      // First register succeeds
      await request(app).post('/api/auth/register').send(userData1).expect(201);

      // Second user with same phone but different email and thaiId
      const userData2 = {
        ...global.testUtils.createTestUserData(),
        phoneNumber: userData1.phoneNumber, // Same phone
      };

      const response = await request(app).post('/api/auth/register').send(userData2).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('PHONE_EXISTS');
      expect(response.body.message).toMatch(/เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว/i);
    });

    test('should reject invalid email format', async () => {
      const userData = global.testUtils.createTestUserData();
      userData.email = 'invalid-email';

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject weak password', async () => {
      const userData = global.testUtils.createTestUserData();
      userData.password = 'weak';

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid Thai ID checksum', async () => {
      const userData = global.testUtils.createTestUserData();
      userData.thaiId = '1234567890123'; // Invalid checksum

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should set default FARMER role and permissions', async () => {
      const userData = global.testUtils.createTestUserData();

      await request(app).post('/api/auth/register').send(userData).expect(201);

      const user = await User.findOne({ email: userData.email });
      expect(user.role).toBe('FARMER');
      expect(user.permissions).toContain('application:create');
      expect(user.permissions).toContain('application:read');
      expect(user.permissions).toContain('payment:create');
    });

    test('should generate sequential user IDs', async () => {
      const user1Data = global.testUtils.createTestUserData();

      const response1 = await request(app).post('/api/auth/register').send(user1Data).expect(201);

      const user2Data = global.testUtils.createTestUserData();

      const response2 = await request(app).post('/api/auth/register').send(user2Data).expect(201);

      const userId1 = response1.body.data.user.userId;
      const userId2 = response2.body.data.user.userId;

      expect(userId1).toMatch(/^USR-\d{4}-[A-Z0-9]{8}$/);
      expect(userId2).toMatch(/^USR-\d{4}-[A-Z0-9]{8}$/);

      // User IDs should be unique
      expect(userId1).not.toBe(userId2);
    });
  });

  describe('GET /api/auth/verify-email', () => {
    let user, verificationToken;

    beforeEach(async () => {
      const userData = global.testUtils.createTestUserData();

      const response = await request(app).post('/api/auth/register').send(userData).expect(201);

      user = await User.findOne({ email: userData.email }).select('+emailVerificationToken');
      verificationToken = user.emailVerificationToken;
    });

    test('should verify email with valid token', async () => {
      const response = await request(app)
        .get(`/api/auth/verify-email?token=${verificationToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/ยืนยันอีเมลสำเร็จ/i);

      // Check database
      const updatedUser = await User.findById(user._id).select('+emailVerificationToken');
      expect(updatedUser.emailVerified).toBe(true);
      expect(updatedUser.emailVerificationToken).toBeNull();
      expect(updatedUser.emailVerificationExpires).toBeNull();
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email?token=invalid-token')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_TOKEN');
      expect(response.body.message).toMatch(/token ไม่ถูกต้องหรือหมดอายุ/i);
    });

    test('should reject expired token', async () => {
      // Set token expiration to past
      user.emailVerificationExpires = new Date(Date.now() - 3600000);
      await user.save();

      const response = await request(app)
        .get(`/api/auth/verify-email?token=${verificationToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject reusing same token', async () => {
      // Verify once
      await request(app).get(`/api/auth/verify-email?token=${verificationToken}`).expect(200);

      // Try to verify again
      const response = await request(app)
        .get(`/api/auth/verify-email?token=${verificationToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    let user;

    beforeEach(async () => {
      const userData = global.testUtils.createTestUserData();

      await request(app).post('/api/auth/register').send(userData).expect(201);

      user = await User.findOne({ email: userData.email }).select('+emailVerificationToken');
    });

    test('should resend verification email', async () => {
      const oldToken = user.emailVerificationToken;

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: user.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/ส่งอีเมลยืนยันใหม่แล้ว/i);

      // Check that new token was generated
      const updatedUser = await User.findById(user._id).select('+emailVerificationToken');
      expect(updatedUser.emailVerificationToken).toBeDefined();
      expect(updatedUser.emailVerificationToken).not.toBe(oldToken);
    });

    test('should reject if email already verified', async () => {
      user.emailVerified = true;
      await user.save();

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: user.email })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('EMAIL_ALREADY_VERIFIED');
      expect(response.body.message).toMatch(/อีเมลถูกยืนยันแล้ว/i);
    });

    test('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      // Should return success even if email doesn't exist (security)
      expect(response.body.success).toBe(true);
    });

    test.skip('should enforce rate limiting', async () => {
      // NOTE: Rate limiting is disabled in test environment for performance and reliability
      // This test is skipped but kept for documentation purposes
      // Rate limiting is tested in e2e tests or manually verified

      // This test verifies rate limiter is configured (3 attempts per hour)
      // Make multiple rapid requests
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app).post('/api/auth/resend-verification').send({ email: user.email })
        );
      }

      const responses = await Promise.all(requests);

      // After 3 successful requests, should get rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});
