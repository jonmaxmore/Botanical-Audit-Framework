/**
 * Get User Activity Use Case
 *
 * Business logic for retrieving user activity history.
 * DTAM staff only.
 *
 * @class GetUserActivityUseCase
 */

class GetUserActivityUseCase {
  constructor({ auditLogRepository }) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute({ actorId, startDate, endDate }) {
    const activity = await this.auditLogRepository.getActivitySummary(actorId, startDate, endDate);

    return activity;
  }
}

module.exports = GetUserActivityUseCase;
