# Admin Portal - Backend Integration Plan

## 📊 สถานะปัจจุบัน

### ✅ สิ่งที่มีอยู่แล้ว

#### Backend APIs (100% พร้อมใช้งาน)

- ✅ `/api/dtam/applications` - Application management (CRUD)
- ✅ `/api/dtam/applications/:id/review` - Review workflow
- ✅ `/api/dtam/applications/:id/approve` - Approval workflow
- ✅ `/api/dtam/applications/:id/reject` - Rejection workflow
- ✅ `/api/dtam/applications/:id/assign-reviewer` - Assign reviewer
- ✅ `/api/dtam/applications/:id/assign-inspector` - Assign inspector
- ✅ `/api/dtam/applications/:id/documents` - Document management
- ✅ `/api/dtam/applications/:id/verify-identity` - Identity verification
- ✅ `/api/dtam/applications/:id/verify-land` - Land verification
- ✅ `/api/admin/applications/analytics/dashboard` - Analytics
- ✅ `/api/admin/applications/system/health` - Health check

#### Frontend API Clients (100% พร้อมใช้งาน)

- ✅ `lib/api/applications.ts` - Complete API client with all methods
- ✅ `lib/api/users.ts` - User management API
- ✅ `lib/api/dashboard.ts` - Dashboard API

#### UI Components (100% สมบูรณ์)

- ✅ 14 หน้าทั้งหมดสร้างเสร็จแล้ว
- ✅ 20+ components พร้อมใช้งาน
- ✅ Layout และ Navigation ครบถ้วน

### ⚠️ สิ่งที่ต้องทำ

1. **เปลี่ยนจาก Mock Data เป็น Real API** (ใช้เวลา 2-3 วัน)
2. **เพิ่ม Error Handling** (ใช้เวลา 1 วัน)
3. **เพิ่ม Loading States** (ใช้เวลา 1 วัน)
4. **เพิ่ม Tests** (ใช้เวลา 3-4 วัน)

---

## 🎯 แผนการดำเนินงาน

### Phase 1: เชื่อม Backend APIs (2-3 วัน)

#### Day 1: Authentication & Core APIs

- [x] ตรวจสอบ Backend APIs ที่มีอยู่ ✅
- [x] ตรวจสอบ Frontend API Clients ✅
- [ ] แก้ไข Login page ให้เรียก Real API
- [ ] แก้ไข Applications page ให้เรียก Real API
- [ ] แก้ไข Dashboard page ให้เรียก Real API

#### Day 2: Review & Approval Workflow

- [ ] แก้ไข Reviews page ให้เรียก Real API
- [ ] แก้ไข Application Detail page ให้เรียก Real API
- [ ] เพิ่ม Review Dialog integration
- [ ] เพิ่ม Approval/Rejection integration

#### Day 3: User Management & Settings

- [ ] แก้ไข Users page ให้เรียก Real API
- [ ] แก้ไข Roles page ให้เรียก Real API
- [ ] แก้ไข Settings page ให้เรียก Real API
- [ ] ทดสอบ Integration ทั้งหมด

### Phase 2: Error Handling & Loading States (1 วัน)

#### Day 4: Polish & UX

- [ ] เพิ่ม Error Boundaries ทุกหน้า
- [ ] เพิ่ม Loading Spinners
- [ ] เพิ่ม Toast Notifications
- [ ] เพิ่ม Retry Logic
- [ ] เพิ่ม Offline Detection

### Phase 3: Testing (3-4 วัน)

#### Day 5-6: Unit Tests

- [ ] Test Components (20+ components)
- [ ] Test API Clients
- [ ] Test Utilities
- [ ] Target: 80% coverage

#### Day 7-8: Integration & E2E Tests

- [ ] Test User Workflows
- [ ] Test Review Workflows
- [ ] Test Approval Workflows
- [ ] Test Error Scenarios

---

## 🔧 การแก้ไขแต่ละหน้า

### 1. Login Page (`app/login/page.tsx`)

**ปัจจุบัน:** Mock JWT generation

```typescript
// Mock - ต้องแก้
const mockToken = 'mock-jwt-token-' + Date.now();
localStorage.setItem('admin_token', mockToken);
```

**ต้องแก้เป็น:**

```typescript
// Real API call
const response = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await response.json();
localStorage.setItem('admin_token', token);
```

### 2. Applications Page (`app/applications/page.tsx`)

**ปัจจุบัน:** Mock data array

```typescript
// Mock - ต้องแก้
const mockApplications = [
  { id: '1', farmName: 'ฟาร์มทดสอบ A', status: 'pending' }
  // ...
];
setApplications(mockApplications);
```

**ต้องแก้เป็น:**

```typescript
// Real API call - มี API client อยู่แล้ว!
import { getApplications } from '@/lib/api/applications';

const response = await getApplications({
  page: 1,
  limit: 20,
  status: filterStatus
});
setApplications(response.data);
```

### 3. Dashboard Page (`app/dashboard/page.tsx`)

**ปัจจุบัน:** Mock KPIs

```typescript
// Mock - ต้องแก้
const mockStats = {
  totalApplications: 1248,
  pendingReview: 156
  // ...
};
```

**ต้องแก้เป็น:**

```typescript
// Real API call
import { getApplicationStats } from '@/lib/api/applications';

const stats = await getApplicationStats();
setDashboardData(stats);
```

### 4. Users Page (`app/users/page.tsx`)

**ปัจจุบัน:** Mock users array

```typescript
// Mock - ต้องแก้
const mockUsers = [
  { id: '1', name: 'นายสมชาย', role: 'reviewer' }
  // ...
];
```

**ต้องแก้เป็น:**

```typescript
// Real API call
import { getUsers } from '@/lib/api/users';

const response = await getUsers({ page: 1, limit: 20 });
setUsers(response.data);
```

---

## 📝 Checklist การแก้ไข

### หน้าที่ต้องแก้ (Priority Order)

#### 🔴 High Priority (ต้องทำก่อน)

- [ ] `/login` - Authentication
- [ ] `/applications` - Application list
- [ ] `/applications/[id]` - Application detail
- [ ] `/dashboard` - Dashboard KPIs

#### 🟡 Medium Priority

- [ ] `/reviews` - Reviews list
- [ ] `/reviews/[id]` - Review detail
- [ ] `/users` - User management
- [ ] `/inspectors` - Inspector management

#### 🟢 Low Priority

- [ ] `/certificates` - Certificates
- [ ] `/reports` - Reports
- [ ] `/statistics` - Statistics
- [ ] `/roles` - Role management
- [ ] `/settings` - Settings
- [ ] `/audit-logs` - Audit logs

---

## 🚀 Quick Start Guide

### Step 1: ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_PORTAL_URL=http://localhost:3002
```

### Step 2: เริ่ม Backend Server

```bash
cd apps/backend
npm run dev
# Backend จะรันที่ http://localhost:3000
```

### Step 3: เริ่ม Admin Portal

```bash
cd apps/admin-portal
npm run dev
# Admin Portal จะรันที่ http://localhost:3002
```

### Step 4: ทดสอบ API Connection

เปิด Browser Console และทดสอบ:

```javascript
// Test API connection
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log);
```

---

## 📊 Progress Tracking

| Component      | Status     | Progress | Notes                    |
| -------------- | ---------- | -------- | ------------------------ |
| Backend APIs   | ✅ Ready   | 100%     | ครบถ้วนทุก endpoint      |
| API Clients    | ✅ Ready   | 100%     | มีครบทุก method          |
| UI Components  | ✅ Ready   | 100%     | 14 หน้า + 20+ components |
| Integration    | ⏳ Pending | 0%       | ยังใช้ Mock data         |
| Error Handling | ⏳ Pending | 0%       | ต้องเพิ่ม                |
| Testing        | ⏳ Pending | 0%       | ต้องเพิ่ม 432+ tests     |

---

## 🎯 Success Criteria

### Phase 1 Complete เมื่อ:

- ✅ ทุกหน้าเรียก Real API แทน Mock data
- ✅ Login/Logout ทำงานได้จริง
- ✅ CRUD operations ทำงานได้ทั้งหมด
- ✅ Review workflow ทำงานได้
- ✅ Approval workflow ทำงานได้

### Phase 2 Complete เมื่อ:

- ✅ Error handling ครบทุกหน้า
- ✅ Loading states ครบทุกหน้า
- ✅ Toast notifications ทำงาน
- ✅ Retry logic ทำงาน

### Phase 3 Complete เมื่อ:

- ✅ Unit tests ≥ 80% coverage
- ✅ Integration tests ผ่านทั้งหมด
- ✅ E2E tests ผ่านทั้งหมด
- ✅ No critical bugs

---

## 🔗 Related Documents

- [Backend API Documentation](../apps/backend/README.md)
- [Admin Portal README](../apps/admin-portal/README.md)
- [API Client Documentation](../apps/admin-portal/lib/api/README.md)
- [Testing Strategy](./TESTING_STRATEGY.md)

---

**สถานะ:** 📋 Ready to Start  
**เวลาโดยประมาณ:** 7-8 วัน  
**ความพร้อม Backend:** ✅ 100%  
**ความพร้อม Frontend:** ✅ 100%  
**ที่ต้องทำ:** เชื่อมต่อ + Testing

---

**อัพเดทล่าสุด:** 2025-01-XX  
**ผู้รับผิดชอบ:** Development Team
