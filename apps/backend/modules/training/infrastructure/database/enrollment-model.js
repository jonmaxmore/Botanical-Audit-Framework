/**
 * MongoDB Enrollment Repository Implementation
 *
 * Implements IEnrollmentRepository interface using MongoDB/Mongoose.
 * Part of Clean Architecture - Infrastructure Layer
 */

const mongoose = require('mongoose');
const Enrollment = require('../../domain/entities/Enrollment');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('training-enrollment-db');

// Mongoose Schema
const enrollmentSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },

    status: {
      type: String,
      enum: Object.values(Enrollment.STATUS),
      default: Enrollment.STATUS.ACTIVE,
    },

    progress: {
      completedModules: [String],
      completedLessons: [String],
      currentModuleId: String,
      currentLessonId: String,
      progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
      totalTimeSpentMinutes: { type: Number, default: 0 },
    },

    assessments: [
      {
        assessmentId: String,
        score: Number,
        answers: mongoose.Schema.Types.Mixed,
        timeSpentMinutes: Number,
        submittedAt: Date,
      },
    ],

    finalScore: { type: Number, min: 0, max: 100 },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    attemptCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },

    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    certificateIssuedAt: Date,

    enrolledAt: { type: Date, default: Date.now },
    startedAt: Date,
    completedAt: Date,
    expiresAt: Date,
    lastAccessedAt: Date,

    enrolledBy: mongoose.Schema.Types.ObjectId,
    notes: String,
  },
  {
    timestamps: true,
    collection: 'enrollments',
  },
);

// Indexes
enrollmentSchema.index({ farmerId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ farmerId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ expiresAt: 1 });
enrollmentSchema.index({ enrolledAt: -1 });
enrollmentSchema.index({ completedAt: -1 });

class MongoDBEnrollmentRepository {
  constructor(database) {
    this.EnrollmentModel = database.model('Enrollment', enrollmentSchema);
  }

  // Convert MongoDB document to Domain Entity
  toDomain(doc) {
    if (!doc) {
      return null;
    }

    const data = doc.toObject ? doc.toObject() : doc;
    return new Enrollment({
      id: data._id.toString(),
      ...data,
      farmerId: data.farmerId?.toString(),
      courseId: data.courseId?.toString(),
      certificateId: data.certificateId?.toString(),
      enrolledBy: data.enrolledBy?.toString(),
    });
  }

  // Convert Domain Entity to MongoDB document
  toMongoDB(enrollment) {
    const data = { ...enrollment };
    if (enrollment.id) {
      data._id = mongoose.Types.ObjectId(enrollment.id);
      delete data.id;
    }
    if (enrollment.farmerId) {
      data.farmerId = mongoose.Types.ObjectId(enrollment.farmerId);
    }
    if (enrollment.courseId) {
      data.courseId = mongoose.Types.ObjectId(enrollment.courseId);
    }
    if (enrollment.certificateId) {
      data.certificateId = mongoose.Types.ObjectId(enrollment.certificateId);
    }
    if (enrollment.enrolledBy) {
      data.enrolledBy = mongoose.Types.ObjectId(enrollment.enrolledBy);
    }
    return data;
  }

  async save(enrollment) {
    try {
      const data = this.toMongoDB(enrollment);

      if (data._id) {
        // Update existing
        const updated = await this.EnrollmentModel.findByIdAndUpdate(data._id, data, {
          new: true,
          runValidators: true,
        });
        return this.toDomain(updated);
      } else {
        // Create new
        const created = await this.EnrollmentModel.create(data);
        return this.toDomain(created);
      }
    } catch (error) {
      logger.error('Error saving enrollment:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const doc = await this.EnrollmentModel.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding enrollment by ID:', error);
      return null;
    }
  }

  async findByFarmerAndCourse(farmerId, courseId) {
    try {
      const doc = await this.EnrollmentModel.findOne({
        farmerId: mongoose.Types.ObjectId(farmerId),
        courseId: mongoose.Types.ObjectId(courseId),
      });
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding enrollment by farmer and course:', error);
      return null;
    }
  }

  async findByFarmerId(farmerId, filters = {}, options = {}) {
    try {
      const query = { farmerId: mongoose.Types.ObjectId(farmerId) };

      if (filters.status) {
        query.status = filters.status;
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { enrolledAt: -1 };

      const [docs, total] = await Promise.all([
        this.EnrollmentModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('courseId', 'code title titleEn thumbnailUrl'),
        this.EnrollmentModel.countDocuments(query),
      ]);

      return {
        enrollments: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding enrollments by farmer:', error);
      throw error;
    }
  }

  async findByCourseId(courseId, filters = {}, options = {}) {
    try {
      const query = { courseId: mongoose.Types.ObjectId(courseId) };

      if (filters.status) {
        query.status = filters.status;
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { enrolledAt: -1 };

      const [docs, total] = await Promise.all([
        this.EnrollmentModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('farmerId', 'firstName lastName email phoneNumber'),
        this.EnrollmentModel.countDocuments(query),
      ]);

      return {
        enrollments: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding enrollments by course:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      const query = { status };

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { enrolledAt: -1 };

      const [docs, total] = await Promise.all([
        this.EnrollmentModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('courseId', 'code title')
          .populate('farmerId', 'firstName lastName'),
        this.EnrollmentModel.countDocuments(query),
      ]);

      return {
        enrollments: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding enrollments by status:', error);
      throw error;
    }
  }

  async findActiveByFarmer(farmerId) {
    try {
      const docs = await this.EnrollmentModel.find({
        farmerId: mongoose.Types.ObjectId(farmerId),
        status: Enrollment.STATUS.ACTIVE,
      })
        .sort({ lastAccessedAt: -1 })
        .populate('courseId', 'code title titleEn thumbnailUrl');

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding active enrollments:', error);
      throw error;
    }
  }

  async findCompletedByFarmer(farmerId) {
    try {
      const docs = await this.EnrollmentModel.find({
        farmerId: mongoose.Types.ObjectId(farmerId),
        status: Enrollment.STATUS.COMPLETED,
      })
        .sort({ completedAt: -1 })
        .populate('courseId', 'code title titleEn');

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding completed enrollments:', error);
      throw error;
    }
  }

  async findExpiringSoon(daysThreshold = 7) {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const docs = await this.EnrollmentModel.find({
        status: Enrollment.STATUS.ACTIVE,
        expiresAt: {
          $ne: null,
          $lte: thresholdDate,
          $gt: new Date(),
        },
      })
        .sort({ expiresAt: 1 })
        .populate('courseId', 'code title')
        .populate('farmerId', 'firstName lastName email');

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding expiring enrollments:', error);
      throw error;
    }
  }

  async isEnrolled(farmerId, courseId) {
    try {
      const count = await this.EnrollmentModel.countDocuments({
        farmerId: mongoose.Types.ObjectId(farmerId),
        courseId: mongoose.Types.ObjectId(courseId),
        status: { $in: [Enrollment.STATUS.ACTIVE, Enrollment.STATUS.COMPLETED] },
      });
      return count > 0;
    } catch (error) {
      logger.error('Error checking enrollment:', error);
      return false;
    }
  }

  async hasCompleted(farmerId, courseId) {
    try {
      const count = await this.EnrollmentModel.countDocuments({
        farmerId: mongoose.Types.ObjectId(farmerId),
        courseId: mongoose.Types.ObjectId(courseId),
        status: Enrollment.STATUS.COMPLETED,
      });
      return count > 0;
    } catch (error) {
      logger.error('Error checking completion:', error);
      return false;
    }
  }

  async count(criteria = {}) {
    try {
      return await this.EnrollmentModel.countDocuments(criteria);
    } catch (error) {
      logger.error('Error counting enrollments:', error);
      return 0;
    }
  }

  async getStatistics(filters = {}) {
    try {
      const matchStage = {};

      if (filters.courseId) {
        matchStage.courseId = mongoose.Types.ObjectId(filters.courseId);
      }
      if (filters.farmerId) {
        matchStage.farmerId = mongoose.Types.ObjectId(filters.farmerId);
      }
      if (filters.startDate || filters.endDate) {
        matchStage.enrolledAt = {};
        if (filters.startDate) {
          matchStage.enrolledAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          matchStage.enrolledAt.$lte = new Date(filters.endDate);
        }
      }

      const [
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        failedEnrollments,
        cancelledEnrollments,
        avgProgress,
        avgScore,
        byStatus,
      ] = await Promise.all([
        this.EnrollmentModel.countDocuments(matchStage),
        this.EnrollmentModel.countDocuments({ ...matchStage, status: Enrollment.STATUS.ACTIVE }),
        this.EnrollmentModel.countDocuments({ ...matchStage, status: Enrollment.STATUS.COMPLETED }),
        this.EnrollmentModel.countDocuments({ ...matchStage, status: Enrollment.STATUS.FAILED }),
        this.EnrollmentModel.countDocuments({ ...matchStage, status: Enrollment.STATUS.CANCELLED }),
        this.EnrollmentModel.aggregate([
          { $match: matchStage },
          { $group: { _id: null, avg: { $avg: '$progress.progressPercentage' } } },
        ]),
        this.EnrollmentModel.aggregate([
          { $match: { ...matchStage, finalScore: { $ne: null } } },
          { $group: { _id: null, avg: { $avg: '$finalScore' } } },
        ]),
        this.EnrollmentModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);

      const completionRate =
        totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

      return {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        failedEnrollments,
        cancelledEnrollments,
        completionRate,
        averageProgress: Math.round(avgProgress[0]?.avg || 0),
        averageScore: Math.round(avgScore[0]?.avg || 0),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('Error getting enrollment statistics:', error);
      throw error;
    }
  }

  async getFarmerProgressSummary(farmerId) {
    try {
      const [activeEnrollments, completedEnrollments, totalTimeSpent] = await Promise.all([
        this.EnrollmentModel.countDocuments({
          farmerId: mongoose.Types.ObjectId(farmerId),
          status: Enrollment.STATUS.ACTIVE,
        }),
        this.EnrollmentModel.countDocuments({
          farmerId: mongoose.Types.ObjectId(farmerId),
          status: Enrollment.STATUS.COMPLETED,
        }),
        this.EnrollmentModel.aggregate([
          { $match: { farmerId: mongoose.Types.ObjectId(farmerId) } },
          { $group: { _id: null, total: { $sum: '$progress.totalTimeSpentMinutes' } } },
        ]),
      ]);

      return {
        farmerId,
        activeEnrollments,
        completedEnrollments,
        totalEnrollments: activeEnrollments + completedEnrollments,
        totalTimeSpentMinutes: totalTimeSpent[0]?.total || 0,
      };
    } catch (error) {
      logger.error('Error getting farmer progress summary:', error);
      throw error;
    }
  }

  async getCourseEnrollmentSummary(courseId) {
    try {
      const enrollments = await this.EnrollmentModel.find({
        courseId: mongoose.Types.ObjectId(courseId),
      });

      const active = enrollments.filter(e => e.status === Enrollment.STATUS.ACTIVE).length;
      const completed = enrollments.filter(e => e.status === Enrollment.STATUS.COMPLETED).length;
      const failed = enrollments.filter(e => e.status === Enrollment.STATUS.FAILED).length;
      const cancelled = enrollments.filter(e => e.status === Enrollment.STATUS.CANCELLED).length;

      const avgProgress =
        enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + e.progress.progressPercentage, 0) /
            enrollments.length
          : 0;

      const completedScores = enrollments.filter(e => e.finalScore !== null).map(e => e.finalScore);
      const avgScore =
        completedScores.length > 0
          ? completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length
          : 0;

      return {
        courseId,
        totalEnrollments: enrollments.length,
        activeEnrollments: active,
        completedEnrollments: completed,
        failedEnrollments: failed,
        cancelledEnrollments: cancelled,
        completionRate:
          enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0,
        averageProgress: Math.round(avgProgress),
        averageScore: Math.round(avgScore),
      };
    } catch (error) {
      logger.error('Error getting course enrollment summary:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.EnrollmentModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Error deleting enrollment:', error);
      return false;
    }
  }
}

module.exports = MongoDBEnrollmentRepository;
