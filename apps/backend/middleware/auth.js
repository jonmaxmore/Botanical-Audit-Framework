/**
 * Authentication Middleware
 *
 * Provides authentication functions for Clean Architecture modules.
 * Supports both Farmer (public) and DTAM (staff) authentication.
 *
 * ที่มาที่ไป (WHY):
 * - แยก authentication context ระหว่าง public users และ government staff
 * - ใช้ separate JWT secrets เพื่อความปลอดภัย
 * - มี clear error messages เพื่อ debugging
 *
 * Workflow:
 * Request → Extract Token → Verify with Correct Secret → Check Role → Attach User → Continue
 */

const { createLogger } = require('../shared/logger');
const logger = createLogger('auth-middleware');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../../../config/jwt-security');

// โหลด JWT configuration (จะ throw error ถ้าไม่มี secret)
let JWT_CONFIG;
try {
  JWT_CONFIG = jwtConfig.loadJWTConfiguration();
} catch (error) {
  logger.error('❌ Failed to load JWT configuration:', error.message);
  logger.error('   Application cannot start without valid JWT secrets');
  process.exit(1);
}

/**
 * Authenticate Farmer (Public Users)
 *
 * Logic:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify token ด้วย public JWT secret
 * 3. ตรวจสอบ role ต้องเป็น FARMER หรือ PUBLIC
 * 4. Attach decoded user info ไปที่ req.user
 * 5. Continue to next middleware
 */
function authenticateFarmer(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // ใช้ secure JWT secret จาก configuration
    const decoded = jwtConfig.verifyToken(token, 'public', JWT_CONFIG);

    // Check role ต้องเป็น FARMER หรือ PUBLIC
    if (decoded.role !== 'FARMER' && decoded.role !== 'PUBLIC') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Farmer access only',
        code: 'INVALID_ROLE',
        requiredRole: ['FARMER', 'PUBLIC'],
        yourRole: decoded.role
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('[AUTH] Farmer authentication failed:', error.message);

    // Enhanced error response
    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }

    if (error.code === 'INVALID_TOKEN') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
}

/**
 * Authenticate DTAM Staff
 *
 * Logic:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify token ด้วย DTAM JWT secret (แยกจาก public)
 * 3. ตรวจสอบ role ต้องเป็น DTAM staff roles
 * 4. Attach decoded user info ไปที่ req.user
 * 5. Continue to next middleware
 */
function authenticateDTAM(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // ใช้ DTAM JWT secret (แยกจาก public เพื่อความปลอดภัย)
    const decoded = jwtConfig.verifyToken(token, 'dtam', JWT_CONFIG);

    // Check role ต้องเป็น DTAM staff roles
    const validDTAMRoles = [
      'DTAM_STAFF',
      'DTAM',
      'ADMIN',
      'REVIEWER',
      'MANAGER',
      'INSPECTOR',
      'APPROVER'
    ];
    if (!decoded.role || !validDTAMRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'DTAM staff access only',
        code: 'INVALID_ROLE',
        requiredRoles: validDTAMRoles,
        yourRole: decoded.role
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('[AUTH] DTAM authentication failed:', error.message);

    // Enhanced error response
    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token has expired - please login again',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }

    if (error.code === 'INVALID_TOKEN') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
}

/**
 * Optional Authentication (for public + authenticated endpoints)
 *
 * Logic:
 * - ถ้ามี token → verify และ attach user
 * - ถ้าไม่มี token หรือ token ไม่ถูกต้อง → continue โดยไม่มี user
 * - ไม่ return error เพราะเป็น optional
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwtConfig.verifyToken(token, 'public', JWT_CONFIG);
        req.user = decoded;
      } catch (error) {
        // Token ไม่ถูกต้อง แต่ไม่ block request
        logger.info('[AUTH] Optional auth failed:', error.message);
      }
    }

    // Continue ไม่ว่าจะมี user หรือไม่
    next();
  } catch (error) {
    // Continue without user
    next();
  }
}

module.exports = {
  authenticateFarmer,
  authenticateDTAM,
  optionalAuth,
  authenticate: authenticateFarmer, // Alias for generic authentication
  authorize: roles => (req, res, next) => {
    // Simple role-based authorization middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role?.toLowerCase() || '';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const normalizedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  },
  rateLimitSensitive: (_windowMs, _max) => {
    // Simple rate limiting placeholder
    // In production, use express-rate-limit
    return (req, res, next) => next();
  }
};
