/**
 * Authentication Routes
 *
 * Express routes for user authentication and management endpoints.
 * Integrates controller with middleware stack for complete security.
 *
 * Route Structure:
 * POST   /auth/login           - User authentication
 * POST   /auth/refresh         - Token refresh
 * POST   /auth/logout          - User logout (protected)
 * POST   /auth/change-password - Password change (protected)
 * GET    /auth/profile         - Get user profile (protected)
 * PUT    /auth/profile         - Update user profile (protected)
 * POST   /auth/forgot-password - Password reset request
 * POST   /auth/reset-password  - Password reset confirmation
 * GET    /auth/verify          - Token verification (protected)
 *
 * Security Features:
 * - Rate limiting per endpoint
 * - Input validation
 * - Authentication middleware
 * - Authorization checks
 * - Request logging
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const express = require('express');
const router = express.Router();

function createAuthRoutes(dependencies = {}) {
  const { userAuthenticationController, authenticationMiddleware } = dependencies;

  // Validation rules
  const validationRules = userAuthenticationController.constructor.getValidationRules();

  // Rate limiting configurations for different endpoints
  const strictRateLimit = authenticationMiddleware.rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later'
  });

  const moderateRateLimit = authenticationMiddleware.rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: 'Too many requests, please try again later'
  });

  const normalRateLimit = authenticationMiddleware.rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later'
  });

  // Security headers for all routes
  router.use(authenticationMiddleware.securityHeaders());

  /**
   * Public Routes (No authentication required)
   */

  // User login
  router.post('/login', strictRateLimit, validationRules.login, (req, res) =>
    userAuthenticationController.login(req, res)
  );

  // Token refresh
  router.post('/refresh', moderateRateLimit, validationRules.refreshToken, (req, res) =>
    userAuthenticationController.refreshToken(req, res)
  );

  // Forgot password
  router.post('/forgot-password', strictRateLimit, validationRules.forgotPassword, (req, res) =>
    userAuthenticationController.forgotPassword(req, res)
  );

  // Reset password
  router.post('/reset-password', moderateRateLimit, validationRules.resetPassword, (req, res) =>
    userAuthenticationController.resetPassword(req, res)
  );

  /**
   * Protected Routes (Authentication required)
   */

  // User logout
  router.post(
    '/logout',
    normalRateLimit,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    (req, res) => userAuthenticationController.logout(req, res)
  );

  // Change password
  router.post(
    '/change-password',
    moderateRateLimit,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    validationRules.changePassword,
    (req, res) => userAuthenticationController.changePassword(req, res)
  );

  // Get user profile
  router.get(
    '/profile',
    normalRateLimit,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    (req, res) => userAuthenticationController.getProfile(req, res)
  );

  // Update user profile
  router.put(
    '/profile',
    moderateRateLimit,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    validationRules.updateProfile,
    (req, res) => userAuthenticationController.updateProfile(req, res)
  );

  // Token verification endpoint
  router.get(
    '/verify',
    normalRateLimit,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    (req, res) => {
      // If we reach here, token is valid
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role,
            permissions: req.user.permissions
          }
        }
      });
    }
  );

  /**
   * Admin Routes (Admin role required)
   */

  // Get all users (Admin only)
  router.get(
    '/users',
    normalRateLimit,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    authenticationMiddleware.requireRole('DTAM_ADMIN'),
    authenticationMiddleware.authorize('user:read:all'),
    async(req, res) => {
      try {
        // This would be implemented in a separate UserManagementController
        // For now, return placeholder
        res.status(200).json({
          success: true,
          message: 'User list endpoint (Admin only)',
          data: {
            users: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 10
            }
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Error retrieving users'
        });
      }
    }
  );

  // Update user status (Admin only)
  router.patch(
    '/users/:userId/status',
    moderateRateLimit,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    authenticationMiddleware.requireRole('DTAM_ADMIN'),
    authenticationMiddleware.authorize('user:manage:all'),
    async(req, res) => {
      try {
        // This would be implemented in a separate UserManagementController
        // For now, return placeholder
        res.status(200).json({
          success: true,
          message: 'User status update endpoint (Admin only)',
          data: {
            userId: req.params.userId,
            status: req.body.isActive
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Error updating user status'
        });
      }
    }
  );

  /**
   * Health check and info endpoints
   */

  // Authentication service health check
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      service: 'User Authentication Service',
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0'
    });
  });

  // Get authentication configuration (public info only)
  router.get('/config', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        tokenPolicy: {
          accessTokenExpiry: '24h',
          refreshTokenExpiry: '7d'
        },
        securityPolicy: {
          maxLoginAttempts: 5,
          lockoutDuration: 30 // minutes
        }
      }
    });
  });

  /**
   * Error handling middleware
   */
  router.use((error, req, res, next) => {
    console.error('[AuthRoutes] Unhandled error:', error);

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      ...(isDevelopment && { debug: error.message })
    });
  });

  /**
   * 404 handler for unknown auth routes
   */
  router.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'ROUTE_NOT_FOUND',
      message: `Authentication route not found: ${req.method} ${req.originalUrl}`
    });
  });

  return router;
}

module.exports = createAuthRoutes;
