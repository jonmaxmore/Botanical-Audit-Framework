/**
 * Registration Controller
 *
 * Handles user registration with email verification.
 * Implements security best practices:
 * - Password hashing (bcrypt)
 * - Thai ID validation
 * - Email uniqueness check
 * - Audit logging
 *
 * @module controllers/register
 */

const bcrypt = require('bcrypt');
const User = require('../../../../database/models/User.model');
const AuditLog = require('../../../../database/models/AuditLog.model');
const { generateEmailVerificationToken } = require('../utils/jwt.util');
const config = require('../../../config/env.config');

/**
 * Register new user
 *
 * POST /api/auth/register
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, thaiId, phoneNumber, address } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'อีเมลนี้ถูกใช้งานแล้ว',
      });
    }

    // Check if Thai ID already exists
    const existingIdCard = await User.findOne({ thaiId });
    if (existingIdCard) {
      return res.status(400).json({
        success: false,
        error: 'THAI_ID_EXISTS',
        message: 'เลขบัตรประชาชนนี้ถูกใช้งานแล้ว',
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: 'PHONE_EXISTS',
        message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว',
      });
    }

    // Generate userId
    const userId = await User.generateUserId();

    // Hash password (bcrypt cost factor 12)
    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(
      Date.now() + config.security.emailVerificationTokenExpiry
    );

    // Create user
    const user = await User.create({
      userId,
      email,
      passwordHash,
      fullName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      thaiId,
      phoneNumber,
      address: {
        houseNumber: address.houseNo,
        moo: address.moo || '',
        subDistrict: address.tambon,
        district: address.amphoe,
        province: address.province,
        postalCode: address.postalCode,
      },
      role: 'FARMER',
      permissions: [
        'application:create',
        'application:read',
        'application:update:own',
        'document:upload:own',
        'payment:create',
        'certificate:read:own',
      ],
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
      isActive: true,
    });

    // Create audit log
    await AuditLog.createLog({
      category: 'AUTHENTICATION',
      action: 'USER_REGISTERED',
      actorId: user.userId,
      actorRole: 'FARMER',
      actorEmail: user.email,
      resourceType: 'USER',
      resourceId: user.userId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      metadata: {
        email: user.email,
        role: user.role,
        registrationMethod: 'email',
      },
    });

    // TODO: Send verification email (async)
    // await sendVerificationEmail(user.email, emailVerificationToken);

    // Return response (without sensitive data)
    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate key errors (MongoDB unique indexes)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE_FIELD',
        message: `${field} นี้ถูกใช้งานแล้ว`,
      });
    }

    res.status(500).json({
      success: false,
      error: 'REGISTRATION_ERROR',
      message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
    });
  }
}

/**
 * Resend verification email
 *
 * POST /api/auth/resend-verification
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function resendVerification(req, res) {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({
        success: true,
        message: 'หากอีเมลนี้มีในระบบ เราจะส่งอีเมลยืนยันให้คุณ',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_ALREADY_VERIFIED',
        message: 'อีเมลถูกยืนยันแล้ว',
      });
    }

    // Generate new verification token
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(
      Date.now() + config.security.emailVerificationTokenExpiry
    );

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // TODO: Send verification email (async)
    // await sendVerificationEmail(user.email, emailVerificationToken);

    // Log email verification resent
    await AuditLog.createLog({
      category: 'AUTHENTICATION',
      action: 'EMAIL_VERIFICATION_RESENT',
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
      message: 'ส่งอีเมลยืนยันใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณ',
    });
  } catch (error) {
    console.error('Resend verification error:', error);

    res.status(500).json({
      success: false,
      error: 'RESEND_ERROR',
      message: 'เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน',
    });
  }
}

/**
 * Verify email with token
 *
 * GET /api/auth/verify-email?token=...
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'กรุณาระบุ token',
      });
    }

    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_ALREADY_VERIFIED',
        message: 'อีเมลถูกยืนยันแล้ว',
      });
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Log email verification
    await AuditLog.createLog({
      category: 'AUTHENTICATION',
      action: 'EMAIL_VERIFIED',
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
      message: 'ยืนยันอีเมลสำเร็จ คุณสามารถเข้าสู่ระบบได้แล้ว',
      data: {
        userId: user.userId,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);

    res.status(500).json({
      success: false,
      error: 'VERIFICATION_ERROR',
      message: 'เกิดข้อผิดพลาดในการยืนยันอีเมล',
    });
  }
}

module.exports = {
  register,
  resendVerification,
  verifyEmail,
};
