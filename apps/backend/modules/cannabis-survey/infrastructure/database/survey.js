/**
 * MongoDB Survey Repository
 *
 * Implementation of ISurveyRepository using MongoDB/Mongoose.
 *
 * @class MongoDBSurveyRepository
 * @implements {ISurveyRepository}
 */

const mongoose = require('mongoose');
const ISurveyRepository = require('../../domain/interfaces/ISurveyRepository');
const { Survey, STATUS, PURPOSE, PLANT_TYPE } = require('../../domain/entities/Survey');

// Mongoose Schema
const surveySchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    surveyYear: {
      type: Number,
      required: true,
      index: true,
    },
    surveyPeriod: {
      type: String,
      required: true,
      index: true,
    },

    // Cultivation Information
    purpose: {
      type: String,
      enum: Object.values(PURPOSE),
      required: true,
      index: true,
    },
    plantType: {
      type: String,
      enum: Object.values(PLANT_TYPE),
      required: true,
      index: true,
    },
    strainName: String,
    numberOfPlants: {
      type: Number,
      required: true,
      min: 0,
    },
    cultivationArea: {
      type: Number,
      required: true,
      min: 0,
    },
    areaUnit: {
      type: String,
      default: 'rai',
    },
    plantingDate: Date,
    expectedHarvestDate: Date,

    // Growing Methods
    growingMethod: String,
    seedSource: String,
    fertilizerUsed: [String],
    pesticideUsed: [String],
    irrigationMethod: String,

    // Expected Production
    expectedYield: Number,
    yieldUnit: {
      type: String,
      default: 'kg',
    },
    targetMarket: String,

    // Documentation
    photos: [
      {
        url: String,
        description: String,
        uploadedAt: Date,
      },
    ],
    documents: [
      {
        url: String,
        filename: String,
        fileType: String,
        uploadedAt: Date,
      },
    ],
    additionalNotes: String,

    // Review Information
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.DRAFT,
      index: true,
    },
    submittedAt: {
      type: Date,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DTAMStaff',
    },
    reviewedAt: Date,
    reviewNotes: String,
    rejectionReason: String,
    revisionNotes: String,

    // Compliance
    complianceChecklist: {
      type: Map,
      of: Boolean,
    },
    thcContent: Number,
    cbdContent: Number,
  },
  {
    timestamps: true,
    collection: 'cannabis_surveys',
  },
);

// Compound indexes
surveySchema.index({ farmId: 1, surveyYear: 1, surveyPeriod: 1 }, { unique: true });
surveySchema.index({ farmerId: 1, status: 1 });
surveySchema.index({ status: 1, submittedAt: -1 });
surveySchema.index({ purpose: 1, plantType: 1 });
surveySchema.index({ reviewedBy: 1, reviewedAt: -1 });

class MongoDBSurveyRepository extends ISurveyRepository {
  constructor(database) {
    super();
    this.SurveyModel = database.model('CannabisS urvey', surveySchema);
  }

  /**
   * Convert MongoDB document to Survey entity
   */
  toDomain(doc) {
    if (!doc) return null;

    return new Survey({
      id: doc._id.toString(),
      farmId: doc.farmId?.toString(),
      farmerId: doc.farmerId?.toString(),
      surveyYear: doc.surveyYear,
      surveyPeriod: doc.surveyPeriod,
      purpose: doc.purpose,
      plantType: doc.plantType,
      strainName: doc.strainName,
      numberOfPlants: doc.numberOfPlants,
      cultivationArea: doc.cultivationArea,
      areaUnit: doc.areaUnit,
      plantingDate: doc.plantingDate,
      expectedHarvestDate: doc.expectedHarvestDate,
      growingMethod: doc.growingMethod,
      seedSource: doc.seedSource,
      fertilizerUsed: doc.fertilizerUsed,
      pesticideUsed: doc.pesticideUsed,
      irrigationMethod: doc.irrigationMethod,
      expectedYield: doc.expectedYield,
      yieldUnit: doc.yieldUnit,
      targetMarket: doc.targetMarket,
      photos: doc.photos,
      documents: doc.documents,
      additionalNotes: doc.additionalNotes,
      status: doc.status,
      submittedAt: doc.submittedAt,
      reviewedBy: doc.reviewedBy?.toString(),
      reviewedAt: doc.reviewedAt,
      reviewNotes: doc.reviewNotes,
      rejectionReason: doc.rejectionReason,
      revisionNotes: doc.revisionNotes,
      complianceChecklist: doc.complianceChecklist
        ? Object.fromEntries(doc.complianceChecklist)
        : {},
      thcContent: doc.thcContent,
      cbdContent: doc.cbdContent,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convert Survey entity to MongoDB document
   */
  toMongoDB(survey) {
    return {
      _id: survey.id ? new mongoose.Types.ObjectId(survey.id) : new mongoose.Types.ObjectId(),
      farmId: new mongoose.Types.ObjectId(survey.farmId),
      farmerId: new mongoose.Types.ObjectId(survey.farmerId),
      surveyYear: survey.surveyYear,
      surveyPeriod: survey.surveyPeriod,
      purpose: survey.purpose,
      plantType: survey.plantType,
      strainName: survey.strainName,
      numberOfPlants: survey.numberOfPlants,
      cultivationArea: survey.cultivationArea,
      areaUnit: survey.areaUnit,
      plantingDate: survey.plantingDate,
      expectedHarvestDate: survey.expectedHarvestDate,
      growingMethod: survey.growingMethod,
      seedSource: survey.seedSource,
      fertilizerUsed: survey.fertilizerUsed,
      pesticideUsed: survey.pesticideUsed,
      irrigationMethod: survey.irrigationMethod,
      expectedYield: survey.expectedYield,
      yieldUnit: survey.yieldUnit,
      targetMarket: survey.targetMarket,
      photos: survey.photos,
      documents: survey.documents,
      additionalNotes: survey.additionalNotes,
      status: survey.status,
      submittedAt: survey.submittedAt,
      reviewedBy: survey.reviewedBy ? new mongoose.Types.ObjectId(survey.reviewedBy) : undefined,
      reviewedAt: survey.reviewedAt,
      reviewNotes: survey.reviewNotes,
      rejectionReason: survey.rejectionReason,
      revisionNotes: survey.revisionNotes,
      complianceChecklist: survey.complianceChecklist,
      thcContent: survey.thcContent,
      cbdContent: survey.cbdContent,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
    };
  }

  async findById(id) {
    try {
      const doc = await this.SurveyModel.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding survey by ID:', error);
      throw error;
    }
  }

  async findByFarmerId(farmerId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const docs = await this.SurveyModel.find({ farmerId: new mongoose.Types.ObjectId(farmerId) })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding surveys by farmer ID:', error);
      throw error;
    }
  }

  async findByFarmId(farmId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { surveyYear: -1, surveyPeriod: -1 } } = options;
      const skip = (page - 1) * limit;

      const docs = await this.SurveyModel.find({ farmId: new mongoose.Types.ObjectId(farmId) })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding surveys by farm ID:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { submittedAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const docs = await this.SurveyModel.find({ status }).sort(sort).skip(skip).limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding surveys by status:', error);
      throw error;
    }
  }

  async findWithFilters(filters, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const query = {};

      if (filters.status) query.status = filters.status;
      if (filters.purpose) query.purpose = filters.purpose;
      if (filters.plantType) query.plantType = filters.plantType;
      if (filters.surveyYear) query.surveyYear = filters.surveyYear;
      if (filters.surveyPeriod) query.surveyPeriod = filters.surveyPeriod;
      if (filters.farmerId) query.farmerId = new mongoose.Types.ObjectId(filters.farmerId);
      if (filters.farmId) query.farmId = new mongoose.Types.ObjectId(filters.farmId);
      if (filters.reviewedBy) query.reviewedBy = new mongoose.Types.ObjectId(filters.reviewedBy);

      // Search by strain name
      if (filters.search) {
        query.$or = [
          { strainName: { $regex: filters.search, $options: 'i' } },
          { growingMethod: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const docs = await this.SurveyModel.find(query).sort(sort).skip(skip).limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding surveys with filters:', error);
      throw error;
    }
  }

  async findByYearAndPeriod(year, period, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const docs = await this.SurveyModel.find({ surveyYear: year, surveyPeriod: period })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding surveys by year and period:', error);
      throw error;
    }
  }

  async findReviewedByStaff(staffId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const docs = await this.SurveyModel.find({ reviewedBy: new mongoose.Types.ObjectId(staffId) })
        .sort({ reviewedAt: -1 })
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding surveys reviewed by staff:', error);
      throw error;
    }
  }

  async save(survey) {
    try {
      const mongoDoc = this.toMongoDB(survey);

      const doc = await this.SurveyModel.findByIdAndUpdate(mongoDoc._id, mongoDoc, {
        upsert: true,
        new: true,
        runValidators: true,
      });

      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error saving survey:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.SurveyModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.error('Error deleting survey:', error);
      throw error;
    }
  }

  async countByStatus(status) {
    try {
      return await this.SurveyModel.countDocuments({ status });
    } catch (error) {
      logger.error('Error counting surveys by status:', error);
      throw error;
    }
  }

  async countByFarmer(farmerId) {
    try {
      return await this.SurveyModel.countDocuments({
        farmerId: new mongoose.Types.ObjectId(farmerId),
      });
    } catch (error) {
      logger.error('Error counting surveys by farmer:', error);
      throw error;
    }
  }

  async getStatisticsByPurpose() {
    try {
      return await this.SurveyModel.aggregate([
        {
          $group: {
            _id: '$purpose',
            count: { $sum: 1 },
            totalPlants: { $sum: '$numberOfPlants' },
            totalArea: { $sum: '$cultivationArea' },
          },
        },
        {
          $project: {
            purpose: '$_id',
            count: 1,
            totalPlants: 1,
            totalArea: 1,
            _id: 0,
          },
        },
      ]);
    } catch (error) {
      logger.error('Error getting statistics by purpose:', error);
      throw error;
    }
  }

  async getStatisticsByPlantType() {
    try {
      return await this.SurveyModel.aggregate([
        {
          $group: {
            _id: '$plantType',
            count: { $sum: 1 },
            totalPlants: { $sum: '$numberOfPlants' },
            totalArea: { $sum: '$cultivationArea' },
          },
        },
        {
          $project: {
            plantType: '$_id',
            count: 1,
            totalPlants: 1,
            totalArea: 1,
            _id: 0,
          },
        },
      ]);
    } catch (error) {
      logger.error('Error getting statistics by plant type:', error);
      throw error;
    }
  }

  async getStatisticsByYear(year) {
    try {
      return await this.SurveyModel.aggregate([
        { $match: { surveyYear: year } },
        {
          $group: {
            _id: {
              period: '$surveyPeriod',
              status: '$status',
            },
            count: { $sum: 1 },
            totalPlants: { $sum: '$numberOfPlants' },
            totalArea: { $sum: '$cultivationArea' },
          },
        },
        {
          $project: {
            period: '$_id.period',
            status: '$_id.status',
            count: 1,
            totalPlants: 1,
            totalArea: 1,
            _id: 0,
          },
        },
        { $sort: { period: 1, status: 1 } },
      ]);
    } catch (error) {
      logger.error('Error getting statistics by year:', error);
      throw error;
    }
  }

  async surveyExistsForPeriod(farmId, year, period, excludeId = null) {
    try {
      const query = {
        farmId: new mongoose.Types.ObjectId(farmId),
        surveyYear: year,
        surveyPeriod: period,
      };

      if (excludeId) {
        query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
      }

      const count = await this.SurveyModel.countDocuments(query);
      return count > 0;
    } catch (error) {
      logger.error('Error checking survey existence:', error);
      throw error;
    }
  }

  async findRecentlySubmitted(limit = 10) {
    try {
      const docs = await this.SurveyModel.find({
        status: { $in: [STATUS.SUBMITTED, STATUS.UNDER_REVIEW] },
      })
        .sort({ submittedAt: -1 })
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding recently submitted surveys:', error);
      throw error;
    }
  }

  async findRequiringAttention() {
    try {
      const docs = await this.SurveyModel.find({
        $or: [{ status: STATUS.SUBMITTED }, { status: STATUS.UNDER_REVIEW }],
      }).sort({ submittedAt: 1 });

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding surveys requiring attention:', error);
      throw error;
    }
  }
}

module.exports = MongoDBSurveyRepository;
