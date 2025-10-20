/**
 * Get Farmer Dashboard Use Case
 *
 * Aggregates statistics and information for farmer dashboard.
 * Shows overview of farmer's farms, certificates, surveys, training, etc.
 *
 * Part of Clean Architecture - Application Layer
 */

class GetFarmerDashboardUseCase {
  constructor(
    farmRepository,
    certificateRepository,
    surveyRepository,
    trainingEnrollmentRepository,
    documentRepository,
    notificationRepository,
  ) {
    this.farmRepository = farmRepository;
    this.certificateRepository = certificateRepository;
    this.surveyRepository = surveyRepository;
    this.trainingEnrollmentRepository = trainingEnrollmentRepository;
    this.documentRepository = documentRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute(farmerId) {
    try {
      // Get all data in parallel
      const [farms, certificates, surveys, enrollments, documents, notifications] =
        await Promise.all([
          this._getFarmStats(farmerId),
          this._getCertificateStats(farmerId),
          this._getSurveyStats(farmerId),
          this._getTrainingStats(farmerId),
          this._getDocumentStats(farmerId),
          this._getNotificationStats(farmerId),
        ]);

      return {
        summary: {
          totalFarms: farms.total,
          activeCertificates: certificates.active,
          pendingSurveys: surveys.pending,
          trainingProgress: enrollments.averageProgress,
          unreadNotifications: notifications.unread,
        },
        farms,
        certificates,
        surveys,
        training: enrollments,
        documents,
        notifications,
        quickActions: this._getQuickActions(certificates, surveys, enrollments),
        alerts: this._getAlerts(certificates, surveys, enrollments),
      };
    } catch (error) {
      throw new Error(`Failed to get farmer dashboard: ${error.message}`);
    }
  }

  async _getFarmStats(farmerId) {
    const farms = await this.farmRepository.findByFarmerId(farmerId);

    return {
      total: farms.length,
      farms: farms.map(f => ({
        id: f.id,
        name: f.name,
        area: f.area,
        status: f.status,
        location: f.address,
      })),
    };
  }

  async _getCertificateStats(farmerId) {
    const certificates = await this.certificateRepository.findByFarmerId(farmerId);

    const active = certificates.filter(c => c.isActive()).length;
    const expired = certificates.filter(c => c.isExpired()).length;
    const expiringSoon = certificates.filter(c => {
      const days = c.getDaysUntilExpiry();
      return days > 0 && days <= 30;
    }).length;

    return {
      total: certificates.length,
      active,
      expired,
      expiringSoon,
      recentCertificates: certificates.slice(0, 5).map(c => ({
        id: c.id,
        certificateNumber: c.certificateNumber,
        type: c.type,
        status: c.status,
        expiryDate: c.expiryDate,
        daysUntilExpiry: c.getDaysUntilExpiry(),
      })),
    };
  }

  async _getSurveyStats(farmerId) {
    // Get farms first
    const farms = await this.farmRepository.findByFarmerId(farmerId);
    const farmIds = farms.map(f => f.id);

    // Get surveys for all farms
    let allSurveys = [];
    for (const farmId of farmIds) {
      const surveys = await this.surveyRepository.findByFarmId(farmId);
      allSurveys = allSurveys.concat(surveys);
    }

    const pending = allSurveys.filter(s => s.isPending()).length;
    const completed = allSurveys.filter(s => s.isCompleted()).length;

    return {
      total: allSurveys.length,
      pending,
      completed,
      recentSurveys: allSurveys.slice(0, 5).map(s => ({
        id: s.id,
        farmName: s.farmName,
        surveyDate: s.surveyDate,
        status: s.status,
        cultivationType: s.cultivationType,
      })),
    };
  }

  async _getTrainingStats(farmerId) {
    const enrollments = await this.trainingEnrollmentRepository.findByFarmerId(farmerId);

    const active = enrollments.filter(e => e.isActive()).length;
    const completed = enrollments.filter(e => e.isCompleted()).length;
    const totalProgress = enrollments.reduce((sum, e) => sum + e.progressPercentage, 0);
    const averageProgress =
      enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

    return {
      total: enrollments.length,
      active,
      completed,
      averageProgress,
      recentEnrollments: enrollments.slice(0, 5).map(e => ({
        id: e.id,
        courseName: e.courseName,
        status: e.status,
        progress: e.progressPercentage,
        enrolledAt: e.enrolledAt,
      })),
    };
  }

  async _getDocumentStats(farmerId) {
    if (!this.documentRepository) {
      return { total: 0, approved: 0, pending: 0, recentDocuments: [] };
    }

    const result = await this.documentRepository.findByUploader(farmerId);
    const documents = result.documents || [];

    const approved = documents.filter(d => d.isApproved()).length;
    const pending = documents.filter(d => d.isPending()).length;

    return {
      total: documents.length,
      approved,
      pending,
      recentDocuments: documents.slice(0, 5).map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        uploadedAt: d.uploadedAt,
      })),
    };
  }

  async _getNotificationStats(farmerId) {
    if (!this.notificationRepository) {
      return { total: 0, unread: 0, recentNotifications: [] };
    }

    const result = await this.notificationRepository.findByRecipient(farmerId);
    const notifications = result.notifications || [];

    const unread = notifications.filter(n => !n.isRead()).length;

    return {
      total: notifications.length,
      unread,
      recentNotifications: notifications.slice(0, 5).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead(),
        createdAt: n.createdAt,
      })),
    };
  }

  _getQuickActions(certificates, surveys, enrollments) {
    const actions = [];

    // Need to renew certificate
    if (certificates.expiringSoon > 0) {
      actions.push({
        type: 'RENEW_CERTIFICATE',
        title: 'ต่ออายุใบรับรอง',
        description: `มีใบรับรอง ${certificates.expiringSoon} ใบที่ใกล้หมดอายุ`,
        priority: 'high',
        action: '/certificates/renew',
      });
    }

    // Complete pending surveys
    if (surveys.pending > 0) {
      actions.push({
        type: 'COMPLETE_SURVEY',
        title: 'กรอกแบบสำรวจ',
        description: `มีแบบสำรวจ ${surveys.pending} รายการที่รอดำเนินการ`,
        priority: 'medium',
        action: '/surveys',
      });
    }

    // Continue training
    if (enrollments.active > 0) {
      actions.push({
        type: 'CONTINUE_TRAINING',
        title: 'เรียนหลักสูตร',
        description: `มีหลักสูตร ${enrollments.active} หลักสูตรที่กำลังเรียน`,
        priority: 'medium',
        action: '/training',
      });
    }

    return actions;
  }

  _getAlerts(certificates, surveys, enrollments) {
    const alerts = [];

    // Expired certificates
    if (certificates.expired > 0) {
      alerts.push({
        type: 'warning',
        message: `มีใบรับรอง ${certificates.expired} ใบที่หมดอายุแล้ว กรุณาดำเนินการต่ออายุ`,
        action: '/certificates',
      });
    }

    // Expiring soon certificates
    if (certificates.expiringSoon > 0) {
      alerts.push({
        type: 'info',
        message: `มีใบรับรอง ${certificates.expiringSoon} ใบที่ใกล้หมดอายุภายใน 30 วัน`,
        action: '/certificates',
      });
    }

    // Low training progress
    if (enrollments.active > 0 && enrollments.averageProgress < 50) {
      alerts.push({
        type: 'info',
        message: `ความคืบหน้าการเรียนเฉลี่ย ${enrollments.averageProgress}% แนะนำให้เรียนให้จบ`,
        action: '/training',
      });
    }

    return alerts;
  }
}

module.exports = GetFarmerDashboardUseCase;
