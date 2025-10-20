/**
 * Enrollment Repository Interface
 *
 * Defines the contract for Enrollment data persistence.
 * Part of Clean Architecture - Domain Layer (Dependency Inversion Principle)
 *
 * Implementation: Infrastructure/database/MongoDBEnrollmentRepository.js
 */

class IEnrollmentRepository {
  /**
   * Save a new enrollment or update existing
   * @param {Enrollment} enrollment - Enrollment entity
   * @returns {Promise<Enrollment>} Saved enrollment
   */
  async save(enrollment) {
    throw new Error('Method not implemented');
  }

  /**
   * Find enrollment by ID
   * @param {string} id - Enrollment ID
   * @returns {Promise<Enrollment|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find enrollment by farmer and course
   * @param {string} farmerId - Farmer ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Enrollment|null>}
   */
  async findByFarmerAndCourse(farmerId, courseId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find enrollments by farmer ID
   * @param {string} farmerId - Farmer ID
   * @param {Object} filters - Status and other filters
   * @param {Object} options - Pagination options
   * @returns {Promise<{enrollments: Enrollment[], total: number, page: number, limit: number}>}
   */
  async findByFarmerId(farmerId, filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find enrollments by course ID
   * @param {string} courseId - Course ID
   * @param {Object} filters - Status and other filters
   * @param {Object} options - Pagination options
   * @returns {Promise<{enrollments: Enrollment[], total: number, page: number, limit: number}>}
   */
  async findByCourseId(courseId, filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find enrollments by status
   * @param {string} status - Enrollment status
   * @param {Object} options - Pagination options
   * @returns {Promise<{enrollments: Enrollment[], total: number, page: number, limit: number}>}
   */
  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find active enrollments by farmer
   * @param {string} farmerId - Farmer ID
   * @returns {Promise<Enrollment[]>}
   */
  async findActiveCyFarmer(farmerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find completed enrollments by farmer
   * @param {string} farmerId - Farmer ID
   * @returns {Promise<Enrollment[]>}
   */
  async findCompletedByFarmer(farmerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find enrollments expiring soon
   * @param {number} daysThreshold - Number of days before expiry
   * @returns {Promise<Enrollment[]>}
   */
  async findExpiringSoon(daysThreshold = 7) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if farmer is enrolled in course
   * @param {string} farmerId - Farmer ID
   * @param {string} courseId - Course ID
   * @returns {Promise<boolean>}
   */
  async isEnrolled(farmerId, courseId) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if farmer has completed course
   * @param {string} farmerId - Farmer ID
   * @param {string} courseId - Course ID
   * @returns {Promise<boolean>}
   */
  async hasCompleted(farmerId, courseId) {
    throw new Error('Method not implemented');
  }

  /**
   * Count enrollments by criteria
   * @param {Object} criteria - Count criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get enrollment statistics
   * @param {Object} filters - Filter criteria (courseId, farmerId, dateRange)
   * @returns {Promise<Object>}
   */
  async getStatistics(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get farmer progress summary
   * @param {string} farmerId - Farmer ID
   * @returns {Promise<Object>}
   */
  async getFarmerProgressSummary(farmerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get course enrollment summary
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>}
   */
  async getCourseEnrollmentSummary(courseId) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete enrollment
   * @param {string} id - Enrollment ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = IEnrollmentRepository;
