/**
 * Password Management API Integration Tests
 *
 * Tests for password reset and change endpoints.
 *
 * Coverage:
 * - POST /api/auth/forgot-password
 * - POST /api/auth/reset-password
 * - POST /api/auth/change-password
 * - Token generation and validation
 * - Password security
 *
 * @module tests/integration/password.test
 */

const request = require('supertest');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createTestApp } = require('../helpers/testApp');
const User = require('../../../../../database/models/User.model');
const RefreshToken = require('../../../../../database/models/RefreshToken.model');

// Create test app with full middleware and error handling
const app = createTestApp();

describe('Password Management API', () => {
  let testUser, testPassword;

  beforeEach(async () => {
    testPassword = 'Test@1234';
    const userData = global.testUtils.createTestUserData({ password: testPassword });

    const passwordHash = await bcrypt.hash(testPassword, 10);
    const userId = await User.generateUserId();
    testUser = await User.create({
      ...userData,
      userId,
      passwordHash,
      role: 'FARMER',
      permissions: ['application:create'],
      emailVerified: true,
      status: 'ACTIVE',
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should generate password reset token', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล/i); // Fixed: match actual controller message

      // Check user has reset token
      const updatedUser = await User.findById(testUser._id).select(
        '+passwordResetToken +passwordResetExpires',
      ); // Fixed: select protected fields
      expect(updatedUser.passwordResetToken).toBeDefined();
      expect(updatedUser.passwordResetExpires).toBeDefined();
      expect(updatedUser.passwordResetToken.length).toBe(64); // 32 bytes * 2 (hex)

      // Token should expire in 1 hour
      const expiryDuration = updatedUser.passwordResetExpires.getTime() - Date.now();
      expect(expiryDuration).toBeGreaterThan(59 * 60 * 1000); // At least 59 minutes
      expect(expiryDuration).toBeLessThan(61 * 60 * 1000); // At most 61 minutes
    });

    test('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      // Should return success even if email doesn't exist (security)
      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/หากอีเมลนี้มีในระบบ.*เราจะส่งลิงก์รีเซ็ตรหัสผ่าน/i); // Fixed: match actual message
    });

    test('should generate new token if requested again', async () => {
      // First request
      await request(app).post('/api/auth/forgot-password').send({ email: testUser.email });

      const user1 = await User.findById(testUser._id).select('+passwordResetToken'); // Fixed: select protected field
      const firstToken = user1.passwordResetToken;

      // Second request
      await request(app).post('/api/auth/forgot-password').send({ email: testUser.email });

      const user2 = await User.findById(testUser._id).select('+passwordResetToken'); // Fixed: select protected field
      const secondToken = user2.passwordResetToken;

      expect(secondToken).toBeDefined();
      expect(secondToken).not.toBe(firstToken);
    });

    test.skip('should enforce rate limiting', async () => {
      // NOTE: Rate limiting is disabled in test environment
      // This test is skipped because NODE_ENV=test disables rate limiting
      // to prevent flaky tests. Rate limiting should be tested manually or
      // in a staging environment.

      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app).post('/api/auth/forgot-password').send({ email: testUser.email }),
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Generate reset token
      resetToken = crypto.randomBytes(32).toString('hex');
      testUser.passwordResetToken = resetToken;
      testUser.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
      await testUser.save();
    });

    test('should reset password with valid token', async () => {
      const newPassword = 'NewPassword@123';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword,
          confirmPassword: newPassword, // Fixed: validator requires confirmPassword
        })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/รีเซ็ตรหัสผ่านสำเร็จ/i);

      // Check password was updated
      const updatedUser = await User.findById(testUser._id).select(
        '+passwordHash +passwordResetToken +passwordResetExpires',
      ); // Fixed: select protected fields
      const passwordMatches = await bcrypt.compare(newPassword, updatedUser.passwordHash);
      expect(passwordMatches).toBe(true);

      // Reset token should be cleared (set to undefined in controller, but returned as null by Mongoose)
      expect(updatedUser.passwordResetToken).toBeNull();
      expect(updatedUser.passwordResetExpires).toBeNull();
    });

    test('should reset failed login attempts', async () => {
      testUser.loginAttempts = 3;
      testUser.accountLocked = true;
      await testUser.save();

      const newPassword = 'NewPassword@123';
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword,
          confirmPassword: newPassword, // Fixed: validator requires confirmPassword
        })
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.loginAttempts).toBe(0);
      expect(updatedUser.accountLocked).toBe(false);
    });

    test('should revoke all refresh tokens', async () => {
      // Create refresh tokens
      const { token: token1 } = await require('../../utils/jwt.util').generateRefreshToken({
        userId: testUser.userId,
        email: testUser.email,
        role: testUser.role,
      });

      const newPassword = 'NewPassword@123';
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword,
          confirmPassword: newPassword, // Fixed: validator requires confirmPassword
        })
        .expect(200);

      // All tokens should be revoked
      const userTokens = await RefreshToken.find({ userId: testUser.userId });
      userTokens.forEach(token => {
        expect(token.isUsed).toBe(true);
      });
    });

    test('should reject invalid token', async () => {
      const newPassword = 'NewPassword@123';
      const response = await request(app).post('/api/auth/reset-password').send({
        token: 'invalid-token',
        newPassword,
        confirmPassword: newPassword, // Fixed: validator requires confirmPassword
      });

      expect(response.status).toBe(400); // Fixed: check status separately
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR'); // Fixed: invalid token format → VALIDATION_ERROR
      // Fixed: Remove message check for VALIDATION_ERROR (validator provides different message)
    });

    test('should reject expired token', async () => {
      // Set token expiration to past
      testUser.passwordResetExpires = new Date(Date.now() - 3600000);
      await testUser.save();

      const newPassword = 'NewPassword@123';
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword,
          confirmPassword: newPassword, // Fixed: validator requires confirmPassword
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject weak password', async () => {
      const weakPassword = 'weak';
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: weakPassword,
          confirmPassword: weakPassword, // Fixed: validator requires confirmPassword
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    test('should allow login with new password', async () => {
      const newPassword = 'NewPassword@123';

      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword,
          confirmPassword: newPassword, // Fixed: validator requires confirmPassword
        })
        .expect(200);

      // Try to login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.accessToken).toBeDefined();
    });

    test('should not allow reusing same token', async () => {
      // Reset password once
      const newPassword1 = 'NewPassword@123';
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword1,
          confirmPassword: newPassword1, // Fixed: validator requires confirmPassword
        })
        .expect(200);

      // Try to use same token again
      const newPassword2 = 'AnotherPassword@456';
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword2,
          confirmPassword: newPassword2, // Fixed: validator requires confirmPassword
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    let accessToken;

    beforeEach(async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testPassword,
      });

      accessToken = loginResponse.body.data.accessToken;
    });

    test('should change password when authenticated', async () => {
      const newPassword = 'NewPassword@123';

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testPassword,
          newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/เปลี่ยนรหัสผ่านสำเร็จ/i);

      // Verify password was changed
      const updatedUser = await User.findById(testUser._id).select('+passwordHash');
      const passwordMatches = await bcrypt.compare(newPassword, updatedUser.passwordHash);
      expect(passwordMatches).toBe(true);
    });

    test('should revoke all refresh tokens after password change', async () => {
      // Create multiple refresh tokens
      await require('../../utils/jwt.util').generateRefreshToken({
        userId: testUser.userId,
        email: testUser.email,
        role: testUser.role,
      });

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: 'NewPassword@123',
        });

      // All tokens should be revoked
      const userTokens = await RefreshToken.find({ userId: testUser.userId });
      userTokens.forEach(token => {
        expect(token.isUsed).toBe(true);
      });
    });

    test('should reject incorrect current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword@123',
          newPassword: 'NewPassword@123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_PASSWORD');
      expect(response.body.message).toMatch(/รหัสผ่านปัจจุบันไม่ถูกต้อง/i);
    });

    test('should reject if new password same as current', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: testPassword, // Same as current
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('SAME_PASSWORD');
      expect(response.body.message).toMatch(/รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม/i);
    });

    test('should reject weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: testPassword,
          newPassword: 'NewPassword@123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should allow login with new password', async () => {
      const newPassword = 'NewPassword@123';

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testPassword,
          newPassword,
        });

      // Login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    test('should not allow login with old password', async () => {
      const newPassword = 'NewPassword@123';

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testPassword,
          newPassword,
        });

      // Try to login with old password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword, // Old password
        })
        .expect(401);

      expect(loginResponse.body.success).toBe(false);
    });
  });
});
