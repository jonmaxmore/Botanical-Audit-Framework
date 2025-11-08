/**
 * Survey Management API Routes
 * RESTful API for managing GACP farmer surveys
 *
 * Version: 1.0
 * Base Path: /api/v1/surveys
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth-middleware');
const { validateRequest } = require('../middleware/validation-middleware');
const {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  getSurveyStats,
  getSurveyRegions,
  getSurveyByRegion
} = require('../controllers/surveyController');

// Public endpoints for survey participation
router.get('/regions', getSurveyRegions);

router.get('/region/:regionCode', getSurveyByRegion);

router.post('/submit/:regionCode', validateRequest('surveyResponse'), submitSurveyResponse);

// Survey list and search (authenticated)
router.get('/', authenticate, authorize(['director', 'auditor', 'admin']), getAllSurveys);

// Survey statistics
router.get('/stats', authenticate, authorize(['director', 'auditor', 'admin']), getSurveyStats);

// Get specific survey
router.get('/:id', authenticate, getSurveyById);

// Create new survey
router.post(
  '/',
  authenticate,
  authorize(['director', 'admin']),
  validateRequest('survey'),
  createSurvey
);

// Update survey
router.put(
  '/:id',
  authenticate,
  authorize(['director', 'admin']),
  validateRequest('survey'),
  updateSurvey
);

// Delete survey
router.delete('/:id', authenticate, authorize(['director', 'admin']), deleteSurvey);

module.exports = router;
