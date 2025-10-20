/**
 * List Audit Logs Use Case
 *
 * Business logic for listing audit logs with filters.
 * DTAM staff only.
 *
 * @class ListAuditLogsUseCase
 */

class ListAuditLogsUseCase {
  constructor({ auditLogRepository }) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute({ filters = {}, options = {} }) {
    const auditLogs = await this.auditLogRepository.findWithFilters(filters, options);
    return auditLogs;
  }
}

module.exports = ListAuditLogsUseCase;
