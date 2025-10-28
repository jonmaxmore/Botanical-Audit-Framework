const mongoose = require('mongoose');

/**
 * HistoricalYield Model
 *
 * Stores historical cultivation data for machine learning and analytics.
 * This is the PRIMARY data source for training AI recommendation models:
 *
 * ML USE CASES:
 * 1. Yield Prediction Model - Predict expected yields based on conditions
 * 2. Fertilizer Recommendation - Learn optimal NPK ratios and timing
 * 3. Irrigation Optimization - Understand water requirements and efficiency
 * 4. Disease Prediction - Identify conditions that lead to disease outbreaks
 * 5. Success Factor Analysis - What makes farms successful
 * 6. Regional Performance - Compare different regions and cultivars
 *
 * DATA SOURCES:
 * - Completed CultivationCycles from existing farms
 * - Manual entry by farmers
 * - Research data from universities
 * - Government agricultural statistics
 * - Partner farm data
 * - Estimated data from literature (clearly marked)
 *
 * FOCUS: Cannabis as primary crop, other 5 medicinal plants as secondary
 */

const EnvironmentalDataSchema = new mongoose.Schema({
  // Average conditions throughout the growth period
  temperature: {
    average: Number, // °C
    min: Number,
    max: Number,
    optimal_days: Number // Days within optimal range
  },
  humidity: {
    average: Number, // %
    min: Number,
    max: Number,
    optimal_days: Number
  },
  rainfall: {
    total: Number, // mm
    distribution: String, // e.g., "evenly distributed", "heavy early season"
    rainyDays: Number
  },
  sunlight: {
    averageHoursPerDay: Number,
    totalHours: Number,
    cloudyDays: Number
  },
  soilMoisture: {
    average: Number, // %
    min: Number,
    max: Number,
    dryPeriods: Number, // Days below threshold
    wetPeriods: Number // Days above threshold
  },
  soilPH: {
    initial: Number,
    final: Number,
    average: Number
  },
  soilTemperature: {
    average: Number // °C
  },
  airQuality: {
    rating: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent']
    },
    notes: String
  }
});

const InputDataSchema = new mongoose.Schema({
  // Fertilizer applications
  fertilizer: [
    {
      date: Date,
      growthStage: String,
      type: {
        type: String,
        enum: ['organic', 'synthetic', 'hybrid']
      },
      product: String,
      npkRatio: String, // e.g., "20-10-20"
      nitrogen: Number, // kg
      phosphorus: Number, // kg
      potassium: Number, // kg
      micronutrients: [
        {
          name: String,
          amount: Number,
          unit: String
        }
      ],
      applicationMethod: String,
      cost: Number, // THB
      gacpCompliant: Boolean
    }
  ],
  totalFertilizerCost: Number, // THB

  // Water management
  irrigation: {
    method: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'manual', 'rain_fed', 'mixed']
    },
    totalWaterUsed: Number, // liters or m³
    frequency: String,
    scheduling: String, // e.g., "fixed schedule", "sensor-based", "manual"
    efficiency: Number, // % (estimated water use efficiency)
    cost: Number // THB
  },

  // Pest & disease management
  pestControl: [
    {
      date: Date,
      issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiseasePest'
      },
      issueName: String,
      issueType: String, // "disease", "pest", "deficiency"
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      treatment: String,
      product: String,
      organic: Boolean,
      gacpCompliant: Boolean,
      cost: Number, // THB
      effective: Boolean,
      notes: String
    }
  ],
  totalPestControlCost: Number, // THB

  // Labor
  labor: {
    totalHours: Number,
    averageWorkersPerDay: Number,
    totalLaborCost: Number, // THB
    mechanization: {
      type: String,
      enum: ['none', 'low', 'medium', 'high']
    }
  },

  // Other inputs
  otherInputs: [
    {
      category: String, // e.g., "seeds", "equipment", "utilities"
      description: String,
      cost: Number // THB
    }
  ],

  // Total cost calculation
  totalCost: Number // THB (sum of all costs)
});

const YieldDataSchema = new mongoose.Schema({
  // Harvest results
  fresh: {
    totalWeight: Number, // kg
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent', 'premium']
    }
  },
  dried: {
    totalWeight: Number, // kg
    dryingMethod: String,
    moistureContent: Number, // %
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent', 'premium']
    }
  },

  // For cannabis specifically
  cannabisSpecific: {
    flowerWeight: Number, // kg (dried buds)
    trimWeight: Number, // kg (trim/shake)
    wasteWeight: Number, // kg (stems, etc.)
    thcContent: Number, // %
    cbdContent: Number, // %
    terpeneProfile: String,
    visualQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent', 'premium']
    },
    aromaQuality: Number, // 0-10
    trichomeDevelopment: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent']
    }
  },

  // Yield per area
  yieldPerRai: Number, // kg/rai
  yieldPerHectare: Number, // kg/hectare
  yieldPerPlant: Number, // kg/plant

  // Quality grades (if applicable)
  qualityGrades: [
    {
      grade: String, // e.g., "A", "B", "C" or "Premium", "Standard"
      weight: Number, // kg
      percentage: Number // % of total
    }
  ],

  // Market data
  sellingPrice: {
    averagePerKg: Number, // THB/kg
    totalRevenue: Number, // THB
    buyer: String
  }
});

const OutcomeDataSchema = new mongoose.Schema({
  // Success metrics
  success: {
    overall: {
      type: String,
      enum: ['failed', 'poor', 'below_average', 'average', 'above_average', 'excellent'],
      required: true
    },
    successScore: {
      type: Number,
      min: 0,
      max: 100
    },
    metExpectations: Boolean,
    exceededExpectations: Boolean
  },

  // Financial outcomes
  financial: {
    totalRevenue: Number, // THB
    totalCost: Number, // THB
    netProfit: Number, // THB
    profitMargin: Number, // %
    roi: Number, // % (Return on Investment)
    breakEven: Boolean
  },

  // Efficiency metrics
  efficiency: {
    waterUseEfficiency: Number, // kg yield per m³ water
    nutrientUseEfficiency: Number, // kg yield per kg NPK
    laborProductivity: Number, // kg yield per hour
    landProductivity: Number, // THB per rai
    energyEfficiency: Number // kg yield per kWh (if tracked)
  },

  // Quality outcomes
  quality: {
    overallQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent', 'premium']
    },
    gacpCompliant: Boolean,
    certificationAchieved: Boolean,
    certification: String,
    qualityScore: Number // 0-100
  },

  // Comparison metrics
  comparison: {
    vsRegionalAverage: Number, // % difference
    vsPreviousCycle: Number, // % difference
    vsExpectedYield: Number, // % difference
    ranking: String // e.g., "top 10%", "average", "below average"
  },

  // Challenges encountered
  challenges: [
    {
      type: {
        type: String,
        enum: [
          'disease',
          'pest',
          'weather',
          'nutrient',
          'water',
          'labor',
          'equipment',
          'market',
          'other'
        ]
      },
      description: String,
      descriptionThai: String,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'critical']
      },
      impact: String, // Impact on yield/quality
      resolution: String, // How it was resolved
      lessonsLearned: String,
      lessonsLearnedThai: String
    }
  ],

  // Success factors
  successFactors: [
    {
      factor: String,
      factorThai: String,
      importance: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'critical']
      },
      description: String,
      descriptionThai: String
    }
  ]
});

const HistoricalYieldSchema = new mongoose.Schema(
  {
    // === Basic Information ===
    recordId: {
      type: String,
      required: true,
      unique: true
      // e.g., "hist-yield-2024-001"
    },

    dataSource: {
      type: {
        type: String,
        required: true,
        enum: [
          'completed_cycle', // From actual CultivationCycle
          'farmer_report', // Manually entered by farmer
          'research_data', // From university/research
          'government_stats', // From DoA statistics
          'estimated', // Estimated from literature
          'partner_farm', // From partner organizations
          'survey' // From farmer surveys
        ]
      },
      sourceId: String, // ID of source record (if applicable)
      reliability: {
        type: String,
        enum: ['low', 'medium', 'high', 'verified'],
        default: 'medium'
      },
      verified: {
        type: Boolean,
        default: false
      },
      verifiedBy: String,
      verifiedDate: Date
    },

    // === Farm & Location Data ===
    farm: {
      farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm'
      },
      farmType: {
        type: String,
        enum: ['conventional', 'organic', 'gapHybrid', 'hydroponic', 'mixed']
      },
      farmSize: {
        value: Number,
        unit: String
      },
      anonymous: {
        type: Boolean,
        default: false
        // TRUE if farmer wants to stay anonymous
      }
    },

    location: {
      region: {
        type: String,
        enum: ['north', 'northeast', 'central', 'east', 'west', 'south'],
        required: true
      },
      province: String,
      district: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number] // [longitude, latitude]
      },
      elevation: Number, // meters
      terrainType: String
    },

    // === Plant Data ===
    plant: {
      plantType: {
        type: String,
        required: true,
        enum: ['cannabis', 'turmeric', 'ginger', 'black_galingale', 'plai', 'kratom']
      },
      plantCatalog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlantCatalog'
      },
      cultivar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlantCultivar'
      },
      cultivarName: String,
      genetics: String // For cannabis: "indica", "sativa", "hybrid"
    },

    // === Cultivation Details ===
    cultivation: {
      method: {
        type: String,
        enum: ['outdoor', 'indoor', 'greenhouse', 'hydroponic', 'mixed'],
        required: true
      },
      area: {
        value: Number,
        unit: {
          type: String,
          enum: ['rai', 'sqm', 'hectare', 'acre'],
          default: 'rai'
        }
      },
      numberOfPlants: Number,
      plantDensity: {
        value: Number,
        unit: String // e.g., "plants/sqm"
      },

      // Timing
      plantingDate: {
        type: Date,
        required: true
      },
      harvestDate: {
        type: Date,
        required: true
      },
      totalDays: Number, // Days from planting to harvest
      growthStages: {
        seedling: Number, // days
        vegetative: Number,
        flowering: Number,
        harvest: Number
      },

      // Soil
      soilType: String,
      soilPreparation: String,
      amendments: [String]
    },

    // === Environmental Data ===
    environment: EnvironmentalDataSchema,

    // === Inputs ===
    inputs: InputDataSchema,

    // === Yield Results ===
    yield: YieldDataSchema,

    // === Outcomes & Analysis ===
    outcome: OutcomeDataSchema,

    // === ML Feature Engineering ===
    mlFeatures: {
      // Normalized features for ML models (0-1 scale where applicable)
      normalized: {
        temperatureOptimality: Number, // How close to optimal temp
        humidityOptimality: Number,
        waterEfficiency: Number,
        nutrientEfficiency: Number,
        diseaseFreeSeason: Number, // % of season without disease
        yieldPerformance: Number, // vs expected yield
        qualityScore: Number,
        profitability: Number
      },

      // Categorical features
      categorical: {
        season: String, // "hot", "rainy", "cool"
        experienceLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert']
        },
        technology: {
          type: String,
          enum: ['traditional', 'basic', 'moderate', 'advanced', 'cutting_edge']
        }
      },

      // Computed features
      computed: {
        growingDegreeDays: Number, // Accumulated heat units
        waterStressDays: Number, // Days with water stress
        heatStressDays: Number,
        coldStressDays: Number,
        optimalConditionDays: Number, // Days with all conditions optimal
        problemFreeDays: Number, // Days without issues
        inputCostPerKg: Number, // THB per kg yield
        revenuePerRai: Number // THB per rai
      },

      // Success indicators
      indicators: {
        successfulGrowth: Boolean,
        highYield: Boolean, // Above 75th percentile
        highQuality: Boolean,
        profitable: Boolean,
        gacpCompliant: Boolean,
        sustainable: Boolean,
        replicable: Boolean // Can other farms replicate this?
      },

      // Clustering features (for similarity analysis)
      cluster: {
        profileId: String, // Assigned by ML clustering algorithm
        similarRecords: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HistoricalYield'
          }
        ]
      }
    },

    // === Farmer Feedback ===
    farmerFeedback: {
      satisfaction: {
        type: Number,
        min: 0,
        max: 10
      },
      wouldRepeat: Boolean,
      wouldRecommend: Boolean,
      comments: String,
      commentsThai: String,
      lessonsLearned: String,
      lessonsLearnedThai: String,
      improvements: String,
      improvementsThai: String
    },

    // === Research Notes ===
    research: {
      studyId: String,
      researchGroup: String,
      experimentalConditions: String,
      controlVariables: [String],
      hypothesisTested: String,
      findings: String,
      publications: [String]
    },

    // === Privacy & Sharing ===
    privacy: {
      public: {
        type: Boolean,
        default: false
      },
      shareWithResearchers: {
        type: Boolean,
        default: false
      },
      shareForML: {
        type: Boolean,
        default: true
      },
      anonymize: {
        type: Boolean,
        default: true
      }
    },

    // === Data Quality ===
    dataQuality: {
      completeness: {
        type: Number,
        min: 0,
        max: 100
      },
      accuracy: {
        type: String,
        enum: ['low', 'medium', 'high', 'verified']
      },
      hasIoTData: Boolean, // Was IoT used to collect data?
      iotDataQuality: {
        type: String,
        enum: ['none', 'limited', 'good', 'excellent']
      },
      manualDataEntry: Boolean,
      missingFields: [String],
      estimatedFields: [String],
      notes: String
    },

    // === Tags & Categories ===
    tags: [String], // e.g., ["high-yield", "organic", "first-timer", "experimental"]

    featured: {
      type: Boolean,
      default: false
    },

    caseStudy: {
      type: Boolean,
      default: false
      // Mark as case study for educational purposes
    },

    // === Status ===
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'verified', 'published', 'archived'],
      default: 'pending_review'
    },

    version: {
      type: Number,
      default: 1
    },

    notes: String,
    notesThai: String
  },
  {
    timestamps: true
  }
);

// === Indexes ===
HistoricalYieldSchema.index({ 'plant.plantType': 1, 'location.region': 1 });
HistoricalYieldSchema.index({ 'cultivation.plantingDate': -1 });
HistoricalYieldSchema.index({ 'outcome.success.successScore': -1 });
HistoricalYieldSchema.index({ 'yield.yieldPerRai': -1 });
HistoricalYieldSchema.index({ status: 1, featured: -1 });
HistoricalYieldSchema.index({ 'location.coordinates': '2dsphere' });
HistoricalYieldSchema.index({ 'dataSource.type': 1, 'dataSource.reliability': 1 });
HistoricalYieldSchema.index({ 'privacy.shareForML': 1 });

// === Static Methods ===

/**
 * Get verified records for ML training
 */
HistoricalYieldSchema.statics.getMLTrainingData = function (
  plantType = 'cannabis',
  minCompleteness = 70
) {
  return this.find({
    'plant.plantType': plantType,
    'privacy.shareForML': true,
    'dataQuality.completeness': { $gte: minCompleteness },
    'dataSource.reliability': { $in: ['high', 'verified'] },
    status: { $in: ['verified', 'published'] }
  });
};

/**
 * Get high-performing records for benchmarking
 */
HistoricalYieldSchema.statics.getTopPerformers = function (plantType, region = null, limit = 10) {
  const query = {
    'plant.plantType': plantType,
    'outcome.success.successScore': { $gte: 80 },
    status: { $in: ['verified', 'published'] }
  };

  if (region) {
    query['location.region'] = region;
  }

  return this.find(query).sort({ 'outcome.success.successScore': -1 }).limit(limit);
};

/**
 * Get records by region and plant type
 */
HistoricalYieldSchema.statics.getByRegionAndPlant = function (region, plantType) {
  return this.find({
    'location.region': region,
    'plant.plantType': plantType,
    status: { $in: ['verified', 'published'] }
  }).sort({ 'cultivation.harvestDate': -1 });
};

/**
 * Get recent records
 */
HistoricalYieldSchema.statics.getRecent = function (plantType, months = 12) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  return this.find({
    'plant.plantType': plantType,
    'cultivation.harvestDate': { $gte: cutoffDate },
    status: { $in: ['verified', 'published'] }
  }).sort({ 'cultivation.harvestDate': -1 });
};

/**
 * Get similar records (for recommendations)
 */
HistoricalYieldSchema.statics.getSimilarRecords = function (conditions, limit = 10) {
  const { plantType, region, cultivationMethod, season } = conditions;

  const query = {
    'plant.plantType': plantType,
    status: { $in: ['verified', 'published'] }
  };

  if (region) query['location.region'] = region;
  if (cultivationMethod) query['cultivation.method'] = cultivationMethod;
  if (season) query['mlFeatures.categorical.season'] = season;

  return this.find(query).sort({ 'outcome.success.successScore': -1 }).limit(limit);
};

/**
 * Get aggregated statistics
 */
HistoricalYieldSchema.statics.getStatistics = async function (plantType, region = null) {
  const matchStage = {
    'plant.plantType': plantType,
    status: { $in: ['verified', 'published'] }
  };

  if (region) {
    matchStage['location.region'] = region;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgYieldPerRai: { $avg: '$yield.yieldPerRai' },
        maxYieldPerRai: { $max: '$yield.yieldPerRai' },
        minYieldPerRai: { $min: '$yield.yieldPerRai' },
        avgSuccessScore: { $avg: '$outcome.success.successScore' },
        avgProfitMargin: { $avg: '$outcome.financial.profitMargin' },
        avgCost: { $avg: '$inputs.totalCost' },
        avgRevenue: { $avg: '$outcome.financial.totalRevenue' }
      }
    }
  ]);
};

// === Instance Methods ===

/**
 * Calculate completeness score
 */
HistoricalYieldSchema.methods.calculateCompleteness = function () {
  let score = 0;
  const fields = [
    'plant.plantType',
    'plant.cultivar',
    'location.region',
    'cultivation.method',
    'cultivation.plantingDate',
    'cultivation.harvestDate',
    'yield.yieldPerRai',
    'inputs.totalCost',
    'outcome.financial.totalRevenue',
    'environment.temperature.average',
    'environment.humidity.average'
  ];

  fields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value !== null && value !== undefined) {
      score += 100 / fields.length;
    }
  });

  this.dataQuality.completeness = Math.round(score);
  return this.dataQuality.completeness;
};

/**
 * Generate ML features
 */
HistoricalYieldSchema.methods.generateMLFeatures = function () {
  // Calculate normalized features
  this.mlFeatures.normalized = {
    temperatureOptimality: this.calculateTemperatureOptimality(),
    humidityOptimality: this.calculateHumidityOptimality(),
    waterEfficiency: this.outcome.efficiency.waterUseEfficiency || 0,
    nutrientEfficiency: this.outcome.efficiency.nutrientUseEfficiency || 0,
    diseaseFreeSeason:
      this.outcome.challenges.filter(c => c.type === 'disease').length === 0 ? 1 : 0.5,
    yieldPerformance: this.outcome.comparison.vsExpectedYield || 0,
    qualityScore: this.outcome.quality.qualityScore || 0,
    profitability: Math.min(1, Math.max(0, this.outcome.financial.profitMargin / 100))
  };

  return this.mlFeatures;
};

/**
 * Helper: Calculate temperature optimality
 */
HistoricalYieldSchema.methods.calculateTemperatureOptimality = function () {
  // This would compare actual temperature to optimal range for the plant
  // Simplified version - should reference PlantCatalog
  const avgTemp = this.environment.temperature.average;
  if (avgTemp >= 20 && avgTemp <= 30) return 1.0;
  if (avgTemp >= 18 && avgTemp <= 32) return 0.8;
  if (avgTemp >= 15 && avgTemp <= 35) return 0.6;
  return 0.4;
};

/**
 * Helper: Calculate humidity optimality
 */
HistoricalYieldSchema.methods.calculateHumidityOptimality = function () {
  const avgHumidity = this.environment.humidity.average;
  if (avgHumidity >= 50 && avgHumidity <= 70) return 1.0;
  if (avgHumidity >= 40 && avgHumidity <= 80) return 0.8;
  if (avgHumidity >= 30 && avgHumidity <= 90) return 0.6;
  return 0.4;
};

/**
 * Check if suitable for case study
 */
HistoricalYieldSchema.methods.isCaseStudyWorthy = function () {
  return (
    this.outcome.success.successScore >= 85 &&
    this.dataQuality.completeness >= 80 &&
    this.dataSource.reliability === 'verified' &&
    (this.outcome.success.exceededExpectations || this.outcome.comparison.vsRegionalAverage > 20)
  );
};

module.exports = mongoose.model('HistoricalYield', HistoricalYieldSchema);
