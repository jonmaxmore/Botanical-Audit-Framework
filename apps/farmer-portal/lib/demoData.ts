/**
 * Demo Data
 * Sample data for demonstrating the farmer portal features
 */

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DemoApplication {
  id: string;
  farmName: string;
  farmerId: string;
  status: string;
  submittedDate: string;
}

export interface DemoInspection {
  id: string;
  applicationId: string;
  farmerId: string;
  inspectorId: string;
  date: string;
  status: string;
}

export interface DemoCertificate {
  id: string;
  applicationId: string;
  farmerId: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
}

export const demoUsers: DemoUser[] = [
  {
    id: '1',
    name: 'นายสมชาย ใจดี',
    email: 'somchai@example.com',
    role: 'farmer'
  }
];

export const demoApplications: DemoApplication[] = [
  {
    id: 'APP-001',
    farmName: 'ฟาร์มทดสอบ A',
    farmerId: '1',
    status: 'pending',
    submittedDate: new Date().toISOString()
  }
];

export const demoInspections: DemoInspection[] = [
  {
    id: 'INS-001',
    applicationId: 'APP-001',
    farmerId: '1',
    inspectorId: '2',
    date: new Date().toISOString(),
    status: 'scheduled'
  }
];

export const demoCertificates: DemoCertificate[] = [
  {
    id: 'CERT-001',
    applicationId: 'APP-001',
    farmerId: '1',
    issuedDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  }
];
