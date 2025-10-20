/**
 * Get System Statistics Use Case
 *
 * Provides detailed system-wide statistics for DTAM administrators.
 * Includes comprehensive analytics across all modules.
 *
 * Part of Clean Architecture - Application Layer
 */

class GetSystemStatisticsUseCase {
  constructor(
    farmRepository,
    certificateRepository,
    surveyRepository,
    trainingCourseRepository,
    trainingEnrollmentRepository,
    documentRepository,
    notificationRepository,
    auditRepository,
  ) {
    this.farmRepository = farmRepository;
    this.certificateRepository = certificateRepository;
    this.surveyRepository = surveyRepository;
    this.trainingCourseRepository = trainingCourseRepository;
    this.trainingEnrollmentRepository = trainingEnrollmentRepository;
    this.documentRepository = documentRepository;
    this.notificationRepository = notificationRepository;
    this.auditRepository = auditRepository;
  }

  async execute(filters = {}) {
    try {
      const [
        farmsStats,
        certificatesStats,
        surveysStats,
        trainingStats,
        documentsStats,
        activityStats,
      ] = await Promise.all([
        this._getFarmsStatistics(filters),
        this._getCertificatesStatistics(filters),
        this._getSurveysStatistics(filters),
        this._getTrainingStatistics(filters),
        this._getDocumentsStatistics(filters),
        this._getActivityStatistics(filters),
      ]);

      return {
        farms: farmsStats,
        certificates: certificatesStats,
        surveys: surveysStats,
        training: trainingStats,
        documents: documentsStats,
        activity: activityStats,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to get system statistics: ${error.message}`);
    }
  }

  async _getFarmsStatistics(filters) {
    const total = await this.farmRepository.count(filters);

    // Get all farms to analyze
    const farms = await this.farmRepository.findWithFilters(filters, { page: 1, limit: 10000 });

    // Calculate area statistics
    const totalArea = farms.farms.reduce((sum, f) => sum + (f.area || 0), 0);
    const averageArea = farms.total > 0 ? totalArea / farms.total : 0;

    return {
      total,
      totalArea: Math.round(totalArea),
      averageArea: Math.round(averageArea),
      byStatus: this._countByField(farms.farms, 'status'),
    };
  }

  async _getCertificatesStatistics(filters) {
    const total = await this.certificateRepository.count(filters);

    // Get certificates for analysis
    const certificates = await this.certificateRepository.findWithFilters(filters, {
      page: 1,
      limit: 10000,
    });

    const active = certificates.certificates.filter(c => c.isActive()).length;
    const expired = certificates.certificates.filter(c => c.isExpired()).length;
    const expiringSoon = certificates.certificates.filter(c => {
      const days = c.getDaysUntilExpiry();
      return days > 0 && days <= 30;
    }).length;

    return {
      total,
      active,
      expired,
      expiringSoon,
      byType: this._countByField(certificates.certificates, 'type'),
      byStatus: this._countByField(certificates.certificates, 'status'),
    };
  }

  async _getSurveysStatistics(filters) {
    const total = await this.surveyRepository.count(filters);

    // Get surveys for analysis
    const surveys = await this.surveyRepository.findWithFilters(filters, { page: 1, limit: 10000 });

    const completed = surveys.surveys.filter(s => s.isCompleted()).length;
    const pending = surveys.surveys.filter(s => s.isPending()).length;

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byStatus: this._countByField(surveys.surveys, 'status'),
      byCultivationType: this._countByField(surveys.surveys, 'cultivationType'),
    };
  }

  async _getTrainingStatistics(filters) {
    if (!this.trainingCourseRepository || !this.trainingEnrollmentRepository) {
      return {
        totalCourses: 0,
        totalEnrollments: 0,
        completed: 0,
        active: 0,
        completionRate: 0,
      };
    }

    const [totalCourses, totalEnrollments] = await Promise.all([
      this.trainingCourseRepository.count(filters),
      this.trainingEnrollmentRepository.count(filters),
    ]);

    // Get enrollments for analysis
    const enrollments = await this.trainingEnrollmentRepository.findWithFilters(filters, {
      page: 1,
      limit: 10000,
    });

    const completed = enrollments.enrollments.filter(e => e.isCompleted()).length;
    const active = enrollments.enrollments.filter(e => e.isActive()).length;

    return {
      totalCourses,
      totalEnrollments,
      completed,
      active,
      completionRate: totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0,
      byStatus: this._countByField(enrollments.enrollments, 'status'),
    };
  }

  async _getDocumentsStatistics(filters) {
    if (!this.documentRepository) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        totalSize: 0,
      };
    }

    const total = await this.documentRepository.count(filters);

    // Get documents for analysis
    const documents = await this.documentRepository.findWithFilters(filters, {
      page: 1,
      limit: 10000,
    });

    const approved = documents.documents.filter(d => d.isApproved()).length;
    const pending = documents.documents.filter(d => d.isPending()).length;
    const rejected = documents.documents.filter(d => d.isRejected()).length;
    const totalSize = documents.documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);

    return {
      total,
      approved,
      pending,
      rejected,
      totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024),
      byType: this._countByField(documents.documents, 'type'),
      byStatus: this._countByField(documents.documents, 'status'),
    };
  }

  async _getActivityStatistics(filters) {
    if (!this.auditRepository) {
      return {
        totalActions: 0,
        byAction: {},
        byUser: {},
      };
    }

    const result = await this.auditRepository.findWithFilters(filters, { page: 1, limit: 10000 });

    return {
      totalActions: result.total,
      byAction: this._countByField(result.logs, 'action'),
      byEntityType: this._countByField(result.logs, 'entityType'),
    };
  }

  _countByField(items, field) {
    return items.reduce((acc, item) => {
      const value = item[field] || 'Unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = GetSystemStatisticsUseCase;
