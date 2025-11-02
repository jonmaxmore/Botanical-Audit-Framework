/**
 * Document Management API Routes
 * Comprehensive document handling system
 *
 * Features:
 * - File upload with validation
 * - Version control
 * - Access control
 * - Download management
 * - Search and filtering
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const Document = require('../models/Document');
const { DocumentType, DocumentCategory, DocumentStatus, AccessLevel } = Document;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../storage/documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`
        )
      );
    }
  }
});

// Middleware: Authentication (placeholder - replace with actual auth)
const authenticate = (req, res, next) => {
  // TODO: Replace with actual JWT authentication
  req.userId = req.headers['x-user-id'] || '507f1f77bcf86cd799439011';
  req.userRole = req.headers['x-user-role'] || 'farmer';
  next();
};

// Middleware: Check document access
const checkDocumentAccess = async (req, res, next) => {
  try {
    const document = await Document.findByDocumentId(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!document.hasAccess(req.userId, req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this document'
      });
    }

    req.document = document;
    next();
  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking document access'
    });
  }
};

// Helper: Calculate file checksum
async function calculateChecksum(filePath) {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * POST /api/documents/upload
 * Upload a new document
 */
router.post('/upload', authenticate, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const {
      title,
      description,
      type,
      category,
      applicationId,
      certificateId,
      inspectionId,
      accessLevel,
      tags,
      metadata
    } = req.body;

    // Validate required fields
    if (!title || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, type, category'
      });
    }

    // Calculate checksum
    const checksum = await calculateChecksum(req.file.path);

    // Create document
    const document = new Document({
      title,
      description,
      type,
      category,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      filepath: req.file.path,
      filesize: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.userId,
      uploadedBy: req.userId,
      applicationId,
      certificateId,
      inspectionId,
      accessLevel: accessLevel || AccessLevel.RESTRICTED,
      tags: tags ? JSON.parse(tags) : [],
      metadata: metadata ? JSON.parse(metadata) : {},
      checksum,
      status: DocumentStatus.UPLOADED
    });

    // Add first version
    document.versions.push({
      versionNumber: 1,
      filename: req.file.filename,
      filepath: req.file.path,
      filesize: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.userId,
      uploadedAt: new Date(),
      checksum
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentId: document.documentId,
        title: document.title,
        type: document.type,
        category: document.category,
        filesize: document.filesizeFormatted,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
});

/**
 * GET /api/documents
 * List all documents with filters
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      applicationId,
      certificateId,
      inspectionId,
      page = 1,
      limit = 20
    } = req.query;

    const query = { isDeleted: false };

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (applicationId) query.applicationId = applicationId;
    if (certificateId) query.certificateId = certificateId;
    if (inspectionId) query.inspectionId = inspectionId;

    // Role-based filtering
    if (req.userRole !== 'admin' && req.userRole !== 'manager') {
      query.$or = [
        { userId: req.userId },
        { accessLevel: AccessLevel.PUBLIC },
        { allowedUsers: req.userId },
        { allowedRoles: req.userRole }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('uploadedBy', 'name email')
        .populate('reviewedBy', 'name email')
        .lean(),
      Document.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing documents'
    });
  }
});

/**
 * GET /api/documents/:documentId
 * Get document metadata
 */
router.get('/:documentId', authenticate, checkDocumentAccess, async (req, res) => {
  try {
    const document = await Document.findByDocumentId(req.params.documentId)
      .populate('uploadedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('allowedUsers', 'name email');

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving document'
    });
  }
});

/**
 * GET /api/documents/:documentId/download
 * Download document file
 */
router.get('/:documentId/download', authenticate, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;

    // Check if file exists
    const fileExists = await fs
      .access(document.filepath)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Track download
    await document.trackDownload(req.userId);

    // Set headers
    res.setHeader('Content-Type', document.mimetype);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(document.originalFilename)}"`
    );
    res.setHeader('Content-Length', document.filesize);

    // Stream file
    const fileStream = require('fs').createReadStream(document.filepath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document'
    });
  }
});

/**
 * PUT /api/documents/:documentId
 * Update document metadata
 */
router.put('/:documentId', authenticate, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;
    const { title, description, tags, metadata, accessLevel } = req.body;

    if (title) document.title = title;
    if (description) document.description = description;
    if (tags) document.tags = JSON.parse(tags);
    if (metadata) document.metadata = JSON.parse(metadata);
    if (accessLevel) document.accessLevel = accessLevel;

    document.lastModifiedBy = req.userId;
    document.lastModifiedAt = new Date();

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document'
    });
  }
});

/**
 * POST /api/documents/:documentId/version
 * Upload new version of document
 */
router.post(
  '/:documentId/version',
  authenticate,
  checkDocumentAccess,
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const document = req.document;
      const { changeLog } = req.body;

      // Calculate checksum
      const checksum = await calculateChecksum(req.file.path);

      // Add new version
      await document.addVersion(
        {
          filename: req.file.filename,
          filepath: req.file.path,
          filesize: req.file.size,
          mimetype: req.file.mimetype,
          checksum
        },
        req.userId,
        changeLog
      );

      res.json({
        success: true,
        message: 'New version uploaded successfully',
        data: {
          documentId: document.documentId,
          currentVersion: document.currentVersion,
          totalVersions: document.versions.length
        }
      });
    } catch (error) {
      console.error('Version upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading new version'
      });
    }
  }
);

/**
 * GET /api/documents/:documentId/versions
 * Get all versions of a document
 */
router.get('/:documentId/versions', authenticate, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;

    res.json({
      success: true,
      data: {
        currentVersion: document.currentVersion,
        versions: document.versions
      }
    });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving versions'
    });
  }
});

/**
 * DELETE /api/documents/:documentId
 * Soft delete a document
 */
router.delete('/:documentId', authenticate, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;

    // Only owner, admin, or manager can delete
    if (document.userId.toString() !== req.userId && !['admin', 'manager'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this document'
      });
    }

    await document.softDelete(req.userId);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document'
    });
  }
});

/**
 * POST /api/documents/:documentId/approve
 * Approve a document
 */
router.post('/:documentId/approve', authenticate, async (req, res) => {
  try {
    // Only admin, manager, or inspector can approve
    if (!['admin', 'manager', 'inspector'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve documents'
      });
    }

    const document = await Document.findByDocumentId(req.params.documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const { notes } = req.body;
    await document.approve(req.userId, notes);

    res.json({
      success: true,
      message: 'Document approved successfully'
    });
  } catch (error) {
    console.error('Approve document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving document'
    });
  }
});

/**
 * POST /api/documents/:documentId/reject
 * Reject a document
 */
router.post('/:documentId/reject', authenticate, async (req, res) => {
  try {
    // Only admin, manager, or inspector can reject
    if (!['admin', 'manager', 'inspector'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reject documents'
      });
    }

    const document = await Document.findByDocumentId(req.params.documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const { notes } = req.body;
    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Rejection notes are required'
      });
    }

    await document.reject(req.userId, notes);

    res.json({
      success: true,
      message: 'Document rejected successfully'
    });
  } catch (error) {
    console.error('Reject document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting document'
    });
  }
});

/**
 * GET /api/documents/search
 * Search documents
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, type, category, status, limit = 50 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filters = {
      type,
      category,
      status,
      limit: parseInt(limit)
    };

    // Role-based filtering
    if (req.userRole !== 'admin' && req.userRole !== 'manager') {
      filters.userId = req.userId;
    }

    const documents = await Document.searchDocuments(q, filters);

    res.json({
      success: true,
      data: {
        query: q,
        total: documents.length,
        documents
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching documents'
    });
  }
});

/**
 * GET /api/documents/entity/:entityType/:entityId
 * Get documents for specific entity
 */
router.get('/entity/:entityType/:entityId', authenticate, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const documents = await Document.findByEntity(entityType, entityId);

    res.json({
      success: true,
      data: {
        entityType,
        entityId,
        total: documents.length,
        documents
      }
    });
  } catch (error) {
    console.error('Get entity documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving entity documents',
      error: error.message
    });
  }
});

/**
 * GET /api/documents/types
 * Get all document types
 */
router.get('/meta/types', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      types: Object.values(DocumentType),
      categories: Object.values(DocumentCategory),
      statuses: Object.values(DocumentStatus),
      accessLevels: Object.values(AccessLevel)
    }
  });
});

module.exports = router;
