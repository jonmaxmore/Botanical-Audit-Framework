/**
 * GACP Application Model
 * Core business entity for certification applications
 *
 * Based on DTAM GACP Standards and WHO Guidelines
 */

const mongoose = require('mongoose');

// Application Status Enum
const ApplicationStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  PENDING_PAYMENT: 'pending_payment', // รอการชำระเงิน
  PAYMENT_CONFIRMED: 'payment_confirmed', // ยืนยันการชำระเงินแล้ว
  UNDER_REVIEW: 'under_review',
  PENDING_INSPECTION: 'pending_inspection', // รอกำหนดวันตรวจ
  INSPECTION_SCHEDULED: 'inspection_scheduled',
  INSPECTION_IN_PROGRESS: 'inspection_in_progress',
  INSPECTION_COMPLETED: 'inspection_completed',
  EVALUATION: 'evaluation',
  DECISION_PENDING: 'decision_pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CERTIFICATE_ISSUED: 'certificate_issued'
};

// Risk Assessment Levels
const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Farm Information Schema
const FarmInformationSchema = new mongoose.Schema(
  {
    farmName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200
    },
    location: {
      address: { type: String, required: true },
      province: { type: String, required: true },
      district: { type: String, required: true },
      subDistrict: { type: String, required: true },
      postalCode: { type: String, required: true, match: /^[0-9]{5}$/ },
      coordinates: {
        latitude: { type: Number, required: true, min: -90, max: 90 },
        longitude: { type: Number, required: true, min: -180, max: 180 }
      }
    },
    farmSize: {
      totalArea: { type: Number, required: true, min: 0.1 }, // in rai
      cultivatedArea: { type: Number, required: true, min: 0.1 },
      unit: { type: String, default: 'rai', enum: ['rai', 'hectare', 'sqm'] }
    },
    landOwnership: {
      type: {
        type: String,
        required: true,
        enum: ['owned', 'rented', 'cooperative', 'contract']
      },
      documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
      landRightsCertificate: String
    },
    waterSource: {
      primary: {
        type: String,
        required: true,
        enum: ['well', 'river', 'canal', 'rainwater', 'municipal']
      },
      quality: { type: String, enum: ['good', 'fair', 'poor', 'unknown'] },
      testResults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabResult' }]
    },
    soilType: {
      type: { type: String, enum: ['clay', 'sandy', 'loam', 'mixed'] },
      ph: { type: Number, min: 0, max: 14 },
      organicMatter: Number,
      testResults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabResult' }]
    }
  },
  { _id: false }
);

// Crop Information Schema
const CropInformationSchema = new mongoose.Schema(
  {
    cropType: {
      type: String,
      required: true,
      enum: [
        'turmeric', // ขมิ้นชัน
        'ginger', // ขิง
        'holy_basil', // กะเพรา
        'galangal', // ข่า
        'lemongrass', // ตะไคร้
        'kaffir_lime', // มะกรูด
        'pandan', // ใบเตย
        'andrographis', // ฟ้าทลายโจร
        'centella', // บัวบก
        'butterfly_pea', // อัญชัน
        'other' // อื่นๆ
      ]
    },
    variety: String,
    plantingArea: { type: Number, required: true, min: 0.1 },
    plantingMethod: {
      type: String,
      enum: ['seeds', 'seedlings', 'cuttings', 'rhizomes', 'other']
    },
    plantingDate: Date,
    expectedHarvestDate: Date,
    productionCycle: {
      type: String,
      enum: ['annual', 'biennial', 'perennial']
    },
    organicCertification: {
      certified: { type: Boolean, default: false },
      certifyingBody: String,
      certificateNumber: String,
      validUntil: Date
    }
  },
  { _id: false }
);

// Document Reference Schema
const DocumentReferenceSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: true,
      enum: [
        'application_form',
        'farm_management_plan',
        'cultivation_records',
        'land_rights_certificate',
        'water_quality_report',
        'soil_quality_report',
        'organic_certificate',
        'training_certificate',
        'identification_document',
        'other'
      ]
    },
    fileName: String,
    storageFileName: String,
    storagePath: String,
    fileSize: Number,
    mimeType: String,
    uploadDate: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'verified', 'rejected']
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationDate: Date,
    notes: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String
  },
  { _id: false }
);

const ConsentSignatureSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['typed', 'drawn'],
      default: 'typed'
    },
    value: String
  },
  { _id: false }
);

const ConsentSchema = new mongoose.Schema(
  {
    acceptedTerms: { type: Boolean, required: true },
    acceptedPrivacy: { type: Boolean, required: true },
    fullName: { type: String, required: true, trim: true },
    nationalId: { type: String, required: true, trim: true },
    signedAt: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    version: { type: String, default: '1.0' },
    signature: { type: ConsentSignatureSchema, default: undefined }
  },
  { _id: false }
);

// Assessment Score Schema
const AssessmentScoreSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        'documentation',
        'farm_information',
        'cultivation_practices',
        'input_materials',
        'harvesting',
        'post_harvest',
        'storage',
        'record_keeping',
        'worker_training'
      ]
    },
    maxScore: { type: Number, required: true },
    achievedScore: { type: Number, required: true, min: 0 },
    assessor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assessmentDate: { type: Date, default: Date.now },
    notes: String,
    recommendations: [String]
  },
  { _id: false }
);

// Status History Schema
const StatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(ApplicationStatus)
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: { type: Date, default: Date.now },
    reason: String,
    notes: String,
    systemGenerated: { type: Boolean, default: false }
  },
  { _id: false }
);

// Main Application Schema
const ApplicationSchema = new mongoose.Schema(
  {
    // Basic Information
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^GACP-\d{4}-\d{6}$/ // Format: GACP-YYYY-NNNNNN
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Applicant Type & Organization Details (กทล.1 requirement)
    applicantType: {
      type: String,
      required: true,
      enum: ['INDIVIDUAL', 'COMMUNITY_ENTERPRISE', 'LEGAL_ENTITY'],
      default: 'INDIVIDUAL'
    },

    organizationInfo: {
      organizationName: String, // ชื่อวิสาหกิจ/นิติบุคคล
      registrationNumber: String, // เลขทะเบียน (สวช.01 สำหรับวิสาหกิจ)
      taxId: String, // เลขประจำตัวผู้เสียภาษี
      registrationDate: Date,
      certificateDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }]
    },

    // Receiving Office (หน่วยงานรับคำขอ)
    receivingOffice: {
      type: String,
      required: true,
      enum: [
        'DEPARTMENT_THAI_TRADITIONAL_MEDICINE', // กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
        'PROVINCIAL_HEALTH_OFFICE' // สำนักงานสาธารณสุขจังหวัด
      ],
      default: 'DEPARTMENT_THAI_TRADITIONAL_MEDICINE'
    },

    receivingOfficeDetails: {
      provinceName: String, // สำหรับกรณีที่เลือก PROVINCIAL_HEALTH_OFFICE
      officerName: String,
      receivedDate: Date
    },

    // Application Details
    farmInformation: {
      type: FarmInformationSchema,
      required: true
    },

    cropInformation: [CropInformationSchema],

    // Process Management
    currentStatus: {
      type: String,
      required: true,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.DRAFT
    },

    statusHistory: [StatusHistorySchema],

    // Payment Information
    payment: {
      amount: {
        type: Number,
        default: 0 // จำนวนเงิน (บาท)
      },
      currency: {
        type: String,
        default: 'THB'
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'verified', 'cancelled'],
        default: 'pending'
      },
      method: {
        type: String,
        enum: ['qr_code', 'bank_transfer', 'counter_service'],
        default: 'qr_code'
      },
      qrCodeUrl: String, // URL ของ QR Code สำหรับชำระเงิน
      referenceNumber: String, // เลขที่อ้างอิง
      slipUrl: String, // URL ของสลิปโอนเงิน
      paidAt: Date, // วันที่ชำระเงิน
      verifiedAt: Date, // วันที่ตรวจสอบแล้ว
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: String
    },

    // Timeline
    submissionDate: Date,
    targetCompletionDate: Date,
    actualCompletionDate: Date,

    // Assessment & Evaluation
    riskAssessment: {
      level: {
        type: String,
        enum: Object.values(RiskLevel)
      },
      factors: [String],
      assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      assessmentDate: Date,
      notes: String
    },

    assessmentScores: [AssessmentScoreSchema],

    totalScore: {
      type: Number,
      min: 0,
      max: 100
    },

    // Documentation
    documents: [DocumentReferenceSchema],

    // Consent & Agreements
    consent: { type: ConsentSchema, default: undefined },

    // Assigned Personnel
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedInspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Inspection
    inspectionScheduled: Date,
    inspectionCompleted: Date,
    inspectionReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InspectionReport'
    },

    // Decision & Certificate
    decision: {
      result: {
        type: String,
        enum: ['approved', 'conditional_approval', 'rejected']
      },
      decisionDate: Date,
      decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reasons: [String],
      conditions: [String],
      validityPeriod: Number, // in months
      appealDeadline: Date
    },

    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },

    // Compliance & Monitoring
    complianceRequirements: [String],
    surveillanceSchedule: [Date],
    nonComplianceIssues: [
      {
        issue: String,
        severity: { type: String, enum: ['minor', 'major', 'critical'] },
        identifiedDate: Date,
        correctiveAction: String,
        targetDate: Date,
        status: {
          type: String,
          enum: ['open', 'in_progress', 'resolved', 'overdue']
        }
      }
    ],

    // Financial
    fees: {
      applicationFee: { type: Number, default: 0 },
      inspectionFee: { type: Number, default: 0 },
      certificateFee: { type: Number, default: 0 },
      totalFee: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      paymentStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'partial', 'paid', 'refunded']
      },
      paymentHistory: [
        {
          amount: Number,
          date: Date,
          method: String,
          reference: String
        }
      ]
    },

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  },
  {
    timestamps: true,
    collection: 'gacp_applications'
  }
);

// Indexes for Performance
ApplicationSchema.index({ applicationNumber: 1 }, { unique: true });
ApplicationSchema.index({ applicant: 1 });
ApplicationSchema.index({ currentStatus: 1 });
ApplicationSchema.index({ submissionDate: 1 });
ApplicationSchema.index({ assignedOfficer: 1 });
ApplicationSchema.index({ 'farmInformation.location.province': 1 });
ApplicationSchema.index({ 'cropInformation.cropType': 1 });

// Virtual Fields
ApplicationSchema.virtual('isOverdue').get(function () {
  return this.targetCompletionDate && new Date() > this.targetCompletionDate;
});

ApplicationSchema.virtual('daysInProcess').get(function () {
  if (!this.submissionDate) return 0;
  const endDate = this.actualCompletionDate || new Date();
  return Math.floor((endDate - this.submissionDate) / (1000 * 60 * 60 * 24));
});

// Instance Methods
ApplicationSchema.methods.updateStatus = function (newStatus, userId, reason, notes) {
  this.statusHistory.push({
    status: this.currentStatus,
    changedBy: userId,
    changedAt: new Date(),
    reason,
    notes
  });

  this.currentStatus = newStatus;
  this.updatedAt = new Date();

  // Auto-set target dates based on status
  if (newStatus === ApplicationStatus.SUBMITTED && !this.targetCompletionDate) {
    this.targetCompletionDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); // 45 days
  }

  return this.save();
};

ApplicationSchema.methods.calculateTotalScore = function () {
  if (this.assessmentScores.length === 0) return 0;

  const totalPossible = this.assessmentScores.reduce((sum, score) => sum + score.maxScore, 0);
  const totalAchieved = this.assessmentScores.reduce((sum, score) => sum + score.achievedScore, 0);

  this.totalScore = totalPossible > 0 ? Math.round((totalAchieved / totalPossible) * 100) : 0;
  return this.totalScore;
};

ApplicationSchema.methods.assessRisk = function () {
  const riskFactors = [];
  let riskScore = 0;

  // Location-based risk
  const industrialProvinces = ['rayong', 'chonburi', 'samut_prakan'];
  if (industrialProvinces.includes(this.farmInformation.location.province.toLowerCase())) {
    riskFactors.push('proximity_to_industrial_area');
    riskScore += 3;
  }

  // Farm size risk
  if (this.farmInformation.farmSize.totalArea < 1) {
    riskFactors.push('small_scale_operation');
    riskScore += 1;
  }

  // Water source risk
  if (['river', 'canal'].includes(this.farmInformation.waterSource.primary)) {
    riskFactors.push('surface_water_dependency');
    riskScore += 2;
  }

  // Experience risk (based on user creation date - proxy for experience)
  // This would need to be enhanced with actual farming experience data

  // Determine risk level
  let riskLevel;
  if (riskScore >= 6) riskLevel = RiskLevel.CRITICAL;
  else if (riskScore >= 4) riskLevel = RiskLevel.HIGH;
  else if (riskScore >= 2) riskLevel = RiskLevel.MEDIUM;
  else riskLevel = RiskLevel.LOW;

  this.riskAssessment = {
    level: riskLevel,
    factors: riskFactors,
    assessmentDate: new Date()
  };

  return riskLevel;
};

// Static Methods
ApplicationSchema.statics.generateApplicationNumber = function () {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
  return `GACP-${year}-${randomNum}`;
};

ApplicationSchema.statics.getApplicationsByStatus = function (status) {
  return this.find({ currentStatus: status })
    .populate('applicant', 'personalInfo contactInfo')
    .populate('assignedOfficer', 'personalInfo')
    .sort({ submissionDate: -1 });
};

ApplicationSchema.statics.getOverdueApplications = function () {
  return this.find({
    targetCompletionDate: { $lt: new Date() },
    currentStatus: {
      $nin: [
        ApplicationStatus.APPROVED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.CERTIFICATE_ISSUED
      ]
    }
  });
};

// Pre-save Middleware
ApplicationSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Auto-generate application number if not exists
  if (!this.applicationNumber) {
    this.applicationNumber = this.constructor.generateApplicationNumber();
  }

  // Validate status transitions
  if (this.isModified('currentStatus')) {
    // Complete transition rules matching HerbCtrl 14-step workflow
    const _validTransitions = {
      [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED],
      [ApplicationStatus.SUBMITTED]: [
        ApplicationStatus.PENDING_PAYMENT,
        ApplicationStatus.REJECTED
      ],
      [ApplicationStatus.PENDING_PAYMENT]: [
        ApplicationStatus.PAYMENT_CONFIRMED,
        ApplicationStatus.DRAFT
      ],
      [ApplicationStatus.PAYMENT_CONFIRMED]: [ApplicationStatus.UNDER_REVIEW],
      [ApplicationStatus.UNDER_REVIEW]: [
        ApplicationStatus.PENDING_INSPECTION,
        ApplicationStatus.REJECTED
      ],
      [ApplicationStatus.PENDING_INSPECTION]: [ApplicationStatus.INSPECTION_SCHEDULED],
      [ApplicationStatus.INSPECTION_SCHEDULED]: [ApplicationStatus.INSPECTION_IN_PROGRESS],
      [ApplicationStatus.INSPECTION_IN_PROGRESS]: [ApplicationStatus.INSPECTION_COMPLETED],
      [ApplicationStatus.INSPECTION_COMPLETED]: [ApplicationStatus.EVALUATION],
      [ApplicationStatus.EVALUATION]: [ApplicationStatus.DECISION_PENDING],
      [ApplicationStatus.DECISION_PENDING]: [
        ApplicationStatus.APPROVED,
        ApplicationStatus.REJECTED
      ],
      [ApplicationStatus.APPROVED]: [ApplicationStatus.CERTIFICATE_ISSUED],
      [ApplicationStatus.CERTIFICATE_ISSUED]: [],
      [ApplicationStatus.REJECTED]: []
    };

    // This would need to be enhanced with complete transition validation
  }

  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
module.exports.ApplicationStatus = ApplicationStatus;
module.exports.RiskLevel = RiskLevel;
