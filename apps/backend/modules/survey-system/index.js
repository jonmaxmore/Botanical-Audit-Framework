/**
 * 📊 Survey System Module Entry Point
 * 4-region GACP survey wizard system
 */

const SurveySystemService = require('./services/survey-system.service');
const createSurveyRoutes = require('./routes/survey.routes');
const logger = require('../shared/utils/logger');

/**
 * Initialize Survey System Module
 * @param {Object} dependencies - Module dependencies
 * @param {Object} dependencies.db - MongoDB database instance
 * @param {Function} dependencies.authenticateToken - Auth middleware
 * @returns {Object} Router and service instance
 */
async function initializeSurveySystem({ db, authenticateToken }) {
  try {
    logger.info('[SurveySystem] Initializing module...');

    // Validate dependencies
    if (!db) {
      throw new Error('Database instance is required');
    }
    if (!authenticateToken) {
      throw new Error('Authentication middleware is required');
    }

    // Initialize service
    const surveyService = new SurveySystemService(db);
    logger.info('[SurveySystem] Service initialized');

    // Create routes with authentication
    const router = createSurveyRoutes(surveyService);

    // Apply authentication middleware to all routes
    const protectedRouter = require('express').Router();
    protectedRouter.use(authenticateToken);
    protectedRouter.use('/surveys', router);

    logger.info('[SurveySystem] Module initialized successfully');

    return {
      router: protectedRouter,
      service: surveyService
    };
  } catch (error) {
    logger.error('[SurveySystem] Initialization failed:', error);
    throw error;
  }
}

/**
 * Survey System Configuration
 */
const config = {
  moduleName: 'survey-system',
  version: '1.0.0',
  description: '4-region GACP survey wizard system',

  // Survey configuration
  regions: ['central', 'southern', 'northern', 'northeastern'],
  totalSteps: 7,

  // Step configuration
  steps: {
    1: { name: 'regionSelection', title: 'Region Selection', required: true },
    2: { name: 'personalInfo', title: 'Personal Information', required: true },
    3: { name: 'farmInfo', title: 'Farm Information', required: true },
    4: { name: 'managementProduction', title: 'Management & Production', required: true },
    5: { name: 'costRevenue', title: 'Cost & Revenue', required: true },
    6: { name: 'marketSales', title: 'Market & Sales', required: true },
    7: { name: 'problemsNeeds', title: 'Problems & Needs', required: true }
  },

  // Scoring configuration
  scoring: {
    gacp: {
      max: 100,
      weights: {
        certification: 25,
        organicPractices: 15,
        sops: 20,
        qualityControl: 15
      }
    },
    sustainability: {
      max: 100,
      weights: {
        waterConservation: 20,
        organicFertilizer: 15,
        environmentalConcern: 15
      }
    },
    market: {
      max: 100,
      weights: {
        marketAccess: 20,
        directToConsumer: 15,
        exportMarket: 10
      }
    }
  },

  // Regional bonus configuration
  regionalBonus: {
    northern: {
      condition: 'sustainability >= 60',
      points: 10,
      reason: 'Mountain region sustainability excellence'
    },
    central: {
      condition: 'market >= 60',
      points: 10,
      reason: 'Central region market access excellence'
    },
    southern: {
      condition: 'gacp >= 60',
      points: 10,
      reason: 'Southern region GACP compliance excellence'
    },
    northeastern: {
      condition: 'sustainability >= 60',
      points: 10,
      reason: 'Northeastern region organic practices excellence'
    }
  },

  // API endpoints
  endpoints: {
    templates: 'GET /api/surveys/templates',
    templateByRegion: 'GET /api/surveys/templates/:region',
    startWizard: 'POST /api/surveys/wizard/start',
    getCurrentStep: 'GET /api/surveys/wizard/:surveyId/current',
    updateStep: 'PUT /api/surveys/wizard/:surveyId/step/:stepId',
    submitWizard: 'POST /api/surveys/wizard/:surveyId/submit',
    getProgress: 'GET /api/surveys/wizard/:surveyId/progress',
    getMySurveys: 'GET /api/surveys/my-surveys',
    getSurveyById: 'GET /api/surveys/:surveyId',
    deleteSurvey: 'DELETE /api/surveys/:surveyId',
    regionalAnalytics: 'GET /api/surveys/analytics/regional/:region',
    compareRegions: 'POST /api/surveys/analytics/compare',
    statistics: 'GET /api/surveys/statistics'
  }
};

module.exports = {
  initializeSurveySystem,
  config
};
