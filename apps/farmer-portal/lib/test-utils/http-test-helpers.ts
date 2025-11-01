/**
 * HTTP Integration Test Helpers
 *
 * Utilities for testing Next.js API routes with actual HTTP layer execution.
 * These helpers mock NextRequest/NextResponse to test full request/response cycle.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a mock NextRequest for testing API routes
 *
 * @example
 * const request = createMockNextRequest('/api/auth/login', {
 *   method: 'POST',
 *   body: { email: 'test@example.com', password: 'Test123!' }
 * });
 */
export function createMockNextRequest(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {}, searchParams = {} } = options;

  // Build full URL with search params
  const urlObj = new URL(url, 'http://localhost:5000');
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Create request init options
  const init: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(urlObj.toString(), init);
}

/**
 * Parse NextResponse to get JSON body and status
 *
 * @example
 * const response = await POST(request);
 * const { status, body } = await parseNextResponse(response);
 */
export async function parseNextResponse(response: NextResponse): Promise<{
  status: number;
  body: any;
  headers: Record<string, string>;
}> {
  const status = response.status;
  const bodyText = await response.text();

  let body: any;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = bodyText;
  }

  // Extract headers
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return { status, body, headers };
}

/**
 * Create authenticated request with JWT token
 *
 * @example
 * const request = createAuthenticatedRequest('/api/users/profile', token, {
 *   method: 'GET'
 * });
 */
export function createAuthenticatedRequest(
  url: string,
  token: string,
  options: Parameters<typeof createMockNextRequest>[1] = {}
): NextRequest {
  return createMockNextRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Mock database connection for testing
 * Uses in-memory data structures instead of actual MongoDB
 */
export class MockDatabase {
  private users: Map<string, any> = new Map();
  private applications: Map<string, any> = new Map();
  private inspections: Map<string, any> = new Map();
  private certificates: Map<string, any> = new Map();
  private sequences: Map<string, number> = new Map();

  constructor() {
    // Initialize sequences
    this.sequences.set('farmer', 100);
    this.sequences.set('application', 1000);
    this.sequences.set('inspection', 2000);
    this.sequences.set('certificate', 3000);
  }

  // User operations
  async createUser(userData: any) {
    const id = `user_${Date.now()}_${Math.random()}`;
    // Default role to farmer if not specified
    const role = userData.role || 'farmer';
    const user = { id, ...userData, role, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async findUserByEmail(email: string) {
    // Case-insensitive email search
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string) {
    return this.users.get(id);
  }

  // Application operations
  async createApplication(appData: any) {
    const id = `app_${Date.now()}_${Math.random()}`;
    const app = { id, ...appData, createdAt: new Date() };
    this.applications.set(id, app);
    return app;
  }

  async findApplicationsByFarmerId(farmerId: string) {
    return Array.from(this.applications.values()).filter(a => a.farmerId === farmerId);
  }

  async findApplicationById(id: string) {
    return this.applications.get(id);
  }

  async updateApplication(id: string, updates: any) {
    const app = this.applications.get(id);
    if (!app) return null;
    const updated = { ...app, ...updates, modifiedAt: new Date() };
    this.applications.set(id, updated);
    return updated;
  }

  // Inspection operations
  async createInspection(inspectionData: any) {
    const id = `insp_${Date.now()}_${Math.random()}`;
    const inspection = { id, ...inspectionData, createdAt: new Date() };
    this.inspections.set(id, inspection);
    return inspection;
  }

  async findInspectionsByFarmerId(farmerId: string) {
    return Array.from(this.inspections.values()).filter(i => i.farmerId === farmerId);
  }

  async findInspectionsByInspectorId(inspectorId: string) {
    return Array.from(this.inspections.values()).filter(i => i.inspectorId === inspectorId);
  }

  async updateInspection(id: string, updates: any) {
    const inspection = this.inspections.get(id);
    if (!inspection) return null;
    const updated = { ...inspection, ...updates, modifiedAt: new Date() };
    this.inspections.set(id, updated);
    return updated;
  }

  // Certificate operations
  async createCertificate(certData: any) {
    const id = `cert_${Date.now()}_${Math.random()}`;
    const cert = { id, ...certData, createdAt: new Date() };
    this.certificates.set(id, cert);
    return cert;
  }

  async findCertificatesByFarmerId(farmerId: string) {
    return Array.from(this.certificates.values()).filter(c => c.farmerId === farmerId);
  }

  async findCertificatesByUserId(userId: string) {
    return Array.from(this.certificates.values()).filter(c => c.userId === userId);
  }

  async findCertificateByCertificateNumber(certificateNumber: string) {
    return Array.from(this.certificates.values()).find(
      c => c.certificateNumber === certificateNumber
    );
  }

  async updateCertificate(id: string, updates: any) {
    const cert = this.certificates.get(id);
    if (!cert) return null;
    const updated = { ...cert, ...updates, modifiedAt: new Date() };
    this.certificates.set(id, updated);
    return updated;
  }

  // User operations (additional)
  async updateUser(id: string, updates: any) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, modifiedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async findUsersByRole(role: string) {
    return Array.from(this.users.values()).filter(u => u.role === role);
  }

  // Sequence operations (for generating IDs)
  getNextSequence(name: string): number {
    const current = this.sequences.get(name) || 0;
    const next = current + 1;
    this.sequences.set(name, next);
    return next;
  }

  // Cleanup
  clear() {
    this.users.clear();
    this.applications.clear();
    this.inspections.clear();
    this.certificates.clear();
    this.sequences.clear();
  }
}

/**
 * Global mock database instance for tests
 */
export const mockDb = new MockDatabase();

/**
 * Setup function to run before each integration test
 */
export function setupIntegrationTest() {
  // Clear mock database
  mockDb.clear();

  // Reset any global state
  // Add more reset logic as needed
}

/**
 * Teardown function to run after each integration test
 */
export function teardownIntegrationTest() {
  mockDb.clear();
}

/**
 * Generate test JWT token for authenticated requests
 *
 * @example
 * const token = generateTestToken({ userId: '123', role: 'farmer' });
 */
export function generateTestToken(payload: {
  userId: string;
  email?: string;
  role?: string;
}): string {
  // In real implementation, use actual JWT library
  // For testing, create a simple mock token
  const tokenPayload = JSON.stringify(payload);
  return `test_token_${Buffer.from(tokenPayload).toString('base64')}`;
}

/**
 * Decode test JWT token
 */
export function decodeTestToken(token: string): any {
  if (!token.startsWith('test_token_')) {
    throw new Error('Invalid test token');
  }
  const payload = token.replace('test_token_', '');
  return JSON.parse(Buffer.from(payload, 'base64').toString());
}

/**
 * Assert response status and structure
 *
 * @example
 * await assertResponseStatus(response, 200, {
 *   success: true,
 *   data: expect.any(Object)
 * });
 */
export async function assertResponseStatus(
  response: NextResponse,
  expectedStatus: number,
  expectedBody?: any
) {
  const { status, body } = await parseNextResponse(response);

  expect(status).toBe(expectedStatus);

  if (expectedBody !== undefined) {
    expect(body).toMatchObject(expectedBody);
  }

  return { status, body };
}

/**
 * Create test user with common defaults
 */
export async function createTestUser(overrides: any = {}) {
  const defaultUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!',
    name: 'Test User',
    role: 'farmer',
    phone: '0812345678'
  };

  return mockDb.createUser({ ...defaultUser, ...overrides });
}

/**
 * Create test application with common defaults
 */
export async function createTestApplication(farmerId: string, overrides: any = {}) {
  const defaultApp = {
    farmerId,
    applicationNumber: `APP-2025-${mockDb.getNextSequence('application')}`,
    cropType: 'cannabis',
    farmSize: 10.5,
    status: 'DRAFT',
    submittedAt: new Date()
  };

  return mockDb.createApplication({ ...defaultApp, ...overrides });
}

/**
 * Create test inspection with common defaults
 */
export async function createTestInspection(
  applicationId: string,
  inspectorId: string,
  overrides: any = {}
) {
  const defaultInspection = {
    applicationId,
    inspectorId,
    inspectionNumber: `INS-2025-${mockDb.getNextSequence('inspection')}`,
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'SCHEDULED'
  };

  return mockDb.createInspection({ ...defaultInspection, ...overrides });
}

/**
 * Create test certificate with common defaults
 */
export async function createTestCertificate(userId: string, overrides: any = {}) {
  const defaultCert = {
    userId,
    certificateNumber: `GACP-2025-${mockDb.getNextSequence('certificate')}`,
    issuedDate: new Date(),
    expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
    status: 'ACTIVE'
  };

  return mockDb.createCertificate({ ...defaultCert, ...overrides });
}
