/**
 * Enrollment Data Transfer Objects
 *
 * Transforms Enrollment entities for API responses.
 */

class EnrollmentDTO {
  /**
   * Convert to detailed DTO (full information)
   */
  static toDetailedDTO(enrollment) {
    return {
      id: enrollment.id,
      farmerId: enrollment.farmerId,
      courseId: enrollment.courseId,

      status: enrollment.status,

      progress: {
        completedModules: enrollment.progress.completedModules,
        completedLessons: enrollment.progress.completedLessons,
        currentModuleId: enrollment.progress.currentModuleId,
        currentLessonId: enrollment.progress.currentLessonId,
        progressPercentage: enrollment.progress.progressPercentage,
        totalTimeSpentMinutes: enrollment.progress.totalTimeSpentMinutes,
      },

      assessments: enrollment.assessments.map(a => ({
        assessmentId: a.assessmentId,
        score: a.score,
        timeSpentMinutes: a.timeSpentMinutes,
        submittedAt: a.submittedAt,
      })),

      finalScore: enrollment.finalScore,
      passingScore: enrollment.passingScore,
      hasPassed: enrollment.hasPassed(),

      attemptCount: enrollment.attemptCount,
      maxAttempts: enrollment.maxAttempts,
      remainingAttempts: enrollment.getRemainingAttempts(),
      canRetry: enrollment.canRetry(),

      certificateId: enrollment.certificateId,
      certificateIssuedAt: enrollment.certificateIssuedAt,
      hasCertificate: enrollment.hasCertificate(),

      enrolledAt: enrollment.enrolledAt,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      expiresAt: enrollment.expiresAt,
      lastAccessedAt: enrollment.lastAccessedAt,

      daysActive: enrollment.getDaysSinceEnrollment(),
      daysUntilExpiry: enrollment.getDaysUntilExpiry(),

      isActive: enrollment.isActive(),
      isCompleted: enrollment.isCompleted(),
      hasFailed: enrollment.hasFailed(),
      isExpired: enrollment.isExpired(),

      notes: enrollment.notes,
    };
  }

  /**
   * Convert to list item DTO (summary for lists)
   */
  static toListItemDTO(enrollment) {
    return {
      id: enrollment.id,
      courseId: enrollment.courseId,

      status: enrollment.status,
      progressPercentage: enrollment.progress.progressPercentage,

      finalScore: enrollment.finalScore,
      hasPassed: enrollment.hasPassed(),

      attemptCount: enrollment.attemptCount,
      remainingAttempts: enrollment.getRemainingAttempts(),

      hasCertificate: enrollment.hasCertificate(),

      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      lastAccessedAt: enrollment.lastAccessedAt,

      daysActive: enrollment.getDaysSinceEnrollment(),
    };
  }

  /**
   * Convert to summary DTO (minimal)
   */
  static toSummaryDTO(enrollment) {
    return {
      id: enrollment.id,
      courseId: enrollment.courseId,
      status: enrollment.status,
      progressPercentage: enrollment.progress.progressPercentage,
      hasPassed: enrollment.hasPassed(),
      isActive: enrollment.isActive(),
    };
  }

  /**
   * Success response wrapper
   */
  static successResponse(message, data) {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Error response wrapper
   */
  static errorResponse(message, errors) {
    return {
      success: false,
      message,
      errors,
    };
  }
}

module.exports = EnrollmentDTO;
