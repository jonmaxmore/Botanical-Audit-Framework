const mongoose = require('mongoose');

/**
 * DiseasePest Model
 *
 * Comprehensive database of diseases, pests, and disorders affecting
 * the 6 medicinal plants supported by the platform.
 *
 * FOCUS ON CANNABIS (Primary):
 * - Common cannabis diseases (powdery mildew, bud rot, root rot, etc.)
 * - Common cannabis pests (spider mites, aphids, whiteflies, etc.)
 * - Nutrient deficiencies
 * - Environmental stress
 *
 * SECONDARY PLANTS:
 * - Diseases/pests for turmeric, ginger, black galingale, plai, kratom
 *
 * This model supports:
 * - Disease/pest identification and diagnosis
 * - AI-powered disease prediction
 * - GACP-compliant treatment recommendations
 * - Prevention strategies
 * - Regional risk assessment
 * - Image-based identification (future CV integration)
 */

const SymptomSchema = new mongoose.Schema({
  symptomType: {
    type: String,
    enum: ['visual', 'growth', 'structural', 'behavioral'],
    required: true,
  },
  location: {
    type: String,
    enum: ['leaves', 'stems', 'roots', 'flowers', 'buds', 'fruits', 'whole_plant', 'soil'],
  },
  description: {
    type: String,
    required: true,
  },
  descriptionThai: String,
  visualIndicators: {
    color: [String], // e.g., ["yellow", "brown", "white spots"]
    pattern: String, // e.g., "spots", "streaks", "coating", "wilting"
    texture: String, // e.g., "fuzzy", "powdery", "slimy", "dry"
    progression: String, // How it spreads
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'critical'],
  },
  stageMostCommon: {
    type: String,
    enum: ['seedling', 'vegetative', 'flowering', 'harvest', 'any'],
  },
});

const EnvironmentalConditionsSchema = new mongoose.Schema({
  temperature: {
    optimal: {
      min: Number, // °C
      max: Number,
    },
    description: String,
  },
  humidity: {
    optimal: {
      min: Number, // %
      max: Number,
    },
    description: String,
  },
  moisture: {
    level: {
      type: String,
      enum: ['very_dry', 'dry', 'moderate', 'moist', 'wet', 'very_wet'],
    },
    description: String,
  },
  airflow: {
    type: String,
    enum: ['stagnant', 'poor', 'moderate', 'good', 'excellent'],
  },
  soilConditions: {
    ph: String,
    drainage: String,
    other: String,
  },
  stressFactors: [String], // e.g., ["overwatering", "poor drainage", "high humidity"]
});

const TreatmentSchema = new mongoose.Schema({
  treatmentMethod: {
    type: String,
    required: true,
    enum: ['cultural', 'biological', 'chemical', 'physical', 'integrated', 'preventive'],
  },
  treatmentName: {
    type: String,
    required: true,
  },
  treatmentNameThai: String,
  description: String,
  descriptionThai: String,

  // GACP Compliance
  gacpCompliant: {
    type: Boolean,
    default: false,
    required: true,
  },
  organicCertifiable: {
    type: Boolean,
    default: false,
  },

  // Products/Materials
  activeIngredients: [String],
  products: [
    {
      name: String,
      nameThai: String,
      type: String, // e.g., "fungicide", "insecticide", "neem oil"
      manufacturer: String,
      registrationNumber: String, // Thai FDA registration
      organicCertified: Boolean,
      availability: {
        type: String,
        enum: ['unavailable', 'rare', 'limited', 'available', 'common'],
      },
      estimatedCost: {
        value: Number,
        unit: String,
        currency: { type: String, default: 'THB' },
      },
    },
  ],

  // Application Details
  application: {
    method: String, // e.g., "spray", "drench", "dust", "systemic"
    dosage: String,
    frequency: String,
    timing: String, // When to apply
    safetyPrecautions: [String],
    safetyPrecautionsThai: [String],
    preharvest_interval: Number, // days before harvest
  },

  // Effectiveness
  effectiveness: {
    rating: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
    },
    percentage: Number, // % success rate
    timeToResults: String, // e.g., "2-3 days", "1 week"
    conditions: String, // Conditions for effectiveness
  },

  // Priority and Stage
  priority: {
    type: String,
    enum: ['first_line', 'secondary', 'last_resort', 'preventive'],
  },
  applicableStages: [
    {
      type: String,
      enum: ['prevention', 'early', 'moderate', 'severe', 'recovery'],
    },
  ],

  notes: String,
  notesThai: String,
});

const PreventionSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
  },
  methodThai: String,
  category: {
    type: String,
    enum: ['cultural', 'environmental', 'sanitation', 'monitoring', 'genetic', 'biological'],
  },
  description: String,
  descriptionThai: String,
  effectiveness: {
    type: String,
    enum: ['low', 'medium', 'high', 'very_high'],
  },
  implementationDifficulty: {
    type: String,
    enum: ['easy', 'moderate', 'difficult'],
  },
  cost: {
    type: String,
    enum: ['free', 'low', 'medium', 'high'],
  },
  gacpRecommended: {
    type: Boolean,
    default: false,
  },
});

const RegionalPrevalenceSchema = new mongoose.Schema({
  region: {
    type: String,
    enum: ['north', 'northeast', 'central', 'east', 'west', 'south'],
    required: true,
  },
  prevalence: {
    type: String,
    enum: ['rare', 'uncommon', 'occasional', 'common', 'very_common'],
    required: true,
  },
  seasonality: [
    {
      month: Number, // 1-12
      riskLevel: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
    },
  ],
  peakMonths: [Number], // Months with highest risk
  environmentalTriggers: [String],
  historicalOutbreaks: [
    {
      year: Number,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'severe'],
      },
      notes: String,
    },
  ],
});

const DiseasePestSchema = new mongoose.Schema(
  {
    // === Basic Information ===
    issueId: {
      type: String,
      required: true,
      unique: true,
      // e.g., "disease-001", "pest-042", "deficiency-015"
    },

    type: {
      type: String,
      required: true,
      enum: [
        'fungal_disease',
        'bacterial_disease',
        'viral_disease',
        'insect_pest',
        'mite',
        'nematode',
        'nutrient_deficiency',
        'nutrient_toxicity',
        'environmental_stress',
        'physiological_disorder',
        'other',
      ],
    },

    // === Names ===
    name: {
      common: {
        type: String,
        required: true,
        // e.g., "Powdery Mildew", "Spider Mites"
      },
      thai: {
        type: String,
        required: true,
        // e.g., "โรคราแป้ง", "ไรแดง"
      },
      scientific: String, // e.g., "Podosphaera macularis"
      aliases: [String],
    },

    // === Affected Plants ===
    affectedPlants: [
      {
        plantType: {
          type: String,
          enum: ['cannabis', 'turmeric', 'ginger', 'black_galingale', 'plai', 'kratom'],
          required: true,
        },
        susceptibility: {
          type: String,
          enum: ['resistant', 'low', 'moderate', 'high', 'very_high'],
        },
        commonCultivars: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PlantCultivar',
          },
        ],
        resistantCultivars: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PlantCultivar',
          },
        ],
        notes: String,
        notesThai: String,
      },
    ],

    // === Description ===
    description: {
      short: {
        type: String,
        required: true,
      },
      shortThai: String,
      detailed: String,
      detailedThai: String,
      lifecycle: String, // How the disease/pest develops
      lifecycleThai: String,
      spread: String, // How it spreads
      spreadThai: String,
    },

    // === Severity ===
    severity: {
      potential: {
        type: String,
        enum: ['negligible', 'minor', 'moderate', 'major', 'devastating'],
        required: true,
      },
      speed: {
        type: String,
        enum: ['very_slow', 'slow', 'moderate', 'fast', 'very_fast'],
      },
      mortality: {
        type: String,
        enum: ['none', 'low', 'moderate', 'high', 'very_high'],
      },
      yieldImpact: {
        percentage: Number, // % yield loss if untreated
        description: String,
      },
      qualityImpact: {
        type: String,
        enum: ['none', 'minimal', 'moderate', 'significant', 'severe'],
      },
    },

    // === Symptoms ===
    symptoms: [SymptomSchema],

    // === Environmental Conditions (that favor this issue) ===
    favorableConditions: EnvironmentalConditionsSchema,

    // === Identification ===
    identification: {
      difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'difficult', 'requires_expert'],
      },
      confusionWith: [
        {
          issueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DiseasePest',
          },
          name: String,
          nameThai: String,
          howToDistinguish: String,
          howToDistinguishThai: String,
        },
      ],
      diagnosticTests: [
        {
          testName: String,
          testNameThai: String,
          availability: String,
          cost: String,
          accuracy: Number, // %
        },
      ],
    },

    // === Images ===
    images: [
      {
        url: String,
        caption: String,
        captionThai: String,
        stage: String, // Which stage of disease/pest
        plantPart: String, // Which part of plant shown
        quality: {
          type: String,
          enum: ['poor', 'fair', 'good', 'excellent'],
        },
        verified: Boolean,
      },
    ],

    // === Treatment ===
    treatments: [TreatmentSchema],

    // === Prevention ===
    prevention: [PreventionSchema],

    // === Regional Data ===
    regionalPrevalence: [RegionalPrevalenceSchema],

    // === Economic Impact ===
    economicImpact: {
      averageCostToTreat: {
        value: Number,
        unit: String,
        currency: { type: String, default: 'THB' },
      },
      potentialYieldLoss: {
        min: Number, // %
        max: Number, // %
        average: Number, // %
      },
      potentialRevenueLoss: {
        min: Number, // THB
        max: Number,
        average: Number,
        unit: String,
      },
      treatmentSuccess: Number, // % successful treatment
    },

    // === For Pests Only ===
    pestDetails: {
      appearance: {
        size: String,
        color: String,
        shape: String,
        distinguishingFeatures: [String],
      },
      behavior: {
        activity: String, // e.g., "feeds on leaf undersides"
        movementPattern: String,
        reproductionRate: {
          type: String,
          enum: ['very_slow', 'slow', 'moderate', 'fast', 'very_fast'],
        },
        generationTime: String, // e.g., "7-10 days"
      },
      naturalPredators: [
        {
          name: String,
          nameThai: String,
          effectiveness: {
            type: String,
            enum: ['low', 'moderate', 'high', 'very_high'],
          },
          availability: String,
        },
      ],
    },

    // === For Diseases Only ===
    diseaseDetails: {
      pathogen: {
        type: String,
        genus: String,
        species: String,
      },
      transmissionMethods: [String], // e.g., ["airborne", "waterborne", "contact"]
      survivalMechanism: String, // How pathogen survives between crops
      hostRange: [String], // Other plants that can host this disease
      resistanceDevelopment: {
        risk: {
          type: String,
          enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
        },
        notes: String,
      },
    },

    // === ML Features ===
    mlFeatures: {
      prevalenceScore: Number, // 0-100 (how common is this issue)
      severityScore: Number, // 0-100 (how severe is it)
      detectabilityScore: Number, // 0-100 (how easy to detect early)
      treatabilityScore: Number, // 0-100 (how easy to treat)
      preventabilityScore: Number, // 0-100 (how easy to prevent)
      overallRiskScore: Number, // 0-100 (combined risk assessment)

      // Prediction features
      temperatureRange: { min: Number, max: Number }, // Favorable temp range
      humidityRange: { min: Number, max: Number }, // Favorable humidity range
      seasonalPattern: [Number], // Risk by month (0-100 for each month)
      environmentalTriggers: [String],

      // Historical data
      reportedIncidents: Number, // Total reported cases
      successfulTreatments: Number,
      preventionSuccesses: Number,
      commonMistakes: [String], // Common treatment mistakes
    },

    // === GACP Compliance ===
    gacpConsiderations: {
      monitoringRequired: {
        type: Boolean,
        default: false,
      },
      recordKeepingRequired: {
        type: Boolean,
        default: false,
      },
      approvedTreatments: [String], // List of GACP-approved treatments
      prohibitedTreatments: [String], // Treatments NOT allowed under GACP
      quarantineRequired: {
        type: Boolean,
        default: false,
      },
      reportingRequired: {
        type: Boolean,
        default: false,
      },
      notes: String,
      notesThai: String,
    },

    // === References & Resources ===
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
      governmentGuidelines: [
        {
          title: String,
          titleThai: String,
          issuingBody: String,
          year: Number,
          url: String,
        },
      ],
      expertSources: [
        {
          name: String,
          organization: String,
          contact: String,
        },
      ],
    },

    // === User Reports ===
    userReports: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        farmId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Farm',
        },
        region: String,
        province: String,
        date: Date,
        severity: String,
        notes: String,
        treatmentUsed: String,
        treatmentEffective: Boolean,
        verified: Boolean,
      },
    ],

    // === Status & Metadata ===
    status: {
      type: String,
      enum: ['active', 'monitoring', 'emerging', 'historical', 'research'],
      default: 'active',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    featured: {
      type: Boolean,
      default: false,
    },

    dataQuality: {
      completeness: Number, // 0-100
      accuracy: {
        type: String,
        enum: ['low', 'medium', 'high', 'verified'],
      },
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

// === Indexes ===
DiseasePestSchema.index({ type: 1, 'affectedPlants.plantType': 1 });
DiseasePestSchema.index({ 'regionalPrevalence.region': 1 });
DiseasePestSchema.index({ status: 1, priority: -1 });
DiseasePestSchema.index({ 'mlFeatures.overallRiskScore': -1 });
DiseasePestSchema.index({ featured: -1 });

// === Text Search Index ===
DiseasePestSchema.index({
  'name.common': 'text',
  'name.thai': 'text',
  'description.short': 'text',
  'description.detailed': 'text',
});

// === Static Methods ===

/**
 * Get all issues affecting a specific plant type
 */
DiseasePestSchema.statics.getByPlantType = function (plantType, limit = null) {
  const query = this.find({
    status: 'active',
    'affectedPlants.plantType': plantType,
  }).sort({ 'mlFeatures.overallRiskScore': -1 });

  return limit ? query.limit(limit) : query;
};

/**
 * Get high-risk issues for a region
 */
DiseasePestSchema.statics.getHighRiskByRegion = function (region, plantType = null) {
  const query = {
    status: 'active',
    'regionalPrevalence.region': region,
    'regionalPrevalence.prevalence': { $in: ['common', 'very_common'] },
  };

  if (plantType) {
    query['affectedPlants.plantType'] = plantType;
  }

  return this.find(query).sort({ 'mlFeatures.overallRiskScore': -1 });
};

/**
 * Get seasonal risks for current month
 */
DiseasePestSchema.statics.getCurrentSeasonalRisks = function (region, plantType, month = null) {
  const currentMonth = month || new Date().getMonth() + 1;

  return this.find({
    status: 'active',
    'affectedPlants.plantType': plantType,
    'regionalPrevalence.region': region,
    'regionalPrevalence.peakMonths': currentMonth,
  }).sort({ 'mlFeatures.overallRiskScore': -1 });
};

/**
 * Search diseases/pests
 */
DiseasePestSchema.statics.searchIssues = function (query) {
  return this.find(
    {
      $text: { $search: query },
      status: 'active',
    },
    {
      score: { $meta: 'textScore' },
    },
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Get GACP-compliant treatments for an issue
 */
DiseasePestSchema.methods.getGACPTreatments = function () {
  return this.treatments.filter(t => t.gacpCompliant);
};

/**
 * Get organic treatments
 */
DiseasePestSchema.methods.getOrganicTreatments = function () {
  return this.treatments.filter(t => t.organicCertifiable);
};

/**
 * Get prevention methods
 */
DiseasePestSchema.methods.getGACPPrevention = function () {
  return this.prevention.filter(p => p.gacpRecommended);
};

/**
 * Get risk level for specific conditions
 */
DiseasePestSchema.methods.getRiskLevel = function (conditions) {
  const { temperature, humidity, region, month } = conditions;

  let riskScore = 0;
  const factors = [];

  // Check temperature
  if (temperature && this.mlFeatures.temperatureRange.min && this.mlFeatures.temperatureRange.max) {
    if (
      temperature >= this.mlFeatures.temperatureRange.min &&
      temperature <= this.mlFeatures.temperatureRange.max
    ) {
      riskScore += 30;
      factors.push('Temperature in favorable range');
    }
  }

  // Check humidity
  if (humidity && this.mlFeatures.humidityRange.min && this.mlFeatures.humidityRange.max) {
    if (
      humidity >= this.mlFeatures.humidityRange.min &&
      humidity <= this.mlFeatures.humidityRange.max
    ) {
      riskScore += 30;
      factors.push('Humidity in favorable range');
    }
  }

  // Check region
  if (region) {
    const regionData = this.regionalPrevalence.find(r => r.region === region);
    if (regionData) {
      const prevalenceScore = {
        rare: 5,
        uncommon: 10,
        occasional: 20,
        common: 30,
        very_common: 40,
      };
      riskScore += prevalenceScore[regionData.prevalence] || 0;
      factors.push(`${regionData.prevalence} in this region`);
    }
  }

  // Check season
  if (month) {
    const seasonalRisk = this.mlFeatures.seasonalPattern[month - 1];
    if (seasonalRisk) {
      riskScore = (riskScore + seasonalRisk) / 2;
      factors.push(`Seasonal risk: ${seasonalRisk}%`);
    }
  }

  return {
    riskScore: Math.min(100, riskScore),
    riskLevel:
      riskScore >= 70
        ? 'very_high'
        : riskScore >= 50
          ? 'high'
          : riskScore >= 30
            ? 'medium'
            : riskScore >= 10
              ? 'low'
              : 'very_low',
    factors,
  };
};

/**
 * Add user report
 */
DiseasePestSchema.methods.addUserReport = function (reportData) {
  this.userReports.push(reportData);
  this.mlFeatures.reportedIncidents += 1;
  return this.save();
};

module.exports = mongoose.model('DiseasePest', DiseasePestSchema);
