/**
 * Login Controller
 *
 * Handles user authentication with JWT tokens.
 * Implements security features:
 * - Account lockout (5 failed attempts)
 * - Password verification (bcrypt)
 * - Token generation (access + refresh)
 * - Login history tracking
 * - Audit logging
 *
 * @module controllers/login
 */

const bcrypt = require('bcrypt');
const User = require('../../../../database/models/User.model');
const AuditLog = require('../../../../database/models/AuditLog.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.util');
const config = require('../../../config/env.config');

/**
 * Login user
 *
 * POST /api/auth/login
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user (include password for verification)
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: 'บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ'
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.accountLockedUntil - new Date()) / 1000 / 60);

      // Log failed login attempt (locked account)
      await AuditLog.createLog({
        category: 'AUTHENTICATION',
        action: 'LOGIN_FAILED_LOCKED',
        actorId: user.userId,
        actorRole: user.role,
        actorEmail: user.email,
        resourceType: 'USER',
        resourceId: user.userId,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        metadata: {
          reason: 'Account locked'
        }
      });

      return res.status(423).json({
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: `บัญชีถูกล็อคชั่วคราว กรุณาลองใหม่ในอีก ${remainingMinutes} นาที`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Record failed login (increments failed attempts and may lock account)
      await user.recordLogin(
        req.ip || 'unknown',
        req.get('user-agent') || 'unknown',
        false,
        'INVALID_PASSWORD'
      );

      // Log failed login attempt
      await AuditLog.createLog({
        category: 'AUTHENTICATION',
        action: 'LOGIN_FAILED',
        actorId: user.userId,
        actorRole: user.role,
        actorEmail: user.email,
        resourceType: 'USER',
        resourceId: user.userId,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        metadata: {
          reason: 'Invalid password'
        }
      });

      // Check if account is now locked
      if (user.loginAttempts >= config.security.maxLoginAttempts || user.accountLocked) {
        return res.status(423).json({
          success: false,
          error: 'ACCOUNT_LOCKED',
          message: `บัญชีถูกล็อคชั่วคราว (ความพยายามเข้าสู่ระบบล้มเหลว ${user.loginAttempts} ครั้ง) กรุณาลองใหม่ในอีก 30 นาที`
        });
      }

      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        attemptsRemaining: config.security.maxLoginAttempts - user.loginAttempts
      });
    }

    // Password is valid - Generate tokens
    const accessToken = generateAccessToken({
      userId: user.userId,
      email: user.email,
      role: user.role
    });

    const refreshToken = await generateRefreshToken({
      userId: user.userId,
      email: user.email,
      role: user.role // Include role in refresh token for token rotation
    });

    // Record successful login (this also resets failed attempts and updates lastLogin)
    await user.recordLogin(req.ip || 'unknown', req.get('user-agent') || 'unknown', true);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken.token, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.cookie.maxAge,
      path: '/'
    });

    // Log successful login
    await AuditLog.createLog({
      category: 'AUTHENTICATION',
      action: 'LOGIN_SUCCESS',
      actorId: user.userId,
      actorRole: user.role,
      actorEmail: user.email,
      resourceType: 'USER',
      resourceId: user.userId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      metadata: {}
    });

    // Return response (without sensitive data)
    res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 900, // 15 minutes in seconds
        user: {
          userId: user.userId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          emailVerified: user.emailVerified,
          permissions: user.permissions
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      error: 'LOGIN_ERROR',
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    });
  }
}

/**
 * Logout user
 *
 * POST /api/auth/logout
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // TODO: Revoke refresh token
      // This requires decoding the token to get tokenId
      // await revokeRefreshToken(tokenId);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path: '/'
    });

    // Log logout (if user is authenticated)
    if (req.user) {
      await AuditLog.createLog({
        category: 'AUTHENTICATION',
        action: 'LOGOUT',
        actorId: req.user.userId,
        actorRole: req.user.role,
        actorEmail: req.user.email,
        resourceType: 'USER',
        resourceId: req.user.userId,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        metadata: {}
      });
    }

    res.status(200).json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });
  } catch (error) {
    console.error('Logout error:', error);

    res.status(500).json({
      success: false,
      error: 'LOGOUT_ERROR',
      message: 'เกิดข้อผิดพลาดในการออกจากระบบ'
    });
  }
}

/**
 * Get current user profile
 *
 * GET /api/auth/me
 * Requires authentication
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function getMe(req, res) {
  try {
    // User is already attached by authenticate middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          thaiId: user.thaiId,
          phoneNumber: user.phoneNumber,
          address: user.address,
          role: user.role,
          permissions: user.permissions,
          emailVerified: user.emailVerified,
          status: user.status,
          lastLogin: user.lastLoginAt,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);

    res.status(500).json({
      success: false,
      error: 'GET_ME_ERROR',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    });
  }
}

module.exports = {
  login,
  logout,
  getMe
};
