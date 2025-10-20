/**
 * Test Setup and Configuration
 *
 * Configures the test environment for the Authentication Service.
 * Uses MongoDB Memory Server for isolated testing without external dependencies.
 *
 * Features:
 * - In-memory MongoDB instance
 * - Test database setup/teardown
 * - Environment configuration
 * - Global test utilities
 *
 * @module tests/setup
 */

// ============================================================
// CRITICAL: Set environment variables BEFORE any imports!
// This ensures config modules read the correct test values
// ============================================================
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32-characters-minimum-length-required';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-characters-minimum-length-required';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.BCRYPT_SALT_ROUNDS = '10'; // Lower for faster tests
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.COOKIE_SECRET = 'test-cookie-secret-for-testing';
process.env.COOKIE_MAX_AGE = '604800000'; // 7 days
process.env.COOKIE_SAME_SITE = 'strict';
process.env.COOKIE_SECURE = 'false'; // HTTP for tests

// ============================================================
// Now safe to import modules (they will read env vars)
// ============================================================

const { MongoMemoryServer } = require('mongodb-memory-server');
// CRITICAL: Import mongoose from the same location as the models use it
// Models are in ../../../../database/models/ and they require('mongoose')
// which resolves to root node_modules/mongoose
// We must use the SAME instance or connection won't work
const mongoose = require('../../../../node_modules/mongoose');

let mongoServer;

/**
 * Setup function - runs before all tests
 */
beforeAll(async () => {
  // Environment variables already set at top of file (before imports)
  // This ensures config modules loaded correctly

  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to in-memory database
  await mongoose.connect(mongoUri);

  console.log('✅ Test database connected');
}, 60000); // 60 second timeout for MongoDB Memory Server startup

/**
 * Cleanup function - runs after all tests
 */
afterAll(async () => {
  // Disconnect from database
  await mongoose.disconnect();

  // Stop MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log('✅ Test database disconnected');
}, 60000);

/**
 * Clear all collections after each test AND reset test data counters
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }

  // Reset ALL counters to ensure test isolation
  // This prevents test data collisions when tests run sequentially
  thaiIdCounter = 1000;
  phoneCounter = 10000000;
  emailCounter = 10000;
});

/**
 * Global test utilities - Counters for test data generation
 */
let thaiIdCounter = 1000;
let phoneCounter = 10000000;
let emailCounter = 10000;
global.testUtils = {
  /**
   * Generate valid Thai ID (with correct Mod 11 checksum)
   *
   * Uses sequential counter as primary uniqueness guarantee.
   * Format: Counter-based 12 digits + checksum digit
   * Ensures no collisions even when called rapidly in tests.
   */
  generateValidThaiId: () => {
    // Use counter as primary uniqueness (guaranteed no collisions)
    const counter = thaiIdCounter++;

    // Create 12-digit unique number from counter
    // Start from 1000000000 to ensure 12 digits
    const base = 100000000000; // 12 zeros
    const uniqueNumber = base + counter;
    const uniquePart = String(uniqueNumber).slice(-12); // Take last 12 digits
    const digits = uniquePart.split('').map(Number);

    // Calculate Mod 11 checksum
    const sum = digits.reduce((acc, digit, index) => {
      return acc + digit * (13 - index);
    }, 0);

    const checksum = (11 - (sum % 11)) % 10;

    return [...digits, checksum].join('');
  },

  /**
   * Generate invalid Thai ID (wrong checksum)
   */
  generateInvalidThaiId: () => {
    const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10));
    return digits.join('');
  },

  /**
   * Generate valid Thai phone number
   *
   * Uses sequential counter as primary uniqueness guarantee.
   * Format: Prefix (06/08/09) + 8 sequential digits
   * Ensures no collisions even when called rapidly in tests.
   */
  generateValidPhone: () => {
    const prefixes = ['06', '08', '09'];
    const counter = phoneCounter++;

    // Use counter directly for 8-digit suffix (guaranteed unique)
    const suffix = String(counter).slice(-8).padStart(8, '0');

    // Rotate through prefixes based on counter
    const prefix = prefixes[counter % prefixes.length];

    return `${prefix}${suffix}`;
  },

  /**
   * Wait for specified milliseconds
   */
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate unique test email
   *
   * Uses sequential counter as primary uniqueness guarantee.
   * Format: test{counter}@example.com
   * Ensures no collisions even when called rapidly in tests.
   */
  generateEmail: () => {
    const counter = emailCounter++;
    return `test${counter}@example.com`;
  },

  /**
   * Create test user data
   */
  createTestUserData: (overrides = {}) => {
    return {
      email: global.testUtils.generateEmail(),
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      fullName: 'สมชาย ใจดี',
      thaiId: global.testUtils.generateValidThaiId(),
      phoneNumber: global.testUtils.generateValidPhone(),
      address: {
        houseNumber: '123',
        village: 'หมู่บ้านทดสอบ',
        lane: 'ซอยทดสอบ 1',
        road: 'ถนนทดสอบ',
        subDistrict: 'แขวงทดสอบ',
        district: 'เขทดสอบ',
        province: 'กรุงเทพมหานคร',
        postalCode: '10110',
      },
      ...overrides,
    };
  },
};

/**
 * Suppress console output during tests (optional)
 * Uncomment to reduce test output noise
 */
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
