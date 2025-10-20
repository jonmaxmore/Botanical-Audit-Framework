/**
 * Application Routes
 *
 * RESTful API routes for GACP certification application management.
 *
 * @module routes/application.routes
 * @requires express
 * @requires controllers/application.controller
 * @requires middleware/auth.middleware - Authentication & authorization
 * @requires middleware/validation.middleware - Request validation
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-16
 */

const express = require('express');
const router = express.Router();

// Controllers
const applicationController = require('../controllers/application.controller');

// Middleware (use correct relative path from services/application)
const { authenticate, authorize } = require('../../auth/middleware/auth.middleware');
const {
  validateCreateApplication,
  validateUpdateApplication,
  validateApplicationId,
} = require('../middleware/validation.middleware');

// ========================================
// PUBLIC ROUTES (None for Application Service)
// ========================================

// All application routes require authentication

// ========================================
// PROTECTED ROUTES
// ========================================

/**
 * @route   POST /api/applications
 * @desc    Create new application (DRAFT state)
 * @access  Private (FARMER only)
 * @body    {farmName, farmAddress, farmSize, cultivationType, cannabisVariety}
 */
router.post(
  '/',
  authenticate,
  authorize(['FARMER']),
  validateCreateApplication,
  applicationController.createApplication
);

/**
 * @route   GET /api/applications
 * @desc    List applications (paginated, filtered)
 * @access  Private (FARMER: own apps, DTAM/ADMIN: all)
 * @query   {page, limit, state, province, sortBy, sortOrder}
 */
router.get('/', authenticate, applicationController.listApplications);

/**
 * @route   GET /api/applications/:id
 * @desc    Get application details by ID
 * @access  Private (FARMER: own app, DTAM/ADMIN: any)
 * @param   {String} id - Application ID (APP-YYYY-XXXXXXXX)
 */
router.get('/:id', authenticate, validateApplicationId, applicationController.getApplication);

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application (DRAFT or REVISION_REQUIRED only)
 * @access  Private (FARMER only, own application)
 * @param   {String} id - Application ID
 * @body    {farmName, farmAddress, farmSize, cultivationType, cannabisVariety}
 */
router.put(
  '/:id',
  authenticate,
  authorize(['FARMER']),
  validateApplicationId,
  validateUpdateApplication,
  applicationController.updateApplication
);

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete application (DRAFT only, soft delete)
 * @access  Private (FARMER only, own application)
 * @param   {String} id - Application ID
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['FARMER']),
  validateApplicationId,
  applicationController.deleteApplication
);

/**
 * @route   POST /api/applications/:id/submit
 * @desc    Submit application for review (DRAFT/REVISION_REQUIRED → SUBMITTED)
 * @access  Private (FARMER only, own application)
 * @param   {String} id - Application ID
 */
router.post(
  '/:id/submit',
  authenticate,
  authorize(['FARMER']),
  validateApplicationId,
  applicationController.submitApplication
);

/**
 * @route   GET /api/applications/:id/timeline
 * @desc    Get application state history timeline
 * @access  Private (FARMER: own app, DTAM/ADMIN: any)
 * @param   {String} id - Application ID
 */
router.get('/:id/timeline', authenticate, validateApplicationId, applicationController.getTimeline);

// ========================================
// DTAM ROUTES (Coming in Phase 2)
// ========================================

// TODO: Implement DTAM review routes
// POST /api/applications/:id/review - Assign reviewer
// POST /api/applications/:id/approve - Approve Phase 1
// POST /api/applications/:id/reject - Reject with reason
// POST /api/applications/:id/request-revision - Request changes
// GET /api/applications/queue - Get DTAM review queue

// ========================================
// INSPECTION ROUTES (Coming in Phase 2)
// ========================================

// TODO: Implement inspection routes
// POST /api/applications/:id/schedule-inspection - Schedule farm inspection
// POST /api/applications/:id/complete-inspection - Complete inspection with results

// ========================================
// DOCUMENT ROUTES (Coming in Phase 2)
// ========================================

// TODO: Implement document management routes
// POST /api/applications/:id/documents - Upload document
// GET /api/applications/:id/documents - List documents
// GET /api/applications/:id/documents/:docId - Download document
// DELETE /api/applications/:id/documents/:docId - Delete document

module.exports = router;
