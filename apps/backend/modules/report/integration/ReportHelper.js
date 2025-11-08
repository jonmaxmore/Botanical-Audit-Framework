/**
 * Report Module Helper
 *
 * Utility functions for report operations from other modules.
 * Part of Clean Architecture - Integration Layer
 */

const { getReportModuleContainer } = require('./container');
const Report = require('../domain/entities/Report');

class ReportHelper {
  static getContainer() {
    return getReportModuleContainer();
  }

  /**
   * Request a new report
   */
  static async requestReport(reportData) {
    const container = this.getContainer();
    const requestUseCase = container.getRequestReportUseCase();

    return await requestUseCase.execute(reportData);
  }

  /**
   * Generate a report
   */
  static async generateReport(reportId) {
    const container = this.getContainer();
    const generateUseCase = container.getGenerateReportUseCase();

    return await generateUseCase.execute(reportId);
  }

  /**
   * Get a report
   */
  static async getReport(reportId, userId, userRole) {
    const container = this.getContainer();
    const getUseCase = container.getGetReportUseCase();

    return await getUseCase.execute(reportId, userId, userRole);
  }

  /**
   * Download a report
   */
  static async downloadReport(reportId, userId, userRole) {
    const container = this.getContainer();
    const downloadUseCase = container.getDownloadReportUseCase();

    return await downloadUseCase.execute(reportId, userId, userRole);
  }

  /**
   * List reports
   */
  static async listReports(filters, userId, userRole, page = 1, limit = 20) {
    const container = this.getContainer();
    const listUseCase = container.getListReportsUseCase();

    return await listUseCase.execute(filters, userId, userRole, page, limit);
  }

  /**
   * Delete a report
   */
  static async deleteReport(reportId, userId, userRole) {
    const container = this.getContainer();
    const deleteUseCase = container.getDeleteReportUseCase();

    return await deleteUseCase.execute(reportId, userId, userRole);
  }

  /**
   * Get report statistics
   */
  static async getReportStatistics(filters = {}) {
    const container = this.getContainer();
    const statsUseCase = container.getGetReportStatisticsUseCase();

    return await statsUseCase.execute(filters);
  }

  /**
   * Process scheduled reports (for cron job)
   */
  static async processScheduledReports() {
    const container = this.getContainer();
    const processUseCase = container.getProcessScheduledReportsUseCase();

    return await processUseCase.execute();
  }

  /**
   * Retry a failed report
   */
  static async retryFailedReport(reportId) {
    const container = this.getContainer();
    const retryUseCase = container.getRetryFailedReportUseCase();

    return await retryUseCase.execute(reportId);
  }

  /**
   * Request farm summary report
   */
  static async requestFarmSummary(farmId, format = 'PDF', userId, userType = 'farmer') {
    return await this.requestReport({
      title: 'Farm Summary Report',
      description: 'Summary of farm information and statistics',
      type: Report.TYPE.FARM_SUMMARY,
      format: format,
      requestedBy: userId,
      requestedByType: userType,
      parameters: { farmId },
      schedule: Report.SCHEDULE.ONCE,
    });
  }

  /**
   * Request certificate status report
   */
  static async requestCertificateStatus(farmerId, format = 'PDF', userId, userType = 'farmer') {
    return await this.requestReport({
      title: 'Certificate Status Report',
      description: 'Status of all certificates',
      type: Report.TYPE.CERTIFICATE_STATUS,
      format: format,
      requestedBy: userId,
      requestedByType: userType,
      parameters: { farmerId },
      schedule: Report.SCHEDULE.ONCE,
    });
  }

  /**
   * Request training progress report
   */
  static async requestTrainingProgress(farmerId, format = 'PDF', userId, userType = 'farmer') {
    return await this.requestReport({
      title: 'Training Progress Report',
      description: 'Training courses and progress',
      type: Report.TYPE.TRAINING_PROGRESS,
      format: format,
      requestedBy: userId,
      requestedByType: userType,
      parameters: { farmerId },
      schedule: Report.SCHEDULE.ONCE,
    });
  }

  /**
   * Request monthly summary report (DTAM)
   */
  static async requestMonthlySummary(year, month, format = 'PDF', userId) {
    return await this.requestReport({
      title: `Monthly Summary Report - ${year}/${month}`,
      description: 'Monthly system statistics and summary',
      type: Report.TYPE.MONTHLY_SUMMARY,
      format: format,
      requestedBy: userId,
      requestedByType: 'dtam',
      parameters: { year, month },
      schedule: Report.SCHEDULE.ONCE,
    });
  }

  /**
   * Request audit log report (DTAM)
   */
  static async requestAuditLog(filters, format = 'EXCEL', userId) {
    return await this.requestReport({
      title: 'Audit Log Report',
      description: 'System audit trail',
      type: Report.TYPE.AUDIT_LOG,
      format: format,
      requestedBy: userId,
      requestedByType: 'dtam',
      filters: filters,
      schedule: Report.SCHEDULE.ONCE,
    });
  }

  /**
   * Get report types
   */
  static getReportTypes() {
    return Report.TYPE;
  }

  /**
   * Get report formats
   */
  static getReportFormats() {
    return Report.FORMAT;
  }

  /**
   * Get report statuses
   */
  static getReportStatuses() {
    return Report.STATUS;
  }

  /**
   * Get report categories
   */
  static getReportCategories() {
    return Report.CATEGORY;
  }

  /**
   * Get report schedules
   */
  static getReportSchedules() {
    return Report.SCHEDULE;
  }
}

module.exports = ReportHelper;
