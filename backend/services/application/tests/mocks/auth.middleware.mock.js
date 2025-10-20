/**
 * Mock Authentication Middleware for Testing
 *
 * Lightweight mock of Auth service middleware for Application service tests.
 * Bypasses JWT verification and database lookups for faster, isolated tests.
 *
 * @module tests/mocks/auth.middleware.mock
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-17
 *
 * @research
 * Based on testing best practices:
 * - Martin Fowler: "Test Doubles" - Use mocks for external dependencies
 * - Jest Documentation: "Mock Functions" - Simulate behavior without real implementation
 * - Microservices Testing: "Service isolation" - Test services independently
 *
 * @rationale
 * Why mock instead of using real auth middleware:
 * 1. ✅ Speed: No JWT crypto operations (10-100x faster)
 * 2. ✅ Isolation: No dependency on Auth service database
 * 3. ✅ Simplicity: Direct user object injection
 * 4. ✅ Reliability: No network/service failures
 * 5. ✅ Flexibility: Easy to test permission scenarios
 *
 * Trade-offs:
 * - ⚠️ Not testing real auth middleware (covered in Auth service tests)
 * - ⚠️ Must manually sync with Auth service changes
 * - ✅ Acceptable for unit/integration tests (E2E uses real middleware)
 */

/**
 * Mock authenticate middleware
 *
 * Simulates JWT verification by:
 * 1. Checking Authorization header exists
 * 2. Extracting token (no verification)
 * 3. Finding user by token ID in database
 * 4. Attaching user to req.user
 *
 * Usage in tests:
 *   const { authenticate } = require('./mocks/auth.middleware.mock');
 *   // Token format: "Bearer {userId}"
 *   .set('Authorization', `Bearer ${farmerUser.userId}`)
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
async function authenticate(req, res, next) {
  try {
    const User = require('../../../../../database/models/User.model');

    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    // Check if Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN_FORMAT',
        message: 'รูปแบบ token ไม่ถูกต้อง',
      });
    }

    // Extract "token" (in mock, this is just userId)
    const userId = authHeader.substring(7); // Remove "Bearer "

    // Get user from database (mock: lookup by userId directly)
    const user = await User.findOne({ userId }).select('-passwordHash').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'ไม่พบผู้ใช้นี้ในระบบ',
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: 'บัญชีถูกระงับ',
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return res.status(423).json({
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: 'บัญชีถูกล็อค',
      });
    }

    // Attach user to request (same as real middleware)
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_ERROR',
      message: error.message,
    });
  }
}

/**
 * Mock authorize middleware (role-based)
 *
 * Checks if authenticated user has required role.
 *
 * Usage:
 *   router.post('/', authenticate, authorize(['FARMER']), controller);
 *
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
function authorize(allowedRoles) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'คุณไม่มีสิทธิ์เข้าถึง',
      });
    }

    next();
  };
}

/**
 * Mock requirePermission middleware
 *
 * Checks if authenticated user has required permission.
 * Supports wildcard permissions (e.g., 'application:*')
 *
 * Usage:
 *   router.post('/', authenticate, requirePermission('application:create'), controller);
 *
 * @param {...string} requiredPermissions - Required permissions
 * @returns {Function} Express middleware
 */
function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    const userPermissions = req.user.permissions || [];

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(required => {
      // Check exact match
      if (userPermissions.includes(required)) {
        return true;
      }

      // Check wildcard match (e.g., 'application:*' matches 'application:create')
      const [resource] = required.split(':');
      return userPermissions.includes(`${resource}:*`) || userPermissions.includes('*');
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
      });
    }

    next();
  };
}

/**
 * Mock optionalAuth middleware
 *
 * Attaches user if token provided, otherwise continues without user.
 * Used for endpoints that work with/without authentication.
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
async function optionalAuth(req, res, next) {
  try {
    // If no token, continue without user
    if (!req.headers.authorization) {
      return next();
    }

    // Try to authenticate, but don't fail if invalid
    await authenticate(req, res, err => {
      if (err) {
        // Continue without user on error
        return next();
      }
      next();
    });
  } catch (error) {
    // Continue without user on any error
    next();
  }
}

/**
 * Mock requireEmailVerified middleware
 *
 * Checks if authenticated user has verified email.
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
function requireEmailVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'กรุณาเข้าสู่ระบบ',
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'กรุณายืนยันอีเมลก่อน',
    });
  }

  next();
}

module.exports = {
  authenticate,
  authorize,
  requirePermission,
  optionalAuth,
  requireEmailVerified,
};
