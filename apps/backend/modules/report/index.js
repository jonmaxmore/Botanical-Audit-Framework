/**
 * Report Module Index
 *
 * Main entry point for the Report Module.
 * Exports container, helper, and key entities.
 */

const { getReportModuleContainer } = require('./integration/container');
const ReportHelper = require('./integration/ReportHelper');
const Report = require('./domain/entities/Report');

module.exports = {
  // Main container (for app.js)
  getReportModuleContainer,

  // Helper for other modules
  ReportHelper,

  // Domain entities
  Report,

  // Constants
  ReportTypes: Report.TYPE,
  ReportFormats: Report.FORMAT,
  ReportStatuses: Report.STATUS,
  ReportCategories: Report.CATEGORY,
  ReportSchedules: Report.SCHEDULE
};
