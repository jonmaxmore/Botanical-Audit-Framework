/**
 * Get Report Use Case
 *
 * Retrieves a report with access control validation.
 * Increments view count if report is completed.
 *
 * Part of Clean Architecture - Application Layer
 */

class GetReportUseCase {
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

    // Increment view count if completed
    if (report.isCompleted()) {
      report.incrementViewCount();
      await this.reportRepository.save(report);
    }

    return report;
  }
}

module.exports = GetReportUseCase;
