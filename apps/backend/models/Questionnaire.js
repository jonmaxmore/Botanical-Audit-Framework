const mongoose = require('mongoose');

const ChoiceSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
});

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['text', 'number', 'singleChoice', 'multiChoice', 'rating', 'boolean', 'date'],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  choices: [ChoiceSchema],
  validation: {
    min: Number,
    max: Number,
    regex: String,
  },
  regionSpecific: {
    type: Boolean,
    default: false,
  },
  regions: [
    {
      type: String,
      enum: ['north', 'northeast', 'central', 'south'],
    },
  ],
  category: {
    type: String,
    enum: ['general', 'environmental', 'social', 'economic', 'technical', 'compliance'],
    default: 'general',
  },
  tags: [String],
  conditionalDisplay: {
    dependsOn: String, // question ID
    showWhen: mongoose.Schema.Types.Mixed, // value or array of values
  },
});

const SectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  order: {
    type: Number,
    required: true,
  },
  questions: [QuestionSchema],
  regionSpecific: {
    type: Boolean,
    default: false,
  },
  regions: [
    {
      type: String,
      enum: ['north', 'northeast', 'central', 'south'],
    },
  ],
});

const QuestionnaireSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['audit', 'survey', 'assessment', 'certification'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    version: {
      type: String,
      required: true,
    },
    applicableRegions: [
      {
        type: String,
        enum: ['north', 'northeast', 'central', 'south', 'all'],
        default: 'all',
      },
    ],
    targetFarmTypes: [
      {
        type: String,
        enum: ['conventional', 'organic', 'gapHybrid', 'hydroponic', 'mixed', 'all'],
        default: 'all',
      },
    ],
    sections: [SectionSchema],
    scoringSystem: {
      enabled: {
        type: Boolean,
        default: false,
      },
      passingScore: Number,
      maxScore: Number,
    },
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

module.exports = mongoose.model('Questionnaire', QuestionnaireSchema);
