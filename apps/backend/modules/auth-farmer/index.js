/**
 * Auth Farmer Module
 * Handles farmer authentication and user management
 *
 * Entry point for the farmer authentication module
 */

// Import routes
const farmerAuthRoutes = require('./routes/farmer-auth');

// Import models
const User = require('./models/user');

// Import services
const logger = require('./services/logger');

// Import validators
const validators = require('./validators/auth-validators');

/**
 * Module exports
 */
module.exports = {
  // Routes
  routes: {
    farmerAuth: farmerAuthRoutes,
  },

  // Models
  models: {
    User,
  },

  // Services
  services: {
    logger,
  },

  // Validators
  validators,

  // Convenience method to mount routes
  mountRoutes: (app, basePath = '/api/auth-farmer') => {
    app.use(basePath, farmerAuthRoutes);
    logger.info(`Auth Farmer routes mounted at ${basePath}`);
  },
};
