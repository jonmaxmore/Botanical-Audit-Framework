const mongoose = require('mongoose');

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
  },
);

// Indexes
TaskAssignmentSchema.index({ taskId: 1 });
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
  if (!this.scheduling.dueDate) {
    return null;
  }
  const today = new Date();
  const dueDate = new Date(this.scheduling.dueDate);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

TaskAssignmentSchema.virtual('totalTimeSpent').get(function () {
  return this.scheduling.timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
});

module.exports = mongoose.model('TaskAssignment', TaskAssignmentSchema);
