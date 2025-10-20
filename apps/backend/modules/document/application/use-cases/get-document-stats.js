/**
 * Get Document Statistics Use Case
 *
 * Retrieves document statistics for dashboard (DTAM staff).
 * Part of Clean Architecture - Application Layer
 */

class GetDocumentStatisticsUseCase {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(filters = {}) {
    try {
      const statistics = await this.documentRepository.getStatistics(filters);
      return statistics;
    } catch (error) {
      console.error('Error getting document statistics:', error);
      throw error;
    }
  }
}

module.exports = GetDocumentStatisticsUseCase;
