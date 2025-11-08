/**
 * Generate Report Use Case
 *
 * Orchestrates report generation process:
 * 1. Aggregate data from various sources
 * 2. Generate report in requested format
 * 3. Save report file
 * 4. Update report status
 *
 * Part of Clean Architecture - Application Layer
 */

const Report = require('../../domain/entities/Report');

class GenerateReportUseCase {
  constructor(reportRepository, dataAggregationService, reportGeneratorService) {
    this.reportRepository = reportRepository;
    this.dataAggregationService = dataAggregationService;
    this.reportGeneratorService = reportGeneratorService;
  }

  async execute(reportId) {
    // Get report
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check if already generating
    if (report.isGenerating()) {
      throw new Error('Report is already being generated');
    }

    // Check if already completed
    if (report.isCompleted() && !report.isExpired()) {
      return report; // Return existing report
    }

    try {
      // Mark as generating
      report.startGeneration();
      await this.reportRepository.save(report);

      // Aggregate data based on report type
      const data = await this._aggregateData(report);

      // Generate report in requested format
      const content = await this.reportGeneratorService.generate(report.format, data, {
        title: report.title,
        parameters: report.parameters,
        filters: report.filters,
      });

      // Save to file
      const fileName = this._generateFileName(report);
      const { filePath, fileSize } = await this.reportGeneratorService.saveToFile(
        content,
        fileName,
        report.format,
      );

      // Update report with file information
      report.completeGeneration(filePath, fileSize, fileName);

      // Update schedule if recurring
      if (report.isScheduled()) {
        report.scheduleNext();
      }

      // Save updated report
      await this.reportRepository.save(report);

      return report;
    } catch (error) {
      // Mark as failed
      report.failGeneration(error.message);
      await this.reportRepository.save(report);
      throw error;
    }
  }

  async _aggregateData(report) {
    const { type, parameters, filters } = report;

    switch (type) {
      // Farmer Reports
      case Report.TYPE.FARM_SUMMARY:
        return await this.dataAggregationService.getFarmSummary(parameters.farmId, filters);

      case Report.TYPE.CULTIVATION_HISTORY:
        return await this.dataAggregationService.getCultivationHistory(parameters.farmId, filters);

      case Report.TYPE.CERTIFICATE_STATUS:
        return await this.dataAggregationService.getCertificateStatus(parameters.farmerId, filters);

      case Report.TYPE.TRAINING_PROGRESS:
        return await this.dataAggregationService.getTrainingProgress(parameters.farmerId, filters);

      case Report.TYPE.DOCUMENT_LIST:
        return await this.dataAggregationService.getDocumentList(parameters.userId, filters);

      case Report.TYPE.SURVEY_RESULTS:
        return await this.dataAggregationService.getSurveyResults(parameters.farmId, filters);

      // DTAM Reports
      case Report.TYPE.APPLICATIONS_SUMMARY:
        return await this.dataAggregationService.getApplicationsSummary(filters);

      case Report.TYPE.CERTIFICATES_ISSUED:
        return await this.dataAggregationService.getCertificatesIssued(filters);

      case Report.TYPE.AUDIT_LOG:
        return await this.dataAggregationService.getAuditLog(filters);

      case Report.TYPE.FARMER_STATISTICS:
        return await this.dataAggregationService.getFarmerStatistics(filters);

      case Report.TYPE.TRAINING_STATISTICS:
        return await this.dataAggregationService.getTrainingStatistics(filters);

      case Report.TYPE.SYSTEM_ACTIVITY:
        return await this.dataAggregationService.getSystemActivity(filters);

      // Analytics Reports
      case Report.TYPE.PERFORMANCE_DASHBOARD:
        return await this.dataAggregationService.getPerformanceDashboard(filters);

      case Report.TYPE.COMPLIANCE_REPORT:
        return await this.dataAggregationService.getComplianceReport(filters);

      case Report.TYPE.MONTHLY_SUMMARY:
        return await this.dataAggregationService.getMonthlySummary(
          parameters.year,
          parameters.month,
        );

      case Report.TYPE.QUARTERLY_SUMMARY:
        return await this.dataAggregationService.getQuarterlySummary(
          parameters.year,
          parameters.quarter,
        );

      case Report.TYPE.ANNUAL_SUMMARY:
        return await this.dataAggregationService.getAnnualSummary(parameters.year);

      // Export Reports
      case Report.TYPE.DATA_EXPORT:
      case Report.TYPE.CUSTOM_REPORT:
        return await this.dataAggregationService.exportCustomData(parameters);

      default:
        throw new Error(`Unsupported report type: ${type}`);
    }
  }

  _generateFileName(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = this._getFileExtension(report.format);
    const typeName = report.type.toLowerCase().replace(/_/g, '-');

    return `${typeName}-${timestamp}.${extension}`;
  }

  _getFileExtension(format) {
    switch (format) {
      case Report.FORMAT.PDF:
        return 'pdf';
      case Report.FORMAT.EXCEL:
        return 'xlsx';
      case Report.FORMAT.CSV:
        return 'csv';
      case Report.FORMAT.HTML:
        return 'html';
      case Report.FORMAT.JSON:
        return 'json';
      default:
        return 'txt';
    }
  }
}

module.exports = GenerateReportUseCase;
