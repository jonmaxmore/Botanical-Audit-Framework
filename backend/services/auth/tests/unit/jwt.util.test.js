/**
 * JWT Utility Unit Tests
 *
 * Tests for JWT token generation, verification, and rotation.
 *
 * Coverage:
 * - Token generation (access + refresh)
 * - Token verification
 * - Token rotation
 * - Token revocation
 * - Error handling
 *
 * @module tests/unit/jwt.util.test
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtUtil = require('../../utils/jwt.util');
const RefreshToken = require('../../../../../database/models/RefreshToken.model');

describe('JWT Utility', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockPayload = {
    userId: mockUserId,
    email: 'test@example.com',
    role: 'FARMER',
  };

  describe('generateAccessToken', () => {
    test('should generate valid access token', () => {
      const token = jwtUtil.generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token structure
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.type).toBe('access');
    });

    test('should include expiration time', () => {
      const token = jwtUtil.generateAccessToken(mockPayload);
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);

      // Should expire in ~15 minutes
      const expiryDuration = decoded.exp - decoded.iat;
      expect(expiryDuration).toBe(900); // 15 minutes = 900 seconds
    });

    test('should include jti (JWT ID)', () => {
      const token = jwtUtil.generateAccessToken(mockPayload);
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      expect(decoded.jti).toBeDefined();
      expect(typeof decoded.jti).toBe('string');
      expect(decoded.jti.length).toBeGreaterThan(0);
    });

    test('should generate unique tokens', () => {
      const token1 = jwtUtil.generateAccessToken(mockPayload);
      const token2 = jwtUtil.generateAccessToken(mockPayload);

      expect(token1).not.toBe(token2);

      const decoded1 = jwt.verify(token1, process.env.JWT_ACCESS_SECRET);
      const decoded2 = jwt.verify(token2, process.env.JWT_ACCESS_SECRET);

      expect(decoded1.jti).not.toBe(decoded2.jti);
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate refresh token and store in database', async () => {
      const result = await jwtUtil.generateRefreshToken(mockPayload);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.tokenId).toBeDefined();

      // Verify token structure
      const decoded = jwt.verify(result.token, process.env.JWT_REFRESH_SECRET);
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.type).toBe('refresh');
      expect(decoded.tokenId).toBe(result.tokenId);

      // Verify database storage
      const dbToken = await RefreshToken.findOne({ tokenId: result.tokenId });
      expect(dbToken).toBeDefined();
      expect(dbToken.userId.toString()).toBe(mockUserId);
      expect(dbToken.isUsed).toBe(false);
    });

    test('should hash token before storing', async () => {
      const result = await jwtUtil.generateRefreshToken(mockPayload);

      const dbToken = await RefreshToken.findOne({ tokenId: result.tokenId });

      // Token in DB should be hashed, not the raw token
      expect(dbToken.tokenHash).toBeDefined();
      expect(dbToken.tokenHash).not.toBe(result.token);
      expect(dbToken.tokenHash.length).toBe(64); // SHA-256 produces 64 hex characters

      // Verify hash matches
      const expectedHash = crypto.createHash('sha256').update(result.token).digest('hex');
      expect(dbToken.tokenHash).toBe(expectedHash);
    });

    test('should set expiration date', async () => {
      const beforeCreation = new Date();
      const result = await jwtUtil.generateRefreshToken(mockPayload);
      const afterCreation = new Date();

      const dbToken = await RefreshToken.findOne({ tokenId: result.tokenId });

      expect(dbToken.expiresAt).toBeDefined();
      expect(dbToken.expiresAt).toBeInstanceOf(Date);

      // Should expire in ~7 days
      const expectedExpiry = new Date(beforeCreation.getTime() + 7 * 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs(dbToken.expiresAt - expectedExpiry);

      // Allow 5 second difference for test execution time
      expect(timeDiff).toBeLessThan(5000);
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify valid access token', () => {
      const token = jwtUtil.generateAccessToken(mockPayload);
      const decoded = jwtUtil.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        jwtUtil.verifyAccessToken('invalid-token');
      }).toThrow();
    });

    test('should throw error for expired token', () => {
      // Create token that expires immediately
      const expiredToken = jwt.sign(
        { ...mockPayload, type: 'access' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '0s' },
      );

      // Wait a moment to ensure expiration
      setTimeout(() => {
        expect(() => {
          jwtUtil.verifyAccessToken(expiredToken);
        }).toThrow(/expired/i);
      }, 100);
    });

    test('should throw error for refresh token (wrong type)', () => {
      const refreshToken = jwt.sign(
        { ...mockPayload, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' },
      );

      expect(() => {
        jwtUtil.verifyAccessToken(refreshToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify valid refresh token', async () => {
      const { token, tokenId } = await jwtUtil.generateRefreshToken(mockPayload);
      const decoded = await jwtUtil.verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.tokenId).toBe(tokenId);
    });

    test('should throw error for invalid token', async () => {
      await expect(jwtUtil.verifyRefreshToken('invalid-token')).rejects.toThrow();
    });

    test('should throw error if token not in database', async () => {
      // Create token but don't store in database
      const fakeToken = jwt.sign(
        { ...mockPayload, type: 'refresh', tokenId: 'fake-id' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' },
      );

      // Expect exact error message from jwt.util.js (line 226)
      await expect(jwtUtil.verifyRefreshToken(fakeToken)).rejects.toThrow('Invalid refresh token');
    });

    test('should throw error if token already used', async () => {
      const { token, tokenId } = await jwtUtil.generateRefreshToken(mockPayload);

      // Mark token as used
      await RefreshToken.findOneAndUpdate({ tokenId }, { isUsed: true, usedAt: new Date() });

      // Expect exact error message from jwt.util.js (line 206-208)
      await expect(jwtUtil.verifyRefreshToken(token)).rejects.toThrow(
        'Refresh token reuse detected. All tokens invalidated. Please login again.',
      );
    });

    test('should detect token reuse and revoke all user tokens', async () => {
      const { token: token1 } = await jwtUtil.generateRefreshToken(mockPayload);
      const { token: token2 } = await jwtUtil.generateRefreshToken(mockPayload);

      // Use token1 once (mark as used)
      await RefreshToken.findOneAndUpdate(
        { tokenHash: crypto.createHash('sha256').update(token1).digest('hex') },
        { isUsed: true, usedAt: new Date() },
      );

      // Try to use token1 again (reuse attempt)
      // Expect exact error message from jwt.util.js (line 206-208)
      await expect(jwtUtil.verifyRefreshToken(token1)).rejects.toThrow(
        'Refresh token reuse detected. All tokens invalidated. Please login again.',
      );

      // All user tokens should be revoked
      const userTokens = await RefreshToken.find({ userId: mockUserId });
      userTokens.forEach(token => {
        expect(token.isUsed).toBe(true);
      });
    });
  });

  describe('rotateTokens', () => {
    test('should generate new tokens and mark old as used', async () => {
      const { token: oldToken, tokenId: oldTokenId } =
        await jwtUtil.generateRefreshToken(mockPayload);

      const result = await jwtUtil.rotateTokens(oldToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(oldToken);

      // Old token should be marked as used
      const oldDbToken = await RefreshToken.findOne({ tokenId: oldTokenId });
      expect(oldDbToken.isUsed).toBe(true);
      expect(oldDbToken.usedAt).toBeDefined();

      // New token should exist in database
      const decoded = jwt.verify(result.refreshToken, process.env.JWT_REFRESH_SECRET);
      const newDbToken = await RefreshToken.findOne({ tokenId: decoded.tokenId });
      expect(newDbToken).toBeDefined();
      expect(newDbToken.isUsed).toBe(false);
    });

    test('should preserve user information in new tokens', async () => {
      const { token: oldToken } = await jwtUtil.generateRefreshToken(mockPayload);
      const result = await jwtUtil.rotateTokens(oldToken);

      const accessDecoded = jwt.verify(result.accessToken, process.env.JWT_ACCESS_SECRET);
      const refreshDecoded = jwt.verify(result.refreshToken, process.env.JWT_REFRESH_SECRET);

      expect(accessDecoded.userId).toBe(mockUserId);
      expect(accessDecoded.email).toBe(mockPayload.email);
      expect(refreshDecoded.userId).toBe(mockUserId);
    });
  });

  describe('revokeRefreshToken', () => {
    test('should mark specific token as used', async () => {
      const { tokenId } = await jwtUtil.generateRefreshToken(mockPayload);

      await jwtUtil.revokeRefreshToken(tokenId);

      const dbToken = await RefreshToken.findOne({ tokenId });
      expect(dbToken.isUsed).toBe(true);
      expect(dbToken.usedAt).toBeDefined();
    });

    test('should not affect other user tokens', async () => {
      const { tokenId: tokenId1 } = await jwtUtil.generateRefreshToken(mockPayload);
      const { tokenId: tokenId2 } = await jwtUtil.generateRefreshToken(mockPayload);

      await jwtUtil.revokeRefreshToken(tokenId1);

      const token1 = await RefreshToken.findOne({ tokenId: tokenId1 });
      const token2 = await RefreshToken.findOne({ tokenId: tokenId2 });

      expect(token1.isUsed).toBe(true);
      expect(token2.isUsed).toBe(false);
    });
  });

  describe('revokeAllUserTokens', () => {
    test('should revoke all tokens for specific user', async () => {
      // Create multiple tokens for user
      await jwtUtil.generateRefreshToken(mockPayload);
      await jwtUtil.generateRefreshToken(mockPayload);
      await jwtUtil.generateRefreshToken(mockPayload);

      // Create token for different user
      const otherUserId = '507f1f77bcf86cd799439012';
      await jwtUtil.generateRefreshToken({ ...mockPayload, userId: otherUserId });

      await jwtUtil.revokeAllUserTokens(mockUserId);

      // All tokens for mockUserId should be revoked
      const userTokens = await RefreshToken.find({ userId: mockUserId });
      userTokens.forEach(token => {
        expect(token.isUsed).toBe(true);
      });

      // Other user's token should not be affected
      const otherUserTokens = await RefreshToken.find({ userId: otherUserId });
      expect(otherUserTokens[0].isUsed).toBe(false);
    });
  });

  describe('cleanupExpiredTokens', () => {
    test('should delete expired tokens', async () => {
      // Create token with immediate expiration
      const { tokenId } = await jwtUtil.generateRefreshToken(mockPayload);

      // Manually set expiration to past
      await RefreshToken.findOneAndUpdate({ tokenId }, { expiresAt: new Date(Date.now() - 1000) });

      // Create valid token
      const { tokenId: validTokenId } = await jwtUtil.generateRefreshToken(mockPayload);

      await jwtUtil.cleanupExpiredTokens();

      const expiredToken = await RefreshToken.findOne({ tokenId });
      const validToken = await RefreshToken.findOne({ tokenId: validTokenId });

      expect(expiredToken).toBeNull();
      expect(validToken).toBeDefined();
    });
  });
});
