/**
 * Inspection Model
 * Field inspection system for GACP certification audits
 *
 * Features:
 * - Inspection scheduling and assignment
 * - Field inspection forms with checklist
 * - Photo upload with GPS coordinates
 * - Scoring and evaluation
 * - Inspector notes and observations
 */

const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    caption: String,
    category: {
      type: String,
      enum: ['farm_overview', 'crops', 'equipment', 'storage', 'documentation', 'issue', 'other'],
      default: 'other'
    },
    gpsCoordinates: {
      latitude: Number,
      longitude: Number,
      accuracy: Number // in meters
    },
    takenAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      fileSize: Number,
      mimeType: String,
      dimensions: {
        width: Number,
        height: Number
      }
    }
  },
  { _id: true }
);

const checklistItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        'LAND_SELECTION',
        'SOIL_MANAGEMENT',
        'WATER_MANAGEMENT',
        'PEST_MANAGEMENT',
        'HARVESTING',
        'POST_HARVEST',
        'STORAGE',
        'DOCUMENTATION',
        'HYGIENE',
        'SAFETY'
      ]
    },
    item: {
      type: String,
      required: true
    },
    requirement: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pass', 'fail', 'n/a', 'pending'],
      default: 'pending'
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    weight: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    notes: String,
    evidence: [String] // Photo URLs
  },
  { _id: true }
);

const observationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['strength', 'weakness', 'risk', 'recommendation', 'general'],
      required: true
    },
    category: String,
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    photos: [String],
    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const inspectionSchema = new mongoose.Schema(
  {
    // Reference to Application
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },

    // Inspection Metadata
    inspectionNumber: {
      type: String,
      unique: true,
      index: true
    },

    inspectionType: {
      type: String,
      enum: ['initial', 'surveillance', 'renewal', 'special'],
      required: true,
      default: 'initial'
    },

    // Scheduling
    scheduledDate: {
      type: Date,
      required: true,
      index: true
    },

    actualStartTime: Date,
    actualEndTime: Date,

    duration: Number, // in minutes

    // Assignment
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    assistantInspectors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    // Status
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
      index: true
    },

    // Site Information
    siteInfo: {
      farmName: String,
      contactPerson: String,
      contactPhone: String,
      address: String,
      gpsCoordinates: {
        latitude: {
          type: Number,
          required: true
        },
        longitude: {
          type: Number,
          required: true
        },
        altitude: Number
      },
      accessInstructions: String
    },

    // Weather Conditions
    weatherConditions: {
      temperature: Number, // Celsius
      humidity: Number, // Percentage
      weather: {
        type: String,
        enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy']
      },
      notes: String
    },

    // Inspection Checklist
    checklist: [checklistItemSchema],

    // Photos
    photos: [photoSchema],

    // Observations
    observations: [observationSchema],

    // Scoring
    scoring: {
      categoryScores: [
        {
          category: String,
          score: Number,
          maxScore: Number,
          percentage: Number
        }
      ],
      totalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'F', 'N/A'],
        default: 'N/A'
      },
      passingScore: {
        type: Number,
        default: 70
      },
      passed: {
        type: Boolean,
        default: false
      }
    },

    // Inspector Notes
    inspectorNotes: {
      summary: String,
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      followUpRequired: {
        type: Boolean,
        default: false
      },
      followUpDate: Date,
      followUpNotes: String
    },

    // Farmer Feedback
    farmerFeedback: {
      present: {
        type: Boolean,
        default: false
      },
      signature: String, // Base64 or URL
      signedAt: Date,
      comments: String,
      agreedToFindings: Boolean
    },

    // Report
    reportGenerated: {
      type: Boolean,
      default: false
    },

    reportUrl: String,

    reportGeneratedAt: Date,

    // Audit Trail
    cancelledAt: Date,
    cancellationReason: String,
    rescheduledFrom: Date,
    rescheduledReason: String,

    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
inspectionSchema.index({ inspector: 1, scheduledDate: 1 });
inspectionSchema.index({ status: 1, scheduledDate: 1 });
inspectionSchema.index({
  'siteInfo.gpsCoordinates.latitude': 1,
  'siteInfo.gpsCoordinates.longitude': 1
});

// Virtual: Inspection Duration String
inspectionSchema.virtual('durationFormatted').get(function () {
  if (!this.duration) return null;
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual: Days Until Inspection
inspectionSchema.virtual('daysUntilInspection').get(function () {
  if (!this.scheduledDate) return null;
  const now = new Date();
  const scheduled = new Date(this.scheduledDate);
  const diffTime = scheduled - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual: Is Overdue
inspectionSchema.virtual('isOverdue').get(function () {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  return this.scheduledDate < new Date();
});

// Virtual: Photo Count
inspectionSchema.virtual('photoCount').get(function () {
  return this.photos ? this.photos.length : 0;
});

// Virtual: Checklist Completion
inspectionSchema.virtual('checklistCompletion').get(function () {
  if (!this.checklist || this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.status !== 'pending').length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Pre-save: Generate Inspection Number
inspectionSchema.pre('save', async function (next) {
  if (!this.inspectionNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.inspectionNumber = `INS-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  // Calculate duration if both start and end times exist
  if (this.actualStartTime && this.actualEndTime) {
    const diffMs = this.actualEndTime - this.actualStartTime;
    this.duration = Math.round(diffMs / 60000); // Convert to minutes
  }

  next();
});

// Instance Methods

/**
 * Start the inspection
 */
inspectionSchema.methods.startInspection = function () {
  if (this.status !== 'scheduled') {
    throw new Error('Can only start scheduled inspections');
  }
  this.status = 'in_progress';
  this.actualStartTime = new Date();
  return this.save();
};

/**
 * Complete the inspection
 */
inspectionSchema.methods.completeInspection = function () {
  if (this.status !== 'in_progress') {
    throw new Error('Can only complete in-progress inspections');
  }
  this.status = 'completed';
  this.actualEndTime = new Date();
  this.submittedAt = new Date();
  return this.save();
};

/**
 * Cancel the inspection
 */
inspectionSchema.methods.cancelInspection = function (reason) {
  if (this.status === 'completed') {
    throw new Error('Cannot cancel completed inspections');
  }
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

/**
 * Reschedule the inspection
 */
inspectionSchema.methods.rescheduleInspection = function (newDate, reason) {
  if (this.status === 'completed') {
    throw new Error('Cannot reschedule completed inspections');
  }
  this.rescheduledFrom = this.scheduledDate;
  this.scheduledDate = newDate;
  this.rescheduledReason = reason;
  this.status = 'scheduled';
  return this.save();
};

/**
 * Calculate total score from checklist
 */
inspectionSchema.methods.calculateScore = function () {
  if (!this.checklist || this.checklist.length === 0) {
    this.scoring.totalScore = 0;
    this.scoring.passed = false;
    return this;
  }

  // Calculate category scores
  const categoryMap = new Map();

  this.checklist.forEach(item => {
    if (item.status === 'n/a') return; // Skip N/A items

    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, {
        totalScore: 0,
        maxScore: 0,
        count: 0
      });
    }

    const cat = categoryMap.get(item.category);
    cat.totalScore += item.score * item.weight;
    cat.maxScore += 10 * item.weight;
    cat.count++;
  });

  // Update category scores
  this.scoring.categoryScores = [];
  let totalWeightedScore = 0;
  let totalMaxScore = 0;

  categoryMap.forEach((data, category) => {
    const percentage = data.maxScore > 0 ? (data.totalScore / data.maxScore) * 100 : 0;
    this.scoring.categoryScores.push({
      category,
      score: Math.round(data.totalScore * 10) / 10,
      maxScore: data.maxScore,
      percentage: Math.round(percentage * 10) / 10
    });
    totalWeightedScore += data.totalScore;
    totalMaxScore += data.maxScore;
  });

  // Calculate total score
  this.scoring.totalScore =
    totalMaxScore > 0 ? Math.round((totalWeightedScore / totalMaxScore) * 100 * 10) / 10 : 0;

  // Determine grade
  const score = this.scoring.totalScore;
  if (score >= 90) this.scoring.grade = 'A';
  else if (score >= 80) this.scoring.grade = 'B';
  else if (score >= 70) this.scoring.grade = 'C';
  else if (score >= 60) this.scoring.grade = 'D';
  else this.scoring.grade = 'F';

  // Check if passed
  this.scoring.passed = this.scoring.totalScore >= this.scoring.passingScore;

  return this;
};

/**
 * Add photo to inspection
 */
inspectionSchema.methods.addPhoto = function (photoData) {
  this.photos.push(photoData);
  return this.save();
};

/**
 * Add observation
 */
inspectionSchema.methods.addObservation = function (observationData) {
  this.observations.push(observationData);
  return this.save();
};

/**
 * Update checklist item
 */
inspectionSchema.methods.updateChecklistItem = function (itemId, updates) {
  const item = this.checklist.id(itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }
  Object.assign(item, updates);
  return this.save();
};

// Static Methods

/**
 * Find inspections by inspector
 */
inspectionSchema.statics.findByInspector = function (inspectorId, options = {}) {
  const query = { inspector: inspectorId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.fromDate) {
    query.scheduledDate = { $gte: options.fromDate };
  }

  return this.find(query)
    .populate('application')
    .populate('inspector', 'fullName email')
    .sort({ scheduledDate: -1 });
};

/**
 * Find upcoming inspections
 */
inspectionSchema.statics.findUpcoming = function (days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return this.find({
    status: 'scheduled',
    scheduledDate: {
      $gte: now,
      $lte: futureDate
    }
  })
    .populate('application')
    .populate('inspector', 'fullName email')
    .sort({ scheduledDate: 1 });
};

/**
 * Find overdue inspections
 */
inspectionSchema.statics.findOverdue = function () {
  return this.find({
    status: { $in: ['scheduled', 'in_progress'] },
    scheduledDate: { $lt: new Date() }
  })
    .populate('application')
    .populate('inspector', 'fullName email')
    .sort({ scheduledDate: 1 });
};

/**
 * Get inspection statistics
 */
inspectionSchema.statics.getStatistics = async function (filters = {}) {
  const query = {};

  if (filters.inspector) {
    query.inspector = filters.inspector;
  }

  if (filters.fromDate || filters.toDate) {
    query.scheduledDate = {};
    if (filters.fromDate) query.scheduledDate.$gte = filters.fromDate;
    if (filters.toDate) query.scheduledDate.$lte = filters.toDate;
  }

  const [total, byStatus, avgScore] = await Promise.all([
    this.countDocuments(query),
    this.aggregate([{ $match: query }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    this.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$scoring.totalScore' } } }
    ])
  ]);

  const statusCounts = {};
  byStatus.forEach(item => {
    statusCounts[item._id] = item.count;
  });

  return {
    total,
    byStatus: statusCounts,
    averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avgScore * 10) / 10 : 0,
    scheduled: statusCounts.scheduled || 0,
    inProgress: statusCounts.in_progress || 0,
    completed: statusCounts.completed || 0,
    cancelled: statusCounts.cancelled || 0
  };
};

const Inspection = mongoose.model('Inspection', inspectionSchema);

module.exports = Inspection;
