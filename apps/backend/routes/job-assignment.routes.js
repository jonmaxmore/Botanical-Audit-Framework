/**
 * Job Assignment API Routes
 * Handles job ticket operations: comments, attachments, evidence, SLA tracking
 *
 * @module routes/jobassignment
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { createLogger } = require('../shared/logger');

const logger = createLogger('job-assignment-routes');

// Rate limiting for comment/attachment operations
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 comments per 15 minutes
  message: { error: 'Too many comment requests, please try again later.' }
});

const attachmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads per 15 minutes
  message: { error: 'Too many attachment requests, please try again later.' }
});

/**
 * Initialize routes with dependencies
 * @param {Object} jobAssignmentService - Job assignment service instance
 * @returns {Router} Express router
 */
function createJobAssignmentRoutes(jobAssignmentService) {
  /**
   * POST /api/job-assignments/:id/comments
   * Add comment to assignment
   */
  router.post(
    '/:id/comments',
    commentLimiter,
    auth,
    rbac(['admin', 'reviewer', 'inspector', 'approver']),
    async (req, res) => {
      try {
        const { id: assignmentId } = req.params;
        const { message, attachments = [] } = req.body;
        const userId = req.user.id;

        if (!message || message.trim() === '') {
          return res.status(400).json({
            success: false,
            error: 'Comment message is required'
          });
        }

        const commentData = {
          userId,
          message: message.trim(),
          attachments
        };

        const assignment = await jobAssignmentService.addComment(assignmentId, commentData);

        logger.info(`Comment added to assignment ${assignmentId} by user ${userId}`);

        res.status(201).json({
          success: true,
          message: 'Comment added successfully',
          data: assignment
        });
      } catch (error) {
        logger.error('Add comment error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to add comment'
        });
      }
    }
  );

  /**
   * GET /api/job-assignments/:id/comments
   * Get all comments for assignment
   */
  router.get('/:id/comments', auth, async (req, res) => {
    try {
      const { id: assignmentId } = req.params;

      const comments = await jobAssignmentService.getComments(assignmentId);

      res.status(200).json({
        success: true,
        data: comments
      });
    } catch (error) {
      logger.error('Get comments error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get comments'
      });
    }
  });

  /**
   * POST /api/job-assignments/:id/attachments
   * Add attachment to assignment
   */
  router.post(
    '/:id/attachments',
    attachmentLimiter,
    auth,
    rbac(['admin', 'reviewer', 'inspector', 'approver']),
    async (req, res) => {
      try {
        const { id: assignmentId } = req.params;
        const { type, fileName, fileUrl, fileSize, mimeType } = req.body;
        const userId = req.user.id;

        if (!type || !fileName || !fileUrl) {
          return res.status(400).json({
            success: false,
            error: 'Attachment type, fileName, and fileUrl are required'
          });
        }

        const attachmentData = {
          type,
          fileName,
          fileUrl,
          fileSize: fileSize || 0,
          mimeType: mimeType || 'application/octet-stream',
          uploadedBy: userId
        };

        const assignment = await jobAssignmentService.addAttachment(assignmentId, attachmentData);

        logger.info(`Attachment added to assignment ${assignmentId} by user ${userId}`);

        res.status(201).json({
          success: true,
          message: 'Attachment added successfully',
          data: assignment
        });
      } catch (error) {
        logger.error('Add attachment error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to add attachment'
        });
      }
    }
  );

  /**
   * GET /api/job-assignments/:id/attachments
   * Get all attachments for assignment
   */
  router.get('/:id/attachments', auth, async (req, res) => {
    try {
      const { id: assignmentId } = req.params;

      const attachments = await jobAssignmentService.getAttachments(assignmentId);

      res.status(200).json({
        success: true,
        data: attachments
      });
    } catch (error) {
      logger.error('Get attachments error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get attachments'
      });
    }
  });

  /**
   * GET /api/job-assignments/:id/history
   * Get assignment history (audit trail)
   */
  router.get('/:id/history', auth, async (req, res) => {
    try {
      const { id: assignmentId } = req.params;

      const history = await jobAssignmentService.getJobHistory(assignmentId);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Get history error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get history'
      });
    }
  });

  /**
   * PUT /api/job-assignments/:id/complete-with-evidence
   * Complete assignment with evidence
   */
  router.put(
    '/:id/complete-with-evidence',
    auth,
    rbac(['admin', 'reviewer', 'inspector', 'approver']),
    async (req, res) => {
      try {
        const { id: assignmentId } = req.params;
        const { reportUrl, score, recommendation, summary } = req.body;
        const userId = req.user.id;

        if (!reportUrl) {
          return res.status(400).json({
            success: false,
            error: 'Report URL is required'
          });
        }

        if (score !== undefined && (score < 0 || score > 100)) {
          return res.status(400).json({
            success: false,
            error: 'Score must be between 0 and 100'
          });
        }

        const evidenceData = {
          reportUrl,
          score: score || 0,
          recommendation: recommendation || '',
          summary: summary || ''
        };

        const assignment = await jobAssignmentService.completeWithEvidence(
          assignmentId,
          userId,
          evidenceData
        );

        logger.info(`Assignment ${assignmentId} completed with evidence by user ${userId}`);

        res.status(200).json({
          success: true,
          message: 'Assignment completed with evidence',
          data: assignment
        });
      } catch (error) {
        logger.error('Complete with evidence error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to complete assignment with evidence'
        });
      }
    }
  );

  /**
   * GET /api/job-assignments/sla/near-deadline
   * Get jobs approaching deadline
   */
  router.get(
    '/sla/near-deadline',
    auth,
    rbac(['admin', 'reviewer', 'inspector', 'approver']),
    async (req, res) => {
      try {
        const hoursThreshold = parseInt(req.query.hours) || 24;

        const jobs = await jobAssignmentService.getJobsNearDeadline(hoursThreshold);

        res.status(200).json({
          success: true,
          data: jobs,
          metadata: {
            hoursThreshold,
            count: jobs.length
          }
        });
      } catch (error) {
        logger.error('Get near deadline jobs error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to get near deadline jobs'
        });
      }
    }
  );

  /**
   * GET /api/job-assignments/sla/breached
   * Get SLA breached jobs
   */
  router.get(
    '/sla/breached',
    auth,
    rbac(['admin', 'reviewer', 'inspector', 'approver']),
    async (req, res) => {
      try {
        const jobs = await jobAssignmentService.getSLABreachedJobs();

        res.status(200).json({
          success: true,
          data: jobs,
          metadata: {
            count: jobs.length
          }
        });
      } catch (error) {
        logger.error('Get SLA breached jobs error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to get SLA breached jobs'
        });
      }
    }
  );

  /**
   * GET /api/job-assignments/sla/statistics
   * Get SLA statistics
   */
  router.get(
    '/sla/statistics',
    auth,
    rbac(['admin', 'reviewer', 'inspector', 'approver']),
    async (req, res) => {
      try {
        const filters = {
          role: req.query.role,
          jobType: req.query.jobType,
          startDate: req.query.startDate,
          endDate: req.query.endDate
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
          if (filters[key] === undefined) delete filters[key];
        });

        const statistics = await jobAssignmentService.getSLAStatistics(filters);

        res.status(200).json({
          success: true,
          data: statistics,
          filters
        });
      } catch (error) {
        logger.error('Get SLA statistics error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to get SLA statistics'
        });
      }
    }
  );

  /**
   * GET /api/job-assignments/:id
   * Get single assignment with full details
   */
  router.get('/:id', auth, async (req, res) => {
    try {
      const { id: assignmentId } = req.params;

      const assignment = await jobAssignmentService.getUserAssignments(req.user.id, {
        _id: assignmentId
      });

      if (!assignment || assignment.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Assignment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: assignment[0]
      });
    } catch (error) {
      logger.error('Get assignment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get assignment'
      });
    }
  });

  /**
   * GET /api/job-assignments
   * Get user assignments with filters
   */
  router.get('/', auth, async (req, res) => {
    try {
      const userId = req.query.userId || req.user.id;
      const filters = {
        status: req.query.status,
        role: req.query.role,
        jobType: req.query.jobType
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) delete filters[key];
      });

      const assignments = await jobAssignmentService.getUserAssignments(userId, filters);

      res.status(200).json({
        success: true,
        data: assignments,
        metadata: {
          count: assignments.length,
          filters
        }
      });
    } catch (error) {
      logger.error('Get assignments error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get assignments'
      });
    }
  });

  /**
   * POST /api/job-assignments
   * Create new assignment
   */
  router.post(
    '/',
    auth,
    rbac(['admin', 'reviewer']),
    async (req, res) => {
      try {
        const {
          applicationId,
          assignedTo,
          role,
          jobType,
          priority,
          strategy,
          sla
        } = req.body;

        if (!applicationId || !assignedTo || !role) {
          return res.status(400).json({
            success: false,
            error: 'applicationId, assignedTo, and role are required'
          });
        }

        const assignmentData = {
          applicationId,
          assignedTo,
          role,
          jobType,
          priority,
          strategy,
          sla,
          assignedBy: req.user.id
        };

        const assignment = await jobAssignmentService.createAssignment(assignmentData);

        logger.info(`Assignment created: ${assignment.id} by user ${req.user.id}`);

        res.status(201).json({
          success: true,
          message: 'Assignment created successfully',
          data: assignment
        });
      } catch (error) {
        logger.error('Create assignment error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to create assignment'
        });
      }
    }
  );

  /**
   * PUT /api/job-assignments/:id/accept
   * Accept assignment
   */
  router.put(
    '/:id/accept',
    auth,
    async (req, res) => {
      try {
        const { id: assignmentId } = req.params;
        const userId = req.user.id;

        const assignment = await jobAssignmentService.acceptAssignment(assignmentId, userId);

        logger.info(`Assignment ${assignmentId} accepted by user ${userId}`);

        res.status(200).json({
          success: true,
          message: 'Assignment accepted',
          data: assignment
        });
      } catch (error) {
        logger.error('Accept assignment error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to accept assignment'
        });
      }
    }
  );

  /**
   * PUT /api/job-assignments/:id/start
   * Start working on assignment
   */
  router.put(
    '/:id/start',
    auth,
    async (req, res) => {
      try {
        const { id: assignmentId } = req.params;
        const userId = req.user.id;

        const assignment = await jobAssignmentService.startAssignment(assignmentId, userId);

        logger.info(`Assignment ${assignmentId} started by user ${userId}`);

        res.status(200).json({
          success: true,
          message: 'Assignment started',
          data: assignment
        });
      } catch (error) {
        logger.error('Start assignment error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to start assignment'
        });
      }
    }
  );

  /**
   * PUT /api/job-assignments/:id/complete
   * Complete assignment (basic)
   */
  router.put(
    '/:id/complete',
    auth,
    async (req, res) => {
      try {
        const { id: assignmentId } = req.params;
        const userId = req.user.id;
        const data = req.body;

        const assignment = await jobAssignmentService.completeAssignment(
          assignmentId,
          userId,
          data
        );

        logger.info(`Assignment ${assignmentId} completed by user ${userId}`);

        res.status(200).json({
          success: true,
          message: 'Assignment completed',
          data: assignment
        });
      } catch (error) {
        logger.error('Complete assignment error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to complete assignment'
        });
      }
    }
  );

  /**
   * PUT /api/job-assignments/:id/reassign
   * Reassign job to different user
   */
  router.put(
    '/:id/reassign',
    auth,
    rbac(['admin', 'reviewer']),
    async (req, res) => {
      try {
        const { id: assignmentId } = req.params;
        const { newUserId, reason } = req.body;
        const reassignedBy = req.user.id;

        if (!newUserId || !reason) {
          return res.status(400).json({
            success: false,
            error: 'newUserId and reason are required'
          });
        }

        const assignment = await jobAssignmentService.reassignJob(
          assignmentId,
          newUserId,
          reason,
          reassignedBy
        );

        logger.info(`Assignment ${assignmentId} reassigned to ${newUserId} by ${reassignedBy}`);

        res.status(200).json({
          success: true,
          message: 'Assignment reassigned successfully',
          data: assignment
        });
      } catch (error) {
        logger.error('Reassign assignment error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to reassign assignment'
        });
      }
    }
  );

  return router;
}

module.exports = createJobAssignmentRoutes;
