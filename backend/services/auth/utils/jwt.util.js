/**
 * JWT Token Utilities
 *
 * Handles JWT token generation, verification, and management.
 * Implements token rotation and refresh token blacklisting.
 *
 * Based on:
 * - Auth0 best practices
 * - OWASP recommendations
 * - RFC 8725 (JWT Best Current Practices)
 *
 * @module utils/jwt
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Use config in production, process.env in test
// Structure must match production config exactly
const config =
  process.env.NODE_ENV === 'test'
    ? {
        jwt: {
          access: {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
            algorithm: 'HS256',
          },
          refresh: {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
            algorithm: 'HS256',
          },
        },
      }
    : require('../../../config/env.config');

const RefreshToken = require('../../../../database/models/RefreshToken.model');

/**
 * Generate access token (short-lived, 15 minutes)
 *
 * @param {Object} payload - Token payload
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role (FARMER, DTAM, ADMIN)
 * @returns {string} Signed JWT access token
 */
function generateAccessToken(payload) {
  const { userId, email, role } = payload;

  return jwt.sign(
    {
      userId,
      email,
      role,
      type: 'access',
      jti: crypto.randomUUID(), // JWT ID for token tracking and revocation
    },
    config.jwt.access.secret,
    {
      expiresIn: config.jwt.access.expiresIn,
      algorithm: config.jwt.access.algorithm,
      issuer: 'gacp-platform',
      audience: 'gacp-api',
    },
  );
}

/**
 * Generate refresh token (long-lived, 7 days)
 *
 * Creates a refresh token and stores it in the database.
 * Implements token rotation strategy.
 *
 * @param {Object} payload - Token payload
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role (needed for generating new access tokens)
 * @returns {Promise<Object>} Object containing token and tokenId
 */
async function generateRefreshToken(payload) {
  const { userId, email, role } = payload;

  // Generate unique token ID
  const tokenId = crypto.randomBytes(32).toString('hex');

  // Create refresh token (include role for token rotation)
  const refreshToken = jwt.sign(
    {
      userId,
      email,
      role, // Include role so we can generate access tokens without DB query
      tokenId,
      type: 'refresh',
    },
    config.jwt.refresh.secret,
    {
      expiresIn: config.jwt.refresh.expiresIn,
      algorithm: config.jwt.refresh.algorithm,
      issuer: 'gacp-platform',
      audience: 'gacp-api',
    },
  );

  // Hash token for storage (security best practice)
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Store in database
  await RefreshToken.create({
    tokenId,
    userId,
    tokenHash,
    expiresAt,
    isUsed: false,
  });

  return {
    token: refreshToken,
    tokenId,
  };
}

/**
 * Verify access token
 *
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.access.secret, {
      algorithms: [config.jwt.access.algorithm],
      issuer: 'gacp-platform',
      audience: 'gacp-api',
    });

    // Verify token type
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify refresh token and check if it's been used
 *
 * Implements token rotation and reuse detection.
 * If a used token is reused, all tokens for that user are invalidated.
 *
 * @param {string} token - JWT refresh token
 * @returns {Promise<Object>} Decoded token payload
 * @throws {Error} If token is invalid, expired, or already used
 */
async function verifyRefreshToken(token) {
  try {
    // Decode token
    const decoded = jwt.verify(token, config.jwt.refresh.secret, {
      algorithms: [config.jwt.refresh.algorithm],
      issuer: 'gacp-platform',
      audience: 'gacp-api',
    });

    // Verify token type
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Hash token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find token in database
    const storedToken = await RefreshToken.findOne({
      tokenId: decoded.tokenId,
      tokenHash,
    });

    if (!storedToken) {
      throw new Error('Refresh token not found');
    }

    // Check if token has been used (SECURITY: Token reuse detection)
    if (storedToken.isUsed) {
      // Token reuse detected! Possible security breach.
      // Invalidate ALL tokens for this user
      await RefreshToken.deleteMany({ userId: decoded.userId });

      throw new Error('Refresh token reuse detected. All tokens invalidated. Please login again.');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Mark token as used (token rotation)
    storedToken.isUsed = true;
    storedToken.usedAt = new Date();
    await storedToken.save();

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Revoke refresh token
 *
 * Marks token as used (soft delete) for audit trail compliance.
 * Allows tracking of revoked tokens for security analysis.
 *
 * @param {string} tokenId - Token ID to revoke
 * @returns {Promise<boolean>} True if token was revoked
 */
async function revokeRefreshToken(tokenId) {
  const result = await RefreshToken.updateOne(
    { tokenId },
    {
      $set: {
        isUsed: true,
        usedAt: new Date(),
      },
    },
  );
  return result.modifiedCount > 0;
}

/**
 * Revoke all refresh tokens for a user
 *
 * Used when user changes password or security breach detected.
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of tokens revoked
 */
async function revokeAllUserTokens(userId) {
  const result = await RefreshToken.updateMany(
    { userId, isUsed: false },
    {
      $set: {
        isUsed: true,
        usedAt: new Date(),
      },
    },
  );
  return result.modifiedCount;
}

/**
 * Clean up expired refresh tokens
 *
 * Should be run periodically (e.g., daily cron job).
 * MongoDB TTL index also handles this automatically.
 *
 * @returns {Promise<number>} Number of tokens deleted
 */
async function cleanupExpiredTokens() {
  const result = await RefreshToken.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount;
}

/**
 * Rotate refresh token
 *
 * Generates new access + refresh tokens, marks old refresh token as used.
 * This is the core of the token rotation strategy.
 *
 * @param {string} oldRefreshToken - Current refresh token
 * @returns {Promise<Object>} New access and refresh tokens
 */
async function rotateTokens(oldRefreshToken) {
  // Verify old refresh token (this marks it as used)
  const decoded = await verifyRefreshToken(oldRefreshToken);

  // Generate new tokens from refresh token payload
  // Refresh token now contains role, so no need to query database
  const accessToken = generateAccessToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role, // Get role from refresh token (stored when token was generated)
  });

  const refreshToken = await generateRefreshToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role, // Preserve role in new refresh token
  });

  return {
    accessToken,
    refreshToken: refreshToken.token,
    expiresIn: 900, // 15 minutes in seconds
  };
}

/**
 * Generate email verification token
 *
 * @returns {string} Cryptographically secure random token
 */
function generateEmailVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate password reset token
 *
 * @returns {string} Cryptographically secure random token
 */
function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  rotateTokens,
  generateEmailVerificationToken,
  generatePasswordResetToken,
};
