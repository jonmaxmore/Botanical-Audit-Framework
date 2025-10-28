/**
 * Application Model (Updated)
 * MongoDB schema for application collection with new fields
 *
 * @module models/application
 * @version 2.0.0
 */

const mongoose = require('mongoose');

// Embedded schemas for arrays
const PaymentEmbedSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true },
    type: { type: String, enum: ['initial', 'resubmission'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], required: true },
    createdAt: { type: Date, required: true }
  },
  { _id: false }
);

const AssignmentEmbedSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true },
    assignedTo: { type: String, required: true },
    role: { type: String, enum: ['reviewer', 'inspector', 'approver'], required: true },
    status: { type: String, required: true },
    assignedAt: { type: Date, required: true }
  },
  { _id: false }
);

const KPIEmbedSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true },
    role: { type: String, enum: ['reviewer', 'inspector', 'approver'], required: true },
    userId: { type: String, required: true },
    status: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    processingTime: { type: Number, default: null }
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    // Application identification
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // Farmer reference
    farmerId: {
      type: String,
      required: true,
      index: true
    },

    farmerName: {
      type: String,
      required: true
    },

    // Farm information
    farmName: {
      type: String,
      required: true
    },

    farmAddress: {
      province: { type: String, required: true },
      district: { type: String, required: true },
      subDistrict: { type: String, required: true },
      postalCode: { type: String, required: true },
      details: { type: String, default: null }
    },

    farmSize: {
      type: Number,
      required: true
    },

    // Cannabis details
    cannabisType: {
      type: String,
      required: true,
      enum: ['medical', 'hemp', 'both']
    },

    strains: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        purpose: { type: String, required: true }
      }
    ],

    // Application status
    status: {
      type: String,
      required: true,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'pending_payment',
        'payment_completed',
        'documents_verified',
        'inspection_scheduled',
        'inspection_completed',
        'pending_approval',
        'approved',
        'rejected',
        'certificate_issued'
      ],
      default: 'draft',
      index: true
    },

    // Submission tracking
    submissionCount: {
      type: Number,
      required: true,
      default: 0,
      index: true
    },

    // Documents
    documents: [
      {
        type: { type: String, required: true },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, required: true }
      }
    ],

    // Review information
    reviewedBy: {
      type: String,
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    },

    reviewComments: {
      type: String,
      default: null
    },

    reviewDecision: {
      type: String,
      enum: ['approved', 'rejected', 'needs_revision', null],
      default: null
    },

    // Inspection information
    inspectorId: {
      type: String,
      default: null
    },

    inspectionDate: {
      type: Date,
      default: null
    },

    inspectionStatus: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled', null],
      default: null
    },

    lotId: {
      type: String,
      default: null,
      index: true
    },

    inspectionReport: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    // Approval information
    approverId: {
      type: String,
      default: null
    },

    approvedAt: {
      type: Date,
      default: null
    },

    approvalComments: {
      type: String,
      default: null
    },

    // Certificate information
    certificateId: {
      type: String,
      default: null,
      index: true
    },

    certificateIssuedAt: {
      type: Date,
      default: null
    },

    certificateExpiresAt: {
      type: Date,
      default: null
    },

    certificateUrl: {
      type: String,
      default: null
    },

    // NEW: Embedded arrays for tracking
    payments: {
      type: [PaymentEmbedSchema],
      default: []
    },

    assignments: {
      type: [AssignmentEmbedSchema],
      default: []
    },

    kpis: {
      type: [KPIEmbedSchema],
      default: []
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    updatedAt: {
      type: Date,
      default: Date.now
    },

    submittedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'applications'
  }
);

// Indexes for better query performance
ApplicationSchema.index({ farmerId: 1, status: 1 });
ApplicationSchema.index({ status: 1, submittedAt: -1 });
ApplicationSchema.index({ submissionCount: 1 });
ApplicationSchema.index({ 'payments.status': 1 });
ApplicationSchema.index({ 'assignments.assignedTo': 1 });

// Virtual for has initial payment
ApplicationSchema.virtual('hasInitialPayment').get(function () {
  return this.payments.some(p => p.type === 'initial' && p.status === 'completed');
});

// Virtual for has resubmission payment
ApplicationSchema.virtual('hasResubmissionPayment').get(function () {
  return this.payments.some(p => p.type === 'resubmission' && p.status === 'completed');
});

// Virtual for payment required
ApplicationSchema.virtual('isPaymentRequired').get(function () {
  return this.payments.some(p => p.status === 'pending');
});

// Virtual for current assignment
ApplicationSchema.virtual('currentAssignment').get(function () {
  return this.assignments.find(a => ['assigned', 'accepted', 'in_progress'].includes(a.status));
});

// Virtual for is active (has active assignment)
ApplicationSchema.virtual('isActive').get(function () {
  return this.assignments.some(a => ['assigned', 'accepted', 'in_progress'].includes(a.status));
});

// Instance method: Submit application
ApplicationSchema.methods.submit = function () {
  if (this.status === 'draft') {
    this.status = 'submitted';
    this.submittedAt = new Date();
    this.submissionCount += 1;
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Cannot submit application with status: ${this.status}`));
};

// Instance method: Add payment
ApplicationSchema.methods.addPayment = function (paymentData) {
  this.payments.push({
    paymentId: paymentData.id || paymentData.paymentId,
    type: paymentData.type,
    amount: paymentData.amount,
    status: paymentData.status,
    createdAt: paymentData.createdAt || new Date()
  });
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Update payment status
ApplicationSchema.methods.updatePaymentStatus = function (paymentId, status) {
  const payment = this.payments.find(p => p.paymentId === paymentId);
  if (payment) {
    payment.status = status;
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Payment not found: ${paymentId}`));
};

// Instance method: Add assignment
ApplicationSchema.methods.addAssignment = function (assignmentData) {
  this.assignments.push({
    assignmentId: assignmentData.id || assignmentData.assignmentId,
    assignedTo: assignmentData.assignedTo,
    role: assignmentData.role,
    status: assignmentData.status,
    assignedAt: assignmentData.assignedAt || new Date()
  });
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Update assignment status
ApplicationSchema.methods.updateAssignmentStatus = function (assignmentId, status) {
  const assignment = this.assignments.find(a => a.assignmentId === assignmentId);
  if (assignment) {
    assignment.status = status;
    this.updatedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error(`Assignment not found: ${assignmentId}`));
};

// Instance method: Add KPI
ApplicationSchema.methods.addKPI = function (kpiData) {
  this.kpis.push({
    taskId: kpiData.taskId,
    role: kpiData.role,
    userId: kpiData.userId,
    status: kpiData.status,
    startTime: kpiData.startTime,
    endTime: kpiData.endTime || null,
    processingTime: kpiData.processingTime || null
  });
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Update status
ApplicationSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Increment submission count
ApplicationSchema.methods.incrementSubmissionCount = function () {
  this.submissionCount += 1;
  this.updatedAt = new Date();
  return this.save();
};

// Static method: Find with pending payments
ApplicationSchema.statics.findWithPendingPayments = function () {
  return this.find({
    'payments.status': 'pending'
  }).sort({ submittedAt: -1 });
};

// Static method: Find by submission count
ApplicationSchema.statics.findBySubmissionCount = function (count) {
  return this.find({
    submissionCount: { $gte: count }
  }).sort({ submittedAt: -1 });
};

// Static method: Get statistics
ApplicationSchema.statics.getStatistics = function (filters = {}) {
  const matchStage = {};

  if (filters.status) {
    matchStage.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    matchStage.submittedAt = {};
    if (filters.startDate) {
      matchStage.submittedAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.submittedAt.$lte = new Date(filters.endDate);
    }
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status'
          }
        }
      }
    }
  ]);
};

// Pre-save middleware
ApplicationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtual fields are included in JSON
ApplicationSchema.set('toJSON', { virtuals: true });
ApplicationSchema.set('toObject', { virtuals: true });

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;
