/**
 * 📊 Survey Response Model
 * MongoDB schema for GACP survey wizard responses
 */

const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema(
  {
    // Survey identification
    surveyId: {
      type: String,
      required: true,
      description: 'Template ID (e.g., template-central)'
    },
    userId: {
      type: String,
      required: true,
      index: true,
      description: 'User who started the survey'
    },
    farmId: {
      type: String,
      index: true,
      description: 'Associated farm ID'
    },
    region: {
      type: String,
      required: true,
      enum: ['central', 'southern', 'northern', 'northeastern'],
      index: true,
      description: 'Farm region'
    },

    // Wizard state
    currentStep: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 7,
      description: 'Current wizard step (1-7)'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: 'Overall progress percentage'
    },
    state: {
      type: String,
      enum: ['DRAFT', 'COMPLETE', 'SUBMITTED'],
      default: 'DRAFT',
      index: true,
      description: 'Survey response state'
    },

    // Step 1: Region Selection
    regionSelection: {
      selectedRegion: String,
      confirmedAt: Date
    },

    // Step 2: Personal Information
    personalInfo: {
      fullName: String,
      idCard: String,
      phone: String,
      email: String,
      address: {
        houseNo: String,
        village: String,
        subDistrict: String,
        district: String,
        province: String,
        postalCode: String
      }
    },

    // Step 3: Farm Information
    farmInfo: {
      farmName: String,
      farmArea: Number, // rai
      productType: String,
      annualProduction: Number, // kg/year
      farmLocation: {
        latitude: Number,
        longitude: Number
      }
    },

    // Step 4: Management & Production
    managementProduction: {
      hasGACPCertification: Boolean,
      certificationDate: Date,
      useOrganicPractices: Boolean,
      followsSOPs: Boolean,
      hasQualityControl: Boolean,
      waterConservation: Boolean,
      useOrganicFertilizer: Boolean,
      hasPestManagement: Boolean,
      environmentalConcern: Boolean,
      productionMethod: String,
      challenges: [String]
    },

    // Step 5: Cost & Revenue
    costRevenue: {
      monthlyCost: Number, // THB
      monthlyRevenue: Number, // THB
      profitMargin: Number, // %
      mainExpenses: [String],
      revenueStreams: [String]
    },

    // Step 6: Market & Sales
    marketSales: {
      hasMarketAccess: Boolean,
      directToConsumer: Boolean,
      exportMarket: Boolean,
      mainMarkets: [String],
      salesChannels: [String],
      marketingStrategy: String
    },

    // Step 7: Problems & Needs
    problemsNeeds: {
      mainProblems: [String],
      technicalNeeds: [String],
      financialNeeds: [String],
      trainingNeeds: [String],
      supportNeeded: String,
      futureGoals: String
    },

    // Scoring results
    scores: {
      gacp: {
        type: Number,
        min: 0,
        max: 100,
        description: 'GACP compliance score'
      },
      sustainability: {
        type: Number,
        min: 0,
        max: 100,
        description: 'Sustainability score'
      },
      market: {
        type: Number,
        min: 0,
        max: 100,
        description: 'Market access score'
      },
      overall: {
        type: Number,
        min: 0,
        max: 100,
        description: 'Overall score (average + bonus)'
      },
      regionalBonus: {
        type: Number,
        default: 0,
        description: 'Regional bonus points'
      }
    },

    // Recommendations
    recommendations: [
      {
        priority: {
          type: String,
          enum: ['HIGH', 'MEDIUM', 'LOW']
        },
        category: String,
        title: String,
        description: String,
        actionItems: [String]
      }
    ],

    // Metadata
    metadata: {
      createdAt: {
        type: Date,
        default: Date.now,
        index: true
      },
      lastSavedAt: {
        type: Date,
        default: Date.now
      },
      submittedAt: Date,
      ipAddress: String,
      userAgent: String
    }
  },
  {
    collection: 'surveyresponses',
    timestamps: false
  }
);

// Indexes for performance
SurveyResponseSchema.index({ userId: 1, state: 1 });
SurveyResponseSchema.index({ region: 1, state: 1 });
SurveyResponseSchema.index({ 'metadata.createdAt': -1 });
SurveyResponseSchema.index({ 'scores.overall': -1 });

// Virtual: Check if all steps completed
SurveyResponseSchema.virtual('isComplete').get(function () {
  return this.progress === 100 && this.currentStep === 7;
});

// Virtual: Score grade
SurveyResponseSchema.virtual('grade').get(function () {
  if (!this.scores || !this.scores.overall) return null;

  const score = this.scores.overall;
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
});

// Instance method: Get step data
SurveyResponseSchema.methods.getStepData = function (stepNumber) {
  const stepMap = {
    1: 'regionSelection',
    2: 'personalInfo',
    3: 'farmInfo',
    4: 'managementProduction',
    5: 'costRevenue',
    6: 'marketSales',
    7: 'problemsNeeds'
  };

  return this[stepMap[stepNumber]];
};

// Instance method: Update auto-save timestamp
SurveyResponseSchema.methods.updateAutoSave = function () {
  this.metadata.lastSavedAt = new Date();
  return this.save();
};

// Static method: Get user's surveys
SurveyResponseSchema.statics.findByUser = function (userId, options = {}) {
  const query = { userId };

  if (options.status) query.state = options.status;
  if (options.region) query.region = options.region;

  return this.find(query)
    .sort({ 'metadata.createdAt': -1 })
    .limit(options.limit || 50);
};

// Static method: Get regional statistics
SurveyResponseSchema.statics.getRegionalStats = async function (region) {
  return this.aggregate([
    { $match: { region, state: 'SUBMITTED' } },
    {
      $group: {
        _id: null,
        totalSurveys: { $sum: 1 },
        avgGACPScore: { $avg: '$scores.gacp' },
        avgSustainabilityScore: { $avg: '$scores.sustainability' },
        avgMarketScore: { $avg: '$scores.market' },
        avgOverallScore: { $avg: '$scores.overall' }
      }
    }
  ]);
};

// Pre-save middleware
SurveyResponseSchema.pre('save', function (next) {
  // Update lastSavedAt
  this.metadata.lastSavedAt = new Date();

  // Auto-set submittedAt when state changes to SUBMITTED
  if (this.isModified('state') && this.state === 'SUBMITTED' && !this.metadata.submittedAt) {
    this.metadata.submittedAt = new Date();
  }

  next();
});

// Export model
module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
