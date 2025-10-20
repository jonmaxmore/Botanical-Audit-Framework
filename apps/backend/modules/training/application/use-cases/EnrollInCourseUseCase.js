/**
 * Enroll in Course Use Case
 *
 * Business Logic: Enroll farmer in a training course
 * Access: Farmers (self-enrollment), DTAM (can enroll farmers)
 */

class EnrollInCourseUseCase {
  constructor(courseRepository, enrollmentRepository) {
    this.courseRepository = courseRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  async execute({ farmerId, courseId, enrolledBy }) {
    // Find course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if course is available for enrollment
    if (!course.isEnrollmentAvailable()) {
      if (!course.isPublished()) {
        throw new Error('Course is not published');
      }
      if (course.isFull()) {
        throw new Error('Course enrollment limit reached');
      }
      throw new Error('Course not available for enrollment');
    }

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findByFarmerAndCourse(
      farmerId,
      courseId
    );
    if (existingEnrollment && existingEnrollment.isActive()) {
      throw new Error('Already enrolled in this course');
    }
    if (existingEnrollment && existingEnrollment.isCompleted()) {
      throw new Error('Already completed this course');
    }

    // Check prerequisites
    if (course.prerequisites.length > 0) {
      for (const prereqId of course.prerequisites) {
        const hasCompleted = await this.enrollmentRepository.hasCompleted(farmerId, prereqId);
        if (!hasCompleted) {
          throw new Error('Prerequisites not met');
        }
      }
    }

    // Create enrollment
    const Enrollment = require('../../domain/entities/Enrollment');
    const enrollment = Enrollment.create({
      farmerId,
      courseId,
      passingScore: course.passingScore,
      maxAttempts: 3,
      enrolledBy: enrolledBy || farmerId
    });

    // Save enrollment
    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    // Update course enrollment count
    course.incrementEnrollment();
    await this.courseRepository.save(course);

    return savedEnrollment;
  }
}

module.exports = EnrollInCourseUseCase;
