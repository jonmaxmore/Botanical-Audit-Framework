# Admin Portal Development Plan

**Target:** 100% Complete by End of Week 2  
**Current:** 40-60% Complete  
**Estimated Effort:** 20-30 hours

---

## 📋 Current Status

### ✅ Completed (40-60%)

- Basic Next.js structure
- Authentication context
- Layout components
- 2 routes implemented
- Test framework setup

### ⚠️ Missing (40-60%)

- User management interface
- System configuration pages
- Analytics dashboards
- Report generation UI

---

## 🎯 Development Tasks

### Phase 1: User Management (8-10 hours)

#### 1.1 User List Page

**File:** `app/users/page.tsx`

**Features:**

- List all users (farmers + DTAM staff)
- Search and filter
- Pagination
- Role badges
- Status indicators

**Reference:** `apps/farmer-portal/app/dashboard/page.tsx`

#### 1.2 User Details/Edit

**File:** `app/users/[id]/page.tsx`

**Features:**

- View user details
- Edit user information
- Change role
- Reset password
- Deactivate/activate user

#### 1.3 Create User

**File:** `app/users/new/page.tsx`

**Features:**

- Create farmer account
- Create DTAM staff account
- Role selection
- Email verification

**API Endpoints:**

- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

---

### Phase 2: System Configuration (6-8 hours)

#### 2.1 Application Settings

**File:** `app/settings/application/page.tsx`

**Features:**

- Application fee configuration
- Certification fee configuration
- Payment methods
- Application workflow settings

#### 2.2 Notification Settings

**File:** `app/settings/notifications/page.tsx`

**Features:**

- Email templates editor
- SMS templates editor
- LINE Notify configuration
- Notification triggers

#### 2.3 Payment Gateway Config

**File:** `app/settings/payment/page.tsx`

**Features:**

- PromptPay configuration
- Payment gateway credentials
- Webhook settings
- Test mode toggle

**API Endpoints:**

- `GET /api/settings` - Get all settings
- `PUT /api/settings/:key` - Update setting

---

### Phase 3: Analytics Dashboards (4-6 hours)

#### 3.1 Overview Dashboard

**File:** `app/analytics/page.tsx`

**Features:**

- Cannabis-first metrics
- Total applications by status
- Revenue tracking
- Regional breakdown
- Approval rate trends

**Reference:** `apps/backend/modules/dashboard/`

#### 3.2 Inspector Performance

**File:** `app/analytics/inspectors/page.tsx`

**Features:**

- Inspector workload
- Average inspection time
- Approval rates by inspector
- Performance rankings

#### 3.3 Regional Analytics

**File:** `app/analytics/regions/page.tsx`

**Features:**

- Applications by province
- Cannabis cultivation by region
- Certification rates by region
- Heat map visualization

**API Endpoints:**

- `GET /api/dashboard/stats` - Overall statistics
- `GET /api/dashboard/inspectors` - Inspector metrics
- `GET /api/dashboard/regions` - Regional data

---

### Phase 4: Report Generation (2-4 hours)

#### 4.1 Report Builder

**File:** `app/reports/page.tsx`

**Features:**

- Custom report builder
- Date range selection
- Filter options
- Export formats (CSV, Excel, PDF)

#### 4.2 Scheduled Reports

**File:** `app/reports/scheduled/page.tsx`

**Features:**

- Create scheduled reports
- Email delivery
- Report history
- Template management

**API Endpoints:**

- `POST /api/reports/generate` - Generate report
- `GET /api/reports/history` - Report history
- `POST /api/reports/schedule` - Schedule report

---

## 🛠️ Implementation Guide

### Step 1: Set Up API Client

**File:** `lib/api-client.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('dtam_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Step 2: Create Reusable Components

**Components to create:**

- `components/users/UserTable.tsx`
- `components/users/UserForm.tsx`
- `components/settings/SettingCard.tsx`
- `components/analytics/MetricCard.tsx`
- `components/analytics/Chart.tsx`
- `components/reports/ReportBuilder.tsx`

### Step 3: Implement Pages

Follow this pattern for each page:

```typescript
// app/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import UserTable from '@/components/users/UserTable';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      <UserTable users={users} loading={loading} />
    </div>
  );
}
```

---

## 📦 Required Dependencies

```bash
cd apps/admin-portal

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/x-data-grid
npm install recharts
npm install date-fns
npm install react-hook-form
npm install zod
npm install @tanstack/react-query
```

---

## 🧪 Testing Strategy

### Unit Tests

- Test each component in isolation
- Mock API calls
- Test form validation

### Integration Tests

- Test page workflows
- Test API integration
- Test authentication

### E2E Tests

- Test complete user journeys
- Test CRUD operations
- Test report generation

---

## 📊 Progress Tracking

### Day 1-2: User Management

- [ ] User list page
- [ ] User details page
- [ ] Create user page
- [ ] API integration
- [ ] Tests

### Day 3-4: System Configuration

- [ ] Application settings
- [ ] Notification settings
- [ ] Payment configuration
- [ ] API integration
- [ ] Tests

### Day 5: Analytics Dashboards

- [ ] Overview dashboard
- [ ] Inspector performance
- [ ] Regional analytics
- [ ] Charts and visualizations

### Day 6: Report Generation

- [ ] Report builder
- [ ] Scheduled reports
- [ ] Export functionality

### Day 7: Testing & Polish

- [ ] Integration testing
- [ ] Bug fixes
- [ ] UI/UX improvements
- [ ] Documentation

---

## 🎨 Design Guidelines

### Follow Farmer Portal Patterns

- Use same color scheme
- Use same component library (MUI)
- Use same layout structure
- Maintain consistent navigation

### Cannabis-First Ordering

- Cannabis metrics displayed first
- Cannabis in all dropdown menus first
- Cannabis-specific features highlighted

### Responsive Design

- Mobile-friendly layouts
- Tablet optimization
- Desktop full features

---

## 🔗 Reference Files

**Farmer Portal (100% complete):**

- `apps/farmer-portal/app/dashboard/page.tsx`
- `apps/farmer-portal/components/`
- `apps/farmer-portal/lib/`

**Backend APIs:**

- `apps/backend/modules/dashboard/`
- `apps/backend/routes/`

**Authentication:**

- `apps/admin-portal/lib/auth-context.tsx`

---

## ✅ Definition of Done

### User Management

- [ ] All CRUD operations working
- [ ] Role-based access control
- [ ] Search and filter functional
- [ ] Tests passing

### System Configuration

- [ ] All settings editable
- [ ] Changes persist correctly
- [ ] Validation working
- [ ] Tests passing

### Analytics

- [ ] All metrics displaying correctly
- [ ] Charts rendering properly
- [ ] Data refreshing automatically
- [ ] Cannabis-first ordering

### Reports

- [ ] Report generation working
- [ ] Export formats functional
- [ ] Scheduled reports working
- [ ] Email delivery working

---

**Start Date:** Week 2, Day 1  
**Target Completion:** Week 2, Day 7  
**Owner:** Frontend Team  
**Reviewer:** Tech Lead
