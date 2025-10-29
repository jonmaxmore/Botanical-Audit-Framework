/* eslint-disable no-unused-vars */
/**
 * Data Aggregation Service Interface
 *
 * Contract for aggregating data from various modules for reports.
 * Part of Clean Architecture - Domain Layer
 */

class IDataAggregationService {
  /**
   * Get farm summary data
   * @param {string} farmId - Farm ID
   * @param {Object} filters - Date range and other filters
   * @returns {Promise<Object>} - Farm summary data
   */
  async getFarmSummary(farmId, filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get cultivation history data
   * @param {string} farmId - Farm ID
   * @param {Object} filters - Date range and other filters
   * @returns {Promise<Array>} - Cultivation records
   */
  async getCultivationHistory(farmId, filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get certificate status data
   * @param {string} farmerId - Farmer ID
   * @param {Object} filters - Status and date filters
   * @returns {Promise<Array>} - Certificate records
   */
  async getCertificateStatus(farmerId, filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get training progress data
   * @param {string} farmerId - Farmer ID
   * @param {Object} filters - Course and date filters
   * @returns {Promise<Object>} - Training progress data
   */
  async getTrainingProgress(farmerId, filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get document list data
   * @param {string} userId - User ID
   * @param {Object} filters - Type and status filters
   * @returns {Promise<Array>} - Document records
   */
  async getDocumentList(userId, filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get survey results data
   * @param {string} farmId - Farm ID
   * @param {Object} filters - Date range filters
   * @returns {Promise<Array>} - Survey records
   */
  async getSurveyResults(farmId, filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get applications summary
   * @param {Object} filters - Status, date range, and other filters
   * @returns {Promise<Object>} - Applications summary
   */
  async getApplicationsSummary(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get certificates issued data
   * @param {Object} filters - Date range and type filters
   * @returns {Promise<Array>} - Certificate records
   */
  async getCertificatesIssued(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get audit log data
   * @param {Object} filters - User, action, date range filters
   * @returns {Promise<Array>} - Audit log records
   */
  async getAuditLog(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get farmer statistics
   * @param {Object} filters - Date range and status filters
   * @returns {Promise<Object>} - Farmer statistics
   */
  async getFarmerStatistics(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get training statistics
   * @param {Object} filters - Course and date filters
   * @returns {Promise<Object>} - Training statistics
   */
  async getTrainingStatistics(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get system activity data
   * @param {Object} filters - Date range and activity type filters
   * @returns {Promise<Object>} - System activity data
   */
  async getSystemActivity(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get performance dashboard data
   * @param {Object} filters - Date range filters
   * @returns {Promise<Object>} - Performance metrics
   */
  async getPerformanceDashboard(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get compliance report data
   * @param {Object} filters - Date range and compliance type filters
   * @returns {Promise<Object>} - Compliance data
   */
  async getComplianceReport(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get monthly summary data
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>} - Monthly summary
   */
  async getMonthlySummary(_year, _month) {
    throw new Error('Method not implemented');
  }

  /**
   * Get quarterly summary data
   * @param {number} year - Year
   * @param {number} quarter - Quarter (1-4)
   * @returns {Promise<Object>} - Quarterly summary
   */
  async getQuarterlySummary(_year, _quarter) {
    throw new Error('Method not implemented');
  }

  /**
   * Get annual summary data
   * @param {number} year - Year
   * @returns {Promise<Object>} - Annual summary
   */
  async getAnnualSummary(_year) {
    throw new Error('Method not implemented');
  }

  /**
   * Export custom data based on query
   * @param {Object} query - Custom query parameters
   * @returns {Promise<Array>} - Query results
   */
  async exportCustomData(_query) {
    throw new Error('Method not implemented');
  }
}

module.exports = IDataAggregationService;
