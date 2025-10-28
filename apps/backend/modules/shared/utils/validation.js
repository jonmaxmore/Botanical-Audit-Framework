/**
 * Validation Utility Functions
 */

/**
 * Check if email is valid
 * @param {String} email
 * @returns {Boolean}
 */
const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password is strong
 * @param {String} password
 * @returns {Boolean}
 */
const isStrongPassword = password => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Check if phone number is valid (Thai format)
 * @param {String} phone
 * @returns {Boolean}
 */
const isValidThaiPhone = phone => {
  const phoneRegex = /^0[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Check if value is empty
 * @param {*} value
 * @returns {Boolean}
 */
const isEmpty = value => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim().length === 0) ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};

/**
 * Sanitize string (remove HTML tags)
 * @param {String} str
 * @returns {String}
 */
const sanitizeString = str => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validate MongoDB ObjectId
 * @param {String} id
 * @returns {Boolean}
 */
const isValidObjectId = id => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate latitude
 * @param {Number} lat
 * @returns {Boolean}
 */
const isValidLatitude = lat => {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
};

/**
 * Validate longitude
 * @param {Number} lng
 * @returns {Boolean}
 */
const isValidLongitude = lng => {
  return !isNaN(lng) && lng >= -180 && lng <= 180;
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidThaiPhone,
  isEmpty,
  sanitizeString,
  isValidObjectId,
  isValidLatitude,
  isValidLongitude
};
