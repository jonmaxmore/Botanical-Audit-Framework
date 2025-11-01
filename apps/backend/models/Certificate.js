/**
 * Certificate Model
 * GACP Certification Certificate
 */

const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    // Certificate Identification
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    certificateType: {
      type: String,
      enum: ['GACP', 'GACP_ORGANIC', 'GACP_PREMIUM'],
      default: 'GACP'
    },

    // Application Reference
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },

    // Holder Information
    holderInfo: {
      holderType: {
        type: String,
        enum: ['individual', 'group', 'organization'],
        required: true
      },

      // Individual/Group Leader
      fullName: String,
      nationalId: String,

      // Organization
      organizationName: String,
      taxId: String,
      registrationNumber: String,

      // Contact
      address: {
        houseNumber: String,
        village: String,
        subDistrict: String,
        district: String,
        province: String,
        postalCode: String,
        country: { type: String, default: 'Thailand' }
      },
      phoneNumber: String,
      email: String
    },

    // Farm/Site Information
    siteInfo: {
      farmName: String,
      totalArea: Number, // in rai
      certifiedArea: Number, // in rai
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
        province: String,
        district: String
      },
      crops: [
        {
          cropType: String,
          variety: String,
          plantingDate: Date,
          area: Number
        }
      ]
    },

    // Certification Details
    issuanceDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    expiryDate: {
      type: Date,
      required: true
    },

    validityPeriod: {
      type: Number,
      default: 24 // months
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'revoked', 'expired', 'renewed'],
      default: 'active',
      index: true
    },

    // Inspection Information
    inspectionDate: Date,
    inspectionScore: Number,
    inspectorName: String,
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Standards & Compliance
    standardsComplied: [
      {
        standardName: String,
        standardVersion: String,
        complianceLevel: {
          type: String,
          enum: ['full', 'conditional', 'partial']
        }
      }
    ],

    scope: {
      type: String,
      required: true
    }, // ขอบเขตการรับรอง

    conditions: [String], // เงื่อนไขการรับรอง (ถ้ามี)

    // Verification
    qrCode: {
      data: String, // QR code payload
      imageUrl: String // QR code image data URL
    },

    verificationUrl: String,

    digitalSignature: {
      algorithm: String,
      hash: String,
      signedBy: String,
      signedAt: Date
    },

    // Issued By
    issuedBy: {
      officerName: String,
      officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      organizationName: {
        type: String,
        default: 'กรมวิชาการเกษตร กระทรวงเกษตรและสหกรณ์'
      },
      position: String
    },

    // Renewal & History
    previousCertificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate'
    },

    renewalHistory: [
      {
        renewalDate: Date,
        expiryDate: Date,
        renewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        notes: String
      }
    ],

    // Suspension/Revocation
    suspensionHistory: [
      {
        suspendedAt: Date,
        suspendedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        reason: String,
        reinstatedAt: Date,
        reinstatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],

    revocationInfo: {
      revokedAt: Date,
      revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      appealDeadline: Date
    },

    // PDF Generation
    pdfUrl: String,
    pdfGeneratedAt: Date,

    // Additional Notes
    remarks: String,
    internalNotes: String,

    // Metadata
    version: {
      type: Number,
      default: 1
    },

    metadata: {
      templateVersion: String,
      generatedBy: String,
      lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },
  {
    timestamps: true,
    collection: 'certificates'
  }
);

// Indexes
CertificateSchema.index({ certificateNumber: 1 });
CertificateSchema.index({ 'holderInfo.nationalId': 1 });
CertificateSchema.index({ 'holderInfo.taxId': 1 });
CertificateSchema.index({ status: 1, expiryDate: 1 });
CertificateSchema.index({ issuanceDate: -1 });
CertificateSchema.index({ application: 1 });

// Methods

/**
 * Check if certificate is valid
 */
CertificateSchema.methods.isValid = function () {
  return this.status === 'active' && this.expiryDate && new Date() < this.expiryDate;
};

/**
 * Check if certificate is expiring soon (within 60 days)
 */
CertificateSchema.methods.isExpiringSoon = function (days = 60) {
  if (!this.expiryDate || this.status !== 'active') return false;

  const daysUntilExpiry = Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= days && daysUntilExpiry > 0;
};

/**
 * Get days until expiry
 */
CertificateSchema.methods.getDaysUntilExpiry = function () {
  if (!this.expiryDate) return null;

  const days = Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  return days;
};

/**
 * Suspend certificate
 */
CertificateSchema.methods.suspend = async function (userId, reason) {
  this.status = 'suspended';
  this.suspensionHistory.push({
    suspendedAt: new Date(),
    suspendedBy: userId,
    reason
  });
  return await this.save();
};

/**
 * Reinstate certificate
 */
CertificateSchema.methods.reinstate = async function (userId) {
  if (this.status !== 'suspended') {
    throw new Error('Certificate is not suspended');
  }

  this.status = 'active';
  const lastSuspension = this.suspensionHistory[this.suspensionHistory.length - 1];
  if (lastSuspension) {
    lastSuspension.reinstatedAt = new Date();
    lastSuspension.reinstatedBy = userId;
  }

  return await this.save();
};

/**
 * Revoke certificate
 */
CertificateSchema.methods.revoke = async function (userId, reason) {
  this.status = 'revoked';
  this.revocationInfo = {
    revokedAt: new Date(),
    revokedBy: userId,
    reason,
    appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
  return await this.save();
};

// Statics

/**
 * Generate certificate number
 */
CertificateSchema.statics.generateCertificateNumber = async function (province = 'BKK') {
  const year = new Date().getFullYear() + 543; // Buddhist year
  const yearShort = year.toString().slice(-2);

  // Find the last certificate for this year
  const lastCert = await this.findOne({
    certificateNumber: new RegExp(`^GACP-${yearShort}`)
  })
    .sort({ certificateNumber: -1 })
    .select('certificateNumber');

  let sequence = 1;
  if (lastCert) {
    const match = lastCert.certificateNumber.match(/(\d{5})$/);
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  const provinceCode = province.substring(0, 3).toUpperCase();
  const sequenceStr = sequence.toString().padStart(5, '0');

  return `GACP-${yearShort}-${provinceCode}-${sequenceStr}`;
};

/**
 * Find valid certificates
 */
CertificateSchema.statics.findValid = function () {
  return this.find({
    status: 'active',
    expiryDate: { $gt: new Date() }
  });
};

/**
 * Find expiring certificates
 */
CertificateSchema.statics.findExpiring = function (days = 60) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: 'active',
    expiryDate: {
      $gt: new Date(),
      $lte: futureDate
    }
  });
};

// Pre-save middleware
CertificateSchema.pre('save', function (next) {
  // Auto-expire if past expiry date
  if (this.expiryDate && new Date() > this.expiryDate && this.status === 'active') {
    this.status = 'expired';
  }

  next();
});

module.exports = mongoose.model('Certificate', CertificateSchema);
