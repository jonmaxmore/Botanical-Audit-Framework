/**
 * Get Audit Statistics Use Case
 *
 * Business logic for retrieving audit statistics.
 * DTAM staff only.
 *
 * @class GetAuditStatisticsUseCase
 */

class GetAuditStatisticsUseCase {
  constructor({ auditLogRepository }) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute({ filters = {} }) {
    const statistics = await this.auditLogRepository.getStatistics(filters);
    return statistics;
  }
}

module.exports = GetAuditStatisticsUseCase;
