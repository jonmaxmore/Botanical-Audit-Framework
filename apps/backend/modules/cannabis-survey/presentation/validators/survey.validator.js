/**
 * Survey Validators
 *
 * Input validation for cannabis survey operations using express-validator.
 *
 * @module presentation/validators/survey.validator
 */

const { body, validationResult } = require('express-validator');

// Validation rules for creating a survey
const validateCreateSurvey = [
  body('farmId')
    .notEmpty()
    .withMessage('Farm ID is required')
    .isMongoId()
    .withMessage('Invalid farm ID format'),

  body('surveyYear')
    .notEmpty()
    .withMessage('Survey year is required')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Invalid survey year'),

  body('surveyPeriod')
    .notEmpty()
    .withMessage('Survey period is required')
    .isString()
    .withMessage('Survey period must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Survey period must be between 1-50 characters'),

  body('purpose')
    .notEmpty()
    .withMessage('Cultivation purpose is required')
    .isIn(['RESEARCH', 'MEDICAL', 'INDUSTRIAL', 'EDUCATION'])
    .withMessage('Invalid cultivation purpose'),

  body('plantType')
    .notEmpty()
    .withMessage('Plant type is required')
    .isIn(['CANNABIS_SATIVA', 'CANNABIS_INDICA', 'HEMP', 'HYBRID'])
    .withMessage('Invalid plant type'),

  body('strainName')
    .optional()
    .isString()
    .withMessage('Strain name must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Strain name must be between 1-200 characters'),

  body('numberOfPlants')
    .notEmpty()
    .withMessage('Number of plants is required')
    .isInt({ min: 1 })
    .withMessage('Number of plants must be at least 1'),

  body('cultivationArea')
    .notEmpty()
    .withMessage('Cultivation area is required')
    .isFloat({ min: 0.01 })
    .withMessage('Cultivation area must be greater than 0'),

  body('areaUnit')
    .optional()
    .isIn(['rai', 'ngan', 'wa', 'sqm', 'hectare'])
    .withMessage('Invalid area unit'),

  body('plantingDate').optional().isISO8601().withMessage('Invalid planting date format'),

  body('expectedHarvestDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected harvest date format')
    .custom((value, { req }) => {
      if (req.body.plantingDate && value) {
        if (new Date(value) <= new Date(req.body.plantingDate)) {
          throw new Error('Expected harvest date must be after planting date');
        }
      }
      return true;
    }),

  body('growingMethod')
    .optional()
    .isString()
    .withMessage('Growing method must be a string')
    .isLength({ max: 200 })
    .withMessage('Growing method must not exceed 200 characters'),

  body('seedSource')
    .optional()
    .isString()
    .withMessage('Seed source must be a string')
    .isLength({ max: 200 })
    .withMessage('Seed source must not exceed 200 characters'),

  body('fertilizerUsed').optional().isArray().withMessage('Fertilizer used must be an array'),

  body('pesticideUsed').optional().isArray().withMessage('Pesticide used must be an array'),

  body('irrigationMethod')
    .optional()
    .isString()
    .withMessage('Irrigation method must be a string')
    .isLength({ max: 200 })
    .withMessage('Irrigation method must not exceed 200 characters'),

  body('expectedYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Expected yield cannot be negative'),

  body('yieldUnit').optional().isIn(['kg', 'g', 'ton']).withMessage('Invalid yield unit'),

  body('targetMarket')
    .optional()
    .isString()
    .withMessage('Target market must be a string')
    .isLength({ max: 500 })
    .withMessage('Target market must not exceed 500 characters'),

  body('additionalNotes')
    .optional()
    .isString()
    .withMessage('Additional notes must be a string')
    .isLength({ max: 2000 })
    .withMessage('Additional notes must not exceed 2000 characters'),

  body('thcContent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('THC content must be between 0-100%'),

  body('cbdContent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('CBD content must be between 0-100%'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation rules for updating a survey
const validateUpdateSurvey = [
  body('surveyYear').optional().isInt({ min: 2020, max: 2100 }).withMessage('Invalid survey year'),

  body('surveyPeriod')
    .optional()
    .isString()
    .withMessage('Survey period must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Survey period must be between 1-50 characters'),

  body('purpose')
    .optional()
    .isIn(['RESEARCH', 'MEDICAL', 'INDUSTRIAL', 'EDUCATION'])
    .withMessage('Invalid cultivation purpose'),

  body('plantType')
    .optional()
    .isIn(['CANNABIS_SATIVA', 'CANNABIS_INDICA', 'HEMP', 'HYBRID'])
    .withMessage('Invalid plant type'),

  body('strainName')
    .optional()
    .isString()
    .withMessage('Strain name must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Strain name must be between 1-200 characters'),

  body('numberOfPlants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of plants must be at least 1'),

  body('cultivationArea')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Cultivation area must be greater than 0'),

  body('areaUnit')
    .optional()
    .isIn(['rai', 'ngan', 'wa', 'sqm', 'hectare'])
    .withMessage('Invalid area unit'),

  body('plantingDate').optional().isISO8601().withMessage('Invalid planting date format'),

  body('expectedHarvestDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected harvest date format'),

  body('expectedYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Expected yield cannot be negative'),

  body('thcContent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('THC content must be between 0-100%'),

  body('cbdContent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('CBD content must be between 0-100%'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation rules for approving a survey
const validateApproveSurvey = [
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation rules for rejecting a survey
const validateRejectSurvey = [
  body('reason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10-1000 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation rules for requesting revision
const validateRequestRevision = [
  body('notes')
    .notEmpty()
    .withMessage('Revision notes are required')
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Notes must be between 10-1000 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  validateCreateSurvey,
  validateUpdateSurvey,
  validateApproveSurvey,
  validateRejectSurvey,
  validateRequestRevision,
};
