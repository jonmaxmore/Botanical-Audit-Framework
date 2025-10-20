/**
 * ISurveyRepository Interface
 *
 * Repository interface for Survey entity (Dependency Inversion Principle).
 * Defines contract for data persistence operations.
 *
 * @interface ISurveyRepository
 */

class ISurveyRepository {
  /**
   * Find survey by ID
   * @param {string} id - Survey ID
   * @returns {Promise<Survey|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find surveys by farmer ID
   * @param {string} farmerId - Farmer ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array<Survey>>}
   */
  async findByFarmerId(farmerId, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find surveys by farm ID
   * @param {string} farmId - Farm ID
   * @param {Object} options - Query options
   * @returns {Promise<Array<Survey>>}
   */
  async findByFarmId(farmId, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find surveys by status
   * @param {string} status - Survey status
   * @param {Object} options - Query options
   * @returns {Promise<Array<Survey>>}
   */
  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find surveys with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array<Survey>>}
   */
  async findWithFilters(filters, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find surveys by year and period
   * @param {number} year - Survey year
   * @param {string} period - Survey period
   * @param {Object} options - Query options
   * @returns {Promise<Array<Survey>>}
   */
  async findByYearAndPeriod(year, period, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find surveys reviewed by staff member
   * @param {string} staffId - DTAM staff ID
   * @param {Object} options - Query options
   * @returns {Promise<Array<Survey>>}
   */
  async findReviewedByStaff(staffId, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Save survey (create or update)
   * @param {Survey} survey - Survey entity
   * @returns {Promise<Survey>}
   */
  async save(survey) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete survey
   * @param {string} id - Survey ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Count surveys by status
   * @param {string} status - Survey status
   * @returns {Promise<number>}
   */
  async countByStatus(status) {
    throw new Error('Method not implemented');
  }

  /**
   * Count surveys by farmer
   * @param {string} farmerId - Farmer ID
   * @returns {Promise<number>}
   */
  async countByFarmer(farmerId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get survey statistics by purpose
   * @returns {Promise<Array<Object>>}
   */
  async getStatisticsByPurpose() {
    throw new Error('Method not implemented');
  }

  /**
   * Get survey statistics by plant type
   * @returns {Promise<Array<Object>>}
   */
  async getStatisticsByPlantType() {
    throw new Error('Method not implemented');
  }

  /**
   * Get survey statistics by year
   * @param {number} year - Survey year
   * @returns {Promise<Object>}
   */
  async getStatisticsByYear(year) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if survey exists for farm and period
   * @param {string} farmId - Farm ID
   * @param {number} year - Survey year
   * @param {string} period - Survey period
   * @param {string} excludeId - Survey ID to exclude
   * @returns {Promise<boolean>}
   */
  async surveyExistsForPeriod(farmId, year, period, excludeId = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Find recently submitted surveys
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array<Survey>>}
   */
  async findRecentlySubmitted(limit = 10) {
    throw new Error('Method not implemented');
  }

  /**
   * Find surveys requiring attention (pending/under review)
   * @returns {Promise<Array<Survey>>}
   */
  async findRequiringAttention() {
    throw new Error('Method not implemented');
  }
}

module.exports = ISurveyRepository;
