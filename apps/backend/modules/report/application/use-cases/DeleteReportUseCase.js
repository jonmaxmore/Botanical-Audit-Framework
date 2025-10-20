/**
 * Delete Report Use Case
 *
 * Deletes a report and its associated file.
 * Only owner or admin can delete reports.
 *
 * Part of Clean Architecture - Application Layer
 */

class DeleteReportUseCase {
  constructor(reportRepository, reportGeneratorService) {
    this.reportRepository = reportRepository;
    this.reportGeneratorService = reportGeneratorService;
  }

  async execute(reportId, userId, userRole) {
    // Find report
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new Error('Report not found');
    }

    // Check ownership (only owner or admin can delete)
    if (report.requestedBy !== userId && userRole !== 'admin' && userRole !== 'dtam') {
      throw new Error('Only the report owner or admin can delete this report');
    }

    // Delete file if exists
    if (report.filePath) {
      try {
        await this.reportGeneratorService.deleteFile(report.filePath);
      } catch (error) {
        // Log error but continue with database deletion
        console.error('Failed to delete report file:', error);
      }
    }

    // Delete from database
    await this.reportRepository.delete(reportId);

    return { success: true, message: 'Report deleted successfully' };
  }
}

module.exports = DeleteReportUseCase;
