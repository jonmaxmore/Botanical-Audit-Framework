/**
 * Register User Use Case Tests
 * Tests application layer business logic with mocked dependencies
 */

const RegisterUserUseCase = require('../../application/use-cases/register');
const User = require('../../domain/entities/User');
const Email = require('../../domain/value-objects/Email');
const Password = require('../../domain/value-objects/Password');

describe('RegisterUserUseCase', () => {
  let registerUseCase;
  let mockUserRepository;
  let mockPasswordHasher;
  let mockTokenGenerator;
  let mockEventBus;

  beforeEach(() => {
    // Mock user repository
    mockUserRepository = {
      emailExists: jest.fn(),
      idCardExists: jest.fn(),
      save: jest.fn()
    };

    // Mock password hasher
    mockPasswordHasher = {
      hash: jest.fn()
    };

    // Mock token generator
    mockTokenGenerator = {
      generate: jest.fn()
    };

    // Mock event bus
    mockEventBus = {
      publish: jest.fn()
    };

    // Create use case instance
    registerUseCase = new RegisterUserUseCase({
      userRepository: mockUserRepository,
      passwordHasher: mockPasswordHasher,
      tokenGenerator: mockTokenGenerator,
      eventBus: mockEventBus
    });
  });

  describe('Happy Path', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        phoneNumber: '0812345678',
        address: '123 Test Street',
        province: 'Bangkok',
        district: 'Bang Khen',
        subDistrict: 'Anusawari',
        postalCode: '10220'
      };

      // Setup mocks
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');
      mockTokenGenerator.generate.mockReturnValue('verificationToken123');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      // Execute
      const result = await registerUseCase.execute(userData);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe(userData.email);
      expect(result.firstName).toBe(userData.firstName);
      expect(result.status).toBe('PENDING_VERIFICATION');
      expect(result.isEmailVerified).toBe(false);

      // Verify mocks called correctly
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.idCardExists).toHaveBeenCalledWith(userData.idCard);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(userData.password);
      expect(mockTokenGenerator.generate).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should hash the password before saving', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        phoneNumber: '0812345678'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('$2b$12$hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token123');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('SecureP@ssw0rd123');
      
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.password).toBe('$2b$12$hashedPassword');
    });

    it('should generate email verification token', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('generatedToken');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.emailVerificationToken).toBe('generatedToken');
    });

    it('should publish UserRegistered event', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UserRegistered'
        })
      );
    });
  });

  describe('Error Cases', () => {
    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(true);

      await expect(registerUseCase.execute(userData)).rejects.toThrow(
        /already exists|already registered/i
      );

      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(userData.email);
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if ID card already exists', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(true);

      await expect(registerUseCase.execute(userData)).rejects.toThrow(
        /already exists|already registered/i
      );

      expect(mockUserRepository.idCardExists).toHaveBeenCalledWith(userData.idCard);
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      await expect(registerUseCase.execute(userData)).rejects.toThrow(/email/i);
    });

    it('should throw error for weak password', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      await expect(registerUseCase.execute(userData)).rejects.toThrow(/password/i);
    });

    it('should throw error for missing required fields', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123'
        // Missing firstName, lastName, idCard
      };

      await expect(registerUseCase.execute(userData)).rejects.toThrow();
    });

    it('should throw error if user validation fails', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: '', // Invalid: empty
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');

      await expect(registerUseCase.execute(userData)).rejects.toThrow();
    });
  });

  describe('Repository Error Handling', () => {
    it('should propagate repository errors', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockRejectedValue(new Error('Database connection failed'));

      await expect(registerUseCase.execute(userData)).rejects.toThrow('Database connection failed');
    });

    it('should propagate save errors', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');
      mockUserRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(registerUseCase.execute(userData)).rejects.toThrow('Save failed');
    });
  });

  describe('Password Hasher Error Handling', () => {
    it('should propagate password hashing errors', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(registerUseCase.execute(userData)).rejects.toThrow('Hashing failed');
    });
  });

  describe('Integration with Value Objects', () => {
    it('should use Email value object for validation', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      // Email should be validated through Email value object
      // If Email VO throws, registration should fail
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(userData.email);
    });

    it('should use Password value object for validation', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123'
      };

      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.idCardExists.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockTokenGenerator.generate.mockReturnValue('token');
      mockUserRepository.save.mockImplementation(user => Promise.resolve(user));

      await registerUseCase.execute(userData);

      // Password should be validated through Password value object
      // If Password VO throws, registration should fail
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(userData.password);
    });
  });
});
