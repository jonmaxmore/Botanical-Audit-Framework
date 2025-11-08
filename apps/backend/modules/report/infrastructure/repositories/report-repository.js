/**
 * MongoDB Report Repository Implementation
 *
 * Implements IReportRepository using MongoDB and Mongoose.
 * Part of Clean Architecture - Infrastructure Layer
 */

const mongoose = require('mongoose');
const Report = require('../../domain/entities/Report');

// Mongoose Schema
const reportSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    description: String,
    type: { type: String, required: true, enum: Object.values(Report.TYPE) },
    category: { type: String, enum: Object.values(Report.CATEGORY) },
    format: { type: String, required: true, enum: Object.values(Report.FORMAT) },

    requestedBy: { type: String, required: true },
    requestedByType: { type: String, default: 'farmer' },

    parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    columns: [String],
    sortBy: String,
    sortOrder: { type: String, default: 'desc' },

    schedule: { type: String, enum: Object.values(Report.SCHEDULE), default: 'ONCE' },
    scheduledAt: Date,
    nextRunAt: Date,
    lastRunAt: Date,

    status: { type: String, enum: Object.values(Report.STATUS), default: 'PENDING' },
    generatedAt: Date,
    completedAt: Date,
    failureReason: String,
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },

    filePath: String,
    fileSize: Number,
    fileName: String,
    downloadUrl: String,
    expiresAt: Date,

    data: mongoose.Schema.Types.Mixed,
    summary: { type: mongoose.Schema.Types.Mixed, default: {} },
    recordCount: { type: Number, default: 0 },

    isPublic: { type: Boolean, default: false },
    sharedWith: [String],

    tags: [String],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'reports',
    timestamps: false,
    _id: false,
  },
);

// Indexes
reportSchema.index({ requestedBy: 1, status: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ schedule: 1, nextRunAt: 1 });
reportSchema.index({ expiresAt: 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ title: 'text', description: 'text' });

const ReportModel = mongoose.model('Report', reportSchema);

class MongoDBReportRepository {
  async save(report) {
    report.updatedAt = new Date();

    const doc = await ReportModel.findOneAndUpdate(
      { _id: report.id },
      { $set: this._toDocument(report) },
      { upsert: true, new: true },
    );

    return this._toDomain(doc);
  }

  async findById(id) {
    const doc = await ReportModel.findOne({ _id: id });
    return doc ? this._toDomain(doc) : null;
  }

  async findByRequester(requesterId, filters = {}, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const query = {
      requestedBy: requesterId,
      ...filters,
    };

    const [reports, total] = await Promise.all([
      ReportModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      ReportModel.countDocuments(query),
    ]);

    return {
      reports: reports.map(doc => this._toDomain(doc)),
      total,
    };
  }

  async findByStatus(status, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      ReportModel.find({ status }).sort(sort).skip(skip).limit(limit).lean(),
      ReportModel.countDocuments({ status }),
    ]);

    return {
      reports: reports.map(doc => this._toDomain(doc)),
      total,
    };
  }

  async findByType(type, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      ReportModel.find({ type }).sort(sort).skip(skip).limit(limit).lean(),
      ReportModel.countDocuments({ type }),
    ]);

    return {
      reports: reports.map(doc => this._toDomain(doc)),
      total,
    };
  }

  async findByCategory(category, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      ReportModel.find({ category }).sort(sort).skip(skip).limit(limit).lean(),
      ReportModel.countDocuments({ category }),
    ]);

    return {
      reports: reports.map(doc => this._toDomain(doc)),
      total,
    };
  }

  async findWithFilters(filters, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      ReportModel.find(filters).sort(sort).skip(skip).limit(limit).lean(),
      ReportModel.countDocuments(filters),
    ]);

    return {
      reports: reports.map(doc => this._toDomain(doc)),
      total,
    };
  }

  async findPending(options = {}) {
    return this.findByStatus(Report.STATUS.PENDING, options);
  }

  async findDueReports() {
    const now = new Date();

    const reports = await ReportModel.find({
      status: Report.STATUS.PENDING,
      schedule: { $ne: Report.SCHEDULE.ONCE },
      $or: [{ nextRunAt: { $lte: now } }, { nextRunAt: null }],
    }).lean();

    return reports.map(doc => this._toDomain(doc));
  }

  async findExpired(options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    const now = new Date();

    const reports = await ReportModel.find({
      expiresAt: { $lte: now },
      status: { $ne: Report.STATUS.EXPIRED },
    })
      .skip(skip)
      .limit(limit)
      .lean();

    return reports.map(doc => this._toDomain(doc));
  }

  async findRetryable() {
    const reports = await ReportModel.find({
      status: Report.STATUS.FAILED,
      $expr: { $lt: ['$retryCount', '$maxRetries'] },
    }).lean();

    return reports.map(doc => this._toDomain(doc));
  }

  async count(criteria = {}) {
    return await ReportModel.countDocuments(criteria);
  }

  async countByRequester(requesterId, filters = {}) {
    return await ReportModel.countDocuments({
      requestedBy: requesterId,
      ...filters,
    });
  }

  async markExpired() {
    const now = new Date();

    const result = await ReportModel.updateMany(
      {
        expiresAt: { $lte: now },
        status: { $ne: Report.STATUS.EXPIRED },
      },
      {
        $set: {
          status: Report.STATUS.EXPIRED,
          updatedAt: now,
        },
      },
    );

    return result.modifiedCount;
  }

  async getStatistics(filters = {}) {
    const stats = await ReportModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: '$status',
          },
          byType: {
            $push: '$type',
          },
          byCategory: {
            $push: '$category',
          },
          byFormat: {
            $push: '$format',
          },
          totalDownloads: { $sum: '$downloadCount' },
          totalViews: { $sum: '$viewCount' },
          totalFileSize: { $sum: '$fileSize' },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          byStatus: 1,
          byType: 1,
          byCategory: 1,
          byFormat: 1,
          totalDownloads: 1,
          totalViews: 1,
          totalFileSize: 1,
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        total: 0,
        byStatus: {},
        byType: {},
        byCategory: {},
        byFormat: {},
        totalDownloads: 0,
        totalViews: 0,
        totalFileSize: 0,
      };
    }

    const result = stats[0];

    // Convert arrays to count objects
    result.byStatus = this._countArray(result.byStatus);
    result.byType = this._countArray(result.byType);
    result.byCategory = this._countArray(result.byCategory);
    result.byFormat = this._countArray(result.byFormat);

    return result;
  }

  async delete(id) {
    const result = await ReportModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async deleteOldReports(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await ReportModel.deleteMany({
      status: Report.STATUS.COMPLETED,
      completedAt: { $lte: cutoffDate },
    });

    return result.deletedCount;
  }

  async searchReports(searchText, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const query = {
      $text: { $search: searchText },
    };

    const [reports, total] = await Promise.all([
      ReportModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      ReportModel.countDocuments(query),
    ]);

    return {
      reports: reports.map(doc => this._toDomain(doc)),
      total,
    };
  }

  // Helper methods
  _toDomain(doc) {
    if (!doc) return null;

    return new Report({
      id: doc._id,
      title: doc.title,
      description: doc.description,
      type: doc.type,
      category: doc.category,
      format: doc.format,
      requestedBy: doc.requestedBy,
      requestedByType: doc.requestedByType,
      parameters: doc.parameters,
      filters: doc.filters,
      columns: doc.columns,
      sortBy: doc.sortBy,
      sortOrder: doc.sortOrder,
      schedule: doc.schedule,
      scheduledAt: doc.scheduledAt,
      nextRunAt: doc.nextRunAt,
      lastRunAt: doc.lastRunAt,
      status: doc.status,
      generatedAt: doc.generatedAt,
      completedAt: doc.completedAt,
      failureReason: doc.failureReason,
      retryCount: doc.retryCount,
      maxRetries: doc.maxRetries,
      filePath: doc.filePath,
      fileSize: doc.fileSize,
      fileName: doc.fileName,
      downloadUrl: doc.downloadUrl,
      expiresAt: doc.expiresAt,
      data: doc.data,
      summary: doc.summary,
      recordCount: doc.recordCount,
      isPublic: doc.isPublic,
      sharedWith: doc.sharedWith,
      tags: doc.tags,
      metadata: doc.metadata,
      downloadCount: doc.downloadCount,
      viewCount: doc.viewCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  _toDocument(report) {
    return {
      _id: report.id,
      title: report.title,
      description: report.description,
      type: report.type,
      category: report.category,
      format: report.format,
      requestedBy: report.requestedBy,
      requestedByType: report.requestedByType,
      parameters: report.parameters,
      filters: report.filters,
      columns: report.columns,
      sortBy: report.sortBy,
      sortOrder: report.sortOrder,
      schedule: report.schedule,
      scheduledAt: report.scheduledAt,
      nextRunAt: report.nextRunAt,
      lastRunAt: report.lastRunAt,
      status: report.status,
      generatedAt: report.generatedAt,
      completedAt: report.completedAt,
      failureReason: report.failureReason,
      retryCount: report.retryCount,
      maxRetries: report.maxRetries,
      filePath: report.filePath,
      fileSize: report.fileSize,
      fileName: report.fileName,
      downloadUrl: report.downloadUrl,
      expiresAt: report.expiresAt,
      data: report.data,
      summary: report.summary,
      recordCount: report.recordCount,
      isPublic: report.isPublic,
      sharedWith: report.sharedWith,
      tags: report.tags,
      metadata: report.metadata,
      downloadCount: report.downloadCount,
      viewCount: report.viewCount,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }

  _countArray(arr) {
    return arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = MongoDBReportRepository;
