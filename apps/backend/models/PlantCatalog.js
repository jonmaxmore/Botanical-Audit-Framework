const mongoose = require('mongoose');

/**
 * PlantCatalog Model
 *
 * Central knowledge base for 6 medicinal plants supported by the platform:
 *
 * PRIMARY FOCUS:
 * - Cannabis (กัญชา) - Main crop for GACP compliance and legal cultivation
 *
 * SECONDARY ECONOMIC CROPS (Future Phases):
 * - Turmeric (ขมิ้นชัน)
 * - Ginger (ขิง)
 * - Black Galingale (กระชายดำ)
 * - Plai (ไพล)
 * - Kratom (กระท่อม)
 *
 * This model serves as the master reference for all plant-specific data
 * used throughout the platform for AI recommendations, GACP compliance,
 * and cultivation guidance.
 */

const GrowthStageSchema = new mongoose.Schema({
  stageName: {
    type: String,
    required: true,
    // e.g., 'seedling', 'vegetative', 'flowering', 'harvest'
  },
  stageNameThai: {
    type: String,
    required: true,
    // e.g., 'ต้นกล้า', 'แตกกิ่งใบ', 'ออกดอก', 'เก็บเกี่ยว'
  },
  durationDays: {
    min: Number,
    max: Number,
    typical: Number,
  },
  description: String,
  descriptionThai: String,
  optimalConditions: {
    temperature: {
      min: Number,
      max: Number,
      optimal: Number,
      unit: {
        type: String,
        default: 'celsius',
      },
    },
    humidity: {
      min: Number,
      max: Number,
      optimal: Number,
    },
    soilMoisture: {
      min: Number, // %
      max: Number, // %
      optimal: Number, // %
    },
    soilPH: {
      min: Number,
      max: Number,
      optimal: Number,
    },
    lightHours: {
      min: Number,
      max: Number,
      optimal: Number,
    },
  },
  nutrients: {
    npkRatio: String, // e.g., "20-10-20"
    nitrogen: String, // e.g., "high", "medium", "low"
    phosphorus: String,
    potassium: String,
    micronutrients: [String], // e.g., ["calcium", "magnesium", "iron"]
  },
  waterRequirements: {
    frequency: String, // e.g., "daily", "every 2-3 days"
    amount: String, // e.g., "moderate", "high"
    litersPerPlantPerDay: {
      min: Number,
      max: Number,
      typical: Number,
    },
  },
  commonActivities: [
    {
      activity: String, // e.g., "pruning", "training", "defoliation"
      activityThai: String,
      timing: String,
      frequency: String,
      gacpCompliant: Boolean,
    },
  ],
});

const NutrientDeficiencySchema = new mongoose.Schema({
  nutrient: {
    type: String,
    required: true,
    // e.g., "nitrogen", "phosphorus", "potassium", "calcium", etc.
  },
  nutrientThai: String,
  symptoms: [String],
  symptomsThai: [String],
  visualIndicators: {
    leafColor: String,
    leafPattern: String,
    affectedArea: String, // e.g., "older leaves", "new growth"
  },
  correction: {
    fertilizer: [String],
    applicationRate: String,
    applicationMethod: String,
    timeToRecovery: String,
  },
  correctionThai: {
    fertilizer: [String],
    applicationRate: String,
    applicationMethod: String,
  },
});

const PlantCatalogSchema = new mongoose.Schema(
  {
    // === Basic Plant Information ===
    plantId: {
      type: String,
      required: true,
      unique: true,
      // e.g., "cannabis-001", "turmeric-001"
    },
    plantType: {
      type: String,
      required: true,
      enum: [
        'cannabis', // กัญชา - PRIMARY FOCUS
        'turmeric', // ขมิ้นชัน
        'ginger', // ขิง
        'black_galingale', // กระชายดำ
        'plai', // ไพล
        'kratom', // กระท่อม
      ],
    },
    isPrimaryCrop: {
      type: Boolean,
      default: false,
      // Cannabis should be TRUE, others FALSE
    },
    developmentPhase: {
      type: String,
      enum: ['current', 'future', 'research'],
      default: 'current',
      // Cannabis: 'current', Others: 'future'
    },

    // === Names ===
    commonName: {
      english: {
        type: String,
        required: true,
      },
      thai: {
        type: String,
        required: true,
      },
      scientific: {
        type: String,
        required: true,
        // e.g., "Cannabis sativa L."
      },
      localNames: [String], // Regional Thai names
    },

    // === Plant Classification ===
    taxonomy: {
      kingdom: String,
      family: String,
      genus: String,
      species: String,
    },

    category: {
      type: String,
      enum: ['medicinal_herb', 'spice', 'aromatic', 'controlled_substance'],
      required: true,
    },

    // === Regulatory & GACP Information ===
    gacpCompliance: {
      required: {
        type: Boolean,
        default: false,
      },
      regulatoryBody: String, // e.g., "กรมแพทย์แผนไทยและการแพทย์ทางเลือก"
      licenseRequired: {
        type: Boolean,
        default: false,
      },
      licenseTypes: [String], // e.g., ["cultivation", "processing", "distribution"]
      controlledSubstance: {
        type: Boolean,
        default: false,
      },
      thcLimit: Number, // For hemp/cannabis only
      cbdContent: String, // For hemp/cannabis only
      applicableLaws: [
        {
          lawName: String,
          lawNameThai: String,
          year: Number,
          description: String,
          url: String,
        },
      ],
      requiredSOPs: [String], // e.g., ["SOP-01", "SOP-02", ...]
    },

    // === Cultivation Information ===
    cultivationInfo: {
      growingDifficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      },
      climateZones: [String], // Thai climate zones where it grows well
      suitableRegions: [
        {
          type: String,
          enum: ['north', 'northeast', 'central', 'east', 'west', 'south'],
        },
      ],
      preferredProvinces: [String], // List of Thai provinces

      elevationRange: {
        min: Number, // meters above sea level
        max: Number,
        optimal: Number,
      },

      soilTypes: [
        {
          type: String,
          enum: ['loam', 'sandy_loam', 'clay_loam', 'silt_loam', 'sandy', 'clay'],
        },
      ],

      propagationMethods: [
        {
          method: {
            type: String,
            enum: ['seed', 'cutting', 'rhizome', 'division', 'tissue_culture'],
          },
          successRate: Number, // %
          timeToMaturity: Number, // days
          difficulty: String,
          gacpApproved: Boolean,
        },
      ],

      averageGrowingPeriod: {
        value: Number,
        unit: {
          type: String,
          enum: ['days', 'weeks', 'months'],
          default: 'days',
        },
      },

      harvestCycles: {
        cyclesPerYear: Number,
        continuousHarvest: Boolean,
      },

      yieldExpectations: {
        perPlant: {
          min: Number,
          max: Number,
          average: Number,
          unit: String, // e.g., "grams", "kg"
        },
        perRai: {
          min: Number,
          max: Number,
          average: Number,
          unit: String,
        },
        perHectare: {
          min: Number,
          max: Number,
          average: Number,
          unit: String,
        },
      },
    },

    // === Growth Stages ===
    growthStages: [GrowthStageSchema],

    // === Environmental Requirements ===
    environmentalRequirements: {
      temperature: {
        germination: { min: Number, max: Number, optimal: Number },
        growth: { min: Number, max: Number, optimal: Number },
        flowering: { min: Number, max: Number, optimal: Number },
        unit: { type: String, default: 'celsius' },
      },
      humidity: {
        germination: { min: Number, max: Number, optimal: Number },
        vegetative: { min: Number, max: Number, optimal: Number },
        flowering: { min: Number, max: Number, optimal: Number },
        harvest: { min: Number, max: Number, optimal: Number },
      },
      rainfall: {
        annualMin: Number, // mm
        annualMax: Number, // mm
        annualOptimal: Number, // mm
      },
      sunlight: {
        hoursPerDay: { min: Number, max: Number, optimal: Number },
        intensity: String, // "full sun", "partial shade", etc.
        photoperiod: String, // "short-day", "long-day", "day-neutral"
      },
    },

    // === Nutrient Information ===
    nutrientRequirements: {
      overall: String, // "high", "medium", "low"
      npkPreferences: {
        vegetative: String, // e.g., "3-1-2"
        flowering: String, // e.g., "1-3-2"
      },
      deficiencySymptoms: [NutrientDeficiencySchema],
      organicFertilizers: [
        {
          name: String,
          nameThai: String,
          npkRatio: String,
          applicationRate: String,
          frequency: String,
          gacpApproved: Boolean,
        },
      ],
    },

    // === Common Diseases & Pests ===
    commonIssues: {
      diseases: [
        {
          diseaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DiseasePest',
          },
          diseaseName: String,
          diseaseNameThai: String,
          prevalence: {
            type: String,
            enum: ['rare', 'occasional', 'common', 'very_common'],
          },
          seasonality: [String], // e.g., ["rainy_season", "hot_season"]
        },
      ],
      pests: [
        {
          pestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DiseasePest',
          },
          pestName: String,
          pestNameThai: String,
          prevalence: {
            type: String,
            enum: ['rare', 'occasional', 'common', 'very_common'],
          },
          seasonality: [String],
        },
      ],
    },

    // === Medicinal & Economic Value ===
    medicinalProperties: {
      activeCompounds: [
        {
          compoundName: String,
          compoundNameThai: String,
          concentration: String,
          medicalUse: String,
          medicalUseThai: String,
        },
      ],
      traditionalUses: [
        {
          condition: String,
          conditionThai: String,
          preparation: String,
          preparationThai: String,
          dosage: String,
        },
      ],
      modernApplications: [String],
      modernApplicationsThai: [String],
    },

    economicData: {
      marketDemand: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
      averagePrice: {
        fresh: { value: Number, unit: String }, // THB per kg
        dried: { value: Number, unit: String },
        processed: { value: Number, unit: String },
      },
      exportPotential: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'very_high'],
      },
      targetMarkets: [String], // e.g., ["domestic", "china", "europe", "usa"]
    },

    // === AI/ML Features ===
    mlFeatures: {
      // Features used for machine learning models
      averageSuccessRate: Number, // % of successful crops
      commonFailureReasons: [String],
      optimalPlantingMonths: [Number], // 1-12
      harvestMonths: [Number], // 1-12

      // Regional performance data
      regionalYieldFactors: [
        {
          region: String,
          averageYield: Number,
          successRate: Number,
          commonChallenges: [String],
        },
      ],

      // Environmental tolerances (for AI decision-making)
      tolerances: {
        drought: { type: String, enum: ['low', 'medium', 'high'] },
        flood: { type: String, enum: ['low', 'medium', 'high'] },
        heat: { type: String, enum: ['low', 'medium', 'high'] },
        cold: { type: String, enum: ['low', 'medium', 'high'] },
        salinity: { type: String, enum: ['low', 'medium', 'high'] },
      },
    },

    // === References & Documentation ===
    references: {
      researchPapers: [
        {
          title: String,
          authors: [String],
          year: Number,
          journal: String,
          doi: String,
          url: String,
        },
      ],
      gacpGuidelines: [
        {
          title: String,
          titleThai: String,
          issuingBody: String,
          year: Number,
          url: String,
        },
      ],
      cultivationGuides: [
        {
          title: String,
          titleThai: String,
          source: String,
          url: String,
        },
      ],
    },

    // === Images & Media ===
    images: [
      {
        url: String,
        caption: String,
        captionThai: String,
        stage: String, // Which growth stage this image represents
        isPrimary: Boolean,
      },
    ],

    // === Status & Metadata ===
    status: {
      type: String,
      enum: ['active', 'research', 'deprecated'],
      default: 'active',
    },

    dataQuality: {
      completeness: Number, // 0-100
      lastVerified: Date,
      verifiedBy: String,
      needsUpdate: Boolean,
    },

    version: {
      type: Number,
      default: 1,
    },

    notes: String,
    notesThai: String,
  },
  {
    timestamps: true,
  },
);

// === Indexes for Performance ===
PlantCatalogSchema.index({ plantType: 1, isPrimaryCrop: -1 });
PlantCatalogSchema.index({ 'cultivationInfo.suitableRegions': 1 });
PlantCatalogSchema.index({ status: 1 });

// === Static Methods ===

/**
 * Get the primary plant (Cannabis)
 */
PlantCatalogSchema.statics.getPrimaryPlant = function () {
  return this.findOne({ isPrimaryCrop: true, status: 'active' });
};

/**
 * Get all active plants
 */
PlantCatalogSchema.statics.getActivePlants = function () {
  return this.find({ status: 'active' }).sort({ isPrimaryCrop: -1, plantType: 1 });
};

/**
 * Get plants suitable for a specific region
 */
PlantCatalogSchema.statics.getPlantsByRegion = function (region) {
  return this.find({
    status: 'active',
    'cultivationInfo.suitableRegions': region,
  }).sort({ isPrimaryCrop: -1 });
};

/**
 * Get plant by type with fallback to cannabis (default)
 */
PlantCatalogSchema.statics.getPlantByType = async function (plantType = 'cannabis') {
  const plant = await this.findOne({ plantType, status: 'active' });

  // If plant not found, return cannabis (primary crop)
  if (!plant) {
    return this.findOne({ isPrimaryCrop: true, status: 'active' });
  }

  return plant;
};

/**
 * Get growth stage information for a plant
 */
PlantCatalogSchema.methods.getGrowthStage = function (stageName) {
  return this.growthStages.find(stage => stage.stageName === stageName);
};

/**
 * Get GACP requirements for this plant
 */
PlantCatalogSchema.methods.getGACPRequirements = function () {
  return {
    required: this.gacpCompliance.required,
    licenseRequired: this.gacpCompliance.licenseRequired,
    licenseTypes: this.gacpCompliance.licenseTypes,
    requiredSOPs: this.gacpCompliance.requiredSOPs,
    regulatoryBody: this.gacpCompliance.regulatoryBody,
  };
};

/**
 * Check if plant is suitable for given environmental conditions
 */
PlantCatalogSchema.methods.isSuitableForConditions = function (conditions) {
  const { temperature, humidity, soilPH: _soilPH, region } = conditions;

  let suitable = true;
  const reasons = [];

  // Check temperature
  if (temperature) {
    const tempReq = this.environmentalRequirements.temperature.growth;
    if (temperature < tempReq.min || temperature > tempReq.max) {
      suitable = false;
      reasons.push(`Temperature out of range (${tempReq.min}-${tempReq.max}°C)`);
    }
  }

  // Check humidity
  if (humidity) {
    const humReq = this.environmentalRequirements.humidity.vegetative;
    if (humidity < humReq.min || humidity > humReq.max) {
      suitable = false;
      reasons.push(`Humidity out of range (${humReq.min}-${humReq.max}%)`);
    }
  }

  // Check region
  if (region && !this.cultivationInfo.suitableRegions.includes(region)) {
    suitable = false;
    reasons.push(`Not recommended for ${region} region`);
  }

  return { suitable, reasons };
};

module.exports = mongoose.model('PlantCatalog', PlantCatalogSchema);
