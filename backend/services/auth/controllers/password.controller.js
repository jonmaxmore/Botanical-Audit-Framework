/**
 * Password Controller
 *
 * Handles password reset flow.
 * Implements secure password reset with email tokens.
 *
 * @module controllers/password
 */

const bcrypt = require('bcrypt');
const User = require('../../../../database/models/User.model');
const AuditLog = require('../../../../database/models/AuditLog.model');
const { generatePasswordResetToken, revokeAllUserTokens } = require('../utils/jwt.util');
const config = require('../../../config/env.config');

/**
 * Request password reset
 *
 * POST /api/auth/forgot-password
 *
 * Sends password reset email to user.
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({
        success: true,
        message: 'หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ',
      });
    }

    // Generate password reset token
    const passwordResetToken = generatePasswordResetToken();
    const passwordResetExpires = new Date(Date.now() + config.security.passwordResetTokenExpiry);

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    // TODO: Send password reset email (async)
    // const resetUrl = `${config.frontend.url}${config.frontend.resetPasswordPath}?token=${passwordResetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    // Log password reset request
    await AuditLog.createLog({
      category: 'AUTHENTICATION',
      action: 'PASSWORD_RESET_REQUESTED',
      actorId: user.userId,
      actorRole: user.role,
      actorEmail: user.email,
      resourceType: 'USER',
      resourceId: user.userId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      metadata: {},
    });

    res.status(200).json({
      success: true,
      message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      success: false,
      error: 'FORGOT_PASSWORD_ERROR',
      message: 'เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน',
    });
  }
}

/**
 * Reset password with token
 *
 * POST /api/auth/reset-password
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body; // Fixed: was 'password', should be 'newPassword' to match validator

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    // Update password
    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Reset failed login attempts
    user.loginAttempts = 0;
    user.accountLocked = false;
    user.accountLockedUntil = undefined;

    await user.save();

    // Revoke all existing refresh tokens (force re-login)
    await revokeAllUserTokens(user.userId);

    // Log password reset
    await AuditLog.createLog({
      category: 'AUTHENTICATION',
      action: 'PASSWORD_RESET_COMPLETED',
      actorId: user.userId,
      actorRole: user.role,
      actorEmail: user.email,
      resourceType: 'USER',
      resourceId: user.userId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      metadata: {},
    });

    res.status(200).json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      success: false,
      error: 'RESET_PASSWORD_ERROR',
      message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
    });
  }
}

/**
 * Change password (for authenticated users)
 *
 * POST /api/auth/change-password
 * Requires authentication
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Get user with password
    const user = await User.findOne({ userId }).select('+passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'ไม่พบผู้ใช้',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
      });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'SAME_PASSWORD',
        message: 'รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    // Update password
    user.passwordHash = passwordHash;
    await user.save();

    // Revoke all existing refresh tokens (force re-login on all devices)
    await revokeAllUserTokens(user.userId);

    // Log password change
    await AuditLog.createLog({
      category: 'AUTHENTICATION',
      action: 'PASSWORD_CHANGED',
      actorId: user.userId,
      actorRole: user.role,
      actorEmail: user.email,
      resourceType: 'USER',
      resourceId: user.userId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      metadata: {},
    });

    res.status(200).json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่',
    });
  } catch (error) {
    console.error('Change password error:', error);

    res.status(500).json({
      success: false,
      error: 'CHANGE_PASSWORD_ERROR',
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
    });
  }
}

module.exports = {
  forgotPassword,
  resetPassword,
  changePassword,
};
