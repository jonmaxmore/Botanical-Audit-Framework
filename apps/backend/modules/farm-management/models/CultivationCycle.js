/**
 * 🌱 Cultivation Cycle Model
 * Model for Cannabis cultivation cycle management
 */

const mongoose = require('mongoose');

const cultivationCycleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    farmerEmail: {
      type: String,
      required: true,
    },
    farmId: {
      type: String,
      required: false,
    },
    farmName: {
      type: String,
      required: false,
    },
    cropType: {
      type: String,
      required: true,
      enum: ['cannabis', 'hemp', 'medicinal_cannabis'],
    },
    variety: {
      type: String,
      required: true,
    },
    plantingDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['planning', 'active', 'harvesting', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
    phase: {
      type: String,
      required: true,
      enum: ['germination', 'vegetative', 'flowering', 'harvest', 'post-harvest'],
      default: 'germination',
    },
    area: {
      value: Number,
      unit: {
        type: String,
        enum: ['sqm', 'rai', 'hectare'],
        default: 'rai',
      },
    },
    plantCount: {
      type: Number,
      required: false,
    },
    activities: [
      {
        id: String,
        type: {
          type: String,
          enum: ['watering', 'fertilizing', 'pruning', 'pest_control', 'inspection', 'other'],
        },
        description: String,
        date: Date,
        userId: String,
        userName: String,
        notes: String,
        sopCompliance: Boolean,
        recordedAt: Date,
      },
    ],
    complianceChecks: [
      {
        id: String,
        inspectorId: String,
        inspectorName: String,
        checkDate: Date,
        checkType: {
          type: String,
          enum: ['routine', 'spot_check', 'certification', 'follow_up'],
        },
        findings: [
          {
            category: String,
            finding: String,
            severity: {
              type: String,
              enum: ['minor', 'major', 'critical'],
            },
            status: {
              type: String,
              enum: ['open', 'resolved', 'pending'],
            },
          },
        ],
        overallCompliance: {
          type: String,
          enum: ['compliant', 'non_compliant', 'partially_compliant'],
        },
        notes: String,
        recordedAt: Date,
      },
    ],
    complianceScore: {
      score: Number,
      lastUpdated: Date,
      breakdown: {
        sopCompliance: Number,
        gacpStandards: Number,
        safetyProtocols: Number,
        recordKeeping: Number,
      },
    },
    harvestData: {
      harvestDate: Date,
      totalYield: Number,
      yieldUnit: {
        type: String,
        enum: ['kg', 'ton', 'gram'],
      },
      qualityGrade: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
      },
      notes: String,
    },
    completionData: {
      completedDate: Date,
      totalYield: Number,
      finalComplianceScore: Number,
      certification: {
        eligible: Boolean,
        reason: String,
      },
      notes: String,
    },
    metadata: {
      createdBy: String,
      createdAt: Date,
      updatedBy: String,
      updatedAt: Date,
      version: {
        type: Number,
        default: 1,
      },
    },
  },
  {
    timestamps: true,
    collection: 'cultivationcycles',
  }
);

// Indexes for performance
cultivationCycleSchema.index({ farmerId: 1, status: 1 });
cultivationCycleSchema.index({ farmerId: 1, plantingDate: -1 });
cultivationCycleSchema.index({ status: 1, phase: 1 });

// Virtual for days since planting
cultivationCycleSchema.virtual('daysSincePlanting').get(function () {
  if (!this.plantingDate) return 0;
  const now = new Date();
  const diff = now - this.plantingDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Instance method to check if cycle is active
cultivationCycleSchema.methods.isActive = function () {
  return this.status === 'active';
};

// Instance method to calculate compliance score
cultivationCycleSchema.methods.calculateComplianceScore = function () {
  if (!this.complianceChecks || this.complianceChecks.length === 0) {
    return null;
  }

  // Calculate based on latest compliance check
  const latest = this.complianceChecks[this.complianceChecks.length - 1];

  let score = 100;

  if (latest.findings) {
    latest.findings.forEach(finding => {
      if (finding.severity === 'critical') score -= 20;
      else if (finding.severity === 'major') score -= 10;
      else if (finding.severity === 'minor') score -= 5;
    });
  }

  return Math.max(0, score);
};

// Static method to find active cycles for farmer
cultivationCycleSchema.statics.findActiveCyclesForFarmer = function (farmerId) {
  return this.find({
    farmerId,
    status: 'active',
  }).sort({ plantingDate: -1 });
};

const CultivationCycle = mongoose.model('CultivationCycle', cultivationCycleSchema);

module.exports = CultivationCycle;
