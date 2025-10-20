/**
 * Token Refresh API Integration Tests
 *
 * Tests for token refresh and rotation.
 *
 * Coverage:
 * - POST /api/auth/refresh
 * - Token rotation mechanism
 * - Token reuse detection
 * - Security breach handling
 *
 * @module tests/integration/token.test
 */

const request = require('supertest');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createTestApp } = require('../helpers/testApp');
const User = require('../../../../../database/models/User.model');
const RefreshToken = require('../../../../../database/models/RefreshToken.model');
const jwtUtil = require('../../utils/jwt.util');

// Create test app with full middleware and error handling
const app = createTestApp();
describe('Token Refresh API', () => {
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

  describe('POST /api/auth/refresh', () => {
    test('should refresh tokens with valid refresh token', async () => {
      // Login to get refresh token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));

      // Extract refresh token from cookie
      const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

      // Refresh tokens
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.accessToken).not.toBe(loginResponse.body.data.accessToken);

      // Should set new refresh token cookie
      const newCookies = response.headers['set-cookie'];
      expect(newCookies).toBeDefined();
      const newRefreshTokenCookie = newCookies.find(c => c.startsWith('refreshToken='));
      expect(newRefreshTokenCookie).toBeDefined();

      // New refresh token should be different
      const newRefreshToken = newRefreshTokenCookie.split(';')[0].split('=')[1];
      expect(newRefreshToken).not.toBe(refreshToken);
    });

    test('should mark old refresh token as used', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

      // Get tokenId from refresh token
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      // Check old token is marked as used
      const oldToken = await RefreshToken.findOne({ tokenId: decoded.tokenId });
      expect(oldToken.isUsed).toBe(true);
      expect(oldToken.usedAt).toBeDefined();
    });

    test('should detect token reuse and revoke all user tokens', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

      // Use refresh token once (this will mark it as used)
      await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      // Try to use the same token again (REUSE ATTEMPT - security breach!)
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('TOKEN_REUSE_DETECTED'); // Fixed: match actual error code, not message pattern

      // All user's refresh tokens should be revoked
      const userTokens = await RefreshToken.find({ userId: testUser.userId }); // Fixed: use business userId
      userTokens.forEach(token => {
        expect(token.isUsed).toBe(true);
      });
    });

    test('should reject refresh without token', async () => {
      const response = await request(app).post('/api/auth/refresh').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NO_REFRESH_TOKEN'); // Fixed: match actual error code
    });

    test('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject expired refresh token', async () => {
      // Create expired token manually
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        {
          userId: testUser._id.toString(),
          type: 'refresh',
          tokenId: 'expired-token-id',
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '0s' },
      );

      // Store in database
      await RefreshToken.create({
        tokenId: 'expired-token-id',
        userId: testUser._id,
        tokenHash: crypto.createHash('sha256').update(expiredToken).digest('hex'),
        isUsed: false,
        expiresAt: new Date(Date.now() - 1000), // Already expired
      });

      await global.testUtils.sleep(100);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${expiredToken}`])
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject token not in database', async () => {
      // Create valid JWT but not stored in database
      const jwt = require('jsonwebtoken');
      const fakeToken = jwt.sign(
        {
          userId: testUser._id.toString(),
          type: 'refresh',
          tokenId: 'fake-token-id',
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' },
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${fakeToken}`])
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_REFRESH_TOKEN'); // Fixed: Exact error code, not pattern match
    });

    test('should preserve user information in new tokens', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      // Verify new access token (contains user info including role)
      const jwt = require('jsonwebtoken');
      const accessDecoded = jwt.verify(
        response.body.data.accessToken,
        process.env.JWT_ACCESS_SECRET,
      );

      expect(accessDecoded.userId).toBe(testUser.userId); // Business userId (USR-XXXX-XXXX)
      expect(accessDecoded.email).toBe(testUser.email);
      expect(accessDecoded.role).toBe('FARMER'); // Access token contains role

      // Verify new refresh token (stored in cookie)
      const newCookies = response.headers['set-cookie']; // Fixed: Renamed to avoid duplicate variable
      const newRefreshTokenCookie = newCookies.find(c => c.startsWith('refreshToken='));
      expect(newRefreshTokenCookie).toBeDefined();
    });

    test('should work with multiple sequential refreshes', async () => {
      let currentRefreshToken;

      // Login
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      currentRefreshToken = cookies
        .find(c => c.startsWith('refreshToken='))
        .split(';')[0]
        .split('=')[1];

      // Refresh 3 times
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', [`refreshToken=${currentRefreshToken}`])
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.accessToken).toBeDefined();

        // Get new refresh token
        const newCookies = response.headers['set-cookie'];
        currentRefreshToken = newCookies
          .find(c => c.startsWith('refreshToken='))
          .split(';')[0]
          .split('=')[1];
      }

      // All refreshes should succeed
      expect(currentRefreshToken).toBeDefined();
    });
  });
});
