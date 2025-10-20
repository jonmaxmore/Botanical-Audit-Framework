/**
 * Download Report Use Case
 *
 * Downloads a completed report file.
 * Validates access and increments download count.
 *
 * Part of Clean Architecture - Application Layer
 */

const fs = require('fs').promises;

class DownloadReportUseCase {
  constructor(reportRepository) {
    this.reportRepository = reportRepository;
  }

  async execute(reportId, userId, userRole) {
    // Find report
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new Error('Report not found');
    }

    // Check access permission
    if (!report.canAccess(userId, userRole)) {
      throw new Error('Access denied to this report');
    }

    // Check if report is completed
    if (!report.isCompleted()) {
      throw new Error('Report is not ready for download yet');
    }

    // Check if report has expired
    if (report.isExpired()) {
      throw new Error('Report has expired and is no longer available');
    }

    // Check if file exists
    if (!report.filePath) {
      throw new Error('Report file not found');
    }

    try {
      // Read file
      const fileBuffer = await fs.readFile(report.filePath);

      // Increment download count
      report.incrementDownloadCount();
      await this.reportRepository.save(report);

      return {
        buffer: fileBuffer,
        fileName: report.fileName,
        mimeType: this._getMimeType(report.format),
        fileSize: report.fileSize,
      };
    } catch (error) {
      throw new Error(`Failed to download report file: ${error.message}`);
    }
  }

  _getMimeType(format) {
    switch (format) {
      case 'PDF':
        return 'application/pdf';
      case 'EXCEL':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'CSV':
        return 'text/csv';
      case 'HTML':
        return 'text/html';
      case 'JSON':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}

module.exports = DownloadReportUseCase;
