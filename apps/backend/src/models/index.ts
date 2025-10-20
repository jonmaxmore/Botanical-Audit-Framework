import mongoose from 'mongoose';

// User Model Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'document_checker', 'inspector', 'approver', 'admin'],
  },
  phone: String,
  isActive: { type: Boolean, default: true },

  // Farmer specific fields
  idCardNumber: String,
  address: String,
  province: String,
  district: String,
  subdistrict: String,
  postalCode: String,
  farmingExperience: Number,
  totalFarmArea: Number,

  // Staff specific fields
  employeeId: String,
  department: String,
  position: String,
  licenseNumber: String,
  certifications: [String],
  assignedApplications: { type: Number, default: 0 },
  assignedInspections: { type: Number, default: 0 },
  approvalLevel: Number,
  pendingApprovals: { type: Number, default: 0 },

  // Admin specific fields
  permissions: [String],
  canManageRoles: { type: Boolean, default: false },

  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Farm Model Schema
const farmSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmName: { type: String, required: true },
  farmCode: { type: String, unique: true },
  address: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  subdistrict: { type: String, required: true },
  postalCode: { type: String, required: true },
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  totalArea: { type: Number, required: true }, // ไร่
  cultivatedArea: { type: Number, required: true }, // ไร่
  mainCrops: [String],
  waterSource: [String],
  soilType: String,
  certifications: [
    {
      certificationType: String,
      certificationNumber: String,
      issueDate: Date,
      expiryDate: Date,
    },
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Farm Activities Schema
const farmActivitySchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  activityType: {
    type: String,
    required: true,
    enum: [
      'planting',
      'fertilizing',
      'pestControl',
      'irrigation',
      'harvesting',
      'maintenance',
      'other',
    ],
  },
  activityDate: { type: Date, required: true },
  cropType: String,
  description: { type: String, required: true },
  area: Number, // พื้นที่ที่ทำกิจกรรม (ไร่)
  quantity: Number, // ปริมาณ (ถ้ามี)
  unit: String, // หน่วย
  cost: Number, // ค่าใช้จ่าย
  performedBy: String, // ผู้ดำเนินการ
  notes: String,
  images: [String], // URL ของรูปภาพ
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Application Model Schema
const applicationSchema = new mongoose.Schema({
  applicationNumber: { type: String, required: true, unique: true },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmerName: { type: String, required: true },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  farmName: { type: String, required: true },
  farmAddress: { type: String, required: true },
  farmArea: { type: Number, required: true },
  cropType: { type: String, required: true },
  cropVariety: { type: String, required: true },
  plantingDate: { type: Date, required: true },
  expectedHarvestDate: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: [
      'draft',
      'submitted',
      'document_checking',
      'document_approved',
      'document_rejected',
      'inspection_scheduled',
      'inspecting',
      'inspection_completed',
      'inspection_passed',
      'inspection_failed',
      'pending_approval',
      'approved',
      'rejected',
      'certificate_issued',
    ],
    default: 'draft',
  },
  submittedAt: Date,

  // Document Checker
  documentCheckerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documentCheckerName: String,
  documentCheckedAt: Date,
  documentCheckResult: { type: String, enum: ['approved', 'rejected'] },
  documentCheckNotes: String,

  // Inspector
  inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inspectorName: String,
  inspectionScheduledDate: Date,
  inspectionCompletedDate: Date,
  inspectionScore: Number,
  inspectionResult: { type: String, enum: ['passed', 'failed'] },
  inspectionNotes: String,
  inspectionReport: String, // URL หรือ ID ของรายงาน

  // Approver
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverName: String,
  approvedAt: Date,
  approvalResult: { type: String, enum: ['approved', 'rejected'] },
  approvalNotes: String,

  // Certificate
  certificateNumber: String,
  certificateIssuedAt: Date,
  certificateExpiryDate: Date,

  // ตัวแปรอื่นๆ
  documents: [
    {
      documentType: String,
      documentName: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Workflow History Schema
const workflowHistorySchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  performedByName: { type: String, required: true },
  performedByRole: { type: String, required: true },
  notes: String,
  timestamp: { type: Date, default: Date.now },
});

// Inspection Schema
const inspectionSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  inspectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scheduledDate: { type: Date, required: true },
  completedDate: Date,
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  checklists: [
    {
      category: String,
      items: [
        {
          question: String,
          answer: { type: String, enum: ['yes', 'no', 'na'] },
          evidence: String,
          notes: String,
          images: [String],
        },
      ],
    },
  ],
  score: Number,
  result: { type: String, enum: ['passed', 'failed'] },
  notes: String,
  recommendations: [String],
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Traceability Schema
const traceabilitySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  qrCode: { type: String, required: true, unique: true },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  productName: { type: String, required: true },
  cropType: { type: String, required: true },
  harvestDate: { type: Date, required: true },
  processingDate: Date,
  packagingDate: Date,
  batchNumber: String,
  certificateNumber: String,
  expiryDate: Date,
  storageConditions: String,
  distributors: [
    {
      name: String,
      location: String,
      distributionDate: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Survey Schema
const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  region: { type: String, enum: ['north', 'central', 'northeast', 'south', 'all'] },
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  startDate: Date,
  endDate: Date,
  questions: [
    {
      questionType: {
        type: String,
        enum: ['text', 'number', 'singleChoice', 'multipleChoice', 'rating'],
        required: true,
      },
      question: { type: String, required: true },
      options: [String], // สำหรับ singleChoice/multipleChoice
      required: { type: Boolean, default: false },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Survey Response Schema
const surveyResponseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true,
  },
  respondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  respondentType: {
    type: String,
    enum: ['farmer', 'anonymous'],
    required: true,
  },
  respondentRegion: {
    type: String,
    enum: ['north', 'central', 'northeast', 'south'],
    required: true,
  },
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: mongoose.Schema.Types.Mixed, // สามารถเป็นได้ทั้ง String, Number, Array
    },
  ],
  submittedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
});

// Initialize and export models
export const User = mongoose.model('User', userSchema);
export const Farm = mongoose.model('Farm', farmSchema);
export const FarmActivity = mongoose.model('FarmActivity', farmActivitySchema);
export const Application = mongoose.model('Application', applicationSchema);
export const WorkflowHistory = mongoose.model('WorkflowHistory', workflowHistorySchema);
export const Inspection = mongoose.model('Inspection', inspectionSchema);
export const Traceability = mongoose.model('Traceability', traceabilitySchema);
export const Survey = mongoose.model('Survey', surveySchema);
export const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

// Export the schemas for reference
export {
  userSchema,
  farmSchema,
  farmActivitySchema,
  applicationSchema,
  workflowHistorySchema,
  inspectionSchema,
  traceabilitySchema,
  surveySchema,
  surveyResponseSchema,
};
