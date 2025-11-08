const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['environmental', 'social', 'technical', 'documentation', 'quality', 'legal', 'other'],
    default: 'other',
  },
  criteriaType: {
    type: String,
    enum: ['boolean', 'scale', 'document', 'measurement'],
    default: 'boolean',
  },
  importance: {
    type: String,
    enum: ['critical', 'major', 'minor'],
    default: 'major',
  },
  complexity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  evidenceRequired: [String],
  verificationMethod: {
    type: String,
    enum: ['visual', 'document', 'interview', 'test', 'multiple'],
    default: 'multiple',
  },
  references: [String],
});

const StandardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    version: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['organic', 'gapHybrid', 'sustainability', 'food-safety', 'social', 'other'],
      default: 'other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableRegions: [
      {
        type: String,
        enum: ['north', 'northeast', 'central', 'south', 'all'],
        default: 'all',
      },
    ],
    requirements: [RequirementSchema],
    certificationProcess: {
      steps: [String],
      duration: String,
      renewalPeriod: String,
    },
    validityPeriod: {
      value: Number,
      unit: {
        type: String,
        enum: ['months', 'years'],
        default: 'years',
      },
    },
    issuingBody: {
      name: String,
      website: String,
      contactDetails: String,
    },
    referenceMaterials: [
      {
        title: String,
        url: String,
        type: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Standard', StandardSchema);
