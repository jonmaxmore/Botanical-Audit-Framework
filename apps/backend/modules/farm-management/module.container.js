/**
 * Farm Management Module Container (Integration Layer)
 *
 * Dependency Injection container for farm management module
 * Wires all layers together following Clean Architecture principles
 */

// Domain
const Farm = require('./domain/entities/Farm');

// Application Use Cases
const RegisterFarmUseCase = require('./application/use-cases/register-farm');
const UpdateFarmUseCase = require('./application/use-cases/update-farm');
const SubmitFarmForReviewUseCase = require('./application/use-cases/submit-farm-for-review');
const GetFarmDetailsUseCase = require('./application/use-cases/get-farm-details');
const ListFarmsUseCase = require('./application/use-cases/list-farms');
const StartFarmReviewUseCase = require('./application/use-cases/start-farm-review');
const ApproveFarmUseCase = require('./application/use-cases/approve-farm');
const RejectFarmUseCase = require('./application/use-cases/reject-farm');

// Infrastructure
const MongoDBFarmRepository = require('./infrastructure/database/MongoDBFarmRepository');

// Presentation
const FarmController = require('./presentation/controllers/FarmController');
const createFarmRoutes = require('./presentation/routes/farm.routes');
const farmValidators = require('./presentation/validators/farm.validator');

// Simple Event Bus (reuse from other modules)
class SimpleEventBus {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(eventType, handler) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(handler);
  }

  publish(event) {
    const handlers = this.listeners.get(event.eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
      }
    });
  }
}

/**
 * Create Farm Management Module
 */
function createFarmManagementModule(config) {
  const { database, authMiddleware } = config;

  if (!database) {
    throw new Error('Database instance is required');
  }

  if (!authMiddleware) {
    throw new Error('Auth middleware is required');
  }

  // ===================================================================
  // Infrastructure Layer
  // ===================================================================

  const farmRepository = new MongoDBFarmRepository(database);
  const eventBus = new SimpleEventBus();

  // ===================================================================
  // Event Subscriptions
  // ===================================================================

  // FarmRegistered Event
  eventBus.subscribe('FarmRegistered', event => {
    console.log(`[FarmRegistered] Farm ${event.farmName} registered by owner ${event.ownerId}`);
    // TODO: Send notification to farmer
    // TODO: Log to analytics
  });

  // FarmSubmittedForReview Event
  eventBus.subscribe('FarmSubmittedForReview', event => {
    console.log(
      `[FarmSubmittedForReview] Farm ${event.farmName} (ID: ${event.farmId}) submitted for review`
    );
    // TODO: Notify DTAM staff about new farm to review
    // TODO: Add to review queue
  });

  // FarmVerificationCompleted Event
  eventBus.subscribe('FarmVerificationCompleted', event => {
    console.log(`[FarmVerificationCompleted] Farm ${event.farmName} verification: ${event.status}`);
    console.log(`  Verified by: ${event.verifiedBy}`);
    if (event.status === 'APPROVED') {
      console.log(`  Notes: ${event.notes || 'No notes'}`);
      // TODO: Send approval notification to farmer
      // TODO: Enable farm for certificate application
    } else if (event.status === 'REJECTED') {
      console.log(`  Rejection reason: ${event.rejectionReason}`);
      // TODO: Send rejection notification to farmer with improvement suggestions
    }
  });

  // ===================================================================
  // Application Layer - Use Cases
  // ===================================================================

  const registerFarmUseCase = new RegisterFarmUseCase({
    farmRepository,
    eventBus,
  });

  const updateFarmUseCase = new UpdateFarmUseCase({
    farmRepository,
  });

  const submitFarmForReviewUseCase = new SubmitFarmForReviewUseCase({
    farmRepository,
    eventBus,
  });

  const getFarmDetailsUseCase = new GetFarmDetailsUseCase({
    farmRepository,
  });

  const listFarmsUseCase = new ListFarmsUseCase({
    farmRepository,
  });

  const startFarmReviewUseCase = new StartFarmReviewUseCase({
    farmRepository,
  });

  const approveFarmUseCase = new ApproveFarmUseCase({
    farmRepository,
    eventBus,
  });

  const rejectFarmUseCase = new RejectFarmUseCase({
    farmRepository,
    eventBus,
  });

  // ===================================================================
  // Presentation Layer - Controller & Routes
  // ===================================================================

  const farmController = new FarmController({
    registerFarmUseCase,
    updateFarmUseCase,
    submitFarmForReviewUseCase,
    getFarmDetailsUseCase,
    listFarmsUseCase,
    startFarmReviewUseCase,
    approveFarmUseCase,
    rejectFarmUseCase,
  });

  const { farmerRouter, dtamRouter } = createFarmRoutes(
    farmController,
    authMiddleware,
    farmValidators
  );

  // ===================================================================
  // Module Export
  // ===================================================================

  return {
    // Routers for mounting in app.js
    farmerRouter, // Mount at /api/farms
    dtamRouter, // Mount at /api/dtam/farms

    // Services (for inter-module communication)
    services: {
      farmRepository,
      getFarmDetailsUseCase,
      listFarmsUseCase,
    },

    // Constants
    constants: {
      STATUS: Farm.STATUS,
      FARM_TYPE: Farm.FARM_TYPE,
      IRRIGATION_TYPE: Farm.IRRIGATION_TYPE,
    },
  };
}

module.exports = createFarmManagementModule;
