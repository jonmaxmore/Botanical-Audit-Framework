// Comprehensive Testing Suite for GACP Standards Comparison System
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Test Configuration
const testConfig = {
  database: {
    url: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/gacp-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: 'test-jwt-secret',
    expiresIn: '1h',
  },
  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 10000,
  },
};

// Test Database Setup
class TestDatabase {
  constructor() {
    this.mongoServer = null;
    this.connection = null;
  }

  async connect() {
    try {
      // Use in-memory MongoDB for testing
      this.mongoServer = await MongoMemoryServer.create();
      const uri = this.mongoServer.getUri();

      await mongoose.connect(uri, testConfig.database.options);
      this.connection = mongoose.connection;

      console.log('✅ Test database connected');
      return this.connection;
    } catch (error) {
      console.error('❌ Test database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      if (this.mongoServer) {
        await this.mongoServer.stop();
      }
      console.log('✅ Test database disconnected');
    } catch (error) {
      console.error('❌ Test database disconnect failed:', error);
      throw error;
    }
  }

  async clearCollections() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

// Test Data Factory
class TestDataFactory {
  static createStandard(overrides = {}) {
    return {
      standard_code: 'TEST-001',
      source: 'WHO',
      version: '1.0',
      effective_date: new Date(),
      category: 'cultivation',
      title: 'Test Standard',
      description: 'Test standard description',
      status: 'Active',
      requirements: [
        {
          requirement_id: 'REQ-001',
          requirement_text: 'Test requirement',
          category: 'cultivation',
          criticality: 'high',
          acceptance_criteria: ['Criteria 1', 'Criteria 2'],
        },
      ],
      ...overrides,
    };
  }

  static createAssessment(overrides = {}) {
    return {
      assessment_id: 'ASS-001',
      user_id: 'user123',
      assessment_type: 'self-assessment',
      standard_id: 'std123',
      facility_name: 'Test Facility',
      assessor_name: 'Test Assessor',
      status: 'in-progress',
      start_date: new Date(),
      responses: [
        {
          requirement_id: 'REQ-001',
          compliance_level: 'compliant',
          evidence: 'Test evidence',
          score: 100,
          comments: 'Test comment',
        },
      ],
      ...overrides,
    };
  }

  static createComparison(overrides = {}) {
    return {
      comparison_id: 'CMP-001',
      base_standard: 'WHO-GACP-2024',
      compare_standards: ['Thai-FDA-2024'],
      comparison_type: 'detailed',
      results: {
        overall_alignment: 85,
        category_scores: {
          cultivation: 90,
          processing: 80,
        },
      },
      ...overrides,
    };
  }

  static createUser(overrides = {}) {
    return {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User',
      role: 'user',
      organization: 'Test Organization',
      ...overrides,
    };
  }
}

// API Test Helper
class ApiTestHelper {
  constructor(app) {
    this.app = app;
    this.authToken = null;
  }

  async authenticate(credentials = {}) {
    const defaultCredentials = {
      email: 'test@example.com',
      password: 'TestPassword123!',
    };

    const response = await request(this.app)
      .post('/api/auth/login')
      .send({ ...defaultCredentials, ...credentials })
      .expect(200);

    this.authToken = response.body.data.accessToken;
    return this.authToken;
  }

  get(url) {
    const req = request(this.app).get(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    return req;
  }

  post(url) {
    const req = request(this.app).post(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    return req;
  }

  put(url) {
    const req = request(this.app).put(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    return req;
  }

  delete(url) {
    const req = request(this.app).delete(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    return req;
  }
}

// Unit Test Helpers
const unitTestHelpers = {
  // Mock Express req/res objects
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),

  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  },

  mockNext: () => jest.fn(),

  // Database mocks
  mockMongoose: () => {
    const mockModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
    };

    return mockModel;
  },
};

// Integration Test Setup
const integrationTestSetup = {
  beforeAll: async () => {
    const testDb = new TestDatabase();
    await testDb.connect();
    return testDb;
  },

  afterAll: async testDb => {
    await testDb.disconnect();
  },

  beforeEach: async testDb => {
    await testDb.clearCollections();
  },
};

// Performance Test Helpers
const performanceTestHelpers = {
  // Measure function execution time
  measureTime: async fn => {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    return { result, duration };
  },

  // Load testing helper
  loadTest: async (fn, concurrency = 10, iterations = 100) => {
    const results = [];
    const promises = [];

    for (let i = 0; i < concurrency; i++) {
      const promise = (async () => {
        const threadResults = [];
        for (let j = 0; j < iterations / concurrency; j++) {
          const { result, duration } = await performanceTestHelpers.measureTime(fn);
          threadResults.push({ result, duration });
        }
        return threadResults;
      })();
      promises.push(promise);
    }

    const threadResults = await Promise.all(promises);
    threadResults.forEach(thread => results.push(...thread));

    return {
      totalRequests: results.length,
      averageTime: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      minTime: Math.min(...results.map(r => r.duration)),
      maxTime: Math.max(...results.map(r => r.duration)),
      successRate: (results.filter(r => !r.error).length / results.length) * 100,
    };
  },
};

// Test Suite Templates
const testSuiteTemplates = {
  // API endpoint test template
  apiEndpointTest: (endpoint, method, testCases) => {
    describe(`${method.toUpperCase()} ${endpoint}`, () => {
      let apiHelper;
      let testDb;

      beforeAll(async () => {
        testDb = await integrationTestSetup.beforeAll();
        // Assume app is available in test environment
        apiHelper = new ApiTestHelper(global.testApp);
      });

      afterAll(async () => {
        await integrationTestSetup.afterAll(testDb);
      });

      beforeEach(async () => {
        await integrationTestSetup.beforeEach(testDb);
      });

      testCases.forEach(testCase => {
        it(testCase.description, async () => {
          if (testCase.authenticate) {
            await apiHelper.authenticate();
          }

          const response = await apiHelper[method.toLowerCase()](endpoint)
            .send(testCase.body || {})
            .expect(testCase.expectedStatus || 200);

          if (testCase.expectedBody) {
            expect(response.body).toMatchObject(testCase.expectedBody);
          }

          if (testCase.customAssertions) {
            await testCase.customAssertions(response, apiHelper);
          }
        });
      });
    });
  },

  // Service/controller test template
  serviceTest: (serviceName, methods) => {
    describe(serviceName, () => {
      methods.forEach(method => {
        describe(method.name, () => {
          method.tests.forEach(test => {
            it(test.description, async () => {
              if (test.setup) {
                await test.setup();
              }

              const result = await test.execute();

              if (test.assertions) {
                await test.assertions(result);
              }

              if (test.cleanup) {
                await test.cleanup();
              }
            });
          });
        });
      });
    });
  },
};

// Custom Jest Matchers
const customMatchers = {
  // Check if response has valid API structure
  toBeValidApiResponse: received => {
    const pass =
      received.hasOwnProperty('success') &&
      received.hasOwnProperty('data') &&
      received.hasOwnProperty('timestamp');

    return {
      message: () =>
        pass
          ? 'Expected response not to be valid API response'
          : 'Expected response to be valid API response with success, data, and timestamp fields',
      pass,
    };
  },

  // Check if validation error format is correct
  toBeValidationError: received => {
    const pass =
      received.success === false && received.error && received.error.code === 'VALIDATION_ERROR';

    return {
      message: () =>
        pass
          ? 'Expected not to be validation error'
          : 'Expected to be validation error with proper format',
      pass,
    };
  },
};

// Test Data Cleanup
const testCleanup = {
  cleanupTestData: async () => {
    // Remove test files
    const fs = require('fs').promises;
    const path = require('path');

    const testFiles = [
      path.join(process.cwd(), 'uploads/test-*'),
      path.join(process.cwd(), 'reports/test-*'),
    ];

    for (const pattern of testFiles) {
      try {
        const files = await fs.readdir(path.dirname(pattern));
        const matchingFiles = files.filter(file =>
          file.startsWith(path.basename(pattern).replace('*', ''))
        );

        for (const file of matchingFiles) {
          await fs.unlink(path.join(path.dirname(pattern), file));
        }
      } catch (error) {
        console.warn('Cleanup warning:', error.message);
      }
    }
  },
};

module.exports = {
  testConfig,
  TestDatabase,
  TestDataFactory,
  ApiTestHelper,
  unitTestHelpers,
  integrationTestSetup,
  performanceTestHelpers,
  testSuiteTemplates,
  customMatchers,
  testCleanup,
};
