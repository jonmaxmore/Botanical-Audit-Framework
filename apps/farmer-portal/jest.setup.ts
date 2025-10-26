/**
 * Jest Setup File
 * Runs before each test suite
 */

import '@testing-library/jest-dom';

// Mock Web APIs for Next.js server components
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(
      public url: string,
      public init: any,
    ) {}
    async json() {
      return JSON.parse(this.init.body);
    }
    async text() {
      return this.init.body;
    }
  } as any;
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(
      public body: any,
      public init?: any,
    ) {}
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }
    get status() {
      return this.init?.status || 200;
    }
    get headers() {
      return new Map();
    }
  } as any;
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers extends Map {} as any;
}

// Mock environment variables
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.OMISE_PUBLIC_KEY = 'pkey_test_mock';
process.env.OMISE_SECRET_KEY = 'skey_test_mock';
