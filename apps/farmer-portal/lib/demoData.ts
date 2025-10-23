/**
 * Demo Data
 * Sample data for demonstrating the farmer portal features
 */

export const demoUsers = [
  {
    id: '1',
    name: 'นายสมชาย ใจดี',
    email: 'somchai@example.com',
    role: 'farmer',
  },
];

export const demoApplications = [
  {
    id: 'APP-001',
    farmName: 'ฟาร์มทดสอบ A',
    farmerId: '1',
    status: 'pending',
    submittedDate: new Date().toISOString(),
  },
];

export const demoInspections = [
  {
    id: 'INS-001',
    applicationId: 'APP-001',
    farmerId: '1',
    inspectorId: '2',
    date: new Date().toISOString(),
    status: 'scheduled',
  },
];

export const demoCertificates = [
  {
    id: 'CERT-001',
    applicationId: 'APP-001',
    farmerId: '1',
    issuedDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
];
