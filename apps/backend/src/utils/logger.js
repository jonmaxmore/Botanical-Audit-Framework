/**
 * Centralized Logging System
 * Winston-based logger with multiple transports and formatting
 */

const winston = require('winston');
const path = require('path');
const config = require('../config/environment');

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston that you want to link the colors
winston.addColors(logColors);

// Define custom format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add stack trace for errors
    if (stack) {
      msg += `\n${stack}`;
    }

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return msg;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Define transports
const transports = [];

// Console transport (always enabled in development)
if (config.environment === 'development' || config.logging.console) {
  transports.push(
    new winston.transports.Console({
      level: config.logging.level,
      format: consoleFormat,
    })
  );
}

// File transports (production)
if (config.environment === 'production' || config.logging.file) {
  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      level: config.logging.level,
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: config.logging.level,
  format: customFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: customFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: customFormat,
    }),
  ],
  exitOnError: false,
});

// HTTP request logger middleware
const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.warn(message, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    } else {
      logger.http(message, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      });
    }
  });

  next();
};

// Enhanced logging methods
const enhancedLogger = {
  // Standard methods
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  http: (message, meta = {}) => logger.http(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  // Request/Response logging
  request: (req, message = 'Request received') => {
    logger.info(message, {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      body: req.body,
      query: req.query,
      params: req.params,
    });
  },

  response: (res, message = 'Response sent') => {
    logger.info(message, {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
    });
  },

  // Database logging
  database: (operation, collection, query = {}, result = {}) => {
    logger.debug(`Database ${operation}`, {
      operation,
      collection,
      query,
      result: typeof result === 'object' ? JSON.stringify(result) : result,
    });
  },

  // Authentication logging
  auth: (action, user, details = {}) => {
    logger.info(`Auth: ${action}`, {
      action,
      userId: user?.id || user?._id,
      username: user?.username || user?.email,
      ...details,
    });
  },

  // Performance logging
  performance: (operation, duration, details = {}) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger[level](`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...details,
    });
  },

  // Security logging
  security: (event, details = {}) => {
    logger.warn(`Security: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  // Error with context
  errorWithContext: (error, context = {}) => {
    logger.error(error.message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
    });
  },

  // Child logger for modules
  child: (defaultMeta = {}) => {
    return {
      error: (message, meta = {}) => logger.error(message, { ...defaultMeta, ...meta }),
      warn: (message, meta = {}) => logger.warn(message, { ...defaultMeta, ...meta }),
      info: (message, meta = {}) => logger.info(message, { ...defaultMeta, ...meta }),
      http: (message, meta = {}) => logger.http(message, { ...defaultMeta, ...meta }),
      debug: (message, meta = {}) => logger.debug(message, { ...defaultMeta, ...meta }),
    };
  },
};

// Add HTTP middleware to enhanced logger
enhancedLogger.middleware = httpLogger;

module.exports = enhancedLogger;
