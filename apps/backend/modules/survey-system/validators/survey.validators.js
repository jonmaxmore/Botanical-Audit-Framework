/**
 * ✅ Survey System Validators
 * Input validation for 7-step wizard
 */

const { body, param, query } = require('express-validator');

/**
 * Start Wizard Validation
 */
const validateStartWizard = [
  body('region')
    .notEmpty()
    .withMessage('Region is required')
    .isIn(['central', 'southern', 'northern', 'northeastern'])
    .withMessage('Invalid region'),

  body('farmId').optional().isString().withMessage('Farm ID must be a string'),
];

/**
 * Update Step Validation
 */
const validateUpdateStep = [
  param('surveyId')
    .notEmpty()
    .withMessage('Survey ID is required')
    .isMongoId()
    .withMessage('Invalid survey ID format'),

  param('stepId')
    .notEmpty()
    .withMessage('Step ID is required')
    .isInt({ min: 1, max: 7 })
    .withMessage('Step ID must be between 1-7'),

  body('stepData')
    .notEmpty()
    .withMessage('Step data is required')
    .isObject()
    .withMessage('Step data must be an object'),
];

/**
 * Step 2: Personal Info Validation
 */
const validatePersonalInfo = [
  body('stepData.fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),

  body('stepData.phone')
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits'),

  body('stepData.email').optional().isEmail().withMessage('Invalid email format'),
];

/**
 * Step 3: Farm Info Validation
 */
const validateFarmInfo = [
  body('stepData.farmName')
    .notEmpty()
    .withMessage('Farm name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Farm name must be 2-100 characters'),

  body('stepData.farmArea')
    .notEmpty()
    .withMessage('Farm area is required')
    .isFloat({ min: 0.1 })
    .withMessage('Farm area must be greater than 0'),

  body('stepData.annualProduction')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual production must be positive'),
];

/**
 * Step 4: Management & Production Validation
 */
const validateManagementProduction = [
  body('stepData.hasGACPCertification')
    .isBoolean()
    .withMessage('GACP certification must be boolean'),

  body('stepData.useOrganicPractices').isBoolean().withMessage('Organic practices must be boolean'),

  body('stepData.certificationDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid certification date format'),
];

/**
 * Step 5: Cost & Revenue Validation
 */
const validateCostRevenue = [
  body('stepData.monthlyCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly cost must be positive'),

  body('stepData.monthlyRevenue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly revenue must be positive'),

  body('stepData.profitMargin')
    .optional()
    .isFloat({ min: -100, max: 100 })
    .withMessage('Profit margin must be between -100% to 100%'),
];

/**
 * Step 6: Market & Sales Validation
 */
const validateMarketSales = [
  body('stepData.hasMarketAccess').isBoolean().withMessage('Market access must be boolean'),

  body('stepData.directToConsumer').isBoolean().withMessage('Direct to consumer must be boolean'),

  body('stepData.mainMarkets').optional().isArray().withMessage('Main markets must be an array'),
];

/**
 * Step 7: Problems & Needs Validation
 */
const validateProblemsNeeds = [
  body('stepData.mainProblems').optional().isArray().withMessage('Main problems must be an array'),

  body('stepData.technicalNeeds')
    .optional()
    .isArray()
    .withMessage('Technical needs must be an array'),

  body('stepData.supportNeeded')
    .optional()
    .isString()
    .withMessage('Support needed must be a string'),
];

/**
 * Submit Wizard Validation
 */
const validateSubmitWizard = [
  param('surveyId')
    .notEmpty()
    .withMessage('Survey ID is required')
    .isMongoId()
    .withMessage('Invalid survey ID format'),
];

/**
 * Get Survey Validation
 */
const validateGetSurvey = [
  param('surveyId')
    .notEmpty()
    .withMessage('Survey ID is required')
    .isMongoId()
    .withMessage('Invalid survey ID format'),
];

/**
 * Regional Analytics Validation
 */
const validateRegionalAnalytics = [
  param('region')
    .notEmpty()
    .withMessage('Region is required')
    .isIn(['central', 'southern', 'northern', 'northeastern'])
    .withMessage('Invalid region'),
];

/**
 * Compare Regions Validation
 */
const validateCompareRegions = [
  body('regions')
    .notEmpty()
    .withMessage('Regions are required')
    .isArray({ min: 2 })
    .withMessage('At least 2 regions required')
    .custom(regions => {
      const validRegions = ['central', 'southern', 'northern', 'northeastern'];
      return regions.every(r => validRegions.includes(r));
    })
    .withMessage('Invalid region in list'),
];

/**
 * Query Filters Validation
 */
const validateQueryFilters = [
  query('status').optional().isIn(['DRAFT', 'COMPLETE', 'SUBMITTED']).withMessage('Invalid status'),

  query('region')
    .optional()
    .isIn(['central', 'southern', 'northern', 'northeastern'])
    .withMessage('Invalid region'),
];

/**
 * Dynamic Step Validation
 * Validate based on step number
 */
function getStepValidator(stepNumber) {
  switch (stepNumber) {
    case 1:
      return []; // Region selection (minimal validation)
    case 2:
      return validatePersonalInfo;
    case 3:
      return validateFarmInfo;
    case 4:
      return validateManagementProduction;
    case 5:
      return validateCostRevenue;
    case 6:
      return validateMarketSales;
    case 7:
      return validateProblemsNeeds;
    default:
      return [];
  }
}

/**
 * Validation Error Handler Middleware
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

module.exports = {
  validateStartWizard,
  validateUpdateStep,
  validatePersonalInfo,
  validateFarmInfo,
  validateManagementProduction,
  validateCostRevenue,
  validateMarketSales,
  validateProblemsNeeds,
  validateSubmitWizard,
  validateGetSurvey,
  validateRegionalAnalytics,
  validateCompareRegions,
  validateQueryFilters,
  getStepValidator,
  handleValidationErrors,
};
