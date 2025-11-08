const mongoose = require('mongoose');

/**
 * Harvest Model - บันทึกการเก็บเกี่ยว (GACP Critical)
 *
 * Purpose:
 * - ติดตาม Lot Number (PT27-YYYY-NNN) สำหรับ Traceability
 * - บันทึกข้อมูลการเก็บเกี่ยวแต่ละครั้ง
 * - เชื่อมโยง Farm → Plot → Crop → Harvest → Batch
 * - รองรับ Chain of Custody (CoC) ตาม GACP
 *
 * GACP Requirements:
 * - WHO GACP Guidelines 4.1-4.3 (Harvesting)
 * - GMP Annex 11 (Traceability)
 * - 5-year data retention
 */

// Sub-schema: Chain of Custody (การถ่ายโอนความรับผิดชอบ)
const ChainOfCustodySchema = new mongoose.Schema(
  {
    transferredFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transferredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transferDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    location: {
      name: String, // ชื่อสถานที่ (e.g., "โรงคัดแยก", "โรงเก็บ")
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true,
    },
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius',
      },
    },
    humidity: Number, // %
    notes: String,
    signature: String, // Digital signature hash
    witnessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: true, timestamps: true },
);

// Main Harvest Schema
const HarvestSchema = new mongoose.Schema(
  {
    // === Traceability (ตามย้อยกลับได้) ===
    lotNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^PT27-\d{4}-\d{3,4}$/, // Format: PT27-YYYY-NNN or PT27-YYYY-NNNN
      index: true,
    },

    // === References (อ้างอิง) ===
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    plotId: {
      type: String, // Plot name/ID within the farm
      required: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // === Harvest Details (รายละเอียดการเก็บเกี่ยว) ===
    harvestDate: {
      type: Date,
      required: true,
      index: true,
    },
    harvestSeason: {
      type: String,
      enum: ['rainy', 'winter', 'summer', 'year-round'],
      default: 'rainy',
    },
    quantity: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        enum: ['kg', 'ton', 'piece', 'bunch'],
        default: 'kg',
      },
    },

    // === Quality Assessment (การประเมินคุณภาพ) ===
    quality: {
      grade: {
        type: String,
        enum: ['A', 'B', 'C', 'reject'],
        default: 'B',
      },
      appearance: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
      },
      moistureContent: Number, // %
      contaminationLevel: {
        type: String,
        enum: ['none', 'low', 'medium', 'high'],
        default: 'none',
      },
      damagePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      notes: String,
    },

    // === Weather Conditions (สภาพอากาศ) ===
    weather: {
      temperature: Number, // Celsius
      humidity: Number, // %
      rainfall: Number, // mm
      conditions: {
        type: String,
        enum: ['sunny', 'cloudy', 'rainy', 'stormy'],
      },
    },

    // === Labor & Equipment (แรงงานและอุปกรณ์) ===
    harvestedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    equipment: [
      {
        name: String,
        type: String,
        serialNumber: String,
      },
    ],
    laborHours: Number, // Total labor hours

    // === Post-Harvest Handling (การจัดการหลังเก็บเกี่ยว) ===
    postHarvestTreatment: {
      washing: {
        type: Boolean,
        default: false,
      },
      sorting: {
        type: Boolean,
        default: false,
      },
      drying: {
        type: Boolean,
        default: false,
      },
      cooling: {
        type: Boolean,
        default: false,
      },
      notes: String,
    },

    // === Storage (การเก็บรักษา) ===
    storage: {
      location: String,
      temperature: Number,
      humidity: Number,
      duration: Number, // hours
      conditions: {
        type: String,
        enum: ['cold', 'ambient', 'controlled'],
      },
    },

    // === Chain of Custody (CoC) ===
    chainOfCustody: [ChainOfCustodySchema],

    // === GACP Compliance (การปฏิบัติตาม GACP) ===
    gacpVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: Date,
    verificationNotes: String,

    // === Linked Records (บันทึกที่เชื่อมโยง) ===
    batchIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
    labTestIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabTest',
      },
    ],
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],

    // === Photos (รูปภาพ) ===
    photos: [
      {
        url: String,
        caption: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // === Status & Metadata ===
    status: {
      type: String,
      enum: ['pending', 'verified', 'processed', 'shipped', 'cancelled'],
      default: 'pending',
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
    collection: 'harvests',
  },
);

// ============================================
// INDEXES (for performance)
// ============================================
HarvestSchema.index({ lotNumber: 1 }, { unique: true });
HarvestSchema.index({ farmId: 1, harvestDate: -1 });
HarvestSchema.index({ farmerId: 1, harvestDate: -1 });
HarvestSchema.index({ cropId: 1 });
HarvestSchema.index({ status: 1, gacpVerified: 1 });
HarvestSchema.index({ isDeleted: 1 });

// ============================================
// METHODS
// ============================================

/**
 * Generate Lot Number (PT27-YYYY-NNN)
 * Format: PT27 (GACP code) + YYYY (year) + NNN (sequential)
 */
HarvestSchema.statics.generateLotNumber = async function (year) {
  const currentYear = year || new Date().getFullYear();
  const prefix = `PT27-${currentYear}-`;

  // Find the last lot number for this year
  const lastHarvest = await this.findOne({
    lotNumber: new RegExp(`^${prefix}`),
  })
    .sort({ lotNumber: -1 })
    .select('lotNumber')
    .lean();

  let nextNumber = 1;
  if (lastHarvest) {
    const lastNumber = parseInt(lastHarvest.lotNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  // Format: PT27-2025-001 (3 digits) or PT27-2025-1001 (4 digits if > 999)
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
};

/**
 * Add Chain of Custody entry
 */
HarvestSchema.methods.addChainOfCustody = function (data) {
  this.chainOfCustody.push(data);
  return this.save();
};

/**
 * Mark as GACP verified
 */
HarvestSchema.methods.markAsVerified = function (verifierId, notes) {
  this.gacpVerified = true;
  this.verifiedBy = verifierId;
  this.verificationDate = new Date();
  this.verificationNotes = notes;
  return this.save();
};

/**
 * Link to Batch
 */
HarvestSchema.methods.linkToBatch = function (batchId) {
  if (!this.batchIds.includes(batchId)) {
    this.batchIds.push(batchId);
  }
  return this.save();
};

/**
 * Soft delete (5-year retention)
 */
HarvestSchema.methods.softDelete = function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

/**
 * Get full traceability path
 */
HarvestSchema.methods.getTraceabilityPath = async function () {
  await this.populate([
    { path: 'farmId', select: 'name farmCode location' },
    { path: 'cropId', select: 'name scientificName' },
    { path: 'farmerId', select: 'name email' },
    { path: 'batchIds', select: 'traceabilityCode qrCode' },
    { path: 'labTestIds', select: 'testType testDate gacpCompliant' },
  ]);

  return {
    lotNumber: this.lotNumber,
    farm: this.farmId,
    plot: this.plotId,
    crop: this.cropId,
    farmer: this.farmerId,
    harvestDate: this.harvestDate,
    quantity: this.quantity,
    batches: this.batchIds,
    labTests: this.labTestIds,
    chainOfCustody: this.chainOfCustody,
    gacpVerified: this.gacpVerified,
  };
};

// ============================================
// VIRTUAL FIELDS
// ============================================

// Calculate age in days
HarvestSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const harvestDate = new Date(this.harvestDate);
  const diff = now - harvestDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Total CoC transfers
HarvestSchema.virtual('totalTransfers').get(function () {
  return this.chainOfCustody.length;
});

// ============================================
// MIDDLEWARE
// ============================================

// Auto-generate lotNumber if not provided
HarvestSchema.pre('save', async function () {
  if (this.isNew && !this.lotNumber) {
    this.lotNumber = await this.constructor.generateLotNumber();
  }
});

// Prevent hard delete (enforce soft delete)
HarvestSchema.pre('deleteOne', { document: true, query: false }, function (_next) {
  throw new Error(
    'Hard delete not allowed. Use softDelete() method instead for 5-year retention compliance.',
  );
});

// ============================================
// EXPORT
// ============================================
module.exports = mongoose.model('Harvest', HarvestSchema);
