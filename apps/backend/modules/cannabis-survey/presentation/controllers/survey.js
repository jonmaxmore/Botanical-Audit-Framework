/**
 * Survey Controller
 *
 * HTTP request handlers for cannabis survey operations.
 * Separates farmer and DTAM staff operations.
 *
 * @class SurveyController
 */

class SurveyController {
  constructor({
    createSurveyUseCase,
    updateSurveyUseCase,
    submitSurveyUseCase,
    getSurveyDetailsUseCase,
    listSurveysUseCase,
    startSurveyReviewUseCase,
    approveSurveyUseCase,
    rejectSurveyUseCase,
    requestSurveyRevisionUseCase,
  }) {
    this.createSurveyUseCase = createSurveyUseCase;
    this.updateSurveyUseCase = updateSurveyUseCase;
    this.submitSurveyUseCase = submitSurveyUseCase;
    this.getSurveyDetailsUseCase = getSurveyDetailsUseCase;
    this.listSurveysUseCase = listSurveysUseCase;
    this.startSurveyReviewUseCase = startSurveyReviewUseCase;
    this.approveSurveyUseCase = approveSurveyUseCase;
    this.rejectSurveyUseCase = rejectSurveyUseCase;
    this.requestSurveyRevisionUseCase = requestSurveyRevisionUseCase;
  }

  /**
   * Create new survey (Farmer)
   */
  async createSurvey(req, res) {
    try {
      const farmerId = req.user.userId;
      const surveyData = req.body;

      const survey = await this.createSurveyUseCase.execute({
        farmerId,
        ...surveyData,
      });

      res.status(201).json({
        success: true,
        message: 'Survey created successfully',
        data: survey,
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Create survey error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create survey',
      });
    }
  }

  /**
   * Update survey (Farmer)
   */
  async updateSurvey(req, res) {
    try {
      const surveyId = req.params.id;
      const farmerId = req.user.userId;
      const updates = req.body;

      const survey = await this.updateSurveyUseCase.execute({
        surveyId,
        farmerId,
        updates,
      });

      res.json({
        success: true,
        message: 'Survey updated successfully',
        data: survey,
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot edit') || error.message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Update survey error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update survey',
      });
    }
  }

  /**
   * Submit survey for review (Farmer)
   */
  async submitSurvey(req, res) {
    try {
      const surveyId = req.params.id;
      const farmerId = req.user.userId;

      const survey = await this.submitSurveyUseCase.execute({
        surveyId,
        farmerId,
      });

      res.json({
        success: true,
        message: 'Survey submitted for review successfully',
        data: survey,
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('validation') || error.message.includes('Cannot submit')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Submit survey error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit survey',
      });
    }
  }

  /**
   * Get survey details (Farmer or DTAM)
   */
  async getSurveyDetails(req, res) {
    try {
      const surveyId = req.params.id;
      const userId = req.user?.userId || req.staff?.staffId;
      const userType = req.user ? 'farmer' : 'dtam';

      const survey = await this.getSurveyDetailsUseCase.execute({
        surveyId,
        userId,
        userType,
      });

      res.json({
        success: true,
        data: survey,
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Get survey details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve survey details',
      });
    }
  }

  /**
   * List surveys (Farmer or DTAM)
   */
  async listSurveys(req, res) {
    try {
      const userId = req.user?.userId || req.staff?.staffId;
      const userType = req.user ? 'farmer' : 'dtam';

      const filters = {
        status: req.query.status,
        purpose: req.query.purpose,
        plantType: req.query.plantType,
        surveyYear: req.query.year ? parseInt(req.query.year) : undefined,
        surveyPeriod: req.query.period,
        farmId: req.query.farmId,
        search: req.query.search,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || { createdAt: -1 },
      };

      const surveys = await this.listSurveysUseCase.execute({
        userId,
        userType,
        filters,
        options,
      });

      res.json({
        success: true,
        data: surveys,
        pagination: {
          page: options.page,
          limit: options.limit,
        },
      });
    } catch (error) {
      logger.error('List surveys error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve surveys',
      });
    }
  }

  /**
   * Start survey review (DTAM)
   */
  async startSurveyReview(req, res) {
    try {
      const surveyId = req.params.id;
      const staffId = req.staff.staffId;

      const survey = await this.startSurveyReviewUseCase.execute({
        surveyId,
        staffId,
      });

      res.json({
        success: true,
        message: 'Survey review started',
        data: survey,
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot start review')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Start survey review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start survey review',
      });
    }
  }

  /**
   * Approve survey (DTAM)
   */
  async approveSurvey(req, res) {
    try {
      const surveyId = req.params.id;
      const staffId = req.staff.staffId;
      const { notes } = req.body;

      const survey = await this.approveSurveyUseCase.execute({
        surveyId,
        staffId,
        notes,
      });

      res.json({
        success: true,
        message: 'Survey approved successfully',
        data: survey,
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot approve')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Approve survey error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve survey',
      });
    }
  }

  /**
   * Reject survey (DTAM)
   */
  async rejectSurvey(req, res) {
    try {
      const surveyId = req.params.id;
      const staffId = req.staff.staffId;
      const { reason } = req.body;

      const survey = await this.rejectSurveyUseCase.execute({
        surveyId,
        staffId,
        reason,
      });

      res.json({
        success: true,
        message: 'Survey rejected',
        data: survey,
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot reject') || error.message.includes('Rejection reason')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Reject survey error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject survey',
      });
    }
  }

  /**
   * Request survey revision (DTAM)
   */
  async requestSurveyRevision(req, res) {
    try {
      const surveyId = req.params.id;
      const staffId = req.staff.staffId;
      const { notes } = req.body;

      const survey = await this.requestSurveyRevisionUseCase.execute({
        surveyId,
        staffId,
        notes,
      });

      res.json({
        success: true,
        message: 'Revision requested successfully',
        data: survey,
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot request') || error.message.includes('Revision notes')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Request survey revision error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request revision',
      });
    }
  }
}

module.exports = SurveyController;
