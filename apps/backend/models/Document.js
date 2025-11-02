/**
 * Document Model
 * Centralized document management for the entire system
 *
 * Features:
 * - Universal document storage
 * - Version control
 * - Access control
 * - Metadata management
 * - Audit trail
 */

const mongoose = require('mongoose');

// Document Types
const DocumentType = {
  // Application Documents
  APPLICATION_FORM: 'application_form',
  LAND_DEED: 'land_deed',
  ID_CARD: 'id_card',
  HOUSE_REGISTRATION: 'house_registration',
  FARM_MAP: 'farm_map',
  CULTIVATION_PLAN: 'cultivation_plan',

  // Certificate Documents
  CERTIFICATE_PDF: 'certificate_pdf',
  CERTIFICATE_TEMPLATE: 'certificate_template',

  // Inspection Documents
  INSPECTION_REPORT: 'inspection_report',
  INSPECTION_PHOTO: 'inspection_photo',
  INSPECTION_CHECKLIST: 'inspection_checklist',

  // SOP Documents
  SOP_DOCUMENT: 'sop_document',
  SOP_TEMPLATE: 'sop_template',

  // General Documents
  PAYMENT_RECEIPT: 'payment_receipt',
  CONTRACT: 'contract',
  AGREEMENT: 'agreement',
  OTHER: 'other'
};

// Document Categories
const DocumentCategory = {
  APPLICATION: 'application',
  CERTIFICATE: 'certificate',
  INSPECTION: 'inspection',
  SOP: 'sop',
  PAYMENT: 'payment',
  LEGAL: 'legal',
  TEMPLATE: 'template',
  GENERAL: 'general'
};

// Document Status
const DocumentStatus = {
  DRAFT: 'draft',
  UPLOADED: 'uploaded',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
  DELETED: 'deleted'
};

// Access Levels
const AccessLevel = {
  PUBLIC: 'public', // ทุกคนเข้าถึงได้
  INTERNAL: 'internal', // เจ้าหน้าที่เท่านั้น
  RESTRICTED: 'restricted', // เฉพาะเจ้าของและผู้ได้รับอนุญาต
  CONFIDENTIAL: 'confidential' // เฉพาะผู้จัดการระดับสูง
};

// Version Information Schema
const VersionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
      min: 1
    },
    filename: {
      type: String,
      required: true
    },
    filepath: {
      type: String,
      required: true
    },
    filesize: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    changeLog: {
      type: String,
      maxLength: 500
    },
    checksum: {
      type: String // For file integrity verification
    }
  },
  { _id: false }
);

// Document Schema
const DocumentSchema = new mongoose.Schema(
  {
    // Document Identification
    documentId: {
      type: String,
      required: true,
      unique: true
    },

    // Document Classification
    type: {
      type: String,
      enum: Object.values(DocumentType),
      required: true
    },
    category: {
      type: String,
      enum: Object.values(DocumentCategory),
      required: true
    },

    // Document Information
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200
    },
    description: {
      type: String,
      trim: true,
      maxLength: 1000
    },

    // Current File Information
    filename: {
      type: String,
      required: true
    },
    originalFilename: {
      type: String,
      required: true
    },
    filepath: {
      type: String,
      required: true
    },
    filesize: {
      type: Number,
      required: true,
      min: 0
    },
    mimetype: {
      type: String,
      required: true
    },
    fileExtension: {
      type: String,
      required: true
    },

    // Version Control
    currentVersion: {
      type: Number,
      default: 1,
      min: 1
    },
    versions: [VersionSchema],

    // Related Entities
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate'
    },
    inspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Status and Access Control
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.UPLOADED
    },
    accessLevel: {
      type: String,
      enum: Object.values(AccessLevel),
      default: AccessLevel.RESTRICTED
    },
    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    allowedRoles: [
      {
        type: String
      }
    ],

    // Metadata
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },

    // Review Information
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    reviewNotes: {
      type: String,
      maxLength: 1000
    },

    // Template Information (if document is a template)
    isTemplate: {
      type: Boolean,
      default: false
    },
    templateVariables: [
      {
        name: { type: String },
        type: { type: String },
        description: { type: String },
        required: { type: Boolean, default: false }
      }
    ],

    // Document Expiry
    expiresAt: {
      type: Date
    },
    isExpired: {
      type: Boolean,
      default: false
    },

    // Audit Trail
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedAt: {
      type: Date
    },

    // Security
    checksum: {
      type: String // MD5/SHA256 hash for integrity
    },
    encryptionKey: {
      type: String // If document is encrypted
    },
    isEncrypted: {
      type: Boolean,
      default: false
    },

    // Download Tracking
    downloadCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastDownloadedAt: {
      type: Date
    },
    lastDownloadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for Performance
DocumentSchema.index({ documentId: 1 });
DocumentSchema.index({ type: 1, category: 1 });
DocumentSchema.index({ applicationId: 1 });
DocumentSchema.index({ certificateId: 1 });
DocumentSchema.index({ inspectionId: 1 });
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ uploadedAt: -1 });
DocumentSchema.index({ isDeleted: 1, status: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ 'metadata.key': 1 });

// Text Search Index
DocumentSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual: File URL
DocumentSchema.virtual('fileUrl').get(function () {
  return `/api/documents/${this.documentId}/download`;
});

// Virtual: Is Image
DocumentSchema.virtual('isImage').get(function () {
  const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return imageMimeTypes.includes(this.mimetype);
});

// Virtual: Is PDF
DocumentSchema.virtual('isPDF').get(function () {
  return this.mimetype === 'application/pdf';
});

// Virtual: File Size (Human Readable)
DocumentSchema.virtual('filesizeFormatted').get(function () {
  const bytes = this.filesize;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
});

// Pre-save Middleware
DocumentSchema.pre('save', async function (next) {
  // Generate document ID if not exists
  if (!this.documentId) {
    this.documentId = await generateDocumentId(this.category);
  }

  // Check expiry
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.isExpired = true;
  }

  // Extract file extension
  if (!this.fileExtension) {
    const ext = this.filename.split('.').pop();
    this.fileExtension = ext ? `.${ext.toLowerCase()}` : '';
  }

  next();
});

// Static Methods

/**
 * Generate unique document ID
 */
async function generateDocumentId(category) {
  const prefix = {
    application: 'DOC-APP',
    certificate: 'DOC-CRT',
    inspection: 'DOC-INS',
    sop: 'DOC-SOP',
    payment: 'DOC-PAY',
    legal: 'DOC-LEG',
    template: 'DOC-TPL',
    general: 'DOC-GEN'
  };

  const categoryPrefix = prefix[category] || 'DOC-GEN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${categoryPrefix}-${timestamp}-${random}`;
}

/**
 * Find documents by entity
 */
DocumentSchema.statics.findByEntity = function (entityType, entityId) {
  const query = { isDeleted: false };

  switch (entityType) {
    case 'application':
      query.applicationId = entityId;
      break;
    case 'certificate':
      query.certificateId = entityId;
      break;
    case 'inspection':
      query.inspectionId = entityId;
      break;
    case 'user':
      query.userId = entityId;
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  return this.find(query).sort({ uploadedAt: -1 });
};

/**
 * Find by document ID
 */
DocumentSchema.statics.findByDocumentId = function (documentId) {
  return this.findOne({ documentId, isDeleted: false });
};

/**
 * Search documents
 */
DocumentSchema.statics.searchDocuments = function (searchTerm, filters = {}) {
  const query = {
    isDeleted: false,
    $text: { $search: searchTerm }
  };

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.userId) query.userId = filters.userId;

  return this.find(query)
    .sort({ score: { $meta: 'textScore' }, uploadedAt: -1 })
    .limit(filters.limit || 50);
};

// Instance Methods

/**
 * Add new version
 */
DocumentSchema.methods.addVersion = function (fileInfo, uploadedBy, changeLog) {
  const newVersion = {
    versionNumber: this.currentVersion + 1,
    filename: fileInfo.filename,
    filepath: fileInfo.filepath,
    filesize: fileInfo.filesize,
    mimetype: fileInfo.mimetype,
    uploadedBy,
    uploadedAt: new Date(),
    changeLog,
    checksum: fileInfo.checksum
  };

  this.versions.push(newVersion);
  this.currentVersion = newVersion.versionNumber;

  // Update current file info
  this.filename = fileInfo.filename;
  this.filepath = fileInfo.filepath;
  this.filesize = fileInfo.filesize;
  this.mimetype = fileInfo.mimetype;
  this.checksum = fileInfo.checksum;
  this.lastModifiedBy = uploadedBy;
  this.lastModifiedAt = new Date();

  return this.save();
};

/**
 * Check if user has access
 */
DocumentSchema.methods.hasAccess = function (userId, userRole) {
  // Public documents
  if (this.accessLevel === AccessLevel.PUBLIC) {
    return true;
  }

  // Document owner
  if (this.userId.toString() === userId.toString()) {
    return true;
  }

  // Explicitly allowed users
  if (this.allowedUsers.some(id => id.toString() === userId.toString())) {
    return true;
  }

  // Role-based access
  if (this.allowedRoles.includes(userRole)) {
    return true;
  }

  // Admin/Manager always have access (except confidential)
  if (this.accessLevel !== AccessLevel.CONFIDENTIAL) {
    if (['admin', 'manager'].includes(userRole)) {
      return true;
    }
  }

  return false;
};

/**
 * Soft delete
 */
DocumentSchema.methods.softDelete = function (deletedBy) {
  this.isDeleted = true;
  this.deletedBy = deletedBy;
  this.deletedAt = new Date();
  return this.save();
};

/**
 * Restore deleted document
 */
DocumentSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedBy = undefined;
  this.deletedAt = undefined;
  return this.save();
};

/**
 * Track download
 */
DocumentSchema.methods.trackDownload = function (userId) {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  this.lastDownloadedBy = userId;
  return this.save();
};

/**
 * Approve document
 */
DocumentSchema.methods.approve = function (reviewedBy, notes) {
  this.status = DocumentStatus.APPROVED;
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

/**
 * Reject document
 */
DocumentSchema.methods.reject = function (reviewedBy, notes) {
  this.status = DocumentStatus.REJECTED;
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Export Model
const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
module.exports.DocumentType = DocumentType;
module.exports.DocumentCategory = DocumentCategory;
module.exports.DocumentStatus = DocumentStatus;
module.exports.AccessLevel = AccessLevel;
