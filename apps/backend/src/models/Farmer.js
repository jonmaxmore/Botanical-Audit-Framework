/**
 * Farmer Model
 * Farm and farmer profile management
 */

const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

// Farmer schema definition
const farmerSchema = new mongoose.Schema(
  {
    // Basic Information
    farmerId: {
      type: String,
      unique: true,
      required: [true, 'Farmer ID is required'],
      uppercase: true,
      trim: true,
      index: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    nationalId: {
      type: String,
      required: [true, 'National ID is required'],
      unique: true,
      trim: true,
      match: [/^\d{13}$/, 'National ID must be 13 digits'],
    },

    // Contact Information
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^(08|09|06)\d{8}$/, 'Please provide a valid Thai phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },

    // Address Information
    address: {
      houseNumber: {
        type: String,
        required: [true, 'House number is required'],
      },
      village: String,
      subDistrict: {
        type: String,
        required: [true, 'Sub-district is required'],
      },
      district: {
        type: String,
        required: [true, 'District is required'],
      },
      province: {
        type: String,
        required: [true, 'Province is required'],
        index: true,
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        match: [/^\d{5}$/, 'Postal code must be 5 digits'],
      },
    },

    // Farm Information
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      maxlength: [100, 'Farm name cannot exceed 100 characters'],
      index: true,
    },
    farmArea: {
      total: {
        type: Number,
        required: [true, 'Total farm area is required'],
        min: [0, 'Farm area must be positive'],
      },
      unit: {
        type: String,
        enum: ['rai', 'hectare', 'square_meter'],
        default: 'rai',
      },
      cultivated: {
        type: Number,
        min: [0, 'Cultivated area must be positive'],
      },
    },

    // Location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Farm coordinates are required'],
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[1] >= 5.5 &&
              coords[1] <= 20.5 && // Thailand latitude bounds
              coords[0] >= 97 &&
              coords[0] <= 106
            ); // Thailand longitude bounds
          },
          message: 'Coordinates must be within Thailand bounds',
        },
      },
    },

    // Crops and Production
    crops: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        variety: String,
        area: {
          value: Number,
          unit: {
            type: String,
            enum: ['rai', 'hectare', 'square_meter'],
            default: 'rai',
          },
        },
        plantingDate: Date,
        expectedHarvestDate: Date,
        status: {
          type: String,
          enum: ['planted', 'growing', 'ready_harvest', 'harvested'],
          default: 'planted',
        },
      },
    ],

    // Certification Information
    certifications: [
      {
        type: {
          type: String,
          enum: ['GACP', 'Organic', 'GlobalGAP', 'Other'],
          required: true,
        },
        level: {
          type: String,
          enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
          default: 'Bronze',
        },
        certificateNumber: String,
        issueDate: Date,
        expiryDate: Date,
        issuedBy: String,
        status: {
          type: String,
          enum: ['active', 'expired', 'suspended', 'pending'],
          default: 'pending',
        },
        documents: [
          {
            name: String,
            url: String,
            uploadDate: Date,
          },
        ],
      },
    ],

    // Registration and Verification
    registrationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'incomplete'],
      default: 'pending',
      index: true,
    },
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Documents
    documents: [
      {
        type: {
          type: String,
          enum: ['national_id', 'land_certificate', 'farm_photo', 'other'],
          required: true,
        },
        name: String,
        url: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        verified: {
          type: Boolean,
          default: false,
        },
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        verificationDate: Date,
      },
    ],

    // Bank Information (for payments)
    bankAccount: {
      bankName: String,
      accountNumber: String,
      accountName: String,
      branchName: String,
    },

    // Statistics
    stats: {
      totalSurveys: {
        type: Number,
        default: 0,
      },
      totalInspections: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastInspectionDate: Date,
      lastSurveyDate: Date,
    },

    // User Account Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },

    // Activity Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Notes and Comments
    notes: [
      {
        content: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ['general', 'inspection', 'certification', 'issue'],
          default: 'general',
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
farmerSchema.index({ farmerId: 1 });
farmerSchema.index({ nationalId: 1 });
farmerSchema.index({ 'address.province': 1 });
farmerSchema.index({ 'address.district': 1 });
farmerSchema.index({ registrationStatus: 1, isActive: 1 });
farmerSchema.index({ location: '2dsphere' });
farmerSchema.index({ 'certifications.status': 1 });
farmerSchema.index({ createdAt: -1 });

// Text search index
farmerSchema.index({
  firstName: 'text',
  lastName: 'text',
  farmName: 'text',
  farmerId: 'text',
});

// Virtual fields
farmerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

farmerSchema.virtual('fullAddress').get(function () {
  const addr = this.address;
  return `${addr.houseNumber} ${addr.village ? addr.village + ' ' : ''}${addr.subDistrict}, ${addr.district}, ${addr.province} ${addr.postalCode}`;
});

farmerSchema.virtual('activeCertifications').get(function () {
  return this.certifications.filter(cert => cert.status === 'active');
});

farmerSchema.virtual('totalFarmAreaInHectares').get(function () {
  const area = this.farmArea.total;
  const unit = this.farmArea.unit;

  switch (unit) {
    case 'rai':
      return area * 0.16; // 1 rai = 0.16 hectares
    case 'square_meter':
      return area / 10000; // 1 hectare = 10,000 square meters
    default:
      return area;
  }
});

// Pre-save middleware
farmerSchema.pre('save', function (next) {
  // Generate farmer ID if not provided
  if (!this.farmerId && this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.farmerId = `FM${year}${random}`;
  }

  // Validate cultivated area
  if (this.farmArea.cultivated && this.farmArea.cultivated > this.farmArea.total) {
    return next(new Error('Cultivated area cannot exceed total farm area'));
  }

  next();
});

// Instance methods
farmerSchema.methods.addCertification = function (certificationData) {
  this.certifications.push(certificationData);
  return this.save();
};

farmerSchema.methods.updateCertificationStatus = function (certificationId, status) {
  const cert = this.certifications.id(certificationId);
  if (cert) {
    cert.status = status;
    return this.save();
  }
  throw new Error('Certification not found');
};

farmerSchema.methods.addDocument = function (documentData) {
  this.documents.push(documentData);
  return this.save();
};

farmerSchema.methods.verifyDocument = function (documentId, verifierId) {
  const doc = this.documents.id(documentId);
  if (doc) {
    doc.verified = true;
    doc.verifiedBy = verifierId;
    doc.verificationDate = new Date();
    return this.save();
  }
  throw new Error('Document not found');
};

farmerSchema.methods.addNote = function (noteData) {
  this.notes.push(noteData);
  return this.save();
};

farmerSchema.methods.updateStats = function (statsUpdate) {
  Object.assign(this.stats, statsUpdate);
  return this.save();
};

farmerSchema.methods.isVerified = function () {
  return this.registrationStatus === 'verified';
};

farmerSchema.methods.hasCertification = function (type) {
  return this.certifications.some(cert => cert.type === type && cert.status === 'active');
};

farmerSchema.methods.getDistanceFrom = function (coordinates) {
  // Simple distance calculation (in kilometers)
  const [lng1, lat1] = this.location.coordinates;
  const [lng2, lat2] = coordinates;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Static methods
farmerSchema.statics.findByFarmerId = function (farmerId) {
  return this.findOneActive({ farmerId: farmerId.toUpperCase() });
};

farmerSchema.statics.findByNationalId = function (nationalId) {
  return this.findOneActive({ nationalId });
};

farmerSchema.statics.findByProvince = function (province) {
  return this.findActive({ 'address.province': province, isActive: true });
};

farmerSchema.statics.findByCertificationType = function (type) {
  return this.findActive({
    'certifications.type': type,
    'certifications.status': 'active',
    isActive: true,
  });
};

farmerSchema.statics.findNearby = function (coordinates, maxDistance = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
        $maxDistance: maxDistance * 1000, // Convert km to meters
      },
    },
    isActive: true,
    isDeleted: false,
  });
};

farmerSchema.statics.getFarmerStats = async function () {
  const stats = await this.aggregate([
    { $match: { isDeleted: false, isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        verified: { $sum: { $cond: [{ $eq: ['$registrationStatus', 'verified'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$registrationStatus', 'pending'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$registrationStatus', 'rejected'] }, 1, 0] } },
        totalArea: { $sum: '$farmArea.total' },
        avgArea: { $avg: '$farmArea.total' },
        totalCertifications: { $sum: { $size: '$certifications' } },
      },
    },
  ]);

  return (
    stats[0] || {
      total: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      totalArea: 0,
      avgArea: 0,
      totalCertifications: 0,
    }
  );
};

farmerSchema.statics.getProvinceStats = async function () {
  return this.aggregate([
    { $match: { isDeleted: false, isActive: true } },
    {
      $group: {
        _id: '$address.province',
        count: { $sum: 1 },
        verified: { $sum: { $cond: [{ $eq: ['$registrationStatus', 'verified'] }, 1, 0] } },
        totalArea: { $sum: '$farmArea.total' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Create and export model
const Farmer = new BaseModel(farmerSchema, 'Farmer');

module.exports = Farmer.getModel();
