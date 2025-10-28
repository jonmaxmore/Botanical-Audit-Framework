/**
 * Middleware Index
 *
 * Centralizes all middleware for consistent application and reusability.
 */
const errorMiddleware = require('./error-middleware');
const authMiddleware = require('./auth');
const adminAuth = require('./admin-auth');
const inspectorAuth = require('./inspector-auth');
const requestValidator = require('./request-validator');

module.exports = {
  errorMiddleware,
  auth: authMiddleware,
  adminAuth,
  inspectorAuth,
  requestValidator
};
