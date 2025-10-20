/**
 * Auth DTAM Module Container
 * Dependency Injection Container - Clean Architecture
 *
 * Purpose: Wire up all layers and dependencies for DTAM staff authentication
 */

const mongoose = require('mongoose');

// Domain
const IDTAMStaffRepository = require('./domain/interfaces/IDTAMStaffRepository');

// Infrastructure
const MongoDBDTAMStaffRepository = require('./infrastructure/database/MongoDBDTAMStaffRepository');
// Reuse security services from auth-farmer
const BcryptPasswordHasher = require('../auth-farmer/infrastructure/security/BcryptPasswordHasher');
const JWTService = require('../auth-farmer/infrastructure/security/JWTService');

// Application (Use Cases)
const CreateDTAMStaffUseCase = require('./application/use-cases/CreateDTAMStaffUseCase');
const LoginDTAMStaffUseCase = require('./application/use-cases/LoginDTAMStaffUseCase');
const RequestDTAMStaffPasswordResetUseCase = require('./application/use-cases/RequestDTAMStaffPasswordResetUseCase');
const ResetDTAMStaffPasswordUseCase = require('./application/use-cases/ResetDTAMStaffPasswordUseCase');
const GetDTAMStaffProfileUseCase = require('./application/use-cases/GetDTAMStaffProfileUseCase');
const UpdateDTAMStaffProfileUseCase = require('./application/use-cases/UpdateDTAMStaffProfileUseCase');
const ListDTAMStaffUseCase = require('./application/use-cases/ListDTAMStaffUseCase');
const UpdateDTAMStaffRoleUseCase = require('./application/use-cases/UpdateDTAMStaffRoleUseCase');

// Presentation
const DTAMStaffAuthController = require('./presentation/controllers/DTAMStaffAuthController');
const createDTAMAuthRouter = require('./presentation/routes/dtam.routes');

/**
 * Simple Event Bus implementation
 */
class SimpleEventBus {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  async publish(event) {
    const eventType = event.constructor.name;
    const callbacks = this.listeners.get(eventType) || [];

    for (const callback of callbacks) {
      try {
        await callback(event);
      } catch (error) {
        console.error(`Error processing event ${eventType}:`, error);
      }
    }
  }
}

/**
 * Simple Token Generator
 */
class TokenGenerator {
  generate() {
    return require('crypto').randomBytes(32).toString('hex');
  }
}

/**
 * Create and configure auth DTAM module
 * @param {Object} config - Configuration object
 * @param {mongoose.Connection} config.database - Mongoose database connection
 * @param {string} config.jwtSecret - JWT secret key
 * @param {string} config.jwtExpiresIn - JWT expiration time (default: '24h')
 * @param {number} config.bcryptSaltRounds - Bcrypt salt rounds (default: 12)
 * @returns {Object} - Module with router and services
 */
function createAuthDTAMModule(config) {
  const { database, jwtSecret, jwtExpiresIn = '24h', bcryptSaltRounds = 12 } = config;

  // Validate required configuration
  if (!database) {
    throw new Error('Database connection is required');
  }
  if (!jwtSecret) {
    throw new Error('JWT secret is required');
  }

  // Infrastructure Layer
  const staffRepository = new MongoDBDTAMStaffRepository(database);
  const passwordHasher = new BcryptPasswordHasher(bcryptSaltRounds);
  const jwtService = new JWTService(jwtSecret, jwtExpiresIn);
  const tokenGenerator = new TokenGenerator();
  const eventBus = new SimpleEventBus();

  // Subscribe to domain events
  eventBus.subscribe('DTAMStaffCreated', async event => {
    console.log('DTAM staff created:', event.toEventPayload());
    // TODO: Send welcome email, notify admin, etc.
  });

  eventBus.subscribe('DTAMStaffLoggedIn', async event => {
    console.log('DTAM staff logged in:', event.toEventPayload());
    // TODO: Log activity, send notification if new device, security audit
  });

  eventBus.subscribe('DTAMStaffPasswordResetRequested', async event => {
    console.log('DTAM staff password reset requested:', event.toEventPayload());
    // TODO: Send password reset email
  });

  // Application Layer (Use Cases)
  const createDTAMStaffUseCase = new CreateDTAMStaffUseCase({
    staffRepository,
    passwordHasher,
    eventBus
  });

  const loginDTAMStaffUseCase = new LoginDTAMStaffUseCase({
    staffRepository,
    passwordHasher,
    jwtService,
    eventBus
  });

  const requestPasswordResetUseCase = new RequestDTAMStaffPasswordResetUseCase({
    staffRepository,
    tokenGenerator,
    eventBus
  });

  const resetPasswordUseCase = new ResetDTAMStaffPasswordUseCase({
    staffRepository,
    passwordHasher
  });

  const getProfileUseCase = new GetDTAMStaffProfileUseCase({
    staffRepository
  });

  const updateProfileUseCase = new UpdateDTAMStaffProfileUseCase({
    staffRepository
  });

  const listStaffUseCase = new ListDTAMStaffUseCase({
    staffRepository
  });

  const updateRoleUseCase = new UpdateDTAMStaffRoleUseCase({
    staffRepository
  });

  // Presentation Layer
  const authController = new DTAMStaffAuthController({
    createDTAMStaffUseCase,
    loginDTAMStaffUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
    getProfileUseCase,
    updateProfileUseCase,
    listStaffUseCase,
    updateRoleUseCase
  });

  // Create and return router
  const router = createDTAMAuthRouter(authController);

  return {
    router,
    services: {
      staffRepository,
      passwordHasher,
      jwtService
    }
  };
}

module.exports = createAuthDTAMModule;
