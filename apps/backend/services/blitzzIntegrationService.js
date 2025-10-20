/**
 * Blitzz Task Assignment Integration Service
 * External task management system integration for GACP platform
 */

const axios = require('axios');
const mongoose = require('mongoose');
const EventEmitter = require('events');
const { EnhancedNotificationService } = require('./enhancedNotificationService');

// Task Assignment Schema for internal tracking
const TaskAssignmentSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        return `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      },
    },

    // Blitzz integration
    blitzzIntegration: {
      externalTaskId: String, // ID in Blitzz system
      blitzzProjectId: String, // Project ID in Blitzz
      blitzzWorkspaceId: String, // Workspace ID in Blitzz
      syncStatus: {
        type: String,
        enum: ['pending', 'synced', 'error', 'manual'],
        default: 'pending',
      },
      lastSyncAt: Date,
      syncErrors: [String],
    },

    // Task information
    taskInfo: {
      title: { type: String, required: true, maxlength: 200 },
      titleTH: { type: String, maxlength: 200 },
      description: { type: String, maxlength: 2000 },
      descriptionTH: { type: String, maxlength: 2000 },

      category: {
        type: String,
        enum: [
          'audit_preparation', // เตรียมการตรวจสอบ
          'field_inspection', // ตรวจสอบภาคสนาม
          'document_review', // ตรวจสอบเอกสาร
          'sop_verification', // ตรวจสอบ SOP
          'cannabis_compliance', // ตรวจสอบกัญชา
          'corrective_action', // การแก้ไข
          'follow_up', // ติดตาม
          'training', // การฝึกอบรม
          'system_maintenance', // บำรุงรักษาระบบ
          'administrative', // งานธุรการ
          'custom', // กำหนดเอง
        ],
        required: true,
      },

      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent', 'critical'],
        default: 'medium',
      },

      complexity: {
        type: String,
        enum: ['simple', 'moderate', 'complex', 'expert'],
        default: 'moderate',
      },

      estimatedHours: Number,
      actualHours: Number,
    },

    // Assignment details
    assignment: {
      assignedTo: {
        userId: { type: String, required: true },
        userName: String,
        userRole: String,
        userEmail: String,
        assignedAt: { type: Date, default: Date.now },
      },

      assignedBy: {
        userId: String,
        userName: String,
        userRole: String,
        assignedAt: Date,
      },

      team: [
        {
          userId: String,
          userName: String,
          userRole: String,
          responsibility: String,
          addedAt: { type: Date, default: Date.now },
        },
      ],

      reassignmentHistory: [
        {
          fromUserId: String,
          toUserId: String,
          reason: String,
          reassignedBy: String,
          reassignedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Scheduling and deadlines
    scheduling: {
      createdAt: { type: Date, default: Date.now },
      startDate: Date,
      dueDate: Date,
      completedAt: Date,

      // Milestone tracking
      milestones: [
        {
          milestoneId: String,
          title: String,
          description: String,
          targetDate: Date,
          completedAt: Date,
          status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'cancelled'],
            default: 'pending',
          },
        },
      ],

      // Time tracking
      timeEntries: [
        {
          userId: String,
          startTime: Date,
          endTime: Date,
          duration: Number, // minutes
          description: String,
          billable: { type: Boolean, default: true },
          entryDate: { type: Date, default: Date.now },
        },
      ],
    },

    // Context and relationships
    context: {
      // Related GACP entities
      farmCode: String,
      applicationId: String,
      auditId: String,
      sopCode: String,
      cultivationRecordCode: String,

      // Source of task creation
      sourceSystem: String,
      sourceEvent: String,
      automatedTask: { type: Boolean, default: false },

      // Dependencies
      dependencies: [
        {
          dependsOnTaskId: String,
          dependencyType: {
            type: String,
            enum: ['blocks', 'requires', 'related', 'follows'],
          },
          description: String,
        },
      ],

      // Related documents and resources
      resources: [
        {
          resourceType: String,
          resourceId: String,
          resourceUrl: String,
          description: String,
          required: { type: Boolean, default: false },
        },
      ],
    },

    // Task requirements and specifications
    requirements: {
      skills: [String], // Required skills
      certifications: [String], // Required certifications
      experience: String, // Experience level needed
      equipment: [String], // Required equipment
      location: String, // Where task must be performed

      // Cannabis-specific requirements
      cannabisLicense: {
        required: { type: Boolean, default: false },
        licenseType: String,
        minimumLevel: String,
      },

      // Quality requirements
      qualityStandards: [
        {
          standard: String,
          requirement: String,
          measurementCriteria: String,
        },
      ],

      // Compliance requirements
      complianceChecks: [
        {
          checkType: String,
          requirement: String,
          verificationMethod: String,
        },
      ],
    },

    // Status and workflow
    status: {
      current: {
        type: String,
        enum: [
          'draft', // ร่าง
          'assigned', // มอบหมายแล้ว
          'accepted', // รับงานแล้ว
          'in_progress', // กำลังดำเนินการ
          'on_hold', // หยุดชั่วคราว
          'review', // ตรวจสอบ
          'revision', // แก้ไข
          'completed', // เสร็จสิ้น
          'cancelled', // ยกเลิก
          'rejected', // ปฏิเสธ
        ],
        default: 'draft',
      },

      statusHistory: [
        {
          status: String,
          changedAt: { type: Date, default: Date.now },
          changedBy: String,
          reason: String,
          notes: String,
        },
      ],

      workflowStep: String,
      nextAction: String,
      escalated: { type: Boolean, default: false },
      escalationLevel: Number,
    },

    // Progress and deliverables
    progress: {
      completionPercentage: { type: Number, min: 0, max: 100, default: 0 },

      deliverables: [
        {
          deliverableId: String,
          title: String,
          description: String,
          dueDate: Date,
          status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'approved', 'rejected'],
            default: 'pending',
          },
          submittedAt: Date,
          approvedAt: Date,
          rejectionReason: String,
          fileUrls: [String],
        },
      ],

      checkpoints: [
        {
          checkpointId: String,
          title: String,
          description: String,
          scheduledDate: Date,
          completedAt: Date,
          status: String,
          notes: String,
        },
      ],
    },

    // Communication and updates
    communication: {
      updates: [
        {
          updateId: String,
          userId: String,
          userName: String,
          updateType: {
            type: String,
            enum: ['progress', 'issue', 'question', 'milestone', 'completion'],
          },
          message: String,
          timestamp: { type: Date, default: Date.now },
          attachments: [String],
          visibility: {
            type: String,
            enum: ['all', 'team', 'assigned', 'admin'],
            default: 'team',
          },
        },
      ],

      comments: [
        {
          commentId: String,
          userId: String,
          userName: String,
          comment: String,
          timestamp: { type: Date, default: Date.now },
          edited: { type: Boolean, default: false },
          editedAt: Date,
        },
      ],

      notifications: [
        {
          notificationId: String,
          type: String,
          sentTo: [String],
          sentAt: Date,
          acknowledged: [String],
        },
      ],
    },

    // Review and approval
    review: {
      required: { type: Boolean, default: false },
      reviewers: [String],

      reviews: [
        {
          reviewerId: String,
          reviewerName: String,
          reviewDate: Date,
          rating: { type: Number, min: 1, max: 5 },
          feedback: String,
          approved: Boolean,
          recommendations: [String],
        },
      ],

      finalApproval: {
        approved: Boolean,
        approvedBy: String,
        approvedAt: Date,
        conditions: [String],
        rejectionReason: String,
      },
    },

    // Integration with other systems
    integrations: {
      // Calendar integration
      calendarEvents: [
        {
          eventId: String,
          platform: String,
          eventUrl: String,
          createdAt: Date,
        },
      ],

      // Document management
      documents: [
        {
          documentId: String,
          documentType: String,
          filename: String,
          url: String,
          uploadedAt: Date,
          uploadedBy: String,
        },
      ],

      // Video call integration
      videoMeetings: [
        {
          meetingId: String,
          platform: String,
          meetingUrl: String,
          scheduledFor: Date,
          duration: Number,
        },
      ],
    },

    // Analytics and metrics
    metrics: {
      viewCount: { type: Number, default: 0 },
      lastViewedAt: Date,

      performance: {
        onTimeCompletion: Boolean,
        qualityScore: Number,
        efficiencyScore: Number,
        stakeholderSatisfaction: Number,
      },

      costs: {
        estimatedCost: Number,
        actualCost: Number,
        currency: { type: String, default: 'THB' },
        costBreakdown: [
          {
            category: String,
            amount: Number,
            description: String,
          },
        ],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
TaskAssignmentSchema.index({ taskId: 1 });
TaskAssignmentSchema.index({ 'blitzzIntegration.externalTaskId': 1 });
TaskAssignmentSchema.index({ 'assignment.assignedTo.userId': 1 });
TaskAssignmentSchema.index({ 'context.farmCode': 1 });
TaskAssignmentSchema.index({ 'context.auditId': 1 });
TaskAssignmentSchema.index({ 'status.current': 1 });
TaskAssignmentSchema.index({ 'scheduling.dueDate': 1 });
TaskAssignmentSchema.index({ 'taskInfo.category': 1 });
TaskAssignmentSchema.index({ 'taskInfo.priority': 1 });

// Virtual fields
TaskAssignmentSchema.virtual('isOverdue').get(function () {
  return (
    this.scheduling.dueDate &&
    this.scheduling.dueDate < new Date() &&
    !['completed', 'cancelled'].includes(this.status.current)
  );
});

TaskAssignmentSchema.virtual('daysUntilDue').get(function () {
  if (!this.scheduling.dueDate) return null;
  const today = new Date();
  const dueDate = new Date(this.scheduling.dueDate);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

TaskAssignmentSchema.virtual('totalTimeSpent').get(function () {
  return this.scheduling.timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
});

// Blitzz Integration Service
class BlitzzIntegrationService extends EventEmitter {
  constructor() {
    super();
    this.apiBaseUrl = process.env.BLITZZ_API_URL || 'https://api.blitzz.app';
    this.apiKey = process.env.BLITZZ_API_KEY;
    this.workspaceId = process.env.BLITZZ_WORKSPACE_ID;
    this.projectId = process.env.BLITZZ_PROJECT_ID;
    this.notificationService = new EnhancedNotificationService();

    this.syncQueue = [];
    this.isProcessing = false;

    this.startSyncProcessor();
  }

  /**
   * Create task in both internal system and Blitzz
   */
  async createTask(taskData) {
    try {
      // Create internal task
      const internalTask = new TaskAssignment(taskData);
      await internalTask.save();

      // Create in Blitzz if integration is enabled
      if (this.apiKey && taskData.syncWithBlitzz !== false) {
        await this.createBlitzzTask(internalTask);
      }

      // Send assignment notification
      await this.notificationService.sendTaskAssignmentNotification(
        taskData.assignment.assignedTo.userId,
        {
          taskId: internalTask.taskId,
          title: internalTask.taskInfo.title,
          userRole: taskData.assignment.assignedTo.userRole,
        }
      );

      this.emit('task_created', internalTask);

      return internalTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Create task in Blitzz system
   */
  async createBlitzzTask(internalTask) {
    try {
      const blitzzTaskData = this.convertToBlitzzFormat(internalTask);

      const response = await axios.post(
        `${this.apiBaseUrl}/workspaces/${this.workspaceId}/projects/${this.projectId}/tasks`,
        blitzzTaskData,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update internal task with Blitzz ID
      internalTask.blitzzIntegration.externalTaskId = response.data.id;
      internalTask.blitzzIntegration.blitzzProjectId = this.projectId;
      internalTask.blitzzIntegration.blitzzWorkspaceId = this.workspaceId;
      internalTask.blitzzIntegration.syncStatus = 'synced';
      internalTask.blitzzIntegration.lastSyncAt = new Date();

      await internalTask.save();

      console.log(`Task ${internalTask.taskId} synced to Blitzz with ID: ${response.data.id}`);

      return response.data;
    } catch (error) {
      console.error('Error creating Blitzz task:', error);

      // Update sync status to error
      internalTask.blitzzIntegration.syncStatus = 'error';
      internalTask.blitzzIntegration.syncErrors.push(error.message);
      await internalTask.save();

      throw error;
    }
  }

  /**
   * Convert internal task format to Blitzz format
   */
  convertToBlitzzFormat(internalTask) {
    return {
      title: internalTask.taskInfo.title,
      description: internalTask.taskInfo.description,
      priority: this.mapPriorityToBlitzz(internalTask.taskInfo.priority),
      status: this.mapStatusToBlitzz(internalTask.status.current),
      assignee_email: internalTask.assignment.assignedTo.userEmail,
      due_date: internalTask.scheduling.dueDate
        ? internalTask.scheduling.dueDate.toISOString()
        : null,
      estimated_hours: internalTask.taskInfo.estimatedHours,
      tags: [
        internalTask.taskInfo.category,
        'gacp-platform',
        ...(internalTask.context.farmCode ? [`farm-${internalTask.context.farmCode}`] : []),
        ...(internalTask.context.auditId ? [`audit-${internalTask.context.auditId}`] : []),
      ],
      custom_fields: {
        gacp_task_id: internalTask.taskId,
        farm_code: internalTask.context.farmCode,
        audit_id: internalTask.context.auditId,
        sop_code: internalTask.context.sopCode,
        category: internalTask.taskInfo.category,
        cannabis_license_required: internalTask.requirements.cannabisLicense.required,
      },
    };
  }

  /**
   * Map internal priority to Blitzz priority
   */
  mapPriorityToBlitzz(priority) {
    const mapping = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'High',
      critical: 'High',
    };
    return mapping[priority] || 'Medium';
  }

  /**
   * Map internal status to Blitzz status
   */
  mapStatusToBlitzz(status) {
    const mapping = {
      draft: 'To Do',
      assigned: 'To Do',
      accepted: 'In Progress',
      in_progress: 'In Progress',
      on_hold: 'On Hold',
      review: 'Review',
      revision: 'In Progress',
      completed: 'Done',
      cancelled: 'Cancelled',
      rejected: 'Cancelled',
    };
    return mapping[status] || 'To Do';
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId, newStatus, userId, reason, notes) {
    try {
      const task = await TaskAssignment.findOne({ taskId });
      if (!task) {
        throw new Error('Task not found');
      }

      // Update status history
      task.status.statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy: userId,
        reason,
        notes,
      });

      task.status.current = newStatus;

      // Set completion time if completed
      if (newStatus === 'completed') {
        task.scheduling.completedAt = new Date();
        task.progress.completionPercentage = 100;
      }

      await task.save();

      // Sync with Blitzz
      if (task.blitzzIntegration.externalTaskId) {
        await this.syncTaskStatusToBlitzz(task);
      }

      // Send notifications for status changes
      await this.notifyStatusChange(task, newStatus);

      this.emit('task_status_updated', { task, newStatus });

      return task;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Sync task status to Blitzz
   */
  async syncTaskStatusToBlitzz(task) {
    try {
      const blitzzStatus = this.mapStatusToBlitzz(task.status.current);

      await axios.patch(
        `${this.apiBaseUrl}/workspaces/${this.workspaceId}/projects/${this.projectId}/tasks/${task.blitzzIntegration.externalTaskId}`,
        {
          status: blitzzStatus,
          completion_percentage: task.progress.completionPercentage,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      task.blitzzIntegration.lastSyncAt = new Date();
      task.blitzzIntegration.syncStatus = 'synced';
      await task.save();
    } catch (error) {
      console.error('Error syncing status to Blitzz:', error);
      task.blitzzIntegration.syncStatus = 'error';
      task.blitzzIntegration.syncErrors.push(`Status sync failed: ${error.message}`);
      await task.save();
    }
  }

  /**
   * Notify status change
   */
  async notifyStatusChange(task, newStatus) {
    const notifications = [];

    // Notify assignee
    notifications.push({
      userId: task.assignment.assignedTo.userId,
      message: `Task "${task.taskInfo.title}" status changed to ${newStatus}`,
    });

    // Notify team members
    for (const member of task.assignment.team) {
      notifications.push({
        userId: member.userId,
        message: `Team task "${task.taskInfo.title}" status changed to ${newStatus}`,
      });
    }

    // Send notifications
    for (const notification of notifications) {
      await this.notificationService.createNotification({
        recipient: {
          userId: notification.userId,
          userRole: 'user', // Would be determined from user data
        },
        content: {
          title: 'Task Status Update',
          titleTH: 'อัปเดตสถานะงาน',
          message: notification.message,
        },
        classification: {
          category: 'task_assignment',
          eventType: 'task_status_changed',
          priority: 'medium',
        },
        context: {
          taskId: task.taskId,
          deepLinks: [
            {
              label: 'View Task',
              labelTH: 'ดูงาน',
              url: `/tasks/${task.taskId}`,
            },
          ],
        },
      });
    }
  }

  /**
   * Create audit preparation tasks
   */
  async createAuditPreparationTasks(auditData) {
    const tasks = [];

    // Document preparation task
    const docTask = await this.createTask({
      taskInfo: {
        title: `Prepare Documents for Audit - ${auditData.farmName}`,
        titleTH: `เตรียมเอกสารสำหรับการตรวจสอบ - ${auditData.farmName}`,
        description: 'Prepare all required documents for the upcoming audit',
        category: 'audit_preparation',
        priority: 'high',
        estimatedHours: 4,
      },
      assignment: {
        assignedTo: {
          userId: auditData.farmerId,
          userName: auditData.farmerName,
          userRole: 'farmer',
          userEmail: auditData.farmerEmail,
        },
        assignedBy: {
          userId: auditData.scheduledBy,
          userName: auditData.scheduledByName,
          userRole: 'admin',
        },
      },
      scheduling: {
        dueDate: new Date(auditData.auditDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before audit
      },
      context: {
        farmCode: auditData.farmCode,
        auditId: auditData.auditId,
        sourceSystem: 'gacp-platform',
        sourceEvent: 'audit_scheduled',
        automatedTask: true,
      },
    });

    tasks.push(docTask);

    // Farm preparation task
    const farmTask = await this.createTask({
      taskInfo: {
        title: `Prepare Farm for Audit - ${auditData.farmName}`,
        titleTH: `เตรียมฟาร์มสำหรับการตรวจสอบ - ${auditData.farmName}`,
        description: 'Ensure farm is ready for physical inspection',
        category: 'audit_preparation',
        priority: 'high',
        estimatedHours: 6,
      },
      assignment: {
        assignedTo: {
          userId: auditData.farmerId,
          userName: auditData.farmerName,
          userRole: 'farmer',
          userEmail: auditData.farmerEmail,
        },
      },
      scheduling: {
        dueDate: new Date(auditData.auditDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day before audit
      },
      context: {
        farmCode: auditData.farmCode,
        auditId: auditData.auditId,
        automatedTask: true,
      },
    });

    tasks.push(farmTask);

    // Cannabis-specific preparation if applicable
    if (auditData.cropTypes.includes('cannabis')) {
      const cannabisTask = await this.createTask({
        taskInfo: {
          title: `Cannabis Compliance Check - ${auditData.farmName}`,
          titleTH: `ตรวจสอบการปฏิบัติตามกฎหมายกัญชา - ${auditData.farmName}`,
          description: 'Verify cannabis cultivation compliance and documentation',
          category: 'cannabis_compliance',
          priority: 'critical',
          estimatedHours: 3,
        },
        assignment: {
          assignedTo: {
            userId: auditData.farmerId,
            userName: auditData.farmerName,
            userRole: 'farmer',
            userEmail: auditData.farmerEmail,
          },
        },
        scheduling: {
          dueDate: new Date(auditData.auditDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before audit
        },
        context: {
          farmCode: auditData.farmCode,
          auditId: auditData.auditId,
          automatedTask: true,
        },
        requirements: {
          cannabisLicense: {
            required: true,
            licenseType: 'cultivation',
          },
        },
      });

      tasks.push(cannabisTask);
    }

    return tasks;
  }

  /**
   * Start sync processor for periodic syncing with Blitzz
   */
  startSyncProcessor() {
    setInterval(async () => {
      if (!this.isProcessing && this.syncQueue.length > 0) {
        this.isProcessing = true;
        await this.processSyncQueue();
        this.isProcessing = false;
      }
    }, 30000); // Process every 30 seconds
  }

  /**
   * Process sync queue
   */
  async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const syncItem = this.syncQueue.shift();
      try {
        await this.syncWithBlitzz(syncItem);
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  }

  /**
   * Get tasks for user
   */
  async getTasksForUser(userId, options = {}) {
    const { status, category, priority, includeTeam = false, page = 1, limit = 20 } = options;

    const query = {
      $or: [{ 'assignment.assignedTo.userId': userId }],
    };

    if (includeTeam) {
      query.$or.push({ 'assignment.team.userId': userId });
    }

    if (status) query['status.current'] = status;
    if (category) query['taskInfo.category'] = category;
    if (priority) query['taskInfo.priority'] = priority;

    const tasks = await TaskAssignment.find(query)
      .sort({ 'scheduling.dueDate': 1, 'taskInfo.priority': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TaskAssignment.countDocuments(query);

    return {
      tasks,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get dashboard data for admin
   */
  async getAdminDashboardData() {
    const [
      totalTasks,
      pendingTasks,
      overdueTasks,
      completedToday,
      tasksByCategory,
      tasksByPriority,
    ] = await Promise.all([
      TaskAssignment.countDocuments(),
      TaskAssignment.countDocuments({ 'status.current': { $in: ['assigned', 'in_progress'] } }),
      TaskAssignment.countDocuments({
        'scheduling.dueDate': { $lt: new Date() },
        'status.current': { $nin: ['completed', 'cancelled'] },
      }),
      TaskAssignment.countDocuments({
        'status.current': 'completed',
        'scheduling.completedAt': {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      TaskAssignment.aggregate([{ $group: { _id: '$taskInfo.category', count: { $sum: 1 } } }]),
      TaskAssignment.aggregate([{ $group: { _id: '$taskInfo.priority', count: { $sum: 1 } } }]),
    ]);

    return {
      summary: {
        totalTasks,
        pendingTasks,
        overdueTasks,
        completedToday,
      },
      distribution: {
        byCategory: tasksByCategory,
        byPriority: tasksByPriority,
      },
    };
  }
}

const TaskAssignment = mongoose.model('TaskAssignment', TaskAssignmentSchema);

module.exports = {
  TaskAssignment,
  BlitzzIntegrationService,
};
