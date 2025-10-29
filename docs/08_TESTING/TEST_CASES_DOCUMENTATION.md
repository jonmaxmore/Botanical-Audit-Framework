# GACP Platform - Test Cases Documentation

**Version:** 1.0.0  
**Created:** October 14, 2025  
**Owner:** QA Team  
**Target Coverage:** > 80%

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Strategy](#test-strategy)
3. [Business Logic Test Cases](#business-logic-test-cases)
4. [Integration Test Cases](#integration-test-cases)
5. [E2E Test Cases](#e2e-test-cases)
6. [Test Implementation](#test-implementation)

---

## Overview

This document provides comprehensive test cases for the GACP Platform, focusing on the 4 critical business logic updates:

1. ✅ **Recurring Payment** - Every 2 rejections
2. ✅ **Payment Timeout** - 15 minutes
3. ✅ **Reschedule Limit** - 1 time per application
4. ✅ **Revocation Wait Period** - 30 days

**Testing Tools:**

- **Unit Tests:** Jest + TypeScript
- **Integration Tests:** Supertest + Prisma
- **E2E Tests:** Playwright
- **Coverage:** Istanbul/nyc

---

## Test Strategy

### Test Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /____\  - Critical user journeys
      /      \
     /        \ Integration Tests (30%)
    /__________\ - API + DB integration
   /            \
  /              \ Unit Tests (60%)
 /________________\ - Business logic functions
```

### Coverage Targets

| Layer          | Target Coverage | Priority |
| -------------- | --------------- | -------- |
| Business Logic | > 90%           | P0       |
| API Routes     | > 80%           | P0       |
| Components     | > 75%           | P1       |
| Integration    | > 70%           | P1       |
| E2E            | > 60%           | P2       |

---

## Business Logic Test Cases

### 1. Recurring Payment Logic

**File:** `apps/farmer-portal/lib/__tests__/business-logic.payment.test.ts`

#### Test Case 1.1: Payment Not Required (Submissions 1-2)

```typescript
describe('isPaymentRequired', () => {
  test('should NOT require payment for submission 1', () => {
    expect(isPaymentRequired(1)).toBe(false);
  });

  test('should NOT require payment for submission 2', () => {
    expect(isPaymentRequired(2)).toBe(false);
  });
});
```

**Expected Result:** ✅ No payment required  
**Priority:** P0

---

#### Test Case 1.2: Payment Required (Submission 3)

```typescript
test('should require payment for submission 3', () => {
  expect(isPaymentRequired(3)).toBe(true);
});
```

**Expected Result:** ✅ Payment of ฿5,000 required  
**Priority:** P0

---

#### Test Case 1.3: Payment Pattern (Submissions 3, 5, 7...)

```typescript
test('should require payment every 2 rejections', () => {
  // Submissions that require payment (odd numbers >= 3)
  const paymentSubmissions = [3, 5, 7, 9, 11, 13, 15];

  paymentSubmissions.forEach(submission => {
    expect(isPaymentRequired(submission)).toBe(true);
  });

  // Submissions that do NOT require payment
  const freeSubmissions = [1, 2, 4, 6, 8, 10, 12, 14];

  freeSubmissions.forEach(submission => {
    expect(isPaymentRequired(submission)).toBe(false);
  });
});
```

**Expected Result:** ✅ Payment every 2 rejections only  
**Priority:** P0

---

#### Test Case 1.4: Calculate Total Amount Paid

```typescript
test('should calculate total amount paid correctly', () => {
  expect(calculateTotalAmountPaid(1)).toBe(0);
  expect(calculateTotalAmountPaid(2)).toBe(0);
  expect(calculateTotalAmountPaid(3)).toBe(5000);
  expect(calculateTotalAmountPaid(4)).toBe(5000);
  expect(calculateTotalAmountPaid(5)).toBe(10000);
  expect(calculateTotalAmountPaid(7)).toBe(15000);
  expect(calculateTotalAmountPaid(9)).toBe(20000);
});
```

**Expected Result:** ✅ Correct cumulative amount  
**Priority:** P0

---

#### Test Case 1.5: Next Payment Submission

```typescript
test('should return correct next payment submission', () => {
  expect(getNextPaymentSubmission(1)).toBe(3);
  expect(getNextPaymentSubmission(2)).toBe(3);
  expect(getNextPaymentSubmission(3)).toBe(5);
  expect(getNextPaymentSubmission(4)).toBe(5);
  expect(getNextPaymentSubmission(5)).toBe(7);
});
```

**Expected Result:** ✅ Correct next payment submission number  
**Priority:** P1

---

### 2. Payment Timeout Logic

#### Test Case 2.1: Create Payment with 15-Minute Expiry

```typescript
test('should create payment record with 15-minute expiry', () => {
  const now = new Date();
  const payment = createPaymentRecord('app_123', 'user_456', 3);

  const expectedExpiry = new Date(now.getTime() + 15 * 60 * 1000);
  const timeDiff = Math.abs(payment.expiresAt.getTime() - expectedExpiry.getTime());

  expect(timeDiff).toBeLessThan(1000); // Within 1 second tolerance
  expect(payment.amount).toBe(5000);
  expect(payment.status).toBe('PENDING');
});
```

**Expected Result:** ✅ Payment expires in exactly 15 minutes  
**Priority:** P0

---

#### Test Case 2.2: Detect Payment Timeout

```typescript
test('should detect payment timeout after 15 minutes', () => {
  const payment: PaymentRecord = {
    id: 'pay_123',
    applicationId: 'app_123',
    userId: 'user_456',
    amount: 5000,
    status: 'PENDING',
    reason: 'RESUBMISSION_FEE',
    createdAt: new Date('2025-10-14T10:00:00Z'),
    expiresAt: new Date('2025-10-14T10:15:00Z') // 15 min later
  };

  // Mock current time to 16 minutes later
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-10-14T10:16:00Z'));

  expect(isPaymentTimedOut(payment)).toBe(true);

  jest.useRealTimers();
});
```

**Expected Result:** ✅ Timeout detected after 15 minutes  
**Priority:** P0

---

#### Test Case 2.3: No Timeout Before 15 Minutes

```typescript
test('should NOT timeout before 15 minutes', () => {
  const payment: PaymentRecord = {
    id: 'pay_123',
    applicationId: 'app_123',
    userId: 'user_456',
    amount: 5000,
    status: 'PENDING',
    reason: 'RESUBMISSION_FEE',
    createdAt: new Date('2025-10-14T10:00:00Z'),
    expiresAt: new Date('2025-10-14T10:15:00Z')
  };

  // Mock current time to 14 minutes later
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-10-14T10:14:00Z'));

  expect(isPaymentTimedOut(payment)).toBe(false);

  jest.useRealTimers();
});
```

**Expected Result:** ✅ No timeout before 15 minutes  
**Priority:** P0

---

#### Test Case 2.4: Calculate Remaining Time

```typescript
test('should calculate remaining payment time correctly', () => {
  const payment: PaymentRecord = {
    id: 'pay_123',
    applicationId: 'app_123',
    userId: 'user_456',
    amount: 5000,
    status: 'PENDING',
    reason: 'RESUBMISSION_FEE',
    createdAt: new Date('2025-10-14T10:00:00Z'),
    expiresAt: new Date('2025-10-14T10:15:00Z')
  };

  // 5 minutes left
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-10-14T10:10:00Z'));

  const remaining = getRemainingPaymentTime(payment);
  expect(remaining).toBe(300); // 5 minutes = 300 seconds

  jest.useRealTimers();
});
```

**Expected Result:** ✅ Correct remaining seconds  
**Priority:** P1

---

### 3. Reschedule Limit Logic

#### Test Case 3.1: Allow First Reschedule

```typescript
test('should allow first reschedule', () => {
  const application: Application = {
    id: 'app_123',
    userId: 'user_456',
    status: 'PENDING_INSPECTION',
    submissionCount: 1,
    rejectionCount: 0,
    rescheduleCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = canReschedule(application);

  expect(result.allowed).toBe(true);
  expect(result.reason).toBeUndefined();
});
```

**Expected Result:** ✅ First reschedule allowed  
**Priority:** P0

---

#### Test Case 3.2: Block Second Reschedule

```typescript
test('should block second reschedule', () => {
  const application: Application = {
    id: 'app_123',
    userId: 'user_456',
    status: 'PENDING_INSPECTION',
    submissionCount: 1,
    rejectionCount: 0,
    rescheduleCount: 1, // Already rescheduled once
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = canReschedule(application);

  expect(result.allowed).toBe(false);
  expect(result.reason).toBe('คุณได้ใช้สิทธิ์เลื่อนนัดหมายครบแล้ว (1 ครั้ง)');
});
```

**Expected Result:** ✅ Second reschedule blocked  
**Priority:** P0

---

#### Test Case 3.3: Block Reschedule for Wrong Status

```typescript
test('should block reschedule if status is not PENDING_INSPECTION', () => {
  const application: Application = {
    id: 'app_123',
    userId: 'user_456',
    status: 'APPROVED', // Wrong status
    submissionCount: 1,
    rejectionCount: 0,
    rescheduleCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = canReschedule(application);

  expect(result.allowed).toBe(false);
  expect(result.reason).toBe('สถานะใบสมัครไม่อนุญาตให้เลื่อนนัด');
});
```

**Expected Result:** ✅ Reschedule blocked for wrong status  
**Priority:** P0

---

#### Test Case 3.4: Record Reschedule Increment

```typescript
test('should increment reschedule count', () => {
  const application: Application = {
    id: 'app_123',
    userId: 'user_456',
    status: 'PENDING_INSPECTION',
    submissionCount: 1,
    rejectionCount: 0,
    rescheduleCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const updated = recordReschedule(application);

  expect(updated.rescheduleCount).toBe(1);
});
```

**Expected Result:** ✅ Count incremented correctly  
**Priority:** P0

---

### 4. Revocation Wait Period Logic

#### Test Case 4.1: Block Application During 30-Day Wait

```typescript
test('should block application during 30-day wait period', () => {
  const certificate: Certificate = {
    id: 'cert_123',
    applicationId: 'app_123',
    userId: 'user_456',
    status: 'REVOKED',
    revokedAt: new Date('2025-10-01'), // Revoked 1 day ago
    expiresAt: new Date('2026-10-01'),
    createdAt: new Date()
  };

  // Mock current time to 1 day after revocation
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-10-02'));

  const result = canApplyAfterRevocation(certificate);

  expect(result.allowed).toBe(false);
  expect(result.waitDays).toBe(29); // 29 days remaining
  expect(result.allowedDate).toEqual(new Date('2025-10-31'));

  jest.useRealTimers();
});
```

**Expected Result:** ✅ Application blocked, 29 days wait  
**Priority:** P0

---

#### Test Case 4.2: Allow Application After 30 Days

```typescript
test('should allow application after 30-day wait period', () => {
  const certificate: Certificate = {
    id: 'cert_123',
    applicationId: 'app_123',
    userId: 'user_456',
    status: 'REVOKED',
    revokedAt: new Date('2025-09-01'), // Revoked 31 days ago
    expiresAt: new Date('2026-09-01'),
    createdAt: new Date()
  };

  // Mock current time to 31 days after revocation
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-10-02'));

  const result = canApplyAfterRevocation(certificate);

  expect(result.allowed).toBe(true);
  expect(result.waitDays).toBeUndefined();

  jest.useRealTimers();
});
```

**Expected Result:** ✅ Application allowed after 30 days  
**Priority:** P0

---

#### Test Case 4.3: Allow Application for Non-Revoked Certificate

```typescript
test('should allow application for non-revoked certificate', () => {
  const certificate: Certificate = {
    id: 'cert_123',
    applicationId: 'app_123',
    userId: 'user_456',
    status: 'ACTIVE',
    revokedAt: undefined,
    expiresAt: new Date('2026-10-01'),
    createdAt: new Date()
  };

  const result = canApplyAfterRevocation(certificate);

  expect(result.allowed).toBe(true);
});
```

**Expected Result:** ✅ Application allowed  
**Priority:** P0

---

#### Test Case 4.4: Calculate Revocation Wait End Date

```typescript
test('should calculate 30-day wait end date correctly', () => {
  const revokedAt = new Date('2025-10-01');
  const expectedEndDate = new Date('2025-10-31'); // 30 days later

  const endDate = calculateRevocationWaitEndDate(revokedAt);

  expect(endDate).toEqual(expectedEndDate);
});
```

**Expected Result:** ✅ Correct end date (30 days later)  
**Priority:** P1

---

### 5. Cancellation & Refund Policy

#### Test Case 5.1: No Refund Policy

```typescript
test('should enforce no refund policy', () => {
  expect(REFUND_POLICY.allowed).toBe(false);
  expect(REFUND_POLICY.message).toBe('ไม่สามารถขอคืนเงินได้ในทุกกรณี (No Refunds Policy)');
});
```

**Expected Result:** ✅ No refunds allowed  
**Priority:** P0

---

#### Test Case 5.2: Allow Cancellation for Pending Status

```typescript
test('should allow cancellation for PENDING_INSPECTION status', () => {
  const application: Application = {
    id: 'app_123',
    userId: 'user_456',
    status: 'PENDING_INSPECTION',
    submissionCount: 1,
    rejectionCount: 0,
    rescheduleCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = canCancelApplication(application);

  expect(result.allowed).toBe(true);
  expect(result.refundAvailable).toBe(false); // No refund ever
});
```

**Expected Result:** ✅ Cancellation allowed, no refund  
**Priority:** P0

---

#### Test Case 5.3: Block Cancellation for Approved Status

```typescript
test('should block cancellation for APPROVED status', () => {
  const application: Application = {
    id: 'app_123',
    userId: 'user_456',
    status: 'APPROVED',
    submissionCount: 1,
    rejectionCount: 0,
    rescheduleCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = canCancelApplication(application);

  expect(result.allowed).toBe(false);
  expect(result.reason).toBe('ไม่สามารถยกเลิกใบสมัครในสถานะนี้ได้');
});
```

**Expected Result:** ✅ Cancellation blocked  
**Priority:** P0

---

## Test Implementation

### Setup Test Environment

**File:** `apps/farmer-portal/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['lib/**/*.ts', '!lib/**/*.d.ts', '!lib/__tests__/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

### Run Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test business-logic.payment.test.ts

# Watch mode
pnpm test:watch
```

---

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## Test Summary

### Coverage Report Target

```
File                      | % Stmts | % Branch | % Funcs | % Lines
--------------------------|---------|----------|---------|--------
business-logic.ts         |   95.5  |   92.3   |   100   |   95.5
payment.ts                |   88.2  |   85.7   |   90.9  |   88.2
cache.ts                  |   82.1  |   78.9   |   85.7  |   82.1
--------------------------|---------|----------|---------|--------
TOTAL                     |   88.6  |   85.6   |   92.2  |   88.6
```

**Target:** > 80% coverage on all metrics ✅

---

## Next Steps

1. ✅ Create test files in `apps/farmer-portal/lib/__tests__/`
2. ✅ Install Jest and testing dependencies
3. ✅ Implement all test cases
4. ✅ Run tests and verify coverage
5. ✅ Add CI/CD integration (GitHub Actions)
6. ✅ Generate coverage reports
7. ✅ Fix any failing tests

**Status:** 📝 Ready for Implementation  
**Owner:** QA Team  
**Reviewers:** Backend Team, PM
