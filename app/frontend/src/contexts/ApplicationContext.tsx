'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { retryFetch } from '@/lib/api/retry'; // Task 2.1 - Retry logic

// Types
export type WorkflowState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PAYMENT_PENDING_1'
  | 'PAYMENT_PROCESSING_1'
  | 'DOCUMENT_REVIEW'
  | 'DOCUMENT_REVISION'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_APPROVED'
  | 'PAYMENT_PENDING_2'
  | 'PAYMENT_PROCESSING_2'
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTION_VDO_CALL'
  | 'INSPECTION_ON_SITE'
  | 'INSPECTION_COMPLETED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CERTIFICATE_GENERATING'
  | 'CERTIFICATE_ISSUED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'ON_HOLD';

export interface Payment {
  phase: 1 | 2;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PAID';
  transactionId?: string;
  paidAt?: string;
  receiptUrl?: string;
}

export type PaymentCollection = Payment[] & {
  phase1?: Payment;
  phase2?: Payment;
  [phase: string]: Payment | undefined;
};

export interface Document {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface Inspection {
  id: string;
  type: 'VDO_CALL' | 'ON_SITE';
  inspectorId: string;
  inspectorName: string;
  scheduledDateTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  score?: number;
  report?: string;
  completedAt?: string;
}

export interface ReviewData {
  completeness?: number;
  accuracy?: number;
  compliance?: number;
  riskLevel?: string;
  reviewer?: string;
  reviewedAt?: string;
  notes?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface CCPResult {
  id: string;
  name: string;
  description?: string;
  maxScore?: number;
  score?: number;
  notes?: string;
  photos?: string[];
}

export interface InspectionChecklistItem {
  id: string;
  question: string;
  description?: string;
  score?: number;
  status?: string;
  notes?: string;
  photos?: string[];
}

export interface InspectionSummary {
  type?: 'ON_SITE' | 'VDO_CALL';
  totalScore?: number;
  passStatus?: string;
  inspectorName?: string;
  inspectedAt?: string;
  inspectedBy?: string;
  inspectorId?: string;
  notes?: string;
  decision?: string;
  score?: number;
  finalNotes?: string;
  ccps?: CCPResult[];
  checklist?: InspectionChecklistItem[];
  photos?: string[];
  attachments?: string[];
}

export interface ApprovalData {
  decision?: string;
  notes?: string;
  approvedAt?: string;
  approvedBy?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface FarmInfo {
  name?: string;
  farmName?: string;
  address?: string;
  farmAddress?: string;
  size?: number | string;
  farmSize?: number | string;
  cropType?: string;
  province?: string;
  farmType?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface FarmerInfo {
  name?: string;
  farmerName?: string;
  phone?: string;
  email?: string;
  experience?: number | string;
  idCard?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface Application {
  id: string;
  applicationNumber: string;
  farmerId: string;
  farmerName: string;
  currentState: WorkflowState;
  currentStep: number; // 1-8
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  workflowState?: WorkflowState; // Legacy field support
  farmName?: string;
  farmInfo?: FarmInfo;
  farmerInfo?: FarmerInfo;
  reviewData?: ReviewData;
  inspectionData?: InspectionSummary;
  approvalData?: ApprovalData;
  inspections: Inspection[];
  inspection?: Inspection;
  payments: PaymentCollection;
  documents: Document[];
  rejectionCount: number;
  approvalScore?: number;
  certificateNumber?: string;
  certificateIssuedAt?: string;
  certificateUrl?: string;
}

type UpdateApplicationFn = {
  (application: Application): Promise<void>;
  (id: string, data: any): Promise<void>;
};

interface ApplicationContextType {
  applications: Application[];
  currentApplication: Application | null;
  isLoading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  fetchApplicationById: (id: string) => Promise<void>;
  createApplication: (farmData: any) => Promise<Application>;
  updateApplication: UpdateApplicationFn;
  submitApplication: (id: string) => Promise<void>;
  recordPayment: (applicationId: string, phase: 1 | 2, paymentData: any) => Promise<void>;
  uploadDocument: (applicationId: string, documentData: FormData) => Promise<void>;
  setCurrentApplication: (application: Application | null) => void;
  clearError: () => void;
}

// Create Context
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Provider Props
interface ApplicationProviderProps {
  children: ReactNode;
}

// Provider Component
export function ApplicationProvider({ children }: ApplicationProviderProps) {
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = 'http://localhost:3004/api';

  // Helper to get headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  });

  // Fetch all applications for current user (with Retry)
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Task 2.1: Wrap fetch with retry logic (2 attempts, fast retry for list view)
      const data = await retryFetch(
        async () => {
          const response = await fetch(`${apiUrl}/applications`, {
            headers: getHeaders(),
          });

          if (!response.ok) {
            const error: any = new Error('Failed to fetch applications');
            error.status = response.status;
            throw error;
          }

          return response.json();
        },
        {
          maxAttempts: 2,
          initialDelay: 500,
          onRetry: (attempt: number, error: Error) => {
            console.warn(`🔄 Fetch applications retry ${attempt}/2:`, error.message);
          },
        }
      );

      setApplications(data.applications || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Fetch applications error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single application by ID (with Retry)
  const fetchApplicationById = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Task 2.1: Wrap fetch with retry logic (2 attempts, fast retry)
      const data = await retryFetch(
        async () => {
          const response = await fetch(`${apiUrl}/applications/${id}`, {
            headers: getHeaders(),
          });

          if (!response.ok) {
            const error: any = new Error('Failed to fetch application');
            error.status = response.status;
            throw error;
          }

          return response.json();
        },
        {
          maxAttempts: 2,
          initialDelay: 500,
          onRetry: (attempt: number, error: Error) => {
            console.warn(`🔄 Fetch application retry ${attempt}/2:`, error.message);
          },
        }
      );

      setCurrentApplication(data.application);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Fetch application error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new application (with Retry)
  const createApplication = async (farmData: any): Promise<Application> => {
    try {
      setIsLoading(true);
      setError(null);

      // Task 2.1: Wrap fetch with retry logic (3 attempts, prevent data loss)
      const data = await retryFetch(
        async () => {
          const response = await fetch(`${apiUrl}/applications`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(farmData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const error: any = new Error(errorData.message || 'Failed to create application');
            error.status = response.status;
            throw error;
          }

          return response.json();
        },
        {
          maxAttempts: 3,
          initialDelay: 1000,
          onRetry: (attempt: number, error: Error) => {
            console.warn(`🔄 Create application retry ${attempt}/3:`, error.message);
          },
        }
      );

      const newApplication = data.application;

  setApplications((prev: Application[]) => [...prev, newApplication]);
      setCurrentApplication(newApplication);

      return newApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Create application error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update application (with Retry)
  const syncApplicationsState = (updatedApplication: Application) => {
    setApplications((prev: Application[]) =>
      prev.map((app: Application) => (app.id === updatedApplication.id ? updatedApplication : app))
    );

    if (currentApplication?.id === updatedApplication.id) {
      setCurrentApplication(updatedApplication);
    }
  };

  const performUpdate = async (id: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Task 2.1: Wrap fetch with retry logic (3 attempts, prevent data loss)
      const responseData = await retryFetch(
        async () => {
          const response = await fetch(`${apiUrl}/applications/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const error: any = new Error(errorData.message || 'Failed to update application');
            error.status = response.status;
            throw error;
          }

          return response.json();
        },
        {
          maxAttempts: 3,
          initialDelay: 1000,
          onRetry: (attempt: number, error: Error) => {
            console.warn(`🔄 Update application retry ${attempt}/3:`, error.message);
          },
        }
      );

      const updatedApplication = responseData.application;
      syncApplicationsState(updatedApplication);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Update application error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplication: UpdateApplicationFn = async (
    idOrApplication: string | Application,
    data?: any
  ) => {
    if (typeof idOrApplication === 'string') {
      await performUpdate(idOrApplication, data ?? {});
      return;
    }

    const applicationData = idOrApplication;
    syncApplicationsState(applicationData);
  };

  // Submit application
  const submitApplication = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/applications/${id}/submit`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const data = await response.json();
      const submittedApplication = data.application;

      setApplications((prev: Application[]) =>
        prev.map((app: Application) => (app.id === id ? submittedApplication : app))
      );

      if (currentApplication?.id === id) {
        setCurrentApplication(submittedApplication);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Submit application error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Record payment
  const recordPayment = async (applicationId: string, phase: 1 | 2, paymentData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/payments/phase${phase}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          applicationId,
          ...paymentData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      const data = await response.json();
      const updatedApplication = data.application;

      setApplications((prev: Application[]) =>
        prev.map((app: Application) => (app.id === applicationId ? updatedApplication : app))
      );

      if (currentApplication?.id === applicationId) {
        setCurrentApplication(updatedApplication);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Record payment error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload document
  const uploadDocument = async (applicationId: string, documentData: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/applications/${applicationId}/documents/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: documentData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      const updatedApplication = data.application;

      setApplications((prev: Application[]) =>
        prev.map((app: Application) => (app.id === applicationId ? updatedApplication : app))
      );

      if (currentApplication?.id === applicationId) {
        setCurrentApplication(updatedApplication);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Upload document error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value: ApplicationContextType = {
    applications,
    currentApplication,
    isLoading,
    error,
    fetchApplications,
    fetchApplicationById,
    createApplication,
    updateApplication,
    submitApplication,
    recordPayment,
    uploadDocument,
    setCurrentApplication,
    clearError,
  };

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

// Custom hook
export function useApplication() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}

// Temporary alias for legacy imports while refactor stabilizes
export function useApplicationContext() {
  return useApplication();
}
