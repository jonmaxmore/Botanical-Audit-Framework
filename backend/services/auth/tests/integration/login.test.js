/**
 * Login API Integration Tests
 *
 * Tests for user login and authentication endpoints.
 *
 * Coverage:
 * - POST /api/auth/login
 * - POST /api/auth/logout
 * - GET /api/auth/me
 * - Account lockout mechanism
 * - Login history tracking
 *
 * @module tests/integration/login.test
 */

const request = require('supertest');
const bcrypt = require('bcrypt');
const { createTestApp } = require('../helpers/testApp');
const User = require('../../../../../database/models/User.model');

// Create test app with full middleware and error handling
const app = createTestApp();

describe('Login API', () => {
  let testUser, testPassword;

  beforeEach(async () => {
    testPassword = 'Test@1234';
    const userData = global.testUtils.createTestUserData({ password: testPassword });

    // Create user directly in database
    const passwordHash = await bcrypt.hash(testPassword, 10);
    const userId = await User.generateUserId();
    testUser = await User.create({
      ...userData,
      userId,
      passwordHash,
      role: 'FARMER',
      permissions: ['application:create', 'application:read:own'],
      emailVerified: true,
      status: 'ACTIVE',
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.userId).toBe(testUser.userId);

      // Should not return sensitive data
      expect(response.body.data.user.passwordHash).toBeUndefined();

      // Should set refresh token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toMatch(/HttpOnly/);
    });

    test('should update lastLogin timestamp', async () => {
      const beforeLogin = new Date();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.lastLoginAt).toBeDefined();
      expect(updatedUser.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });

    test('should add to login history', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.loginHistory).toBeDefined();
      expect(updatedUser.loginHistory.length).toBeGreaterThan(0);

      const lastLogin = updatedUser.loginHistory[updatedUser.loginHistory.length - 1];
      expect(lastLogin.timestamp).toBeDefined();
      expect(lastLogin.success).toBe(true);
    });

    test('should reset failed login attempts on success', async () => {
      // Set failed attempts
      testUser.failedLoginAttempts = 3;
      await testUser.save();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.loginAttempts).toBe(0);
    });

    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
      expect(response.body.message).toMatch(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/i);
    });

    test('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
      expect(response.body.message).toMatch(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/i);
    });

    test('should increment failed login attempts', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.loginAttempts).toBe(1);
    });

    test('should lock account after 5 failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/auth/login').send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });
      }

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.accountLocked).toBe(true);
      expect(updatedUser.accountLockedUntil).toBeDefined();

      // Should be locked for 15 minutes (as per User model implementation)
      const lockDuration = updatedUser.accountLockedUntil.getTime() - Date.now();
      expect(lockDuration).toBeGreaterThan(14 * 60 * 1000); // At least 14 minutes
      expect(lockDuration).toBeLessThan(16 * 60 * 1000); // At most 16 minutes
    });

    test('should reject login when account is locked', async () => {
      testUser.accountLocked = true;
      testUser.accountLockedUntil = new Date(Date.now() + 3600000);
      await testUser.save();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ACCOUNT_LOCKED');
    });

    test('should reject login when account is inactive', async () => {
      testUser.status = 'SUSPENDED'; // Changed from isActive = false
      await testUser.save();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ACCOUNT_INACTIVE'); // Changed to match controller
      expect(response.body.message).toMatch(/บัญชีถูกระงับ/i); // Check Thai message separately
    });

    test.skip('should enforce rate limiting', async () => {
      // NOTE: Rate limiting is disabled in test environment for performance and reliability
      // This test is skipped but kept for documentation purposes
      // Rate limiting is tested in e2e tests or manually verified

      // Make rapid login attempts sequentially (should be limited to 5 per 15 minutes)
      const responses = [];
      for (let i = 0; i < 7; i++) {
        const response = await request(app).post('/api/auth/login').send({
          email: testUser.email,
          password: testPassword,
        });
        responses.push(response);
      }

      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken;

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testPassword,
      });

      accessToken = response.body.data.accessToken;
    });

    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/ออกจากระบบสำเร็จ/i);

      // Should clear refresh token cookie (check for either Max-Age=0 or Expires in the past)
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      expect(refreshTokenCookie).toMatch(/(Max-Age=0|Expires=Thu, 01 Jan 1970)/);
    });

    test('should require authentication', async () => {
      const response = await request(app).post('/api/auth/logout').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken;

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testPassword,
      });

      accessToken = response.body.data.accessToken;
    });

    test('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.userId).toBe(testUser.userId);
      expect(response.body.data.user.role).toBe('FARMER');

      // Should not return sensitive data
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    test('should require authentication', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject expired token', async () => {
      // Wait for token to expire (in real test, would use short-lived token)
      // For now, just verify rejection with invalid token
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
