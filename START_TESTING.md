# 🚀 Start Testing - Quick Guide

**Date:** 2025-01-15  
**Status:** Ready to Begin

---

## ⚡ Quick Start Testing

### Step 1: Start All Services

```bash
# Terminal 1: Backend API
cd apps/backend
npm run dev
# Expected: Server running on http://localhost:3000

# Terminal 2: Farmer Portal
cd apps/farmer-portal
npm run dev
# Expected: Server running on http://localhost:3001

# Terminal 3: Admin Portal
cd apps/admin-portal
npm run dev
# Expected: Server running on http://localhost:3002

# Terminal 4: Certificate Portal
cd apps/certificate-portal
npm run dev
# Expected: Server running on http://localhost:3003
```

---

## 🧪 Manual Testing Checklist

### Phase 1: Backend API (30 minutes)

#### 1.1 Health Check
```bash
# Open browser or use curl
curl http://localhost:3000/health
```
- [ ] Returns 200 OK
- [ ] Shows MongoDB status
- [ ] Shows Redis status

#### 1.2 Farmer Authentication
**Test in Browser or Postman:**

**Register:**
```
POST http://localhost:3000/api/auth/farmer/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "fullName": "Test User",
  "phoneNumber": "0812345678"
}
```
- [ ] Returns 201 Created
- [ ] Returns JWT token

**Login:**
```
POST http://localhost:3000/api/auth/farmer/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```
- [ ] Returns 200 OK
- [ ] Returns JWT token
- [ ] Returns user data

#### 1.3 DTAM Authentication
```
POST http://localhost:3000/api/auth/dtam/login
Content-Type: application/json

{
  "email": "admin@gacp.th",
  "password": "admin123"
}
```
- [ ] Returns 200 OK
- [ ] Returns JWT token
- [ ] Returns role info

---

### Phase 2: Farmer Portal (1 hour)

#### 2.1 Landing Page
1. Open http://localhost:3001
- [ ] Page loads without errors
- [ ] Hero section displays
- [ ] Navigation works
- [ ] Buttons clickable

#### 2.2 Login
1. Click "Login" button
2. Enter: farmer001@test.com / Farmer123!
3. Click "Submit"
- [ ] Login successful
- [ ] Redirects to dashboard
- [ ] No console errors

#### 2.3 Dashboard
- [ ] Statistics cards display
- [ ] Charts render
- [ ] Recent applications show
- [ ] Navigation menu works

#### 2.4 New Application
1. Click "New Application"
2. Fill form
3. Upload documents
4. Submit
- [ ] Form validation works
- [ ] File upload works
- [ ] Submission successful
- [ ] Confirmation shown

#### 2.5 Applications List
- [ ] List loads
- [ ] Pagination works
- [ ] Search works
- [ ] Click to view detail works

---

### Phase 3: Admin Portal (45 minutes)

#### 3.1 Login
1. Open http://localhost:3002/login
2. Enter: admin@gacp.th / admin123
3. Click "Login"
- [ ] Login successful
- [ ] Redirects to home

#### 3.2 Dashboard
1. Click "Dashboard"
- [ ] KPI cards display
- [ ] Charts render
- [ ] Data accurate

#### 3.3 Applications
1. Click "Applications"
- [ ] Review queue loads
- [ ] Can filter by status
- [ ] Can view details

#### 3.4 Users
1. Click "Users"
- [ ] Users table loads
- [ ] Can add user
- [ ] Can edit user

---

### Phase 4: Certificate Portal (30 minutes)

#### 4.1 Landing Page
1. Open http://localhost:3003
- [ ] Page loads
- [ ] Features display
- [ ] Call-to-action works

#### 4.2 Public Verification
1. Click "Verify Certificate"
2. Enter: GACP-2025-0001
3. Click "Search"
- [ ] Certificate found (if exists)
- [ ] Details display
- [ ] QR code shows

---

### Phase 5: UX/UI Testing (30 minutes)

#### 5.1 Visual Design
- [ ] Colors consistent
- [ ] Fonts readable
- [ ] Spacing appropriate
- [ ] Icons clear

#### 5.2 Responsive Design
**Test on different screen sizes:**
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1440px)

**Check:**
- [ ] No horizontal scroll
- [ ] Text readable
- [ ] Buttons accessible
- [ ] Images scale properly

#### 5.3 Interaction
- [ ] Buttons have hover states
- [ ] Forms validate input
- [ ] Error messages clear
- [ ] Success messages show
- [ ] Loading states display

#### 5.4 Navigation
- [ ] Menu items work
- [ ] Breadcrumbs accurate
- [ ] Back button works
- [ ] Links don't break

---

## 🐛 Bug Reporting

**If you find a bug, document it:**

```markdown
**Bug ID:** BUG-001
**Severity:** Critical/High/Medium/Low
**Page:** [Page name]
**Steps:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** [What should happen]
**Actual:** [What happened]
**Screenshot:** [Attach if possible]
```

---

## ✅ Quick Pass/Fail Criteria

### Must Pass (Critical)
- [ ] All authentication works
- [ ] Can create application
- [ ] Can upload documents
- [ ] Can view certificates
- [ ] No console errors
- [ ] No broken pages

### Should Pass (Important)
- [ ] All forms validate
- [ ] All buttons work
- [ ] All links work
- [ ] Responsive on mobile
- [ ] Loading states show
- [ ] Error messages helpful

### Nice to Pass (Enhancement)
- [ ] Animations smooth
- [ ] Images optimized
- [ ] Performance good
- [ ] Accessibility compliant

---

## 📊 Quick Test Report

**After testing, fill this out:**

```
Date: [Date]
Tester: [Your name]

Tests Executed: __/100
Tests Passed: __
Tests Failed: __
Pass Rate: __%

Critical Issues: __
High Issues: __
Medium Issues: __
Low Issues: __

Overall Status: ✅ Pass / ❌ Fail / ⚠️ Conditional Pass

Notes:
[Your notes here]
```

---

## 🚀 Ready to Start?

1. ✅ Read this guide
2. ⏳ Start all services
3. ⏳ Begin testing from Phase 1
4. ⏳ Document all findings
5. ⏳ Report bugs
6. ⏳ Complete test report

**Estimated Time:** 3-4 hours for basic testing

**Good luck! 🎯**
