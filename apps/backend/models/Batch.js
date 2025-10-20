const mongoose = require('mongoose');
const crypto = require('crypto');

const ProcessingStepSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'harvesting',
      'washing',
      'sorting',
      'drying',
      'packaging',
      'transport',
      'storage',
      'other',
    ],
    required: true,
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    address: String,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: Date,
  temperature: {
    value: Number,
    unit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'celsius',
    },
  },
  humidity: Number,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  equipment: [String],
  notes: String,
  parameters: {
    // Flexible schema for type-specific parameters
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  images: [
    {
      url: String,
      caption: String,
    },
  ],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
});

const QualityCheckSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  performedAt: {
    type: Date,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  results: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  passed: Boolean,
  notes: String,
  attachments: [
    {
      name: String,
      fileUrl: String,
      type: String,
    },
  ],
});

const BatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    harvestDate: {
      type: Date,
      required: true,
    },
    plot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm.plots',
    },
    quantity: {
      initial: {
        value: Number,
        unit: String,
      },
      current: {
        value: Number,
        unit: String,
      },
    },
    processingSteps: [ProcessingStepSchema],
    qualityChecks: [QualityCheckSchema],
    certifications: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['processing', 'ready', 'shipped', 'delivered', 'rejected'],
      default: 'processing',
    },
    shelfLife: {
      bestBefore: Date,
      expiryDate: Date,
    },
    storageConditions: {
      temperature: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius',
        },
      },
      humidity: {
        min: Number,
        max: Number,
      },
      specialInstructions: String,
    },
    childBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
    parentBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    traceabilityCode: {
      type: String,
      unique: true,
    },
    qrCode: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to generate traceability code if not provided
BatchSchema.pre('save', function (next) {
  if (!this.traceabilityCode) {
    // Format: FARMPREFIX-YYYYMMDD-PRODUCTCODE-RANDOM
    const date = new Date(this.harvestDate);
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();

    // This is simplified - in a real system, you'd fetch proper farm and product codes
    this.traceabilityCode = `F${this.farm}-${datePart}-P${this.product.toString().slice(-4)}-${randomPart}`;
  }

  // Generate QR code URL (in real system, this would create an actual QR code)
  this.qrCode = `https://trace.botanical-audit.org/batch/${this.traceabilityCode}`;

  next();
});

module.exports = mongoose.model('Batch', BatchSchema);
