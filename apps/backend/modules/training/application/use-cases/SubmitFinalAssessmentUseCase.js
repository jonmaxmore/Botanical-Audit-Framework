/**
 * Submit Final Assessment Use Case
 *
 * Business Logic: Submit final assessment and complete course
 * Access: Farmer (own enrollment only)
 */

class SubmitFinalAssessmentUseCase {
  constructor(courseRepository, enrollmentRepository) {
    this.courseRepository = courseRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  async execute(enrollmentId, { score, answers, timeSpentMinutes }) {
    // Find enrollment
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Check if enrollment is active
    if (!enrollment.isActive()) {
      throw new Error('Enrollment is not active');
    }

    // Submit final assessment (certificate will be issued later)
    enrollment.submitFinalAssessment(score);

    // Save enrollment
    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    // Update course completion count if passed
    if (enrollment.hasPassed()) {
      const course = await this.courseRepository.findById(enrollment.courseId);
      if (course) {
        course.incrementCompletion();
        await this.courseRepository.save(course);
      }
    }

    return savedEnrollment;
  }
}

module.exports = SubmitFinalAssessmentUseCase;
