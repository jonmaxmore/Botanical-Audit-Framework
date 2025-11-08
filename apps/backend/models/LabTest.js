const mongoose = require('mongoose');

/**
 * LabTest Model - ผลการทดสอบในห้องปฏิบัติการ (GACP Critical)
 *
 * Purpose:
 * - บันทึกผลการทดสอบดิน, น้ำ, และผลผลิต
 * - รองรับมาตรฐาน WHO GACP, GMP
 * - ติดตามความปลอดภัยและคุณภาพผลิตภัณฑ์
 *
 * GACP Requirements:
 * - WHO GACP Guidelines 3.2 (Soil & Water Quality)
 * - WHO GACP Guidelines 4.4 (Product Testing)
 * - GMP Annex 11 (Quality Control)
 * - 5-year data retention
 */

// === Sub-Schema: Soil Test (การทดสอบดิน) ===
const SoilTestSchema = new mongoose.Schema(
  {
    // pH Level
    pH: {
      value: {
        type: Number,
        min: 0,
        max: 14,
        required: true,
      },
      status: {
        type: String,
        enum: ['pass', 'fail', 'warning'],
        default: 'pass',
      },
      referenceRange: {
        min: Number,
        max: Number,
      },
    },

    // Heavy Metals (โลหะหนัก - mg/kg)
    heavyMetals: {
      lead: {
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 100 }, // WHO limit
      },
      cadmium: {
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 3 },
      },
      mercury: {
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 1 },
      },
      arsenic: {
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 20 },
      },
    },

    // NPK (ธาตุอาหารหลัก)
    npk: {
      nitrogen: { type: Number }, // N (%)
      phosphorus: { type: Number }, // P (%)
      potassium: { type: Number }, // K (%)
    },

    // Organic Matter (อินทรียวัตถุ - %)
    organicMatter: {
      value: Number,
      status: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
      },
    },

    // Other Parameters
    electricalConductivity: Number, // EC (mS/cm)
    cationExchangeCapacity: Number, // CEC (cmol/kg)
    texture: {
      type: String,
      enum: ['clay', 'loam', 'sand', 'silt', 'mixed'],
    },
    notes: String,
  },
  { _id: false },
);

// === Sub-Schema: Water Test (การทดสอบน้ำ) ===
const WaterTestSchema = new mongoose.Schema(
  {
    // pH Level
    pH: {
      value: {
        type: Number,
        min: 0,
        max: 14,
        required: true,
      },
      status: {
        type: String,
        enum: ['pass', 'fail', 'warning'],
        default: 'pass',
      },
      referenceRange: {
        min: { type: Number, default: 6.5 },
        max: { type: Number, default: 8.5 },
      },
    },

    // Heavy Metals (mg/L)
    heavyMetals: {
      lead: {
        value: Number,
        unit: { type: String, default: 'mg/L' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 0.01 },
      },
      cadmium: {
        value: Number,
        unit: { type: String, default: 'mg/L' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 0.003 },
      },
      mercury: {
        value: Number,
        unit: { type: String, default: 'mg/L' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 0.001 },
      },
      arsenic: {
        value: Number,
        unit: { type: String, default: 'mg/L' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 0.01 },
      },
    },

    // Microbiological (จุลินทรีย์)
    eColi: {
      value: Number, // CFU/100mL
      unit: { type: String, default: 'CFU/100mL' },
      status: { type: String, enum: ['pass', 'fail', 'warning'] },
      limit: { type: Number, default: 0 }, // No E. coli allowed
    },
    totalColiform: {
      value: Number,
      unit: { type: String, default: 'CFU/100mL' },
      status: { type: String, enum: ['pass', 'fail', 'warning'] },
    },

    // Physical Parameters
    turbidity: {
      value: Number, // NTU
      unit: { type: String, default: 'NTU' },
      status: { type: String, enum: ['pass', 'fail', 'warning'] },
      limit: { type: Number, default: 5 },
    },
    totalDissolvedSolids: {
      value: Number, // TDS (mg/L)
      unit: { type: String, default: 'mg/L' },
    },
    electricalConductivity: Number, // EC (µS/cm)

    // Chemical Parameters
    chlorine: Number, // mg/L
    nitrate: Number, // mg/L
    sulfate: Number, // mg/L

    notes: String,
  },
  { _id: false },
);

// === Sub-Schema: Product Test (การทดสอบผลผลิต) ===
const ProductTestSchema = new mongoose.Schema(
  {
    // Pesticide Residues (สารตกค้างจากยาฆ่าแมลง - mg/kg)
    pesticideResidues: [
      {
        name: String, // ชื่อสารเคมี
        casNumber: String, // CAS Registry Number
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: Number, // MRL (Maximum Residue Limit)
        method: String, // วิธีวิเคราะห์ (e.g., GC-MS, LC-MS)
      },
    ],

    // Heavy Metals in Product (mg/kg)
    heavyMetals: {
      lead: {
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 10 },
      },
      cadmium: {
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 0.3 },
      },
      mercury: {
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 0.1 },
      },
      arsenic: {
        value: Number,
        unit: { type: String, default: 'mg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 5 },
      },
    },

    // Microbial Contamination (การปนเปื้อนจุลินทรีย์)
    microbial: {
      totalPlateCount: {
        value: Number, // CFU/g
        unit: { type: String, default: 'CFU/g' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: Number,
      },
      yeastMold: {
        value: Number, // CFU/g
        unit: { type: String, default: 'CFU/g' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: Number,
      },
      eColi: {
        value: Number,
        unit: { type: String, default: 'CFU/g' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 0 },
      },
      salmonella: {
        detected: Boolean,
        status: { type: String, enum: ['pass', 'fail'], default: 'pass' },
      },
      staphylococcus: {
        value: Number,
        unit: { type: String, default: 'CFU/g' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
      },
    },

    // Mycotoxins (สารพิษจากเชื้อรา - µg/kg)
    mycotoxins: {
      aflatoxinB1: {
        value: Number,
        unit: { type: String, default: 'µg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 5 },
      },
      totalAflatoxins: {
        value: Number,
        unit: { type: String, default: 'µg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
        limit: { type: Number, default: 10 },
      },
      ochratoxinA: {
        value: Number,
        unit: { type: String, default: 'µg/kg' },
        status: { type: String, enum: ['pass', 'fail', 'warning'] },
      },
    },

    // Moisture Content (ความชื้น - %)
    moistureContent: {
      value: Number,
      status: { type: String, enum: ['pass', 'fail', 'warning'] },
      limit: Number,
    },

    // Active Compounds (สารสำคัญ - สำหรับสมุนไพร)
    activeCompounds: [
      {
        name: String,
        value: Number,
        unit: String,
        method: String,
      },
    ],

    notes: String,
  },
  { _id: false },
);

// === Main LabTest Schema ===
const LabTestSchema = new mongoose.Schema(
  {
    // === Test Identification ===
    testCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // === References ===
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    harvestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Harvest',
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      index: true,
    },

    // === Test Type ===
    testType: {
      type: String,
      enum: ['soil', 'water', 'product'],
      required: true,
      index: true,
    },

    // === Test Data (conditional based on testType) ===
    soilTest: {
      type: SoilTestSchema,
      default: undefined,
    },
    waterTest: {
      type: WaterTestSchema,
      default: undefined,
    },
    productTest: {
      type: ProductTestSchema,
      default: undefined,
    },

    // === Test Details ===
    testDate: {
      type: Date,
      required: true,
      index: true,
    },
    sampleCollectionDate: {
      type: Date,
      required: true,
    },
    sampleCollectionLocation: {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    sampleId: String, // Lab's internal sample ID

    // === Laboratory Info ===
    labName: {
      type: String,
      required: true,
    },
    labLicenseNumber: String,
    labAccreditation: {
      type: String,
      enum: ['ISO17025', 'GLP', 'other', 'none'],
      default: 'none',
    },
    testMethod: String, // e.g., "AOAC 2015.01", "EPA 3051A"
    analyst: String,

    // === Report ===
    reportNumber: {
      type: String,
      required: true,
      unique: true,
    },
    reportFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    reportIssuedDate: Date,

    // === Overall Result ===
    overallResult: {
      type: String,
      enum: ['pass', 'fail', 'conditional', 'pending'],
      required: true,
      default: 'pending',
      index: true,
    },

    // === GACP Compliance ===
    gacpCompliant: {
      type: Boolean,
      default: false,
      index: true,
    },
    complianceNotes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewDate: Date,

    // === Recommendations ===
    recommendations: [String],
    correctiveActions: [
      {
        action: String,
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
        },
        deadline: Date,
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending',
        },
      },
    ],

    // === Status & Metadata ===
    status: {
      type: String,
      enum: ['draft', 'submitted', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    notes: String,

    // Soft Delete (5-year retention)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: 'labtests',
  },
);

// ============================================
// INDEXES
// ============================================
LabTestSchema.index({ testCode: 1 }, { unique: true });
LabTestSchema.index({ farmId: 1, testDate: -1 });
LabTestSchema.index({ testType: 1, gacpCompliant: 1 });
LabTestSchema.index({ overallResult: 1, status: 1 });
LabTestSchema.index({ isDeleted: 1 });

// ============================================
// METHODS
// ============================================

/**
 * Generate Test Code (LAB-YYYY-NNNN)
 */
LabTestSchema.statics.generateTestCode = async function (year) {
  const currentYear = year || new Date().getFullYear();
  const prefix = `LAB-${currentYear}-`;

  const lastTest = await this.findOne({
    testCode: new RegExp(`^${prefix}`),
  })
    .sort({ testCode: -1 })
    .select('testCode')
    .lean();

  let nextNumber = 1;
  if (lastTest) {
    const lastNumber = parseInt(lastTest.testCode.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}${paddedNumber}`;
};

/**
 * Calculate overall pass/fail based on sub-tests
 */
LabTestSchema.methods.calculateOverallResult = function () {
  let hasFailures = false;

  // Check soil test
  if (this.testType === 'soil' && this.soilTest) {
    const { pH, heavyMetals } = this.soilTest;
    if (pH?.status === 'fail') {
      hasFailures = true;
    }
    if (
      heavyMetals?.lead?.status === 'fail' ||
      heavyMetals?.cadmium?.status === 'fail' ||
      heavyMetals?.mercury?.status === 'fail' ||
      heavyMetals?.arsenic?.status === 'fail'
    ) {
      hasFailures = true;
    }
  }

  // Check water test
  if (this.testType === 'water' && this.waterTest) {
    const { pH, heavyMetals, eColi } = this.waterTest;
    if (pH?.status === 'fail') {
      hasFailures = true;
    }
    if (
      heavyMetals?.lead?.status === 'fail' ||
      heavyMetals?.cadmium?.status === 'fail' ||
      heavyMetals?.mercury?.status === 'fail' ||
      heavyMetals?.arsenic?.status === 'fail'
    ) {
      hasFailures = true;
    }
    if (eColi?.status === 'fail') {
      hasFailures = true;
    }
  }

  // Check product test
  if (this.testType === 'product' && this.productTest) {
    const { pesticideResidues, heavyMetals, microbial } = this.productTest;
    if (pesticideResidues?.some(p => p.status === 'fail')) {
      hasFailures = true;
    }
    if (
      heavyMetals?.lead?.status === 'fail' ||
      heavyMetals?.cadmium?.status === 'fail' ||
      heavyMetals?.mercury?.status === 'fail' ||
      heavyMetals?.arsenic?.status === 'fail'
    ) {
      hasFailures = true;
    }
    if (microbial?.eColi?.status === 'fail' || microbial?.salmonella?.status === 'fail') {
      hasFailures = true;
    }
  }

  this.overallResult = hasFailures ? 'fail' : 'pass';
  this.gacpCompliant = !hasFailures;
  return this.overallResult;
};

/**
 * Soft delete (5-year retention)
 */
LabTestSchema.methods.softDelete = function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

/**
 * Link to harvest/batch
 */
LabTestSchema.methods.linkToHarvest = function (harvestId) {
  this.harvestId = harvestId;
  return this.save();
};

LabTestSchema.methods.linkToBatch = function (batchId) {
  this.batchId = batchId;
  return this.save();
};

// ============================================
// MIDDLEWARE
// ============================================

// Auto-generate testCode if not provided
LabTestSchema.pre('save', async function () {
  if (this.isNew && !this.testCode) {
    this.testCode = await this.constructor.generateTestCode();
  }
});

// Validate that correct test data exists for testType
LabTestSchema.pre('save', function () {
  if (this.testType === 'soil' && !this.soilTest) {
    throw new Error('soilTest data required for testType "soil"');
  }
  if (this.testType === 'water' && !this.waterTest) {
    throw new Error('waterTest data required for testType "water"');
  }
  if (this.testType === 'product' && !this.productTest) {
    throw new Error('productTest data required for testType "product"');
  }
});

// Prevent hard delete
LabTestSchema.pre('deleteOne', { document: true, query: false }, function () {
  throw new Error(
    'Hard delete not allowed. Use softDelete() method instead for 5-year retention compliance.',
  );
});

// ============================================
// EXPORT
// ============================================
module.exports = mongoose.model('LabTest', LabTestSchema);
