/**
 * Update Course Use Case
 *
 * Business Logic: Update course information
 * Access: DTAM staff only (requires update_course permission)
 */

class UpdateCourseUseCase {
  constructor(courseRepository) {
    this.courseRepository = courseRepository;
  }

  async execute(courseId, updates, updatedBy) {
    // Find course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if updating code and it already exists
    if (updates.code && updates.code !== course.code) {
      const codeExists = await this.courseRepository.codeExists(updates.code, courseId);
      if (codeExists) {
        throw new Error('Course code already exists');
      }
    }

    // Update course
    course.updateInfo(updates, updatedBy);

    // Validate
    const validation = course.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Save
    return await this.courseRepository.save(course);
  }
}

module.exports = UpdateCourseUseCase;
