/**
 * Get Course Details Use Case
 *
 * Business Logic: Get detailed information about a course
 * Access: DTAM (all courses), Farmers (published only)
 */

class GetCourseDetailsUseCase {
  constructor(courseRepository) {
    this.courseRepository = courseRepository;
  }

  async execute(courseId, userRole = 'FARMER') {
    // Find course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Farmers can only see published courses
    if (userRole === 'FARMER' && !course.isPublished()) {
      throw new Error('Course not available');
    }

    return course;
  }
}

module.exports = GetCourseDetailsUseCase;
