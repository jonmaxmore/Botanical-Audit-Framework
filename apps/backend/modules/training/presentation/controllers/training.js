/**
 * Training Controller - HTTP Request Handlers
 *
 * Handles HTTP requests for training system.
 * Part of Clean Architecture - Presentation Layer
 */

const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('training-controller');

class TrainingController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  // ============ COURSE ENDPOINTS ============

  /**
   * GET /api/dtam/training/courses - List all courses (DTAM)
   * GET /api/farmer/training/courses - List published courses (Farmer)
   */
  listCourses = async (req, res) => {
    try {
      const { status, type, level, tags, search, page, limit, sort } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (level) filters.level = level;
      if (tags) filters.tags = tags.split(',');
      if (search) filters.search = search;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        sort: sort ? JSON.parse(sort) : { createdAt: -1 },
      };

      const userRole = req.user.role || 'FARMER';
      const result = await this.useCases.listCourses.execute(filters, options, userRole);

      const CourseDTO = require('../dto/CourseDTO');
      res.json(
        CourseDTO.successResponse('Courses retrieved successfully', {
          courses: result.courses.map(c => CourseDTO.toListItemDTO(c)),
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
          },
        }),
      );
    } catch (error) {
      logger.error('List courses error:', error);
      const CourseDTO = require('../dto/CourseDTO');
      res.status(500).json(CourseDTO.errorResponse('Failed to retrieve courses', [error.message]));
    }
  };

  /**
   * GET /api/dtam/training/courses/:id - Get course details
   * GET /api/farmer/training/courses/:id - Get course details (published only)
   */
  getCourseDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role || 'FARMER';

      const course = await this.useCases.getCourseDetails.execute(id, userRole);

      const CourseDTO = require('../dto/CourseDTO');
      res.json(
        CourseDTO.successResponse('Course retrieved successfully', {
          course: CourseDTO.toDetailedDTO(course),
        }),
      );
    } catch (error) {
      logger.error('Get course details error:', error);
      const CourseDTO = require('../dto/CourseDTO');
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('not available')
          ? 403
          : 500;
      res.status(status).json(CourseDTO.errorResponse(error.message, [error.message]));
    }
  };

  /**
   * POST /api/dtam/training/courses - Create new course (DTAM only)
   */
  createCourse = async (req, res) => {
    try {
      const courseData = { ...req.body, createdBy: req.user.userId };

      const course = await this.useCases.createCourse.execute(courseData);

      const CourseDTO = require('../dto/CourseDTO');
      res.status(201).json(
        CourseDTO.successResponse('Course created successfully', {
          course: CourseDTO.toDetailedDTO(course),
        }),
      );
    } catch (error) {
      logger.error('Create course error:', error);
      const CourseDTO = require('../dto/CourseDTO');
      const status = error.message.includes('already exists') ? 409 : 400;
      res.status(status).json(CourseDTO.errorResponse(error.message, [error.message]));
    }
  };

  /**
   * PUT /api/dtam/training/courses/:id - Update course (DTAM only)
   */
  updateCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedBy = req.user.userId;

      const course = await this.useCases.updateCourse.execute(id, updates, updatedBy);

      const CourseDTO = require('../dto/CourseDTO');
      res.json(
        CourseDTO.successResponse('Course updated successfully', {
          course: CourseDTO.toDetailedDTO(course),
        }),
      );
    } catch (error) {
      logger.error('Update course error:', error);
      const CourseDTO = require('../dto/CourseDTO');
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json(CourseDTO.errorResponse(error.message, [error.message]));
    }
  };

  /**
   * POST /api/dtam/training/courses/:id/publish - Publish course (DTAM only)
   */
  publishCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const publishedBy = req.user.userId;

      const course = await this.useCases.publishCourse.execute(id, publishedBy);

      const CourseDTO = require('../dto/CourseDTO');
      res.json(
        CourseDTO.successResponse('Course published successfully', {
          course: CourseDTO.toSummaryDTO(course),
        }),
      );
    } catch (error) {
      logger.error('Publish course error:', error);
      const CourseDTO = require('../dto/CourseDTO');
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json(CourseDTO.errorResponse(error.message, [error.message]));
    }
  };

  // ============ ENROLLMENT ENDPOINTS ============

  /**
   * POST /api/farmer/training/enroll - Enroll in course
   */
  enrollInCourse = async (req, res) => {
    try {
      const { courseId } = req.body;
      const farmerId = req.user.userId;

      const enrollment = await this.useCases.enrollInCourse.execute({
        farmerId,
        courseId,
        enrolledBy: farmerId,
      });

      const EnrollmentDTO = require('../dto/EnrollmentDTO');
      res.status(201).json(
        EnrollmentDTO.successResponse('Enrolled successfully', {
          enrollment: EnrollmentDTO.toDetailedDTO(enrollment),
        }),
      );
    } catch (error) {
      logger.error('Enroll in course error:', error);
      const EnrollmentDTO = require('../dto/EnrollmentDTO');
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('Already enrolled')
          ? 409
          : error.message.includes('not published')
            ? 403
            : 400;
      res.status(status).json(EnrollmentDTO.errorResponse(error.message, [error.message]));
    }
  };

  /**
   * GET /api/farmer/training/enrollments - Get farmer's enrollments
   */
  getMyEnrollments = async (req, res) => {
    try {
      const farmerId = req.user.userId;
      const { status, page, limit } = req.query;

      const filters = {};
      if (status) filters.status = status;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      };

      const result = await this.useCases.getFarmerEnrollments.execute(farmerId, filters, options);

      const EnrollmentDTO = require('../dto/EnrollmentDTO');
      res.json(
        EnrollmentDTO.successResponse('Enrollments retrieved successfully', {
          enrollments: result.enrollments.map(e => EnrollmentDTO.toListItemDTO(e)),
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
          },
        }),
      );
    } catch (error) {
      logger.error('Get enrollments error:', error);
      const EnrollmentDTO = require('../dto/EnrollmentDTO');
      res
        .status(500)
        .json(EnrollmentDTO.errorResponse('Failed to retrieve enrollments', [error.message]));
    }
  };

  /**
   * PUT /api/farmer/training/enrollments/:id/progress - Update progress
   */
  updateProgress = async (req, res) => {
    try {
      const { id } = req.params;
      const progressData = req.body;

      const enrollment = await this.useCases.updateProgress.execute(id, progressData);

      const EnrollmentDTO = require('../dto/EnrollmentDTO');
      res.json(
        EnrollmentDTO.successResponse('Progress updated successfully', {
          enrollment: EnrollmentDTO.toDetailedDTO(enrollment),
        }),
      );
    } catch (error) {
      logger.error('Update progress error:', error);
      const EnrollmentDTO = require('../dto/EnrollmentDTO');
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json(EnrollmentDTO.errorResponse(error.message, [error.message]));
    }
  };

  /**
   * POST /api/farmer/training/enrollments/:id/submit - Submit final assessment
   */
  submitFinalAssessment = async (req, res) => {
    try {
      const { id } = req.params;
      const assessmentData = req.body;

      const enrollment = await this.useCases.submitFinalAssessment.execute(id, assessmentData);

      const EnrollmentDTO = require('../dto/EnrollmentDTO');
      const message = enrollment.hasPassed()
        ? 'Congratulations! You passed the course.'
        : 'Assessment submitted. Please review and try again.';

      res.json(
        EnrollmentDTO.successResponse(message, {
          enrollment: EnrollmentDTO.toDetailedDTO(enrollment),
        }),
      );
    } catch (error) {
      logger.error('Submit assessment error:', error);
      const EnrollmentDTO = require('../dto/EnrollmentDTO');
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json(EnrollmentDTO.errorResponse(error.message, [error.message]));
    }
  };

  // ============ STATISTICS ENDPOINTS (DTAM) ============

  /**
   * GET /api/dtam/training/statistics - Get training statistics
   */
  getStatistics = async (req, res) => {
    try {
      const filters = req.query;

      const statistics = await this.useCases.getTrainingStatistics.execute(filters);

      res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      logger.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics',
        errors: [error.message],
      });
    }
  };
}

module.exports = TrainingController;
