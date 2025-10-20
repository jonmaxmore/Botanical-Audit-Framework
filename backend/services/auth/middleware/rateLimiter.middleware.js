/**
 * Rate Limiting Middleware
 *
 * Prevents brute force attacks and API abuse.
 * Implements different rate limits for different endpoints.
 *
 * Based on OWASP recommendations for authentication security.
 *
 * @module middleware/rateLimiter
 */

const rateLimit = require('express-rate-limit');

// In test environment, disable rate limiting
const isTestEnvironment = process.env.NODE_ENV === 'test';

// No-op middleware for testing
const noopMiddleware = (req, res, next) => next();

// Load config only in non-test environment
const config = isTestEnvironment ? null : require('../../../config/env.config');

/**
 * Rate limiter for login endpoint
 *
 * Prevents brute force password attacks.
 * 5 attempts per 15 minutes.
 */
const loginLimiter = isTestEnvironment
  ? noopMiddleware
  : rateLimit({
    windowMs: config.rateLimit.login.windowMs,
    max: config.rateLimit.login.max,
    message: {
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: config.rateLimit.login.message
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests
    skipFailedRequests: false, // Count failed requests
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: 'คุณพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ในอีก 15 นาที',
        retryAfter: Math.ceil(config.rateLimit.login.windowMs / 1000 / 60) + ' minutes'
      });
    }
  });

/**
 * Rate limiter for registration endpoint
 *
 * Prevents fake account creation.
 * 10 registrations per hour per IP.
 */
const registerLimiter = isTestEnvironment
  ? noopMiddleware
  : rateLimit({
    windowMs: config.rateLimit.register.windowMs,
    max: config.rateLimit.register.max,
    message: {
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: config.rateLimit.register.message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: 'คุณสร้างบัญชีมากเกินไป กรุณาลองใหม่ภายหลัง',
        retryAfter: Math.ceil(config.rateLimit.register.windowMs / 1000 / 60) + ' minutes'
      });
    }
  });

/**
 * General API rate limiter
 *
 * Prevents API abuse.
 * 100 requests per 15 minutes.
 */
const generalLimiter = isTestEnvironment
  ? noopMiddleware
  : rateLimit({
    windowMs: config.rateLimit.general.windowMs,
    max: config.rateLimit.general.max,
    message: {
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: config.rateLimit.general.message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: 'คุณส่งคำขอมากเกินไป กรุณาลองใหม่ภายหลัง',
        retryAfter: Math.ceil(config.rateLimit.general.windowMs / 1000 / 60) + ' minutes'
      });
    }
  });

/**
 * Strict rate limiter for sensitive operations
 *
 * Used for password reset, email verification, etc.
 * 3 requests per hour.
 */
const strictLimiter = isTestEnvironment
  ? noopMiddleware
  : rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: 'คุณส่งคำขอมากเกินไป กรุณาลองใหม่ในอีก 1 ชั่วโมง'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: 'คุณส่งคำขอมากเกินไป กรุณาลองใหม่ในอีก 1 ชั่วโมง',
        retryAfter: '1 hour'
      });
    }
  });

module.exports = {
  loginLimiter,
  registerLimiter,
  generalLimiter,
  strictLimiter
};
