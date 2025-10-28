const mongoose = require('mongoose');

/**
 * PlantCultivar Model
 *
 * Tracks specific varieties, strains, and cultivars of the 6 medicinal plants.
 * This is especially important for cannabis which has hundreds of different strains,
 * each with unique characteristics, THC/CBD profiles, and growing requirements.
 *
 * CANNABIS STRAINS (Primary Focus):
 * - Medical strains (high CBD, low THC)
 * - Hemp varieties (< 0.2% THC)
 * - Industrial hemp
 *
 * OTHER PLANT VARIETIES (Secondary):
 * - Turmeric varieties (Chiang Mai, Chumphon, etc.)
 * - Ginger varieties
 * - Black galingale varieties
 * - Plai varieties
 * - Kratom varieties
 *
 * This model provides cultivar-specific data for precise AI recommendations
 * and helps farmers choose the best variety for their region and goals.
 */

const ChemicalProfileSchema = new mongoose.Schema({
  // For Cannabis
  thc: {
    percentage: Number, // %
    range: {
      min: Number,
      max: Number,
    },
  },
  cbd: {
    percentage: Number, // %
    range: {
      min: Number,
      max: Number,
    },
  },
  cbn: Number, // %
  cbg: Number, // %
  terpenes: [
    {
      name: String,
      percentage: Number,
      aroma: String,
      effects: [String],
    },
  ],

  // For other medicinal plants
  activeCompounds: [
    {
      compoundName: String,
      compoundNameThai: String,
      concentration: String,
      unit: String,
      medicalBenefit: String,
      medicalBenefitThai: String,
    },
  ],

  curcuminContent: Number, // % for turmeric
  gingerolContent: Number, // % for ginger
  alkaloidContent: Number, // % for kratom
  essentialOilContent: Number, // % for aromatic plants
});

const GrowingCharacteristicsSchema = new mongoose.Schema({
  // Plant morphology
  height: {
    indoor: {
      min: Number, // cm
      max: Number,
      average: Number,
    },
    outdoor: {
      min: Number,
      max: Number,
      average: Number,
    },
  },
  structure: {
    type: String,
    enum: ['compact', 'medium', 'tall', 'bushy', 'slender'],
  },
  leafShape: String,
  leafColor: String,

  // Growth behavior
  growthRate: {
    type: String,
    enum: ['very_slow', 'slow', 'medium', 'fast', 'very_fast'],
  },
  branchingPattern: {
    type: String,
    enum: ['minimal', 'moderate', 'heavy'],
  },
  nodeSpacing: {
    type: String,
    enum: ['tight', 'medium', 'wide'],
  },

  // Flowering/harvest characteristics
  floweringTime: {
    value: Number, // days
    range: {
      min: Number,
      max: Number,
    },
  },
  floweringTrigger: {
    type: String,
    enum: ['photoperiod', 'autoflower', 'age', 'environmental'],
  },
  harvestWindow: {
    durationDays: Number,
    flexibility: {
      type: String,
      enum: ['strict', 'moderate', 'flexible'],
    },
  },

  // Yield characteristics
  yieldPotential: {
    indoor: {
      perPlant: { min: Number, max: Number, average: Number, unit: String },
      perSqm: { min: Number, max: Number, average: Number, unit: String },
    },
    outdoor: {
      perPlant: { min: Number, max: Number, average: Number, unit: String },
      perRai: { min: Number, max: Number, average: Number, unit: String },
    },
  },

  // Root system
  rootDepth: {
    type: String,
    enum: ['shallow', 'medium', 'deep'],
  },
  rootSpread: {
    type: String,
    enum: ['narrow', 'medium', 'wide'],
  },
});

const EnvironmentalToleranceSchema = new mongoose.Schema({
  temperature: {
    coldTolerance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    heatTolerance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    minTemp: Number, // °C
    maxTemp: Number, // °C
    optimalTemp: Number, // °C
  },
  humidity: {
    moldResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    budRotResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    optimalHumidity: Number, // %
  },
  water: {
    droughtTolerance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    overWateringTolerance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    waterRequirement: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
  },
  pests: {
    spiderMiteResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    aphidResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    generalPestResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
  },
  diseases: {
    powderyMildewResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    botrytisResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    rootRotResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
    generalDiseaseResistance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
  },
  nutrient: {
    feedingRequirement: {
      type: String,
      enum: ['very_light', 'light', 'medium', 'heavy', 'very_heavy'],
    },
    nutrientBurnSensitivity: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
  },
});

const RegionalPerformanceSchema = new mongoose.Schema({
  region: {
    type: String,
    enum: ['north', 'northeast', 'central', 'east', 'west', 'south'],
    required: true,
  },
  provinces: [String], // Thai provinces where tested
  performanceRating: {
    type: Number,
    min: 0,
    max: 10,
  },
  averageYield: {
    value: Number,
    unit: String,
  },
  successRate: Number, // %
  commonChallenges: [String],
  commonChallengesThai: [String],
  recommendations: [String],
  recommendationsThai: [String],
  bestPlantingMonths: [Number], // 1-12
  harvestMonths: [Number], // 1-12
  numberOfTrials: Number, // How many farms tested this
  dataQuality: {
    type: String,
    enum: ['estimated', 'limited', 'moderate', 'comprehensive'],
  },
});

const PlantCultivarSchema = new mongoose.Schema(
  {
    // === Basic Information ===
    cultivarId: {
      type: String,
      required: true,
      unique: true,
      // e.g., "cannabis-cv-001", "turmeric-cv-001"
    },

    plantCatalog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlantCatalog',
      required: true,
    },

    plantType: {
      type: String,
      required: true,
      enum: ['cannabis', 'turmeric', 'ginger', 'black_galingale', 'plai', 'kratom'],
    },

    isPrimaryPlant: {
      type: Boolean,
      default: false,
      // Cannabis cultivars should be TRUE
    },

    // === Names ===
    name: {
      common: {
        type: String,
        required: true,
        // e.g., "Northern Lights", "Chiang Mai Turmeric"
      },
      thai: String,
      scientific: String,
      aliases: [String], // Other names this cultivar is known by
    },

    // === Cannabis-Specific Classification ===
    cannabisType: {
      genetics: {
        type: String,
        enum: [
          'indica',
          'sativa',
          'hybrid',
          'indica_dominant',
          'sativa_dominant',
          'balanced_hybrid',
          'ruderalis',
          'hemp',
          null,
        ],
      },
      generation: String, // e.g., "F1", "IBL", "S1"
      lineage: {
        parent1: String,
        parent2: String,
        breeder: String,
      },
      purpose: {
        type: String,
        enum: [
          'medical',
          'recreational',
          'industrial_hemp',
          'fiber',
          'seed',
          'cbd',
          'research',
          null,
        ],
      },
    },

    // === Chemical Profile ===
    chemicalProfile: ChemicalProfileSchema,

    // === GACP & Legal Compliance ===
    legalStatus: {
      thaiLegal: {
        type: Boolean,
        default: false,
      },
      thcCompliant: {
        type: Boolean,
        default: false,
        // TRUE if THC < 0.2% (hemp) or approved for medical use
      },
      requiresLicense: {
        type: Boolean,
        default: true,
      },
      licenseCategory: {
        type: String,
        enum: ['medical', 'industrial_hemp', 'research', 'traditional_medicine', null],
      },
      gacpCertifiable: {
        type: Boolean,
        default: true,
      },
      notes: String,
      notesThai: String,
    },

    // === Growing Characteristics ===
    growingCharacteristics: GrowingCharacteristicsSchema,

    // === Environmental Tolerances ===
    environmentalTolerance: EnvironmentalToleranceSchema,

    // === Difficulty & Experience ===
    cultivationDifficulty: {
      overall: {
        type: String,
        enum: ['beginner', 'easy', 'moderate', 'difficult', 'expert'],
        required: true,
      },
      indoorDifficulty: {
        type: String,
        enum: ['beginner', 'easy', 'moderate', 'difficult', 'expert'],
      },
      outdoorDifficulty: {
        type: String,
        enum: ['beginner', 'easy', 'moderate', 'difficult', 'expert'],
      },
      reasons: [String],
      reasonsThai: [String],
    },

    // === Regional Performance ===
    regionalPerformance: [RegionalPerformanceSchema],

    // === Best Use Cases ===
    bestFor: {
      climates: [
        {
          type: String,
          enum: ['tropical', 'subtropical', 'temperate', 'arid', 'humid'],
        },
      ],
      growingMethods: [
        {
          type: String,
          enum: [
            'outdoor',
            'indoor',
            'greenhouse',
            'hydroponic',
            'soil',
            'coco',
            'organic',
            'raised_bed',
          ],
        },
      ],
      farmerTypes: [
        {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'commercial', 'home_grower'],
        },
      ],
      purposes: [String], // e.g., ["high yield", "quality", "resilience", "medical"]
    },

    // === Advantages & Disadvantages ===
    advantages: [
      {
        advantage: String,
        advantageThai: String,
        importance: {
          type: String,
          enum: ['minor', 'moderate', 'major', 'critical'],
        },
      },
    ],

    disadvantages: [
      {
        disadvantage: String,
        disadvantageThai: String,
        severity: {
          type: String,
          enum: ['minor', 'moderate', 'major', 'critical'],
        },
        mitigation: String,
        mitigationThai: String,
      },
    ],

    // === Awards & Recognition ===
    awards: [
      {
        awardName: String,
        year: Number,
        organization: String,
        category: String,
      },
    ],

    // === Breeder Information ===
    breeder: {
      name: String,
      country: String,
      website: String,
      reputation: {
        type: String,
        enum: ['unknown', 'emerging', 'established', 'renowned', 'legendary'],
      },
    },

    // === Availability ===
    availability: {
      inThailand: {
        type: Boolean,
        default: false,
      },
      suppliers: [
        {
          name: String,
          location: String,
          contact: String,
          verified: Boolean,
        },
      ],
      seedAvailability: {
        type: String,
        enum: ['unavailable', 'rare', 'limited', 'available', 'common'],
      },
      cloneAvailability: {
        type: String,
        enum: ['unavailable', 'rare', 'limited', 'available', 'common'],
      },
      estimatedCost: {
        seeds: { value: Number, unit: String },
        clones: { value: Number, unit: String },
        currency: { type: String, default: 'THB' },
      },
    },

    // === Market Information ===
    marketData: {
      demand: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
      priceRange: {
        min: Number,
        max: Number,
        average: Number,
        unit: { type: String, default: 'THB/kg' },
      },
      targetBuyers: [String], // e.g., ["medical", "pharmaceutical", "export"]
      seasonalDemand: [
        {
          month: Number,
          demandLevel: {
            type: String,
            enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
          },
        },
      ],
    },

    // === AI/ML Features ===
    mlFeatures: {
      overallSuccessScore: Number, // 0-100
      recommendationScore: Number, // 0-100, how often AI recommends this
      userSatisfaction: Number, // 0-100, based on farmer feedback
      commonFailureReasons: [String],
      successFactors: [String],
      typicalIssues: [
        {
          issue: String,
          frequency: {
            type: String,
            enum: ['rare', 'occasional', 'common', 'frequent'],
          },
          resolution: String,
        },
      ],
    },

    // === User Ratings & Reviews ===
    ratings: {
      overall: Number, // 0-5
      easeOfGrowth: Number,
      yield: Number,
      quality: Number,
      resilience: Number,
      numberOfRatings: { type: Number, default: 0 },
    },

    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        farmId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Farm',
        },
        rating: Number,
        review: String,
        region: String,
        growingMethod: String,
        verified: Boolean, // Verified purchase/cultivation
        helpful: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // === Growing Tips ===
    growingTips: [
      {
        category: {
          type: String,
          enum: [
            'general',
            'watering',
            'feeding',
            'training',
            'pest_control',
            'harvesting',
            'curing',
          ],
        },
        tip: String,
        tipThai: String,
        importance: {
          type: String,
          enum: ['nice_to_know', 'recommended', 'important', 'critical'],
        },
        source: String, // Who provided this tip
      },
    ],

    // === Images & Media ===
    images: [
      {
        url: String,
        caption: String,
        captionThai: String,
        stage: String, // Growth stage this image represents
        isPrimary: Boolean,
        uploadedBy: String,
      },
    ],

    // === References ===
    references: {
      seedBankLinks: [String],
      growReports: [String],
      labTests: [
        {
          lab: String,
          date: Date,
          results: String,
          url: String,
        },
      ],
    },

    // === Status & Metadata ===
    status: {
      type: String,
      enum: ['active', 'testing', 'discontinued', 'research'],
      default: 'active',
    },

    featured: {
      type: Boolean,
      default: false,
    },

    verified: {
      type: Boolean,
      default: false,
      // TRUE if cultivar information has been verified by experts
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
PlantCultivarSchema.index({ plantType: 1, isPrimaryPlant: -1 });
PlantCultivarSchema.index({ 'regionalPerformance.region': 1 });
PlantCultivarSchema.index({ status: 1, featured: -1 });
PlantCultivarSchema.index({ 'legalStatus.thaiLegal': 1, 'legalStatus.thcCompliant': 1 });
PlantCultivarSchema.index({ 'cultivationDifficulty.overall': 1 });
PlantCultivarSchema.index({ 'ratings.overall': -1 });

// === Static Methods ===

/**
 * Get featured cultivars for a specific plant type
 */
PlantCultivarSchema.statics.getFeaturedCultivars = function (plantType = 'cannabis') {
  return this.find({
    plantType,
    featured: true,
    status: 'active',
  }).sort({ 'ratings.overall': -1 });
};

/**
 * Get cultivars suitable for beginners
 */
PlantCultivarSchema.statics.getBeginnerFriendly = function (plantType = 'cannabis') {
  return this.find({
    plantType,
    status: 'active',
    'cultivationDifficulty.overall': { $in: ['beginner', 'easy'] },
  }).sort({ 'ratings.overall': -1 });
};

/**
 * Get cultivars by region
 */
PlantCultivarSchema.statics.getByRegion = function (region, plantType = 'cannabis') {
  return this.find({
    plantType,
    status: 'active',
    'regionalPerformance.region': region,
  }).sort({ 'regionalPerformance.performanceRating': -1 });
};

/**
 * Get Thai-legal cultivars
 */
PlantCultivarSchema.statics.getThaiLegal = function (plantType = 'cannabis') {
  return this.find({
    plantType,
    status: 'active',
    'legalStatus.thaiLegal': true,
    'legalStatus.thcCompliant': true,
  });
};

/**
 * Get high-yield cultivars
 */
PlantCultivarSchema.statics.getHighYield = function (
  plantType = 'cannabis',
  growingMethod = 'outdoor',
) {
  const sortField =
    growingMethod === 'indoor'
      ? 'growingCharacteristics.yieldPotential.indoor.perSqm.average'
      : 'growingCharacteristics.yieldPotential.outdoor.perRai.average';

  return this.find({
    plantType,
    status: 'active',
  }).sort({ [sortField]: -1 });
};

/**
 * Search cultivars
 */
PlantCultivarSchema.statics.searchCultivars = function (query) {
  return this.find({
    $or: [
      { 'name.common': new RegExp(query, 'i') },
      { 'name.thai': new RegExp(query, 'i') },
      { 'name.aliases': new RegExp(query, 'i') },
    ],
    status: 'active',
  });
};

// === Instance Methods ===

/**
 * Get suitability score for given conditions
 */
PlantCultivarSchema.methods.getSuitabilityScore = function (conditions) {
  const { region, growingMethod, experienceLevel, goals: _goals } = conditions;
  let score = 100;
  const reasons = [];

  // Check region
  if (region) {
    const regionData = this.regionalPerformance.find(r => r.region === region);
    if (regionData) {
      score = (score + regionData.performanceRating * 10) / 2;
    } else {
      score -= 20;
      reasons.push('No regional performance data available');
    }
  }

  // Check growing method
  if (growingMethod && !this.bestFor.growingMethods.includes(growingMethod)) {
    score -= 15;
    reasons.push(`Not optimized for ${growingMethod}`);
  }

  // Check experience level
  if (experienceLevel) {
    const difficultyMap = { beginner: 1, easy: 2, moderate: 3, difficult: 4, expert: 5 };
    const experienceMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 5 };

    const requiredLevel = difficultyMap[this.cultivationDifficulty.overall] || 3;
    const farmerLevel = experienceMap[experienceLevel] || 2;

    if (farmerLevel < requiredLevel) {
      score -= (requiredLevel - farmerLevel) * 15;
      reasons.push('May be too challenging for experience level');
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
    recommendation:
      score >= 80
        ? 'Highly Recommended'
        : score >= 60
          ? 'Recommended'
          : score >= 40
            ? 'Possible with care'
            : 'Not Recommended',
  };
};

/**
 * Check if cultivar is legal in Thailand
 */
PlantCultivarSchema.methods.isThaiLegal = function () {
  return this.legalStatus.thaiLegal && this.legalStatus.thcCompliant;
};

/**
 * Get regional performance for specific region
 */
PlantCultivarSchema.methods.getRegionalPerformance = function (region) {
  return this.regionalPerformance.find(r => r.region === region) || null;
};

/**
 * Add review
 */
PlantCultivarSchema.methods.addReview = async function (reviewData) {
  this.reviews.push(reviewData);

  // Recalculate ratings
  const reviews = this.reviews.filter(r => r.rating);
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    this.ratings.overall = sum / reviews.length;
    this.ratings.numberOfRatings = reviews.length;
  }

  return this.save();
};

module.exports = mongoose.model('PlantCultivar', PlantCultivarSchema);
