/**
 * Get Training Statistics Use Case
 *
 * Business Logic: Get training system statistics
 * Access: DTAM staff only
 */

class GetTrainingStatisticsUseCase {
  constructor(courseRepository, enrollmentRepository) {
    this.courseRepository = courseRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  async execute(filters = {}) {
    const [courseStats, enrollmentStats] = await Promise.all([
      this.courseRepository.getStatistics(),
      this.enrollmentRepository.getStatistics(filters),
    ]);

    return {
      courses: courseStats,
      enrollments: enrollmentStats,
      generatedAt: new Date(),
    };
  }
}

module.exports = GetTrainingStatisticsUseCase;
