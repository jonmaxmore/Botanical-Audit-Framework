/**
 * Date Utility Functions
 */

/**
 * Format date to Thai format
 * @param {Date} date
 * @returns {String}
 */
const formatDateThai = date => {
  if (!date) return '';
  const d = new Date(date);
  const months = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear() + 543; // Buddhist calendar
  return `${day} ${month} ${year}`;
};

/**
 * Format date to ISO format
 * @param {Date} date
 * @returns {String}
 */
const formatDateISO = date => {
  if (!date) return '';
  return new Date(date).toISOString();
};

/**
 * Get date difference in days
 * @param {Date} date1
 * @param {Date} date2
 * @returns {Number}
 */
const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Add days to date
 * @param {Date} date
 * @param {Number} days
 * @returns {Date}
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if date is expired
 * @param {Date} date
 * @returns {Boolean}
 */
const isExpired = date => {
  return new Date(date) < new Date();
};

/**
 * Get current timestamp
 * @returns {Number}
 */
const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * Format datetime for display
 * @param {Date} date
 * @returns {String}
 */
const formatDateTime = date => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

module.exports = {
  formatDateThai,
  formatDateISO,
  getDaysDifference,
  addDays,
  isExpired,
  getCurrentTimestamp,
  formatDateTime,
};
