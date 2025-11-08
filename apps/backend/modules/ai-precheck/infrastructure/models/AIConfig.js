/**
 * AI Configuration Model
 *
 * Database model for AI module configurations
 * - Pre-Check configuration
 * - Smart Router configuration
 * - Performance tracking
 */

const mongoose = require('mongoose');

const aiConfigSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      enum: ['PRE_CHECK', 'SMART_ROUTER', 'DOCUMENT_OCR'],
      required: true,
      unique: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    config: {
      // Threshold settings
      thresholds: {
        autoReject: {
          type: Number,
          min: 0,
          max: 100,
          default: 50,
        },
        fastTrack: {
          type: Number,
          min: 0,
          max: 100,
          default: 90,
        },
        complexCase: {
          type: Number,
          min: 0,
          max: 100,
          default: 70,
        },
        videoOnly: {
          type: Number,
          min: 0,
          max: 100,
        },
        hybrid: {
          type: Number,
          min: 0,
          max: 100,
        },
        fullOnsite: {
          type: Number,
          min: 0,
          max: 100,
        },
      },

      // Weight settings for scoring
      weights: {
        documentCompleteness: {
          type: Number,
          min: 0,
          max: 100,
          default: 30,
        },
        farmerHistory: {
          type: Number,
          min: 0,
          max: 100,
          default: 20,
        },
        farmSize: {
          type: Number,
          min: 0,
          max: 100,
          default: 15,
        },
        cropType: {
          type: Number,
          min: 0,
          max: 100,
          default: 10,
        },
        paymentStatus: {
          type: Number,
          min: 0,
          max: 100,
          default: 25,
        },
        reviewScore: {
          type: Number,
          min: 0,
          max: 100,
        },
      },

      // Routing rules
      routingRules: [
        {
          condition: {
            type: String,
            required: true,
          },
          action: {
            type: String,
            required: true,
          },
          priority: {
            type: Number,
            required: true,
          },
        },
      ],
    },

    // Performance metrics
    performance: {
      accuracy: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      totalProcessed: {
        type: Number,
        default: 0,
      },
      correctPredictions: {
        type: Number,
        default: 0,
      },
      falsePositives: {
        type: Number,
        default: 0,
      },
      falseNegatives: {
        type: Number,
        default: 0,
      },
    },

    // Training metadata
    lastTrainedAt: {
      type: Date,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
  },
  {
    timestamps: true,
    collection: 'aiconfigs',
  },
);

// Indexes
aiConfigSchema.index({ module: 1 }, { unique: true });
aiConfigSchema.index({ enabled: 1 });
aiConfigSchema.index({ version: 1 });

// Virtual: Calculate precision
aiConfigSchema.virtual('precision').get(function () {
  const total = this.performance.correctPredictions + this.performance.falsePositives;
  return total > 0 ? ((this.performance.correctPredictions / total) * 100).toFixed(2) : 0;
});

// Virtual: Calculate recall
aiConfigSchema.virtual('recall').get(function () {
  const total = this.performance.correctPredictions + this.performance.falseNegatives;
  return total > 0 ? ((this.performance.correctPredictions / total) * 100).toFixed(2) : 0;
});

// Virtual: Calculate F1 score
aiConfigSchema.virtual('f1Score').get(function () {
  const precision = parseFloat(this.precision);
  const recall = parseFloat(this.recall);
  if (precision + recall === 0) {
    return 0;
  }
  return ((2 * precision * recall) / (precision + recall)).toFixed(2);
});

// Method: Update performance metrics
aiConfigSchema.methods.updatePerformance = function (
  wasCorrect,
  wasFalsePositive,
  wasFalseNegative,
) {
  this.performance.totalProcessed += 1;

  if (wasCorrect) {
    this.performance.correctPredictions += 1;
  }
  if (wasFalsePositive) {
    this.performance.falsePositives += 1;
  }
  if (wasFalseNegative) {
    this.performance.falseNegatives += 1;
  }

  // Recalculate accuracy
  const total = this.performance.totalProcessed;
  this.performance.accuracy = total > 0 ? (this.performance.correctPredictions / total) * 100 : 0;

  return this.save();
};

// Method: Get thresholds
aiConfigSchema.methods.getThresholds = function () {
  return this.config.thresholds;
};

// Method: Get weights
aiConfigSchema.methods.getWeights = function () {
  return this.config.weights;
};

// Method: Get routing rules
aiConfigSchema.methods.getRoutingRules = function () {
  return this.config.routingRules.sort((a, b) => a.priority - b.priority);
};

// Static: Get config by module
aiConfigSchema.statics.getByModule = async function (moduleName) {
  return this.findOne({ module: moduleName, enabled: true });
};

// Static: Update config
aiConfigSchema.statics.updateConfig = async function (moduleName, updates) {
  return this.findOneAndUpdate(
    { module: moduleName },
    { $set: updates },
    { new: true, runValidators: true },
  );
};

// Pre-save hook: Validate weights sum to 100
aiConfigSchema.pre('save', function (next) {
  if (this.config && this.config.weights) {
    const weights = this.config.weights;
    const sum = Object.values(weights).reduce((acc, val) => acc + (val || 0), 0);

    // Allow some tolerance for rounding
    if (sum < 99 || sum > 101) {
      return next(new Error(`Weights must sum to 100, but sum to ${sum}`));
    }
  }
  next();
});

const AIConfig = mongoose.model('AIConfig', aiConfigSchema);

module.exports = AIConfig;
