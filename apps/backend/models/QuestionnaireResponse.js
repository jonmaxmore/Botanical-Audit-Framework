const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionText: String,
  value: mongoose.Schema.Types.Mixed, // Can be String, Number, Boolean, Array, etc.
  notes: String,
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      mimeType: String
    }
  ],
  score: Number
});

const SectionResponseSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true
  },
  title: String,
  answers: [AnswerSchema],
  completionStatus: {
    type: String,
    enum: ['notStarted', 'inProgress', 'completed'],
    default: 'notStarted'
  },
  score: Number
});

const QuestionnaireResponseSchema = new mongoose.Schema(
  {
    questionnaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire',
      required: true
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'inReview', 'approved', 'rejected', 'needsRevision'],
      default: 'draft'
    },
    responses: [SectionResponseSchema],
    overallScore: Number,
    passingScore: Number,
    result: {
      type: String,
      enum: ['pass', 'fail', 'na'],
      default: 'na'
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewComments: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    region: {
      type: String,
      enum: ['north', 'northeast', 'central', 'south']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create geo-spatial index for location
QuestionnaireResponseSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('QuestionnaireResponse', QuestionnaireResponseSchema);
