/**
 * Get Audit Log Details Use Case
 *
 * Business logic for retrieving a single audit log entry.
 * DTAM staff only.
 *
 * @class GetAuditLogDetailsUseCase
 */

class GetAuditLogDetailsUseCase {
  constructor({ auditLogRepository }) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute({ auditLogId }) {
    const auditLog = await this.auditLogRepository.findById(auditLogId);

    if (!auditLog) {
      throw new Error('Audit log not found');
    }

    return auditLog;
  }
}

module.exports = GetAuditLogDetailsUseCase;
