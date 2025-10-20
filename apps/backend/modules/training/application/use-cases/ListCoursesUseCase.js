/**
 * List Courses Use Case
 *
 * Business Logic: List courses with filters
 * Access: DTAM (all courses), Farmers (published only)
 */

class ListCoursesUseCase {
  constructor(courseRepository) {
    this.courseRepository = courseRepository;
  }

  async execute(filters = {}, options = {}, userRole = 'FARMER') {
    // Farmers can only see published courses
    if (userRole === 'FARMER') {
      filters.status = 'PUBLISHED';
    }

    // Get courses with filters
    return await this.courseRepository.findWithFilters(filters, options);
  }
}

module.exports = ListCoursesUseCase;
