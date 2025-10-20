/**
 * Authentication Routes
 *
 * Defines all authentication endpoints with validation and rate limiting.
 *
 * Routes:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login user
 * - POST /api/auth/logout - Logout user
 * - POST /api/auth/refresh - Refresh access token
 * - GET /api/auth/verify-email - Verify email with token
 * - POST /api/auth/resend-verification - Resend verification email
 * - POST /api/auth/forgot-password - Request password reset
 * - POST /api/auth/reset-password - Reset password with token
 * - POST /api/auth/change-password - Change password (authenticated)
 * - GET /api/auth/me - Get current user profile (authenticated)
 *
 * @module routes/auth
 */

const express = require('express');
const router = express.Router();

// Controllers
const { register, resendVerification, verifyEmail } = require('../controllers/register.controller');
const { login, logout, getMe } = require('../controllers/login.controller');
const { refresh } = require('../controllers/token.controller');
const {
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/password.controller');

// Validators
const {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} = require('../validators/auth.validator');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const {
  registerLimiter,
  loginLimiter,
  generalLimiter,
  strictLimiter
} = require('../middleware/rateLimiter.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register new farmer account
 * @access  Public
 * @rateLimit 10 requests per hour
 */
router.post('/register', registerLimiter, validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/login', loginLimiter, validate(loginSchema), login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and revoke refresh token
 * @access  Protected (requires authentication)
 * @rateLimit 100 requests per 15 minutes
 */
router.post('/logout', generalLimiter, authenticate, logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires refresh token cookie)
 * @rateLimit 100 requests per 15 minutes
 */
router.post('/refresh', generalLimiter, refresh);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 * @query   token - Email verification token
 * @rateLimit 100 requests per 15 minutes
 */
router.get('/verify-email', generalLimiter, verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification link
 * @access  Public
 * @rateLimit 3 requests per hour
 */
router.post('/resend-verification', strictLimiter, resendVerification);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 * @rateLimit 3 requests per hour
 */
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @rateLimit 3 requests per hour
 */
router.post('/reset-password', strictLimiter, validate(resetPasswordSchema), resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (requires current password)
 * @access  Private (requires authentication)
 * @rateLimit 100 requests per 15 minutes
 */
router.post(
  '/change-password',
  generalLimiter,
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 * @rateLimit 100 requests per 15 minutes
 */
router.get('/me', generalLimiter, authenticate, getMe);

module.exports = router;
