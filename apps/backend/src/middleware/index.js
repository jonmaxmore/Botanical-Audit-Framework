/**
 * Middleware Index
 * Central export point for all middleware
 */

const auth = require('./auth-middleware');

module.exports = {
  auth
};
