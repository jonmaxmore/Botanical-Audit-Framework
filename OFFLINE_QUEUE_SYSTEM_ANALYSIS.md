# Offline Queue System - Analysis & Testing Strategy

## 🎯 Executive Summary

โปรเจกต์มีระบบ **Offline-First Queue** ที่สมบูรณ์แล้ว สามารถนำมาใช้กับการทดสอบได้ทันที!

**ตำแหน่งไฟล์หลัก:**
1. ✅ `apps/frontend/src/utils/apiClient.js` - Offline Queue System (Legacy)
2. ✅ `frontend-nextjs/src/lib/api/retry.ts` - Retry Logic with Exponential Backoff (Modern)
3. ✅ Backend มี Queue System หลายระดับ

---

## 🔍 ระบบที่มีอยู่แล้ว

### 1. **Frontend Offline Queue System** (`apps/frontend/src/utils/apiClient.js`)

#### **คุณสมบัติหลัก:**

```javascript
// 1. เก็บคำขอที่ล้มเหลวไว้ใน localStorage
storeOfflineAction(method, url, data) {
  const offlineActions = JSON.parse(localStorage.getItem('offline_actions') || '[]');
  offlineActions.push({
    method,        // GET, POST, PUT, DELETE
    url,          // API endpoint
    data,         // Request payload
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem('offline_actions', JSON.stringify(offlineActions));
}

// 2. Sync อัตโนมัติเมื่ออินเทอร์เน็ตกลับมา
async syncOfflineActions() {
  const offlineActions = JSON.parse(localStorage.getItem('offline_actions') || '[]');
  
  for (const action of offlineActions) {
    try {
      await api[action.method](action.url, action.data);
      completedActions.push(action);
      console.log(`Successfully synced: ${action.method} ${action.url}`);
    } catch (error) {
      console.error(`Failed to sync: ${action.method} ${action.url}`, error);
    }
  }
  
  // ลบ actions ที่ sync สำเร็จแล้ว
  localStorage.setItem('offline_actions', JSON.stringify(remaining));
}

// 3. Auto-sync เมื่อกลับ online
window.addEventListener('online', () => {
  console.log('Back online, attempting to sync');
  apiClient.syncOfflineActions();
});
```

#### **การใช้งาน:**

```javascript
import apiClient from '@/utils/apiClient';

// POST request - จะ queue อัตโนมัติถ้าออฟไลน์
try {
  const response = await apiClient.post('/api/applications', applicationData);
} catch (error) {
  // ถ้า Network Error จะเก็บไว้ใน queue อัตโนมัติ
  console.log('Stored in offline queue');
}

// Manual sync
await apiClient.syncOfflineActions();
```

---

### 2. **Modern Retry System** (`frontend-nextjs/src/lib/api/retry.ts`)

#### **คุณสมบัติหลัก:**

```typescript
interface RetryOptions {
  maxAttempts?: number;          // Default: 3
  initialDelay?: number;         // Default: 1000ms
  maxDelay?: number;             // Default: 10000ms
  backoffMultiplier?: number;    // Default: 2 (exponential)
  retryableStatuses?: number[];  // Default: [408, 429, 500, 502, 503, 504]
  onRetry?: (attempt: number, error: Error) => void;
}

// Retry wrapper สำหรับ fetch
export async function retryFetch<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  // Retry with exponential backoff
  // Attempt 1: wait 1s
  // Attempt 2: wait 2s
  // Attempt 3: wait 4s
}

// JSON-specific helper
export async function retryFetchJSON<T>(
  url: string,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<T>
```

#### **Retryable Errors:**

```typescript
// 1. Network errors (TypeError: fetch failed)
// 2. Timeout errors (AbortError)
// 3. HTTP status codes:
//    - 408 Request Timeout
//    - 429 Too Many Requests
//    - 500 Internal Server Error
//    - 502 Bad Gateway
//    - 503 Service Unavailable
//    - 504 Gateway Timeout
```

#### **การใช้งาน:**

```typescript
import { retryFetch, retryFetchJSON } from '@/lib/api/retry';

// ตัวอย่างที่ 1: Retry fetch with custom options
const data = await retryFetch(
  () => fetch('http://localhost:3004/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applicationData)
  }),
  {
    maxAttempts: 5,
    initialDelay: 2000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`);
    }
  }
);

// ตัวอย่างที่ 2: Retry JSON request (easier)
const response = await retryFetchJSON<LoginResponse>(
  'http://localhost:3004/api/auth/login',
  {
    method: 'POST',
    body: JSON.stringify({ email, password })
  },
  { maxAttempts: 3 }
);
```

---

### 3. **Backend Queue Systems**

#### **3.1 Event Bus with Retry Queue** (`apps/backend/system/events/gacp-event-bus.js`)

```javascript
class GACPEventBus {
  constructor() {
    this.retryQueues = new Map();
    this.deadLetterQueue = [];
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
    };
  }

  async processRetryQueue() {
    // ลอง publish events ที่ล้มเหลว
    // ถ้าล้มเหลวเกิน maxRetries → ย้ายไป Dead Letter Queue
  }
}
```

#### **3.2 Notification Service with Queue** (`apps/backend/modules/notification-service`)

```javascript
async _queueNotificationDelivery(notification) {
  await this.queueService.add(
    'notification-delivery',
    { notificationId: notification.notificationId },
    {
      attempts: this.config.retry.maxAttempts[notification.priority],
      backoff: {
        type: 'exponential',
        delay: this.config.retry.baseDelayMs,
      },
    }
  );
}
```

#### **3.3 Blitzz Integration Service** (`apps/backend/services/blitzz-integration.js`)

```javascript
class BlitzzIntegrationService {
  constructor() {
    this.syncQueue = [];
    this.startSyncProcessor(); // Process every 30 seconds
  }

  async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const syncItem = this.syncQueue.shift();
      try {
        await this.syncWithBlitzz(syncItem);
      } catch (error) {
        // Retry logic
      }
    }
  }
}
```

---

## 🧪 วิธีนำมาใช้กับการทดสอบ

### **Strategy 1: ทดสอบ Offline Queue โดยตรง**

#### **Test 1: เก็บ actions ลง queue เมื่อออฟไลน์**

```typescript
// apps/farmer-portal/lib/__tests__/offline-queue.test.ts
import apiClient from '@/utils/apiClient';

describe('Offline Queue System', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it('should store POST request in queue when offline', async () => {
    // Mock network error
    global.fetch.mockRejectedValue(new Error('Network Error'));

    const testData = { farmName: 'Test Farm' };
    
    try {
      await apiClient.post('/api/applications', testData);
    } catch (error) {
      // Expected to fail
    }

    // ตรวจสอบว่า action ถูกเก็บใน localStorage
    const offlineActions = JSON.parse(
      localStorage.getItem('offline_actions') || '[]'
    );

    expect(offlineActions).toHaveLength(1);
    expect(offlineActions[0]).toMatchObject({
      method: 'post',
      url: '/api/applications',
      data: testData,
    });
  });

  it('should sync queued actions when back online', async () => {
    // 1. เก็บ actions หลายตัวใน queue
    const actions = [
      { method: 'post', url: '/api/applications', data: { id: 1 } },
      { method: 'post', url: '/api/applications', data: { id: 2 } },
    ];
    localStorage.setItem('offline_actions', JSON.stringify(actions));

    // 2. Mock successful fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    // 3. Sync
    const synced = await apiClient.syncOfflineActions();

    // 4. ตรวจสอบ
    expect(synced).toBe(2); // 2 actions synced
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    const remaining = JSON.parse(
      localStorage.getItem('offline_actions') || '[]'
    );
    expect(remaining).toHaveLength(0); // queue cleared
  });

  it('should keep failed actions in queue', async () => {
    // 1. เก็บ 2 actions
    const actions = [
      { method: 'post', url: '/api/applications', data: { id: 1 } },
      { method: 'post', url: '/api/applications', data: { id: 2 } },
    ];
    localStorage.setItem('offline_actions', JSON.stringify(actions));

    // 2. Mock: first succeeds, second fails
    global.fetch
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(new Error('Server Error'));

    // 3. Sync
    await apiClient.syncOfflineActions();

    // 4. ตรวจสอบว่า action ที่ล้มเหลวยังอยู่ใน queue
    const remaining = JSON.parse(
      localStorage.getItem('offline_actions') || '[]'
    );
    expect(remaining).toHaveLength(1);
    expect(remaining[0].data.id).toBe(2);
  });
});
```

---

### **Strategy 2: ทดสอบ Retry Logic**

#### **Test 2: Exponential Backoff**

```typescript
// frontend-nextjs/src/lib/api/__tests__/retry.test.ts
import { retryFetch, retryFetchJSON } from '../retry';

describe('Retry Logic', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should retry failed requests with exponential backoff', async () => {
    let attemptCount = 0;
    const mockFetch = jest.fn(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Network Error'));
      }
      return Promise.resolve({ ok: true, json: () => ({ success: true }) });
    });

    const promise = retryFetch(
      () => mockFetch(),
      { maxAttempts: 3, initialDelay: 1000 }
    );

    // Attempt 1 fails immediately
    await jest.advanceTimersByTimeAsync(0);

    // Wait 1s for attempt 2
    await jest.advanceTimersByTimeAsync(1000);

    // Wait 2s for attempt 3
    await jest.advanceTimersByTimeAsync(2000);

    const result = await promise;

    expect(attemptCount).toBe(3);
    expect(result).toEqual({ ok: true, json: expect.any(Function) });
  });

  it('should retry only on retryable HTTP status codes', async () => {
    const testCases = [
      { status: 503, shouldRetry: true },  // Service Unavailable
      { status: 500, shouldRetry: true },  // Internal Server Error
      { status: 404, shouldRetry: false }, // Not Found - NOT retryable
      { status: 400, shouldRetry: false }, // Bad Request - NOT retryable
    ];

    for (const testCase of testCases) {
      const mockFetch = jest.fn(() =>
        Promise.reject({ status: testCase.status })
      );

      try {
        await retryFetch(() => mockFetch(), { maxAttempts: 2 });
      } catch (error) {
        // Expected to fail
      }

      if (testCase.shouldRetry) {
        expect(mockFetch).toHaveBeenCalledTimes(2); // Retried
      } else {
        expect(mockFetch).toHaveBeenCalledTimes(1); // NOT retried
      }
    }
  });

  it('should call onRetry callback', async () => {
    const onRetry = jest.fn();
    const mockFetch = jest.fn(() => Promise.reject(new Error('Network Error')));

    try {
      await retryFetch(
        () => mockFetch(),
        { maxAttempts: 3, onRetry }
      );
    } catch (error) {
      // Expected to fail
    }

    // onRetry called twice (after attempt 1 and 2, not after final attempt 3)
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenNthCalledWith(1, 1, expect.any(Error));
    expect(onRetry).toHaveBeenNthCalledWith(2, 2, expect.any(Error));
  });
});
```

---

### **Strategy 3: Integration Test กับ HTTP Tests**

#### **Test 3: HTTP Test + Offline Queue**

```typescript
// apps/farmer-portal/lib/__tests__/integration/offline-integration.test.ts
import { createMockRequest } from '@/lib/test-utils/http-test-helpers';
import { POST as createApplication } from '@/app/api/applications/route';
import apiClient from '@/utils/apiClient';

describe('Offline Integration Tests', () => {
  beforeEach(async () => {
    await MockDatabase.reset();
    localStorage.clear();
  });

  it('should handle offline application creation', async () => {
    // 1. Simulate offline - create application
    const applicationData = {
      farmName: 'Test Farm Offline',
      farmerId: 'farmer123',
      cropType: 'Rice',
    };

    // Mock network error
    global.fetch = jest.fn(() => 
      Promise.reject(new Error('Network Error'))
    );

    // Try to create application (will fail and queue)
    try {
      await apiClient.post('/api/applications', applicationData);
    } catch (error) {
      // Expected
    }

    // Check queue
    const queue = JSON.parse(localStorage.getItem('offline_actions') || '[]');
    expect(queue).toHaveLength(1);

    // 2. Simulate back online
    global.fetch = jest.fn((url, options) => {
      // Call actual API route handler
      const request = createMockRequest('POST', '/api/applications', {
        body: JSON.parse(options.body),
      });
      return createApplication(request);
    });

    // 3. Sync queue
    await apiClient.syncOfflineActions();

    // 4. Verify application was created
    const applications = await MockDatabase.findApplicationsByFarmerId('farmer123');
    expect(applications).toHaveLength(1);
    expect(applications[0].farmName).toBe('Test Farm Offline');

    // 5. Queue should be empty
    const remainingQueue = JSON.parse(
      localStorage.getItem('offline_actions') || '[]'
    );
    expect(remainingQueue).toHaveLength(0);
  });

  it('should handle multiple offline operations in sequence', async () => {
    // 1. Offline - queue 3 operations
    const operations = [
      { url: '/api/applications', data: { farmName: 'Farm 1' } },
      { url: '/api/applications', data: { farmName: 'Farm 2' } },
      { url: '/api/applications', data: { farmName: 'Farm 3' } },
    ];

    global.fetch = jest.fn(() => 
      Promise.reject(new Error('Network Error'))
    );

    for (const op of operations) {
      try {
        await apiClient.post(op.url, op.data);
      } catch {}
    }

    // Queue should have 3 items
    const queue = JSON.parse(localStorage.getItem('offline_actions') || '[]');
    expect(queue).toHaveLength(3);

    // 2. Back online - sync all
    global.fetch = jest.fn((url, options) => {
      const request = createMockRequest('POST', url, {
        body: JSON.parse(options.body),
      });
      return createApplication(request);
    });

    await apiClient.syncOfflineActions();

    // 3. All 3 applications should be created
    const allApplications = await MockDatabase.applications;
    expect(allApplications).toHaveLength(3);
  });
});
```

---

### **Strategy 4: E2E Test กับ Playwright**

#### **Test 4: E2E Offline Scenario**

```typescript
// frontend-nextjs/tests/e2e/offline-queue.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Offline Queue E2E', () => {
  test('should queue application when offline and sync when online', async ({ page, context }) => {
    await page.goto('http://localhost:3001/farmer/applications/create');

    // 1. Go offline
    await context.setOffline(true);
    console.log('📴 Set offline mode');

    // 2. Try to submit application
    await page.fill('[name="farmName"]', 'Offline Test Farm');
    await page.fill('[name="location"]', 'Test Location');
    await page.click('button[type="submit"]');

    // 3. Should see offline message (customize based on your UI)
    await expect(page.locator('text=/stored.*offline|saved.*offline/i')).toBeVisible();

    // 4. Check localStorage for queued action
    const queue = await page.evaluate(() => {
      return localStorage.getItem('offline_actions');
    });
    expect(queue).toBeTruthy();
    const parsed = JSON.parse(queue);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].data.farmName).toBe('Offline Test Farm');

    // 5. Go back online
    await context.setOffline(false);
    console.log('📶 Back online');

    // 6. Trigger sync (or wait for auto-sync)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });

    // Wait for sync to complete
    await page.waitForTimeout(2000);

    // 7. Queue should be empty now
    const queueAfterSync = await page.evaluate(() => {
      return localStorage.getItem('offline_actions');
    });
    const parsedAfter = JSON.parse(queueAfterSync || '[]');
    expect(parsedAfter).toHaveLength(0);

    // 8. Navigate to applications list and verify
    await page.goto('http://localhost:3001/farmer/applications');
    await expect(page.locator('text=Offline Test Farm')).toBeVisible();
  });

  test('should handle slow network with retry', async ({ page }) => {
    // Enable slow network
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024,  // 50 KB/s
      uploadThroughput: 20 * 1024,    // 20 KB/s
      latency: 500,                    // 500ms
    });

    await page.goto('http://localhost:3001/farmer/applications/create');

    // Fill form
    await page.fill('[name="farmName"]', 'Slow Network Farm');
    
    // Track retry attempts
    const retryAttempts = [];
    page.on('console', msg => {
      if (msg.text().includes('Retry attempt')) {
        retryAttempts.push(msg.text());
      }
    });

    // Submit
    await page.click('button[type="submit"]');

    // Should eventually succeed (with retries)
    await expect(page.locator('text=/success|created/i')).toBeVisible({
      timeout: 30000 // 30 seconds
    });

    // Should have retried at least once
    expect(retryAttempts.length).toBeGreaterThan(0);
  });
});
```

---

## 📊 ตัวอย่างการใช้งานจริง

### **Scenario 1: Farmer สร้างใบขอในพื้นที่ห่างไกล (ไม่มีสัญญาณ)**

```typescript
// 1. เกษตรกรกรอกฟอร์มและกด Submit
await page.fill('[name="farmName"]', 'ฟาร์มในภูเขา');
await page.click('button[type="submit"]');

// 2. System ตรวจพบว่าออฟไลน์ → เก็บใน queue
// localStorage: offline_actions = [{
//   method: 'post',
//   url: '/api/applications',
//   data: { farmName: 'ฟาร์มในภูเขา', ... },
//   timestamp: '2025-10-25T10:30:00Z'
// }]

// 3. แสดง notification: "บันทึกข้อมูลไว้บนเครื่องแล้ว จะส่งอัตโนมัติเมื่อมีสัญญาณ"

// 4. เกษตรกรเดินทางกลับเมือง → มีสัญญาณ
// → Window 'online' event triggered
// → Auto-sync queue
// → Application created successfully
// → Notification: "ส่งข้อมูล 1 รายการสำเร็จ"
```

### **Scenario 2: เจ้าหน้าที่อนุมัติหลายรายการ (Network ช้า)**

```typescript
// 1. อนุมัติ 10 applications ติดต่อกัน
for (let i = 0; i < 10; i++) {
  await page.click(`[data-action="approve"][data-id="${i}"]`);
}

// 2. Network ช้า → Retry logic kicks in
// Attempt 1: 503 Service Unavailable → wait 1s → retry
// Attempt 2: 503 Service Unavailable → wait 2s → retry
// Attempt 3: 200 OK → Success

// 3. ทั้ง 10 applications approved successfully
// แต่บางตัวอาจใช้เวลา retry 2-3 ครั้ง
```

---

## 🎯 แนะนำการทดสอบ

### **Priority 1: Unit Tests (ทำก่อน)**

```typescript
// ✅ ง่าย รวดเร็ว ไม่ต้องใช้ network
1. ทดสอบ storeOfflineAction()
2. ทดสอบ syncOfflineActions()
3. ทดสอบ retry logic with mock fetch
4. ทดสอบ exponential backoff timing
```

### **Priority 2: Integration Tests**

```typescript
// ✅ ทดสอบ interaction ระหว่าง components
1. HTTP test + offline queue
2. MockDatabase + sync queue
3. Multiple operations in sequence
```

### **Priority 3: E2E Tests**

```typescript
// ⚠️ ช้า แต่ทดสอบ realistic scenarios
1. Offline → Online workflow
2. Slow network with retry
3. Multiple users with queue
```

---

## ✨ Features พิเศษที่สามารถทดสอบได้

### **1. Queue Persistence**

```typescript
// Queue ยังอยู่แม้ปิด browser
localStorage.setItem('offline_actions', JSON.stringify(actions));

// Reopen browser
const queue = JSON.parse(localStorage.getItem('offline_actions'));
// Queue still there!
```

### **2. Retry Counter**

```typescript
// Track จำนวนครั้งที่ retry
const action = {
  method: 'post',
  url: '/api/applications',
  data: { ... },
  timestamp: new Date(),
  retryCount: 0,  // เพิ่ม field นี้
  maxRetries: 3,
};
```

### **3. Priority Queue**

```typescript
// Applications ที่สำคัญ sync ก่อน
const queue = [
  { priority: 'high', url: '/api/emergency', ... },
  { priority: 'normal', url: '/api/applications', ... },
  { priority: 'low', url: '/api/logs', ... },
];

// Sort by priority before sync
queue.sort((a, b) => 
  priorityOrder[a.priority] - priorityOrder[b.priority]
);
```

### **4. Dead Letter Queue**

```typescript
// Actions ที่ล้มเหลวเกิน max retries
if (action.retryCount >= action.maxRetries) {
  moveToDeadLetterQueue(action);
  // Admin can review and retry manually
}
```

---

## 📋 Summary

### ✅ **ระบบที่มีอยู่แล้ว:**

1. **Offline Queue System** (`apiClient.js`)
   - ✅ Store actions ใน localStorage
   - ✅ Auto-sync เมื่อ online
   - ✅ Handle network errors

2. **Retry Logic** (`retry.ts`)
   - ✅ Exponential backoff
   - ✅ Configurable retries
   - ✅ Retryable status codes

3. **Backend Queues**
   - ✅ Event Bus retry queue
   - ✅ Notification queue
   - ✅ Sync queue (Blitzz)

### 🧪 **วิธีทดสอบ:**

1. **Unit Tests** - ทดสอบ queue logic
2. **Integration Tests** - HTTP tests + queue
3. **E2E Tests** - Offline/online scenarios
4. **Load Tests** - Queue under heavy load

### 🎯 **ประโยชน์:**

- ✅ **Offline-First**: ใช้งานได้แม้ไม่มีเน็ต
- ✅ **Reliable**: Retry อัตโนมัติ
- ✅ **User-Friendly**: ไม่เสีย data
- ✅ **Testable**: ทดสอบได้หลายระดับ

---

**สรุป:** ระบบ Offline Queue ที่มีอยู่ **พร้อมใช้งาน** และ **นำมาทดสอบได้ทันที**! ✅

**Next Steps:**
1. เพิ่ม unit tests สำหรับ queue system
2. ทดสอบ integration กับ HTTP tests ที่มีอยู่
3. เพิ่ม E2E tests สำหรับ offline scenarios
4. พิจารณาเพิ่ม features: priority queue, retry counter, dead letter queue
