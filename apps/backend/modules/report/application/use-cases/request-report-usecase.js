/**
 * Request Report Use Case
 *
 * Creates a new report request.
 * Validates parameters and schedules report generation.
 *
 * Part of Clean Architecture - Application Layer
 */

const Report = require('../../domain/entities/Report');

class RequestReportUseCase {
  constructor(reportRepository) {
    this.reportRepository = reportRepository;
  }

  async execute(reportData) {
    // Validate required fields
    this._validateReportData(reportData);

    // Create report entity
    const report = Report.create({
      title: reportData.title,
      description: reportData.description,
      type: reportData.type,
      format: reportData.format,
      requestedBy: reportData.requestedBy,
      requestedByType: reportData.requestedByType,
      parameters: reportData.parameters || {},
      filters: reportData.filters || {},
      columns: reportData.columns || [],
      sortBy: reportData.sortBy,
      sortOrder: reportData.sortOrder,
      schedule: reportData.schedule || Report.SCHEDULE.ONCE,
      scheduledAt: reportData.scheduledAt,
      isPublic: reportData.isPublic || false,
      sharedWith: reportData.sharedWith || [],
      tags: reportData.tags || [],
      metadata: reportData.metadata || {},
      status: Report.STATUS.PENDING
    });

    // Set next run for scheduled reports
    if (report.isScheduled() && !report.nextRunAt) {
      report.scheduleNext();
    }

    // Save report
    const savedReport = await this.reportRepository.save(report);

    return savedReport;
  }

  _validateReportData(data) {
    if (!data.title) {
      throw new Error('Report title is required');
    }

    if (!data.type) {
      throw new Error('Report type is required');
    }

    if (!Object.values(Report.TYPE).includes(data.type)) {
      throw new Error(`Invalid report type: ${data.type}`);
    }

    if (!data.format) {
      throw new Error('Report format is required');
    }

    if (!Object.values(Report.FORMAT).includes(data.format)) {
      throw new Error(`Invalid report format: ${data.format}`);
    }

    if (!data.requestedBy) {
      throw new Error('Requester ID is required');
    }

    // Validate type-specific required parameters
    this._validateTypeParameters(data.type, data.parameters);
  }

  _validateTypeParameters(type, parameters) {
    switch (type) {
      case Report.TYPE.FARM_SUMMARY:
      case Report.TYPE.CULTIVATION_HISTORY:
      case Report.TYPE.SURVEY_RESULTS:
        if (!parameters?.farmId) {
          throw new Error(`${type} requires farmId parameter`);
        }
        break;

      case Report.TYPE.CERTIFICATE_STATUS:
      case Report.TYPE.TRAINING_PROGRESS:
        if (!parameters?.farmerId) {
          throw new Error(`${type} requires farmerId parameter`);
        }
        break;

      case Report.TYPE.DOCUMENT_LIST:
        if (!parameters?.userId) {
          throw new Error(`${type} requires userId parameter`);
        }
        break;

      case Report.TYPE.MONTHLY_SUMMARY:
        if (!parameters?.year || !parameters?.month) {
          throw new Error(`${type} requires year and month parameters`);
        }
        break;

      case Report.TYPE.QUARTERLY_SUMMARY:
        if (!parameters?.year || !parameters?.quarter) {
          throw new Error(`${type} requires year and quarter parameters`);
        }
        break;

      case Report.TYPE.ANNUAL_SUMMARY:
        if (!parameters?.year) {
          throw new Error(`${type} requires year parameter`);
        }
        break;
    }
  }
}

module.exports = RequestReportUseCase;
