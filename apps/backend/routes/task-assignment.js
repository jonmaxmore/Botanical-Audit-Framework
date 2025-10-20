/**
 * Task Assignment API Routes
 * Handles task creation, assignment, and management with Blitzz integration
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  BlitzzIntegrationService,
  TaskAssignment,
} = require('../services/blitzz-integration');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const auditMiddleware = require('../middleware/audit');

// Initialize Blitzz service
const blitzzService = new BlitzzIntegrationService();

// Rate limiting for task creation
const taskCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 task creations per windowMs
  message: {
    error: 'Too many task creation requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for task updates
const taskUpdateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 updates per windowMs
  message: {
    error: 'Too many task update requests, please try again later.',
  },
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post(
  '/',
  taskCreationLimiter,
  auth,
  rbac(['admin', 'reviewer', 'farmer']),
  auditMiddleware,
  async (req, res) => {
    try {
      const {
        taskInfo,
        assignment,
        scheduling,
        context,
        requirements,
        syncWithBlitzz = true,
      } = req.body;

      // Validate required fields
      if (!taskInfo.title || !assignment.assignedTo.userId) {
        return res.status(400).json({
          success: false,
          error: 'Task title and assignee are required',
        });
      }

      // Set creator information
      const taskData = {
        taskInfo,
        assignment: {
          ...assignment,
          assignedBy: {
            userId: req.user.userId,
            userName: req.user.userName,
            userRole: req.user.role,
            assignedAt: new Date(),
          },
        },
        scheduling,
        context: {
          ...context,
          sourceSystem: 'gacp-platform',
          sourceEvent: 'manual_creation',
        },
        requirements,
        syncWithBlitzz,
      };

      const task = await blitzzService.createTask(taskData);

      // Log audit trail
      req.auditLog = {
        action: 'task_created',
        details: {
          taskId: task.taskId,
          assignedTo: assignment.assignedTo.userId,
          category: taskInfo.category,
          priority: taskInfo.priority,
        },
      };

      res.status(201).json({
        success: true,
        data: {
          task: {
            taskId: task.taskId,
            title: task.taskInfo.title,
            category: task.taskInfo.category,
            priority: task.taskInfo.priority,
            status: task.status.current,
            assignedTo: task.assignment.assignedTo,
            dueDate: task.scheduling.dueDate,
            blitzzSynced: task.blitzzIntegration.syncStatus === 'synced',
          },
        },
        message: 'Task created successfully',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create task',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * GET /api/tasks
 * Get tasks for current user or all tasks (admin)
 */
router.get('/', auth, rbac(['admin', 'reviewer', 'farmer']), async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      includeTeam = 'false',
      page = 1,
      limit = 20,
      viewAll = 'false',
    } = req.query;

    let result;

    if (req.user.role === 'admin' && viewAll === 'true') {
      // Admin can view all tasks
      const query = {};
      if (status) query['status.current'] = status;
      if (category) query['taskInfo.category'] = category;
      if (priority) query['taskInfo.priority'] = priority;

      const tasks = await TaskAssignment.find(query)
        .sort({ 'scheduling.dueDate': 1, 'taskInfo.priority': -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('assignment.assignedTo.userId', 'userName email role');

      const total = await TaskAssignment.countDocuments(query);

      result = {
        tasks,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1,
        },
      };
    } else {
      // Get tasks for specific user
      result = await blitzzService.getTasksForUser(req.user.userId, {
        status,
        category,
        priority,
        includeTeam: includeTeam === 'true',
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
    });
  }
});

/**
 * GET /api/tasks/:taskId
 * Get task details
 */
router.get('/:taskId', auth, rbac(['admin', 'reviewer', 'farmer']), async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await TaskAssignment.findOne({ taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Check access permissions
    const hasAccess =
      req.user.role === 'admin' ||
      task.assignment.assignedTo.userId === req.user.userId ||
      task.assignment.team.some(member => member.userId === req.user.userId) ||
      task.assignment.assignedBy.userId === req.user.userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Update view count
    task.metrics.viewCount += 1;
    task.metrics.lastViewedAt = new Date();
    await task.save();

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
    });
  }
});

/**
 * PATCH /api/tasks/:taskId/status
 * Update task status
 */
router.patch(
  '/:taskId/status',
  taskUpdateLimiter,
  auth,
  rbac(['admin', 'reviewer', 'farmer']),
  auditMiddleware,
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status, reason, notes } = req.body;

      const validStatuses = [
        'draft',
        'assigned',
        'accepted',
        'in_progress',
        'on_hold',
        'review',
        'revision',
        'completed',
        'cancelled',
        'rejected',
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status',
        });
      }

      const task = await blitzzService.updateTaskStatus(
        taskId,
        status,
        req.user.userId,
        reason,
        notes
      );

      // Log audit trail
      req.auditLog = {
        action: 'task_status_updated',
        details: {
          taskId,
          oldStatus: task.status.statusHistory[task.status.statusHistory.length - 2]?.status,
          newStatus: status,
          reason,
          notes,
        },
      };

      res.json({
        success: true,
        data: {
          task: {
            taskId: task.taskId,
            status: task.status.current,
            completionPercentage: task.progress.completionPercentage,
            lastUpdated: new Date(),
          },
        },
        message: 'Task status updated successfully',
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update task status',
      });
    }
  }
);

/**
 * PATCH /api/tasks/:taskId/assign
 * Reassign task to different user
 */
router.patch(
  '/:taskId/assign',
  taskUpdateLimiter,
  auth,
  rbac(['admin', 'reviewer']),
  auditMiddleware,
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { newAssigneeId, reason } = req.body;

      const task = await TaskAssignment.findOne({ taskId });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        });
      }

      // Store reassignment history
      task.assignment.reassignmentHistory.push({
        fromUserId: task.assignment.assignedTo.userId,
        toUserId: newAssigneeId,
        reason,
        reassignedBy: req.user.userId,
        reassignedAt: new Date(),
      });

      // Update assignment
      const oldAssignee = task.assignment.assignedTo;
      task.assignment.assignedTo.userId = newAssigneeId;
      // Note: In production, you'd fetch the new assignee's details
      task.assignment.assignedTo.assignedAt = new Date();

      await task.save();

      // Send notifications to both old and new assignees
      // Implementation would depend on your notification service

      // Log audit trail
      req.auditLog = {
        action: 'task_reassigned',
        details: {
          taskId,
          fromUserId: oldAssignee.userId,
          toUserId: newAssigneeId,
          reason,
        },
      };

      res.json({
        success: true,
        data: {
          task: {
            taskId: task.taskId,
            assignedTo: task.assignment.assignedTo,
            reassignedAt: new Date(),
          },
        },
        message: 'Task reassigned successfully',
      });
    } catch (error) {
      console.error('Error reassigning task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reassign task',
      });
    }
  }
);

/**
 * POST /api/tasks/:taskId/comments
 * Add comment to task
 */
router.post(
  '/:taskId/comments',
  taskUpdateLimiter,
  auth,
  rbac(['admin', 'reviewer', 'farmer']),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { comment } = req.body;

      const task = await TaskAssignment.findOne({ taskId });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        });
      }

      // Check access permissions
      const hasAccess =
        req.user.role === 'admin' ||
        task.assignment.assignedTo.userId === req.user.userId ||
        task.assignment.team.some(member => member.userId === req.user.userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      const newComment = {
        commentId: `COMMENT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        userId: req.user.userId,
        userName: req.user.userName,
        comment,
        timestamp: new Date(),
      };

      task.communication.comments.push(newComment);
      await task.save();

      res.status(201).json({
        success: true,
        data: { comment: newComment },
        message: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add comment',
      });
    }
  }
);

/**
 * POST /api/tasks/:taskId/time-entry
 * Add time entry for task
 */
router.post(
  '/:taskId/time-entry',
  taskUpdateLimiter,
  auth,
  rbac(['admin', 'reviewer', 'farmer']),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { startTime, endTime, description, billable = true } = req.body;

      const task = await TaskAssignment.findOne({ taskId });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        });
      }

      // Validate time entry
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time',
        });
      }

      const duration = Math.floor((end - start) / (1000 * 60)); // Duration in minutes

      const timeEntry = {
        userId: req.user.userId,
        startTime: start,
        endTime: end,
        duration,
        description,
        billable,
        entryDate: new Date(),
      };

      task.scheduling.timeEntries.push(timeEntry);

      // Update actual hours
      const totalMinutes = task.scheduling.timeEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      );
      task.taskInfo.actualHours = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal

      await task.save();

      res.status(201).json({
        success: true,
        data: {
          timeEntry,
          totalHours: task.taskInfo.actualHours,
        },
        message: 'Time entry added successfully',
      });
    } catch (error) {
      console.error('Error adding time entry:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add time entry',
      });
    }
  }
);

/**
 * POST /api/tasks/audit-preparation
 * Create audit preparation tasks
 */
router.post(
  '/audit-preparation',
  taskCreationLimiter,
  auth,
  rbac(['admin', 'reviewer']),
  auditMiddleware,
  async (req, res) => {
    try {
      const auditData = req.body;

      const tasks = await blitzzService.createAuditPreparationTasks(auditData);

      // Log audit trail
      req.auditLog = {
        action: 'audit_preparation_tasks_created',
        details: {
          auditId: auditData.auditId,
          farmCode: auditData.farmCode,
          tasksCreated: tasks.length,
          taskIds: tasks.map(task => task.taskId),
        },
      };

      res.status(201).json({
        success: true,
        data: {
          tasks: tasks.map(task => ({
            taskId: task.taskId,
            title: task.taskInfo.title,
            category: task.taskInfo.category,
            dueDate: task.scheduling.dueDate,
            assignedTo: task.assignment.assignedTo,
          })),
        },
        message: `${tasks.length} audit preparation tasks created successfully`,
      });
    } catch (error) {
      console.error('Error creating audit preparation tasks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create audit preparation tasks',
      });
    }
  }
);

/**
 * GET /api/tasks/dashboard/summary
 * Get dashboard summary data
 */
router.get('/dashboard/summary', auth, rbac(['admin', 'reviewer']), async (req, res) => {
  try {
    const dashboardData = await blitzzService.getAdminDashboardData();

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
});

/**
 * GET /api/tasks/overdue
 * Get overdue tasks
 */
router.get('/overdue', auth, rbac(['admin', 'reviewer']), async (req, res) => {
  try {
    const overdueTasks = await TaskAssignment.find({
      'scheduling.dueDate': { $lt: new Date() },
      'status.current': { $nin: ['completed', 'cancelled'] },
    })
      .sort({ 'scheduling.dueDate': 1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        tasks: overdueTasks,
        count: overdueTasks.length,
      },
    });
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue tasks',
    });
  }
});

/**
 * POST /api/tasks/:taskId/sync-blitzz
 * Manual sync with Blitzz
 */
router.post('/:taskId/sync-blitzz', auth, rbac(['admin']), async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await TaskAssignment.findOne({ taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    if (!task.blitzzIntegration.externalTaskId) {
      // Create in Blitzz if not exists
      await blitzzService.createBlitzzTask(task);
    } else {
      // Sync existing task
      await blitzzService.syncTaskStatusToBlitzz(task);
    }

    res.json({
      success: true,
      data: {
        syncStatus: task.blitzzIntegration.syncStatus,
        lastSyncAt: task.blitzzIntegration.lastSyncAt,
        externalTaskId: task.blitzzIntegration.externalTaskId,
      },
      message: 'Task synced with Blitzz successfully',
    });
  } catch (error) {
    console.error('Error syncing with Blitzz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync with Blitzz',
    });
  }
});

module.exports = router;
