/**
 * 📦 Product Model
 * MongoDB schema for tracked products
 */

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    // User and farm
    userId: {
      type: String,
      required: true,
      index: true,
      description: 'Owner user ID',
    },
    farmId: {
      type: String,
      index: true,
      description: 'Associated farm ID',
    },

    // Product identification
    batchCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description: 'Unique batch code (e.g., OR2024-001)',
    },
    productName: {
      type: String,
      required: true,
      description: 'Product name (e.g., Organic Rice)',
    },
    variety: {
      type: String,
      description: 'Product variety (e.g., Jasmine Rice)',
    },

    // Quantity
    quantity: {
      type: Number,
      required: true,
      min: 0,
      description: 'Product quantity',
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'ton', 'gram', 'piece', 'liter'],
      description: 'Quantity unit',
    },

    // Status
    stage: {
      type: String,
      required: true,
      enum: [
        'PLANTING',
        'GROWING',
        'HARVESTING',
        'PROCESSING',
        'PACKAGING',
        'DISTRIBUTION',
        'COMPLETED',
      ],
      default: 'PLANTING',
      index: true,
      description: 'Current stage in supply chain',
    },
    certificationStatus: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'CERTIFIED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
      description: 'Certification status',
    },

    // Certification details
    certification: {
      status: String,
      number: String,
      issuedDate: Date,
      expiryDate: Date,
      authority: String,
      updatedAt: Date,
    },

    // Origin information
    origin: {
      farm: String,
      farmer: String,
      location: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    // Product details
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'Premium', 'Standard'],
      description: 'Quality grade',
    },
    description: {
      type: String,
      description: 'Product description',
    },

    // Metadata
    metadata: {
      createdAt: {
        type: Date,
        default: Date.now,
        index: true,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      createdBy: String,
      updatedBy: String,
    },
  },
  {
    collection: 'products',
    timestamps: false,
  },
);

// Indexes for performance
ProductSchema.index({ userId: 1, stage: 1 });
ProductSchema.index({ userId: 1, certificationStatus: 1 });
ProductSchema.index({ 'metadata.createdAt': -1 });

// Virtual: Check if certified
ProductSchema.virtual('isCertified').get(function () {
  return this.certificationStatus === 'CERTIFIED';
});

// Virtual: Check if expired
ProductSchema.virtual('isExpired').get(function () {
  if (!this.certification || !this.certification.expiryDate) return false;
  return new Date() > new Date(this.certification.expiryDate);
});

// Virtual: Stage progress (0-100%)
ProductSchema.virtual('progress').get(function () {
  const stages = [
    'PLANTING',
    'GROWING',
    'HARVESTING',
    'PROCESSING',
    'PACKAGING',
    'DISTRIBUTION',
    'COMPLETED',
  ];
  const currentIndex = stages.indexOf(this.stage);
  return Math.round((currentIndex / (stages.length - 1)) * 100);
});

// Instance method: Update stage
ProductSchema.methods.updateStage = function (newStage) {
  this.stage = newStage;
  this.metadata.lastUpdated = new Date();
  return this.save();
};

// Instance method: Update certification
ProductSchema.methods.updateCertification = function (certData) {
  this.certificationStatus = certData.status;
  this.certification = {
    ...this.certification,
    ...certData,
    updatedAt: new Date(),
  };
  this.metadata.lastUpdated = new Date();
  return this.save();
};

// Static method: Find by batch code
ProductSchema.statics.findByBatchCode = function (batchCode) {
  return this.findOne({ batchCode });
};

// Static method: Find by user
ProductSchema.statics.findByUser = function (userId, filters = {}) {
  const query = { userId };

  if (filters.stage) query.stage = filters.stage;
  if (filters.certificationStatus) query.certificationStatus = filters.certificationStatus;

  return this.find(query).sort({ 'metadata.createdAt': -1 });
};

// Static method: Get user statistics
ProductSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        certified: {
          $sum: { $cond: [{ $eq: ['$certificationStatus', 'CERTIFIED'] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$certificationStatus', 'PENDING'] }, 1, 0] },
        },
      },
    },
  ]);

  return stats[0] || { total: 0, certified: 0, pending: 0 };
};

// Pre-save middleware
ProductSchema.pre('save', function (next) {
  // Update lastUpdated
  this.metadata.lastUpdated = new Date();

  // Auto-expire certifications
  if (this.certification && this.certification.expiryDate) {
    if (new Date() > new Date(this.certification.expiryDate)) {
      this.certificationStatus = 'EXPIRED';
    }
  }

  next();
});

// Export model
module.exports = mongoose.model('Product', ProductSchema);
