/**
 * User Routes
 * Handle user management endpoints
 */

const express = require('express');
const { UserController } = require('../controllers');
const { auth } = require('../middleware');

const router = express.Router();

/**
 * Apply authentication to all user routes
 */
router.use(auth.authenticateToken);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/', auth.requireAdmin, UserController.getUsers);

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users
 * @access  Private
 */
router.get('/search', UserController.searchUsers);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get user statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/stats', auth.requireAdmin, UserController.getUserStats);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', UserController.getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', UserController.updateProfile);

/**
 * @route   POST /api/v1/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', UserController.changePassword);

/**
 * @route   POST /api/v1/users/activity
 * @desc    Update user activity
 * @access  Private
 */
router.post('/activity', UserController.updateActivity);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or Owner)
 */
router.get('/:id', auth.requireOwnerOrAdmin(), UserController.getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user by ID (admin only)
 * @access  Private (Admin)
 */
router.put('/:id', auth.requireAdmin, UserController.updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', auth.requireAdmin, UserController.deleteUser);

module.exports = router;
