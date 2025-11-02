/**
 * JobAssignmentRepository
 * Data access layer for JobAssignment collection
 *
 * @module repositories/jobassignment
 * @version 1.0.0
 */

const logger = require('../shared/logger');

class JobAssignmentRepository {
  constructor(database) {
    this.db = database;
    this.collectionName = 'job_assignments';
  }

  /**
   * Get job assignments collection
   * @private
   */
  get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Find assignment by ID
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Object|null>} Assignment document
   */
  async findById(assignmentId) {
    try {
      return await this.collection.findOne({ _id: assignmentId });
    } catch (error) {
      logger.error('[JobAssignmentRepository] findById error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by user ID
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (status, role)
   * @returns {Promise<Array>} List of assignments
   */
  async findByUser(userId, filters = {}) {
    try {
      const query = { assignedTo: userId };

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query.status = { $in: filters.status };
        } else {
          query.status = filters.status;
        }
      }

      if (filters.role) {
        query.role = filters.role;
      }

      return await this.collection.find(query).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByUser error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by application ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Array>} List of assignments
   */
  async findByApplication(applicationId) {
    try {
      return await this.collection.find({ applicationId }).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByApplication error:', error);
      throw error;
    }
  }

  /**
   * Find assignment by application and role
   * @param {string} applicationId - Application ID
   * @param {string} role - User role
   * @returns {Promise<Object|null>} Assignment document
   */
  async findByApplicationAndRole(applicationId, role) {
    try {
      return await this.collection.findOne({
        applicationId,
        role,
        status: { $nin: ['completed', 'cancelled', 'reassigned'] }
      });
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByApplicationAndRole error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by role
   * @param {string} role - User role
   * @param {Object} filters - Optional filters (status)
   * @returns {Promise<Array>} List of assignments
   */
  async findByRole(role, filters = {}) {
    try {
      const query = { role };

      if (filters.status) {
        query.status = filters.status;
      }

      return await this.collection.find(query).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByRole error:', error);
      throw error;
    }
  }

  /**
   * Create new assignment
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  async create(assignmentData) {
    try {
      const result = await this.collection.insertOne({
        ...assignmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        id: result.insertedId,
        ...assignmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      logger.error('[JobAssignmentRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Update assignment
   * @param {string} assignmentId - Assignment ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated assignment
   */
  async update(assignmentId, updateData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: assignmentId },
        {
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return result.value;
    } catch (error) {
      logger.error('[JobAssignmentRepository] update error:', error);
      throw error;
    }
  }

  /**
   * Delete assignment
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(assignmentId) {
    try {
      const result = await this.collection.deleteOne({ _id: assignmentId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('[JobAssignmentRepository] delete error:', error);
      throw error;
    }
  }

  /**
   * Get assignment statistics
   * @param {Object} filters - Optional filters (role, startDate, endDate)
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(filters = {}) {
    try {
      const query = {};

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.startDate || filters.endDate) {
        query.assignedAt = {};
        if (filters.startDate) {
          query.assignedAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.assignedAt.$lte = new Date(filters.endDate);
        }
      }

      const [statusBreakdown, roleBreakdown, strategyBreakdown, avgTimes] = await Promise.all([
        // Status breakdown
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ])
          .toArray(),

        // Role breakdown
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$role',
                count: { $sum: 1 }
              }
            }
          ])
          .toArray(),

        // Strategy breakdown
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$strategy',
                count: { $sum: 1 }
              }
            }
          ])
          .toArray(),

        // Average times
        this.collection
          .aggregate([
            {
              $match: {
                ...query,
                status: 'completed',
                assignedAt: { $exists: true },
                completedAt: { $exists: true }
              }
            },
            {
              $project: {
                timeToComplete: {
                  $subtract: ['$completedAt', '$assignedAt']
                },
                timeToAccept: {
                  $cond: [
                    { $ifNull: ['$acceptedAt', false] },
                    { $subtract: ['$acceptedAt', '$assignedAt'] },
                    null
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgTimeToComplete: { $avg: '$timeToComplete' },
                avgTimeToAccept: { $avg: '$timeToAccept' }
              }
            }
          ])
          .toArray()
      ]);

      const times = avgTimes[0] || {
        avgTimeToComplete: 0,
        avgTimeToAccept: 0
      };

      return {
        byStatus: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byRole: roleBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStrategy: strategyBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgTimeToComplete: times.avgTimeToComplete
          ? Math.round(times.avgTimeToComplete / 1000 / 60) // Convert to minutes
          : 0,
        avgTimeToAccept: times.avgTimeToAccept
          ? Math.round(times.avgTimeToAccept / 1000 / 60) // Convert to minutes
          : 0
      };
    } catch (error) {
      logger.error('[JobAssignmentRepository] getStatistics error:', error);
      throw error;
    }
  }

  /**
   * Get active assignment count by user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of active assignments
   */
  async getActiveCountByUser(userId) {
    try {
      return await this.collection.countDocuments({
        assignedTo: userId,
        status: { $in: ['assigned', 'accepted', 'in_progress'] }
      });
    } catch (error) {
      logger.error('[JobAssignmentRepository] getActiveCountByUser error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by priority
   * @param {string} priority - Priority level (low/medium/high/urgent)
   * @param {Object} filters - Optional filters (status, role)
   * @returns {Promise<Array>} List of assignments
   */
  async findByPriority(priority, filters = {}) {
    try {
      const query = { priority };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.role) {
        query.role = filters.role;
      }

      return await this.collection.find(query).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByPriority error:', error);
      throw error;
    }
  }

  /**
   * Find overdue assignments (assigned but not started within threshold)
   * @param {number} hoursThreshold - Hours threshold (default 24)
   * @returns {Promise<Array>} List of overdue assignments
   */
  async findOverdue(hoursThreshold = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hoursThreshold);

      return await this.collection
        .find({
          status: { $in: ['assigned', 'accepted'] },
          assignedAt: { $lte: cutoffDate }
        })
        .sort({ assignedAt: 1 })
        .toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findOverdue error:', error);
      throw error;
    }
  }

  /**
   * Get user workload (active assignments)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Workload summary
   */
  async getUserWorkload(userId) {
    try {
      const [total, byStatus, byPriority] = await Promise.all([
        // Total active
        this.collection.countDocuments({
          assignedTo: userId,
          status: { $in: ['assigned', 'accepted', 'in_progress'] }
        }),

        // By status
        this.collection
          .aggregate([
            {
              $match: {
                assignedTo: userId,
                status: { $in: ['assigned', 'accepted', 'in_progress'] }
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ])
          .toArray(),

        // By priority
        this.collection
          .aggregate([
            {
              $match: {
                assignedTo: userId,
                status: { $in: ['assigned', 'accepted', 'in_progress'] }
              }
            },
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ])
          .toArray()
      ]);

      return {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('[JobAssignmentRepository] getUserWorkload error:', error);
      throw error;
    }
  }

  /**
   * Find recent assignments
   * @param {number} limit - Number of records
   * @returns {Promise<Array>} List of assignments
   */
  async findRecent(limit = 10) {
    try {
      return await this.collection.find().sort({ assignedAt: -1 }).limit(limit).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findRecent error:', error);
      throw error;
    }
  }

  /**
   * Add comment to assignment
   * @param {string} assignmentId - Assignment ID
   * @param {Object} comment - Comment data
   * @returns {Promise<Object|null>} Updated assignment
   */
  async addComment(assignmentId, comment) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: assignmentId },
        {
          $push: { comments: comment },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );

      return result.value;
    } catch (error) {
      logger.error('[JobAssignmentRepository] addComment error:', error);
      throw error;
    }
  }

  /**
   * Get assignment comments
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Array>} List of comments
   */
  async getComments(assignmentId) {
    try {
      const assignment = await this.collection.findOne(
        { _id: assignmentId },
        { projection: { comments: 1 } }
      );

      return assignment?.comments || [];
    } catch (error) {
      logger.error('[JobAssignmentRepository] getComments error:', error);
      throw error;
    }
  }

  /**
   * Add attachment to assignment
   * @param {string} assignmentId - Assignment ID
   * @param {Object} attachment - Attachment data
   * @returns {Promise<Object|null>} Updated assignment
   */
  async addAttachment(assignmentId, attachment) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: assignmentId },
        {
          $push: { attachments: attachment },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );

      return result.value;
    } catch (error) {
      logger.error('[JobAssignmentRepository] addAttachment error:', error);
      throw error;
    }
  }

  /**
   * Get assignment attachments
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Array>} List of attachments
   */
  async getAttachments(assignmentId) {
    try {
      const assignment = await this.collection.findOne(
        { _id: assignmentId },
        { projection: { attachments: 1 } }
      );

      return assignment?.attachments || [];
    } catch (error) {
      logger.error('[JobAssignmentRepository] getAttachments error:', error);
      throw error;
    }
  }

  /**
   * Get assignment history
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Array>} List of history entries
   */
  async getHistory(assignmentId) {
    try {
      const assignment = await this.collection.findOne(
        { _id: assignmentId },
        { projection: { history: 1 } }
      );

      return assignment?.history || [];
    } catch (error) {
      logger.error('[JobAssignmentRepository] getHistory error:', error);
      throw error;
    }
  }

  /**
   * Find jobs near deadline
   * @param {number} hoursThreshold - Hours before deadline
   * @returns {Promise<Array>} Jobs near deadline
   */
  async findNearDeadline(hoursThreshold = 24) {
    try {
      const now = new Date();
      const threshold = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);

      return await this.collection
        .find({
          'sla.dueDate': {
            $gte: now,
            $lte: threshold
          },
          status: { $in: ['assigned', 'accepted', 'in_progress'] }
        })
        .sort({ 'sla.dueDate': 1 })
        .toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findNearDeadline error:', error);
      throw error;
    }
  }

  /**
   * Find SLA breached jobs
   * @returns {Promise<Array>} SLA breached jobs
   */
  async findSLABreached() {
    try {
      const now = new Date();

      return await this.collection
        .find({
          'sla.dueDate': { $lt: now },
          'sla.isOnTime': false,
          status: { $in: ['assigned', 'accepted', 'in_progress'] }
        })
        .sort({ 'sla.dueDate': 1 })
        .toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findSLABreached error:', error);
      throw error;
    }
  }

  /**
   * Update assignment SLA
   * @param {string} assignmentId - Assignment ID
   * @param {Object} slaData - SLA data
   * @returns {Promise<Object|null>} Updated assignment
   */
  async updateSLA(assignmentId, slaData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: assignmentId },
        {
          $set: {
            sla: slaData,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return result.value;
    } catch (error) {
      logger.error('[JobAssignmentRepository] updateSLA error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by job type
   * @param {string} jobType - Job type
   * @param {Object} filters - Optional filters (status, role)
   * @returns {Promise<Array>} List of assignments
   */
  async findByJobType(jobType, filters = {}) {
    try {
      const query = { jobType };

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query.status = { $in: filters.status };
        } else {
          query.status = filters.status;
        }
      }

      if (filters.role) {
        query.role = filters.role;
      }

      return await this.collection.find(query).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByJobType error:', error);
      throw error;
    }
  }

  /**
   * Get comment count for assignment
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<number>} Comment count
   */
  async getCommentCount(assignmentId) {
    try {
      const assignment = await this.collection.findOne(
        { _id: assignmentId },
        { projection: { comments: 1 } }
      );

      return assignment?.comments?.length || 0;
    } catch (error) {
      logger.error('[JobAssignmentRepository] getCommentCount error:', error);
      throw error;
    }
  }

  /**
   * Get SLA statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} SLA statistics
   */
  async getSLAStatistics(filters = {}) {
    try {
      const query = { status: 'completed' };

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.jobType) {
        query.jobType = filters.jobType;
      }

      if (filters.startDate || filters.endDate) {
        query.completedAt = {};
        if (filters.startDate) {
          query.completedAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.completedAt.$lte = new Date(filters.endDate);
        }
      }

      const stats = await this.collection
        .aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              onTime: {
                $sum: {
                  $cond: [{ $eq: ['$sla.isOnTime', true] }, 1, 0]
                }
              },
              breached: {
                $sum: {
                  $cond: [{ $eq: ['$sla.isOnTime', false] }, 1, 0]
                }
              },
              avgActualDuration: { $avg: '$sla.actualDuration' },
              avgExpectedDuration: { $avg: '$sla.expectedDuration' }
            }
          }
        ])
        .toArray();

      if (stats.length === 0) {
        return {
          total: 0,
          onTime: 0,
          breached: 0,
          onTimePercentage: 0,
          avgActualDuration: 0,
          avgExpectedDuration: 0
        };
      }

      const result = stats[0];
      return {
        total: result.total,
        onTime: result.onTime,
        breached: result.breached,
        onTimePercentage: result.total > 0 ? (result.onTime / result.total) * 100 : 0,
        avgActualDuration: result.avgActualDuration || 0,
        avgExpectedDuration: result.avgExpectedDuration || 0
      };
    } catch (error) {
      logger.error('[JobAssignmentRepository] getSLAStatistics error:', error);
      throw error;
    }
  }
}

module.exports = JobAssignmentRepository;
