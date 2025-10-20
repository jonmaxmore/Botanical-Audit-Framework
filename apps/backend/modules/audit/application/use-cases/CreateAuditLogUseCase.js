/**
 * Create Audit Log Use Case
 *
 * Business logic for creating audit log entries.
 *
 * @class CreateAuditLogUseCase
 */

class CreateAuditLogUseCase {
  constructor({ auditLogRepository }) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute(auditLogData) {
    // Save audit log (no validation needed - audit logs record everything)
    const auditLog = await this.auditLogRepository.save(auditLogData);
    return auditLog;
  }
}

module.exports = CreateAuditLogUseCase;
