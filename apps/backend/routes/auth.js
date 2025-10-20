/**
 * Authentication Routes for GACP Platform
 * Handles user registration, login, and account management
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/user');
const { authenticate, authorize, rateLimitSensitive } = require('../middleware/auth');
const { validateRequest, validateUserRegistration } = require('../middleware/validation');
const { handleAsync, createError, sendError } = require('../middleware/error-handler');
const logger = require('../shared/logger');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    retryAfter: 15 * 60,
  },
});

/**
 * Helper function to generate JWT token
 */
const generateToken = user => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: '24h',
    issuer: 'gacp-platform',
    audience: 'gacp-users',
  });
};

/**
 * Helper function to generate refresh token
 */
const generateRefreshToken = user => {
  const payload = {
    userId: user._id,
    type: 'refresh',
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret', {
    expiresIn: '7d',
    issuer: 'gacp-platform',
  });
};

/**
 * POST /api/auth/register
 * Register new user
 */
router.post(
  '/register',
  authLimiter,
  validateUserRegistration,
  handleAsync(async (req, res) => {
    const { email, password, fullName, phone, nationalId, role, ...roleSpecificData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { nationalId }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return sendError.validation(res, 'Email already registered', 'email');
      }

      if (existingUser.nationalId === nationalId) {
        return sendError.validation(res, 'National ID already registered', 'nationalId');
      }
    }

    // Create new user
    const userData = {
      email: email.toLowerCase(),
      password,
      fullName,
      phone,
      nationalId,
      role,
      registrationSource: 'web',
      ...roleSpecificData,
    };

    const user = new User(userData);
    await user.save();

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log registration
    logger.info('User registered', {
      userId: user._id,
      email: user.email,
      role: user.role,
      registrationSource: 'web',
    });

    // TODO: Send verification email

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toPublicProfile(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '24h',
        },
        nextSteps: [
          'Verify your email address',
          'Complete your profile',
          'Read platform guidelines',
        ],
      },
    });
  }),
);

/**
 * POST /api/auth/login
 * Authenticate user login
 */
router.post(
  '/login',
  loginLimiter,
  validateRequest({
    email: 'required|email',
    password: 'required|string|min:8',
  }),
  handleAsync(async (req, res) => {
    const { email, password, rememberMe = false } = req.body;

    // Find user with password
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    }).select('+password');

    if (!user) {
      return sendError.authentication(res, 'Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked) {
      return sendError.authentication(
        res,
        'Account is temporarily locked due to too many failed login attempts',
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();

      logger.warn('Failed login attempt', {
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        attempts: user.loginAttempts + 1,
      });

      return sendError.authentication(res, 'Invalid email or password');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update login history
    user.addLoginHistory(
      req.ip,
      req.get('User-Agent'),
      req.get('X-Forwarded-For') || req.connection.remoteAddress,
    );
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set token expiry based on rememberMe
    const expiresIn = rememberMe ? '7d' : '24h';

    logger.info('User logged in', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip,
      rememberMe,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toPublicProfile(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn,
        },
      },
    });
  }),
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validateRequest({
    refreshToken: 'required|string',
  }),
  handleAsync(async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      );

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return sendError.authentication(res, 'Invalid refresh token');
      }

      // Generate new access token
      const accessToken = generateToken(user);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          expiresIn: '24h',
        },
      });
    } catch (error) {
      logger.warn('Invalid refresh token', {
        error: error.message,
        ip: req.ip,
      });

      return sendError.authentication(res, 'Invalid refresh token');
    }
  }),
);

/**
 * POST /api/auth/logout
 * Logout user (invalidate token)
 */
router.post(
  '/logout',
  authenticate,
  handleAsync(async (req, res) => {
    // In a production system, you would blacklist the token
    // For now, we just log the logout

    logger.info('User logged out', {
      userId: req.user.id,
      email: req.user.email,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }),
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  handleAsync(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    res.json({
      success: true,
      data: {
        user: user.toPublicProfile(),
        permissions: user.permissions,
        profileCompleteness: user.profileCompleteness,
      },
    });
  }),
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  validateRequest({
    fullName: 'string|min:2|max:100',
    phone: 'string|regex:/^[\+]?[0-9\-\(\)\s]+$/',
    notifications: 'object',
  }),
  handleAsync(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    // Update allowed fields
    const allowedFields = ['fullName', 'phone', 'notifications'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Role-specific updates
    if (user.role === 'farmer' && req.body.farmingExperience !== undefined) {
      user.farmingExperience = req.body.farmingExperience;
    }

    if (user.role === 'inspector' && req.body.expertise) {
      user.expertise = { ...user.expertise, ...req.body.expertise };
    }

    await user.save();

    logger.info('User profile updated', {
      userId: user._id,
      updatedFields: Object.keys(req.body),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicProfile(),
      },
    });
  }),
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  rateLimitSensitive(),
  validateRequest({
    currentPassword: 'required|string',
    newPassword:
      'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/',
  }),
  handleAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      logger.warn('Failed password change attempt', {
        userId: user._id,
        ip: req.ip,
      });

      return sendError.authentication(res, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('Password changed', {
      userId: user._id,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }),
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({
    email: 'required|email',
  }),
  handleAsync(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    logger.info('Password reset requested', {
      userId: user._id,
      email: user.email,
      ip: req.ip,
    });

    // TODO: Send password reset email

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  }),
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  authLimiter,
  validateRequest({
    token: 'required|string',
    newPassword:
      'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/',
  }),
  handleAsync(async (req, res) => {
    const { token, newPassword } = req.body;

    // Hash the token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      isActive: true,
    });

    if (!user) {
      return sendError.validation(res, 'Invalid or expired reset token');
    }

    // Reset password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = undefined;
    user.lockUntil = undefined;

    await user.save();

    logger.info('Password reset completed', {
      userId: user._id,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  }),
);

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post(
  '/verify-email',
  validateRequest({
    token: 'required|string',
  }),
  handleAsync(async (req, res) => {
    const { token } = req.body;

    // Hash the token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError.validation(res, 'Invalid or expired verification token');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    logger.info('Email verified', {
      userId: user._id,
      email: user.email,
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  }),
);

/**
 * POST /api/auth/resend-verification
 * Resend email verification
 */
router.post(
  '/resend-verification',
  authenticate,
  authLimiter,
  handleAsync(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    if (user.isEmailVerified) {
      return sendError.validation(res, 'Email is already verified');
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    logger.info('Email verification resent', {
      userId: user._id,
      email: user.email,
    });

    // TODO: Send verification email

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  }),
);

/**
 * GET /api/auth/login-history
 * Get user login history
 */
router.get(
  '/login-history',
  authenticate,
  handleAsync(async (req, res) => {
    const user = await User.findById(req.user.id).select('loginHistory lastLogin');

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    res.json({
      success: true,
      data: {
        loginHistory: user.loginHistory,
        lastLogin: user.lastLogin,
      },
    });
  }),
);

/**
 * POST /api/auth/generate-api-key
 * Generate API key for external integrations
 */
router.post(
  '/generate-api-key',
  authenticate,
  authorize(['admin', 'dtam_officer']),
  rateLimitSensitive(24 * 60 * 60 * 1000, 3), // 3 per day
  handleAsync(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    // Generate new API key
    const apiKey = user.generateApiKey();
    await user.save();

    logger.info('API key generated', {
      userId: user._id,
      keyExpiry: user.apiKeyExpiry,
    });

    res.json({
      success: true,
      message: 'API key generated successfully',
      data: {
        apiKey,
        expiresAt: user.apiKeyExpiry,
      },
    });
  }),
);

module.exports = router;
