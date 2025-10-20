/**
 * Validation Middleware
 * Simple validation middleware for application routes
 */

/**
 * Validate request against schema
 * @param {string} schemaName - Name of validation schema
 * @returns {Function} Express middleware
 */
function validateRequest(schemaName) {
  return (req, res, next) => {
    // Basic validation - schema name parameter included for future use
    // Currently passes through - can be enhanced with actual validation logic
    if (schemaName) {
      // Reserved for future validation logic
    }
    next();
  };
}

module.exports = {
  validateRequest,
};
