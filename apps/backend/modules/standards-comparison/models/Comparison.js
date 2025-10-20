/**
 * Comparison Model
 *
 * MongoDB schema for standards comparison results
 */

const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema(
  {
    // Farm information
    farmId: {
      type: String,
      required: true,
      index: true
    },

    // Farm data submitted for comparison
    farmData: {
      farmName: {
        type: String,
        required: true,
        index: true
      },
      location: {
        province: String,
        district: String,
        subDistrict: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      cropType: String,
      farmSize: Number,

      // Farming practices
      practices: {
        organicFarming: Boolean,
        pestManagement: Boolean,
        soilManagement: Boolean,
        waterManagement: Boolean,
        postHarvest: Boolean,
        workerSafety: Boolean,
        foodSafety: Boolean,
        environmental: Boolean,
        wasteManagement: Boolean,
        traceability: Boolean
      },

      // Documents
      documents: [
        {
          type: String,
          name: String,
          uploadedAt: Date
        }
      ],

      // Certifications
      certifications: [String],

      // Records
      records: {
        complete: Boolean,
        cultivation: Boolean,
        harvesting: Boolean,
        batchTracking: Boolean
      }
    },

    // Comparison results for each standard
    comparisons: [
      {
        standardId: String,
        standardName: String,
        version: String,
        score: Number,
        certified: Boolean,
        totalScore: Number,
        maxScore: Number,

        // Results by category
        categoryResults: [
          {
            category: String,
            title: String,
            score: Number,
            maxScore: Number,
            percentage: Number,

            // Results by criteria
            criteria: [
              {
                id: String,
                requirement: String,
                priority: {
                  type: String,
                  enum: ['critical', 'important', 'optional']
                },
                weight: Number,
                met: Boolean,
                score: Number
              }
            ]
          }
        ]
      }
    ],

    // Overall summary
    summary: {
      standardsCompared: Number,
      certified: Number,
      notCertified: Number,
      averageScore: Number
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    collection: 'standards_comparisons'
  }
);

// Indexes for performance
comparisonSchema.index({ farmId: 1, createdAt: -1 });
comparisonSchema.index({ 'farmData.farmName': 1 });
comparisonSchema.index({ 'comparisons.standardId': 1 });

// Virtual for comparison age
comparisonSchema.virtual('age').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days;
});

// Method to check if comparison is recent (within 30 days)
comparisonSchema.methods.isRecent = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt >= thirtyDaysAgo;
};

// Method to get overall certification status
comparisonSchema.methods.getOverallStatus = function() {
  if (this.summary.certified === this.summary.standardsCompared) {
    return 'fully_certified';
  } else if (this.summary.certified > 0) {
    return 'partially_certified';
  } else {
    return 'not_certified';
  }
};

// Method to get critical gaps count
comparisonSchema.methods.getCriticalGapsCount = function() {
  let count = 0;

  for (const comparison of this.comparisons) {
    for (const category of comparison.categoryResults) {
      for (const criterion of category.criteria) {
        if (!criterion.met && criterion.priority === 'critical') {
          count++;
        }
      }
    }
  }

  return count;
};

// Static method to find recent comparisons
comparisonSchema.statics.findRecent = function(farmId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    farmId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: -1 });
};

// Static method to find certified farms
comparisonSchema.statics.findCertified = function(standardId) {
  return this.find({
    comparisons: {
      $elemMatch: {
        standardId,
        certified: true
      }
    }
  });
};

const Comparison = mongoose.model('Comparison', comparisonSchema);

module.exports = Comparison;
