/**
 * 📊 Survey System Routes
 * API endpoints for 4-region GACP survey system
 */

const express = require('express');
const SurveySystemController = require('../controllers/survey-system.controller');

/**
 * Initialize survey routes
 */
function createSurveyRoutes(surveyService) {
  const router = express.Router();
  const controller = new SurveySystemController(surveyService);

  // ==========================================
  // 🎯 Survey Templates
  // ==========================================

  /**
   * @route   GET /api/surveys/templates
   * @desc    Get all survey templates (4 regions)
   * @access  Private (Farmer)
   */
  router.get('/templates', async (req, res) => {
    try {
      const templates = [
        {
          id: 'template-central',
          region: 'central',
          name: 'Central Region Survey',
          description: 'Survey for central region farms',
          totalSteps: 7
        },
        {
          id: 'template-southern',
          region: 'southern',
          name: 'Southern Region Survey',
          description: 'Survey for southern region farms',
          totalSteps: 7
        },
        {
          id: 'template-northern',
          region: 'northern',
          name: 'Northern Region Survey',
          description: 'Survey for northern region farms',
          totalSteps: 7
        },
        {
          id: 'template-northeastern',
          region: 'northeastern',
          name: 'Northeastern Region Survey',
          description: 'Survey for northeastern region farms',
          totalSteps: 7
        }
      ];

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * @route   GET /api/surveys/templates/:region
   * @desc    Get survey template for specific region
   * @access  Private (Farmer)
   */
  router.get('/templates/:region', async (req, res) => {
    try {
      const { region } = req.params;
      const validRegions = ['central', 'southern', 'northern', 'northeastern'];

      if (!validRegions.includes(region.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid region',
          validRegions
        });
      }

      // In production, load from templates/ folder
      const template = {
        id: `template-${region}`,
        region: region.toLowerCase(),
        name: `${region.charAt(0).toUpperCase() + region.slice(1)} Region Survey`,
        description: `Survey for ${region} region farms`,
        totalSteps: 7,
        steps: [
          { step: 1, name: 'regionSelection', title: 'Region Selection' },
          { step: 2, name: 'personalInfo', title: 'Personal Information' },
          { step: 3, name: 'farmInfo', title: 'Farm Information' },
          { step: 4, name: 'managementProduction', title: 'Management & Production' },
          { step: 5, name: 'costRevenue', title: 'Cost & Revenue' },
          { step: 6, name: 'marketSales', title: 'Market & Sales' },
          { step: 7, name: 'problemsNeeds', title: 'Problems & Needs' }
        ]
      };

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // ==========================================
  // 🧙 Survey Wizard
  // ==========================================

  /**
   * @route   POST /api/surveys/wizard/start
   * @desc    Start new survey wizard
   * @access  Private (Farmer)
   */
  router.post('/wizard/start', controller.startWizard);

  /**
   * @route   GET /api/surveys/wizard/:surveyId/current
   * @desc    Get current wizard step
   * @access  Private (Farmer)
   */
  router.get('/wizard/:surveyId/current', controller.getCurrentStep);

  /**
   * @route   PUT /api/surveys/wizard/:surveyId/step/:stepId
   * @desc    Update wizard step data
   * @access  Private (Farmer)
   */
  router.put('/wizard/:surveyId/step/:stepId', controller.updateStep);

  /**
   * @route   POST /api/surveys/wizard/:surveyId/submit
   * @desc    Submit completed wizard
   * @access  Private (Farmer)
   */
  router.post('/wizard/:surveyId/submit', controller.submitWizard);

  /**
   * @route   GET /api/surveys/wizard/:surveyId/progress
   * @desc    Get wizard progress overview
   * @access  Private (Farmer)
   */
  router.get('/wizard/:surveyId/progress', controller.getProgress);

  // ==========================================
  // 📋 Survey Management
  // ==========================================

  /**
   * @route   GET /api/surveys/my-surveys
   * @desc    Get user's surveys
   * @access  Private (Farmer)
   * @query   status (optional) - DRAFT, COMPLETE, SUBMITTED
   * @query   region (optional) - central, southern, northern, northeastern
   */
  router.get('/my-surveys', controller.getMySurveys);

  /**
   * @route   GET /api/surveys/:surveyId
   * @desc    Get specific survey details
   * @access  Private (Farmer/Admin)
   */
  router.get('/:surveyId', controller.getSurveyById);

  /**
   * @route   DELETE /api/surveys/:surveyId
   * @desc    Delete survey (draft only)
   * @access  Private (Farmer)
   */
  router.delete('/:surveyId', controller.deleteSurvey);

  // ==========================================
  // 📊 Analytics & Statistics
  // ==========================================

  /**
   * @route   GET /api/surveys/analytics/regional/:region
   * @desc    Get regional analytics and insights
   * @access  Private (Farmer)
   */
  router.get('/analytics/regional/:region', controller.getRegionalAnalytics);

  /**
   * @route   POST /api/surveys/analytics/compare
   * @desc    Compare multiple regions
   * @access  Private (Farmer)
   * @body    { regions: ['central', 'southern'] }
   */
  router.post('/analytics/compare', controller.compareRegions);

  /**
   * @route   GET /api/surveys/statistics
   * @desc    Get survey statistics (admin only)
   * @access  Private (Admin)
   */
  router.get('/statistics', controller.getStatistics);

  return router;
}

module.exports = createSurveyRoutes;
