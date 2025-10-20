/**
 * Update Progress Use Case
 *
 * Business Logic: Update farmer's progress in a course
 * Access: Farmer (own enrollment only)
 */

class UpdateProgressUseCase {
  constructor(courseRepository, enrollmentRepository) {
    this.courseRepository = courseRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  async execute(enrollmentId, { moduleId, lessonId, timeSpentMinutes, action }) {
    // Find enrollment
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Check if enrollment is active
    if (!enrollment.isActive()) {
      throw new Error('Enrollment is not active');
    }

    // Start course if first access
    if (!enrollment.startedAt) {
      enrollment.start();
    } else {
      enrollment.recordAccess();
    }

    // Update position
    if (moduleId || lessonId) {
      enrollment.updatePosition(moduleId, lessonId);
    }

    // Handle different actions
    if (action === 'complete_lesson' && lessonId) {
      enrollment.completeLesson(lessonId, timeSpentMinutes || 0);
    } else if (action === 'complete_module' && moduleId) {
      enrollment.completeModule(moduleId);
    }

    // Get course to calculate progress
    const course = await this.courseRepository.findById(enrollment.courseId);
    if (course) {
      enrollment.updateProgress(course.modules.length, course.totalLessons);
    }

    // Save
    return await this.enrollmentRepository.save(enrollment);
  }
}

module.exports = UpdateProgressUseCase;
