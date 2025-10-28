const mongoose = require('mongoose');

const ComparisonResultItemSchema = new mongoose.Schema({
  requirementId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  complianceStatus: {
    type: String,
    enum: ['compliant', 'partially-compliant', 'non-compliant', 'not-applicable', 'unknown'],
    required: true
  },
  evidence: [String],
  evidenceNeeded: [String],
  notes: String
});

const ComparisonResultSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    standard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Standard',
      required: true
    },
    comparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comparedAt: {
      type: Date,
      default: Date.now
    },
    results: [ComparisonResultItemSchema],
    overallCompliance: {
      percentage: {
        type: Number,
        required: true
      },
      achieved: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      }
    },
    status: {
      type: String,
      enum: ['pass', 'fail', 'na'],
      default: 'na'
    },
    recommendations: String,
    attachments: [
      {
        name: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ComparisonResult', ComparisonResultSchema);
