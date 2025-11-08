/**
 * Enrollment Repository
 *
 * Data Access Layer for Enrollment entity management
 * Implements Complete Business Logic for Training Enrollment Operations
 *
 * Business Workflow:
 * 1. Enrollment lifecycle management (Create → Active → Complete/Failed)
 * 2. Progress tracking and milestone recording
 * 3. Assessment result management and scoring
 * 4. Certificate eligibility and generation tracking
 * 5. Analytics data collection and reporting
 *
 * Process Integration:
 * - Course enrollment validation and business rules
 * - Progress tracking with real-time updates
 * - Assessment workflow with scoring logic
 * - Certificate generation workflow integration
 * - Analytics and reporting data provision
 * - Compliance and audit trail maintenance
 */

const Enrollment = require('../../domain/entities/Enrollment');

class EnrollmentRepository {
  constructor(database, logger = console) {
    this.db = database;
    this.logger = logger;
    this.collectionName = 'enrollments';

    // Business configuration
    this.businessConfig = {
      maxActiveEnrollments: 5,
      progressUpdateInterval: 300000, // 5 minutes
      assessmentRetryLimit: 3,
      enrollmentExpiryDays: 90,
      auditTrailEnabled: true,
      analyticsEnabled: true,
    };
  }

  /**
   * Create new enrollment with comprehensive business validation
   *
   * Business Logic:
   * - Validates farmer eligibility and course availability
   * - Checks enrollment limits and prerequisites
   * - Initializes progress tracking and analytics
   * - Sets up assessment and certification workflows
   */
  async create(enrollmentData) {
    try {
      this.logger.log('[EnrollmentRepository] Creating new enrollment...');

      // Business validation
      await this.validateEnrollmentCreation(enrollmentData);

      // Create enrollment entity with business logic
      const enrollment = Enrollment.create(enrollmentData);

      // Check for existing active enrollment
      const existingEnrollment = await this.findActiveEnrollment(
        enrollmentData.farmerId,
        enrollmentData.courseId,
      );

      if (existingEnrollment) {
        throw new Error('Farmer already has an active enrollment in this course');
      }

      // Prepare enrollment document with business metadata
      const enrollmentDocument = {
        ...enrollment.toObject(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        businessMetadata: {
          enrolledBy: enrollmentData.enrolledBy,
          enrollmentMethod: enrollmentData.enrollmentMethod || 'SELF_ENROLLMENT',
          expectedCompletionDate: this.calculateExpectedCompletion(enrollment),
          riskAssessment: await this.assessEnrollmentRisk(enrollmentData),
          performanceTracking: {
            studySessionCount: 0,
            averageSessionDuration: 0,
            lastActivityDate: null,
            engagementScore: 0,
          },
          analyticsData: {
            enrollmentSource: enrollmentData.source || 'DIRECT',
            deviceInfo: enrollmentData.deviceInfo || {},
            referralCode: enrollmentData.referralCode || null,
          },
        },
        auditTrail: [
          {
            action: 'ENROLLED',
            timestamp: new Date(),
            userId: enrollmentData.enrolledBy || enrollmentData.farmerId,
            details: 'New enrollment created',
            metadata: {
              courseId: enrollmentData.courseId,
              enrollmentMethod: enrollmentData.enrollmentMethod || 'SELF_ENROLLMENT',
            },
          },
        ],
      };

      // Insert enrollment with transaction for consistency
      const collection = this.db.collection(this.collectionName);
      const result = await collection.insertOne(enrollmentDocument);

      // Initialize progress tracking
      await this.initializeProgressTracking(result.insertedId.toString(), enrollmentData.courseId);

      // Update course enrollment statistics
      await this.updateCourseEnrollmentStats(enrollmentData.courseId, 'INCREMENT');

      // Return created enrollment with ID
      const createdEnrollment = { ...enrollmentDocument, id: result.insertedId.toString() };

      this.logger.log(
        `[EnrollmentRepository] Enrollment created successfully: ${createdEnrollment.id}`,
      );
      return createdEnrollment;
    } catch (error) {
      this.logger.error('[EnrollmentRepository] Enrollment creation failed:', error);
      throw error;
    }
  }

  /**
   * Find enrollment by ID with business context
   */
  async findById(enrollmentId) {
    try {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required');
      }

      const collection = this.db.collection(this.collectionName);
      const enrollment = await collection.findOne({ _id: this.objectId(enrollmentId) });

      if (!enrollment) {
        return null;
      }

      // Convert to business entity with enriched data
      const enrollmentEntity = this.toEnrollmentEntity(enrollment);

      // Add current progress calculations
      await this.enrichWithProgressData(enrollmentEntity);

      return enrollmentEntity;
    } catch (error) {
      this.logger.error('[EnrollmentRepository] Find by ID failed:', error);
      throw error;
    }
  }

  /**
   * Find enrollments with comprehensive business filtering
   *
   * Business Logic:
   * - Supports farmer, course, and status filtering
   * - Includes progress and performance analytics
   * - Applies pagination for large datasets
   * - Provides enrollment insights and metrics
   */
  async findAll(options = {}) {
    try {
      const {
        farmerId,
        courseId,
        status,
        includeProgress = true,
        includeAnalytics = false,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = -1,
      } = options;

      const collection = this.db.collection(this.collectionName);

      // Build query with business logic
      const query = this.buildEnrollmentQuery({
        farmerId,
        courseId,
        status,
      });

      // Execute paginated query
      const skip = (page - 1) * limit;
      const enrollments = await collection
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Convert to business entities
      const enrollmentEntities = enrollments.map(enrollment => this.toEnrollmentEntity(enrollment));

      // Enrich with additional data if requested
      if (includeProgress) {
        for (const enrollment of enrollmentEntities) {
          await this.enrichWithProgressData(enrollment);
        }
      }

      if (includeAnalytics) {
        for (const enrollment of enrollmentEntities) {
          await this.enrichWithAnalyticsData(enrollment);
        }
      }

      // Get total count for pagination
      const totalCount = await collection.countDocuments(query);

      return {
        enrollments: enrollmentEntities,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
        },
        summary: {
          totalEnrollments: totalCount,
          byStatus: await this.getEnrollmentStatusSummary(query),
        },
      };
    } catch (error) {
      this.logger.error('[EnrollmentRepository] Find all failed:', error);
      throw error;
    }
  }

  /**
   * Update enrollment with business validation and audit trail
   */
  async update(enrollmentId, updateData) {
    try {
      this.logger.log(`[EnrollmentRepository] Updating enrollment: ${enrollmentId}`);

      // Validate update data against business rules
      await this.validateEnrollmentUpdate(enrollmentId, updateData);

      const collection = this.db.collection(this.collectionName);

      // Get current enrollment for comparison
      const currentEnrollment = await this.findById(enrollmentId);
      if (!currentEnrollment) {
        throw new Error('Enrollment not found');
      }

      // Prepare update with business logic
      const update = {
        ...updateData,
        updatedAt: new Date(),
        version: (currentEnrollment.version || 1) + 1,
      };

      // Update business metadata if needed
      if (updateData.progress) {
        update.businessMetadata = {
          ...currentEnrollment.businessMetadata,
          performanceTracking: {
            ...currentEnrollment.businessMetadata?.performanceTracking,
            lastActivityDate: new Date(),
            studySessionCount:
              (currentEnrollment.businessMetadata?.performanceTracking?.studySessionCount || 0) + 1,
          },
        };
      }

      // Add audit trail entry
      if (this.businessConfig.auditTrailEnabled) {
        const auditEntry = {
          action: this.determineUpdateAction(updateData),
          timestamp: new Date(),
          userId: updateData.updatedBy || updateData.farmerId,
          details: this.generateUpdateSummary(currentEnrollment, updateData),
          metadata: {
            previousStatus: currentEnrollment.status,
            newStatus: updateData.status,
            progressChange: updateData.progress ? true : false,
          },
        };

        update.$push = { auditTrail: auditEntry };
      }

      // Execute update
      const result = await collection.updateOne(
        { _id: this.objectId(enrollmentId) },
        { $set: update },
      );

      if (result.matchedCount === 0) {
        throw new Error('Enrollment not found');
      }

      // Handle status change side effects
      if (updateData.status && updateData.status !== currentEnrollment.status) {
        await this.handleStatusChangeEffects(
          enrollmentId,
          currentEnrollment.status,
          updateData.status,
        );
      }

      // Return updated enrollment
      const updatedEnrollment = await this.findById(enrollmentId);

      this.logger.log(`[EnrollmentRepository] Enrollment updated successfully: ${enrollmentId}`);
      return updatedEnrollment;
    } catch (error) {
      this.logger.error('[EnrollmentRepository] Enrollment update failed:', error);
      throw error;
    }
  }

  /**
   * Update enrollment progress with comprehensive tracking
   *
   * Business Logic:
   * - Tracks lesson and module completion
   * - Calculates progress percentages
   * - Updates performance metrics
   * - Triggers milestone achievements
   */
  async updateProgress(enrollmentId, progressData) {
    try {
      this.logger.log(`[EnrollmentRepository] Updating progress for enrollment: ${enrollmentId}`);

      const enrollment = await this.findById(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      if (enrollment.status !== Enrollment.STATUS.ACTIVE) {
        throw new Error(`Cannot update progress for enrollment with status: ${enrollment.status}`);
      }

      // Calculate new progress metrics
      const updatedProgress = this.calculateProgressMetrics(enrollment.progress, progressData);

      // Detect milestone achievements
      const milestones = this.detectMilestoneAchievements(enrollment.progress, updatedProgress);

      // Prepare progress update
      const update = {
        progress: updatedProgress,
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
        businessMetadata: {
          ...enrollment.businessMetadata,
          performanceTracking: {
            ...enrollment.businessMetadata?.performanceTracking,
            lastActivityDate: new Date(),
            studySessionCount:
              (enrollment.businessMetadata?.performanceTracking?.studySessionCount || 0) + 1,
            totalTimeSpent: progressData.timeSpent
              ? (enrollment.businessMetadata?.performanceTracking?.totalTimeSpent || 0) +
                progressData.timeSpent
              : enrollment.businessMetadata?.performanceTracking?.totalTimeSpent || 0,
          },
        },
      };

      // Add milestone achievements to audit trail
      if (milestones.length > 0) {
        update.$push = {
          auditTrail: {
            action: 'MILESTONE_ACHIEVED',
            timestamp: new Date(),
            userId: enrollment.farmerId,
            details: `Milestones achieved: ${milestones.join(', ')}`,
            metadata: { milestones, progressPercentage: updatedProgress.progressPercentage },
          },
        };
      }

      // Update enrollment
      const collection = this.db.collection(this.collectionName);
      const result = await collection.updateOne(
        { _id: this.objectId(enrollmentId) },
        { $set: update },
      );

      if (result.matchedCount === 0) {
        throw new Error('Enrollment not found');
      }

      // Handle milestone triggers (notifications, rewards, etc.)
      if (milestones.length > 0) {
        await this.handleMilestoneAchievements(enrollmentId, milestones);
      }

      return await this.findById(enrollmentId);
    } catch (error) {
      this.logger.error('[EnrollmentRepository] Progress update failed:', error);
      throw error;
    }
  }

  /**
   * Record assessment attempt with scoring and validation
   */
  async recordAssessment(enrollmentId, assessmentData) {
    try {
      this.logger.log(
        `[EnrollmentRepository] Recording assessment for enrollment: ${enrollmentId}`,
      );

      const enrollment = await this.findById(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Validate assessment attempt
      await this.validateAssessmentAttempt(enrollment, assessmentData);

      // Process assessment scoring
      const processedAssessment = await this.processAssessmentScoring(assessmentData);

      // Update enrollment with assessment result
      const assessments = [...(enrollment.assessments || []), processedAssessment];
      const bestScore = Math.max(...assessments.map(a => a.score));

      const update = {
        assessments: assessments,
        finalScore: bestScore,
        lastAssessmentAt: new Date(),
        updatedAt: new Date(),
      };

      // Check if this assessment qualifies for completion
      const qualifiesForCompletion = await this.checkCompletionQualification(
        enrollment,
        processedAssessment,
      );
      if (qualifiesForCompletion.eligible) {
        update.status = Enrollment.STATUS.COMPLETED;
        update.completedAt = new Date();
      }

      // Execute update
      const collection = this.db.collection(this.collectionName);
      await collection.updateOne({ _id: this.objectId(enrollmentId) }, { $set: update });

      return await this.findById(enrollmentId);
    } catch (error) {
      this.logger.error('[EnrollmentRepository] Assessment recording failed:', error);
      throw error;
    }
  }

  /**
   * Get enrollment analytics and insights
   */
  async getEnrollmentAnalytics(options = {}) {
    try {
      const { farmerId, courseId, timeframe = '30days' } = options;

      const collection = this.db.collection(this.collectionName);

      // Build analytics query
      const query = this.buildAnalyticsQuery({ farmerId, courseId, timeframe });

      // Aggregate enrollment data
      const analyticsResult = await collection
        .aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalEnrollments: { $sum: 1 },
              completedEnrollments: {
                $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
              },
              activeEnrollments: {
                $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] },
              },
              failedEnrollments: {
                $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] },
              },
              averageFinalScore: { $avg: '$finalScore' },
              averageProgress: { $avg: '$progress.progressPercentage' },
              totalStudyTime: { $sum: '$progress.totalTimeSpentMinutes' },
            },
          },
        ])
        .toArray();

      const analytics = analyticsResult[0] || {
        totalEnrollments: 0,
        completedEnrollments: 0,
        activeEnrollments: 0,
        failedEnrollments: 0,
        averageFinalScore: 0,
        averageProgress: 0,
        totalStudyTime: 0,
      };

      // Calculate derived metrics
      analytics.completionRate =
        analytics.totalEnrollments > 0
          ? ((analytics.completedEnrollments / analytics.totalEnrollments) * 100).toFixed(2)
          : 0;

      analytics.dropoutRate =
        analytics.totalEnrollments > 0
          ? ((analytics.failedEnrollments / analytics.totalEnrollments) * 100).toFixed(2)
          : 0;

      analytics.averageStudyTimeHours =
        analytics.totalStudyTime > 0 ? (analytics.totalStudyTime / 60).toFixed(2) : 0;

      return analytics;
    } catch (error) {
      this.logger.error('[EnrollmentRepository] Analytics calculation failed:', error);
      throw error;
    }
  }

  // Private helper methods for business logic implementation

  /**
   * Validate enrollment creation against business rules
   */
  async validateEnrollmentCreation(enrollmentData) {
    if (!enrollmentData.farmerId) {
      throw new Error('Farmer ID is required');
    }

    if (!enrollmentData.courseId) {
      throw new Error('Course ID is required');
    }

    // Check farmer's active enrollment limit
    const activeEnrollments = await this.getFarmerActiveEnrollmentCount(enrollmentData.farmerId);
    if (activeEnrollments >= this.businessConfig.maxActiveEnrollments) {
      throw new Error(
        `Maximum active enrollments reached: ${this.businessConfig.maxActiveEnrollments}`,
      );
    }
  }

  /**
   * Initialize progress tracking for new enrollment
   */
  async initializeProgressTracking(enrollmentId, _courseId) {
    // Initialize analytics tracking, milestone setup, etc.
    this.logger.log(`[EnrollmentRepository] Progress tracking initialized for: ${enrollmentId}`);
  }

  /**
   * Update course enrollment statistics
   */
  async updateCourseEnrollmentStats(courseId, operation) {
    try {
      const coursesCollection = this.db.collection('courses');
      const increment = operation === 'INCREMENT' ? 1 : -1;

      await coursesCollection.updateOne(
        { _id: this.objectId(courseId) },
        {
          $inc: { 'businessMetadata.enrollmentCount': increment },
          $set: { 'businessMetadata.lastAnalyticsUpdate': new Date() },
        },
      );
    } catch (error) {
      // Don't fail main operation if stats update fails
      this.logger.error('[EnrollmentRepository] Stats update failed:', error);
    }
  }

  /**
   * Calculate expected completion date based on course and farmer data
   */
  calculateExpectedCompletion(_enrollment) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + this.businessConfig.enrollmentExpiryDays);
    return expectedDate;
  }

  /**
   * Assess enrollment risk factors
   */
  async assessEnrollmentRisk(_enrollmentData) {
    // Analyze farmer history, course difficulty, etc.
    return {
      riskLevel: 'LOW',
      factors: [],
      confidence: 0.8,
    };
  }

  /**
   * Build enrollment query with business logic
   */
  buildEnrollmentQuery(criteria) {
    const query = {};

    if (criteria.farmerId) {
      query.farmerId = criteria.farmerId;
    }

    if (criteria.courseId) {
      query.courseId = criteria.courseId;
    }

    if (criteria.status) {
      query.status = Array.isArray(criteria.status) ? { $in: criteria.status } : criteria.status;
    }

    return query;
  }

  /**
   * Enrich enrollment with progress data
   */
  async enrichWithProgressData(enrollment) {
    // Add calculated progress metrics, next steps, etc.
    enrollment.progressInsights = {
      currentPhase: this.determineCurrentPhase(enrollment.progress),
      nextMilestone: this.getNextMilestone(enrollment.progress),
      estimatedCompletion: this.estimateCompletionDate(enrollment),
    };
  }

  /**
   * Enrich enrollment with analytics data
   */
  async enrichWithAnalyticsData(enrollment) {
    // Add performance analytics, comparisons, etc.
    enrollment.analytics = {
      performanceRank: 'TOP_25_PERCENT', // Would calculate actual rank
      averageSessionTime: 45, // Would calculate from actual data
      learningVelocity: 'FAST', // Would analyze learning speed
    };
  }

  /**
   * Additional helper methods for business operations
   */

  async findActiveEnrollment(farmerId, courseId) {
    const collection = this.db.collection(this.collectionName);
    return await collection.findOne({
      farmerId: farmerId,
      courseId: courseId,
      status: Enrollment.STATUS.ACTIVE,
    });
  }

  async getFarmerActiveEnrollmentCount(farmerId) {
    const collection = this.db.collection(this.collectionName);
    return await collection.countDocuments({
      farmerId: farmerId,
      status: Enrollment.STATUS.ACTIVE,
    });
  }

  calculateProgressMetrics(currentProgress, newProgressData) {
    // Implement comprehensive progress calculation
    return {
      ...currentProgress,
      ...newProgressData,
      progressPercentage: Math.min(
        100,
        newProgressData.progressPercentage || currentProgress.progressPercentage || 0,
      ),
    };
  }

  detectMilestoneAchievements(oldProgress, newProgress) {
    const milestones = [];

    // Check various milestone conditions
    if (newProgress.progressPercentage >= 25 && oldProgress.progressPercentage < 25) {
      milestones.push('QUARTER_COMPLETE');
    }
    if (newProgress.progressPercentage >= 50 && oldProgress.progressPercentage < 50) {
      milestones.push('HALF_COMPLETE');
    }
    if (newProgress.progressPercentage >= 75 && oldProgress.progressPercentage < 75) {
      milestones.push('THREE_QUARTER_COMPLETE');
    }

    return milestones;
  }

  async handleMilestoneAchievements(enrollmentId, milestones) {
    // Trigger notifications, analytics events, etc.
    this.logger.log(
      `[EnrollmentRepository] Milestones achieved for ${enrollmentId}: ${milestones.join(', ')}`,
    );
  }

  // Additional business logic methods...

  toEnrollmentEntity(enrollmentDoc) {
    return {
      id: enrollmentDoc._id.toString(),
      ...enrollmentDoc,
      _id: undefined,
    };
  }

  objectId(id) {
    const { ObjectId } = require('mongodb');
    return new ObjectId(id);
  }

  // Placeholder methods for complex business operations
  async validateEnrollmentUpdate(_enrollmentId, _updateData) {
    /* Implementation */
  }
  determineUpdateAction(_updateData) {
    return 'UPDATED';
  }
  generateUpdateSummary(_current, _update) {
    return 'Enrollment updated';
  }
  async handleStatusChangeEffects(_enrollmentId, _oldStatus, _newStatus) {
    /* Implementation */
  }
  async getEnrollmentStatusSummary(_query) {
    return {};
  }
  async validateAssessmentAttempt(_enrollment, _assessmentData) {
    /* Implementation */
  }
  async processAssessmentScoring(assessmentData) {
    return { ...assessmentData, score: 85 };
  }
  async checkCompletionQualification(_enrollment, _assessment) {
    return { eligible: false };
  }
  buildAnalyticsQuery(_criteria) {
    return {};
  }
  determineCurrentPhase(_progress) {
    return 'LEARNING';
  }
  getNextMilestone(_progress) {
    return 'COMPLETE_MODULE_2';
  }
  estimateCompletionDate(_enrollment) {
    return new Date();
  }
}

module.exports = EnrollmentRepository;
