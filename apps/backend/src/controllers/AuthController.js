/**
 * Authentication Controller
 * Handle user authentication operations
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const {
  asyncHandler,
  ValidationError,
  AuthenticationError,
  NotFoundError
} = require('../utils/error-handler-utils');
const { _validateRequest, _schemas, isValidEmail } = require('../utils/validation-utils');
const logger = require('../utils/logger');
const config = require('../config/environment');

class AuthController {
  /**
   * Generate JWT token
   */
  static generateToken(userId) {
    return jwt.sign({ id: userId }, config.security.jwtSecret, {
      expiresIn: config.security.jwtExpiry,
      issuer: 'gacp-platform',
      audience: 'gacp-users'
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Register new user
   */
  static register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, role = 'farmer' } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw new ValidationError('Email, password, first name, and last name are required');
    }

    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Create new user
    const userData = {
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role,
      status: 'pending'
    };

    const user = await User.createSafe(userData);

    // Generate email verification token
    // const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Generate JWT token for immediate login (optional)
    const token = this.generateToken(user._id);

    logger.auth('register', user, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: user.getSafeProfile(),
        token,
        verificationRequired: true
      }
    });
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user with password
    const user = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false
    }).select('+password');

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive()) {
      throw new AuthenticationError('Account is not active. Please contact support.');
    }

    // Update login statistics
    await user.updateLastLogin();

    // Generate tokens
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken();

    // Note: In production, store refresh token in database or Redis

    logger.auth('login', user, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getSafeProfile(),
        token,
        refreshToken,
        expiresIn: config.security.jwtExpire
      }
    });
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req, res) => {
    // In a production app, you might want to:
    // 1. Blacklist the JWT token
    // 2. Remove refresh token from database
    // 3. Clear any session data

    logger.auth('logout', req.user, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });

  /**
   * Get current user
   */
  static getMe = asyncHandler(async (req, res) => {
    const user = await User.findByIdActive(req.user.id).populate('farmerId');

    if (!user) {
      throw new NotFoundError('User');
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user.getSafeProfile()
    });
  });

  /**
   * Forgot password
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal whether user exists or not
      return res.status(200).json({
        success: true,
        message: 'If a user with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    logger.auth('forgot_password', user, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // In production, send email with reset link
    // For now, just return success message
    res.status(200).json({
      success: true,
      message: 'If a user with that email exists, a password reset link has been sent.',
      // In development only - remove in production
      ...(config.environment === 'development' && { resetToken })
    });
  });

  /**
   * Reset password
   */
  static resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ValidationError('Token and new password are required');
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      isDeleted: false
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.auth('password_reset', user, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  });

  /**
   * Refresh token
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // In production, validate refresh token against database
    // For now, just generate new token if user exists
    const user = await User.findByIdActive(req.user.id);
    if (!user) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const newToken = this.generateToken(user._id);
    const newRefreshToken = this.generateRefreshToken();

    logger.auth('token_refresh', user, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: config.security.jwtExpire
      }
    });
  });

  /**
   * Verify email
   */
  static verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
      isDeleted: false
    });

    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // Activate account if it was pending email verification
    if (user.status === 'pending') {
      user.status = 'active';
    }

    await user.save();

    logger.auth('email_verified', user, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  });

  /**
   * Resend verification email
   */
  static resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal whether user exists or not
      return res.status(200).json({
        success: true,
        message:
          'If a user with that email exists and needs verification, a new verification email has been sent.'
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    logger.auth('verification_resent', user, {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message:
        'If a user with that email exists and needs verification, a new verification email has been sent.',
      // In development only - remove in production
      ...(config.environment === 'development' && { verificationToken })
    });
  });

  /**
   * Check authentication status
   */
  static checkAuth = asyncHandler(async (req, res) => {
    const user = await User.findByIdActive(req.user.id);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    res.status(200).json({
      success: true,
      message: 'User is authenticated',
      data: {
        isAuthenticated: true,
        user: user.getSafeProfile()
      }
    });
  });
}

module.exports = AuthController;
