/**
 * Simple Data Aggregation Service
 *
 * Aggregates data from various modules for reports.
 * Simplified implementation - connects to other module repositories.
 * Part of Clean Architecture - Infrastructure Layer
 */

class SimpleDataAggregationService {
  constructor(
    farmRepository,
    certificateRepository,
    surveyRepository,
    trainingEnrollmentRepository,
    documentRepository,
    auditRepository
  ) {
    this.farmRepository = farmRepository;
    this.certificateRepository = certificateRepository;
    this.surveyRepository = surveyRepository;
    this.trainingEnrollmentRepository = trainingEnrollmentRepository;
    this.documentRepository = documentRepository;
    this.auditRepository = auditRepository;
  }

  // Farmer Reports
  async getFarmSummary(farmId, filters = {}) {
    const farm = await this.farmRepository.findById(farmId);

    if (!farm) {
      throw new Error('Farm not found');
    }

    // Aggregate related data
    const [certificates, surveys, documents] = await Promise.all([
      this.certificateRepository.findByFarmId(farmId),
      this.surveyRepository.findByFarmId(farmId),
      this.documentRepository.findByRelatedEntity('farm', farmId),
    ]);

    return {
      farm: {
        id: farm.id,
        name: farm.name,
        farmerName: farm.farmerName,
        address: farm.address,
        area: farm.area,
        coordinates: farm.coordinates,
        createdAt: farm.createdAt,
      },
      statistics: {
        totalCertificates: certificates.length,
        activeCertificates: certificates.filter(c => c.isActive()).length,
        totalSurveys: surveys.length,
        completedSurveys: surveys.filter(s => s.isCompleted()).length,
        totalDocuments: documents.length,
      },
      recentCertificates: certificates.slice(0, 5),
      recentSurveys: surveys.slice(0, 5),
    };
  }

  async getCultivationHistory(farmId, filters = {}) {
    const surveys = await this.surveyRepository.findByFarmId(farmId);

    return surveys.map(survey => ({
      id: survey.id,
      surveyDate: survey.surveyDate,
      cultivationType: survey.cultivationType,
      totalArea: survey.totalArea,
      cropVariety: survey.cropVariety,
      plantingDate: survey.plantingDate,
      harvestDate: survey.harvestDate,
      yield: survey.yield,
      status: survey.status,
      submittedAt: survey.submittedAt,
    }));
  }

  async getCertificateStatus(farmerId, filters = {}) {
    const certificates = await this.certificateRepository.findByFarmerId(farmerId);

    return certificates.map(cert => ({
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      type: cert.type,
      status: cert.status,
      farmName: cert.farmName,
      issuedDate: cert.issuedDate,
      expiryDate: cert.expiryDate,
      isActive: cert.isActive(),
      daysUntilExpiry: cert.getDaysUntilExpiry(),
      canRenew: cert.canRenew(),
    }));
  }

  async getTrainingProgress(farmerId, filters = {}) {
    const enrollments = await this.trainingEnrollmentRepository.findByFarmerId(farmerId);

    const progress = {
      totalEnrollments: enrollments.length,
      completed: enrollments.filter(e => e.isCompleted()).length,
      inProgress: enrollments.filter(e => e.isActive()).length,
      failed: enrollments.filter(e => e.isFailed()).length,
      enrollments: enrollments.map(e => ({
        courseId: e.courseId,
        courseName: e.courseName,
        status: e.status,
        progress: e.progressPercentage,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        certificateIssued: e.certificateIssued,
      })),
    };

    return progress;
  }

  async getDocumentList(userId, filters = {}) {
    const documents = await this.documentRepository.findByUploader(userId, filters);

    return documents.documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      category: doc.category,
      fileName: doc.fileName,
      fileSize: doc.getFileSizeFormatted(),
      status: doc.status,
      uploadedAt: doc.uploadedAt,
      expiresAt: doc.expiresAt,
      isApproved: doc.isApproved(),
    }));
  }

  async getSurveyResults(farmId, filters = {}) {
    const surveys = await this.surveyRepository.findByFarmId(farmId);

    return surveys.map(survey => ({
      id: survey.id,
      surveyDate: survey.surveyDate,
      status: survey.status,
      totalArea: survey.totalArea,
      cultivationType: survey.cultivationType,
      cropVariety: survey.cropVariety,
      cannabisType: survey.cannabisType,
      plantingDate: survey.plantingDate,
      expectedHarvest: survey.expectedHarvest,
      pesticideUsed: survey.pesticideUsed,
      submittedAt: survey.submittedAt,
    }));
  }

  // DTAM Reports
  async getApplicationsSummary(filters = {}) {
    // This would aggregate from certificate applications
    const certificates = await this.certificateRepository.findWithFilters(filters);

    const summary = {
      total: certificates.total,
      byStatus: {},
      byType: {},
      recent: certificates.certificates.slice(0, 10),
    };

    // Count by status
    for (const cert of certificates.certificates) {
      summary.byStatus[cert.status] = (summary.byStatus[cert.status] || 0) + 1;
      summary.byType[cert.type] = (summary.byType[cert.type] || 0) + 1;
    }

    return summary;
  }

  async getCertificatesIssued(filters = {}) {
    const certificates = await this.certificateRepository.findWithFilters({
      status: 'ACTIVE',
      ...filters,
    });

    return certificates.certificates.map(cert => ({
      certificateNumber: cert.certificateNumber,
      type: cert.type,
      farmerName: cert.farmerName,
      farmName: cert.farmName,
      issuedDate: cert.issuedDate,
      expiryDate: cert.expiryDate,
      issuedBy: cert.issuedBy,
    }));
  }

  async getAuditLog(filters = {}) {
    if (!this.auditRepository) {
      return [];
    }

    const logs = await this.auditRepository.findWithFilters(filters);

    return logs.logs.map(log => ({
      action: log.action,
      entityType: log.entityType,
      performedBy: log.performedBy,
      performedAt: log.performedAt,
      details: log.details,
    }));
  }

  async getFarmerStatistics(filters = {}) {
    // Aggregate farmer statistics
    const [farmsCount, certificatesCount, surveysCount] = await Promise.all([
      this.farmRepository.count(filters),
      this.certificateRepository.count(filters),
      this.surveyRepository.count(filters),
    ]);

    return {
      totalFarms: farmsCount,
      totalCertificates: certificatesCount,
      totalSurveys: surveysCount,
      // Add more statistics as needed
    };
  }

  async getTrainingStatistics(filters = {}) {
    if (!this.trainingEnrollmentRepository) {
      return {
        totalEnrollments: 0,
        completed: 0,
        inProgress: 0,
        completionRate: '0%',
      };
    }

    const enrollments = await this.trainingEnrollmentRepository.findWithFilters(filters);

    const completed = enrollments.enrollments.filter(e => e.isCompleted()).length;
    const total = enrollments.total;

    return {
      totalEnrollments: total,
      completed: completed,
      inProgress: enrollments.enrollments.filter(e => e.isActive()).length,
      failed: enrollments.enrollments.filter(e => e.isFailed()).length,
      completionRate: total > 0 ? `${((completed / total) * 100).toFixed(2)}%` : '0%',
    };
  }

  async getSystemActivity(filters = {}) {
    // Aggregate system activity from audit logs
    if (!this.auditRepository) {
      return { totalActions: 0, byAction: {}, byUser: {} };
    }

    const logs = await this.auditRepository.findWithFilters(filters);

    const activity = {
      totalActions: logs.total,
      byAction: {},
      byUser: {},
      recent: logs.logs.slice(0, 20),
    };

    for (const log of logs.logs) {
      activity.byAction[log.action] = (activity.byAction[log.action] || 0) + 1;
      activity.byUser[log.performedBy] = (activity.byUser[log.performedBy] || 0) + 1;
    }

    return activity;
  }

  // Analytics Reports
  async getPerformanceDashboard(filters = {}) {
    const [farms, certificates, surveys, documents] = await Promise.all([
      this.farmRepository.count(filters),
      this.certificateRepository.count(filters),
      this.surveyRepository.count(filters),
      this.documentRepository ? this.documentRepository.count(filters) : Promise.resolve(0),
    ]);

    return {
      totalFarms: farms,
      totalCertificates: certificates,
      totalSurveys: surveys,
      totalDocuments: documents,
    };
  }

  async getComplianceReport(filters = {}) {
    // Compliance tracking
    const certificates = await this.certificateRepository.findWithFilters(filters);
    const surveys = await this.surveyRepository.findWithFilters(filters);

    const activeCerts = certificates.certificates.filter(c => c.isActive()).length;
    const expiredCerts = certificates.certificates.filter(c => c.isExpired()).length;
    const completedSurveys = surveys.surveys.filter(s => s.isCompleted()).length;

    return {
      certificateCompliance: {
        active: activeCerts,
        expired: expiredCerts,
        complianceRate:
          certificates.total > 0
            ? `${((activeCerts / certificates.total) * 100).toFixed(2)}%`
            : '0%',
      },
      surveyCompliance: {
        completed: completedSurveys,
        total: surveys.total,
        completionRate:
          surveys.total > 0 ? `${((completedSurveys / surveys.total) * 100).toFixed(2)}%` : '0%',
      },
    };
  }

  async getMonthlySummary(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const filters = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    return await this.getPerformanceDashboard(filters);
  }

  async getQuarterlySummary(year, quarter) {
    const startMonth = (quarter - 1) * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0);

    const filters = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    return await this.getPerformanceDashboard(filters);
  }

  async getAnnualSummary(year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const filters = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    return await this.getPerformanceDashboard(filters);
  }

  async exportCustomData(query) {
    // Custom data export based on query parameters
    // This is a flexible method for custom reports
    return {
      message: 'Custom data export',
      query: query,
      data: [],
    };
  }
}

module.exports = SimpleDataAggregationService;
