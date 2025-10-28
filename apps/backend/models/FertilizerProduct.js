const mongoose = require('mongoose');

/**
 * FertilizerProduct Model
 *
 * ฐานข้อมูลผลิตภัณฑ์ปุ๋ยที่ได้รับการจดทะเบียนถูกต้องตามกฎหมายไทย
 * และผ่านมาตรฐาน GACP จาก DTAM (กรมแพทย์แผนไทยและการแพทย์ทางเลือก)
 *
 * GACP COMPLIANCE REQUIREMENTS:
 * 1. ✅ ปุ๋ยต้องจดทะเบียนถูกกฎหมาย (มีเลข ปอ.1)
 * 2. ✅ ห้ามใช้มูลมนุษย์ (Human excretion)
 * 3. ✅ ปุ๋ยอินทรีย์ต้องหมักสุกสมบูรณ์
 * 4. ✅ ต้องมีข้อมูลแหล่งที่มาและวิธีการผลิตชัดเจน
 * 5. ✅ ต้องไม่ทำให้เกิดการปนเปื้อนในผลผลิต
 *
 * ใช้สำหรับ:
 * - AI Fertilizer Recommendation Engine
 * - GACP Compliance Tracking
 * - Cost Optimization
 * - Audit Trail
 */

const NutrientContentSchema = new mongoose.Schema({
  // Primary Macronutrients (NPK)
  nitrogen: {
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    form: {
      type: String,
      enum: [
        'nitrate', // NO3 (เร็ว)
        'ammonium', // NH4 (ช้า)
        'urea', // CO(NH2)2 (ปานกลาง)
        'organic', // จากอินทรีย์
        'mixed', // ผสม
      ],
    },
    releaseRate: {
      type: String,
      enum: ['immediate', 'slow', 'controlled', 'mixed'],
    },
  },
  phosphorus: {
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    form: String, // e.g., "P2O5", "rock phosphate"
    availability: {
      type: String,
      enum: ['high', 'medium', 'low'],
    },
  },
  potassium: {
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    form: String, // e.g., "K2O", "potassium sulfate"
  },

  // Secondary Macronutrients
  calcium: {
    percentage: Number,
    form: String,
  },
  magnesium: {
    percentage: Number,
    form: String,
  },
  sulfur: {
    percentage: Number,
    form: String,
  },

  // Micronutrients
  micronutrients: [
    {
      element: {
        type: String,
        enum: ['iron', 'zinc', 'manganese', 'copper', 'boron', 'molybdenum', 'chlorine'],
      },
      elementSymbol: String, // Fe, Zn, Mn, Cu, B, Mo, Cl
      percentage: Number,
      ppm: Number, // parts per million
      form: String, // e.g., "chelated", "sulfate"
      elementThai: String,
    },
  ],

  // Other beneficial ingredients
  organicMatter: {
    percentage: Number,
    source: String, // e.g., "compost", "manure", "seaweed"
  },
  beneficialMicroorganisms: [
    {
      type: String, // e.g., "mycorrhizae", "trichoderma"
      concentration: String,
    },
  ],
  aminoAcids: {
    percentage: Number,
    types: [String],
  },
  humic_fulvic_acids: {
    percentage: Number,
  },
});

const ApplicationGuidelinesSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: [
      'soil_application', // ใส่ลงดิน
      'foliar_spray', // พ่นทางใบ
      'fertigation', // ผสมน้ำรดพืช
      'top_dressing', // โรยหน้าดิน
      'broadcasting', // หว่านกระจาย
      'band_placement', // ใส่เป็นแถว
      'mixed', // หลายวิธี
    ],
  },
  methodThai: String,

  // Application rates by growth stage
  vegetativeStage: {
    rate: String, // e.g., "50-100 g/plant/week"
    ratePerRai: String, // e.g., "10-20 kg/rai"
    frequency: String, // e.g., "weekly", "every 2 weeks"
    dilution: String, // For liquid fertilizers: "1:100"
    notes: String,
    notesThai: String,
  },
  floweringStage: {
    rate: String,
    ratePerRai: String,
    frequency: String,
    dilution: String,
    notes: String,
    notesThai: String,
  },
  seedlingStage: {
    rate: String,
    frequency: String,
    dilution: String,
    notes: String,
    notesThai: String,
  },

  // Mixing instructions
  mixingInstructions: {
    waterRatio: String, // For liquid/powder
    mixingOrder: [String], // Order if mixing multiple products
    compatibility: [String], // Compatible products
    incompatible: [String], // Incompatible products
    instructions: String,
    instructionsThai: String,
  },

  // Timing
  bestTimeToApply: {
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'any'],
    },
    weatherConditions: String, // "Avoid rain within 24h"
    temperatureRange: String,
  },

  // Safety
  preharvest_interval: {
    type: Number, // Days before harvest
    required: true,
  },
  safetyPrecautions: [String],
  safetyPrecautionsThai: [String],
  protectiveEquipment: [String],
});

const FertilizerProductSchema = new mongoose.Schema(
  {
    // === Basic Information ===
    productId: {
      type: String,
      required: true,
      unique: true,
      // e.g., "FERT-TH-001"
    },

    productName: {
      type: String,
      required: true,
    },
    productNameThai: String,

    brand: String,
    manufacturer: {
      name: {
        type: String,
        required: true,
      },
      nameThai: String,
      country: String,
      website: String,
      contact: String,
    },

    // === Product Type ===
    type: {
      primary: {
        type: String,
        required: true,
        enum: [
          'chemical', // เคมีสังเคราะห์
          'organic', // อินทรีย์
          'bio_organic', // ชีวภาพอินทรีย์
          'bio_fertilizer', // ชีวภาพ
          'mixed', // ผสม
        ],
      },
      secondary: {
        type: String,
        enum: [
          'liquid', // น้ำ
          'powder', // ผง
          'granular', // เม็ด
          'pellet', // เม็ด
          'slow_release', // ละลายช้า
          'controlled_release', // ควบคุมการละลาย
        ],
      },
    },

    // === Registration & Compliance ===
    registration: {
      // ปอ.1 (Thai Fertilizer Registration)
      registrationNumber: {
        type: String,
        required: true,
        unique: true,
        // e.g., "ปอ.1-12345/2567"
      },
      issuedDate: Date,
      expiryDate: Date,
      issuingAuthority: {
        type: String,
        default: 'กรมวิชาการเกษตร (Department of Agriculture)',
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'suspended', 'cancelled'],
        default: 'active',
      },
    },

    // GACP & Certifications
    compliance: {
      gacpApproved: {
        type: Boolean,
        required: true,
        default: false,
      },
      organicCertified: {
        type: Boolean,
        default: false,
      },
      certifications: [
        {
          name: String,
          nameThai: String,
          issuingBody: String,
          certificateNumber: String,
          issuedDate: Date,
          expiryDate: Date,
          documentUrl: String,
        },
      ],
      // Accepted certifications: Organic Thailand, IFOAM, EU Organic, USDA Organic, etc.
    },

    // Prohibited ingredients check
    prohibited: {
      containsHumanWaste: {
        type: Boolean,
        default: false,
        required: true,
        // MUST be false per GACP
      },
      containsHeavyMetals: {
        type: Boolean,
        default: false,
      },
      containsProhibitedChemicals: {
        type: Boolean,
        default: false,
      },
      notes: String,
    },

    // === NPK & Nutrient Content ===
    npkRatio: {
      type: String,
      required: true,
      // e.g., "20-10-20", "15-15-15", "5-10-10"
    },
    nutrients: NutrientContentSchema,

    // === Recommended Use ===
    recommendedFor: {
      plants: [
        {
          type: String,
          enum: ['cannabis', 'turmeric', 'ginger', 'black_galingale', 'plai', 'kratom', 'all'],
        },
      ],
      growthStages: [
        {
          type: String,
          enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'all'],
        },
      ],
      cultivationMethods: [
        {
          type: String,
          enum: ['soil', 'hydroponic', 'coco', 'soilless', 'organic', 'all'],
        },
      ],
      soilTypes: [
        {
          type: String,
          enum: ['sandy', 'clay', 'loam', 'silt', 'peat', 'all'],
        },
      ],
      soilPHRange: {
        min: Number,
        max: Number,
      },
    },

    // === Application Guidelines ===
    application: ApplicationGuidelinesSchema,

    // === Pricing ===
    pricing: [
      {
        region: {
          type: String,
          enum: ['north', 'northeast', 'central', 'east', 'west', 'south', 'nationwide'],
          default: 'nationwide',
        },
        size: {
          amount: Number,
          unit: {
            type: String,
            enum: ['kg', 'liter', 'gram', 'ml', 'ton'],
          },
        },
        price: {
          amount: Number,
          currency: {
            type: String,
            default: 'THB',
          },
        },
        pricePerUnit: Number, // Calculated: price / size
        bulk_discount: {
          minQuantity: Number,
          discountPercent: Number,
        },
      },
    ],

    // === Availability ===
    availability: {
      inStock: {
        type: Boolean,
        default: true,
      },
      availableRegions: [
        {
          type: String,
          enum: ['north', 'northeast', 'central', 'east', 'west', 'south'],
        },
      ],
      suppliers: [
        {
          name: String,
          nameThai: String,
          type: {
            type: String,
            enum: ['manufacturer', 'distributor', 'retailer', 'online'],
          },
          location: String,
          province: String,
          contact: {
            phone: String,
            email: String,
            website: String,
            line: String,
          },
          verified: Boolean,
        },
      ],
      onlineStores: [
        {
          platform: String, // e.g., "Lazada", "Shopee"
          url: String,
          price: Number,
        },
      ],
    },

    // === Performance Data ===
    performance: {
      effectivenessRating: {
        type: Number,
        min: 0,
        max: 5,
      },
      yieldImpact: {
        averageIncrease: Number, // %
        studiesBased: Number, // number of studies/reports
      },
      userSatisfaction: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
        },
        numberOfReviews: Number,
      },
      environmentalImpact: {
        leachingRisk: {
          type: String,
          enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
        },
        waterPollutionRisk: {
          type: String,
          enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
        },
        carbonFootprint: String,
        sustainabilityScore: Number, // 0-100
      },
    },

    // === Storage & Handling ===
    storage: {
      shelfLife: {
        duration: Number, // months
        conditions: String, // "Cool, dry place"
        conditionsThai: String,
      },
      temperature: {
        min: Number, // °C
        max: Number,
      },
      humidity: {
        max: Number, // %
      },
      packaging: {
        type: String, // "Sealed bag", "Bottle"
        material: String,
        recyclable: Boolean,
      },
      hazards: [
        {
          type: String,
          enum: ['flammable', 'corrosive', 'toxic', 'explosive', 'none'],
        },
      ],
      storageWarnings: [String],
      storageWarningsThai: [String],
    },

    // === User Reviews ===
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
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        plantUsedOn: String,
        resultsObserved: String,
        wouldRecommend: Boolean,
        verified: Boolean, // Verified purchase
        helpful: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // === Images & Documents ===
    media: {
      productImage: String,
      labelImage: String,
      certificationDocs: [String],
      msdsDocument: String, // Material Safety Data Sheet
      technicalDatasheet: String,
    },

    // === AI/ML Features ===
    mlFeatures: {
      recommendationScore: Number, // 0-100 (how often recommended by AI)
      successRate: Number, // % of successful uses
      costEffectivenessScore: Number, // 0-100
      popularityScore: Number, // Based on usage
      seasonalDemand: [
        {
          month: Number, // 1-12
          demandLevel: Number, // 0-100
        },
      ],
    },

    // === Status & Metadata ===
    status: {
      type: String,
      enum: ['active', 'discontinued', 'out_of_stock', 'pending_approval'],
      default: 'active',
    },

    featured: {
      type: Boolean,
      default: false,
    },

    verified: {
      type: Boolean,
      default: false,
      // Verified by admin/expert
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

// === Indexes ===
FertilizerProductSchema.index({ npkRatio: 1, 'compliance.gacpApproved': 1 });
FertilizerProductSchema.index({ 'recommendedFor.plants': 1, 'recommendedFor.growthStages': 1 });
FertilizerProductSchema.index({ 'availability.availableRegions': 1 });
FertilizerProductSchema.index({ status: 1, 'compliance.gacpApproved': 1 });
FertilizerProductSchema.index({ 'registration.registrationNumber': 1 });
FertilizerProductSchema.index({ 'performance.userSatisfaction.rating': -1 });

// === Text Search ===
FertilizerProductSchema.index({
  productName: 'text',
  productNameThai: 'text',
  brand: 'text',
});

// === Virtual Fields ===

/**
 * Calculate price per unit
 */
FertilizerProductSchema.virtual('avgPricePerKg').get(function () {
  if (!this.pricing || this.pricing.length === 0) return null;

  const prices = this.pricing.map(p => {
    if (p.size.unit === 'kg') {
      return p.price.amount / p.size.amount;
    } else if (p.size.unit === 'gram') {
      return (p.price.amount / p.size.amount) * 1000;
    }
    return null;
  });

  const validPrices = prices.filter(p => p !== null);
  return validPrices.length > 0 ? validPrices.reduce((a, b) => a + b) / validPrices.length : null;
});

// === Static Methods ===

/**
 * Get GACP-approved fertilizers
 */
FertilizerProductSchema.statics.getGACPApproved = function (filters = {}) {
  return this.find({
    'compliance.gacpApproved': true,
    'registration.status': 'active',
    'prohibited.containsHumanWaste': false,
    status: 'active',
    ...filters,
  });
};

/**
 * Get organic fertilizers
 */
FertilizerProductSchema.statics.getOrganicFertilizers = function (filters = {}) {
  return this.find({
    'compliance.organicCertified': true,
    'type.primary': { $in: ['organic', 'bio_organic', 'bio_fertilizer'] },
    status: 'active',
    ...filters,
  });
};

/**
 * Find by NPK ratio (fuzzy match)
 */
FertilizerProductSchema.statics.findByNPKRatio = function (targetRatio, tolerance = 2) {
  // targetRatio: { N: 20, P: 10, K: 20 }
  return this.find({
    'nutrients.nitrogen.percentage': {
      $gte: targetRatio.N - tolerance,
      $lte: targetRatio.N + tolerance,
    },
    'nutrients.phosphorus.percentage': {
      $gte: targetRatio.P - tolerance,
      $lte: targetRatio.P + tolerance,
    },
    'nutrients.potassium.percentage': {
      $gte: targetRatio.K - tolerance,
      $lte: targetRatio.K + tolerance,
    },
    'compliance.gacpApproved': true,
    status: 'active',
  }).sort({ 'performance.userSatisfaction.rating': -1 });
};

/**
 * Get products for specific growth stage
 */
FertilizerProductSchema.statics.getForGrowthStage = function (
  plantType,
  growthStage,
  region = null,
) {
  const query = {
    'recommendedFor.plants': { $in: [plantType, 'all'] },
    'recommendedFor.growthStages': { $in: [growthStage, 'all'] },
    'compliance.gacpApproved': true,
    status: 'active',
  };

  if (region) {
    query['availability.availableRegions'] = { $in: [region, 'nationwide'] };
  }

  return this.find(query).sort({ 'performance.userSatisfaction.rating': -1 });
};

/**
 * Get top-rated products
 */
FertilizerProductSchema.statics.getTopRated = function (limit = 10) {
  return this.find({
    status: 'active',
    'compliance.gacpApproved': true,
    'performance.userSatisfaction.rating': { $gte: 4.0 },
  })
    .sort({ 'performance.userSatisfaction.rating': -1 })
    .limit(limit);
};

/**
 * Search products
 */
FertilizerProductSchema.statics.searchProducts = function (query) {
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

// === Instance Methods ===

/**
 * Check if product is GACP compliant
 */
FertilizerProductSchema.methods.isGACPCompliant = function () {
  return (
    this.compliance.gacpApproved &&
    this.registration.status === 'active' &&
    !this.prohibited.containsHumanWaste &&
    !this.prohibited.containsProhibitedChemicals
  );
};

/**
 * Get price for specific region and size
 */
FertilizerProductSchema.methods.getPriceForRegion = function (region, size = null) {
  let prices = this.pricing.filter(p => p.region === region || p.region === 'nationwide');

  if (size) {
    prices = prices.filter(p => p.size.amount === size.amount && p.size.unit === size.unit);
  }

  return prices.length > 0 ? prices[0] : null;
};

/**
 * Calculate application cost
 */
FertilizerProductSchema.methods.calculateCost = function (farmSize, growthStage, region = null) {
  const price = this.getPriceForRegion(region || 'nationwide');
  if (!price) return null;

  const applicationRate = this.application[`${growthStage}Stage`];
  if (!applicationRate) return null;

  // Parse rate (e.g., "10-20 kg/rai" -> extract average)
  // This is simplified - production code would need robust parsing
  const rateMatch = applicationRate.ratePerRai?.match(/(\d+)-?(\d*)/);
  if (!rateMatch) return null;

  const minRate = parseInt(rateMatch[1]);
  const maxRate = rateMatch[2] ? parseInt(rateMatch[2]) : minRate;
  const avgRate = (minRate + maxRate) / 2;

  const totalNeeded = avgRate * farmSize; // kg
  const cost = (totalNeeded / price.size.amount) * price.price.amount;

  return {
    totalNeeded,
    unit: 'kg',
    cost,
    currency: 'THB',
    pricePerUnit: price.pricePerUnit,
  };
};

/**
 * Add review
 */
FertilizerProductSchema.methods.addReview = async function (reviewData) {
  this.reviews.push(reviewData);

  // Recalculate rating
  const reviews = this.reviews.filter(r => r.rating);
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    this.performance.userSatisfaction.rating = sum / reviews.length;
    this.performance.userSatisfaction.numberOfReviews = reviews.length;
  }

  return this.save();
};

/**
 * Check availability in region
 */
FertilizerProductSchema.methods.isAvailableInRegion = function (region) {
  return (
    this.availability.availableRegions.includes(region) ||
    this.availability.availableRegions.includes('nationwide')
  );
};

module.exports = mongoose.model('FertilizerProduct', FertilizerProductSchema);
