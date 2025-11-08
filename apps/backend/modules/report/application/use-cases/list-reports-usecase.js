/**
 * List Reports Use Case
 *
 * Lists reports with filters and pagination.
 * Applies access control based on user role.
 *
 * Part of Clean Architecture - Application Layer
 */

class ListReportsUseCase {
  constructor(reportRepository) {
    this.reportRepository = reportRepository;
  }

  async execute(filters, userId, userRole, page = 1, limit = 20) {
    // Apply access control filters
    const accessFilters = this._applyAccessControl(filters, userId, userRole);

    // Get reports with pagination
    const result = await this.reportRepository.findWithFilters(accessFilters, {
      page,
      limit,
      sort: { createdAt: -1 }
    });

    return {
      reports: result.reports,
      total: result.total,
      page,
      limit
    };
  }

  _applyAccessControl(filters, userId, userRole) {
    // DTAM staff can see all reports
    if (userRole === 'dtam' || userRole === 'admin') {
      return filters;
    }

    // Farmers can only see their own reports or public reports
    return {
      ...filters,
      $or: [{ requestedBy: userId }, { isPublic: true }, { sharedWith: userId }]
    };
  }
}

module.exports = ListReportsUseCase;
