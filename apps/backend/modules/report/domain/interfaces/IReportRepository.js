/**
 * Report Repository Interface
 *
 * Contract for report persistence operations.
 * Follows Dependency Inversion Principle.
 * Part of Clean Architecture - Domain Layer
 */

class IReportRepository {
  /**
   * Save a report
   * @param {Report} report - Report entity to save
   * @returns {Promise<Report>}
   */
  async save(report) {
    throw new Error('Method not implemented');
  }

  /**
   * Find report by ID
   * @param {string} id - Report ID
   * @returns {Promise<Report|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find reports by requester
   * @param {string} requesterId - User ID who requested the report
   * @param {Object} filters - Additional filters (type, status, format)
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{reports: Report[], total: number}>}
   */
  async findByRequester(requesterId, filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find reports by status
   * @param {string} status - Report status
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{reports: Report[], total: number}>}
   */
  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find reports by type
   * @param {string} type - Report type
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{reports: Report[], total: number}>}
   */
  async findByType(type, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find reports by category
   * @param {string} category - Report category
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{reports: Report[], total: number}>}
   */
  async findByCategory(category, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find reports with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{reports: Report[], total: number}>}
   */
  async findWithFilters(filters, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find pending reports
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{reports: Report[], total: number}>}
   */
  async findPending(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find scheduled reports due for generation
   * @returns {Promise<Report[]>}
   */
  async findDueReports() {
    throw new Error('Method not implemented');
  }

  /**
   * Find expired reports
   * @param {Object} options - Pagination options
   * @returns {Promise<Report[]>}
   */
  async findExpired(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find failed reports that can be retried
   * @returns {Promise<Report[]>}
   */
  async findRetryable() {
    throw new Error('Method not implemented');
  }

  /**
   * Count reports matching criteria
   * @param {Object} criteria - Filter criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Count reports by requester
   * @param {string} requesterId - User ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<number>}
   */
  async countByRequester(requesterId, filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Mark expired reports
   * @returns {Promise<number>} - Number of reports marked as expired
   */
  async markExpired() {
    throw new Error('Method not implemented');
  }

  /**
   * Get report statistics
   * @param {Object} filters - Filter criteria (dateRange, type, category)
   * @returns {Promise<Object>} - Statistics object
   */
  async getStatistics(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a report
   * @param {string} id - Report ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete old completed reports
   * @param {number} daysOld - Delete reports older than this many days
   * @returns {Promise<number>} - Number of reports deleted
   */
  async deleteOldReports(daysOld = 30) {
    throw new Error('Method not implemented');
  }

  /**
   * Search reports by text
   * @param {string} searchText - Search query
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{reports: Report[], total: number}>}
   */
  async searchReports(searchText, options = {}) {
    throw new Error('Method not implemented');
  }
}

module.exports = IReportRepository;
