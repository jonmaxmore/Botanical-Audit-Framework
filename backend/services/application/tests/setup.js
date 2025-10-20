/**
 * Application Service - Test Setup
 *
 * Global test configuration for Application Service tests.
 * Sets up MongoDB Memory Server for isolated testing.
 *
 * @module tests/setup
 * @requires mongodb-memory-server
 * @requires mongoose
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-17
 */

// CRITICAL: Set environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32-characters-minimum-length-required';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-characters-minimum-length-required';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.COOKIE_SECRET = 'test-cookie-secret-for-testing';
process.env.COOKIE_MAX_AGE = '604800000';
process.env.COOKIE_SAME_SITE = 'strict';
process.env.COOKIE_SECURE = 'false';

// ✅ CRITICAL: Mock auth middleware BEFORE any imports that use it
jest.mock('../../auth/middleware/auth.middleware', () => {
  // Return our mock implementation
  return require('./mocks/auth.middleware.mock');
});

// ✅ CRITICAL: Mock AuditLog to bypass validation in test environment
// Controllers create audit logs for all operations - mock to avoid validation errors
jest.mock('../../../../database/models/AuditLog.model', () => {
  const mockAuditLog = {
    create: jest.fn().mockResolvedValue({ logId: 'test-log-123' }),
    findOne: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    }),
  };
  return mockAuditLog;
});

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('../../../../node_modules/mongoose'); // Use root instance

let mongoServer;

/**
 * Setup before all tests
 */
beforeAll(async () => {
  try {
    // Create MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.0',
      },
    });

    const mongoUri = mongoServer.getUri();

    // Connect mongoose to memory server
    await mongoose.connect(mongoUri);

    console.log('✅ Test database connected');
    console.log(`📍 MongoDB Memory Server URI: ${mongoUri}`);
  } catch (error) {
    console.error('❌ Test setup error:', error);
    throw error;
  }
}, 60000); // 60 second timeout

/**
 * Cleanup after each test
 * ✅ ADDED: Reset counters for test isolation (like Auth service)
 */
afterEach(async () => {
  try {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    // Reset ALL counters for deterministic test data
    thaiIdCounter = 1000;
    phoneCounter = 10000000;
    farmerCounter = 1000;
    applicationCounter = 1000;
  } catch (error) {
    console.error('❌ Test cleanup error:', error);
  }
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  try {
    // Force close all connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(true); // Force close
    }

    // Stop MongoDB Memory Server with force
    if (mongoServer) {
      await mongoServer.stop({ force: true, doCleanup: true });
    }

    // Clear all timers and intervals
    jest.clearAllTimers();

    console.log('✅ Test database disconnected');
  } catch (error) {
    console.error('❌ Test teardown error:', error);
  }
}, 60000);

/**
 * Global test utilities
 */

// Sequential counters for deterministic test data (like Auth service)
let thaiIdCounter = 1000;
let phoneCounter = 10000000;
let farmerCounter = 1000;
let applicationCounter = 1000;

global.testUtils = {
  /**
   * Generate valid Thai ID (with correct Mod 11 checksum)
   * ✅ Copied from Auth service - proven to work
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
   * Generate valid Thai phone number
   * ✅ Copied from Auth service - proven to work
   */
  generateValidPhone: () => {
    const counter = phoneCounter++;
    const suffix = String(counter).slice(-8).padStart(8, '0');
    const prefixes = ['06', '08', '09'];
    const prefix = prefixes[counter % prefixes.length];
    return `${prefix}${suffix}`;
  },

  /**
   * Create test user data
   * ✅ FIXED: Use correct field names matching User model
   * - phoneNumber (not 'phone')
   * - thaiId (not 'idCard')
   * ✅ Use generators for unique values
   */
  createTestUserData: () => ({
    fullName: 'สมชาย ใจดี',
    email: `test-${Date.now()}@example.com`,
    phoneNumber: global.testUtils.generateValidPhone(), // ✅ Generated
    thaiId: global.testUtils.generateValidThaiId(), // ✅ Generated with Mod 11
    dateOfBirth: '1985-01-15',
    address: {
      houseNo: '123',
      moo: '5',
      tambon: 'บางกะปิ',
      amphoe: 'ห้วยขวาง',
      province: 'กรุงเทพมหานคร',
      postalCode: '10310',
    },
  }),

  /**
   * Create test application data
   * ✅ FIXED: Removed farmer fields - controller gets them from req.user
   * Farmer info (name, email, phone) is extracted from authenticated user
   * Uses sequential counter to prevent collisions
   */
  createTestApplicationData: () => {
    const counter = applicationCounter++;

    return {
      // ✅ REMOVED: farmerName, farmerEmail, farmerPhone
      // These are populated by controller from req.user (authenticated user)
      // Security: Users cannot specify farmer info manually (prevents impersonation)

      // Farm Information
      farmName: `ฟาร์มทดสอบ ${counter}`,
      farmAddress: {
        houseNo: `${counter}`,
        moo: '3',
        tambon: 'บางกะปิ',
        amphoe: 'ห้วยขวาง',
        province: 'กรุงเทพมหานคร',
        postalCode: '10310',
        gpsCoordinates: {
          type: 'Point',
          coordinates: [100.5693, 13.7563], // Bangkok
        },
      },
      farmSize: 5.5,
      farmSizeUnit: 'rai',
      cultivationType: 'OUTDOOR',
      cannabisVariety: 'CBD',
    };
  },

  /**
   * Wait for async operations
   */
  wait: ms => new Promise(resolve => setTimeout(resolve, ms)),
};

// Extend Jest timeout for all tests
jest.setTimeout(30000);
