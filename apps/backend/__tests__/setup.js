// Test setup file
// Configure test environment before running tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/gacp-test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.CERTIFICATE_SIGNING_KEY = 'test-certificate-signing-key';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test utilities
global.testHelpers = {
  createMockObjectId: () => '507f1f77bcf86cd799439011',

  createMockApplication: () => ({
    applicationNumber: 'APP-2025-0001',
    applicantType: 'individual',
    status: 'APPROVED',
    farmInformation: {
      farmName: 'Test Farm',
      farmSize: 10,
      location: {
        province: 'กรุงเทพมหานคร',
        district: 'บางกอกใหญ่',
        subdistrict: 'วัดอรุณ'
      }
    }
  }),

  createMockCertificate: () => ({
    certificateNumber: 'GACP-25-BK-0001',
    certificateType: 'full',
    holderInfo: {
      holderType: 'individual',
      fullName: 'สมชาย ใจดี',
      nationalId: '1234567890123'
    },
    siteInfo: {
      farmName: 'Test Farm',
      totalArea: 10,
      certifiedArea: 10
    },
    issuanceDate: new Date(),
    expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
    status: 'active'
  })
};
