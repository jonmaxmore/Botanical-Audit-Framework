/**
 * Survey Routes
 *
 * Express routes for cannabis survey operations.
 * Separates farmer routes and DTAM routes.
 *
 * @module presentation/routes/survey.routes
 */

const express = require('express');

function createSurveyRoutes(controller, authMiddleware, validators) {
  // Farmer routes
  const farmerRouter = express.Router();

  // Create survey
  farmerRouter.post(
    '/',
    authMiddleware.authenticateFarmer,
    validators.validateCreateSurvey,
    (req, res) => controller.createSurvey(req, res)
  );

  // List surveys (farmer sees own surveys)
  farmerRouter.get('/', authMiddleware.authenticateFarmer, (req, res) =>
    controller.listSurveys(req, res)
  );

  // Get survey details
  farmerRouter.get('/:id', authMiddleware.authenticateFarmer, (req, res) =>
    controller.getSurveyDetails(req, res)
  );

  // Update survey
  farmerRouter.put(
    '/:id',
    authMiddleware.authenticateFarmer,
    validators.validateUpdateSurvey,
    (req, res) => controller.updateSurvey(req, res)
  );

  // Submit survey for review
  farmerRouter.post('/:id/submit', authMiddleware.authenticateFarmer, (req, res) =>
    controller.submitSurvey(req, res)
  );

  // DTAM routes
  const dtamRouter = express.Router();

  // List all surveys (with filters)
  dtamRouter.get(
    '/',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requireAnyPermission(['view_surveys', 'review_surveys']),
    (req, res) => controller.listSurveys(req, res)
  );

  // Get survey details
  dtamRouter.get(
    '/:id',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requireAnyPermission(['view_surveys', 'review_surveys']),
    (req, res) => controller.getSurveyDetails(req, res)
  );

  // Start survey review
  dtamRouter.post(
    '/:id/start-review',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('review_surveys'),
    (req, res) => controller.startSurveyReview(req, res)
  );

  // Approve survey
  dtamRouter.post(
    '/:id/approve',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('approve_surveys'),
    validators.validateApproveSurvey,
    (req, res) => controller.approveSurvey(req, res)
  );

  // Reject survey
  dtamRouter.post(
    '/:id/reject',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('reject_surveys'),
    validators.validateRejectSurvey,
    (req, res) => controller.rejectSurvey(req, res)
  );

  // Request survey revision
  dtamRouter.post(
    '/:id/request-revision',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('review_surveys'),
    validators.validateRequestRevision,
    (req, res) => controller.requestSurveyRevision(req, res)
  );

  return {
    farmerRouter,
    dtamRouter
  };
}

module.exports = createSurveyRoutes;
