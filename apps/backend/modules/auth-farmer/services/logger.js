/**
 * Logger Service for Auth Farmer Module
 * Simple logging utility with different log levels
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format log message with timestamp and level
 */
function formatLog(level, message, metadata = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(metadata).length > 0 ? ` | ${JSON.stringify(metadata)}` : '';

  return `[${timestamp}] [${level}] ${message}${metaString}`;
}

/**
 * Logger class
 */
class Logger {
  constructor(context = 'auth-farmer') {
    this.context = context;
  }

  /**
   * Log error message
   */
  error(message, error = null) {
    const metadata = error
      ? {
          error: error.message,
          stack: error.stack,
        }
      : {};
    console.error(formatLog(LOG_LEVELS.ERROR, `[${this.context}] ${message}`, metadata));
  }

  /**
   * Log warning message
   */
  warn(message, metadata = {}) {
    console.warn(formatLog(LOG_LEVELS.WARN, `[${this.context}] ${message}`, metadata));
  }

  /**
   * Log info message
   */
  info(message, metadata = {}) {
    console.log(formatLog(LOG_LEVELS.INFO, `[${this.context}] ${message}`, metadata));
  }

  /**
   * Log debug message
   */
  debug(message, metadata = {}) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      console.log(formatLog(LOG_LEVELS.DEBUG, `[${this.context}] ${message}`, metadata));
    }
  }

  /**
   * Log authentication events
   */
  auth(action, user, metadata = {}) {
    this.info(`Auth: ${action}`, {
      userId: user._id || user.id,
      email: user.email,
      ...metadata,
    });
  }
}

// Export singleton instance
module.exports = new Logger('auth-farmer');
