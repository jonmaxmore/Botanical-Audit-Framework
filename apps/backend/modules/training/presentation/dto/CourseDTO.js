/**
 * Course Data Transfer Objects
 *
 * Transforms Course entities for API responses.
 */

class CourseDTO {
  /**
   * Convert to detailed DTO (full information)
   */
  static toDetailedDTO(course) {
    return {
      id: course.id,
      code: course.code,
      title: course.title,
      titleEn: course.titleEn,
      description: course.description,
      descriptionEn: course.descriptionEn,

      type: course.type,
      level: course.level,
      status: course.status,

      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        titleEn: module.titleEn,
        description: module.description,
        order: module.order,
        durationMinutes: module.durationMinutes,
        lessonCount: module.lessons?.length || 0,
        lessons: module.lessons,
        isRequired: module.isRequired,
      })),

      totalDurationMinutes: course.totalDurationMinutes,
      totalLessons: course.totalLessons,

      prerequisites: course.prerequisites,
      passingScore: course.passingScore,
      certificateTemplate: course.certificateTemplate,

      objectives: course.objectives,
      materials: course.materials,
      assessments: course.assessments,

      instructors: course.instructors,

      maxEnrollments: course.maxEnrollments,
      currentEnrollments: course.currentEnrollments,
      completionCount: course.completionCount,
      completionRate: course.getCompletionRate(),

      tags: course.tags,
      thumbnailUrl: course.thumbnailUrl,
      previewVideoUrl: course.previewVideoUrl,

      isPublished: course.isPublished(),
      isDraft: course.isDraft(),
      isArchived: course.isArchived(),
      isEnrollmentAvailable: course.isEnrollmentAvailable(),
      isFull: course.isFull(),

      publishedAt: course.publishedAt,
      archivedAt: course.archivedAt,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  /**
   * Convert to list item DTO (summary for lists)
   */
  static toListItemDTO(course) {
    return {
      id: course.id,
      code: course.code,
      title: course.title,
      titleEn: course.titleEn,
      description:
        course.description?.substring(0, 200) + (course.description?.length > 200 ? '...' : ''),

      type: course.type,
      level: course.level,
      status: course.status,

      totalModules: course.modules.length,
      totalDurationMinutes: course.totalDurationMinutes,
      totalLessons: course.totalLessons,

      passingScore: course.passingScore,

      currentEnrollments: course.currentEnrollments,
      maxEnrollments: course.maxEnrollments,
      completionRate: course.getCompletionRate(),

      tags: course.tags,
      thumbnailUrl: course.thumbnailUrl,

      isEnrollmentAvailable: course.isEnrollmentAvailable(),
      isFull: course.isFull(),

      publishedAt: course.publishedAt,
      createdAt: course.createdAt,
    };
  }

  /**
   * Convert to summary DTO (minimal for dropdowns)
   */
  static toSummaryDTO(course) {
    return {
      id: course.id,
      code: course.code,
      title: course.title,
      titleEn: course.titleEn,
      type: course.type,
      level: course.level,
      status: course.status,
      thumbnailUrl: course.thumbnailUrl,
      isEnrollmentAvailable: course.isEnrollmentAvailable(),
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

module.exports = CourseDTO;
