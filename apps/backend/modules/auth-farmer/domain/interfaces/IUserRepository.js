/**
 * IUserRepository Interface
 * Domain Layer - Clean Architecture
 *
 * Purpose: Define contract for user data access
 * - Dependency Inversion Principle
 * - Domain defines interface, Infrastructure implements
 * - Framework-independent
 */

class IUserRepository {
  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    throw new Error('Method not implemented: findByEmail');
  }

  /**
   * Find user by ID card
   * @param {string} idCard - Thai ID card number
   * @returns {Promise<User|null>}
   */
  async findByIdCard(idCard) {
    throw new Error('Method not implemented: findByIdCard');
  }

  /**
   * Find user by email verification token
   * @param {string} token - Email verification token
   * @returns {Promise<User|null>}
   */
  async findByEmailVerificationToken(token) {
    throw new Error('Method not implemented: findByEmailVerificationToken');
  }

  /**
   * Find user by password reset token
   * @param {string} token - Password reset token
   * @returns {Promise<User|null>}
   */
  async findByPasswordResetToken(token) {
    throw new Error('Method not implemented: findByPasswordResetToken');
  }

  /**
   * Save user (create or update)
   * @param {User} user - User entity
   * @returns {Promise<User>}
   */
  async save(user) {
    throw new Error('Method not implemented: save');
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Find users with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array<User>>}
   */
  async findWithFilters(filters) {
    throw new Error('Method not implemented: findWithFilters');
  }

  /**
   * Count users by status
   * @param {string} status - User status
   * @returns {Promise<number>}
   */
  async countByStatus(status) {
    throw new Error('Method not implemented: countByStatus');
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    throw new Error('Method not implemented: emailExists');
  }

  /**
   * Check if ID card exists
   * @param {string} idCard - ID card to check
   * @returns {Promise<boolean>}
   */
  async idCardExists(idCard) {
    throw new Error('Method not implemented: idCardExists');
  }

  /**
   * Find recently registered users
   * @param {number} days - Number of days
   * @returns {Promise<Array<User>>}
   */
  async findRecentlyRegistered(days) {
    throw new Error('Method not implemented: findRecentlyRegistered');
  }
}

module.exports = IUserRepository;
