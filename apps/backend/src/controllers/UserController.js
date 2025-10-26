/**
 * User Controller
 * Handle user-related operations
 */

const { User } = require('../models');
const { asyncHandler, ValidationError, NotFoundError } = require('../utils/errorHandler');
const { _validateRequest, schemas } = require('../utils/validation');
const logger = require('../utils/logger');

class UserController {
  /**
   * Get all users (with pagination)
   */
  static getUsers = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    // Build sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      select: '-password -passwordResetToken -emailVerificationToken',
    };

    let result;
    if (search) {
      result = await User.search(search, filter, options);
    } else {
      result = await User.findPaginated(filter, options);
    }

    logger.info('Users retrieved', {
      userId: req.user?.id,
      page,
      limit,
      total: result.pagination.total,
    });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.documents,
      pagination: result.pagination,
    });
  });

  /**
   * Get user by ID
   */
  static getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdActive(id)
      .select('-password -passwordResetToken -emailVerificationToken')
      .populate('farmerId');

    if (!user) {
      throw new NotFoundError('User');
    }

    logger.info('User retrieved by ID', {
      userId: req.user?.id,
      targetUserId: id,
    });

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user.getSafeProfile(),
    });
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByIdActive(req.user.id)
      .select('-password -passwordResetToken -emailVerificationToken')
      .populate('farmerId');

    if (!user) {
      throw new NotFoundError('User');
    }

    logger.info('User profile retrieved', {
      userId: user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user.getSafeProfile(),
    });
  });

  /**
   * Update user profile
   */
  static updateProfile = asyncHandler(async (req, res) => {
    const allowedUpdates = [
      'firstName',
      'lastName',
      'displayName',
      'phone',
      'address',
      'dateOfBirth',
      'gender',
      'preferences',
      'avatar',
    ];

    // Filter allowed fields
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.updateSafe(req.user.id, updates);

    logger.info('User profile updated', {
      userId: user.id,
      updatedFields: Object.keys(updates),
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getSafeProfile(),
    });
  });

  /**
   * Update user by ID (admin only)
   */
  static updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const allowedUpdates = [
      'firstName',
      'lastName',
      'displayName',
      'phone',
      'address',
      'role',
      'status',
      'permissions',
      'dateOfBirth',
      'gender',
    ];

    // Filter allowed fields
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.updateSafe(id, updates);

    logger.info('User updated by admin', {
      adminId: req.user.id,
      targetUserId: id,
      updatedFields: Object.keys(updates),
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user.getSafeProfile(),
    });
  });

  /**
   * Delete user (soft delete)
   */
  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdActive(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    await user.softDelete();

    logger.warn('User deleted', {
      adminId: req.user.id,
      deletedUserId: id,
      deletedUserEmail: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    // Get user with password
    const user = await User.findByIdActive(req.user.id).select('+password');
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('Password changed', {
      userId: user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  /**
   * Update user activity
   */
  static updateActivity = asyncHandler(async (req, res) => {
    const user = await User.findByIdActive(req.user.id);
    if (!user) {
      throw new NotFoundError('User');
    }

    await user.updateActivity();

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
    });
  });

  /**
   * Get user statistics (admin only)
   */
  static getUserStats = asyncHandler(async (req, res) => {
    const stats = await User.getUserStats();

    logger.info('User statistics retrieved', {
      adminId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats,
    });
  });

  /**
   * Search users
   */
  static searchUsers = asyncHandler(async (req, res) => {
    const { q: searchTerm, page = 1, limit = 10 } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new ValidationError('Search term must be at least 2 characters');
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      select: '-password -passwordResetToken -emailVerificationToken',
    };

    const result = await User.searchUsers(searchTerm.trim(), options);

    logger.info('Users searched', {
      userId: req.user?.id,
      searchTerm,
      resultsCount: result.documents.length,
    });

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: result.documents,
      pagination: result.pagination,
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
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.status = 'active'; // Activate account upon email verification

    await user.save();

    logger.info('Email verified', {
      userId: user.id,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  });
}

module.exports = UserController;
