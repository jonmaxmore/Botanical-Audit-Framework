/**
 * Application Controller
 *
 * Handles GACP certification application CRUD operations and workflow.
 * Implements 12-state FSM (Finite State Machine) for application lifecycle.
 *
 * @module controllers/application.controller
 * @requires Application - Application model with FSM logic
 * @requires User - User model for farmer information
 * @requires AuditLog - Audit logging for compliance
 *
 * @standards
 * - RESTful API design principles
 * - OWASP security best practices
 * - Error handling with proper HTTP status codes
 * - Audit logging for all state changes
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-16
 */

const Application = require('../../../../database/models/Application.model');
const User = require('../../../../database/models/User.model');
const AuditLog = require('../../../../database/models/AuditLog.model');

/**
 * Create new application (DRAFT state)
 *
 * @route POST /api/applications
 * @access Private (FARMER only)
 * @param {Object} req.body - Application data
 * @param {String} req.body.farmName - Farm name
 * @param {Object} req.body.farmAddress - Farm address with GPS
 * @param {Number} req.body.farmSize - Farm size in specified unit
 * @param {String} req.body.cultivationType - INDOOR|OUTDOOR|GREENHOUSE
 * @param {String} req.body.cannabisVariety - CBD|THC|MIXED
 * @returns {Object} 201 - Created application
 */
exports.createApplication = async(req, res) => {
  try {
    const {
      farmName,
      farmAddress,
      farmSize,
      farmSizeUnit = 'rai',
      cultivationType,
      cannabisVariety
    } = req.body;

    // Get user information
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate user role
    if (user.role !== 'FARMER') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can create applications'
      });
    }

    // Generate unique IDs
    const applicationId = await Application.generateApplicationId();
    const applicationNumber = await Application.generateApplicationNumber();

    // Create application
    const application = await Application.create({
      applicationId,
      applicationNumber,
      userId: user.userId,
      farmerName: user.fullName,
      farmerEmail: user.email,
      farmerPhone: user.phoneNumber, // ✅ FIXED: Use phoneNumber not phone
      farmName,
      farmAddress,
      farmSize,
      farmSizeUnit,
      cultivationType,
      cannabisVariety,
      state: 'DRAFT',
      stateChangedAt: new Date(),
      stateHistory: [
        {
          state: 'DRAFT',
          enteredAt: new Date(),
          exitedAt: null,
          duration: null,
          actor: user.userId,
          actorRole: 'FARMER',
          notes: 'Application created'
        }
      ]
    });

    // Audit log
    await AuditLog.create({
      userId: user.userId,
      action: 'APPLICATION_CREATED',
      resource: 'Application',
      resourceId: application.applicationId,
      details: {
        applicationNumber: application.applicationNumber,
        farmName: application.farmName
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: {
        application: {
          applicationId: application.applicationId,
          applicationNumber: application.applicationNumber,
          farmName: application.farmName,
          state: application.state,
          progress: application.calculateProgress(),
          createdAt: application.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create application error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create application'
    });
  }
};

/**
 * List applications (with pagination and filters)
 *
 * @route GET /api/applications
 * @access Private (FARMER: own applications, DTAM/ADMIN: all)
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Items per page (default: 10, max: 100)
 * @query {String} state - Filter by state
 * @query {String} province - Filter by province
 * @returns {Object} 200 - List of applications with pagination
 */
exports.listApplications = async(req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      state,
      province,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query
    const query = {
      isActive: true,
      isDeleted: false
    };

    // Farmers can only see their own applications
    if (user.role === 'FARMER') {
      query.userId = user.userId;
    }

    // Apply filters
    if (state) {
      query.state = state;
    }

    if (province) {
      query['farmAddress.province'] = province;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-stateHistory -dtamReview') // Exclude large fields
        .lean(),
      Application.countDocuments(query)
    ]);

    // Add progress to each application
    const applicationsWithProgress = applications.map(app => ({
      ...app,
      progress: calculateProgressForState(app.state)
    }));

    res.status(200).json({
      success: true,
      data: {
        applications: applicationsWithProgress,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('List applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list applications'
    });
  }
};

/**
 * Get application details by ID
 *
 * @route GET /api/applications/:id
 * @access Private (FARMER: own application, DTAM/ADMIN: any)
 * @param {String} req.params.id - Application ID
 * @returns {Object} 200 - Application details
 */
exports.getApplication = async(req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find application
    const application = await Application.findOne({
      applicationId: id,
      isActive: true,
      isDeleted: false
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Authorization check
    if (user.role === 'FARMER' && application.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own applications'
      });
    }

    // Audit log
    await AuditLog.create({
      userId: user.userId,
      action: 'APPLICATION_VIEWED',
      resource: 'Application',
      resourceId: application.applicationId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      data: {
        application: {
          ...application.toJSON(),
          progress: application.calculateProgress()
        }
      }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application'
    });
  }
};

/**
 * Update application (DRAFT state only)
 *
 * @route PUT /api/applications/:id
 * @access Private (FARMER only, own application)
 * @param {String} req.params.id - Application ID
 * @param {Object} req.body - Updated fields
 * @returns {Object} 200 - Updated application
 */
exports.updateApplication = async(req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find application
    const application = await Application.findOne({
      applicationId: id,
      isActive: true,
      isDeleted: false
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Authorization
    if (application.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own applications'
      });
    }

    // Can only update DRAFT or REVISION_REQUIRED states
    if (!['DRAFT', 'REVISION_REQUIRED'].includes(application.state)) {
      return res.status(400).json({
        success: false,
        message: 'Can only update applications in DRAFT or REVISION_REQUIRED state'
      });
    }

    // Allowed fields to update
    const allowedFields = [
      'farmName',
      'farmAddress',
      'farmSize',
      'farmSizeUnit',
      'cultivationType',
      'cannabisVariety'
    ];

    // Apply updates
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        application[field] = updates[field];
      }
    });

    await application.save();

    // Audit log
    await AuditLog.create({
      userId: user.userId,
      action: 'APPLICATION_UPDATED',
      resource: 'Application',
      resourceId: application.applicationId,
      details: {
        updatedFields: Object.keys(updates)
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: {
        application: {
          ...application.toJSON(),
          progress: application.calculateProgress()
        }
      }
    });
  } catch (error) {
    console.error('Update application error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
};

/**
 * Delete application (DRAFT state only, soft delete)
 *
 * @route DELETE /api/applications/:id
 * @access Private (FARMER only, own application)
 * @param {String} req.params.id - Application ID
 * @returns {Object} 200 - Deletion confirmation
 */
exports.deleteApplication = async(req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find application
    const application = await Application.findOne({
      applicationId: id,
      isActive: true,
      isDeleted: false
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Authorization
    if (application.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own applications'
      });
    }

    // Can only delete DRAFT state
    if (application.state !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete applications in DRAFT state'
      });
    }

    // Soft delete
    application.isDeleted = true;
    application.isActive = false;
    application.deletedAt = new Date();
    await application.save();

    // Audit log
    await AuditLog.create({
      userId: user.userId,
      action: 'APPLICATION_DELETED',
      resource: 'Application',
      resourceId: application.applicationId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application'
    });
  }
};

/**
 * Submit application for review (DRAFT → SUBMITTED)
 *
 * @route POST /api/applications/:id/submit
 * @access Private (FARMER only, own application)
 * @param {String} req.params.id - Application ID
 * @returns {Object} 200 - Submitted application
 */
exports.submitApplication = async(req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find application
    const application = await Application.findOne({
      applicationId: id,
      isActive: true,
      isDeleted: false
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Authorization
    if (application.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit your own applications'
      });
    }

    // Validate state
    if (!['DRAFT', 'REVISION_REQUIRED'].includes(application.state)) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit application in ${application.state} state`
      });
    }

    // Validate required documents (TODO: implement document check)
    if (!application.requiredDocumentsComplete) {
      return res.status(400).json({
        success: false,
        message: 'Please upload all required documents before submitting'
      });
    }

    // Transition to SUBMITTED
    await application.transitionTo(
      'SUBMITTED',
      user.userId,
      'FARMER',
      'Application submitted for DTAM review'
    );

    // Auto-transition to UNDER_REVIEW (immediate)
    await application.transitionTo(
      'UNDER_REVIEW',
      'SYSTEM',
      'SYSTEM',
      'Automatically moved to review queue'
    );

    // Audit log
    await AuditLog.create({
      userId: user.userId,
      action: 'APPLICATION_SUBMITTED',
      resource: 'Application',
      resourceId: application.applicationId,
      details: {
        previousState: 'DRAFT',
        newState: 'UNDER_REVIEW'
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          applicationId: application.applicationId,
          applicationNumber: application.applicationNumber,
          state: application.state,
          progress: application.calculateProgress(),
          submittedAt: application.submittedAt
        }
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};

/**
 * Get application timeline (state history)
 *
 * @route GET /api/applications/:id/timeline
 * @access Private (FARMER: own application, DTAM/ADMIN: any)
 * @param {String} req.params.id - Application ID
 * @returns {Object} 200 - Timeline events
 */
exports.getTimeline = async(req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find application
    const application = await Application.findOne({
      applicationId: id,
      isActive: true,
      isDeleted: false
    }).select('applicationId applicationNumber userId state stateHistory'); // ✅ FIXED: Added userId for authorization check

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Authorization - check if farmer viewing their own application
    if (user.role === 'FARMER' && application.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own application timeline'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        timeline: application.stateHistory.map(event => ({
          state: event.state,
          enteredAt: event.enteredAt,
          exitedAt: event.exitedAt,
          durationDays: event.duration ? Math.floor(event.duration / (1000 * 60 * 60 * 24)) : null,
          actor: event.actorRole,
          notes: event.notes
        }))
      }
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timeline'
    });
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Calculate progress percentage for a state
 * @param {String} state - Application state
 * @returns {Number} Progress percentage (0-100)
 */
function calculateProgressForState(state) {
  const stateProgress = {
    DRAFT: 0,
    SUBMITTED: 10,
    UNDER_REVIEW: 20,
    PAYMENT_PENDING: 30,
    PAYMENT_VERIFIED: 40,
    INSPECTION_SCHEDULED: 50,
    INSPECTION_COMPLETED: 60,
    PHASE2_PAYMENT_PENDING: 70,
    PHASE2_PAYMENT_VERIFIED: 80,
    APPROVED: 90,
    CERTIFICATE_ISSUED: 100,
    REJECTED: 0,
    REVISION_REQUIRED: 15,
    EXPIRED: 0
  };

  return stateProgress[state] || 0;
}
