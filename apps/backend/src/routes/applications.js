/**
 * Application Management API Routes
 * RESTful API for managing GACP certification applications
 *
 * Version: 1.0
 * Base Path: /api/v1/applications
 */

const express = require('express');
const router = express.Router();
const { authenticateToken: authenticate, requireRole: authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  submitApplication,
  reviewApplication,
  getApplicationStats
} = require('../controllers/applicationController');

// Application list and search
router.get('/', authenticate, getAllApplications);

// Application statistics
router.get(
  '/stats',
  authenticate,
  authorize(['director', 'auditor', 'admin']),
  getApplicationStats
);

// Get specific application
router.get('/:id', authenticate, getApplicationById);

// Create new application
router.post(
  '/',
  authenticate,
  authorize(['farmer']),
  validateRequest('application'),
  createApplication
);

// Submit application for review
router.post('/:id/submit', authenticate, authorize(['farmer']), submitApplication);

// Review application
router.post(
  '/:id/review',
  authenticate,
  authorize(['director', 'auditor']),
  validateRequest('applicationReview'),
  reviewApplication
);

// Update application
router.put('/:id', authenticate, validateRequest('application'), updateApplication);

// Delete application
router.delete('/:id', authenticate, deleteApplication);

module.exports = router;
