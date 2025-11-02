/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Provides role-based authorization for API endpoints
 * Works with auth middleware to check user roles
 *
 * @module middleware/rbac
 * @version 1.0.0
 */

const { createLogger } = require('../shared/logger');
const logger = createLogger('rbac-middleware');

/**
 * Role-Based Access Control Middleware
 *
 * Checks if authenticated user has one of the allowed roles
 * Must be used after auth middleware
 *
 * @param {string[]} allowedRoles - Array of allowed role names
 * @returns {Function} Express middleware function
 *
 * @example
 * // Single role
 * router.post('/admin-only', auth, rbac(['admin']), controller.method)
 *
 * @example
 * // Multiple roles
 * router.get('/data', auth, rbac(['admin', 'reviewer', 'inspector']), controller.method)
 */
function rbac(allowedRoles) {
  // Validate input
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('RBAC middleware requires an array of allowed roles');
  }

  // Normalize roles to lowercase for case-insensitive comparison
  const normalizedRoles = allowedRoles.map(role => role.toLowerCase());

  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        logger.warn('RBAC check failed: No authenticated user');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user role (check multiple possible locations)
      const userRole = (
        req.user.role ||
        req.user.user_type ||
        req.staff?.role ||
        req.inspector?.role ||
        req.farmer?.role
      )?.toLowerCase();

      // Check if user has role
      if (!userRole) {
        logger.warn(`RBAC check failed: No role found for user ${req.user.id}`);
        return res.status(403).json({
          success: false,
          message: 'User role not found'
        });
      }

      // Check if user's role is in allowed roles
      if (!normalizedRoles.includes(userRole)) {
        logger.warn(
          `RBAC check failed: User ${req.user.id} with role "${userRole}" ` +
            `attempted to access endpoint requiring roles: ${allowedRoles.join(', ')}`
        );
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          required: allowedRoles,
          userRole: userRole
        });
      }

      // Log successful authorization (debug level)
      logger.debug(
        `RBAC check passed: User ${req.user.id} with role "${userRole}" ` +
          `authorized for endpoint`
      );

      // User has required role, proceed
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

/**
 * Shorthand for admin-only access
 * @returns {Function} Express middleware function
 */
function requireAdmin() {
  return rbac(['admin']);
}

/**
 * Shorthand for reviewer-only access
 * @returns {Function} Express middleware function
 */
function requireReviewer() {
  return rbac(['reviewer', 'admin']); // Admins can also review
}

/**
 * Shorthand for inspector-only access
 * @returns {Function} Express middleware function
 */
function requireInspector() {
  return rbac(['inspector', 'admin']); // Admins can also inspect
}

/**
 * Shorthand for staff-only access (admin, reviewer, inspector)
 * @returns {Function} Express middleware function
 */
function requireStaff() {
  return rbac(['admin', 'reviewer', 'inspector', 'approver']);
}

/**
 * Check if user has ANY of the specified permissions
 * Similar to rbac but with explicit permission checking
 *
 * @param {string[]} permissions - Array of permission names
 * @returns {Function} Express middleware function
 */
function hasPermission(permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    throw new Error('hasPermission middleware requires an array of permissions');
  }

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user permissions
      const userPermissions = req.user.permissions || [];

      // Check if user has any of the required permissions
      const hasRequiredPermission = permissions.some(perm => userPermissions.includes(perm));

      if (!hasRequiredPermission) {
        logger.warn(
          `Permission check failed: User ${req.user.id} lacks required permissions: ${permissions.join(', ')}`
        );
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          required: permissions
        });
      }

      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
}

// Export as default (for require('../middleware/rbac'))
module.exports = rbac;

// Also export named functions
module.exports.rbac = rbac;
module.exports.requireAdmin = requireAdmin;
module.exports.requireReviewer = requireReviewer;
module.exports.requireInspector = requireInspector;
module.exports.requireStaff = requireStaff;
module.exports.hasPermission = hasPermission;
