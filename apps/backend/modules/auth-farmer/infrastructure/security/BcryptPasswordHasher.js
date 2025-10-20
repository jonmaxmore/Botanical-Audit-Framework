/**
 * Bcrypt Password Hasher
 * Infrastructure Layer - Clean Architecture
 *
 * Purpose: Password hashing implementation using bcrypt
 * - Hash passwords securely
 * - Compare passwords
 * - Implements password hashing interface
 */

const bcrypt = require('bcryptjs');

class BcryptPasswordHasher {
  constructor(saltRounds = 12) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hash a password
   * @param {string} plainPassword - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hash(plainPassword) {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashed = await bcrypt.hash(plainPassword, salt);
      return hashed;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare plain password with hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} - True if passwords match
   */
  async compare(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }

  /**
   * Get salt rounds
   * @returns {number}
   */
  getSaltRounds() {
    return this.saltRounds;
  }
}

module.exports = BcryptPasswordHasher;
