/**
 * Training Module Container
 *
 * Dependency Injection container for the Training module.
 * Wires together all layers following Clean Architecture principles.
 *
 * Usage:
 * const trainingModule = createTrainingModule({ database, authMiddleware });
 * app.use('/api/farmer/training', trainingModule.farmerRouter);
 * app.use('/api/dtam/training', trainingModule.dtamRouter);
 */

// Domain
const Course = require('./domain/entities/Course');
const Enrollment = require('./domain/entities/Enrollment');

// Infrastructure
const MongoDBCourseRepository = require('./infrastructure/database/course');
const MongoDBEnrollmentRepository = require('./infrastructure/database/enrollment');

// Application - Use Cases
const CreateCourseUseCase = require('./application/use-cases/create-course');
const UpdateCourseUseCase = require('./application/use-cases/update-course');
const PublishCourseUseCase = require('./application/use-cases/publish-course');
const ListCoursesUseCase = require('./application/use-cases/list-courses');
const GetCourseDetailsUseCase = require('./application/use-cases/get-course-details');
const EnrollInCourseUseCase = require('./application/use-cases/enroll-course');
const UpdateProgressUseCase = require('./application/use-cases/update-progress');
const SubmitFinalAssessmentUseCase = require('./application/use-cases/submit-assessment');
const GetFarmerEnrollmentsUseCase = require('./application/use-cases/get-farmer-enrollments');
const GetTrainingStatisticsUseCase = require('./application/use-cases/get-training-stats');

// Presentation
const TrainingController = require('./presentation/controllers/training');
const createTrainingRoutes = require('./presentation/routes/training.routes');

/**
 * Create and configure Training module
 *
 * @param {Object} config - Configuration object
 * @param {Object} config.database - Mongoose database connection
 * @param {Object} config.authMiddleware - Authentication middleware functions
 * @returns {Object} Training module with routes and services
 */
function createTrainingModule(config) {
  const { database, authMiddleware } = config;

  if (!database) {
    throw new Error('Database connection is required');
  }

  if (!authMiddleware) {
    throw new Error('Authentication middleware is required');
  }

  // Infrastructure Layer - Repositories
  const courseRepository = new MongoDBCourseRepository(database);
  const enrollmentRepository = new MongoDBEnrollmentRepository(database);

  // Application Layer - Use Cases
  const createCourse = new CreateCourseUseCase(courseRepository);
  const updateCourse = new UpdateCourseUseCase(courseRepository);
  const publishCourse = new PublishCourseUseCase(courseRepository);
  const listCourses = new ListCoursesUseCase(courseRepository);
  const getCourseDetails = new GetCourseDetailsUseCase(courseRepository);
  const enrollInCourse = new EnrollInCourseUseCase(courseRepository, enrollmentRepository);
  const updateProgress = new UpdateProgressUseCase(courseRepository, enrollmentRepository);
  const submitFinalAssessment = new SubmitFinalAssessmentUseCase(
    courseRepository,
    enrollmentRepository,
  );
  const getFarmerEnrollments = new GetFarmerEnrollmentsUseCase(enrollmentRepository);
  const getTrainingStatistics = new GetTrainingStatisticsUseCase(
    courseRepository,
    enrollmentRepository,
  );

  const useCases = {
    createCourse,
    updateCourse,
    publishCourse,
    listCourses,
    getCourseDetails,
    enrollInCourse,
    updateProgress,
    submitFinalAssessment,
    getFarmerEnrollments,
    getTrainingStatistics,
  };

  // Presentation Layer - Controller
  const controller = new TrainingController(useCases);

  // Presentation Layer - Routes
  const { farmerRouter, dtamRouter } = createTrainingRoutes(controller, authMiddleware);

  // Public API
  return {
    // Routes
    farmerRouter, // Mount at /api/farmer/training
    dtamRouter, // Mount at /api/dtam/training

    // Services (for internal use by other modules)
    services: {
      courseRepository,
      enrollmentRepository,
      ...useCases,
    },

    // Domain entities (for type reference)
    entities: {
      Course,
      Enrollment,
    },

    // Constants
    constants: {
      COURSE_STATUS: Course.STATUS,
      COURSE_TYPE: Course.TYPE,
      COURSE_LEVEL: Course.LEVEL,
      ENROLLMENT_STATUS: Enrollment.STATUS,
    },
  };
}

module.exports = createTrainingModule;
