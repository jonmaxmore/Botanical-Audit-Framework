// Validation utilities
module.exports = {
  validateEmail: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  validatePhone: phone => /^[0-9]{10}$/.test(phone),
  validateRequired: value => value !== null && value !== undefined && value !== ''
};
