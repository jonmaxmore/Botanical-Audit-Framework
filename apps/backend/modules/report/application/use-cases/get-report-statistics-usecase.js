/**
 * Get Report Statistics Use Case
 *
 * Retrieves statistics about reports.
 * DTAM only.
 *
 * Part of Clean Architecture - Application Layer
 */

class GetReportStatisticsUseCase {
  constructor(reportRepository) {
    this.reportRepository = reportRepository;
  }

  async execute(filters = {}) {
    const statistics = await this.reportRepository.getStatistics(filters);
    return statistics;
  }
}

module.exports = GetReportStatisticsUseCase;
