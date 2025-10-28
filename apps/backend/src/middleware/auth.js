/**
 * Authentication Middleware
 * JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AuthenticationError, AuthorizationError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const config = require('../config/environment');

/**
 * Verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Check if token exists
    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret);

    // Find user
    const user = await User.findByIdActive(decoded.id).select('-password');
    if (!user) {
      throw new AuthenticationError('User not found or account deactivated');
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AuthenticationError('Password recently changed. Please log in again.');
    }

    // Check if user is active
    if (!user.isActive()) {
      throw new AuthenticationError('Account is not active. Please contact support.');
    }

    // Attach user to request
    req.user = user;

    // Update last activity (optional - can be expensive)
    if (config.features.trackUserActivity) {
      user.updateActivity().catch(err => {
        logger.error('Failed to update user activity:', err);
      });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired'));
    } else {
      return next(error);
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.security.jwtSecret);
    const user = await User.findByIdActive(decoded.id).select('-password');

    if (user && user.isActive() && !user.changedPasswordAfter(decoded.iat)) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

/**
 * Role-based authorization
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!req.user.hasRole(roles)) {
      logger.security('Unauthorized role access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return next(new AuthorizationError('Insufficient privileges'));
    }

    next();
  };
};

/**
 * Permission-based authorization
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const hasPermission = permissions.some(permission => req.user.hasPermission(permission));

    if (!hasPermission) {
      logger.security('Unauthorized permission access attempt', {
        userId: req.user.id,
        userPermissions: req.user.permissions,
        requiredPermissions: permissions,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Admin only access
 */
const requireAdmin = requireRole('admin');

/**
 * Active user only (verified email and active status)
 */
const requireActiveUser = (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (!req.user.isEmailVerified) {
    return next(new AuthenticationError('Email verification required'));
  }

  if (req.user.status !== 'active') {
    return next(new AuthenticationError('Account activation required'));
  }

  next();
};

/**
 * Owner or admin access (for resource-specific operations)
 */
const requireOwnerOrAdmin = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    // Admin can access anything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params.id || req.body[userIdField] || req.query[userIdField];

    if (req.user.id.toString() !== resourceUserId) {
      logger.security('Unauthorized resource access attempt', {
        userId: req.user.id,
        resourceUserId,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return next(new AuthorizationError('Can only access your own resources'));
    }

    next();
  };
};

/**
 * Rate limiting by user
 */
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create user request history
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);

    // Remove old requests outside the window
    const recentRequests = requests.filter(time => time > windowStart);
    userRequests.set(userId, recentRequests);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      logger.security('Rate limit exceeded', {
        userId,
        requestCount: recentRequests.length,
        maxRequests,
        endpoint: req.originalUrl,
        ip: req.ip
      });

      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests',
          type: 'rate_limit_error',
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }

    // Add current request
    recentRequests.push(now);

    next();
  };
};

/**
 * API Key authentication (for external services)
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new AuthenticationError('API key is required');
    }

    // Validate API key (implement your API key validation logic)
    const isValidApiKey = config.security.apiKeys.includes(apiKey);

    if (!isValidApiKey) {
      logger.security('Invalid API key attempt', {
        apiKey: apiKey.substring(0, 8) + '...',
        endpoint: req.originalUrl,
        ip: req.ip
      });

      throw new AuthenticationError('Invalid API key');
    }

    // Set API client info
    req.apiClient = {
      type: 'external',
      key: apiKey
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Wrapper for backward compatibility with applications.js
const authorize = rolesArray => {
  return requireRole(...rolesArray);
};

module.exports = {
  authenticateToken,
  authenticate: authenticateToken, // Alias for compatibility
  optionalAuth,
  requireRole,
  authorize, // Array wrapper for requireRole
  requirePermission,
  requireAdmin,
  requireActiveUser,
  requireOwnerOrAdmin,
  rateLimitByUser,
  authenticateApiKey
};
