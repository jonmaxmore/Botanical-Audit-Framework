/**
 * Create Course Use Case
 *
 * Business Logic: Create a new training course
 * Access: DTAM staff only (requires create_course permission)
 */

class CreateCourseUseCase {
  constructor(courseRepository) {
    this.courseRepository = courseRepository;
  }

  async execute({ code, title, titleEn, description, descriptionEn, type, level, createdBy }) {
    // Check if course code already exists
    const codeExists = await this.courseRepository.codeExists(code);
    if (codeExists) {
      throw new Error('Course code already exists');
    }

    // Create course entity
    const Course = require('../../domain/entities/Course');
    const course = Course.create({
      code,
      title,
      titleEn,
      description,
      descriptionEn,
      type,
      level,
      createdBy
    });

    // Validate
    const validation = course.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Save to repository
    return await this.courseRepository.save(course);
  }
}

module.exports = CreateCourseUseCase;
