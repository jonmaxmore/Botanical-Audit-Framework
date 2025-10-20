/**
 * Dashboard Data Transfer Objects (DTOs)
 *
 * Handles data transformation for dashboard responses.
 * Formats dashboard data for API responses.
 *
 * Part of Clean Architecture - Presentation Layer
 */

class DashboardDTO {
  /**
   * Transform farmer dashboard data for API response
   */
  static toFarmerDashboard(dashboard) {
    return {
      summary: {
        farms: dashboard.summary.farms,
        certificates: dashboard.summary.certificates,
        surveys: dashboard.summary.surveys,
        training: dashboard.summary.training,
        notifications: dashboard.summary.notifications
      },
      farms: {
        total: dashboard.farms.total,
        totalArea: dashboard.farms.totalArea,
        farms: dashboard.farms.farms.map(f => this._toFarmSummary(f))
      },
      certificates: {
        total: dashboard.certificates.total,
        active: dashboard.certificates.active,
        expired: dashboard.certificates.expired,
        expiringSoon: dashboard.certificates.expiringSoon,
        certificates: dashboard.certificates.certificates.map(c => this._toCertificateSummary(c))
      },
      surveys: {
        total: dashboard.surveys.total,
        pending: dashboard.surveys.pending,
        completed: dashboard.surveys.completed,
        surveys: dashboard.surveys.surveys.map(s => this._toSurveySummary(s))
      },
      training: {
        total: dashboard.training.total,
        inProgress: dashboard.training.inProgress,
        completed: dashboard.training.completed,
        averageProgress: dashboard.training.averageProgress,
        enrollments: dashboard.training.enrollments.map(e => this._toEnrollmentSummary(e))
      },
      documents: {
        total: dashboard.documents.total,
        approved: dashboard.documents.approved,
        pending: dashboard.documents.pending,
        documents: dashboard.documents.documents.map(d => this._toDocumentSummary(d))
      },
      notifications: {
        total: dashboard.notifications.total,
        unread: dashboard.notifications.unread,
        recent: dashboard.notifications.recent.map(n => this._toNotificationSummary(n))
      },
      quickActions: dashboard.quickActions,
      alerts: dashboard.alerts
    };
  }

  /**
   * Transform DTAM dashboard data for API response
   */
  static toDTAMDashboard(dashboard) {
    return {
      systemStats: dashboard.systemStats,
      pendingTasks: {
        certificates: {
          count: dashboard.pendingTasks.certificates.count,
          items: dashboard.pendingTasks.certificates.items.map(c => this._toCertificateSummary(c))
        },
        surveys: {
          count: dashboard.pendingTasks.surveys.count,
          items: dashboard.pendingTasks.surveys.items.map(s => this._toSurveySummary(s))
        },
        documents: {
          count: dashboard.pendingTasks.documents.count,
          items: dashboard.pendingTasks.documents.items.map(d => this._toDocumentSummary(d))
        },
        totalPending: dashboard.pendingTasks.totalPending
      },
      recentActivity: dashboard.recentActivity.map(a => this._toActivitySummary(a)),
      trends: dashboard.trends,
      quickStats: dashboard.quickStats
    };
  }

  /**
   * Transform system statistics for API response
   */
  static toSystemStatistics(statistics) {
    return {
      farms: statistics.farms,
      certificates: statistics.certificates,
      surveys: statistics.surveys,
      training: statistics.training,
      documents: statistics.documents,
      activity: statistics.activity,
      generatedAt: statistics.generatedAt
    };
  }

  // Private helper methods for entity summaries

  static _toFarmSummary(farm) {
    return {
      id: farm.id,
      name: farm.name,
      farmerId: farm.farmerId,
      area: farm.area,
      location: farm.location,
      status: farm.status,
      createdAt: farm.createdAt
    };
  }

  static _toCertificateSummary(certificate) {
    return {
      id: certificate.id,
      type: certificate.type,
      status: certificate.status,
      farmId: certificate.farmId,
      farmerId: certificate.farmerId,
      issuedDate: certificate.issuedDate,
      expiryDate: certificate.expiryDate,
      isActive: certificate.isActive ? certificate.isActive() : undefined,
      isExpired: certificate.isExpired ? certificate.isExpired() : undefined,
      daysUntilExpiry: certificate.getDaysUntilExpiry
        ? certificate.getDaysUntilExpiry()
        : undefined
    };
  }

  static _toSurveySummary(survey) {
    return {
      id: survey.id,
      farmId: survey.farmId,
      farmerId: survey.farmerId,
      cultivationType: survey.cultivationType,
      status: survey.status,
      completionDate: survey.completionDate,
      createdAt: survey.createdAt,
      isCompleted: survey.isCompleted ? survey.isCompleted() : undefined,
      isPending: survey.isPending ? survey.isPending() : undefined
    };
  }

  static _toEnrollmentSummary(enrollment) {
    return {
      id: enrollment.id,
      courseId: enrollment.courseId,
      userId: enrollment.userId,
      courseName: enrollment.courseName,
      progress: enrollment.progress,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      isCompleted: enrollment.isCompleted ? enrollment.isCompleted() : undefined,
      isActive: enrollment.isActive ? enrollment.isActive() : undefined
    };
  }

  static _toDocumentSummary(document) {
    return {
      id: document.id,
      type: document.type,
      status: document.status,
      entityType: document.entityType,
      entityId: document.entityId,
      uploadedBy: document.uploadedBy,
      fileName: document.fileName,
      fileSize: document.fileSize,
      uploadedAt: document.uploadedAt,
      isApproved: document.isApproved ? document.isApproved() : undefined,
      isPending: document.isPending ? document.isPending() : undefined,
      isRejected: document.isRejected ? document.isRejected() : undefined
    };
  }

  static _toNotificationSummary(notification) {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    };
  }

  static _toActivitySummary(activity) {
    return {
      id: activity.id,
      userId: activity.userId,
      userName: activity.userName,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      details: activity.details,
      timestamp: activity.timestamp
    };
  }
}

module.exports = { DashboardDTO };
