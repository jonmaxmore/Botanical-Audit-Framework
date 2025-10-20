/**
 * Token Controller
 *
 * Handles token refresh and rotation.
 * Implements token rotation strategy for security.
 *
 * @module controllers/token
 */

const { rotateTokens } = require('../utils/jwt.util');
const AuditLog = require('../../../../database/models/AuditLog.model');
const config = require('../../../config/env.config');

/**
 * Refresh access token
 *
 * POST /api/auth/refresh
 *
 * Uses refresh token from httpOnly cookie to generate new access token.
 * Implements token rotation (old refresh token is invalidated).
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function refresh(req, res) {
  try {
    // Get refresh token from cookie
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        error: 'NO_REFRESH_TOKEN',
        message: 'ไม่พบ refresh token กรุณาเข้าสู่ระบบใหม่'
      });
    }

    // Rotate tokens (this marks old token as used)
    const { accessToken, refreshToken, expiresIn } = await rotateTokens(oldRefreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.cookie.maxAge,
      path: '/'
    });

    // Return new access token
    res.status(200).json({
      success: true,
      message: 'Token refresh สำเร็จ',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    // Clear invalid refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path: '/'
    });

    // Handle specific errors
    if (error.message.includes('reuse detected')) {
      // Security breach - token reuse detected
      return res.status(401).json({
        success: false,
        error: 'TOKEN_REUSE_DETECTED',
        message: 'ตรวจพบการใช้ token ซ้ำ โปรดเข้าสู่ระบบใหม่'
      });
    }

    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        error: 'REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token หมดอายุ กรุณาเข้าสู่ระบบใหม่'
      });
    }

    if (error.message.includes('not found')) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่'
      });
    }

    // Fixed: Catch 'Invalid refresh token' error (JWT verification failed)
    if (error.message.includes('Invalid refresh token')) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่'
      });
    }

    // Fallback for any other authentication errors
    res.status(500).json({
      success: false,
      error: 'TOKEN_REFRESH_ERROR',
      message: 'เกิดข้อผิดพลาดในการ refresh token'
    });
  }
}

module.exports = {
  refresh
};
