# Phase 1.2: Payment UI Implementation Guide

**Duration**: 3 weeks
**Budget**: 400,000 THB
**Priority**: HIGH - Critical for farmer experience

## Table of Contents

1. [Overview](#overview)
2. [Current Status Analysis](#current-status-analysis)
3. [Backend APIs Available](#backend-apis-available)
4. [Farmer Portal Implementation](#farmer-portal-implementation)
5. [Admin Portal Implementation](#admin-portal-implementation)
6. [Testing Strategy](#testing-strategy)
7. [Implementation Timeline](#implementation-timeline)

---

## Overview

### Objectives

Complete the payment UI implementation for both Farmer Portal and Admin Portal:

- **Farmer Portal**: PromptPay QR code display, payment status tracking, payment history
- **Admin Portal**: Payment dashboard, transaction monitoring, refund processing
- **Integration**: Connect existing components to Backend APIs
- **Testing**: Comprehensive testing of payment workflows

### Current Completion Status

| Component          | Backend | Frontend | Integration | Overall |
| ------------------ | ------- | -------- | ----------- | ------- |
| Payment Processing | ✅ 90%  | 🟡 30%   | ✅ 85%      | 🟡 68%  |
| PromptPay QR       | ✅ 100% | ❌ 20%   | ❌ 10%      | 🟡 43%  |
| Payment Status UI  | ✅ 95%  | 🟡 40%   | 🟡 30%      | 🟡 55%  |
| Payment History    | ✅ 90%  | ❌ 25%   | ❌ 15%      | 🟡 43%  |
| Admin Dashboard    | ✅ 85%  | ❌ 30%   | ❌ 20%      | 🟡 45%  |
| Refund Workflow UI | ✅ 100% | ❌ 0%    | ❌ 0%       | ❌ 33%  |

**Overall**: 🟡 48% Complete → Target: ✅ 100%

---

## Current Status Analysis

### What Exists

#### Backend (90% Complete)

✅ **Complete Payment APIs**:

- POST `/api/payments/calculate-fees` - Fee calculation
- POST `/api/payments/initiate` - Initiate payment with PromptPay QR
- GET `/api/payments/:paymentId` - Get payment status
- POST `/api/payments/webhook` - Process payment webhooks (100% automated)
- POST `/api/payments/:paymentId/retry` - Retry failed payment
- POST `/api/payments/:paymentId/cancel` - Cancel pending payment
- POST `/api/payments/:paymentId/refund` - Process refund (admin only)
- GET `/api/payments/application/:applicationId` - Get application payments
- GET `/api/payments/user/history` - Get user payment history
- GET `/api/payments/receipt/:paymentId` - Download receipt
- GET `/api/payments/stats` - Payment statistics (admin only)

✅ **Payment Service Features**:

- PromptPay QR code generation (EMV format)
- Webhook signature verification (HMAC-SHA256)
- Automatic payment verification (no manual verification needed)
- Receipt generation
- Refund processing with validation
- Audit logging

#### Frontend (30% Complete)

🟡 **Partially Implemented**:

- `apps/farmer-portal/components/PaymentModal.tsx` - Basic payment modal UI
- `apps/farmer-portal/components/PaymentStatusBadge.tsx` - Status badge component
- `apps/farmer-portal/lib/payment.ts` - Payment utilities (Omise mock)

❌ **Missing Components**:

- PromptPay QR code display component
- Payment countdown timer
- Real-time payment status polling
- Payment history page
- Admin payment dashboard
- Refund workflow UI

### What Needs to Be Built

#### Farmer Portal (Missing 70%)

1. **PromptPay QR Code Display** - Show QR code with countdown timer
2. **Payment Status Tracking** - Real-time status updates via polling
3. **Payment History Page** - List all payments with filters
4. **Receipt Download** - Download PDF receipts

#### Admin Portal (Missing 70%)

1. **Payment Dashboard** - Overview of all transactions
2. **Transaction List** - Searchable, filterable payment list
3. **Payment Details View** - Detailed payment information
4. **Refund Processing UI** - Interface for processing refunds
5. **Payment Analytics** - Charts and statistics

---

## Backend APIs Available

### 1. Fee Calculation API

**Endpoint**: `POST /api/payments/calculate-fees`

**Request**:

```json
{
  "applicationType": "NEW_CERTIFICATION",
  "isExpedited": false,
  "requiresInspection": true,
  "promoCode": "WELCOME10",
  "applicationId": "67890abcdef"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Fees calculated successfully",
  "data": {
    "feeBreakdown": {
      "baseFee": 5000,
      "inspectionFee": 2000,
      "processingFee": 100,
      "expeditedFee": 0,
      "discountAmount": 700,
      "subtotal": 6400,
      "vatAmount": 448,
      "totalAmount": 6848,
      "currency": "THB",
      "paymentType": "CERTIFICATION_FEE"
    },
    "expiryMinutes": 15,
    "calculatedAt": "2025-10-27T10:00:00.000Z",
    "validUntil": "2025-10-27T10:30:00.000Z"
  }
}
```

---

### 2. Initiate Payment API

**Endpoint**: `POST /api/payments/initiate`

**Request**:

```json
{
  "applicationId": "67890abcdef",
  "paymentType": "CERTIFICATION_FEE",
  "amount": 6848,
  "feeBreakdown": {
    "baseFee": 5000,
    "inspectionFee": 2000,
    "processingFee": 100,
    "vatAmount": 448,
    "totalAmount": 6848
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "PAY_1730012345678",
    "amount": 6848,
    "currency": "THB",
    "status": "PENDING",
    "expiresAt": "2025-10-27T10:15:00.000Z",
    "promptPay": {
      "qrCode": "00020101021229370016A000000677010112...",
      "qrCodeImage": "data:image/png;base64,iVBORw0KGgo...",
      "referenceNumber": "GACP12345678",
      "expiryDate": "2025-10-27T10:15:00.000Z"
    },
    "feeBreakdown": {
      "baseFee": 5000,
      "inspectionFee": 2000,
      "processingFee": 100,
      "vatAmount": 448,
      "totalAmount": 6848
    }
  }
}
```

---

### 3. Get Payment Status API

**Endpoint**: `GET /api/payments/:paymentId`

**Response**:

```json
{
  "success": true,
  "data": {
    "paymentId": "PAY_1730012345678",
    "applicationId": "67890abcdef",
    "amount": 6848,
    "currency": "THB",
    "status": "COMPLETED",
    "paymentType": "CERTIFICATION_FEE",
    "createdAt": "2025-10-27T10:00:00.000Z",
    "paidAt": "2025-10-27T10:05:00.000Z",
    "expiresAt": "2025-10-27T10:15:00.000Z",
    "isExpired": false,
    "canRetry": false,
    "feeBreakdown": {...},
    "receipt": {
      "receiptNumber": "GACP-2025-10-12345678",
      "receiptUrl": "https://storage.example.com/receipts/..."
    }
  }
}
```

---

### 4. Get User Payment History API

**Endpoint**: `GET /api/payments/user/history`

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (PENDING, COMPLETED, FAILED, CANCELLED, EXPIRED, REFUNDED)
- `startDate`: Start date filter (ISO 8601)
- `endDate`: End date filter (ISO 8601)
- `paymentType`: Filter by payment type

**Response**:

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "paymentId": "PAY_1730012345678",
        "applicationId": "67890abcdef",
        "amount": 6848,
        "status": "COMPLETED",
        "createdAt": "2025-10-27T10:00:00.000Z",
        "paidAt": "2025-10-27T10:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "totalItems": 45
    },
    "summary": {
      "totalPaid": 123456,
      "totalPending": 6848,
      "completedCount": 44,
      "pendingCount": 1
    }
  }
}
```

---

### 5. Process Refund API (Admin Only)

**Endpoint**: `POST /api/payments/:paymentId/refund`

**Request**:

```json
{
  "reason": "APPLICATION_REJECTED",
  "amount": 6848,
  "notes": "Application rejected due to incomplete documents"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundAmount": 6848,
    "refundDate": "2025-10-27T12:00:00.000Z"
  }
}
```

---

## Farmer Portal Implementation

### Directory Structure

```
apps/farmer-portal/
├── app/
│   ├── payments/
│   │   ├── page.tsx              # Payment history page
│   │   └── [paymentId]/
│   │       └── page.tsx          # Payment detail page
│   └── applications/
│       └── [id]/
│           └── payment/
│               └── page.tsx      # Application payment page
├── components/
│   ├── payment/
│   │   ├── PromptPayQRDisplay.tsx       # QR code component
│   │   ├── PaymentStatusCard.tsx        # Status card
│   │   ├── PaymentCountdownTimer.tsx    # Countdown timer
│   │   ├── PaymentHistoryTable.tsx      # History table
│   │   ├── PaymentDetailsModal.tsx      # Details modal
│   │   └── FeeBreakdownCard.tsx         # Fee breakdown
│   ├── PaymentModal.tsx          # Existing modal (update)
│   └── PaymentStatusBadge.tsx    # Existing badge (update)
├── lib/
│   ├── api/
│   │   └── payment-api.ts        # Payment API client
│   ├── hooks/
│   │   ├── usePayment.ts         # Payment hook
│   │   ├── usePaymentHistory.ts  # History hook
│   │   └── usePaymentStatus.ts   # Status polling hook
│   └── payment.ts                # Existing utilities (update)
└── types/
    └── payment.ts                # Payment types
```

---

### Implementation Steps

#### Step 1: Create Type Definitions

**File**: `apps/farmer-portal/types/payment.ts`

```typescript
/**
 * Payment Type Definitions
 * Complete TypeScript interfaces for payment system
 */

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PARTIAL_REFUNDED';

export type PaymentType = 'CERTIFICATION_FEE' | 'INSPECTION_FEE' | 'RENEWAL_FEE' | 'AMENDMENT_FEE';

export interface FeeBreakdown {
  baseFee: number;
  inspectionFee: number;
  processingFee: number;
  expeditedFee: number;
  discountAmount: number;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  paymentType: PaymentType;
  calculatedAt?: string;
  calculationVersion?: string;
}

export interface PromptPayData {
  qrCode: string;
  qrCodeImage: string;
  referenceNumber: string;
  expiryDate: string;
  paymentMethod: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  receiptUrl?: string;
  generatedAt?: string;
}

export interface Payment {
  paymentId: string;
  applicationId: string;
  userId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentType: PaymentType;
  createdAt: string;
  paidAt?: string;
  expiresAt: string;
  isExpired: boolean;
  canRetry: boolean;
  feeBreakdown: FeeBreakdown;
  promptPay?: PromptPayData;
  receipt?: PaymentReceipt;
  lastAttempt?: PaymentAttempt;
}

export interface PaymentAttempt {
  attemptedAt: string;
  status: PaymentStatus;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  summary: {
    totalPaid: number;
    totalPending: number;
    completedCount: number;
    pendingCount: number;
  };
}

export interface FeeCalculationRequest {
  applicationType: 'NEW_CERTIFICATION' | 'RENEWAL' | 'AMENDMENT';
  isExpedited?: boolean;
  requiresInspection?: boolean;
  promoCode?: string;
  applicationId?: string;
}

export interface PaymentInitiationRequest {
  applicationId: string;
  paymentType: PaymentType;
  amount: number;
  feeBreakdown: FeeBreakdown;
}
```

---

#### Step 2: Create Payment API Client

**File**: `apps/farmer-portal/lib/api/payment-api.ts`

```typescript
/**
 * Payment API Client
 * Handles all communication with payment backend
 */

import { getCookie } from 'cookies-next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Add authentication token
  const token = getCookie('farmer_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `Request failed with status ${response.status}`,
      errorData,
    );
  }

  return response.json();
}

export const paymentApi = {
  /**
   * Calculate application fees
   */
  calculateFees: async (request: FeeCalculationRequest) => {
    return apiClient<{ success: boolean; data: { feeBreakdown: FeeBreakdown } }>(
      '/api/payments/calculate-fees',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    );
  },

  /**
   * Initiate payment process
   */
  initiatePayment: async (request: PaymentInitiationRequest) => {
    return apiClient<{ success: boolean; data: Payment }>('/api/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (paymentId: string) => {
    return apiClient<{ success: boolean; data: Payment }>(`/api/payments/${paymentId}`);
  },

  /**
   * Get user payment history
   */
  getPaymentHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    startDate?: string;
    endDate?: string;
    paymentType?: PaymentType;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>,
      ),
    ).toString();

    return apiClient<{ success: boolean; data: PaymentHistoryResponse }>(
      `/api/payments/user/history${queryString ? `?${queryString}` : ''}`,
    );
  },

  /**
   * Get application payments
   */
  getApplicationPayments: async (applicationId: string) => {
    return apiClient<{
      success: boolean;
      data: { payments: Payment[]; totalAmount: number };
    }>(`/api/payments/application/${applicationId}`);
  },

  /**
   * Retry failed payment
   */
  retryPayment: async (paymentId: string) => {
    return apiClient<{ success: boolean; data: Payment }>(`/api/payments/${paymentId}/retry`, {
      method: 'POST',
    });
  },

  /**
   * Cancel pending payment
   */
  cancelPayment: async (paymentId: string, reason?: string) => {
    return apiClient<{ success: boolean; message: string }>(`/api/payments/${paymentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Download payment receipt
   */
  downloadReceipt: (paymentId: string) => {
    const token = getCookie('farmer_token');
    const url = `${API_BASE_URL}/api/payments/receipt/${paymentId}`;
    window.open(`${url}${token ? `?token=${token}` : ''}`, '_blank', 'noopener,noreferrer');
  },
};
```

---

#### Step 3: Create Payment Hooks

**File**: `apps/farmer-portal/lib/hooks/usePayment.ts`

```typescript
/**
 * usePayment Hook
 * React hook for payment operations
 */

import { useState, useCallback } from 'react';
import { paymentApi } from '../api/payment-api';
import type {
  FeeCalculationRequest,
  PaymentInitiationRequest,
  FeeBreakdown,
  Payment,
} from '@/types/payment';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFees = useCallback(async (request: FeeCalculationRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.calculateFees(request);
      return response.data.feeBreakdown;
    } catch (err: any) {
      setError(err.message || 'Failed to calculate fees');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const initiatePayment = useCallback(async (request: PaymentInitiationRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.initiatePayment(request);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const retryPayment = useCallback(async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.retryPayment(paymentId);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to retry payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPayment = useCallback(async (paymentId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      await paymentApi.cancelPayment(paymentId, reason);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    calculateFees,
    initiatePayment,
    retryPayment,
    cancelPayment,
  };
}
```

**File**: `apps/farmer-portal/lib/hooks/usePaymentStatus.ts`

```typescript
/**
 * usePaymentStatus Hook
 * Real-time payment status polling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { paymentApi } from '../api/payment-api';
import type { Payment } from '@/types/payment';

interface UsePaymentStatusOptions {
  paymentId: string;
  enabled?: boolean;
  pollingInterval?: number; // milliseconds
  onStatusChange?: (payment: Payment) => void;
}

export function usePaymentStatus({
  paymentId,
  enabled = true,
  pollingInterval = 3000,
  onStatusChange,
}: UsePaymentStatusOptions) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const previousStatusRef = useRef<string>();

  const fetchPaymentStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await paymentApi.getPaymentStatus(paymentId);
      const newPayment = response.data;
      setPayment(newPayment);

      // Detect status change
      if (
        previousStatusRef.current &&
        previousStatusRef.current !== newPayment.status &&
        onStatusChange
      ) {
        onStatusChange(newPayment);
      }

      previousStatusRef.current = newPayment.status;

      // Stop polling if payment is in terminal state
      if (['COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED'].includes(newPayment.status)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  }, [paymentId, onStatusChange]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchPaymentStatus();

    // Set up polling
    intervalRef.current = setInterval(fetchPaymentStatus, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollingInterval, fetchPaymentStatus]);

  const refetch = useCallback(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  return { payment, loading, error, refetch };
}
```

**File**: `apps/farmer-portal/lib/hooks/usePaymentHistory.ts`

```typescript
/**
 * usePaymentHistory Hook
 * Fetch and manage payment history
 */

import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../api/payment-api';
import type { PaymentHistoryResponse, PaymentStatus, PaymentType } from '@/types/payment';

interface UsePaymentHistoryOptions {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  paymentType?: PaymentType;
}

export function usePaymentHistory(options: UsePaymentHistoryOptions = {}) {
  const [data, setData] = useState<PaymentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.getPaymentHistory(options);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
}
```

---

#### Step 4: Create PromptPay QR Display Component

**File**: `apps/farmer-portal/components/payment/PromptPayQRDisplay.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import type { PromptPayData } from '@/types/payment';

interface PromptPayQRDisplayProps {
  promptPay: PromptPayData;
  amount: number;
  expiresAt: string;
  onExpired?: () => void;
}

export default function PromptPayQRDisplay({
  promptPay,
  amount,
  expiresAt,
  onExpired,
}: PromptPayQRDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Calculate time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;
      return Math.max(0, Math.floor(diff / 1000)); // seconds
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0 && onExpired) {
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  // Format time left
  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy reference number
  const copyReferenceNumber = async () => {
    try {
      await navigator.clipboard.writeText(promptPay.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isExpiring = timeLeft > 0 && timeLeft <= 60; // Last minute
  const isExpired = timeLeft === 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <QrCode className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">ชำระเงินผ่าน PromptPay</h3>
          <p className="text-sm text-gray-600">สแกน QR Code เพื่อชำระเงิน</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img
              src={promptPay.qrCodeImage}
              alt="PromptPay QR Code"
              className="w-64 h-64"
            />
          </div>
        </div>

        {/* Amount Display */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">จำนวนเงินที่ต้องชำระ</p>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('th-TH', {
              style: 'currency',
              currency: 'THB',
              minimumFractionDigits: 0,
            }).format(amount)}
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className={`px-4 py-2 rounded-lg ${
              isExpired
                ? 'bg-red-100'
                : isExpiring
                  ? 'bg-yellow-100'
                  : 'bg-green-100'
            }`}
          >
            {isExpired ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-600">หมดเวลาชำระเงิน</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xl font-bold ${
                    isExpiring ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {formatTimeLeft(timeLeft)}
                </span>
                <span className="text-sm text-gray-600">
                  {isExpiring ? 'เหลือเวลา!' : 'นาที'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reference Number */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">หมายเลขอ้างอิง</p>
              <p className="font-mono font-semibold text-gray-900">
                {promptPay.referenceNumber}
              </p>
            </div>
            <button
              onClick={copyReferenceNumber}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="คัดลอก"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">วิธีชำระเงิน</h4>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>เปิดแอปพลิเคชันธนาคารที่รองรับ PromptPay</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>เลือกเมนู "สแกน QR" หรือ "PromptPay"</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>สแกน QR Code ด้านบน</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">4.</span>
            <span>ตรวจสอบจำนวนเงินและยืนยันการชำระ</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">5.</span>
            <span>ระบบจะอัปเดตสถานะอัตโนมัติเมื่อชำระเงินสำเร็จ</span>
          </li>
        </ol>
      </div>

      {/* Warning */}
      {isExpiring && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 text-sm">
                เหลือเวลาน้อยกว่า 1 นาที!
              </p>
              <p className="text-sm text-yellow-800">
                กรุณาชำระเงินก่อนหมดเวลา มิฉะนั้นจะต้องเริ่มกระบวนการใหม่
              </p>
            </div>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">หมดเวลาชำระเงิน</p>
              <p className="text-sm text-red-800">
                กรุณาเริ่มกระบวนการชำระเงินใหม่อีกครั้ง
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

#### Step 5: Create Payment Status Card Component

**File**: `apps/farmer-portal/components/payment/PaymentStatusCard.tsx`

```typescript
'use client';

import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import type { Payment } from '@/types/payment';

interface PaymentStatusCardProps {
  payment: Payment;
  onRetry?: () => void;
  onDownloadReceipt?: () => void;
}

export default function PaymentStatusCard({
  payment,
  onRetry,
  onDownloadReceipt,
}: PaymentStatusCardProps) {
  const getStatusConfig = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'ชำระเงินสำเร็จ',
          description: 'การชำระเงินของคุณเสร็จสมบูรณ์แล้ว',
        };
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          label: 'รอการชำระเงิน',
          description: 'กรุณาชำระเงินภายในเวลาที่กำหนด',
        };
      case 'FAILED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'การชำระเงินล้มเหลว',
          description: 'กรุณาลองใหม่อีกครั้ง',
        };
      case 'CANCELLED':
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: 'ยกเลิกการชำระเงิน',
          description: 'การชำระเงินถูกยกเลิก',
        };
      case 'EXPIRED':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          label: 'หมดเวลาชำระเงิน',
          description: 'เวลาชำระเงินหมดแล้ว กรุณาเริ่มใหม่',
        };
      case 'REFUNDED':
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          label: 'คืนเงินแล้ว',
          description: 'เงินได้รับการคืนแล้ว',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: 'ไม่ทราบสถานะ',
          description: '',
        };
    }
  };

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-lg border ${statusConfig.border} ${statusConfig.bg} p-6`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg ${statusConfig.bg}`}>
          <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${statusConfig.color} mb-1`}>
            {statusConfig.label}
          </h3>
          <p className="text-sm text-gray-600">{statusConfig.description}</p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">หมายเลขการชำระเงิน</p>
            <p className="font-mono font-semibold text-gray-900">{payment.paymentId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">จำนวนเงิน</p>
            <p className="font-bold text-gray-900">
              {new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB',
                minimumFractionDigits: 0,
              }).format(payment.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">วันที่สร้าง</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(payment.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {payment.paidAt && (
            <div>
              <p className="text-xs text-gray-600 mb-1">วันที่ชำระ</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(payment.paidAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Receipt */}
        {payment.receipt && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">เลขที่ใบเสร็จ</p>
                <p className="font-mono font-semibold text-gray-900">
                  {payment.receipt.receiptNumber}
                </p>
              </div>
              {onDownloadReceipt && (
                <button
                  onClick={onDownloadReceipt}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดใบเสร็จ</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {payment.canRetry && onRetry && (
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <RefreshCw className="w-5 h-5" />
          <span>ลองชำระเงินอีกครั้ง</span>
        </button>
      )}

      {payment.status === 'EXPIRED' && onRetry && (
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
        >
          <RefreshCw className="w-5 h-5" />
          <span>เริ่มการชำระเงินใหม่</span>
        </button>
      )}
    </div>
  );
}
```

---

### Implementation continues in next section...

**Total Implementation Guide Size**: ~2000+ lines of code

**Next Sections**:

- Payment History Page
- Fee Breakdown Component
- Admin Portal Payment Dashboard
- Testing Strategy
- Deployment Checklist

---

## Summary

Phase 1.2 focuses on completing the payment UI with:

✅ **Type-safe TypeScript interfaces**
✅ **Complete API client with error handling**
✅ **React hooks for payment operations**
✅ **Real-time payment status polling**
✅ **PromptPay QR display with countdown timer**
✅ **Payment status cards with actions**
✅ **Receipt download functionality**

**Timeline**: 3 weeks (400K THB)
**Team**: 2 Frontend + 1 Backend + 1 QA

**Next Steps**: Continue implementation with Admin Portal dashboard and testing.
