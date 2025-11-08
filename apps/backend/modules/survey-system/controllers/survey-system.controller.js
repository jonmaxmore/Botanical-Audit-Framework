/**
 * 📊 Survey System Controller
 * HTTP request handlers for 4-region GACP survey system
 */

const { successResponse, errorResponse } = require('../../shared/response');
const logger = require('../../shared/utils/logger');

class SurveySystemController {
  constructor(surveyService) {
    this.surveyService = surveyService;
  }

  /**
   * Start new survey wizard
   * POST /api/surveys/wizard/start
   */
  startWizard = async (req, res) => {
    try {
      const { region, farmId } = req.body;
      const userId = req.user.id;

      if (!region) {
        return errorResponse(res, { message: 'Region is required', statusCode: 400 });
      }

      // Validate region
      const validRegions = ['central', 'southern', 'northern', 'northeastern'];
      if (!validRegions.includes(region.toLowerCase())) {
        return errorResponse(res, {
          message: 'Invalid region',
          statusCode: 400,
          data: { validRegions }
        });
      }

      // Get survey template ID (mock for now)
      const surveyId = 'template-' + region.toLowerCase();

      const result = await this.surveyService.createSurveyResponse({
        surveyId,
        userId,
        region,
        farmId
      });

      if (!result.success) {
        return errorResponse(res, { message: result.error, statusCode: 500 });
      }

      return successResponse(
        res,
        {
          surveyId: result.data._id.toString(),
          region: result.data.region,
          currentStep: result.data.currentStep,
          progress: result.data.progress,
          totalSteps: 7
        },
        'Survey wizard started',
        201
      );
    } catch (error) {
      logger.error('[SurveyController] Start wizard error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get current wizard step
   * GET /api/surveys/wizard/:surveyId/current
   */
  getCurrentStep = async (req, res) => {
    try {
      const { surveyId } = req.params;
      const userId = req.user.id;

      const { ObjectId } = require('mongodb');
      const response = await this.surveyService.responsesCollection.findOne({
        _id: new ObjectId(surveyId)
      });

      if (!response) {
        return errorResponse(res, { message: 'Survey not found', statusCode: 404 });
      }

      // Check ownership
      if (response.userId !== userId && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Unauthorized access', statusCode: 403 });
      }

      return successResponse(res, {
        surveyId: response._id.toString(),
        currentStep: response.currentStep,
        progress: response.progress,
        totalSteps: 7,
        region: response.region,
        state: response.state
      });
    } catch (error) {
      logger.error('[SurveyController] Get current step error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Update wizard step
   * PUT /api/surveys/wizard/:surveyId/step/:stepId
   */
  updateStep = async (req, res) => {
    try {
      const { surveyId, stepId } = req.params;
      const { stepData, autoSave = false } = req.body;
      const userId = req.user.id;

      const result = await this.surveyService.updateWizardStep(
        surveyId,
        parseInt(stepId),
        stepData,
        userId
      );

      return successResponse(
        res,
        {
          surveyId,
          stepId: parseInt(stepId),
          currentStep: result.currentStep,
          progress: result.progress,
          isComplete: result.isComplete
        },
        autoSave ? 'Progress auto-saved' : 'Step updated successfully'
      );
    } catch (error) {
      logger.error('[SurveyController] Update step error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Submit completed wizard
   * POST /api/surveys/wizard/:surveyId/submit
   */
  submitWizard = async (req, res) => {
    try {
      const { surveyId } = req.params;
      const userId = req.user.id;

      const result = await this.surveyService.submitWizard(surveyId, userId);

      return successResponse(
        res,
        {
          surveyId,
          status: result.status,
          scores: result.scores,
          regionalBonus: result.regionalBonus,
          totalScore: result.totalScore,
          recommendations: result.recommendations,
          submittedAt: result.submittedAt
        },
        'Survey submitted successfully'
      );
    } catch (error) {
      logger.error('[SurveyController] Submit wizard error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get wizard progress
   * GET /api/surveys/wizard/:surveyId/progress
   */
  getProgress = async (req, res) => {
    try {
      const { surveyId } = req.params;
      const userId = req.user.id;

      const { ObjectId } = require('mongodb');
      const response = await this.surveyService.responsesCollection.findOne({
        _id: new ObjectId(surveyId)
      });

      if (!response) {
        return errorResponse(res, { message: 'Survey not found', statusCode: 404 });
      }

      // Check ownership
      if (response.userId !== userId && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Unauthorized access', statusCode: 403 });
      }

      // Calculate step completion
      const stepCompletion = {
        step1: { name: 'Region Selection', completed: !!response.regionSelection },
        step2: { name: 'Personal Info', completed: !!response.personalInfo },
        step3: { name: 'Farm Info', completed: !!response.farmInfo },
        step4: { name: 'Management', completed: !!response.managementProduction },
        step5: { name: 'Cost & Revenue', completed: !!response.costRevenue },
        step6: { name: 'Market & Sales', completed: !!response.marketSales },
        step7: { name: 'Problems & Needs', completed: !!response.problemsNeeds }
      };

      const completedSteps = Object.values(stepCompletion).filter(s => s.completed).length;

      return successResponse(res, {
        surveyId: response._id.toString(),
        region: response.region,
        currentStep: response.currentStep,
        overallProgress: response.progress,
        stepCompletion,
        completedSteps,
        totalSteps: 7,
        status: response.state,
        lastSaved: response.metadata.lastSavedAt
      });
    } catch (error) {
      logger.error('[SurveyController] Get progress error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get user's surveys
   * GET /api/surveys/my-surveys
   */
  getMySurveys = async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, region } = req.query;

      const query = { userId };
      if (status) query.state = status;
      if (region) query.region = region;

      const surveys = await this.surveyService.responsesCollection
        .find(query)
        .sort({ 'metadata.createdAt': -1 })
        .toArray();

      return successResponse(res, {
        surveys: surveys.map(s => ({
          id: s._id.toString(),
          region: s.region,
          status: s.state,
          progress: s.progress,
          totalScore: s.scores?.total || 0,
          createdAt: s.metadata.createdAt,
          submittedAt: s.metadata.submittedAt
        })),
        total: surveys.length
      });
    } catch (error) {
      logger.error('[SurveyController] Get my surveys error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get specific survey
   * GET /api/surveys/:surveyId
   */
  getSurveyById = async (req, res) => {
    try {
      const { surveyId } = req.params;
      const userId = req.user.id;

      const { ObjectId } = require('mongodb');
      const survey = await this.surveyService.responsesCollection.findOne({
        _id: new ObjectId(surveyId)
      });

      if (!survey) {
        return errorResponse(res, { message: 'Survey not found', statusCode: 404 });
      }

      // Check ownership or admin
      if (survey.userId !== userId && req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Unauthorized access', statusCode: 403 });
      }

      return successResponse(res, survey);
    } catch (error) {
      logger.error('[SurveyController] Get survey error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Delete survey (draft only)
   * DELETE /api/surveys/:surveyId
   */
  deleteSurvey = async (req, res) => {
    try {
      const { surveyId } = req.params;
      const userId = req.user.id;

      const { ObjectId } = require('mongodb');
      const survey = await this.surveyService.responsesCollection.findOne({
        _id: new ObjectId(surveyId)
      });

      if (!survey) {
        return errorResponse(res, { message: 'Survey not found', statusCode: 404 });
      }

      // Check ownership
      if (survey.userId !== userId) {
        return errorResponse(res, { message: 'Unauthorized access', statusCode: 403 });
      }

      // Only allow deletion of drafts
      if (survey.state !== 'DRAFT') {
        return errorResponse(res, {
          message: 'Can only delete draft surveys',
          statusCode: 400
        });
      }

      await this.surveyService.responsesCollection.deleteOne({
        _id: new ObjectId(surveyId)
      });

      return successResponse(res, null, 'Survey deleted successfully');
    } catch (error) {
      logger.error('[SurveyController] Delete survey error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get regional analytics
   * GET /api/surveys/analytics/regional/:region
   */
  getRegionalAnalytics = async (req, res) => {
    try {
      const { region } = req.params;

      // Validate region
      const validRegions = ['central', 'southern', 'northern', 'northeastern'];
      if (!validRegions.includes(region.toLowerCase())) {
        return errorResponse(res, { message: 'Invalid region', statusCode: 400 });
      }

      const analytics = await this.surveyService.getRegionalAnalytics(region);

      return successResponse(res, {
        region,
        ...analytics
      });
    } catch (error) {
      logger.error('[SurveyController] Get regional analytics error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Compare regions
   * POST /api/surveys/analytics/compare
   */
  compareRegions = async (req, res) => {
    try {
      const { regions } = req.body;

      if (!regions || !Array.isArray(regions) || regions.length < 2) {
        return errorResponse(res, {
          message: 'Please provide at least 2 regions to compare',
          statusCode: 400
        });
      }

      const comparison = await this.surveyService.compareRegions(regions);

      return successResponse(res, comparison);
    } catch (error) {
      logger.error('[SurveyController] Compare regions error:', error);
      return errorResponse(res, error);
    }
  };

  /**
   * Get survey statistics (admin)
   * GET /api/surveys/statistics
   */
  getStatistics = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return errorResponse(res, { message: 'Insufficient permissions', statusCode: 403 });
      }

      const stats = await this.surveyService.getSurveyStatistics();

      return successResponse(res, stats);
    } catch (error) {
      logger.error('[SurveyController] Get statistics error:', error);
      return errorResponse(res, error);
    }
  };
}

module.exports = SurveySystemController;
