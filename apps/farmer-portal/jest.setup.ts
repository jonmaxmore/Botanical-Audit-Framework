/**
 * Jest Setup File
 * Runs before each test suite
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.OMISE_PUBLIC_KEY = 'pkey_test_mock';
process.env.OMISE_SECRET_KEY = 'skey_test_mock';
