/**
 * Shared Module
 *
 * Purpose: ทรัพยากรและ utilities ที่ใช้ร่วมกันทุก module
 *
 * Exports:
 * - config: Configuration files
 * - middleware: Express middleware
 * - utils: Utility functions
 * - constants: Application constants
 * - database: Database connection
 */

// Config
const environment = require('./config/environment');
const database = require('./config/database');

// Middleware
const errorHandler = require('./middleware/error-handler');
const authMiddleware = require('./middleware/auth');
const securityMiddleware = require('./middleware/security');

// Utils
const responseUtils = require('./utils/response');
const validationUtils = require('./utils/validation');
const cryptoUtils = require('./utils/crypto');
const dateUtils = require('./utils/date');

// Constants
const statusCodes = require('./constants/status-codes');
const userRoles = require('./constants/user-roles');
const errorMessages = require('./constants/error-messages');

// Database
const dbConnection = require('./database/connection');
const mongoosePlugins = require('./database/mongoose-plugins');

module.exports = {
  name: 'shared',
  version: '1.0.0',
  description: 'Shared resources and utilities for all modules',

  // Config exports
  config: {
    environment,
    database
  },

  // Middleware exports
  middleware: {
    errorHandler,
    auth: authMiddleware,
    security: securityMiddleware
  },

  // Utils exports
  utils: {
    response: responseUtils,
    validation: validationUtils,
    crypto: cryptoUtils,
    date: dateUtils
  },

  // Constants exports
  constants: {
    statusCodes,
    userRoles,
    errorMessages
  },

  // Database exports
  database: {
    connection: dbConnection,
    plugins: mongoosePlugins
  },

  // Health check
  healthCheck: () => {
    return {
      status: 'healthy',
      module: 'shared',
      database: dbConnection.getStatus()
    };
  }
};
