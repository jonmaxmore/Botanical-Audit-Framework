const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  findings: {
    type: String,
    required: true,
  },
  recommendations: {
    type: String,
    required: true,
  },
  compliance: {
    type: String,
    enum: ['compliant', 'non-compliant', 'partially-compliant'],
    default: 'compliant',
  },
  images: [
    {
      url: String,
      caption: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs-revision'],
    default: 'pending',
  },
  reviewComments: String,
});

module.exports = mongoose.model('Report', ReportSchema);
