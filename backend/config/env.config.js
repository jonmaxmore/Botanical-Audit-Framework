/**
 * Environment Configuration
 *
 * Centralized configuration management for GACP Platform.
 * Uses dotenv for environment variables with validation.
 *
 * @module config/env
 */

require('dotenv').config();

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing
 */
function validateEnv() {
  // Skip validation in test environment (tests set env vars in setup)
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const required = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        `Please check your .env file.`,
    );
  }

  // Validate JWT secrets are strong (min 32 chars)
  if (process.env.JWT_ACCESS_SECRET.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
  }

  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
  }
}

// Run validation
validateEnv();

/**
 * Application configuration object
 */
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  server: {
    port: parseInt(process.env.PORT, 10) || 3001,
    host: process.env.HOST || '0.0.0.0',
  },

  // Database
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 100,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true,
    },
  },

  // JWT Configuration
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m', // 15 minutes
      algorithm: 'HS256',
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d', // 7 days
      algorithm: 'HS256',
    },
  },

  // Cookie Configuration
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
  },

  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Bcrypt Configuration
  bcrypt: {
    saltRounds: 12, // Cost factor (balance security vs performance)
  },

  // Rate Limiting
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many login attempts, please try again after 15 minutes',
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 registrations per hour
      message: 'Too many registration attempts, please try again later',
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: 'Too many requests, please try again later',
    },
  },

  // Account Security
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
    passwordMinLength: 8,
    passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    emailVerificationTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    passwordResetTokenExpiry: 60 * 60 * 1000, // 1 hour
  },

  // Email Configuration (SendGrid)
  email: {
    from: process.env.EMAIL_FROM || 'noreply@gacp.platform',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@gacp.platform',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      enabled: process.env.SENDGRID_ENABLED === 'true',
    },
    templates: {
      verification: {
        subject: 'ยืนยันอีเมลของคุณ - GACP Platform',
        templateId: process.env.SENDGRID_TEMPLATE_VERIFICATION,
      },
      passwordReset: {
        subject: 'รีเซ็ตรหัสผ่าน - GACP Platform',
        templateId: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET,
      },
      welcome: {
        subject: 'ยินดีต้อนรับสู่ GACP Platform',
        templateId: process.env.SENDGRID_TEMPLATE_WELCOME,
      },
    },
  },

  // Frontend URLs
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    verifyEmailPath: '/verify-email',
    resetPasswordPath: '/reset-password',
    loginPath: '/login',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
};

module.exports = config;
