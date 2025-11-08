/**
 * Register User Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Handle user registration business logic
 * - Validate user data
 * - Check email/ID card uniqueness
 * - Hash password
 * - Generate verification token
 * - Save user
 * - Publish UserRegistered event
 */

const User = require('../../domain/entities/User');
const Email = require('../../domain/value-objects/Email');
const Password = require('../../domain/value-objects/Password');
const UserRegistered = require('../../domain/events/UserRegistered');

class RegisterUserUseCase {
  constructor({ userRepository, passwordHasher, tokenGenerator, eventBus }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenGenerator = tokenGenerator;
    this.eventBus = eventBus;
  }

  /**
   * Execute register user use case
   * @param {Object} request - Registration data
   * @returns {Promise<User>}
   */
  async execute(request) {
    // 1. Validate email format using Value Object
    const email = new Email(request.email);

    // 2. Validate password strength using Value Object
    const password = new Password(request.password);

    // 3. Check if email already exists
    const emailExists = await this.userRepository.emailExists(email.value);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // 4. Check if ID card already exists
    const idCardExists = await this.userRepository.idCardExists(request.idCard);
    if (idCardExists) {
      throw new Error('ID card already registered');
    }

    // 5. Hash password
    const hashedPassword = await this.passwordHasher.hash(password.getPlainValue());

    // 6. Generate email verification token
    const verificationToken = await this.tokenGenerator.generate();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 7. Create user entity
    const user = new User({
      email: email.value,
      password: hashedPassword,
      firstName: request.firstName,
      lastName: request.lastName,
      phoneNumber: request.phoneNumber,
      idCard: request.idCard,
      address: request.address || '',
      province: request.province || '',
      district: request.district || '',
      subdistrict: request.subdistrict || '',
      zipCode: request.zipCode || '',
      role: 'FARMER',
      status: 'PENDING_VERIFICATION',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
      metadata: request.metadata || {},
    });

    // 8. Validate user entity
    const validationErrors = user.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // 9. Save user
    const savedUser = await this.userRepository.save(user);

    // 10. Publish UserRegistered event
    if (this.eventBus) {
      const event = new UserRegistered({
        userId: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        registeredAt: savedUser.createdAt,
      });

      await this.eventBus.publish(event.toEventPayload());
    }

    // 11. Return user and verification token
    return {
      user: savedUser,
      verificationToken: verificationToken,
    };
  }
}

module.exports = RegisterUserUseCase;
