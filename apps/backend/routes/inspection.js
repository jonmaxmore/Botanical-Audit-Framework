/**
 * Inspection API Routes
 * Endpoints for field inspection management
 *
 * Features:
 * - Inspection CRUD operations
 * - Scheduling and assignment
 * - Photo upload
 * - Checklist management
 * - Scoring and evaluation
 * - Statistics and reporting
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Inspection = require('../models/Inspection');
const Application = require('../models/Application');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const logger = require('../config/logger');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../storage/inspections/photos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `inspection-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
});

/**
 * @route   POST /api/inspections
 * @desc    Create new inspection
 * @access  Private (Admin, Inspector)
 */
router.post('/', authenticate, authorize(['admin', 'inspector']), async (req, res) => {
  try {
    const { application, inspectionType, scheduledDate, inspector, assistantInspectors, siteInfo } =
      req.body;

    // Validate application exists and is approved
    const app = await Application.findById(application);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (app.currentStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only create inspections for approved applications'
      });
    }

    // Create inspection
    const inspection = new Inspection({
      application,
      inspectionType: inspectionType || 'initial',
      scheduledDate,
      inspector: inspector || req.user.userId,
      assistantInspectors,
      siteInfo: siteInfo || {
        farmName: app.basicInfo?.farmName,
        contactPerson: app.basicInfo?.ownerName,
        contactPhone: app.basicInfo?.phone,
        address: app.basicInfo?.address,
        gpsCoordinates: app.farmDetails?.gpsCoordinates
      }
    });

    await inspection.save();

    logger.info('Inspection created', {
      inspectionId: inspection._id,
      applicationId: application,
      inspector: inspector || req.user.userId
    });

    res.status(201).json({
      success: true,
      data: inspection
    });
  } catch (error) {
    logger.error('Error creating inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inspection',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/inspections
 * @desc    List inspections with filters
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      status,
      inspector,
      application,
      fromDate,
      toDate,
      inspectionType,
      page = 1,
      limit = 20,
      sort = '-scheduledDate'
    } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'inspector') {
      query.inspector = req.user.userId;
    } else if (req.user.role === 'farmer') {
      // Farmers can only see their own application's inspections
      const userApplications = await Application.find({
        'basicInfo.ownerName': req.user.fullName
      }).select('_id');
      query.application = { $in: userApplications.map(a => a._id) };
    }

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (inspector && req.user.role === 'admin') {
      query.inspector = inspector;
    }

    if (application) {
      query.application = application;
    }

    if (inspectionType) {
      query.inspectionType = inspectionType;
    }

    if (fromDate || toDate) {
      query.scheduledDate = {};
      if (fromDate) query.scheduledDate.$gte = new Date(fromDate);
      if (toDate) query.scheduledDate.$lte = new Date(toDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inspections, total] = await Promise.all([
      Inspection.find(query)
        .populate('application', 'applicationNumber basicInfo currentStatus')
        .populate('inspector', 'fullName email phone')
        .populate('assistantInspectors', 'fullName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Inspection.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: inspections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error listing inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list inspections',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/inspections/upcoming
 * @desc    Get upcoming inspections
 * @access  Private (Inspector, Admin)
 */
router.get('/upcoming', authenticate, authorize(['admin', 'inspector']), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const inspections = await Inspection.findUpcoming(parseInt(days));

    res.json({
      success: true,
      data: inspections,
      count: inspections.length
    });
  } catch (error) {
    logger.error('Error fetching upcoming inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming inspections',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/inspections/overdue
 * @desc    Get overdue inspections
 * @access  Private (Admin)
 */
router.get('/overdue', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const inspections = await Inspection.findOverdue();

    res.json({
      success: true,
      data: inspections,
      count: inspections.length
    });
  } catch (error) {
    logger.error('Error fetching overdue inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue inspections',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/inspections/statistics
 * @desc    Get inspection statistics
 * @access  Private (Admin, Inspector)
 */
router.get('/statistics', authenticate, authorize(['admin', 'inspector']), async (req, res) => {
  try {
    const { inspector, fromDate, toDate } = req.query;

    const filters = {};
    if (inspector) filters.inspector = inspector;
    if (fromDate) filters.fromDate = new Date(fromDate);
    if (toDate) filters.toDate = new Date(toDate);

    // If inspector role, only show their stats
    if (req.user.role === 'inspector') {
      filters.inspector = req.user.userId;
    }

    const stats = await Inspection.getStatistics(filters);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/inspections/:id
 * @desc    Get inspection details
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('application')
      .populate('inspector', 'fullName email phone')
      .populate('assistantInspectors', 'fullName email')
      .populate('reviewedBy', 'fullName email');

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'inspector' && inspection.inspector._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this inspection'
      });
    }

    res.json({
      success: true,
      data: inspection
    });
  } catch (error) {
    logger.error('Error fetching inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/inspections/:id
 * @desc    Update inspection
 * @access  Private (Inspector, Admin)
 */
router.put('/:id', authenticate, authorize(['admin', 'inspector']), async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Check permissions
    if (req.user.role === 'inspector' && inspection.inspector.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this inspection'
      });
    }

    // Prevent updates to completed inspections
    if (inspection.status === 'completed' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed inspections'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'checklist',
      'observations',
      'weatherConditions',
      'inspectorNotes',
      'farmerFeedback'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        inspection[field] = req.body[field];
      }
    });

    await inspection.save();

    logger.info('Inspection updated', {
      inspectionId: inspection._id,
      updatedBy: req.user.userId
    });

    res.json({
      success: true,
      data: inspection
    });
  } catch (error) {
    logger.error('Error updating inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inspection',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/inspections/:id/start
 * @desc    Start inspection
 * @access  Private (Inspector)
 */
router.post('/:id/start', authenticate, authorize(['admin', 'inspector']), async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Check permissions
    if (req.user.role === 'inspector' && inspection.inspector.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this inspection'
      });
    }

    await inspection.startInspection();

    logger.info('Inspection started', {
      inspectionId: inspection._id,
      startedBy: req.user.userId
    });

    res.json({
      success: true,
      data: inspection
    });
  } catch (error) {
    logger.error('Error starting inspection:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/inspections/:id/complete
 * @desc    Complete inspection
 * @access  Private (Inspector, Admin)
 */
router.post('/:id/complete', authenticate, authorize(['admin', 'inspector']), async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Check permissions
    if (req.user.role === 'inspector' && inspection.inspector.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this inspection'
      });
    }

    // Calculate final score
    inspection.calculateScore();

    // Complete the inspection
    await inspection.completeInspection();

    logger.info('Inspection completed', {
      inspectionId: inspection._id,
      completedBy: req.user.userId,
      finalScore: inspection.scoring.totalScore
    });

    res.json({
      success: true,
      data: inspection
    });
  } catch (error) {
    logger.error('Error completing inspection:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/inspections/:id/cancel
 * @desc    Cancel inspection
 * @access  Private (Admin)
 */
router.post('/:id/cancel', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    await inspection.cancelInspection(reason);

    logger.info('Inspection cancelled', {
      inspectionId: inspection._id,
      cancelledBy: req.user.userId,
      reason
    });

    res.json({
      success: true,
      data: inspection
    });
  } catch (error) {
    logger.error('Error cancelling inspection:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/inspections/:id/reschedule
 * @desc    Reschedule inspection
 * @access  Private (Admin, Inspector)
 */
router.post(
  '/:id/reschedule',
  authenticate,
  authorize(['admin', 'inspector']),
  async (req, res) => {
    try {
      const { newDate, reason } = req.body;

      if (!newDate || !reason) {
        return res.status(400).json({
          success: false,
          message: 'New date and reason are required'
        });
      }

      const inspection = await Inspection.findById(req.params.id);

      if (!inspection) {
        return res.status(404).json({
          success: false,
          message: 'Inspection not found'
        });
      }

      // Check permissions
      if (req.user.role === 'inspector' && inspection.inspector.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to reschedule this inspection'
        });
      }

      await inspection.rescheduleInspection(new Date(newDate), reason);

      logger.info('Inspection rescheduled', {
        inspectionId: inspection._id,
        rescheduledBy: req.user.userId,
        newDate,
        reason
      });

      res.json({
        success: true,
        data: inspection
      });
    } catch (error) {
      logger.error('Error rescheduling inspection:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/inspections/:id/photos
 * @desc    Upload photos to inspection
 * @access  Private (Inspector)
 */
router.post(
  '/:id/photos',
  authenticate,
  authorize(['admin', 'inspector']),
  upload.array('photos', 20),
  async (req, res) => {
    try {
      const inspection = await Inspection.findById(req.params.id);

      if (!inspection) {
        // Clean up uploaded files
        if (req.files) {
          await Promise.all(req.files.map(file => fs.unlink(file.path).catch(() => {})));
        }
        return res.status(404).json({
          success: false,
          message: 'Inspection not found'
        });
      }

      // Check permissions
      if (req.user.role === 'inspector' && inspection.inspector.toString() !== req.user.userId) {
        // Clean up uploaded files
        if (req.files) {
          await Promise.all(req.files.map(file => fs.unlink(file.path).catch(() => {})));
        }
        return res.status(403).json({
          success: false,
          message: 'Not authorized to upload photos for this inspection'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Parse additional data from request body
      const photoMetadata = req.body.metadata ? JSON.parse(req.body.metadata) : [];

      // Add photos to inspection
      const photos = req.files.map((file, index) => {
        const metadata = photoMetadata[index] || {};
        return {
          url: `/storage/inspections/photos/${file.filename}`,
          caption: metadata.caption || '',
          category: metadata.category || 'other',
          gpsCoordinates: metadata.gpsCoordinates || {},
          metadata: {
            fileSize: file.size,
            mimeType: file.mimetype,
            dimensions: metadata.dimensions || {}
          }
        };
      });

      photos.forEach(photo => {
        inspection.photos.push(photo);
      });

      await inspection.save();

      logger.info('Photos uploaded to inspection', {
        inspectionId: inspection._id,
        photoCount: photos.length,
        uploadedBy: req.user.userId
      });

      res.json({
        success: true,
        data: {
          photos,
          totalPhotos: inspection.photos.length
        }
      });
    } catch (error) {
      logger.error('Error uploading photos:', error);
      // Clean up uploaded files on error
      if (req.files) {
        await Promise.all(req.files.map(file => fs.unlink(file.path).catch(() => {})));
      }
      res.status(500).json({
        success: false,
        message: 'Failed to upload photos',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/inspections/:id/photos/:photoId
 * @desc    Delete photo from inspection
 * @access  Private (Inspector, Admin)
 */
router.delete(
  '/:id/photos/:photoId',
  authenticate,
  authorize(['admin', 'inspector']),
  async (req, res) => {
    try {
      const inspection = await Inspection.findById(req.params.id);

      if (!inspection) {
        return res.status(404).json({
          success: false,
          message: 'Inspection not found'
        });
      }

      // Check permissions
      if (req.user.role === 'inspector' && inspection.inspector.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete photos from this inspection'
        });
      }

      const photo = inspection.photos.id(req.params.photoId);
      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        });
      }

      // Delete file from filesystem
      const filePath = path.join(__dirname, '../..', photo.url);
      await fs.unlink(filePath).catch(() => {});

      // Remove from array
      inspection.photos.pull(req.params.photoId);
      await inspection.save();

      logger.info('Photo deleted from inspection', {
        inspectionId: inspection._id,
        photoId: req.params.photoId,
        deletedBy: req.user.userId
      });

      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting photo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete photo',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/inspections/:id/checklist/:itemId
 * @desc    Update checklist item
 * @access  Private (Inspector)
 */
router.put(
  '/:id/checklist/:itemId',
  authenticate,
  authorize(['admin', 'inspector']),
  async (req, res) => {
    try {
      const inspection = await Inspection.findById(req.params.id);

      if (!inspection) {
        return res.status(404).json({
          success: false,
          message: 'Inspection not found'
        });
      }

      // Check permissions
      if (req.user.role === 'inspector' && inspection.inspector.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this inspection'
        });
      }

      await inspection.updateChecklistItem(req.params.itemId, req.body);

      // Recalculate score after checklist update
      inspection.calculateScore();
      await inspection.save();

      logger.info('Checklist item updated', {
        inspectionId: inspection._id,
        itemId: req.params.itemId,
        updatedBy: req.user.userId
      });

      res.json({
        success: true,
        data: inspection
      });
    } catch (error) {
      logger.error('Error updating checklist item:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/inspections/:id/observations
 * @desc    Add observation to inspection
 * @access  Private (Inspector)
 */
router.post(
  '/:id/observations',
  authenticate,
  authorize(['admin', 'inspector']),
  async (req, res) => {
    try {
      const inspection = await Inspection.findById(req.params.id);

      if (!inspection) {
        return res.status(404).json({
          success: false,
          message: 'Inspection not found'
        });
      }

      // Check permissions
      if (req.user.role === 'inspector' && inspection.inspector.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to add observations to this inspection'
        });
      }

      await inspection.addObservation(req.body);

      logger.info('Observation added to inspection', {
        inspectionId: inspection._id,
        observationType: req.body.type,
        addedBy: req.user.userId
      });

      res.json({
        success: true,
        data: inspection
      });
    } catch (error) {
      logger.error('Error adding observation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add observation',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/inspections/:id
 * @desc    Delete inspection
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Delete all associated photos
    if (inspection.photos && inspection.photos.length > 0) {
      await Promise.all(
        inspection.photos.map(photo => {
          const filePath = path.join(__dirname, '../..', photo.url);
          return fs.unlink(filePath).catch(() => {});
        })
      );
    }

    await inspection.deleteOne();

    logger.info('Inspection deleted', {
      inspectionId: inspection._id,
      deletedBy: req.user.userId
    });

    res.json({
      success: true,
      message: 'Inspection deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inspection',
      error: error.message
    });
  }
});

module.exports = router;
