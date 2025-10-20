/**
 * Publish Course Use Case
 *
 * Business Logic: Publish course to make it available for enrollment
 * Access: DTAM staff only (requires publish_course permission)
 */

class PublishCourseUseCase {
  constructor(courseRepository) {
    this.courseRepository = courseRepository;
  }

  async execute(courseId, publishedBy) {
    // Find course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Publish course (validation happens in entity)
    course.publish(publishedBy);

    // Save
    return await this.courseRepository.save(course);
  }
}

module.exports = PublishCourseUseCase;
