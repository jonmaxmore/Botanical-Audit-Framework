/**
 * ApplicationRepository
 * Data access layer for Application collection (updated with new fields)
 *
 * @module repositories/application
 * @version 2.0.0
 */

const logger = require('../utils/logger');

class ApplicationRepository {
  constructor(database) {
    this.db = database;
    this.collectionName = 'applications';
  }

  /**
   * Get applications collection
   * @private
   */
  get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Find application by ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object|null>} Application document
   */
  async findById(applicationId) {
    try {
      return await this.collection.findOne({ _id: applicationId });
    } catch (error) {
      logger.error('[ApplicationRepository] findById error:', error);
      throw error;
    }
  }

  /**
   * Find applications by farmer ID
   * @param {string} farmerId - Farmer ID
   * @param {Object} filters - Optional filters (status)
   * @returns {Promise<Array>} List of applications
   */
  async findByFarmer(farmerId, filters = {}) {
    try {
      const query = { farmerId };

      if (filters.status) {
        query.status = filters.status;
      }

      return await this.collection.find(query).sort({ submittedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[ApplicationRepository] findByFarmer error:', error);
      throw error;
    }
  }

  /**
   * Find applications by status
   * @param {string} status - Application status
   * @returns {Promise<Array>} List of applications
   */
  async findByStatus(status) {
    try {
      return await this.collection.find({ status }).sort({ submittedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[ApplicationRepository] findByStatus error:', error);
      throw error;
    }
  }

  /**
   * Create new application
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Created application
   */
  async create(applicationData) {
    try {
      const result = await this.collection.insertOne({
        ...applicationData,
        payments: [],
        assignments: [],
        kpis: [],
        submissionCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        id: result.insertedId,
        ...applicationData,
        payments: [],
        assignments: [],
        kpis: [],
        submissionCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('[ApplicationRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Update application
   * @param {string} applicationId - Application ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated application
   */
  async update(applicationId, updateData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: applicationId },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[ApplicationRepository] update error:', error);
      throw error;
    }
  }

  /**
   * Add payment to application
   * @param {string} applicationId - Application ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object|null>} Updated application
   */
  async addPayment(applicationId, paymentData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: applicationId },
        {
          $push: {
            payments: {
              paymentId: paymentData.id,
              type: paymentData.type,
              amount: paymentData.amount,
              status: paymentData.status,
              createdAt: paymentData.createdAt,
            },
          },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[ApplicationRepository] addPayment error:', error);
      throw error;
    }
  }

  /**
   * Update payment status in application
   * @param {string} applicationId - Application ID
   * @param {string} paymentId - Payment ID
   * @param {string} status - New status
   * @returns {Promise<Object|null>} Updated application
   */
  async updatePaymentStatus(applicationId, paymentId, status) {
    try {
      const result = await this.collection.findOneAndUpdate(
        {
          _id: applicationId,
          'payments.paymentId': paymentId,
        },
        {
          $set: {
            'payments.$.status': status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[ApplicationRepository] updatePaymentStatus error:', error);
      throw error;
    }
  }

  /**
   * Add assignment to application
   * @param {string} applicationId - Application ID
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object|null>} Updated application
   */
  async addAssignment(applicationId, assignmentData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: applicationId },
        {
          $push: {
            assignments: {
              assignmentId: assignmentData.id,
              assignedTo: assignmentData.assignedTo,
              role: assignmentData.role,
              status: assignmentData.status,
              assignedAt: assignmentData.assignedAt,
            },
          },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[ApplicationRepository] addAssignment error:', error);
      throw error;
    }
  }

  /**
   * Update assignment status in application
   * @param {string} applicationId - Application ID
   * @param {string} assignmentId - Assignment ID
   * @param {string} status - New status
   * @returns {Promise<Object|null>} Updated application
   */
  async updateAssignmentStatus(applicationId, assignmentId, status) {
    try {
      const result = await this.collection.findOneAndUpdate(
        {
          _id: applicationId,
          'assignments.assignmentId': assignmentId,
        },
        {
          $set: {
            'assignments.$.status': status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[ApplicationRepository] updateAssignmentStatus error:', error);
      throw error;
    }
  }

  /**
   * Add KPI record to application
   * @param {string} applicationId - Application ID
   * @param {Object} kpiData - KPI data
   * @returns {Promise<Object|null>} Updated application
   */
  async addKPI(applicationId, kpiData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: applicationId },
        {
          $push: {
            kpis: {
              taskId: kpiData.taskId,
              role: kpiData.role,
              userId: kpiData.userId,
              status: kpiData.status,
              startTime: kpiData.startTime,
              endTime: kpiData.endTime,
              processingTime: kpiData.processingTime,
            },
          },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[ApplicationRepository] addKPI error:', error);
      throw error;
    }
  }

  /**
   * Increment submission count
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object|null>} Updated application
   */
  async incrementSubmissionCount(applicationId) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: applicationId },
        {
          $inc: { submissionCount: 1 },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[ApplicationRepository] incrementSubmissionCount error:', error);
      throw error;
    }
  }

  /**
   * Get submission count
   * @param {string} applicationId - Application ID
   * @returns {Promise<number>} Submission count
   */
  async getSubmissionCount(applicationId) {
    try {
      const application = await this.collection.findOne(
        { _id: applicationId },
        { projection: { submissionCount: 1 } },
      );

      return application?.submissionCount || 0;
    } catch (error) {
      logger.error('[ApplicationRepository] getSubmissionCount error:', error);
      throw error;
    }
  }

  /**
   * Delete application
   * @param {string} applicationId - Application ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(applicationId) {
    try {
      const result = await this.collection.deleteOne({ _id: applicationId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('[ApplicationRepository] delete error:', error);
      throw error;
    }
  }

  /**
   * Get application statistics
   * @param {Object} filters - Optional filters (startDate, endDate, status)
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(filters = {}) {
    try {
      const query = {};

      if (filters.startDate || filters.endDate) {
        query.submittedAt = {};
        if (filters.startDate) {
          query.submittedAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.submittedAt.$lte = new Date(filters.endDate);
        }
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const [totalCount, statusBreakdown] = await Promise.all([
        this.collection.countDocuments(query),

        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
      ]);

      return {
        total: totalCount,
        byStatus: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('[ApplicationRepository] getStatistics error:', error);
      throw error;
    }
  }

  /**
   * Find applications with pending payments
   * @returns {Promise<Array>} List of applications
   */
  async findWithPendingPayments() {
    try {
      return await this.collection
        .find({
          'payments.status': 'pending',
        })
        .sort({ submittedAt: -1 })
        .toArray();
    } catch (error) {
      logger.error('[ApplicationRepository] findWithPendingPayments error:', error);
      throw error;
    }
  }

  /**
   * Find recent applications
   * @param {number} limit - Number of records
   * @returns {Promise<Array>} List of applications
   */
  async findRecent(limit = 10) {
    try {
      return await this.collection.find().sort({ submittedAt: -1 }).limit(limit).toArray();
    } catch (error) {
      logger.error('[ApplicationRepository] findRecent error:', error);
      throw error;
    }
  }
}

module.exports = ApplicationRepository;
