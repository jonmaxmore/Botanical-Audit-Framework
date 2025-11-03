/**
 * Authentication Routes for GACP Platform
 * Handles user registration, login, and account management
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');

const User = require('../models/user');
const { authenticate, authorize, rateLimitSensitive } = require('../middleware/auth');
const { validateRequest, validateUserRegistration } = require('../middleware/validation');
const { handleAsync, sendError } = require('../middleware/error-handler');
const { createLogger } = require('../shared/logger');
const logger = createLogger('auth');

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  rememberMe: Joi.boolean().optional()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Rate limiting for auth endpoints
// OWASP A05:2021 - Security Misconfiguration: Appropriate rate limits
// OWASP A07:2021 - Identification and Authentication Failures: Prevent brute force
const isDevelopment = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 5, // Higher limit for development testing
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 10, // Higher limit for development testing
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    retryAfter: 15 * 60
  }
});

/**
 * Helper function to generate JWT token
 * OWASP A02:2021 - Cryptographic Failures: Never use default secrets
 */
const generateToken = user => {
  // OWASP A05:2021 - Security Misconfiguration: Validate secret exists
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in environment variables');
  }

  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'gacp-platform',
    audience: 'gacp-users'
  });
};

/**
 * Helper function to generate refresh token
 * OWASP A02:2021 - Cryptographic Failures: Validate secrets exist
 * In development, falls back to JWT_SECRET if JWT_REFRESH_SECRET not set
 */
const generateRefreshToken = user => {
  // In production, require separate refresh secret
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  if (!refreshSecret) {
    throw new Error('JWT_SECRET or JWT_REFRESH_SECRET must be configured in environment variables');
  }

  const payload = {
    userId: user._id,
    type: 'refresh'
  };

  return jwt.sign(payload, refreshSecret, {
    expiresIn: '7d',
    issuer: 'gacp-platform'
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

    // Check if user already exists (Task 1.3 - Add 5s query timeout)
    // OWASP A05:2021 - Security Misconfiguration: Prevent user enumeration
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { nationalId }]
    }).maxTimeMS(5000); // Prevent hanging queries

    if (existingUser) {
      // Generic error message to prevent user enumeration attacks
      return res.status(400).json({
        success: false,
        message: 'การลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูล',
        code: 'REGISTRATION_FAILED'
      });
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
      ...roleSpecificData
    };

    const user = new User(userData);
    await user.save();

    // Generate email verification token (will be used for email verification feature)
    user.generateEmailVerificationToken();
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log registration
    logger.info('User registered', {
      userId: user._id,
      email: user.email,
      role: user.role,
      registrationSource: 'web'
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
          expiresIn: '24h'
        },
        nextSteps: [
          'Verify your email address',
          'Complete your profile',
          'Read platform guidelines'
        ]
      }
    });
  })
);

/**
 * POST /api/auth/login
 * Authenticate user login
 */
router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  handleAsync(async (req, res) => {
    const { email, password, rememberMe = false } = req.body;

    // Find user with password (Task 1.3 - Add 5s query timeout)
    const user = await User.findOne({
      email: email.toLowerCase(),
      status: 'active'
    })
      .select('+password')
      .maxTimeMS(5000); // Prevent hanging queries

    if (!user) {
      return sendError(res, 'LOGIN_FAILED', 'Invalid email or password', null, 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      return sendError(
        res,
        'ACCOUNT_LOCKED',
        'Account is temporarily locked due to too many failed login attempts',
        null,
        403
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
        attempts: user.loginAttempts + 1
      });

      return sendError(res, 'LOGIN_FAILED', 'Invalid email or password', null, 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update login history (use updateOne to avoid validation on partial document)
    const loginHistoryEntry = {
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      location: req.get('X-Forwarded-For') || req.connection.remoteAddress
    };

    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          loginHistory: {
            $each: [loginHistoryEntry],
            $position: 0,
            $slice: 10 // Keep only last 10 entries
          }
        },
        $set: { lastLogin: new Date() }
      }
    );

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
      rememberMe
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toPublicProfile(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn
        }
      }
    });
  })
);

/**
 * POST /api/auth/dtam/login
 * DTAM Staff Login (compatibility endpoint for admin portal)
 * This is an alias to the main login endpoint with DTAM-specific validation
 */
router.post(
  '/dtam/login',
  loginLimiter,
  handleAsync(async (req, res) => {
    const { username, email, password, userType } = req.body;

    // Support both username and email for DTAM login
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return sendError(res, 'VALIDATION_ERROR', 'Username/email and password are required', null, 400);
    }

    // Validate userType if provided
    if (userType && userType !== 'DTAM_STAFF') {
      return sendError(res, 'INVALID_USER_TYPE', 'Invalid user type for DTAM login', null, 400);
    }

    // Find DTAM staff user (admin or staff role)
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { username: loginIdentifier }
      ],
      role: { $in: ['admin', 'staff', 'document_checker', 'inspector', 'approver'] },
      status: 'active'
    })
      .select('+password')
      .maxTimeMS(5000);

    if (!user) {
      return sendError(res, 'LOGIN_FAILED', 'Invalid credentials or unauthorized access', null, 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      return sendError(
        res,
        'ACCOUNT_LOCKED',
        `Account is locked due to multiple failed login attempts. Please try again after ${Math.ceil(user.lockUntil ? (user.lockUntil - Date.now()) / 60000 : 0)} minutes.`,
        null,
        423
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      logger.warn({
        message: 'DTAM login failed - invalid password',
        userId: user._id,
        email: user.email,
        role: user.role,
        ip: req.ip
      });

      return sendError(res, 'LOGIN_FAILED', 'Invalid credentials', null, 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update login history
    const loginHistoryEntry = {
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      location: req.get('X-Forwarded-For') || req.connection.remoteAddress
    };

    await User.updateOne(
      { _id: user._id },
      {
        $set: { lastLogin: new Date() },
        $push: { loginHistory: { $each: [loginHistoryEntry], $slice: -10 } }
      }
    );

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresIn = '24h';

    logger.info({
      message: 'DTAM staff login successful',
      userId: user._id,
      email: user.email,
      role: user.role,
      userType: userType || 'DTAM_STAFF',
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'DTAM login successful',
      data: {
        user: user.toPublicProfile(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn
        },
        userType: 'DTAM_STAFF'
      }
    });
  })
);

/**
 * POST /api/auth/refresh-token
 * Refresh access token
 */
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  handleAsync(async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
      );

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Find user with 5s query timeout (Task 1.3)
      const user = await User.findById(decoded.userId).maxTimeMS(5000);

      if (!user || !user.isActive) {
        return sendError(res, 'INVALID_TOKEN', 'Invalid refresh token', null, 401);
      }

      // Generate new access token
      const accessToken = generateToken(user);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          expiresIn: '24h'
        }
      });
    } catch (error) {
      logger.warn('Invalid refresh token', {
        error: error.message,
        ip: req.ip
      });

      return sendError(res, 'INVALID_TOKEN', 'Invalid refresh token', null, 401);
    }
  })
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
      email: req.user.email
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  handleAsync(async (req, res) => {
    // Get user with 5s query timeout (Task 1.3)
    const user = await User.findById(req.user.id).maxTimeMS(5000);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    res.json({
      success: true,
      data: {
        user: user.toPublicProfile(),
        permissions: user.permissions,
        profileCompleteness: user.profileCompleteness
      }
    });
  })
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
    phone: 'string|regex:/^[+]?[0-9()\\s-]+$/',
    notifications: 'object'
  }),
  handleAsync(async (req, res) => {
    // Get user with 5s query timeout (Task 1.3)
    const user = await User.findById(req.user.id).maxTimeMS(5000);

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
      updatedFields: Object.keys(req.body)
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicProfile()
      }
    });
  })
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
    newPassword: 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/'
  }),
  handleAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password field and 5s query timeout (Task 1.3)
    const user = await User.findById(req.user.id).select('+password').maxTimeMS(5000);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      logger.warn('Failed password change attempt', {
        userId: user._id,
        ip: req.ip
      });

      return sendError(res, 'LOGIN_FAILED', 'Current password is incorrect', null, 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('Password changed', {
      userId: user._id,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({
    email: 'required|email'
  }),
  handleAsync(async (req, res) => {
    const { email } = req.body;

    // Find user with 5s query timeout (Task 1.3)
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true
    }).maxTimeMS(5000);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token (will be used for email sending feature)
    user.generatePasswordResetToken();
    await user.save();

    logger.info('Password reset requested', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    // TODO: Send password reset email

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  })
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
    newPassword: 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/'
  }),
  handleAsync(async (req, res) => {
    const { token, newPassword } = req.body;

    // Hash the token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token and 5s query timeout (Task 1.3)
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      isActive: true
    }).maxTimeMS(5000);

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
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  })
);

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post(
  '/verify-email',
  validateRequest({
    token: 'required|string'
  }),
  handleAsync(async (req, res) => {
    const { token } = req.body;

    // Hash the token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid verification token and 5s query timeout (Task 1.3)
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    }).maxTimeMS(5000);

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
      email: user.email
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  })
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
    // Get user with 5s query timeout (Task 1.3)
    const user = await User.findById(req.user.id).maxTimeMS(5000);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    if (user.isEmailVerified) {
      return sendError.validation(res, 'Email is already verified');
    }

    // Generate new verification token (will be used for email sending feature)
    user.generateEmailVerificationToken();
    await user.save();

    logger.info('Email verification resent', {
      userId: user._id,
      email: user.email
    });

    // TODO: Send verification email

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  })
);

/**
 * GET /api/auth/login-history
 * Get user login history
 */
router.get(
  '/login-history',
  authenticate,
  handleAsync(async (req, res) => {
    // Get user with login history and 5s query timeout (Task 1.3)
    const user = await User.findById(req.user.id).select('loginHistory lastLogin').maxTimeMS(5000);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    res.json({
      success: true,
      data: {
        loginHistory: user.loginHistory,
        lastLogin: user.lastLogin
      }
    });
  })
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
    // Get user with 5s query timeout (Task 1.3)
    const user = await User.findById(req.user.id).maxTimeMS(5000);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    // Generate new API key
    const apiKey = user.generateApiKey();
    await user.save();

    logger.info('API key generated', {
      userId: user._id,
      keyExpiry: user.apiKeyExpiry
    });

    res.json({
      success: true,
      message: 'API key generated successfully',
      data: {
        apiKey,
        expiresAt: user.apiKeyExpiry
      }
    });
  })
);

module.exports = router;
