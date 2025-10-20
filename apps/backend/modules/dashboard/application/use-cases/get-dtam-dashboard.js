/**
 * Get DTAM Dashboard Use Case
 *
 * Aggregates statistics and information for DTAM staff dashboard.
 * Shows system-wide overview, pending tasks, and analytics.
 *
 * Part of Clean Architecture - Application Layer
 */

class GetDTAMDashboardUseCase {
  constructor(
    farmRepository,
    certificateRepository,
    surveyRepository,
    trainingCourseRepository,
    trainingEnrollmentRepository,
    documentRepository,
    auditRepository
  ) {
    this.farmRepository = farmRepository;
    this.certificateRepository = certificateRepository;
    this.surveyRepository = surveyRepository;
    this.trainingCourseRepository = trainingCourseRepository;
    this.trainingEnrollmentRepository = trainingEnrollmentRepository;
    this.documentRepository = documentRepository;
    this.auditRepository = auditRepository;
  }

  async execute(staffId) {
    try {
      // Get all data in parallel
      const [systemStats, pendingTasks, recentActivity, trends] = await Promise.all([
        this._getSystemStats(),
        this._getPendingTasks(),
        this._getRecentActivity(),
        this._getTrends(),
      ]);

      return {
        systemStats,
        pendingTasks,
        recentActivity,
        trends,
        quickStats: this._getQuickStats(systemStats, pendingTasks),
      };
    } catch (error) {
      throw new Error(`Failed to get DTAM dashboard: ${error.message}`);
    }
  }

  async _getSystemStats() {
    const [
      totalFarms,
      totalCertificates,
      totalSurveys,
      totalCourses,
      totalEnrollments,
      totalDocuments,
    ] = await Promise.all([
      this.farmRepository.count(),
      this.certificateRepository.count(),
      this.surveyRepository.count(),
      this.trainingCourseRepository ? this.trainingCourseRepository.count() : Promise.resolve(0),
      this.trainingEnrollmentRepository
        ? this.trainingEnrollmentRepository.count()
        : Promise.resolve(0),
      this.documentRepository ? this.documentRepository.count() : Promise.resolve(0),
    ]);

    return {
      totalFarms,
      totalCertificates,
      totalSurveys,
      totalCourses,
      totalEnrollments,
      totalDocuments,
    };
  }

  async _getPendingTasks() {
    // Get pending certificates for review
    const pendingCertificates = await this.certificateRepository.findByStatus('PENDING');

    // Get pending surveys for review
    const pendingSurveys = await this.surveyRepository.findByStatus('PENDING');

    // Get pending documents for approval
    let pendingDocuments = { total: 0, documents: [] };
    if (this.documentRepository) {
      pendingDocuments = await this.documentRepository.findByStatus('PENDING');
    }

    return {
      certificates: {
        count: pendingCertificates.total,
        items: pendingCertificates.certificates.slice(0, 10).map(c => ({
          id: c.id,
          certificateNumber: c.certificateNumber,
          farmerName: c.farmerName,
          type: c.type,
          submittedAt: c.createdAt,
        })),
      },
      surveys: {
        count: pendingSurveys.total,
        items: pendingSurveys.surveys.slice(0, 10).map(s => ({
          id: s.id,
          farmName: s.farmName,
          surveyDate: s.surveyDate,
          cultivationType: s.cultivationType,
          submittedAt: s.submittedAt,
        })),
      },
      documents: {
        count: pendingDocuments.total,
        items: pendingDocuments.documents
          ? pendingDocuments.documents.slice(0, 10).map(d => ({
              id: d.id,
              name: d.name,
              type: d.type,
              uploadedBy: d.uploadedBy,
              uploadedAt: d.uploadedAt,
            }))
          : [],
      },
      totalPending: pendingCertificates.total + pendingSurveys.total + pendingDocuments.total,
    };
  }

  async _getRecentActivity() {
    // Get recent audit logs if available
    if (!this.auditRepository) {
      return [];
    }

    const result = await this.auditRepository.findWithFilters(
      {},
      { page: 1, limit: 20, sort: { performedAt: -1 } }
    );

    return result.logs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      performedBy: log.performedBy,
      performedAt: log.performedAt,
      description: log.getDescription(),
    }));
  }

  async _getTrends() {
    // Get date ranges
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get this month's stats
    const [thisMonthCerts, thisMonthSurveys, lastMonthCerts, lastMonthSurveys] = await Promise.all([
      this.certificateRepository.count({
        createdAt: { $gte: thisMonth },
      }),
      this.surveyRepository.count({
        createdAt: { $gte: thisMonth },
      }),
      this.certificateRepository.count({
        createdAt: { $gte: lastMonth, $lt: thisMonth },
      }),
      this.surveyRepository.count({
        createdAt: { $gte: lastMonth, $lt: thisMonth },
      }),
    ]);

    return {
      certificates: {
        thisMonth: thisMonthCerts,
        lastMonth: lastMonthCerts,
        change: this._calculateChange(thisMonthCerts, lastMonthCerts),
        trend: thisMonthCerts >= lastMonthCerts ? 'up' : 'down',
      },
      surveys: {
        thisMonth: thisMonthSurveys,
        lastMonth: lastMonthSurveys,
        change: this._calculateChange(thisMonthSurveys, lastMonthSurveys),
        trend: thisMonthSurveys >= lastMonthSurveys ? 'up' : 'down',
      },
    };
  }

  _calculateChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  _getQuickStats(systemStats, pendingTasks) {
    return [
      {
        label: 'รออนุมัติทั้งหมด',
        value: pendingTasks.totalPending,
        icon: 'pending',
        color: 'warning',
        action: '/pending-tasks',
      },
      {
        label: 'ฟาร์มทั้งหมด',
        value: systemStats.totalFarms,
        icon: 'farm',
        color: 'success',
        action: '/farms',
      },
      {
        label: 'ใบรับรองทั้งหมด',
        value: systemStats.totalCertificates,
        icon: 'certificate',
        color: 'primary',
        action: '/certificates',
      },
      {
        label: 'แบบสำรวจทั้งหมด',
        value: systemStats.totalSurveys,
        icon: 'survey',
        color: 'info',
        action: '/surveys',
      },
    ];
  }
}

module.exports = GetDTAMDashboardUseCase;
