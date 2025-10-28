/**
 * Process Scheduled Reports Use Case
 *
 * Processes scheduled reports that are due for generation.
 * Typically run by a cron job or background worker.
 *
 * Part of Clean Architecture - Application Layer
 */

class ProcessScheduledReportsUseCase {
  constructor(reportRepository, generateReportUseCase) {
    this.reportRepository = reportRepository;
    this.generateReportUseCase = generateReportUseCase;
  }

  async execute() {
    // Find reports that are due for generation
    const dueReports = await this.reportRepository.findDueReports();

    const results = {
      total: dueReports.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // Process each report
    for (const report of dueReports) {
      try {
        await this.generateReportUseCase.execute(report.id);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          reportId: report.id,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = ProcessScheduledReportsUseCase;
