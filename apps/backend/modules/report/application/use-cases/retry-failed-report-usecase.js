/**
 * Retry Failed Report Use Case
 *
 * Retries generation of a failed report.
 * Checks retry count limit.
 *
 * Part of Clean Architecture - Application Layer
 */

class RetryFailedReportUseCase {
  constructor(reportRepository, generateReportUseCase) {
    this.reportRepository = reportRepository;
    this.generateReportUseCase = generateReportUseCase;
  }

  async execute(reportId) {
    // Find report
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new Error('Report not found');
    }

    // Check if report can be retried
    if (!report.canRetry()) {
      throw new Error('Report cannot be retried (max retries reached or not in failed state)');
    }

    // Reset for retry
    report.resetForRetry();
    await this.reportRepository.save(report);

    // Generate report
    return await this.generateReportUseCase.execute(reportId);
  }
}

module.exports = RetryFailedReportUseCase;
