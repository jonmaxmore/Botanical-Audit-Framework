// Shared module index - exports common utilities
module.exports = {
  auth: require('./auth-middleware'),
  errors: require('./errors'),
  logger: require('./logger'),
  validation: require('./validation-utils'),
  response: require('./response-utils'),
  constants: require('./constants'),
  utilities: require('./utilities')
};
