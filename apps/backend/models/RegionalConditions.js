const mongoose = require('mongoose');

/**
 * RegionalConditions Model
 *
 * Stores environmental and agricultural data for Thailand's 77 provinces,
 * organized into 6 major regions:
 * - North (ภาคเหนือ): 9 provinces
 * - Northeast (ภาคอีสาน): 20 provinces
 * - Central (ภาคกลาง): 22 provinces
 * - East (ภาคตะวันออก): 7 provinces
 * - West (ภาคตะวันตก): 5 provinces
 * - South (ภาคใต้): 14 provinces
 *
 * This data is essential for:
 * - AI crop recommendations based on location
 * - Predicting optimal planting times
 * - Disease/pest risk assessment
 * - Yield predictions
 * - Water management recommendations
 *
 * Data sources:
 * - Thai Meteorological Department (กรมอุตุนิยมวิทยา)
 * - Department of Agriculture (กรมวิชาการเกษตร)
 * - Land Development Department (กรมพัฒนาที่ดิน)
 */

const MonthlyClimateSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  temperature: {
    min: Number, // °C
    max: Number, // °C
    average: Number, // °C
  },
  humidity: {
    min: Number, // %
    max: Number, // %
    average: Number, // %
  },
  rainfall: {
    averageMm: Number, // mm
    rainyDays: Number, // Number of days with rain
    intensity: {
      type: String,
      enum: ['very_light', 'light', 'moderate', 'heavy', 'very_heavy'],
    },
  },
  sunlightHours: Number, // Average hours per day
  evapotranspiration: Number, // mm (ET0)
  windSpeed: Number, // km/h
  extremeWeatherRisk: {
    drought: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    flood: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    storm: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
  },
});

const SeasonalPatternSchema = new mongoose.Schema({
  season: {
    type: String,
    required: true,
    enum: ['hot', 'rainy', 'cool', 'dry'],
    // Hot (ร้อน): March-May
    // Rainy (ฝน): June-October
    // Cool/Winter (หนาว): November-February
  },
  startMonth: Number, // 1-12
  endMonth: Number, // 1-12
  characteristics: {
    temperatureRange: String,
    humidityRange: String,
    rainfallPattern: String,
    farmingActivities: [String], // Common activities during this season
    farmingActivitiesThai: [String],
  },
  suitableFor: [
    {
      plantType: String,
      activity: {
        type: String,
        enum: ['planting', 'growing', 'flowering', 'harvesting'],
      },
    },
  ],
});

const SoilDataSchema = new mongoose.Schema({
  dominantSoilTypes: [
    {
      type: String,
      enum: [
        'loam',
        'sandy_loam',
        'clay_loam',
        'silt_loam',
        'sandy',
        'clay',
        'silty',
        'laterite',
        'alluvial',
        'peat',
      ],
    },
  ],
  soilPH: {
    average: Number,
    range: {
      min: Number,
      max: Number,
    },
    suitability: {
      type: String,
      enum: ['very_acidic', 'acidic', 'slightly_acidic', 'neutral', 'alkaline'],
    },
  },
  fertility: {
    level: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    organicMatter: {
      percentage: Number,
      level: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
    },
    nutrients: {
      nitrogen: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
      phosphorus: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
      potassium: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
    },
  },
  drainage: {
    type: String,
    enum: ['very_poor', 'poor', 'moderate', 'good', 'excellent'],
  },
  waterRetention: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
  },
  texture: String,
  depth: {
    type: String,
    enum: ['very_shallow', 'shallow', 'moderate', 'deep', 'very_deep'],
  },
  commonIssues: [String], // e.g., ["salinity", "compaction", "erosion"]
  commonIssuesThai: [String],
  amendments: [
    {
      issue: String,
      issueThai: String,
      solution: String,
      solutionThai: String,
      materials: [String],
      estimatedCost: String,
    },
  ],
});

const WaterResourceSchema = new mongoose.Schema({
  availability: {
    type: String,
    enum: ['very_scarce', 'scarce', 'moderate', 'abundant', 'very_abundant'],
    required: true,
  },
  sources: [
    {
      type: String,
      enum: ['river', 'reservoir', 'groundwater', 'rainfall', 'canal', 'natural_spring'],
    },
  ],
  majorWaterBodies: [
    {
      name: String,
      nameThai: String,
      type: {
        type: String,
        enum: ['river', 'lake', 'reservoir', 'dam'],
      },
      reliability: {
        type: String,
        enum: ['unreliable', 'seasonal', 'reliable', 'very_reliable'],
      },
    },
  ],
  irrigationInfrastructure: {
    availability: {
      type: String,
      enum: ['none', 'limited', 'moderate', 'good', 'excellent'],
    },
    types: [String], // e.g., ["canal", "pump", "drip", "sprinkler"]
  },
  groundwaterDepth: {
    average: Number, // meters
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
    },
    salinityIssue: Boolean,
  },
  waterQuality: {
    rating: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
    },
    commonIssues: [String], // e.g., ["salinity", "contamination", "hardness"]
  },
  droughtRisk: {
    frequency: {
      type: String,
      enum: ['rare', 'occasional', 'frequent', 'very_frequent'],
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'extreme'],
    },
    typicalMonths: [Number], // 1-12
  },
  floodRisk: {
    frequency: {
      type: String,
      enum: ['rare', 'occasional', 'frequent', 'very_frequent'],
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'extreme'],
    },
    typicalMonths: [Number], // 1-12
  },
});

const AgriculturalDataSchema = new mongoose.Schema({
  primaryCrops: [
    {
      plantType: String,
      areaUnderCultivation: {
        value: Number,
        unit: { type: String, default: 'rai' },
      },
      averageYield: {
        value: Number,
        unit: String,
      },
      economicImportance: {
        type: String,
        enum: ['minor', 'moderate', 'important', 'very_important', 'critical'],
      },
    },
  ],
  cannabisSuitability: {
    overall: {
      type: String,
      enum: ['unsuitable', 'marginal', 'suitable', 'good', 'excellent'],
      required: true,
    },
    factors: [String],
    factorsThai: [String],
    recommendedCultivars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlantCultivar',
      },
    ],
    expectedYield: {
      min: Number,
      max: Number,
      average: Number,
      unit: { type: String, default: 'kg/rai' },
    },
    challenges: [String],
    challengesThai: [String],
    opportunities: [String],
    opportunitiesThai: [String],
  },
  otherMedicinalPlants: [
    {
      plantType: {
        type: String,
        enum: ['turmeric', 'ginger', 'black_galingale', 'plai', 'kratom'],
      },
      suitability: {
        type: String,
        enum: ['unsuitable', 'marginal', 'suitable', 'good', 'excellent'],
      },
      currentProduction: Boolean, // Is it currently being grown here?
      potentialYield: {
        value: Number,
        unit: String,
      },
    },
  ],
  farmingPractices: {
    predominantStyle: {
      type: String,
      enum: ['traditional', 'conventional', 'semi_modern', 'modern', 'organic'],
    },
    mechanization: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'very_high'],
    },
    technologyAdoption: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
  },
});

const EconomicDataSchema = new mongoose.Schema({
  landPrice: {
    average: Number, // THB per rai
    range: {
      min: Number,
      max: Number,
    },
  },
  laborCost: {
    averageDaily: Number, // THB per day
    availability: {
      type: String,
      enum: ['scarce', 'limited', 'adequate', 'abundant'],
    },
  },
  inputCosts: {
    fertilizer: String, // Price range description
    water: String,
    electricity: String,
  },
  marketAccess: {
    rating: {
      type: String,
      enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
    },
    nearestMarket: String,
    distanceKm: Number,
    transportInfrastructure: {
      type: String,
      enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
    },
  },
});

const RegionalConditionsSchema = new mongoose.Schema(
  {
    // === Basic Information ===
    provinceId: {
      type: String,
      required: true,
      unique: true,
      // e.g., "TH-10" for Bangkok, "TH-50" for Chiang Mai
    },

    province: {
      english: {
        type: String,
        required: true,
      },
      thai: {
        type: String,
        required: true,
      },
    },

    region: {
      type: String,
      required: true,
      enum: ['north', 'northeast', 'central', 'east', 'west', 'south'],
    },

    subregion: String, // More specific classification if needed

    // === Geographic Data ===
    geography: {
      area: {
        value: Number, // sq km
        unit: { type: String, default: 'sq_km' },
      },
      capitalCity: {
        english: String,
        thai: String,
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
        },
      },
      elevation: {
        min: Number, // meters
        max: Number,
        average: Number,
      },
      terrain: {
        type: String,
        enum: ['flat', 'rolling', 'hilly', 'mountainous', 'coastal', 'mixed'],
      },
      coastalProvince: {
        type: Boolean,
        default: false,
      },
    },

    // === Climate Data ===
    climate: {
      type: {
        type: String,
        enum: ['tropical_savanna', 'tropical_monsoon', 'tropical_rainforest', 'humid_subtropical'],
        required: true,
      },
      averageAnnualTemp: Number, // °C
      averageAnnualRainfall: Number, // mm
      averageAnnualHumidity: Number, // %
      monthlyData: [MonthlyClimateSchema],
      seasonalPatterns: [SeasonalPatternSchema],
    },

    // === Soil Data ===
    soil: SoilDataSchema,

    // === Water Resources ===
    water: WaterResourceSchema,

    // === Agricultural Data ===
    agriculture: AgriculturalDataSchema,

    // === Economic Data ===
    economics: EconomicDataSchema,

    // === Infrastructure ===
    infrastructure: {
      electricity: {
        reliability: {
          type: String,
          enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
        },
        costLevel: {
          type: String,
          enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
        },
      },
      roads: {
        quality: {
          type: String,
          enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
        },
        accessibility: {
          type: String,
          enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
        },
      },
      internet: {
        availability: {
          type: String,
          enum: ['none', 'limited', 'moderate', 'good', 'excellent'],
        },
        coverage: Number, // % of area covered
      },
      storageProcessing: {
        availability: {
          type: String,
          enum: ['none', 'limited', 'moderate', 'good', 'excellent'],
        },
        types: [String], // e.g., ["cold_storage", "drying_facilities", "processing_plants"]
      },
    },

    // === ML Features & Statistics ===
    mlFeatures: {
      overallFarmingSuitability: Number, // 0-100
      cannabisSuitabilityScore: Number, // 0-100
      riskScore: Number, // 0-100 (higher = more risky)
      profitabilityScore: Number, // 0-100

      // Historical performance
      successfulFarms: Number, // Count of successful farms in this province
      averageYieldPerformance: Number, // % of expected yield achieved
      commonChallenges: [String],
      commonChallengesThai: [String],

      // Seasonal risk factors
      bestPlantingWindow: {
        start: Number, // Month (1-12)
        end: Number, // Month (1-12)
        confidence: Number, // 0-100
      },
      worstPlantingWindow: {
        start: Number,
        end: Number,
      },
    },

    // === Government Support ===
    governmentSupport: {
      agriculturalExtension: {
        availability: {
          type: String,
          enum: ['none', 'limited', 'moderate', 'good', 'excellent'],
        },
        offices: [String], // List of relevant offices
      },
      subsidies: [
        {
          program: String,
          programThai: String,
          description: String,
          descriptionThai: String,
          applicableTo: [String], // Crop types
        },
      ],
      trainingPrograms: [
        {
          name: String,
          nameThai: String,
          provider: String,
          frequency: String,
        },
      ],
    },

    // === Local Knowledge ===
    localExpertise: {
      farmerExperience: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
      traditionalKnowledge: String,
      traditionalKnowledgeThai: String,
      successStories: [
        {
          title: String,
          titleThai: String,
          summary: String,
          summaryThai: String,
          farmId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Farm',
          },
        },
      ],
    },

    // === Nearby Resources ===
    nearbyResources: {
      universities: [String],
      researchCenters: [String],
      supplierDensity: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
      buyerDensity: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
    },

    // === Data Quality & Metadata ===
    dataQuality: {
      completeness: Number, // 0-100
      accuracy: {
        type: String,
        enum: ['low', 'medium', 'high', 'verified'],
      },
      lastUpdated: Date,
      lastVerified: Date,
      dataSources: [String],
      needsUpdate: Boolean,
    },

    version: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ['active', 'draft', 'needs_review'],
      default: 'active',
    },

    notes: String,
    notesThai: String,
  },
  {
    timestamps: true,
  },
);

// === Indexes ===
RegionalConditionsSchema.index({ region: 1, province: 1 });
RegionalConditionsSchema.index({ 'geography.coordinates': '2dsphere' });
RegionalConditionsSchema.index({ 'agriculture.cannabisSuitability.overall': 1 });
RegionalConditionsSchema.index({ 'mlFeatures.cannabisSuitabilityScore': -1 });

// === Static Methods ===

/**
 * Get all provinces in a region
 */
RegionalConditionsSchema.statics.getProvincesByRegion = function (region) {
  return this.find({ region, status: 'active' }).sort({ 'province.english': 1 });
};

/**
 * Get provinces most suitable for cannabis
 */
RegionalConditionsSchema.statics.getBestForCannabis = function (limit = 10) {
  return this.find({
    status: 'active',
    'agriculture.cannabisSuitability.overall': { $in: ['good', 'excellent'] },
  })
    .sort({ 'mlFeatures.cannabisSuitabilityScore': -1 })
    .limit(limit);
};

/**
 * Get provinces by coordinates (nearest)
 */
RegionalConditionsSchema.statics.getNearestProvinces = function (
  longitude,
  latitude,
  maxDistance = 100000,
) {
  return this.find({
    'geography.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance, // meters
      },
    },
    status: 'active',
  });
};

/**
 * Get provinces suitable for a specific plant
 */
RegionalConditionsSchema.statics.getSuitableForPlant = function (plantType) {
  if (plantType === 'cannabis') {
    return this.find({
      status: 'active',
      'agriculture.cannabisSuitability.overall': { $in: ['suitable', 'good', 'excellent'] },
    }).sort({ 'mlFeatures.cannabisSuitabilityScore': -1 });
  } else {
    return this.find({
      status: 'active',
      'agriculture.otherMedicinalPlants': {
        $elemMatch: {
          plantType: plantType,
          suitability: { $in: ['suitable', 'good', 'excellent'] },
        },
      },
    });
  }
};

/**
 * Get current season for province
 */
RegionalConditionsSchema.methods.getCurrentSeason = function () {
  const month = new Date().getMonth() + 1; // 1-12

  const season = this.climate.seasonalPatterns.find(s => {
    if (s.startMonth <= s.endMonth) {
      return month >= s.startMonth && month <= s.endMonth;
    } else {
      // Season spans across year boundary
      return month >= s.startMonth || month <= s.endMonth;
    }
  });

  return season || null;
};

/**
 * Get climate data for specific month
 */
RegionalConditionsSchema.methods.getMonthlyClimate = function (month) {
  return this.climate.monthlyData.find(m => m.month === month) || null;
};

/**
 * Check if good time to plant specific crop
 */
RegionalConditionsSchema.methods.isGoodPlantingTime = function (plantType, month = null) {
  const targetMonth = month || new Date().getMonth() + 1;

  const bestWindow = this.mlFeatures.bestPlantingWindow;
  const worstWindow = this.mlFeatures.worstPlantingWindow;

  let inBestWindow = false;
  let inWorstWindow = false;

  // Check best window
  if (bestWindow.start <= bestWindow.end) {
    inBestWindow = targetMonth >= bestWindow.start && targetMonth <= bestWindow.end;
  } else {
    inBestWindow = targetMonth >= bestWindow.start || targetMonth <= bestWindow.end;
  }

  // Check worst window
  if (worstWindow.start <= worstWindow.end) {
    inWorstWindow = targetMonth >= worstWindow.start && targetMonth <= worstWindow.end;
  } else {
    inWorstWindow = targetMonth >= worstWindow.start || targetMonth <= worstWindow.end;
  }

  return {
    recommended: inBestWindow,
    notRecommended: inWorstWindow,
    neutral: !inBestWindow && !inWorstWindow,
    confidence: inBestWindow ? bestWindow.confidence : 0,
  };
};

/**
 * Get suitability score for given farm conditions
 */
RegionalConditionsSchema.methods.getSuitabilityForFarm = function (farmData) {
  const { plantType, growingMethod, experience: _experience, budget: _budget } = farmData;

  let score = this.mlFeatures.overallFarmingSuitability;
  const factors = [];

  // Adjust for plant type
  if (plantType === 'cannabis') {
    score = (score + this.mlFeatures.cannabisSuitabilityScore) / 2;
    factors.push(`Cannabis suitability: ${this.agriculture.cannabisSuitability.overall}`);
  }

  // Adjust for risk
  score -= this.mlFeatures.riskScore * 0.1;

  // Infrastructure factors
  if (this.infrastructure.electricity.reliability === 'poor') {
    score -= 10;
    factors.push('Poor electricity reliability');
  }

  if (
    this.infrastructure.internet.availability === 'limited' &&
    growingMethod === 'smart_farming'
  ) {
    score -= 15;
    factors.push('Limited internet for IoT features');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
    recommendation:
      score >= 80
        ? 'Excellent Location'
        : score >= 60
          ? 'Good Location'
          : score >= 40
            ? 'Challenging but Possible'
            : 'Not Recommended',
  };
};

module.exports = mongoose.model('RegionalConditions', RegionalConditionsSchema);
