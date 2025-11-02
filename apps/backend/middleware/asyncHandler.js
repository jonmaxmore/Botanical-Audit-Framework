/**
 * Async Handler Middleware
 *
 * Wraps async route handlers to catch errors and pass to error middleware.
 *
 * @module middleware/asyncHandler
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

/**
 * Wraps an async function to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
