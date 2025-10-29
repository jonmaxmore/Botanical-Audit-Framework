# Comprehensive System Test Plan - GACP Platform

**Created:** 2025-01-15  
**Test Scope:** Full System (Frontend + Backend + UX/UI)  
**Status:** 🆕 Ready to Execute

---

## 🎯 Test Objectives

1. **Functional Testing** - ทดสอบทุกฟีเจอร์ทำงานถูกต้อง
2. **Integration Testing** - ทดสอบการเชื่อมต่อระหว่างระบบ
3. **UX/UI Testing** - ทดสอบประสบการณ์ผู้ใช้และการออกแบบ
4. **Performance Testing** - ทดสอบความเร็วและประสิทธิภาพ
5. **Security Testing** - ทดสอบความปลอดภัย
6. **Cross-Browser Testing** - ทดสอบบนเบราว์เซอร์ต่างๆ

---

## 📋 Test Checklist Overview

### Backend API (16+ Services)
- [ ] Authentication Services (Farmer & DTAM)
- [ ] Application Workflow
- [ ] Certificate Management
- [ ] Farm Management
- [ ] Document Management
- [ ] Payment Processing
- [ ] Notification System
- [ ] Dashboard & Analytics
- [ ] IoT Integration
- [ ] AI Recommendations

### Frontend Portals (3 Portals)
- [ ] Farmer Portal (31 pages)
- [ ] Admin Portal (12 pages)
- [ ] Certificate Portal (7 pages)

### UX/UI Design
- [ ] Responsive Design
- [ ] Accessibility
- [ ] Visual Consistency
- [ ] User Flow
- [ ] Error Handling

---

## 🔧 Backend API Testing

### 1. Authentication Services

#### Farmer Authentication (`/api/auth/farmer/*`)

**Test Cases:**

```bash
# TC-AUTH-F-001: Register New Farmer
POST http://localhost:3000/api/auth/farmer/register
Content-Type: application/json

{
  "email": "test.farmer@example.com",
  "password": "Test123!@#",
  "fullName": "นายทดสอบ ระบบ",
  "phoneNumber": "0812345678",
  "nationalId": "1234567890123"
}

Expected: 201 Created, JWT token returned
```

```bash
# TC-AUTH-F-002: Login Farmer
POST http://localhost:3000/api/auth/farmer/login
Content-Type: application/json

{
  "email": "test.farmer@example.com",
  "password": "Test123!@#"
}

Expected: 200 OK, JWT token + user data
```

```bash
# TC-AUTH-F-003: Get Farmer Profile
GET http://localhost:3000/api/auth/farmer/profile
Authorization: Bearer {farmer_token}

Expected: 200 OK, farmer profile data
```

```bash
# TC-AUTH-F-004: Invalid Credentials
POST http://localhost:3000/api/auth/farmer/login
Content-Type: application/json

{
  "email": "test.farmer@example.com",
  "password": "WrongPassword"
}

Expected: 401 Unauthorized
```

#### DTAM Authentication (`/api/auth/dtam/*`)

```bash
# TC-AUTH-D-001: Login DTAM Staff
POST http://localhost:3000/api/auth/dtam/login
Content-Type: application/json

{
  "email": "admin@gacp.th",
  "password": "admin123"
}

Expected: 200 OK, JWT token + role info
```

```bash
# TC-AUTH-D-002: Access with Wrong Token
GET http://localhost:3000/api/applications
Authorization: Bearer {farmer_token}

Expected: 403 Forbidden (farmer token cannot access DTAM endpoints)
```

**Checklist:**
- [ ] Farmer registration works
- [ ] Farmer login works
- [ ] DTAM login works
- [ ] JWT tokens generated correctly
- [ ] Token expiration works
- [ ] Password hashing works (bcrypt)
- [ ] Invalid credentials rejected
- [ ] Token separation enforced (farmer vs DTAM)

---

### 2. Application Workflow

```bash
# TC-APP-001: Create Application
POST http://localhost:3000/api/applications
Authorization: Bearer {farmer_token}
Content-Type: application/json

{
  "farmId": "farm_001",
  "cropType": "cannabis",
  "farmSize": 5.5,
  "province": "เชียงใหม่"
}

Expected: 201 Created, application ID returned
```

```bash
# TC-APP-002: Get Application Status
GET http://localhost:3000/api/applications/{id}
Authorization: Bearer {farmer_token}

Expected: 200 OK, application details with status
```

```bash
# TC-APP-003: List All Applications (DTAM)
GET http://localhost:3000/api/applications
Authorization: Bearer {dtam_token}

Expected: 200 OK, list of all applications
```

```bash
# TC-APP-004: Update Application Status (Reviewer)
PUT http://localhost:3000/api/applications/{id}/review
Authorization: Bearer {reviewer_token}
Content-Type: application/json

{
  "status": "document_approved",
  "comments": "เอกสารครบถ้วน"
}

Expected: 200 OK, status updated
```

**Checklist:**
- [ ] Create application works
- [ ] Upload documents works
- [ ] Submit for review works
- [ ] Document review workflow works
- [ ] Inspection scheduling works
- [ ] Final approval works
- [ ] Status transitions correct
- [ ] Notifications sent at each stage

---

### 3. Payment Processing

```bash
# TC-PAY-001: Initiate First Payment (5,000 THB)
POST http://localhost:3000/api/payments/initiate
Authorization: Bearer {farmer_token}
Content-Type: application/json

{
  "applicationId": "app_001",
  "amount": 5000,
  "stage": "document_review"
}

Expected: 200 OK, PromptPay QR code returned
```

```bash
# TC-PAY-002: Check Payment Status
GET http://localhost:3000/api/payments/{paymentId}/status
Authorization: Bearer {farmer_token}

Expected: 200 OK, payment status (pending/completed/failed)
```

```bash
# TC-PAY-003: Initiate Second Payment (25,000 THB)
POST http://localhost:3000/api/payments/initiate
Authorization: Bearer {farmer_token}
Content-Type: application/json

{
  "applicationId": "app_001",
  "amount": 25000,
  "stage": "field_inspection"
}

Expected: 200 OK, PromptPay QR code returned
```

**Checklist:**
- [ ] Payment initiation works
- [ ] PromptPay QR generation works
- [ ] Payment webhook receives updates
- [ ] Payment status updates correctly
- [ ] Application proceeds after payment
- [ ] Payment history accessible

---

### 4. Certificate Management

```bash
# TC-CERT-001: Generate Certificate (Auto after approval)
# Triggered automatically by system

Expected: Certificate PDF generated, stored in database
```

```bash
# TC-CERT-002: Get Farmer Certificates
GET http://localhost:3000/api/certificates/my-certificates
Authorization: Bearer {farmer_token}

Expected: 200 OK, list of farmer's certificates
```

```bash
# TC-CERT-003: Download Certificate PDF
GET http://localhost:3000/api/certificates/{id}/download
Authorization: Bearer {farmer_token}

Expected: 200 OK, PDF file download
```

```bash
# TC-CERT-004: Public Certificate Verification
GET http://localhost:3000/api/public/verify/GACP-2025-0001

Expected: 200 OK, certificate details (no auth required)
```

**Checklist:**
- [ ] Certificate auto-generation works
- [ ] PDF generation works
- [ ] QR code embedded in certificate
- [ ] Certificate download works
- [ ] Public verification works
- [ ] Certificate expiry tracking works

---

### 5. Document Management

```bash
# TC-DOC-001: Upload Document
POST http://localhost:3000/api/documents/upload
Authorization: Bearer {farmer_token}
Content-Type: multipart/form-data

file: [PDF/Image file]
applicationId: app_001
documentType: farm_registration

Expected: 200 OK, document ID returned
```

```bash
# TC-DOC-002: List Documents
GET http://localhost:3000/api/documents?applicationId=app_001
Authorization: Bearer {farmer_token}

Expected: 200 OK, list of documents
```

```bash
# TC-DOC-003: Download Document
GET http://localhost:3000/api/documents/{id}/download
Authorization: Bearer {farmer_token}

Expected: 200 OK, file download
```

**Checklist:**
- [ ] File upload works (PDF, images)
- [ ] File validation works (magic byte check)
- [ ] File size limits enforced
- [ ] Document categorization works
- [ ] Version control works
- [ ] Download works

---

### 6. Farm Management

```bash
# TC-FARM-001: Create Farm
POST http://localhost:3000/api/farms
Authorization: Bearer {farmer_token}
Content-Type: application/json

{
  "farmName": "ฟาร์มทดสอบ",
  "location": {
    "province": "เชียงใหม่",
    "district": "เมือง",
    "coordinates": {
      "lat": 18.7883,
      "lng": 98.9853
    }
  },
  "farmSize": 5.5,
  "cropTypes": ["cannabis"]
}

Expected: 201 Created, farm ID returned
```

```bash
# TC-FARM-002: Get Farm Details
GET http://localhost:3000/api/farms/{id}
Authorization: Bearer {farmer_token}

Expected: 200 OK, farm details
```

**Checklist:**
- [ ] Create farm works
- [ ] Update farm works
- [ ] Add plots/fields works
- [ ] Track cultivation cycles works
- [ ] IoT sensor integration works

---

### 7. Notification System

```bash
# TC-NOTIF-001: Get Notifications
GET http://localhost:3000/api/notifications
Authorization: Bearer {farmer_token}

Expected: 200 OK, list of notifications
```

```bash
# TC-NOTIF-002: Mark as Read
PUT http://localhost:3000/api/notifications/{id}/read
Authorization: Bearer {farmer_token}

Expected: 200 OK, notification marked as read
```

**Checklist:**
- [ ] Email notifications sent
- [ ] SMS notifications sent (if configured)
- [ ] LINE Notify works (if configured)
- [ ] Socket.IO real-time updates work
- [ ] Notification history accessible

---

### 8. Dashboard & Analytics

```bash
# TC-DASH-001: Get Farmer Dashboard
GET http://localhost:3000/api/dashboard/farmer
Authorization: Bearer {farmer_token}

Expected: 200 OK, dashboard statistics
```

```bash
# TC-DASH-002: Get Admin Dashboard
GET http://localhost:3000/api/dashboard/admin
Authorization: Bearer {admin_token}

Expected: 200 OK, system-wide statistics
```

**Checklist:**
- [ ] Farmer dashboard loads
- [ ] Admin dashboard loads
- [ ] Statistics accurate
- [ ] Charts render correctly
- [ ] Real-time updates work

---

## 🖥️ Frontend Portal Testing

### Farmer Portal (Port 3001)

#### Page-by-Page Testing

**1. Landing Page (`/`)**
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] Call-to-action buttons work
- [ ] Navigation menu works
- [ ] Responsive on mobile/tablet
- [ ] Images load correctly
- [ ] Links work

**2. Login Page (`/login`)**
- [ ] Login form displays
- [ ] Email validation works
- [ ] Password field masked
- [ ] "Show password" toggle works
- [ ] Login with valid credentials works
- [ ] Error message for invalid credentials
- [ ] "Forgot password" link works
- [ ] Redirect to dashboard after login

**3. Registration Page (`/register`)**
- [ ] Registration form displays
- [ ] All required fields validated
- [ ] Email format validation
- [ ] Password strength indicator
- [ ] Phone number format validation
- [ ] National ID validation
- [ ] Terms & conditions checkbox
- [ ] Registration success message
- [ ] Auto-login after registration

**4. Dashboard (`/dashboard`)**
- [ ] Dashboard loads after login
- [ ] Statistics cards display
- [ ] Recent applications shown
- [ ] Quick actions work
- [ ] Notifications panel works
- [ ] Charts render correctly
- [ ] Real-time updates work

**5. New Application (`/application/new`)**
- [ ] Form loads correctly
- [ ] Farm selection dropdown works
- [ ] Crop type selection (cannabis first)
- [ ] File upload works
- [ ] Form validation works
- [ ] Submit button works
- [ ] Success message shown
- [ ] Redirect to application detail

**6. Applications List (`/applications`)**
- [ ] List loads correctly
- [ ] Pagination works
- [ ] Search/filter works
- [ ] Status badges display correctly
- [ ] Click to view detail works
- [ ] Empty state shows when no data

**7. Application Detail (`/applications/[id]`)**
- [ ] Application details load
- [ ] Status timeline displays
- [ ] Documents list shows
- [ ] Download documents works
- [ ] Payment status shows
- [ ] Action buttons work based on status

**8. Payment Page (`/payment`)**
- [ ] Payment amount displays
- [ ] PromptPay QR code shows
- [ ] Payment instructions clear
- [ ] Status updates in real-time
- [ ] Confirmation after payment

**9. Certificates (`/certificates`)**
- [ ] Certificates list loads
- [ ] Certificate cards display
- [ ] Download PDF works
- [ ] View QR code works
- [ ] Certificate details accurate

**10. Farm Management (`/farms`)**
- [ ] Farms list loads
- [ ] Add new farm works
- [ ] Edit farm works
- [ ] View farm details works
- [ ] Map integration works (if any)

**11. Profile (`/profile`)**
- [ ] Profile data loads
- [ ] Edit profile works
- [ ] Change password works
- [ ] Upload profile picture works
- [ ] Save changes works

**12. Notifications (`/notifications`)**
- [ ] Notifications list loads
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Real-time updates work

**UX/UI Checklist - Farmer Portal:**
- [ ] Consistent color scheme (cannabis green theme)
- [ ] Thai language correct throughout
- [ ] Icons intuitive and clear
- [ ] Loading states show during API calls
- [ ] Error messages helpful and clear
- [ ] Success messages encouraging
- [ ] Forms easy to fill
- [ ] Navigation intuitive
- [ ] Mobile responsive (320px - 1920px)
- [ ] Touch targets adequate (min 44x44px)
- [ ] Contrast ratios meet WCAG AA
- [ ] Font sizes readable (min 16px body)

---

### Admin Portal (Port 3002)

#### Page-by-Page Testing

**1. Login Page (`/login`)**
- [ ] Admin login form displays
- [ ] Email validation works
- [ ] Login with admin credentials works
- [ ] Role-based redirect works
- [ ] Demo accounts info shown

**2. Home Dashboard (`/`)**
- [ ] Dashboard cards display
- [ ] Navigation to sections works
- [ ] Logout button works

**3. Dashboard (`/dashboard`)**
- [ ] KPI cards display
- [ ] Activity summary shows
- [ ] Quick actions work
- [ ] Inspector KPI cards show
- [ ] Charts render correctly

**4. Applications (`/applications`)**
- [ ] Review queue loads
- [ ] Filter by status works
- [ ] Assign to inspector works
- [ ] View application detail works
- [ ] Update status works

**5. Users (`/users`)**
- [ ] Users table loads
- [ ] Add user button works
- [ ] Edit user works
- [ ] Role management works
- [ ] Delete user works (with confirmation)

**6. Reports (`/reports`)**
- [ ] Report generator loads
- [ ] Date range selection works
- [ ] Report type selection works
- [ ] Generate report works
- [ ] Export to CSV/Excel/PDF works

**7. Settings (`/settings`)**
- [ ] System settings form loads
- [ ] Notification settings work
- [ ] Security settings work
- [ ] Backup/restore options work
- [ ] Save changes works

**8. Inspections (`/inspections`)**
- [ ] Calendar view loads
- [ ] Schedule inspection works
- [ ] Upcoming inspections show
- [ ] Tab navigation works

**9. Certificates (`/certificates`)**
- [ ] Certificates list loads
- [ ] Search works
- [ ] Export works
- [ ] Certificate cards display

**10. Analytics (`/analytics`)**
- [ ] Analytics charts load
- [ ] Data accurate
- [ ] Interactive charts work

**11. Notifications (`/notifications`)**
- [ ] Notifications list loads
- [ ] Mark as read works

**12. Audit Logs (`/audit-logs`)**
- [ ] Logs table loads
- [ ] Search works
- [ ] Export works
- [ ] Pagination works

**UX/UI Checklist - Admin Portal:**
- [ ] Professional government theme
- [ ] Clear role indicators
- [ ] Data tables easy to read
- [ ] Filters intuitive
- [ ] Bulk actions available
- [ ] Confirmation dialogs for destructive actions
- [ ] Loading states for all async operations
- [ ] Error handling graceful
- [ ] Responsive design
- [ ] Keyboard navigation works

---

### Certificate Portal (Port 3003)

#### Page-by-Page Testing

**1. Landing Page (`/`)**
- [ ] Hero section displays
- [ ] Features cards show
- [ ] Process steps clear
- [ ] Statistics display
- [ ] Call-to-action buttons work

**2. Login (`/login`)**
- [ ] Login form displays
- [ ] Certificate officer login works

**3. Dashboard (`/dashboard`)**
- [ ] Statistics cards display
- [ ] Certificate counts accurate

**4. Certificates (`/certificates`)**
- [ ] Certificates grid loads
- [ ] Certificate cards display
- [ ] View button works
- [ ] Download PDF works
- [ ] QR code button works

**5. Search (`/search`)**
- [ ] Search form displays
- [ ] Search by certificate number works
- [ ] Results display correctly
- [ ] Error message for not found

**6. Verify (`/verify`)**
- [ ] Public verification form shows
- [ ] Enter certificate number works
- [ ] QR code scan works (if implemented)

**7. Verify Detail (`/verify/[certificateNumber]`)**
- [ ] Certificate details display
- [ ] Validity status shows
- [ ] QR code displays
- [ ] Farm information shows

**UX/UI Checklist - Certificate Portal:**
- [ ] Public-facing design professional
- [ ] Trust indicators visible
- [ ] Verification process clear
- [ ] QR codes scannable
- [ ] Mobile-friendly
- [ ] Fast loading
- [ ] Accessible to all users

---

## 🎨 UX/UI Design Testing

### Visual Design

**Color Scheme:**
- [ ] Primary colors consistent across portals
- [ ] Cannabis green (#4CAF50) used appropriately
- [ ] Contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Color blind friendly
- [ ] Dark mode support (if implemented)

**Typography:**
- [ ] Thai fonts render correctly (Sarabun, Prompt, Kanit)
- [ ] Font sizes appropriate (16px minimum for body)
- [ ] Line height comfortable (1.5-1.6)
- [ ] Heading hierarchy clear (h1-h6)
- [ ] Text alignment consistent

**Spacing & Layout:**
- [ ] Consistent padding/margins (8px grid system)
- [ ] White space used effectively
- [ ] Content not cramped
- [ ] Sections clearly separated
- [ ] Grid system consistent

**Icons & Images:**
- [ ] Icons consistent style (Material Icons)
- [ ] Icons meaningful and clear
- [ ] Images optimized (WebP format)
- [ ] Alt text for all images
- [ ] Loading placeholders for images

### Interaction Design

**Buttons:**
- [ ] Primary/secondary button styles clear
- [ ] Hover states visible
- [ ] Active states visible
- [ ] Disabled states clear
- [ ] Loading states show spinner
- [ ] Button labels action-oriented

**Forms:**
- [ ] Labels clear and visible
- [ ] Required fields marked with *
- [ ] Placeholder text helpful
- [ ] Validation messages inline
- [ ] Error states highlighted in red
- [ ] Success states highlighted in green
- [ ] Auto-focus on first field
- [ ] Tab order logical

**Navigation:**
- [ ] Menu items clearly labeled
- [ ] Active page highlighted
- [ ] Breadcrumbs show current location
- [ ] Back button works correctly
- [ ] Mobile menu (hamburger) works
- [ ] Dropdown menus work smoothly

**Feedback:**
- [ ] Loading spinners show during waits
- [ ] Success messages encouraging
- [ ] Error messages helpful (not technical)
- [ ] Toast notifications non-intrusive
- [ ] Progress indicators for multi-step processes
- [ ] Confirmation dialogs for destructive actions

### Responsive Design

**Breakpoints:**
- [ ] Mobile (320px - 767px) works
- [ ] Tablet (768px - 1023px) works
- [ ] Desktop (1024px - 1439px) works
- [ ] Large desktop (1440px+) works

**Mobile Specific:**
- [ ] Touch targets min 44x44px
- [ ] No horizontal scrolling
- [ ] Text readable without zoom
- [ ] Forms easy to fill on mobile
- [ ] Navigation accessible
- [ ] Images scale appropriately

### Accessibility (WCAG 2.1 Level AA)

**Keyboard Navigation:**
- [ ] All interactive elements focusable
- [ ] Focus indicators visible
- [ ] Tab order logical
- [ ] Skip to main content link
- [ ] Escape key closes modals

**Screen Reader:**
- [ ] Alt text for images
- [ ] ARIA labels for icons
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Page titles descriptive

**Visual:**
- [ ] Text contrast 4.5:1 minimum
- [ ] Large text contrast 3:1 minimum
- [ ] Focus indicators 3:1 contrast
- [ ] No information by color alone
- [ ] Text resizable to 200%

---

## ⚡ Performance Testing

### Page Load Performance

**Metrics to Measure:**
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] Total Blocking Time (TBT) < 200ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

**Tools:**
- Lighthouse (Chrome DevTools)
- WebPageTest
- GTmetrix

### API Performance

```bash
# Test API response times
# Target: < 500ms for 95th percentile

# TC-PERF-001: Login endpoint
time curl -X POST http://localhost:3000/api/auth/farmer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

Expected: < 300ms
```

```bash
# TC-PERF-002: List applications
time curl -X GET http://localhost:3000/api/applications \
  -H "Authorization: Bearer {token}"

Expected: < 500ms
```

**Checklist:**
- [ ] All API endpoints < 500ms
- [ ] Database queries optimized
- [ ] Indexes created on frequently queried fields
- [ ] N+1 query problems resolved
- [ ] Caching implemented (Redis)
- [ ] Image optimization (WebP, lazy loading)
- [ ] Code splitting implemented
- [ ] Bundle size < 250KB (gzipped)

---

## 🔒 Security Testing

### Authentication Security

```bash
# TC-SEC-001: SQL Injection Attempt
POST http://localhost:3000/api/auth/farmer/login
Content-Type: application/json

{
  "email": "admin' OR '1'='1",
  "password": "anything"
}

Expected: 401 Unauthorized (not vulnerable)
```

```bash
# TC-SEC-002: XSS Attempt
POST http://localhost:3000/api/applications
Authorization: Bearer {token}
Content-Type: application/json

{
  "farmName": "<script>alert('XSS')</script>"
}

Expected: Input sanitized, script not executed
```

```bash
# TC-SEC-003: CSRF Protection
POST http://localhost:3000/api/applications
# Without CSRF token

Expected: 403 Forbidden
```

**Checklist:**
- [ ] SQL/NoSQL injection prevented
- [ ] XSS attacks prevented
- [ ] CSRF protection enabled
- [ ] Rate limiting works (5 login attempts/15min)
- [ ] JWT tokens expire correctly
- [ ] Passwords hashed with bcrypt
- [ ] HTTPS enforced in production
- [ ] Security headers set (Helmet.js)
- [ ] File upload validation (magic byte check)
- [ ] Sensitive data not logged

---

## 🌐 Cross-Browser Testing

**Browsers to Test:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Test on Each Browser:**
- [ ] Login works
- [ ] Forms submit correctly
- [ ] File uploads work
- [ ] Charts render correctly
- [ ] Responsive design works
- [ ] No console errors

---

## 📱 Mobile Testing

**Devices to Test:**
- [ ] iPhone 12/13/14 (iOS 15+)
- [ ] Samsung Galaxy S21/S22 (Android 11+)
- [ ] iPad (latest)
- [ ] Android Tablet

**Mobile-Specific Tests:**
- [ ] Touch gestures work
- [ ] Pinch to zoom works (where appropriate)
- [ ] Orientation change handled
- [ ] Mobile keyboard doesn't break layout
- [ ] File upload from camera works
- [ ] GPS location works (if used)

---

## 🧪 Test Execution Plan

### Phase 1: Backend API Testing (Week 1)
**Day 1-2:** Authentication & Authorization
**Day 3-4:** Application Workflow & Payments
**Day 5:** Certificate & Document Management

### Phase 2: Frontend Testing (Week 2)
**Day 1-2:** Farmer Portal (all 31 pages)
**Day 3:** Admin Portal (all 12 pages)
**Day 4:** Certificate Portal (all 7 pages)
**Day 5:** Cross-portal integration

### Phase 3: UX/UI Testing (Week 3)
**Day 1-2:** Visual design & consistency
**Day 3:** Interaction design & feedback
**Day 4:** Responsive design & mobile
**Day 5:** Accessibility testing

### Phase 4: Performance & Security (Week 4)
**Day 1-2:** Performance testing & optimization
**Day 3-4:** Security testing & fixes
**Day 5:** Cross-browser testing

### Phase 5: UAT & Final Validation (Week 5)
**Day 1-3:** User acceptance testing
**Day 4:** Bug fixes
**Day 5:** Final sign-off

---

## 📊 Test Reporting

### Daily Test Report Template

```markdown
# Daily Test Report - [Date]

## Tests Executed: X/Y
## Pass Rate: XX%
## Critical Issues: X
## High Priority Issues: X
## Medium Priority Issues: X
## Low Priority Issues: X

### Tests Passed
- [List of passed tests]

### Tests Failed
- [List of failed tests with details]

### Blockers
- [Any blockers preventing testing]

### Next Steps
- [Plan for next day]
```

### Bug Report Template

```markdown
# Bug Report - [BUG-XXX]

**Severity:** Critical / High / Medium / Low
**Priority:** P0 / P1 / P2 / P3
**Status:** Open / In Progress / Fixed / Closed

**Environment:**
- Browser: [Chrome 120]
- OS: [Windows 11]
- Portal: [Farmer Portal]
- Page: [/applications]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach screenshots]

**Console Errors:**
[Paste console errors]

**Additional Notes:**
[Any other relevant information]
```

---

## ✅ Success Criteria

### Must Have (Go/No-Go)
- [ ] All critical features work
- [ ] No P0/P1 bugs
- [ ] 95%+ test pass rate
- [ ] All security tests pass
- [ ] Performance targets met
- [ ] Accessibility WCAG AA compliant

### Nice to Have
- [ ] 98%+ test pass rate
- [ ] No P2 bugs
- [ ] All browsers tested
- [ ] Mobile apps tested
- [ ] Load testing completed

---

## 🚀 Test Environment Setup

### Prerequisites

```bash
# 1. Start Backend
cd apps/backend
npm run dev

# 2. Start Farmer Portal
cd apps/farmer-portal
npm run dev

# 3. Start Admin Portal
cd apps/admin-portal
npm run dev

# 4. Start Certificate Portal
cd apps/certificate-portal
npm run dev

# 5. Verify all services running
curl http://localhost:3000/health  # Backend
curl http://localhost:3001         # Farmer Portal
curl http://localhost:3002         # Admin Portal
curl http://localhost:3003         # Certificate Portal
```

### Test Data Setup

```bash
# Seed test data
cd apps/backend
node scripts/seed-realistic-data.js
```

### Test Accounts

**Farmers:**
- farmer001@test.com / Farmer123!
- farmer002@test.com / Farmer123!

**DTAM Staff:**
- admin@gacp.th / admin123
- reviewer@gacp.th / reviewer123
- inspector@gacp.th / inspector123
- approver@gacp.th / approver123

---

**Document Version:** 1.0.0  
**Created:** 2025-01-15  
**Status:** ✅ Ready for Testing
