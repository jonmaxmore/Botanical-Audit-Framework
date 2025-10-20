/**
 * Auth Farmer Module Container
 * Dependency Injection Container - Clean Architecture
 *
 * Purpose: Wire up all layers and dependencies
 * - Configure database connection
 * - Instantiate infrastructure services
 * - Create use cases with dependencies
 * - Create controller with use cases
 * - Export configured router
 */

const mongoose = require('mongoose');

// Domain
const IUserRepository = require('./domain/interfaces/IUserRepository');

// Infrastructure
const MongoDBUserRepository = require('./infrastructure/database/MongoDBUserRepository');
const BcryptPasswordHasher = require('./infrastructure/security/BcryptPasswordHasher');
const JWTService = require('./infrastructure/security/JWTService');

// Application (Use Cases)
const RegisterUserUseCase = require('./application/use-cases/RegisterUserUseCase');
const LoginUserUseCase = require('./application/use-cases/LoginUserUseCase');
const VerifyEmailUseCase = require('./application/use-cases/VerifyEmailUseCase');
const RequestPasswordResetUseCase = require('./application/use-cases/RequestPasswordResetUseCase');
const ResetPasswordUseCase = require('./application/use-cases/ResetPasswordUseCase');
const GetUserProfileUseCase = require('./application/use-cases/GetUserProfileUseCase');
const UpdateUserProfileUseCase = require('./application/use-cases/UpdateUserProfileUseCase');

// Presentation
const AuthController = require('./presentation/controllers/AuthController');
const createAuthRouter = require('./presentation/routes/auth.routes');

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
 * Create and configure auth farmer module
 * @param {Object} config - Configuration object
 * @param {mongoose.Connection} config.database - Mongoose database connection
 * @param {string} config.jwtSecret - JWT secret key
 * @param {string} config.jwtExpiresIn - JWT expiration time (default: '24h')
 * @param {number} config.bcryptSaltRounds - Bcrypt salt rounds (default: 12)
 * @returns {express.Router}
 */
function createAuthFarmerModule(config) {
  const { database, jwtSecret, jwtExpiresIn = '24h', bcryptSaltRounds = 12 } = config;

  // Validate required configuration
  if (!database) {
    throw new Error('Database connection is required');
  }
  if (!jwtSecret) {
    throw new Error('JWT secret is required');
  }

  // Infrastructure Layer
  const userRepository = new MongoDBUserRepository(database);
  const passwordHasher = new BcryptPasswordHasher(bcryptSaltRounds);
  const jwtService = new JWTService(jwtSecret, jwtExpiresIn);
  const tokenGenerator = new TokenGenerator();
  const eventBus = new SimpleEventBus();

  // Subscribe to domain events (for logging, email sending, etc.)
  eventBus.subscribe('UserRegistered', async event => {
    console.log('User registered:', event.toEventPayload());
    // TODO: Send verification email
  });

  eventBus.subscribe('UserLoggedIn', async event => {
    console.log('User logged in:', event.toEventPayload());
    // TODO: Log activity, send notification if new device, etc.
  });

  eventBus.subscribe('PasswordResetRequested', async event => {
    console.log('Password reset requested:', event.toEventPayload());
    // TODO: Send password reset email
  });

  // Application Layer (Use Cases)
  const registerUserUseCase = new RegisterUserUseCase({
    userRepository,
    passwordHasher,
    tokenGenerator,
    eventBus
  });

  const loginUserUseCase = new LoginUserUseCase({
    userRepository,
    passwordHasher,
    jwtService,
    eventBus
  });

  const verifyEmailUseCase = new VerifyEmailUseCase({
    userRepository
  });

  const requestPasswordResetUseCase = new RequestPasswordResetUseCase({
    userRepository,
    tokenGenerator,
    eventBus
  });

  const resetPasswordUseCase = new ResetPasswordUseCase({
    userRepository,
    passwordHasher
  });

  const getUserProfileUseCase = new GetUserProfileUseCase({
    userRepository
  });

  const updateUserProfileUseCase = new UpdateUserProfileUseCase({
    userRepository
  });

  // Presentation Layer
  const authController = new AuthController({
    registerUserUseCase,
    loginUserUseCase,
    verifyEmailUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
    getUserProfileUseCase,
    updateUserProfileUseCase
  });

  // Create and return router
  const router = createAuthRouter(authController);

  return {
    router,
    services: {
      userRepository,
      passwordHasher,
      jwtService
    }
  };
}

module.exports = createAuthFarmerModule;
