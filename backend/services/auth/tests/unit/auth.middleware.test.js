/**
 * Authentication Middleware Unit Tests
 *
 * Tests for authentication and authorization middleware.
 *
 * Coverage:
 * - Token verification
 * - User authentication
 * - Role-based access control (RBAC)
 * - Permission checking
 * - Email verification requirement
 *
 * @module tests/unit/auth.middleware.test
 */

const {
  authenticate,
  authorize,
  requirePermission,
  optionalAuth,
  requireEmailVerified,
} = require('../../middleware/auth.middleware');
const jwtUtil = require('../../utils/jwt.util');
const User = require('../../../../../database/models/User.model');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    test('should authenticate user with valid token', async () => {
      // Create test user
      const userData = global.testUtils.createTestUserData();
      const user = await User.create({
        ...userData,
        userId: await User.generateUserId(),
        passwordHash: 'hashed-password',
        role: 'FARMER',
        permissions: ['application:create'],
        emailVerified: true,
        isActive: true,
      });

      // Generate valid token with business userId (not _id)
      const token = jwtUtil.generateAccessToken({
        userId: user.userId, // Use business userId, not MongoDB _id
        email: user.email,
        role: user.role,
      });

      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user._id.toString()).toBe(user._id.toString());
      expect(mockReq.user.email).toBe(user.email);
      expect(mockReq.user.role).toBe('FARMER');
    });

    test('should reject request without token', async () => {
      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'UNAUTHORIZED', // Changed from stringContaining to exact match
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request with expired token', async () => {
      const expiredToken = jwtUtil.generateAccessToken({
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'FARMER',
      });

      // Manually create expired token
      const jwt = require('jsonwebtoken');
      const reallyExpiredToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', type: 'access' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '0s' }
      );

      mockReq.headers.authorization = `Bearer ${reallyExpiredToken}`;

      await new Promise(resolve => setTimeout(resolve, 100));

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject if user not found', async () => {
      const token = jwtUtil.generateAccessToken({
        userId: '507f1f77bcf86cd799439011', // Non-existent user
        email: 'nonexistent@example.com',
        role: 'FARMER',
      });

      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject if user is not active', async () => {
      const userData = global.testUtils.createTestUserData();
      const user = await User.create({
        ...userData,
        userId: await User.generateUserId(),
        passwordHash: 'hashed-password',
        role: 'FARMER',
        emailVerified: true,
        status: 'INACTIVE', // Use status field, not isActive
      });

      const token = jwtUtil.generateAccessToken({
        userId: user.userId, // Use business userId
        email: user.email,
        role: user.role,
      });

      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject if account is locked', async () => {
      const userData = global.testUtils.createTestUserData();
      const user = await User.create({
        ...userData,
        userId: await User.generateUserId(),
        passwordHash: 'hashed-password',
        role: 'FARMER',
        emailVerified: true,
        status: 'ACTIVE',
        accountLocked: true,
        accountLockedUntil: new Date(Date.now() + 3600000), // Locked for 1 hour
      });

      const token = jwtUtil.generateAccessToken({
        userId: user.userId, // Use business userId
        email: user.email,
        role: user.role,
      });

      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(423); // 423 Locked, not 403
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    beforeEach(async () => {
      const userData = global.testUtils.createTestUserData();
      mockReq.user = await User.create({
        ...userData,
        userId: await User.generateUserId(),
        passwordHash: 'hashed-password',
        role: 'FARMER',
        permissions: ['application:create'],
        emailVerified: true,
        isActive: true,
      });
    });

    test('should allow user with correct role', () => {
      const middleware = authorize('FARMER');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should allow user with any of multiple roles', () => {
      const middleware = authorize('FARMER', 'DTAM', 'ADMIN');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject user without correct role', () => {
      const middleware = authorize('ADMIN');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject if no user in request', () => {
      delete mockReq.user;
      const middleware = authorize('FARMER');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requirePermission', () => {
    beforeEach(async () => {
      const userData = global.testUtils.createTestUserData();
      mockReq.user = await User.create({
        ...userData,
        userId: await User.generateUserId(),
        passwordHash: 'hashed-password',
        role: 'FARMER',
        permissions: ['application:create', 'application:read', 'payment:read'],
        emailVerified: true,
        isActive: true,
      });
    });

    test('should allow user with required permission', () => {
      const middleware = requirePermission('application:create');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should allow user with any of multiple permissions', () => {
      const middleware = requirePermission('application:create', 'payment:create');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should allow user with wildcard permission', async () => {
      mockReq.user.permissions = ['application:*'];
      await mockReq.user.save();

      const middleware = requirePermission('application:create');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject user without required permission', () => {
      const middleware = requirePermission('certificate:create');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject if no user in request', () => {
      delete mockReq.user;
      const middleware = requirePermission('application:create');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('optionalAuth', () => {
    test('should attach user if valid token provided', async () => {
      const userData = global.testUtils.createTestUserData();
      const user = await User.create({
        ...userData,
        userId: await User.generateUserId(),
        passwordHash: 'hashed-password',
        role: 'FARMER',
        emailVerified: true,
        status: 'ACTIVE',
      });

      const token = jwtUtil.generateAccessToken({
        userId: user.userId, // Use business userId
        email: user.email,
        role: user.role,
      });

      mockReq.headers.authorization = `Bearer ${token}`;

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user._id.toString()).toBe(user._id.toString());
    });

    test('should continue without user if no token provided', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should continue without user if invalid token provided', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });
  });

  describe('requireEmailVerified', () => {
    test('should allow user with verified email', async () => {
      const userData = global.testUtils.createTestUserData();
      mockReq.user = await User.create({
        ...userData,
        userId: await User.generateUserId(),
        passwordHash: 'hashed-password',
        role: 'FARMER',
        emailVerified: true,
        isActive: true,
      });

      requireEmailVerified(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject user with unverified email', async () => {
      const userData = global.testUtils.createTestUserData();
      mockReq.user = await User.create({
        ...userData,
        userId: await User.generateUserId(),
        passwordHash: 'hashed-password',
        role: 'FARMER',
        emailVerified: false, // Not verified
        isActive: true,
      });

      requireEmailVerified(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject if no user in request', () => {
      requireEmailVerified(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
