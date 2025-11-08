/**
 * Centralized Error Handling System
 * Custom error classes and middleware for consistent error responses
 */

const logger = require('./logger');

/**
 * Base Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
    this.type = 'validation_error';
  }
}

/**
 * Authentication Error
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.type = 'authentication_error';
  }
}

/**
 * Authorization Error
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.type = 'authorization_error';
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.type = 'not_found_error';
    this.resource = resource;
  }
}

/**
 * Conflict Error
 */
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.type = 'conflict_error';
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.type = 'rate_limit_error';
  }
}

/**
 * Database Error
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500);
    this.type = 'database_error';
    this.originalError = originalError;
  }
}

/**
 * External API Error
 */
class ExternalAPIError extends AppError {
  constructor(service, message = 'External service error', statusCode = 503) {
    super(message, statusCode);
    this.type = 'external_api_error';
    this.service = service;
  }
}

/**
 * Handle MongoDB Errors
 */
const handleMongoError = error => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    return new ValidationError('Validation failed', errors);
  }

  if (error.name === 'CastError') {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return new ConflictError(`${field} already exists`);
  }

  return new DatabaseError('Database operation failed', error);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = error => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }

  return new AuthenticationError('Authentication failed');
};

/**
 * Error Response Formatter
 */
const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: error.message,
      type: error.type || 'unknown_error',
      timestamp: error.timestamp || new Date().toISOString(),
    },
  };

  // Add field information for validation errors
  if (error.field) {
    response.error.field = error.field;
  }

  // Add resource information for not found errors
  if (error.resource) {
    response.error.resource = error.resource;
  }

  // Add service information for external API errors
  if (error.service) {
    response.error.service = error.service;
  }

  // Include stack trace in development
  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
};

/**
 * Global Error Handler Middleware
 */
const globalErrorHandler = (error, req, res, _next) => {
  let err = error;

  // Handle known error types
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.code === 11000) {
    err = handleMongoError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    err = handleJWTError(err);
  } else if (!(err instanceof AppError)) {
    // Handle unknown errors
    err = new AppError('Something went wrong', 500, false);
  }

  // Log error
  const logLevel = err.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('Error handled:', {
    error: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    user: req.user ? { id: req.user.id, username: req.user.username } : null,
  });

  // Send error response
  const includeStack = process.env.NODE_ENV === 'development';
  const response = formatErrorResponse(err, includeStack);

  res.status(err.statusCode).json(response);
};

/**
 * Handle Async Errors (Wrapper)
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Validation Helper
 */
const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);

  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
};

/**
 * Safe JSON Parser
 */
const safeJSONParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    logger.warn('JSON parse error:', { input: str, error: error.message });
    return defaultValue;
  }
};

/**
 * Error Recovery Helper
 */
const withRetry = async (fn, maxRetries = 3, delayMs = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms:`, {
        error: error.message,
        attempt,
        maxRetries,
      });

      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs *= 2; // Exponential backoff
    }
  }

  throw lastError;
};

module.exports = {
  // Error Classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalAPIError,

  // Error Handlers
  handleMongoError,
  handleJWTError,
  globalErrorHandler,
  notFoundHandler,

  // Utilities
  asyncHandler,
  formatErrorResponse,
  validateRequired,
  safeJSONParse,
  withRetry,
};
