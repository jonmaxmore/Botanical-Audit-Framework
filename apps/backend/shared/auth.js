// Auth utilities
module.exports = {
  verifyToken: (req, res, next) => next(),
  generateToken: payload => 'token',
  hashPassword: password => password,
  comparePassword: (password, hash) => true
};
