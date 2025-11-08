/**
 * Payment Model
 * MongoDB schema for payment collection
 *
 * @module models/payment
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    // Payment identification
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Application reference
    applicationId: {
      type: String,
      required: true,
      index: true,
    },

    // Farmer reference
    farmerId: {
      type: String,
      required: true,
      index: true,
    },

    // Payment type
    type: {
      type: String,
      required: true,
      enum: ['initial', 'resubmission'],
      index: true,
    },

    // Payment amount (THB)
    amount: {
      type: Number,
      required: true,
      default: 5000,
    },

    // Payment status
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Payment method
    method: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'qr_code', 'promptpay'],
      default: null,
    },

    // Transaction details
    transactionId: {
      type: String,
      default: null,
      index: true,
    },

    transactionDate: {
      type: Date,
      default: null,
    },

    // Receipt information
    receiptNumber: {
      type: String,
      default: null,
    },

    receiptUrl: {
      type: String,
      default: null,
    },

    // Submission count (for resubmission payments)
    submissionCount: {
      type: Number,
      default: null,
    },

    // Payment gateway response
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Notes and comments
    notes: {
      type: String,
      default: null,
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'payments',
  },
);

// Indexes for better query performance
PaymentSchema.index({ applicationId: 1, type: 1 });
PaymentSchema.index({ farmerId: 1, status: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });

// Virtual for payment age (in days)
PaymentSchema.virtual('ageInDays').get(function () {
  if (this.status !== 'pending') return null;
  const now = new Date();
  const created = this.createdAt;
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue (7 days)
PaymentSchema.virtual('isOverdue').get(function () {
  if (this.status !== 'pending') return false;
  return this.ageInDays > 7;
});

// Instance method: Mark as completed
PaymentSchema.methods.markCompleted = function (transactionData) {
  this.status = 'completed';
  this.transactionId = transactionData.transactionId;
  this.transactionDate = transactionData.transactionDate || new Date();
  this.method = transactionData.method;
  this.receiptNumber = transactionData.receiptNumber;
  this.receiptUrl = transactionData.receiptUrl;
  this.paidAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Mark as failed
PaymentSchema.methods.markFailed = function (reason) {
  this.status = 'failed';
  this.notes = reason || 'Payment failed';
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Cancel payment
PaymentSchema.methods.cancel = function (reason) {
  this.status = 'cancelled';
  this.notes = reason || 'Payment cancelled';
  this.cancelledAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Static method: Find pending payments older than X days
PaymentSchema.statics.findOverdue = function (days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    status: 'pending',
    createdAt: { $lte: cutoffDate },
  }).sort({ createdAt: 1 });
};

// Static method: Get statistics
PaymentSchema.statics.getStatistics = function (filters = {}) {
  const matchStage = {};

  if (filters.startDate || filters.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate) {
      matchStage.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.createdAt.$lte = new Date(filters.endDate);
    }
  }

  if (filters.status) {
    matchStage.status = filters.status;
  }

  if (filters.type) {
    matchStage.type = filters.type;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        byStatus: {
          $push: {
            status: '$status',
            amount: '$amount',
          },
        },
        byType: {
          $push: {
            type: '$type',
            amount: '$amount',
          },
        },
      },
    },
  ]);
};

// Pre-save middleware
PaymentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtual fields are included in JSON
PaymentSchema.set('toJSON', { virtuals: true });
PaymentSchema.set('toObject', { virtuals: true });

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
