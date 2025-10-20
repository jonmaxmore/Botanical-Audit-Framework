/**
 * Authentication Routes
 * Handle authentication-related endpoints
 */

const express = require('express');
const { AuthController } = require('../controllers');
const { auth } = require('../middleware');
const { validateRequest, schemas } = require('../utils/validation');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateRequest(schemas.user), AuthController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateRequest(schemas.login), AuthController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth.authenticateToken, AuthController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth.authenticateToken, AuthController.getMe);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset user password
 * @access  Public
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh-token', auth.authenticateToken, AuthController.refreshToken);

/**
 * @route   GET /api/v1/auth/verify-email/:token
 * @desc    Verify user email
 * @access  Public
 */
router.get('/verify-email/:token', AuthController.verifyEmail);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', AuthController.resendVerification);

/**
 * @route   GET /api/v1/auth/check
 * @desc    Check authentication status
 * @access  Private
 */
router.get('/check', auth.authenticateToken, AuthController.checkAuth);

module.exports = router;
