/**
 * MongoDB Course Repository Implementation
 *
 * Implements ICourseRepository interface using MongoDB/Mongoose.
 * Part of Clean Architecture - Infrastructure Layer
 */

const mongoose = require('mongoose');
const Course = require('../../domain/entities/Course');

// Mongoose Schema
const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    titleEn: { type: String },
    description: { type: String, required: true },
    descriptionEn: { type: String },

    // Classification
    type: {
      type: String,
      enum: Object.values(Course.TYPE),
      default: Course.TYPE.MANDATORY,
    },
    level: {
      type: String,
      enum: Object.values(Course.LEVEL),
      default: Course.LEVEL.BEGINNER,
    },
    status: {
      type: String,
      enum: Object.values(Course.STATUS),
      default: Course.STATUS.DRAFT,
    },

    // Structure
    modules: [
      {
        id: String,
        title: String,
        titleEn: String,
        description: String,
        order: Number,
        durationMinutes: Number,
        lessons: [
          {
            id: String,
            title: String,
            type: String, // VIDEO, DOCUMENT, QUIZ
            contentUrl: String,
            durationMinutes: Number,
            order: Number,
          },
        ],
        isRequired: { type: Boolean, default: true },
      },
    ],
    totalDurationMinutes: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },

    // Requirements
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    certificateTemplate: String,

    // Content
    objectives: [String],
    materials: [
      {
        type: String, // DOCUMENT, VIDEO, LINK
        title: String,
        url: String,
        size: Number,
      },
    ],
    assessments: [
      {
        id: String,
        title: String,
        type: String, // QUIZ, EXAM
        questionCount: Number,
        timeLimit: Number,
        passingScore: Number,
      },
    ],

    // Instructor
    instructors: [
      {
        name: String,
        title: String,
        bio: String,
        avatarUrl: String,
      },
    ],

    // Enrollment
    maxEnrollments: Number,
    currentEnrollments: { type: Number, default: 0 },
    completionCount: { type: Number, default: 0 },

    // Metadata
    tags: [String],
    thumbnailUrl: String,
    previewVideoUrl: String,

    // Timestamps
    publishedAt: Date,
    archivedAt: Date,
    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
    collection: 'courses',
  }
);

// Indexes
courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ status: 1 });
courseSchema.index({ type: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1, type: 1 });
courseSchema.index({ status: 1, publishedAt: -1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ title: 'text', description: 'text' });

class MongoDBCourseRepository {
  constructor(database) {
    this.CourseModel = database.model('Course', courseSchema);
  }

  // Convert MongoDB document to Domain Entity
  toDomain(doc) {
    if (!doc) return null;

    const data = doc.toObject ? doc.toObject() : doc;
    return new Course({
      id: data._id.toString(),
      ...data,
      prerequisites: data.prerequisites?.map(id => id.toString()) || [],
      createdBy: data.createdBy?.toString(),
      updatedBy: data.updatedBy?.toString(),
    });
  }

  // Convert Domain Entity to MongoDB document
  toMongoDB(course) {
    const data = { ...course };
    if (course.id) {
      data._id = mongoose.Types.ObjectId(course.id);
      delete data.id;
    }
    if (course.prerequisites) {
      data.prerequisites = course.prerequisites.map(id => mongoose.Types.ObjectId(id));
    }
    if (course.createdBy) {
      data.createdBy = mongoose.Types.ObjectId(course.createdBy);
    }
    if (course.updatedBy) {
      data.updatedBy = mongoose.Types.ObjectId(course.updatedBy);
    }
    return data;
  }

  async save(course) {
    try {
      const data = this.toMongoDB(course);

      if (data._id) {
        // Update existing
        const updated = await this.CourseModel.findByIdAndUpdate(data._id, data, {
          new: true,
          runValidators: true,
        });
        return this.toDomain(updated);
      } else {
        // Create new
        const created = await this.CourseModel.create(data);
        return this.toDomain(created);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const doc = await this.CourseModel.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      console.error('Error finding course by ID:', error);
      return null;
    }
  }

  async findByCode(code) {
    try {
      const doc = await this.CourseModel.findOne({ code });
      return this.toDomain(doc);
    } catch (error) {
      console.error('Error finding course by code:', error);
      return null;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { createdAt: -1 };

      const [docs, total] = await Promise.all([
        this.CourseModel.find({ status }).sort(sort).skip(skip).limit(limit),
        this.CourseModel.countDocuments({ status }),
      ]);

      return {
        courses: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error finding courses by status:', error);
      throw error;
    }
  }

  async findByType(type, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { createdAt: -1 };

      const [docs, total] = await Promise.all([
        this.CourseModel.find({ type }).sort(sort).skip(skip).limit(limit),
        this.CourseModel.countDocuments({ type }),
      ]);

      return {
        courses: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error finding courses by type:', error);
      throw error;
    }
  }

  async findAvailableForEnrollment(filters = {}, options = {}) {
    try {
      const query = {
        status: Course.STATUS.PUBLISHED,
        $or: [
          { maxEnrollments: null },
          { $expr: { $lt: ['$currentEnrollments', '$maxEnrollments'] } },
        ],
      };

      if (filters.type) query.type = filters.type;
      if (filters.level) query.level = filters.level;
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { publishedAt: -1 };

      const [docs, total] = await Promise.all([
        this.CourseModel.find(query).sort(sort).skip(skip).limit(limit),
        this.CourseModel.countDocuments(query),
      ]);

      return {
        courses: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error finding available courses:', error);
      throw error;
    }
  }

  async search(searchText, filters = {}, options = {}) {
    try {
      const query = {
        $text: { $search: searchText },
      };

      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.level) query.level = filters.level;

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const [docs, total] = await Promise.all([
        this.CourseModel.find(query, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit),
        this.CourseModel.countDocuments(query),
      ]);

      return {
        courses: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  async findWithFilters(filters = {}, options = {}) {
    try {
      const query = {};

      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.level) query.level = filters.level;
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      if (filters.search) {
        query.$or = [
          { title: new RegExp(filters.search, 'i') },
          { description: new RegExp(filters.search, 'i') },
          { code: new RegExp(filters.search, 'i') },
        ];
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { createdAt: -1 };

      const [docs, total] = await Promise.all([
        this.CourseModel.find(query).sort(sort).skip(skip).limit(limit),
        this.CourseModel.countDocuments(query),
      ]);

      return {
        courses: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error finding courses with filters:', error);
      throw error;
    }
  }

  async getMandatoryCourses() {
    try {
      const docs = await this.CourseModel.find({
        type: Course.TYPE.MANDATORY,
        status: Course.STATUS.PUBLISHED,
      }).sort({ createdAt: 1 });

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      console.error('Error finding mandatory courses:', error);
      throw error;
    }
  }

  async findByIds(courseIds) {
    try {
      const objectIds = courseIds.map(id => mongoose.Types.ObjectId(id));
      const docs = await this.CourseModel.find({ _id: { $in: objectIds } });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      console.error('Error finding courses by IDs:', error);
      throw error;
    }
  }

  async codeExists(code, excludeId = null) {
    try {
      const query = { code };
      if (excludeId) {
        query._id = { $ne: mongoose.Types.ObjectId(excludeId) };
      }
      const count = await this.CourseModel.countDocuments(query);
      return count > 0;
    } catch (error) {
      console.error('Error checking code existence:', error);
      return false;
    }
  }

  async count(criteria = {}) {
    try {
      return await this.CourseModel.countDocuments(criteria);
    } catch (error) {
      console.error('Error counting courses:', error);
      return 0;
    }
  }

  async getStatistics() {
    try {
      const [
        totalCourses,
        publishedCourses,
        draftCourses,
        archivedCourses,
        mandatoryCourses,
        totalEnrollments,
        totalCompletions,
        byType,
        byLevel,
      ] = await Promise.all([
        this.CourseModel.countDocuments(),
        this.CourseModel.countDocuments({ status: Course.STATUS.PUBLISHED }),
        this.CourseModel.countDocuments({ status: Course.STATUS.DRAFT }),
        this.CourseModel.countDocuments({ status: Course.STATUS.ARCHIVED }),
        this.CourseModel.countDocuments({
          type: Course.TYPE.MANDATORY,
          status: Course.STATUS.PUBLISHED,
        }),
        this.CourseModel.aggregate([
          { $group: { _id: null, total: { $sum: '$currentEnrollments' } } },
        ]),
        this.CourseModel.aggregate([
          { $group: { _id: null, total: { $sum: '$completionCount' } } },
        ]),
        this.CourseModel.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
        this.CourseModel.aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }]),
      ]);

      return {
        totalCourses,
        publishedCourses,
        draftCourses,
        archivedCourses,
        mandatoryCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        totalCompletions: totalCompletions[0]?.total || 0,
        completionRate:
          totalEnrollments[0]?.total > 0
            ? Math.round(((totalCompletions[0]?.total || 0) / totalEnrollments[0].total) * 100)
            : 0,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byLevel: byLevel.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('Error getting course statistics:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.CourseModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error('Error deleting course:', error);
      return false;
    }
  }
}

module.exports = MongoDBCourseRepository;
