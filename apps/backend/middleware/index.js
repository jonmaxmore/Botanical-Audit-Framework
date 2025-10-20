/**
 * Middleware Index
 *
 * Centralizes all middleware for consistent application and reusability.
 */
const errorMiddleware = require('./error-middleware');
const authMiddleware = require('./auth-middleware');
const roleCheck = require('./role-check');
const adminAuth = require('./admin-auth');
const inspectorAuth = require('./inspector-auth');
const requestValidator = require('./request-validator');
const rateLimit = require('./rate-limit');
const cacheMiddleware = require('./cache-middleware');
const corsMiddleware = require('./cors-middleware');

module.exports = {
  errorMiddleware,
  auth: authMiddleware,
  roleCheck,
  adminAuth,
  inspectorAuth,
  requestValidator,
  rateLimit,
  cache: cacheMiddleware,
  cors: corsMiddleware,
};
