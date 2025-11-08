/**
 * Cannabis Survey Module Container
 *
 * Dependency Injection container that wires together all layers
 * of the cannabis-survey module.
 *
 * @module module.container
 */

const logger = require('../../shared/logger/logger');
const MongoDBSurveyRepository = require('./infrastructure/database/survey-model');
const { STATUS, PURPOSE, PLANT_TYPE } = require('./domain/entities/Survey');

// Use Cases
const CreateSurveyUseCase = require('./application/use-cases/create-survey-usecase');
const UpdateSurveyUseCase = require('./application/use-cases/update-survey-usecase');
const SubmitSurveyUseCase = require('./application/use-cases/submit-survey-usecase');
const GetSurveyDetailsUseCase = require('./application/use-cases/get-survey-details-usecase');
const ListSurveysUseCase = require('./application/use-cases/list-surveys-usecase');
const StartSurveyReviewUseCase = require('./application/use-cases/start-survey-review-usecase');
const ApproveSurveyUseCase = require('./application/use-cases/approve-survey-usecase');
const RejectSurveyUseCase = require('./application/use-cases/reject-survey-usecase');
const RequestSurveyRevisionUseCase = require('./application/use-cases/request-survey-revision-usecase');

// Presentation Layer
const SurveyController = require('./presentation/controllers/survey-controller');
const createSurveyRoutes = require('./presentation/routes/survey.routes');
const validators = require('./presentation/validators/survey.validator');

// Event Bus (simple in-memory implementation)
class SimpleEventBus {
  constructor() {
    this.subscribers = {};
  }

  subscribe(eventName, handler) {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    this.subscribers[eventName].push(handler);
  }

  publish(event) {
    const eventName = event.eventName;
    if (this.subscribers[eventName]) {
      this.subscribers[eventName].forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          logger.error(`Error handling event ${eventName}:`, error);
        }
      });
    }
  }
}

/**
 * Create and configure the cannabis-survey module
 */
function createCannabisSurveyModule(config) {
  const { database, authMiddleware } = config;

  // Infrastructure Layer
  const surveyRepository = new MongoDBSurveyRepository(database);
  const eventBus = new SimpleEventBus();

  // Subscribe to domain events
  eventBus.subscribe('SurveyCreated', event => {
    logger.info(`[SurveyCreated] Survey ${event.surveyId} created for farm ${event.farmId}`);
    // TODO: Send notification to farmer
    // TODO: Add to analytics
  });

  eventBus.subscribe('SurveySubmitted', event => {
    logger.info(`[SurveySubmitted] Survey ${event.surveyId} submitted for review`);
    // TODO: Notify DTAM staff of new submission
    // TODO: Add to review queue
  });

  eventBus.subscribe('SurveyReviewCompleted', event => {
    console.log(
      `[SurveyReviewCompleted] Survey ${event.surveyId} review completed: ${event.status}`,
    );
    // TODO: Notify farmer of review result
    // TODO: If approved, enable next steps in workflow
    // TODO: If rejected, highlight issues to farmer
    // TODO: If revision requested, notify farmer of required changes
  });

  // Application Layer - Use Cases
  const createSurveyUseCase = new CreateSurveyUseCase({
    surveyRepository,
    eventBus,
  });

  const updateSurveyUseCase = new UpdateSurveyUseCase({
    surveyRepository,
  });

  const submitSurveyUseCase = new SubmitSurveyUseCase({
    surveyRepository,
    eventBus,
  });

  const getSurveyDetailsUseCase = new GetSurveyDetailsUseCase({
    surveyRepository,
  });

  const listSurveysUseCase = new ListSurveysUseCase({
    surveyRepository,
  });

  const startSurveyReviewUseCase = new StartSurveyReviewUseCase({
    surveyRepository,
  });

  const approveSurveyUseCase = new ApproveSurveyUseCase({
    surveyRepository,
    eventBus,
  });

  const rejectSurveyUseCase = new RejectSurveyUseCase({
    surveyRepository,
    eventBus,
  });

  const requestSurveyRevisionUseCase = new RequestSurveyRevisionUseCase({
    surveyRepository,
    eventBus,
  });

  // Presentation Layer - Controller
  const surveyController = new SurveyController({
    createSurveyUseCase,
    updateSurveyUseCase,
    submitSurveyUseCase,
    getSurveyDetailsUseCase,
    listSurveysUseCase,
    startSurveyReviewUseCase,
    approveSurveyUseCase,
    rejectSurveyUseCase,
    requestSurveyRevisionUseCase,
  });

  // Presentation Layer - Routes
  const { farmerRouter, dtamRouter } = createSurveyRoutes(
    surveyController,
    authMiddleware,
    validators,
  );

  // Return module interface
  return {
    // Routes to mount in main app
    farmerRouter, // Mount at /api/surveys
    dtamRouter, // Mount at /api/dtam/surveys

    // Services for use by other modules
    services: {
      surveyRepository,
      getSurveyDetailsUseCase,
      listSurveysUseCase,
    },

    // Constants for use by other modules
    constants: {
      STATUS,
      PURPOSE,
      PLANT_TYPE,
    },
  };
}

module.exports = createCannabisSurveyModule;
