/**
 * JobAssignmentService
 * Auto job assignment system based on workflow state
 * Handles task prioritization and assignment history
 *
 * @module services/jobassignment
 * @version 1.0.0
 */

const EventEmitter = require('events');
const logger = require('../shared/logger');

class JobAssignmentService extends EventEmitter {
  constructor(assignmentRepository, userRepository, kpiService) {
    super();
    this.assignmentRepository = assignmentRepository;
    this.userRepository = userRepository;
    this.kpiService = kpiService;

    // Assignment status
    this.STATUS = {
      ASSIGNED: 'assigned',
      ACCEPTED: 'accepted',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      REJECTED: 'rejected',
      CANCELLED: 'cancelled',
      REASSIGNED: 'reassigned'
    };

    // Priority levels
    this.PRIORITY = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      URGENT: 'urgent'
    };

    // Role types
    this.ROLES = {
      REVIEWER: 'reviewer',
      INSPECTOR: 'inspector',
      APPROVER: 'approver'
    };

    // Job types
    this.JOB_TYPES = {
      DOCUMENT_REVIEW: 'DOCUMENT_REVIEW',
      FARM_INSPECTION: 'FARM_INSPECTION',
      VIDEO_CALL_INSPECTION: 'VIDEO_CALL_INSPECTION',
      ONSITE_INSPECTION: 'ONSITE_INSPECTION',
      FINAL_APPROVAL: 'FINAL_APPROVAL',
      GENERAL: 'GENERAL'
    };

    // Assignment strategies
    this.STRATEGIES = {
      ROUND_ROBIN: 'round_robin',
      WORKLOAD_BASED: 'workload_based',
      PERFORMANCE_BASED: 'performance_based',
      MANUAL: 'manual'
    };

    // Track round-robin indices
    this.roundRobinIndex = {
      reviewer: 0,
      inspector: 0,
      approver: 0
    };
  }

  /**
   * Auto-assign job to user based on workflow state
   * @param {Object} data - Assignment data
   * @param {string} data.applicationId - Application ID
   * @param {string} data.role - User role (reviewer/inspector/approver)
   * @param {string} data.priority - Priority level (default: 'medium')
   * @param {string} data.strategy - Assignment strategy (default: 'workload_based')
   * @param {string} data.assignedBy - User ID who created assignment (optional)
   * @returns {Promise<Object>} Created assignment
   */
  async autoAssign(data) {
    try {
      const {
        applicationId,
        role,
        priority = this.PRIORITY.MEDIUM,
        strategy = this.STRATEGIES.WORKLOAD_BASED,
        assignedBy = 'system'
      } = data;

      logger.info(
        `[JobAssignmentService] Auto-assigning ${role} for ${applicationId} using ${strategy}`
      );

      // Validate role
      if (!Object.values(this.ROLES).includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }

      // Get available users for this role
      const availableUsers = await this.userRepository.findByRole(role);
      if (availableUsers.length === 0) {
        throw new Error(`No users available for role: ${role}`);
      }

      // Select user based on strategy
      let selectedUser;
      switch (strategy) {
        case this.STRATEGIES.ROUND_ROBIN:
          selectedUser = this._selectRoundRobin(role, availableUsers);
          break;
        case this.STRATEGIES.WORKLOAD_BASED:
          selectedUser = await this._selectByWorkload(role, availableUsers);
          break;
        case this.STRATEGIES.PERFORMANCE_BASED:
          selectedUser = await this._selectByPerformance(role, availableUsers);
          break;
        default:
          selectedUser = this._selectRoundRobin(role, availableUsers);
      }

      // Create assignment
      const assignment = await this.createAssignment({
        applicationId,
        assignedTo: selectedUser.id,
        role,
        priority,
        assignedBy,
        strategy
      });

      return assignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Auto-assign error:', error);
      throw error;
    }
  }

  /**
   * Create manual job assignment
   * @param {Object} data - Assignment data
   * @param {string} data.applicationId - Application ID
   * @param {string} data.assignedTo - User ID to assign to
   * @param {string} data.role - User role
   * @param {string} data.priority - Priority level
   * @param {string} data.assignedBy - User ID who created assignment
   * @param {string} data.strategy - Assignment strategy
   * @param {string} data.jobType - Job type (optional, defaults based on role)
   * @param {Object} data.sla - SLA configuration (optional)
   * @returns {Promise<Object>} Created assignment
   */
  async createAssignment(data) {
    try {
      const {
        applicationId,
        assignedTo,
        role,
        priority = this.PRIORITY.MEDIUM,
        assignedBy = 'system',
        strategy = this.STRATEGIES.MANUAL,
        jobType = null,
        sla = {}
      } = data;

      logger.info(`[JobAssignmentService] Creating assignment for ${assignedTo} (${role})`);

      // Check if assignment already exists
      const existingAssignment = await this.assignmentRepository.findByApplicationAndRole(
        applicationId,
        role
      );

      if (existingAssignment && existingAssignment.status !== this.STATUS.COMPLETED) {
        logger.warn(
          `[JobAssignmentService] Active assignment already exists: ${existingAssignment.id}`
        );
        return existingAssignment;
      }

      // Determine jobType based on role if not provided
      const finalJobType = jobType || this._getDefaultJobType(role);

      // Create assignment
      const assignment = await this.assignmentRepository.create({
        applicationId,
        assignedTo,
        assignedBy,
        role,
        jobType: finalJobType,
        priority,
        strategy,
        status: this.STATUS.ASSIGNED,
        assignedAt: new Date(),
        acceptedAt: null,
        startedAt: null,
        completedAt: null,
        sla: {
          expectedDuration: sla.expectedDuration || this._getDefaultSLA(finalJobType),
          dueDate:
            sla.dueDate ||
            this._calculateDueDate(sla.expectedDuration || this._getDefaultSLA(finalJobType)),
          actualDuration: null,
          isOnTime: null,
          delayReason: null
        },
        history: [
          {
            action: 'CREATED',
            timestamp: new Date(),
            actor: assignedBy,
            details: {
              strategy,
              priority,
              jobType: finalJobType
            }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Start KPI tracking
      if (this.kpiService) {
        await this.kpiService.startTask({
          taskId: `assignment_${assignment.id}`,
          applicationId,
          role,
          userId: assignedTo,
          comments: `Auto-assigned using ${strategy} strategy`
        });
      }

      this.emit('assignment:created', {
        assignment,
        applicationId,
        assignedTo,
        role,
        jobType: finalJobType
      });

      logger.info(`[JobAssignmentService] Assignment created: ${assignment.id}`);
      return assignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Create assignment error:', error);
      throw error;
    }
  }

  /**
   * Accept job assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Updated assignment
   */
  async acceptAssignment(assignmentId, userId) {
    try {
      logger.info(`[JobAssignmentService] User ${userId} accepting assignment ${assignmentId}`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      if (assignment.assignedTo !== userId) {
        throw new Error('Unauthorized to accept this assignment');
      }

      if (assignment.status !== this.STATUS.ASSIGNED) {
        throw new Error(`Cannot accept assignment with status: ${assignment.status}`);
      }

      // Record history
      await assignment.recordHistory({
        action: 'ACCEPTED',
        actor: userId,
        details: { acceptedAt: new Date() }
      });

      const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.ACCEPTED,
        acceptedAt: new Date(),
        updatedAt: new Date(),
        history: assignment.history
      });

      this.emit('assignment:accepted', { assignment: updatedAssignment, userId });

      return updatedAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Accept assignment error:', error);
      throw error;
    }
  }

  /**
   * Start working on assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Updated assignment
   */
  async startAssignment(assignmentId, userId) {
    try {
      logger.info(`[JobAssignmentService] User ${userId} starting assignment ${assignmentId}`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      if (assignment.assignedTo !== userId) {
        throw new Error('Unauthorized to start this assignment');
      }

      if (![this.STATUS.ASSIGNED, this.STATUS.ACCEPTED].includes(assignment.status)) {
        throw new Error(`Cannot start assignment with status: ${assignment.status}`);
      }

      // Record history
      await assignment.recordHistory({
        action: 'STARTED',
        actor: userId,
        details: { startedAt: new Date() }
      });

      const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.IN_PROGRESS,
        startedAt: new Date(),
        acceptedAt: assignment.acceptedAt || new Date(),
        updatedAt: new Date(),
        history: assignment.history
      });

      this.emit('assignment:started', { assignment: updatedAssignment, userId });

      return updatedAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Start assignment error:', error);
      throw error;
    }
  }

  /**
   * Complete job assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} userId - User ID (for verification)
   * @param {Object} data - Completion data (optional)
   * @returns {Promise<Object>} Updated assignment
   */
  async completeAssignment(assignmentId, userId, data = {}) {
    try {
      logger.info(`[JobAssignmentService] User ${userId} completing assignment ${assignmentId}`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      if (assignment.assignedTo !== userId) {
        throw new Error('Unauthorized to complete this assignment');
      }

      // Calculate SLA
      await assignment.calculateSLA();

      // Record history
      await assignment.recordHistory({
        action: 'COMPLETED',
        actor: userId,
        details: { completedAt: new Date(), ...data }
      });

      const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.COMPLETED,
        completedAt: new Date(),
        updatedAt: new Date(),
        sla: assignment.sla,
        history: assignment.history,
        ...data
      });

      // Complete KPI tracking
      if (this.kpiService) {
        await this.kpiService.completeTask(`assignment_${assignmentId}`, {
          comments: data.comments || 'Assignment completed',
          feedbackScore: data.feedbackScore
        });
      }

      this.emit('assignment:completed', { assignment: updatedAssignment, userId });

      return updatedAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Complete assignment error:', error);
      throw error;
    }
  }

  /**
   * Reassign job to different user
   * @param {string} assignmentId - Assignment ID
   * @param {string} newUserId - New user ID
   * @param {string} reason - Reassignment reason
   * @param {string} reassignedBy - User ID who is reassigning
   * @returns {Promise<Object>} New assignment
   */
  async reassignJob(assignmentId, newUserId, reason, reassignedBy) {
    try {
      logger.info(`[JobAssignmentService] Reassigning ${assignmentId} to ${newUserId}`);

      const oldAssignment = await this.assignmentRepository.findById(assignmentId);
      if (!oldAssignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      // Mark old assignment as reassigned
      await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.REASSIGNED,
        reassignedTo: newUserId,
        reassignedBy,
        reassignReason: reason,
        updatedAt: new Date()
      });

      // Create new assignment
      const newAssignment = await this.createAssignment({
        applicationId: oldAssignment.applicationId,
        assignedTo: newUserId,
        role: oldAssignment.role,
        priority: oldAssignment.priority,
        assignedBy: reassignedBy,
        strategy: this.STRATEGIES.MANUAL
      });

      this.emit('assignment:reassigned', {
        oldAssignment,
        newAssignment,
        newUserId,
        reason
      });

      return newAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Reassign job error:', error);
      throw error;
    }
  }

  /**
   * Get user assignments
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (status, role)
   * @returns {Promise<Array>} List of assignments
   */
  async getUserAssignments(userId, filters = {}) {
    try {
      return await this.assignmentRepository.findByUser(userId, filters);
    } catch (error) {
      logger.error('[JobAssignmentService] Get user assignments error:', error);
      throw error;
    }
  }

  /**
   * Get assignments for application
   * @param {string} applicationId - Application ID
   * @returns {Promise<Array>} List of assignments
   */
  async getApplicationAssignments(applicationId) {
    try {
      return await this.assignmentRepository.findByApplication(applicationId);
    } catch (error) {
      logger.error('[JobAssignmentService] Get application assignments error:', error);
      throw error;
    }
  }

  /**
   * Get assignment statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Assignment statistics
   */
  async getStatistics(filters = {}) {
    try {
      return await this.assignmentRepository.getStatistics(filters);
    } catch (error) {
      logger.error('[JobAssignmentService] Get statistics error:', error);
      throw error;
    }
  }

  /**
   * Select user using round-robin strategy
   * @private
   */
  _selectRoundRobin(role, users) {
    const index = this.roundRobinIndex[role] % users.length;
    const selectedUser = users[index];
    this.roundRobinIndex[role]++;
    return selectedUser;
  }

  /**
   * Select user based on current workload
   * @private
   */
  async _selectByWorkload(role, users) {
    try {
      // Get active assignments for each user
      const workloads = await Promise.all(
        users.map(async user => {
          const activeAssignments = await this.assignmentRepository.findByUser(user.id, {
            status: [this.STATUS.ASSIGNED, this.STATUS.ACCEPTED, this.STATUS.IN_PROGRESS]
          });
          return {
            user,
            workload: activeAssignments.length
          };
        })
      );

      // Sort by workload (ascending) and select user with least workload
      workloads.sort((a, b) => a.workload - b.workload);
      return workloads[0].user;
    } catch (error) {
      logger.error('[JobAssignmentService] Select by workload error:', error);
      // Fallback to round-robin
      return this._selectRoundRobin(role, users);
    }
  }

  /**
   * Select user based on performance metrics
   * @private
   */
  async _selectByPerformance(role, users) {
    try {
      if (!this.kpiService) {
        return this._selectRoundRobin(role, users);
      }

      // Get performance metrics for each user
      const performances = await Promise.all(
        users.map(async user => {
          const metrics = await this.kpiService.getUserMetrics(user.id);
          return {
            user,
            score: this._calculatePerformanceScore(metrics)
          };
        })
      );

      // Sort by score (descending) and select best performer
      performances.sort((a, b) => b.score - a.score);
      return performances[0].user;
    } catch (error) {
      logger.error('[JobAssignmentService] Select by performance error:', error);
      // Fallback to round-robin
      return this._selectRoundRobin(role, users);
    }
  }

  /**
   * Calculate performance score from KPI metrics
   * @private
   */
  _calculatePerformanceScore(metrics) {
    // Weighted score: completion rate (40%), feedback score (30%), speed (30%)
    const completionScore = metrics.completionRate * 0.4;
    const feedbackScore = (metrics.avgFeedbackScore / 5) * 100 * 0.3;
    const speedScore = Math.max(0, 100 - (metrics.avgProcessingHours / 24) * 100) * 0.3;

    return completionScore + feedbackScore + speedScore;
  }

  /**
   * Cancel assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated assignment
   */
  async cancelAssignment(assignmentId, reason) {
    try {
      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.CANCELLED,
        cancellationReason: reason,
        updatedAt: new Date()
      });

      // Cancel KPI tracking
      if (this.kpiService) {
        await this.kpiService.cancelTask(`assignment_${assignmentId}`);
      }

      this.emit('assignment:cancelled', { assignment: updatedAssignment, reason });

      return updatedAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Cancel assignment error:', error);
      throw error;
    }
  }

  /**
   * Add comment to assignment
   * @param {string} assignmentId - Assignment ID
   * @param {Object} commentData - Comment data
   * @param {string} commentData.userId - User ID who is commenting
   * @param {string} commentData.message - Comment message
   * @param {Array} commentData.attachments - Optional attachments
   * @returns {Promise<Object>} Updated assignment
   */
  async addComment(assignmentId, commentData) {
    try {
      logger.info(`[JobAssignmentService] Adding comment to assignment ${assignmentId}`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      // Add comment using model method
      await assignment.addComment(commentData);

      // Save updated assignment
      await assignment.save();

      this.emit('assignment:comment_added', {
        assignmentId,
        comment: commentData,
        assignment
      });

      logger.info(`[JobAssignmentService] Comment added to assignment ${assignmentId}`);
      return assignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Add comment error:', error);
      throw error;
    }
  }

  /**
   * Add attachment to assignment
   * @param {string} assignmentId - Assignment ID
   * @param {Object} attachmentData - Attachment data
   * @param {string} attachmentData.type - Attachment type
   * @param {string} attachmentData.fileName - File name
   * @param {string} attachmentData.fileUrl - File URL
   * @param {string} attachmentData.uploadedBy - User ID who uploaded
   * @returns {Promise<Object>} Updated assignment
   */
  async addAttachment(assignmentId, attachmentData) {
    try {
      logger.info(`[JobAssignmentService] Adding attachment to assignment ${assignmentId}`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      // Add attachment using model method
      await assignment.addAttachment(attachmentData);

      // Save updated assignment
      await assignment.save();

      this.emit('assignment:attachment_added', {
        assignmentId,
        attachment: attachmentData,
        assignment
      });

      logger.info(`[JobAssignmentService] Attachment added to assignment ${assignmentId}`);
      return assignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Add attachment error:', error);
      throw error;
    }
  }

  /**
   * Complete assignment with evidence
   * @param {string} assignmentId - Assignment ID
   * @param {string} userId - User ID (for verification)
   * @param {Object} evidenceData - Evidence data
   * @param {string} evidenceData.reportUrl - Report URL
   * @param {number} evidenceData.score - Score (0-100)
   * @param {string} evidenceData.recommendation - Recommendation
   * @param {string} evidenceData.summary - Summary
   * @returns {Promise<Object>} Updated assignment
   */
  async completeWithEvidence(assignmentId, userId, evidenceData) {
    try {
      logger.info(`[JobAssignmentService] Completing assignment ${assignmentId} with evidence`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      if (assignment.assignedTo !== userId) {
        throw new Error('Unauthorized to complete this assignment');
      }

      // Complete with evidence using model method
      await assignment.completeWithEvidence(evidenceData);

      // Save updated assignment
      await assignment.save();

      // Complete KPI tracking
      if (this.kpiService) {
        await this.kpiService.completeTask(`assignment_${assignmentId}`, {
          comments: evidenceData.summary || 'Assignment completed with evidence',
          feedbackScore: evidenceData.score / 20 // Convert 0-100 to 0-5
        });
      }

      this.emit('assignment:completed_with_evidence', {
        assignmentId,
        userId,
        evidence: evidenceData,
        assignment
      });

      logger.info(`[JobAssignmentService] Assignment ${assignmentId} completed with evidence`);
      return assignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Complete with evidence error:', error);
      throw error;
    }
  }

  /**
   * Get assignment history
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Array>} Assignment history
   */
  async getJobHistory(assignmentId) {
    try {
      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      return assignment.history || [];
    } catch (error) {
      logger.error('[JobAssignmentService] Get job history error:', error);
      throw error;
    }
  }

  /**
   * Get assignment comments
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Array>} Assignment comments
   */
  async getComments(assignmentId) {
    try {
      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      return assignment.comments || [];
    } catch (error) {
      logger.error('[JobAssignmentService] Get comments error:', error);
      throw error;
    }
  }

  /**
   * Get assignment attachments
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Array>} Assignment attachments
   */
  async getAttachments(assignmentId) {
    try {
      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      return assignment.attachments || [];
    } catch (error) {
      logger.error('[JobAssignmentService] Get attachments error:', error);
      throw error;
    }
  }

  /**
   * Get jobs near deadline
   * @param {number} hoursThreshold - Hours before deadline to consider
   * @returns {Promise<Array>} Jobs near deadline
   */
  async getJobsNearDeadline(hoursThreshold = 24) {
    try {
      const JobAssignmentModel = require('../models/job-assignment-model');
      return await JobAssignmentModel.findNearDeadline(hoursThreshold);
    } catch (error) {
      logger.error('[JobAssignmentService] Get jobs near deadline error:', error);
      throw error;
    }
  }

  /**
   * Get SLA breached jobs
   * @returns {Promise<Array>} SLA breached jobs
   */
  async getSLABreachedJobs() {
    try {
      const JobAssignmentModel = require('../models/job-assignment-model');
      return await JobAssignmentModel.findSLABreached();
    } catch (error) {
      logger.error('[JobAssignmentService] Get SLA breached jobs error:', error);
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
      const JobAssignmentModel = require('../models/job-assignment-model');
      return await JobAssignmentModel.getSLAStatistics(filters);
    } catch (error) {
      logger.error('[JobAssignmentService] Get SLA statistics error:', error);
      throw error;
    }
  }

  /**
   * Helper: Get default job type based on role
   * @private
   */
  _getDefaultJobType(role) {
    const roleToJobType = {
      [this.ROLES.REVIEWER]: this.JOB_TYPES.DOCUMENT_REVIEW,
      [this.ROLES.INSPECTOR]: this.JOB_TYPES.FARM_INSPECTION,
      [this.ROLES.APPROVER]: this.JOB_TYPES.FINAL_APPROVAL
    };
    return roleToJobType[role] || this.JOB_TYPES.GENERAL;
  }

  /**
   * Helper: Get default SLA duration in hours based on job type
   * @private
   */
  _getDefaultSLA(jobType) {
    const slaMap = {
      [this.JOB_TYPES.DOCUMENT_REVIEW]: 48, // 2 days
      [this.JOB_TYPES.FARM_INSPECTION]: 120, // 5 days
      [this.JOB_TYPES.VIDEO_CALL_INSPECTION]: 72, // 3 days
      [this.JOB_TYPES.ONSITE_INSPECTION]: 168, // 7 days
      [this.JOB_TYPES.FINAL_APPROVAL]: 24, // 1 day
      [this.JOB_TYPES.GENERAL]: 72 // 3 days
    };
    return slaMap[jobType] || 72;
  }

  /**
   * Helper: Calculate due date based on expected duration
   * @private
   */
  _calculateDueDate(expectedDurationHours) {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + expectedDurationHours);
    return dueDate;
  }
}

module.exports = JobAssignmentService;
