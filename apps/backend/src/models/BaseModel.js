/**
 * Base Model Class
 * Common model functionality with MongoDB integration
 */

const mongoose = require('mongoose');
const { DatabaseError, ValidationError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

class BaseModel {
  constructor(schema, modelName) {
    this.schema = schema;
    this.modelName = modelName;
    this.model = null;

    this.addCommonFields();
    this.addCommonMethods();
    this.addCommonStatics();
    this.createModel();
  }

  /**
   * Add common fields to schema
   */
  addCommonFields() {
    // Add timestamps if not already present
    if (!this.schema.paths.createdAt) {
      this.schema.add({
        createdAt: {
          type: Date,
          default: Date.now,
          index: true
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      });
    }

    // Add soft delete field
    if (!this.schema.paths.isDeleted) {
      this.schema.add({
        isDeleted: {
          type: Boolean,
          default: false,
          index: true
        },
        deletedAt: {
          type: Date,
          default: null
        }
      });
    }

    // Add version field for optimistic locking
    if (!this.schema.paths.__v) {
      this.schema.add({
        version: {
          type: Number,
          default: 0
        }
      });
    }
  }

  /**
   * Add common instance methods
   */
  addCommonMethods() {
    // Update timestamp before save
    this.schema.pre('save', function(next) {
      this.updatedAt = new Date();
      if (this.isModified() && !this.isNew) {
        this.version += 1;
      }
      next();
    });

    // Soft delete method
    this.schema.methods.softDelete = function() {
      this.isDeleted = true;
      this.deletedAt = new Date();
      return this.save();
    };

    // Restore method
    this.schema.methods.restore = function() {
      this.isDeleted = false;
      this.deletedAt = null;
      return this.save();
    };

    // To JSON transform
    this.schema.methods.toJSON = function() {
      const obj = this.toObject();
      delete obj.__v;
      delete obj.isDeleted;
      delete obj.deletedAt;
      return obj;
    };

    // Get safe object (remove sensitive fields)
    this.schema.methods.getSafeObject = function(fieldsToRemove = []) {
      const obj = this.toObject();
      const defaultRemove = ['__v', 'isDeleted', 'deletedAt', 'password'];
      const toRemove = [...defaultRemove, ...fieldsToRemove];

      toRemove.forEach(field => {
        delete obj[field];
      });

      return obj;
    };
  }

  /**
   * Add common static methods
   */
  addCommonStatics() {
    // Find active (non-deleted) documents
    this.schema.statics.findActive = function(filter = {}) {
      return this.find({ ...filter, isDeleted: false });
    };

    // Find one active document
    this.schema.statics.findOneActive = function(filter = {}) {
      return this.findOne({ ...filter, isDeleted: false });
    };

    // Find by ID active
    this.schema.statics.findByIdActive = function(id) {
      return this.findOne({ _id: id, isDeleted: false });
    };

    // Soft delete by ID
    this.schema.statics.softDeleteById = function(id) {
      return this.findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date()
      });
    };

    // Bulk soft delete
    this.schema.statics.softDeleteMany = function(filter = {}) {
      return this.updateMany(filter, {
        isDeleted: true,
        deletedAt: new Date()
      });
    };

    // Create with validation
    this.schema.statics.createSafe = async function(data) {
      try {
        const document = new this(data);
        await document.validate();
        return await document.save();
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new ValidationError('Validation failed', error.errors);
        }
        throw new DatabaseError('Create operation failed', error);
      }
    };

    // Update with validation
    this.schema.statics.updateSafe = async function(id, data, options = {}) {
      try {
        const document = await this.findByIdActive(id);
        if (!document) {
          throw new ValidationError('Document not found');
        }

        Object.assign(document, data);
        await document.validate();
        return await document.save();
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new ValidationError('Validation failed', error.errors);
        }
        throw new DatabaseError('Update operation failed', error);
      }
    };

    // Paginated find
    this.schema.statics.findPaginated = async function(filter = {}, options = {}) {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate = null,
        select = null
      } = options;

      const skip = (page - 1) * limit;
      const activeFilter = { ...filter, isDeleted: false };

      let query = this.find(activeFilter).sort(sort).skip(skip).limit(limit);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        query = query.populate(populate);
      }

      const [documents, total] = await Promise.all([
        query.exec(),
        this.countDocuments(activeFilter)
      ]);

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    };

    // Search with text index
    this.schema.statics.search = function(searchTerm, filter = {}, options = {}) {
      const searchFilter = {
        ...filter,
        isDeleted: false,
        $text: { $search: searchTerm }
      };

      return this.findPaginated(searchFilter, {
        ...options,
        sort: { score: { $meta: 'textScore' }, ...options.sort }
      });
    };

    // Aggregate with common pipeline stages
    this.schema.statics.aggregateActive = function(pipeline = []) {
      const basePipeline = [{ $match: { isDeleted: false } }, ...pipeline];

      return this.aggregate(basePipeline);
    };
  }

  /**
   * Create the mongoose model
   */
  createModel() {
    try {
      this.model = mongoose.model(this.modelName, this.schema);
    } catch (error) {
      logger.error(`Failed to create model ${this.modelName}:`, error);
      throw new DatabaseError(`Model creation failed: ${this.modelName}`);
    }
  }

  /**
   * Get the mongoose model
   */
  getModel() {
    return this.model;
  }

  /**
   * Create indexes
   */
  async createIndexes() {
    try {
      await this.model.createIndexes();
      logger.info(`Indexes created for ${this.modelName}`);
    } catch (error) {
      logger.error(`Failed to create indexes for ${this.modelName}:`, error);
    }
  }

  /**
   * Drop collection (use with caution)
   */
  async dropCollection() {
    try {
      await this.model.collection.drop();
      logger.warn(`Collection dropped: ${this.modelName}`);
    } catch (error) {
      if (error.code === 26) {
        logger.info(`Collection ${this.modelName} doesn't exist`);
      } else {
        logger.error(`Failed to drop collection ${this.modelName}:`, error);
      }
    }
  }

  /**
   * Get collection stats
   */
  async getStats() {
    try {
      const stats = await this.model.collection.stats();
      return {
        collection: this.modelName,
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        indexes: stats.nindexes
      };
    } catch (error) {
      logger.error(`Failed to get stats for ${this.modelName}:`, error);
      return null;
    }
  }
}

module.exports = BaseModel;
