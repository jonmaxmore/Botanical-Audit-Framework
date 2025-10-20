/**
 * Course Repository
 *
 * Data Access Layer for Course entity management
 * Implements Clear Business Logic for Course operations
 *
 * Business Operations:
 * 1. Course CRUD operations with validation
 * 2. Course search and filtering with business rules
 * 3. Course enrollment eligibility checking
 * 4. Course analytics and reporting
 * 5. Course lifecycle management
 *
 * Process Integration:
 * - Integrates with enrollment validation workflow
 * - Supports course prerequisite checking
 * - Provides data for analytics and reporting
 * - Maintains audit trail for compliance
 */

const Course = require('../../domain/entities/Course');

class CourseRepository {
  constructor(database, logger = console) {
    this.db = database;
    this.logger = logger;
    this.collectionName = 'courses';

    // Business logic configuration
    this.businessRules = {
      maxCoursesPerFarmer: 5,
      courseExpiryMonths: 24,
      prerequisiteCheckEnabled: true,
      auditTrailEnabled: true,
    };
  }

  /**
   * Create new course with business validation
   *
   * Business Logic:
   * - Validates course data against business rules
   * - Checks for duplicate course codes
   * - Sets up course prerequisites and requirements
   * - Initializes course analytics tracking
   */
  async create(courseData) {
    try {
      this.logger.log('[CourseRepository] Creating new course...');

      // Business validation
      await this.validateCourseCreation(courseData);

      // Create course entity
      const course = Course.create(courseData);

      // Check for duplicate course code
      const existingCourse = await this.findByCode(course.code);
      if (existingCourse) {
        throw new Error(`Course with code '${course.code}' already exists`);
      }

      // Prepare course document with business metadata
      const courseDocument = {
        ...course.toObject(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        businessMetadata: {
          createdBy: courseData.createdBy,
          approvedBy: null,
          approvalDate: null,
          enrollmentCount: 0,
          completionRate: 0,
          averageScore: 0,
          lastAnalyticsUpdate: new Date(),
        },
        auditTrail: [
          {
            action: 'CREATED',
            timestamp: new Date(),
            userId: courseData.createdBy,
            changes: 'Course created',
          },
        ],
      };

      // Insert into database
      const collection = this.db.collection(this.collectionName);
      const result = await collection.insertOne(courseDocument);

      // Return created course with ID
      const createdCourse = { ...courseDocument, id: result.insertedId.toString() };

      this.logger.log(`[CourseRepository] Course created successfully: ${createdCourse.id}`);
      return createdCourse;
    } catch (error) {
      this.logger.error('[CourseRepository] Course creation failed:', error);
      throw error;
    }
  }

  /**
   * Find course by ID with business context
   */
  async findById(courseId) {
    try {
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      const collection = this.db.collection(this.collectionName);
      const course = await collection.findOne({ _id: this.objectId(courseId) });

      if (!course) {
        return null;
      }

      // Convert to business entity
      return this.toCourseEntity(course);
    } catch (error) {
      this.logger.error('[CourseRepository] Find by ID failed:', error);
      throw error;
    }
  }

  /**
   * Find course by code (business identifier)
   */
  async findByCode(courseCode) {
    try {
      if (!courseCode) {
        return null;
      }

      const collection = this.db.collection(this.collectionName);
      const course = await collection.findOne({ code: courseCode });

      return course ? this.toCourseEntity(course) : null;
    } catch (error) {
      this.logger.error('[CourseRepository] Find by code failed:', error);
      throw error;
    }
  }

  /**
   * Find courses with business filtering
   *
   * Business Logic:
   * - Filters by enrollment eligibility
   * - Applies access control rules
   * - Includes business analytics
   * - Supports pagination for performance
   */
  async findAll(options = {}) {
    try {
      const {
        status,
        type,
        level,
        isActive,
        farmerId,
        includeEnrollmentCheck,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = -1,
      } = options;

      const collection = this.db.collection(this.collectionName);

      // Build query with business logic
      const query = await this.buildBusinessQuery({
        status,
        type,
        level,
        isActive,
        farmerId,
        includeEnrollmentCheck,
      });

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const courses = await collection
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Convert to business entities
      const courseEntities = courses.map(course => this.toCourseEntity(course));

      // Add enrollment eligibility if requested
      if (includeEnrollmentCheck && farmerId) {
        for (const course of courseEntities) {
          course.enrollmentEligibility = await this.checkEnrollmentEligibility(course.id, farmerId);
        }
      }

      // Get total count for pagination
      const totalCount = await collection.countDocuments(query);

      return {
        courses: courseEntities,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error('[CourseRepository] Find all failed:', error);
      throw error;
    }
  }

  /**
   * Update course with business validation and audit trail
   */
  async update(courseId, updateData) {
    try {
      this.logger.log(`[CourseRepository] Updating course: ${courseId}`);

      // Validate update data
      await this.validateCourseUpdate(courseId, updateData);

      const collection = this.db.collection(this.collectionName);

      // Get current course for audit trail
      const currentCourse = await this.findById(courseId);
      if (!currentCourse) {
        throw new Error('Course not found');
      }

      // Prepare update with business logic
      const update = {
        ...updateData,
        updatedAt: new Date(),
        version: (currentCourse.version || 1) + 1,
      };

      // Add audit trail entry
      if (this.businessRules.auditTrailEnabled) {
        const auditEntry = {
          action: 'UPDATED',
          timestamp: new Date(),
          userId: updateData.updatedBy,
          changes: this.generateChangesSummary(currentCourse, updateData),
        };

        update.$push = { auditTrail: auditEntry };
      }

      // Execute update
      const result = await collection.updateOne({ _id: this.objectId(courseId) }, { $set: update });

      if (result.matchedCount === 0) {
        throw new Error('Course not found');
      }

      // Return updated course
      const updatedCourse = await this.findById(courseId);

      this.logger.log(`[CourseRepository] Course updated successfully: ${courseId}`);
      return updatedCourse;
    } catch (error) {
      this.logger.error('[CourseRepository] Course update failed:', error);
      throw error;
    }
  }

  /**
   * Delete course with business rules validation
   */
  async delete(courseId, deletedBy) {
    try {
      this.logger.log(`[CourseRepository] Deleting course: ${courseId}`);

      // Check business rules for deletion
      await this.validateCourseDeletion(courseId);

      const collection = this.db.collection(this.collectionName);

      // Soft delete by updating status
      const result = await collection.updateOne(
        { _id: this.objectId(courseId) },
        {
          $set: {
            status: Course.STATUS.ARCHIVED,
            deletedAt: new Date(),
            deletedBy: deletedBy,
            updatedAt: new Date(),
          },
          $push: {
            auditTrail: {
              action: 'DELETED',
              timestamp: new Date(),
              userId: deletedBy,
              changes: 'Course archived/deleted',
            },
          },
        },
      );

      if (result.matchedCount === 0) {
        throw new Error('Course not found');
      }

      this.logger.log(`[CourseRepository] Course deleted successfully: ${courseId}`);
      return { success: true, deletedId: courseId };
    } catch (error) {
      this.logger.error('[CourseRepository] Course deletion failed:', error);
      throw error;
    }
  }

  /**
   * Check enrollment eligibility with business rules
   *
   * Business Logic:
   * - Validates prerequisite completion
   * - Checks enrollment limits
   * - Validates farmer eligibility
   * - Applies business restrictions
   */
  async checkEnrollmentEligibility(courseId, farmerId) {
    try {
      const course = await this.findById(courseId);
      if (!course) {
        return { eligible: false, reason: 'Course not found' };
      }

      // Check course availability
      if (course.status !== Course.STATUS.PUBLISHED) {
        return { eligible: false, reason: 'Course not available for enrollment' };
      }

      // Check enrollment capacity
      if (
        course.maxEnrollments &&
        course.businessMetadata?.enrollmentCount >= course.maxEnrollments
      ) {
        return { eligible: false, reason: 'Course enrollment capacity reached' };
      }

      // Check enrollment period
      if (course.enrollmentStartDate && new Date() < new Date(course.enrollmentStartDate)) {
        return { eligible: false, reason: 'Enrollment period has not started' };
      }

      if (course.enrollmentEndDate && new Date() > new Date(course.enrollmentEndDate)) {
        return { eligible: false, reason: 'Enrollment period has ended' };
      }

      // Check prerequisites
      if (this.businessRules.prerequisiteCheckEnabled && course.prerequisites?.length > 0) {
        const prerequisiteCheck = await this.validatePrerequisites(course.prerequisites, farmerId);
        if (!prerequisiteCheck.satisfied) {
          return {
            eligible: false,
            reason: `Prerequisites not met: ${prerequisiteCheck.missing.join(', ')}`,
          };
        }
      }

      // Check farmer enrollment limits
      const farmerEnrollmentCount = await this.getFarmerActiveEnrollmentCount(farmerId);
      if (farmerEnrollmentCount >= this.businessRules.maxCoursesPerFarmer) {
        return {
          eligible: false,
          reason: `Maximum concurrent enrollments reached (${this.businessRules.maxCoursesPerFarmer})`,
        };
      }

      return {
        eligible: true,
        course: course,
        businessRules: {
          prerequisitesSatisfied: true,
          enrollmentLimitOk: true,
          courseAvailable: true,
        },
      };
    } catch (error) {
      this.logger.error('[CourseRepository] Eligibility check failed:', error);
      return { eligible: false, reason: 'Eligibility check failed' };
    }
  }

  /**
   * Get course analytics and business metrics
   */
  async getCourseAnalytics(courseId) {
    try {
      const course = await this.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Calculate business metrics
      const analytics = {
        courseId: course.id,
        enrollmentMetrics: {
          totalEnrollments: course.businessMetadata?.enrollmentCount || 0,
          activeEnrollments: await this.getActiveEnrollmentCount(courseId),
          completionRate: course.businessMetadata?.completionRate || 0,
          averageScore: course.businessMetadata?.averageScore || 0,
        },
        performanceMetrics: {
          averageCompletionTime: await this.getAverageCompletionTime(courseId),
          dropoutRate: await this.getDropoutRate(courseId),
          satisfactionScore: await this.getSatisfactionScore(courseId),
        },
        businessMetrics: {
          revenueGenerated: 0, // Would calculate based on course fees
          costPerCompletion: 0, // Would calculate operational costs
          roi: 0, // Return on investment calculation
        },
        lastUpdated: new Date(),
      };

      return analytics;
    } catch (error) {
      this.logger.error('[CourseRepository] Analytics calculation failed:', error);
      throw error;
    }
  }

  // Private helper methods for business logic

  /**
   * Validate course creation against business rules
   */
  async validateCourseCreation(courseData) {
    if (!courseData.name || courseData.name.length < 3) {
      throw new Error('Course name must be at least 3 characters');
    }

    if (!courseData.code || !/^[A-Z0-9-]{3,10}$/.test(courseData.code)) {
      throw new Error('Course code must be 3-10 uppercase alphanumeric characters');
    }

    if (!courseData.type || !Object.values(Course.TYPE).includes(courseData.type)) {
      throw new Error('Valid course type is required');
    }
  }

  /**
   * Validate course update
   */
  async validateCourseUpdate(courseId, updateData) {
    // Business rule: Can't change fundamental properties after enrollments exist
    const enrollmentCount = await this.getActiveEnrollmentCount(courseId);

    if (enrollmentCount > 0) {
      const restrictedFields = ['code', 'type', 'passingScore'];
      const hasRestrictedChanges = restrictedFields.some(field => updateData.hasOwnProperty(field));

      if (hasRestrictedChanges) {
        throw new Error('Cannot modify course structure after enrollments exist');
      }
    }
  }

  /**
   * Validate course deletion
   */
  async validateCourseDeletion(courseId) {
    const activeEnrollments = await this.getActiveEnrollmentCount(courseId);

    if (activeEnrollments > 0) {
      throw new Error('Cannot delete course with active enrollments');
    }
  }

  /**
   * Build business query based on criteria
   */
  async buildBusinessQuery(criteria) {
    const query = {};

    if (criteria.status) {
      query.status = criteria.status;
    }

    if (criteria.type) {
      query.type = criteria.type;
    }

    if (criteria.level) {
      query.level = criteria.level;
    }

    if (criteria.isActive !== undefined) {
      query.status = criteria.isActive
        ? { $in: [Course.STATUS.PUBLISHED, Course.STATUS.DRAFT] }
        : { $in: [Course.STATUS.ARCHIVED] };
    }

    // Exclude deleted/archived by default
    if (!query.status) {
      query.status = { $ne: Course.STATUS.ARCHIVED };
    }

    return query;
  }

  /**
   * Validate prerequisites for enrollment
   */
  async validatePrerequisites(prerequisites, farmerId) {
    // Simplified implementation - would check completion records
    return {
      satisfied: true,
      missing: [],
    };
  }

  /**
   * Get farmer's active enrollment count
   */
  async getFarmerActiveEnrollmentCount(farmerId) {
    // Would query enrollment collection
    return 0; // Simplified for now
  }

  /**
   * Get active enrollment count for course
   */
  async getActiveEnrollmentCount(courseId) {
    // Would query enrollment collection
    return 0; // Simplified for now
  }

  /**
   * Get average completion time
   */
  async getAverageCompletionTime(courseId) {
    // Would calculate from enrollment completion data
    return 0; // Simplified for now
  }

  /**
   * Get dropout rate
   */
  async getDropoutRate(courseId) {
    // Would calculate from enrollment data
    return 0; // Simplified for now
  }

  /**
   * Get satisfaction score
   */
  async getSatisfactionScore(courseId) {
    // Would calculate from feedback data
    return 0; // Simplified for now
  }

  /**
   * Generate changes summary for audit trail
   */
  generateChangesSummary(originalCourse, updateData) {
    const changes = [];

    Object.keys(updateData).forEach(key => {
      if (originalCourse[key] !== updateData[key]) {
        changes.push(`${key}: ${originalCourse[key]} → ${updateData[key]}`);
      }
    });

    return changes.join(', ') || 'No significant changes';
  }

  /**
   * Convert database document to Course entity
   */
  toCourseEntity(courseDoc) {
    return {
      id: courseDoc._id.toString(),
      ...courseDoc,
      _id: undefined, // Remove MongoDB internal ID
    };
  }

  /**
   * Convert string ID to MongoDB ObjectId
   */
  objectId(id) {
    const { ObjectId } = require('mongodb');
    return new ObjectId(id);
  }
}

module.exports = CourseRepository;
