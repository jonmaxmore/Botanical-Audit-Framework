/**
 * Authentication Middleware
 *
 * JWT verification and role-based access control (RBAC).
 * Protects routes and validates user permissions.
 *
 * @module middleware/auth
 */

const { verifyAccessToken } = require('../utils/jwt.util');
const User = require('../../../../database/models/User.model');

/**
 * Authenticate user with JWT token
 *
 * Verifies JWT token from Authorization header and attaches user to request.
 *
 * Usage:
 *   router.get('/protected', authenticate, controller);
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบ'
      });
    }

    // Check if Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN_FORMAT',
        message: 'รูปแบบ token ไม่ถูกต้อง'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer "

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database (without password)
    const user = await User.findOne({ userId: decoded.userId }).select('-passwordHash').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'ไม่พบผู้ใช้นี้ในระบบ'
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: 'บัญชีถูกระงับ'
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.accountLockedUntil - new Date()) / 1000 / 60);

      return res.status(423).json({
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: `บัญชีถูกล็อค กรุณาลองใหม่ในอีก ${remainingMinutes} นาที`
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Access token expired') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Token หมดอายุ กรุณา refresh token'
      });
    }

    if (error.message === 'Invalid access token') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Token ไม่ถูกต้อง'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'AUTHENTICATION_ERROR',
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
    });
  }
}

/**
 * Check if user has specific role
 *
 * Usage:
 *   router.delete('/user', authenticate, authorize('ADMIN'), controller);
 *
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบ'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้'
      });
    }

    next();
  };
}

/**
 * Check if user has specific permission
 *
 * More granular than role-based authorization.
 *
 * Usage:
 *   router.post('/application', authenticate, requirePermission('application:create'), controller);
 *
 * @param {...string} permissions - Required permissions
 * @returns {Function} Express middleware
 */
function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบ'
      });
    }

    const userPermissions = req.user.permissions || [];

    // Check if user has wildcard permission (all access)
    if (userPermissions.includes('*')) {
      return next();
    }

    // Check if user has any of the required permissions (exact match or wildcard)
    const hasPermission = permissions.some(requiredPermission => {
      // Exact match
      if (userPermissions.includes(requiredPermission)) {
        return true;
      }

      // Wildcard match (e.g., user has 'application:*', needs 'application:create')
      const resourceType = requiredPermission.split(':')[0]; // e.g., 'application'
      return userPermissions.includes(`${resourceType}:*`);
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'คุณไม่มีสิทธิ์ดำเนินการนี้',
        required: permissions
      });
    }

    next();
  };
}

/**
 * Optional authentication
 *
 * Attaches user if token is present, but doesn't require it.
 * Useful for endpoints that behave differently for authenticated users.
 *
 * Usage:
 *   router.get('/public-resource', optionalAuth, controller);
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without user
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findOne({ userId: decoded.userId }).select('-passwordHash').lean();

    if (user && user.status === 'ACTIVE') {
      req.user = user;
    }

    next();
  } catch (error) {
    // Invalid token, continue without user
    next();
  }
}

/**
 * Verify email before allowing certain actions
 *
 * Some actions require email verification (e.g., submitting application).
 *
 * Usage:
 *   router.post('/application', authenticate, requireEmailVerified, controller);
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
      message: 'กรุณาเข้าสู่ระบบ'
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'กรุณายืนยันอีเมลก่อนใช้งานฟีเจอร์นี้'
    });
  }

  next();
}

module.exports = {
  authenticate,
  authorize,
  requirePermission,
  optionalAuth,
  requireEmailVerified
};
