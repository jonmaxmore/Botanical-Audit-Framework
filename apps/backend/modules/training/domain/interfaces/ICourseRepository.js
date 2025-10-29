/* eslint-disable no-unused-vars */
/**
 * Course Repository Interface
 *
 * Defines the contract for Course data persistence.
 * Part of Clean Architecture - Domain Layer (Dependency Inversion Principle)
 *
 * Implementation: Infrastructure/database/MongoDECourseRepository.js
 */

class ICourseRepository {
  /**
   * Save a new course or update existing
   * @param {Course} course - Course entity
   * @returns {Promise<Course>} Saved course
   */
  async save(_course) {
    throw new Error('Method not implemented');
  }

  /**
   * Find course by ID
   * @param {string} id - Course ID
   * @returns {Promise<Course|null>}
   */
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find course by code
   * @param {string} code - Unique course code
   * @returns {Promise<Course|null>}
   */
  async findByCode(_code) {
    throw new Error('Method not implemented');
  }

  /**
   * Find courses by status
   * @param {string} status - Course status (DRAFT, PUBLISHED, ARCHIVED)
   * @param {Object} options - Pagination options
   * @returns {Promise<{courses: Course[], total: number, page: number, limit: number}>}
   */
  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find courses by type
   * @param {string} type - Course type (MANDATORY, OPTIONAL, ADVANCED, REFRESHER)
   * @param {Object} options - Pagination options
   * @returns {Promise<{courses: Course[], total: number, page: number, limit: number}>}
   */
  async findByType(type, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find published courses available for enrollment
   * @param {Object} filters - Search filters (type, level, tags)
   * @param {Object} options - Pagination and sorting
   * @returns {Promise<{courses: Course[], total: number, page: number, limit: number}>}
   */
  async findAvailableForEnrollment(filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Search courses by text
   * @param {string} searchText - Text to search in title/description
   * @param {Object} filters - Additional filters
   * @param {Object} options - Pagination options
   * @returns {Promise<{courses: Course[], total: number, page: number, limit: number}>}
   */
  async search(searchText, filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find courses with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting
   * @returns {Promise<{courses: Course[], total: number, page: number, limit: number}>}
   */
  async findWithFilters(filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get mandatory courses
   * @returns {Promise<Course[]>}
   */
  async getMandatoryCourses() {
    throw new Error('Method not implemented');
  }

  /**
   * Get courses by IDs
   * @param {string[]} courseIds - Array of course IDs
   * @returns {Promise<Course[]>}
   */
  async findByIds(_courseIds) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if course code exists
   * @param {string} code - Course code
   * @param {string} excludeId - Exclude this course ID (for updates)
   * @returns {Promise<boolean>}
   */
  async codeExists(code, excludeId = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Count courses by criteria
   * @param {Object} criteria - Count criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get course statistics
   * @returns {Promise<Object>}
   */
  async getStatistics() {
    throw new Error('Method not implemented');
  }

  /**
   * Delete course
   * @param {string} id - Course ID
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method not implemented');
  }
}

module.exports = ICourseRepository;
