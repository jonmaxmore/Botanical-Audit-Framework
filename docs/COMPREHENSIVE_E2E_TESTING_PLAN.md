# COMPREHENSIVE END-TO-END TESTING PLAN
## GACP Botanical Audit Framework - 100% Frontend Coverage

**Test Plan Version:** 1.0  
**Date:** October 22, 2025  
**Mandate:** 100% E2E Testing Sweep - Zero Bugs to QA  
**Status:** ⏳ Ready for Execution

---

## 📋 EXECUTIVE DIRECTIVE

### **Testing Mandate**

> "We are mandating a complete 100% end-to-end testing sweep of all front-end systems. Your test plan must be designed to cover: Every Single Page/URL, Every Interactive Element, All User Workflows, Full Regression, Full Cross-Browser/Device. We are aiming for zero user-facing bugs."

### **Developer Responsibility**

> "No code is to be handed over to QA until it has been rigorously self-tested. Finding simple, obvious bugs that should have been caught during development is an inefficient use of QA's time."

### **Test Coverage Requirements**

✅ **Every Single Page/URL** - All routes navigated and validated  
✅ **Every Interactive Element** - All buttons, links, forms, dropdowns, modals  
✅ **All User Workflows** - Complete end-to-end journeys  
✅ **Full Regression** - Existing functionality validated  
✅ **Cross-Browser/Device** - Chrome, Firefox, Safari + Desktop, Mobile, Tablet  

---

## 🗺️ COMPLETE URL INVENTORY

### **Public Routes (Unauthenticated)**

| # | URL | Page Name | Purpose | Status |
|---|-----|-----------|---------|--------|
| 1 | `/` | Landing/Home | Entry point | ⏳ |
| 2 | `/login` | Login Page | User authentication | ⏳ |
| 3 | `/register` | Registration | New user signup | ⏳ |
| 4 | `/forgot-password` | Password Recovery | Reset password request | ⏳ |
| 5 | `/reset-password/:token` | Password Reset | Set new password | ⏳ |
| 6 | `/verify-email/:token` | Email Verification | Confirm email address | ⏳ |

### **Farmer Routes (Role: FARMER)**

| # | URL | Page Name | Purpose | Status |
|---|-----|-----------|---------|--------|
| 7 | `/farmer/dashboard` | Farmer Dashboard | Main farmer home | ⏳ |
| 8 | `/farmer/applications` | Applications List | View all applications | ⏳ |
| 9 | `/farmer/applications/new` | New Application | Create application | ⏳ |
| 10 | `/farmer/applications/:id` | Application Detail | View single application | ⏳ |
| 11 | `/farmer/applications/:id/edit` | Edit Application | Modify application | ⏳ |
| 12 | `/farmer/profile` | Farmer Profile | View/edit profile | ⏳ |
| 13 | `/farmer/documents` | Documents | Upload documents | ⏳ |
| 14 | `/farmer/payments` | Payments | Payment history | ⏳ |
| 15 | `/farmer/certificates` | Certificates | View issued certificates | ⏳ |

### **DTAM Officer Routes (Role: DTAM_OFFICER)**

| # | URL | Page Name | Purpose | Status |
|---|-----|-----------|---------|--------|
| 16 | `/officer/dashboard` | Officer Dashboard | Main officer home | ⏳ |
| 17 | `/officer/applications` | Applications Queue | Review applications | ⏳ |
| 18 | `/officer/applications/:id` | Application Review | Review single application | ⏳ |
| 19 | `/officer/documents/:id` | Document Review | Review documents | ⏳ |
| 20 | `/officer/approvals` | Approvals | Pending approvals | ⏳ |
| 21 | `/officer/profile` | Officer Profile | View/edit profile | ⏳ |

### **Inspector Routes (Role: INSPECTOR)**

| # | URL | Page Name | Purpose | Status |
|---|-----|-----------|---------|--------|
| 22 | `/inspector/dashboard` | Inspector Dashboard | Main inspector home | ⏳ |
| 23 | `/inspector/inspections` | Inspections List | View all inspections | ⏳ |
| 24 | `/inspector/inspections/:id` | Inspection Detail | View single inspection | ⏳ |
| 25 | `/inspector/schedule` | Schedule | Inspection calendar | ⏳ |
| 26 | `/inspector/reports` | Reports | Submit reports | ⏳ |
| 27 | `/inspector/profile` | Inspector Profile | View/edit profile | ⏳ |

### **Admin Routes (Role: ADMIN)**

| # | URL | Page Name | Purpose | Status |
|---|-----|-----------|---------|--------|
| 28 | `/admin/dashboard` | Admin Dashboard | Main admin home | ⏳ |
| 29 | `/admin/users` | User Management | Manage all users | ⏳ |
| 30 | `/admin/users/:id` | User Detail | View single user | ⏳ |
| 31 | `/admin/applications` | Applications Admin | Manage applications | ⏳ |
| 32 | `/admin/reports` | System Reports | Analytics & reports | ⏳ |
| 33 | `/admin/settings` | System Settings | Configure system | ⏳ |

### **Shared Routes (All Authenticated Users)**

| # | URL | Page Name | Purpose | Status |
|---|-----|-----------|---------|--------|
| 34 | `/profile` | User Profile | Edit user profile | ⏳ |
| 35 | `/settings` | User Settings | User preferences | ⏳ |
| 36 | `/notifications` | Notifications | View notifications | ⏳ |
| 37 | `/help` | Help & Support | Documentation | ⏳ |

### **Error/Special Routes**

| # | URL | Page Name | Purpose | Status |
|---|-----|-----------|---------|--------|
| 38 | `/404` | Not Found | 404 error page | ⏳ |
| 39 | `/403` | Forbidden | Access denied | ⏳ |
| 40 | `/500` | Server Error | Server error page | ⏳ |
| 41 | `/maintenance` | Maintenance | Maintenance mode | ⏳ |

**Total URLs to Test: 41**

---

## 🧪 COMPREHENSIVE TEST SCENARIOS

### **SECTION 1: AUTHENTICATION & AUTHORIZATION**

#### **Test Case 1.1: User Registration (FARMER)**

**Test ID:** AUTH-REG-001  
**Priority:** CRITICAL  
**Complexity:** High

**Preconditions:**
- [ ] Backend server running on port 3004
- [ ] Frontend server running on port 3000
- [ ] MongoDB connected
- [ ] Test database clean state

**Test Steps:**

1. **Navigate to Registration Page**
   - [ ] Open browser (Chrome)
   - [ ] Navigate to `http://localhost:3000/register`
   - [ ] **VERIFY:** Page loads successfully
   - [ ] **VERIFY:** Registration form is visible
   - [ ] **VERIFY:** All fields are present (email, password, name, role, phone)

2. **Test Form Validation - Empty Submission**
   - [ ] Click "Register" button without filling fields
   - [ ] **VERIFY:** Error messages appear for required fields
   - [ ] **VERIFY:** Form does not submit
   - [ ] **VERIFY:** Error messages in Thai language

3. **Test Form Validation - Invalid Email**
   - [ ] Enter invalid email: `invalid-email`
   - [ ] Fill other fields with valid data
   - [ ] Click "Register"
   - [ ] **VERIFY:** Email validation error appears
   - [ ] **VERIFY:** Error message in Thai

4. **Test Form Validation - Weak Password**
   - [ ] Enter valid email: `testfarmer@test.com`
   - [ ] Enter weak password: `123`
   - [ ] Fill other fields
   - [ ] Click "Register"
   - [ ] **VERIFY:** Password strength error appears
   - [ ] **VERIFY:** Minimum requirements shown

5. **Test Form Validation - Phone Number**
   - [ ] Enter invalid phone: `abc123`
   - [ ] **VERIFY:** Phone validation error
   - [ ] Enter valid phone: `0812345678`
   - [ ] **VERIFY:** Validation passes

6. **Test Successful Registration - FARMER Role**
   - [ ] Fill form with valid data:
     - Email: `farmer1@test.com`
     - Password: `SecurePass123!`
     - Name: `สมชาย ทดสอบ`
     - Role: `FARMER`
     - Phone: `0812345678`
   - [ ] Click "Register"
   - [ ] **VERIFY:** Loading state appears
   - [ ] **VERIFY:** Success message displays
   - [ ] **VERIFY:** Auto-login occurs
   - [ ] **VERIFY:** Redirected to `/farmer/dashboard`
   - [ ] **VERIFY:** Dashboard loads correctly
   - [ ] **VERIFY:** User name displayed in header

7. **Test Duplicate Email Prevention**
   - [ ] Logout
   - [ ] Navigate to `/register`
   - [ ] Try to register with same email: `farmer1@test.com`
   - [ ] **VERIFY:** Error message: "อีเมลนี้ถูกใช้งานแล้ว"
   - [ ] **VERIFY:** Registration blocked

8. **Test Network Retry Logic** (Week 3-4 Implementation)
   - [ ] Open DevTools Console (F12)
   - [ ] Enable Network throttling: "Slow 3G"
   - [ ] Fill registration form with new email: `farmer2@test.com`
   - [ ] Click "Register"
   - [ ] **VERIFY:** Console shows retry attempts:
     ```
     🔄 Register retry 1/3: Network request failed
     🔄 Register retry 2/3: Network request failed
     ✅ Registration successful
     ```
   - [ ] **VERIFY:** Registration succeeds after retries
   - [ ] **VERIFY:** Auto-login works
   - [ ] Disable throttling

**Expected Result:** ✅ All validations work, registration succeeds, retry logic active

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile - iPhone)
- [ ] Chrome (Mobile - Android)
- [ ] Safari (Mobile - iPad)

**Status:** ⏳ Not Started

---

#### **Test Case 1.2: User Login**

**Test ID:** AUTH-LOGIN-001  
**Priority:** CRITICAL  
**Complexity:** High

**Test Steps:**

1. **Navigate to Login Page**
   - [ ] Navigate to `http://localhost:3000/login`
   - [ ] **VERIFY:** Login form visible
   - [ ] **VERIFY:** Email and password fields present
   - [ ] **VERIFY:** "Remember me" checkbox visible
   - [ ] **VERIFY:** "Forgot password?" link present

2. **Test Form Validation - Empty Fields**
   - [ ] Click "Login" without entering credentials
   - [ ] **VERIFY:** Error messages for both fields
   - [ ] **VERIFY:** Thai language errors

3. **Test Invalid Credentials**
   - [ ] Enter email: `wrong@test.com`
   - [ ] Enter password: `WrongPass123`
   - [ ] Click "Login"
   - [ ] **VERIFY:** Error message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
   - [ ] **VERIFY:** Form remains on page
   - [ ] **VERIFY:** Password field cleared for security

4. **Test Successful Login - FARMER**
   - [ ] Enter valid credentials:
     - Email: `farmer1@test.com`
     - Password: `SecurePass123!`
   - [ ] Click "Login"
   - [ ] **VERIFY:** Loading spinner appears
   - [ ] **VERIFY:** Success message (if any)
   - [ ] **VERIFY:** Redirected to `/farmer/dashboard`
   - [ ] **VERIFY:** Token stored in localStorage
   - [ ] **VERIFY:** User object stored in localStorage

5. **Test Remember Me Functionality**
   - [ ] Logout
   - [ ] Login with "Remember me" checked
   - [ ] Close browser completely
   - [ ] Reopen browser
   - [ ] Navigate to `http://localhost:3000`
   - [ ] **VERIFY:** Still logged in (no redirect to login)
   - [ ] **VERIFY:** Session persists

6. **Test Network Retry Logic** (Week 3-4 Implementation)
   - [ ] Logout
   - [ ] Open DevTools Console
   - [ ] Enable "Slow 3G" throttling
   - [ ] Attempt login with valid credentials
   - [ ] **VERIFY:** Console shows retry attempts:
     ```
     🔄 Login retry 1/3: ...
     🔄 Login retry 2/3: ...
     ✅ Login successful
     ```
   - [ ] **VERIFY:** Login succeeds after retries
   - [ ] Disable throttling

7. **Test Request Timeout** (Week 1-2 Implementation)
   - [ ] Logout
   - [ ] Enable extreme throttling or pause network
   - [ ] Attempt login
   - [ ] **VERIFY:** Timeout error after 10 seconds
   - [ ] **VERIFY:** Thai error message: "การเชื่อมต่อหมดเวลา..."
   - [ ] Re-enable network

8. **Test Role-Based Redirects**
   
   **a) DTAM Officer Login:**
   - [ ] Logout
   - [ ] Login as: `officer@test.com` / `password`
   - [ ] **VERIFY:** Redirected to `/officer/dashboard`
   
   **b) Inspector Login:**
   - [ ] Logout
   - [ ] Login as: `inspector@test.com` / `password`
   - [ ] **VERIFY:** Redirected to `/inspector/dashboard`
   
   **c) Admin Login:**
   - [ ] Logout
   - [ ] Login as: `admin@test.com` / `password`
   - [ ] **VERIFY:** Redirected to `/admin/dashboard`

**Expected Result:** ✅ All login scenarios work, retry logic active, role redirects correct

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile)

**Status:** ⏳ Not Started

---

#### **Test Case 1.3: Password Recovery**

**Test ID:** AUTH-PWD-001  
**Priority:** HIGH  
**Complexity:** Medium

**Test Steps:**

1. **Navigate to Forgot Password**
   - [ ] Go to `/login`
   - [ ] Click "Forgot password?" link
   - [ ] **VERIFY:** Redirected to `/forgot-password`
   - [ ] **VERIFY:** Email input field visible
   - [ ] **VERIFY:** Submit button present

2. **Test Invalid Email**
   - [ ] Enter invalid email: `notanemail`
   - [ ] Click "Submit"
   - [ ] **VERIFY:** Email validation error

3. **Test Non-Existent Email**
   - [ ] Enter valid but non-existent email: `nonexistent@test.com`
   - [ ] Click "Submit"
   - [ ] **VERIFY:** Success message (for security - don't reveal if email exists)
   - [ ] **VERIFY:** No actual email sent

4. **Test Valid Email**
   - [ ] Enter existing email: `farmer1@test.com`
   - [ ] Click "Submit"
   - [ ] **VERIFY:** Success message
   - [ ] **VERIFY:** Check backend logs for reset token generation
   - [ ] **VERIFY:** (If email service enabled) Email sent

5. **Test Password Reset Link**
   - [ ] Copy reset token from backend logs
   - [ ] Navigate to `/reset-password/:token`
   - [ ] **VERIFY:** Reset password form visible
   - [ ] **VERIFY:** New password field present
   - [ ] **VERIFY:** Confirm password field present

6. **Test Password Reset Validation**
   - [ ] Enter mismatched passwords
   - [ ] **VERIFY:** "Passwords don't match" error
   - [ ] Enter matching weak password
   - [ ] **VERIFY:** Password strength error
   - [ ] Enter strong matching password
   - [ ] Click "Reset Password"
   - [ ] **VERIFY:** Success message
   - [ ] **VERIFY:** Redirected to `/login`

7. **Test Login with New Password**
   - [ ] Login with email and new password
   - [ ] **VERIFY:** Login successful

**Expected Result:** ✅ Password reset flow complete, validation works

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)

**Status:** ⏳ Not Started

---

### **SECTION 2: FARMER WORKFLOWS**

#### **Test Case 2.1: Farmer Dashboard**

**Test ID:** FARMER-DASH-001  
**Priority:** CRITICAL  
**Complexity:** Medium

**Preconditions:**
- [ ] Logged in as FARMER

**Test Steps:**

1. **Dashboard Navigation**
   - [ ] Navigate to `/farmer/dashboard`
   - [ ] **VERIFY:** Page loads successfully
   - [ ] **VERIFY:** User name displayed
   - [ ] **VERIFY:** Role badge shows "FARMER"

2. **Dashboard Widgets**
   - [ ] **VERIFY:** Application summary card visible
   - [ ] **VERIFY:** Application count displayed
   - [ ] **VERIFY:** Recent applications list visible
   - [ ] **VERIFY:** Quick action buttons visible:
     - [ ] "Create New Application" button
     - [ ] "View All Applications" button
   
3. **Dashboard Statistics**
   - [ ] **VERIFY:** Total applications count
   - [ ] **VERIFY:** Pending applications count
   - [ ] **VERIFY:** Approved applications count
   - [ ] **VERIFY:** Rejected applications count

4. **Interactive Elements**
   - [ ] Click "Create New Application" button
   - [ ] **VERIFY:** Redirected to `/farmer/applications/new`
   - [ ] Go back to dashboard
   - [ ] Click "View All Applications" button
   - [ ] **VERIFY:** Redirected to `/farmer/applications`
   - [ ] Go back to dashboard

5. **Recent Activity**
   - [ ] **VERIFY:** Recent applications list shows data
   - [ ] Click on a recent application
   - [ ] **VERIFY:** Navigates to application detail page

**Expected Result:** ✅ Dashboard loads, all widgets work, navigation functions

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile)

**Status:** ⏳ Not Started

---

#### **Test Case 2.2: Create New Application**

**Test ID:** FARMER-APP-001  
**Priority:** CRITICAL  
**Complexity:** Very High

**Preconditions:**
- [ ] Logged in as FARMER
- [ ] On farmer dashboard

**Test Steps:**

1. **Navigate to New Application Form**
   - [ ] Click "Create New Application" from dashboard
   - [ ] **VERIFY:** Redirected to `/farmer/applications/new`
   - [ ] **VERIFY:** Application form visible
   - [ ] **VERIFY:** All form sections present:
     - [ ] Farm Information
     - [ ] Location Details
     - [ ] Crop Information
     - [ ] Cultivation Practices

2. **Test Form Validation - Empty Submission**
   - [ ] Click "Submit Application" without filling
   - [ ] **VERIFY:** Validation errors appear
   - [ ] **VERIFY:** Required field indicators shown
   - [ ] **VERIFY:** Error summary at top of form

3. **Fill Farm Information**
   - [ ] Enter farm name: `ไร่สมุนไพรทดสอบ`
   - [ ] Enter farm size: `10` rai
   - [ ] Select farm type: `Individual`
   - [ ] **VERIFY:** No validation errors for these fields

4. **Fill Location Details**
   - [ ] Enter address: `123 หมู่ 5 ต.ทดสอบ`
   - [ ] Select province: `เชียงใหม่`
   - [ ] Select district: `แม่ริม`
   - [ ] Select sub-district: `ริมใต้`
   - [ ] Enter coordinates (if available)
   - [ ] **VERIFY:** Province dropdown populated
   - [ ] **VERIFY:** District updates based on province
   - [ ] **VERIFY:** Sub-district updates based on district

5. **Fill Crop Information**
   - [ ] Select crop type: `กัญชา (Cannabis)`
   - [ ] Enter cultivation area: `5` rai
   - [ ] Enter expected yield: `100` kg
   - [ ] Select harvest season: `ฤดูฝน`
   - [ ] **VERIFY:** All fields accept input

6. **Fill Cultivation Practices**
   - [ ] Check organic practices checkbox
   - [ ] Select irrigation method: `Drip irrigation`
   - [ ] Enter pest management: `Organic pest control`
   - [ ] **VERIFY:** All options selectable

7. **Test Save as Draft**
   - [ ] Click "Save as Draft" button
   - [ ] **VERIFY:** Loading state appears
   - [ ] **VERIFY:** Success message displays
   - [ ] **VERIFY:** Application saved with status: "DRAFT"
   - [ ] **VERIFY:** Redirected to applications list
   - [ ] **VERIFY:** Draft appears in list

8. **Test Edit Draft**
   - [ ] Click on the draft application
   - [ ] **VERIFY:** Navigated to edit page
   - [ ] **VERIFY:** All previously entered data is populated
   - [ ] Modify farm size to: `12` rai
   - [ ] Click "Save as Draft"
   - [ ] **VERIFY:** Changes saved
   - [ ] **VERIFY:** Updated size reflects in list

9. **Test Submit Application**
   - [ ] Open the draft application
   - [ ] Click "Submit Application" button
   - [ ] **VERIFY:** Confirmation modal appears
   - [ ] **VERIFY:** Modal shows application summary
   - [ ] Click "Confirm Submit"
   - [ ] **VERIFY:** Loading state appears
   - [ ] **VERIFY:** Success message: "ส่งใบสมัครเรียบร้อยแล้ว"
   - [ ] **VERIFY:** Application status changed to "SUBMITTED"
   - [ ] **VERIFY:** Redirected to application detail page

10. **Test Network Retry on Create** (Week 3-4 Implementation)
    - [ ] Open DevTools Console
    - [ ] Enable "Slow 3G" throttling
    - [ ] Create new application
    - [ ] Fill all required fields
    - [ ] Click "Submit"
    - [ ] **VERIFY:** Console shows retry attempts:
      ```
      🔄 Create application retry 1/3: ...
      🔄 Create application retry 2/3: ...
      ✅ Application created successfully
      ```
    - [ ] **VERIFY:** Application created despite network issues
    - [ ] **VERIFY:** No duplicate applications created
    - [ ] Disable throttling

11. **Test Data Persistence**
    - [ ] Refresh browser
    - [ ] Navigate back to application detail
    - [ ] **VERIFY:** All data persists correctly
    - [ ] **VERIFY:** Status shows "SUBMITTED"

**Expected Result:** ✅ Application creation flow complete, retry logic prevents data loss

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile) - Responsive form
- [ ] Safari (iPad) - Tablet view

**Status:** ⏳ Not Started

---

#### **Test Case 2.3: View Applications List**

**Test ID:** FARMER-APP-002  
**Priority:** HIGH  
**Complexity:** Medium

**Test Steps:**

1. **Navigate to Applications List**
   - [ ] Go to `/farmer/applications`
   - [ ] **VERIFY:** Applications list page loads
   - [ ] **VERIFY:** Table/cards with applications visible

2. **Verify List Display**
   - [ ] **VERIFY:** Application number shown
   - [ ] **VERIFY:** Farm name shown
   - [ ] **VERIFY:** Status badge displayed
   - [ ] **VERIFY:** Submission date shown
   - [ ] **VERIFY:** Action buttons visible

3. **Test Filtering**
   - [ ] Filter by status: "DRAFT"
   - [ ] **VERIFY:** Only draft applications shown
   - [ ] Filter by status: "SUBMITTED"
   - [ ] **VERIFY:** Only submitted applications shown
   - [ ] Clear filter
   - [ ] **VERIFY:** All applications shown

4. **Test Sorting**
   - [ ] Sort by date (newest first)
   - [ ] **VERIFY:** Applications sorted correctly
   - [ ] Sort by date (oldest first)
   - [ ] **VERIFY:** Sort order reversed
   - [ ] Sort by status
   - [ ] **VERIFY:** Grouped by status

5. **Test Pagination** (if applicable)
   - [ ] If more than 10 applications:
   - [ ] **VERIFY:** Pagination controls visible
   - [ ] Click "Next" page
   - [ ] **VERIFY:** Next set of applications loaded
   - [ ] Click "Previous"
   - [ ] **VERIFY:** Previous set shown

6. **Test Search** (if available)
   - [ ] Enter farm name in search
   - [ ] **VERIFY:** Results filtered
   - [ ] Clear search
   - [ ] **VERIFY:** Full list returns

7. **Test Network Retry on Fetch** (Week 3-4 Implementation)
   - [ ] Open DevTools Console
   - [ ] Enable "Slow 3G" throttling
   - [ ] Refresh applications list
   - [ ] **VERIFY:** Console shows retry attempts:
     ```
     🔄 Fetch applications retry 1/2: ...
     ✅ Applications fetched successfully
     ```
   - [ ] **VERIFY:** List loads despite network issues
   - [ ] Disable throttling

**Expected Result:** ✅ List displays correctly, filtering/sorting works, retry logic active

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Chrome (Mobile)

**Status:** ⏳ Not Started

---

#### **Test Case 2.4: View Application Detail**

**Test ID:** FARMER-APP-003  
**Priority:** HIGH  
**Complexity:** Medium

**Test Steps:**

1. **Navigate to Application Detail**
   - [ ] From applications list, click on an application
   - [ ] **VERIFY:** Redirected to `/farmer/applications/:id`
   - [ ] **VERIFY:** Application detail page loads

2. **Verify Detail Sections**
   - [ ] **VERIFY:** Application header with status badge
   - [ ] **VERIFY:** Application number displayed
   - [ ] **VERIFY:** Farm information section visible
   - [ ] **VERIFY:** Location details section visible
   - [ ] **VERIFY:** Crop information section visible
   - [ ] **VERIFY:** Timeline/workflow section visible

3. **Verify All Data Fields**
   - [ ] **VERIFY:** Farm name matches
   - [ ] **VERIFY:** Farm size matches
   - [ ] **VERIFY:** Address matches
   - [ ] **VERIFY:** Crop type matches
   - [ ] **VERIFY:** All entered data displayed correctly

4. **Test Workflow Timeline**
   - [ ] **VERIFY:** Current status highlighted
   - [ ] **VERIFY:** Completed steps shown
   - [ ] **VERIFY:** Pending steps shown
   - [ ] **VERIFY:** Dates/timestamps displayed

5. **Test Action Buttons (Based on Status)**
   
   **If DRAFT:**
   - [ ] **VERIFY:** "Edit" button visible
   - [ ] **VERIFY:** "Submit" button visible
   - [ ] **VERIFY:** "Delete" button visible
   
   **If SUBMITTED:**
   - [ ] **VERIFY:** "View Only" mode
   - [ ] **VERIFY:** No edit buttons
   - [ ] **VERIFY:** "Upload Documents" button visible (if needed)

6. **Test Edit Functionality**
   - [ ] If DRAFT, click "Edit"
   - [ ] **VERIFY:** Redirected to edit page
   - [ ] **VERIFY:** Form pre-populated with existing data
   - [ ] Make a change
   - [ ] Save
   - [ ] Return to detail page
   - [ ] **VERIFY:** Changes reflected

7. **Test Document Upload Section**
   - [ ] **VERIFY:** Document upload area visible
   - [ ] **VERIFY:** Required documents list shown
   - [ ] **VERIFY:** Upload buttons functional

8. **Test Network Retry on Fetch Detail** (Week 3-4 Implementation)
   - [ ] Open DevTools Console
   - [ ] Enable "Slow 3G" throttling
   - [ ] Navigate to application detail
   - [ ] **VERIFY:** Console shows retry attempts:
     ```
     🔄 Fetch application retry 1/2: ...
     ✅ Application fetched successfully
     ```
   - [ ] **VERIFY:** Detail loads despite network issues
   - [ ] Disable throttling

**Expected Result:** ✅ Detail page shows all data, actions work, retry logic active

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile)

**Status:** ⏳ Not Started

---

#### **Test Case 2.5: Document Upload**

**Test ID:** FARMER-DOC-001  
**Priority:** CRITICAL  
**Complexity:** High

**Test Steps:**

1. **Navigate to Documents Section**
   - [ ] From application detail, go to documents tab
   - [ ] **VERIFY:** Document upload interface visible
   - [ ] **VERIFY:** Required documents list shown

2. **Test File Selection**
   - [ ] Click "Upload" button for "Farm Ownership Document"
   - [ ] **VERIFY:** File picker dialog opens
   - [ ] Select a PDF file
   - [ ] **VERIFY:** File name appears
   - [ ] **VERIFY:** File size shown
   - [ ] **VERIFY:** Preview available (if PDF viewer)

3. **Test File Type Validation**
   - [ ] Try to upload .exe file
   - [ ] **VERIFY:** Error: "Invalid file type"
   - [ ] **VERIFY:** Allowed types shown: PDF, JPG, PNG
   - [ ] Select valid PDF file
   - [ ] **VERIFY:** Validation passes

4. **Test File Size Validation**
   - [ ] Try to upload 20MB file
   - [ ] **VERIFY:** Error: "File too large"
   - [ ] **VERIFY:** Max size shown: 10MB
   - [ ] Select file under 10MB
   - [ ] **VERIFY:** Validation passes

5. **Test Upload Progress**
   - [ ] Click "Upload" to submit
   - [ ] **VERIFY:** Progress bar appears
   - [ ] **VERIFY:** Progress percentage shown
   - [ ] **VERIFY:** Cancel button available during upload

6. **Test Successful Upload**
   - [ ] Complete upload
   - [ ] **VERIFY:** Success message appears
   - [ ] **VERIFY:** Document appears in uploaded list
   - [ ] **VERIFY:** Document status: "PENDING REVIEW"
   - [ ] **VERIFY:** Timestamp shown

7. **Test Multiple Document Upload**
   - [ ] Upload "Land Certificate"
   - [ ] **VERIFY:** Upload successful
   - [ ] Upload "Farming License"
   - [ ] **VERIFY:** Upload successful
   - [ ] **VERIFY:** All documents in list
   - [ ] **VERIFY:** Each has unique ID

8. **Test Document Actions**
   - [ ] Hover over uploaded document
   - [ ] **VERIFY:** Action buttons appear:
     - [ ] "View" button
     - [ ] "Download" button
     - [ ] "Delete" button (if status allows)
   - [ ] Click "View"
   - [ ] **VERIFY:** Document viewer/modal opens
   - [ ] **VERIFY:** Document displays correctly
   - [ ] Close viewer
   - [ ] Click "Download"
   - [ ] **VERIFY:** File downloads

9. **Test Document Deletion**
   - [ ] Click "Delete" on a document
   - [ ] **VERIFY:** Confirmation modal appears
   - [ ] Click "Cancel"
   - [ ] **VERIFY:** Document not deleted
   - [ ] Click "Delete" again
   - [ ] Click "Confirm"
   - [ ] **VERIFY:** Document removed from list
   - [ ] **VERIFY:** Success message shown

10. **Test Upload Retry on Network Failure**
    - [ ] Enable "Slow 3G" throttling
    - [ ] Select file to upload
    - [ ] Click "Upload"
    - [ ] **VERIFY:** Upload retries automatically if it fails
    - [ ] **VERIFY:** User sees retry feedback
    - [ ] **VERIFY:** Upload completes successfully
    - [ ] Disable throttling

**Expected Result:** ✅ Document upload complete, validation works, actions functional

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)

**Status:** ⏳ Not Started

---

### **SECTION 3: OFFICER WORKFLOWS**

#### **Test Case 3.1: Application Review**

**Test ID:** OFFICER-REV-001  
**Priority:** CRITICAL  
**Complexity:** High

**Preconditions:**
- [ ] Logged in as DTAM_OFFICER
- [ ] At least one submitted application exists

**Test Steps:**

1. **Navigate to Review Queue**
   - [ ] Go to `/officer/applications`
   - [ ] **VERIFY:** Applications queue page loads
   - [ ] **VERIFY:** List of submitted applications visible
   - [ ] **VERIFY:** Filter by status available

2. **Filter Applications**
   - [ ] Filter by "SUBMITTED"
   - [ ] **VERIFY:** Only submitted applications shown
   - [ ] Filter by "DOCUMENT_REVIEW"
   - [ ] **VERIFY:** Applications in document review shown

3. **Open Application for Review**
   - [ ] Click on a submitted application
   - [ ] **VERIFY:** Redirected to `/officer/applications/:id`
   - [ ] **VERIFY:** Full application details visible
   - [ ] **VERIFY:** Review panel visible
   - [ ] **VERIFY:** Officer actions available

4. **Review Application Details**
   - [ ] **VERIFY:** All farm information visible
   - [ ] **VERIFY:** All uploaded documents visible
   - [ ] **VERIFY:** Document preview available
   - [ ] Click "View Document"
   - [ ] **VERIFY:** Document opens in viewer/new tab

5. **Test Document Approval**
   - [ ] Click "Approve" on a document
   - [ ] **VERIFY:** Document status changes to "APPROVED"
   - [ ] **VERIFY:** Approval timestamp shown
   - [ ] **VERIFY:** Officer name recorded

6. **Test Document Rejection**
   - [ ] Click "Reject" on a document
   - [ ] **VERIFY:** Rejection reason modal appears
   - [ ] **VERIFY:** Reason text area required
   - [ ] Enter rejection reason: "เอกสารไม่ชัดเจน กรุณาอัพโหลดใหม่"
   - [ ] Click "Confirm Reject"
   - [ ] **VERIFY:** Document status changes to "REJECTED"
   - [ ] **VERIFY:** Rejection reason shown
   - [ ] **VERIFY:** Farmer notified (check notification system)

7. **Test Request More Information**
   - [ ] Click "Request Info" button
   - [ ] **VERIFY:** Request modal appears
   - [ ] Enter request: "กรุณาแนบใบรับรองการครอบครองที่ดิน"
   - [ ] Click "Send Request"
   - [ ] **VERIFY:** Request sent
   - [ ] **VERIFY:** Application status: "INFORMATION_REQUESTED"
   - [ ] **VERIFY:** Farmer notified

8. **Test Approve Application**
   - [ ] Approve all documents
   - [ ] Click "Approve Application" button
   - [ ] **VERIFY:** Confirmation modal appears
   - [ ] Review approval summary
   - [ ] Click "Confirm Approval"
   - [ ] **VERIFY:** Application status: "APPROVED"
   - [ ] **VERIFY:** Success message shown
   - [ ] **VERIFY:** Moves to next workflow stage
   - [ ] **VERIFY:** Farmer notified

9. **Test Reject Application**
   - [ ] Open another application
   - [ ] Click "Reject Application" button
   - [ ] **VERIFY:** Rejection modal appears
   - [ ] Enter rejection reason: "ไม่ผ่านเกณฑ์ประเมิน"
   - [ ] Click "Confirm Rejection"
   - [ ] **VERIFY:** Application status: "REJECTED"
   - [ ] **VERIFY:** Rejection final
   - [ ] **VERIFY:** Farmer notified

10. **Test Review Notes**
    - [ ] Add internal note: "ตรวจสอบเพิ่มเติมในครั้งหน้า"
    - [ ] Click "Save Note"
    - [ ] **VERIFY:** Note saved
    - [ ] **VERIFY:** Note visible to officers only
    - [ ] **VERIFY:** Timestamp and author shown

**Expected Result:** ✅ Complete review workflow functional, all actions work

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)

**Status:** ⏳ Not Started

---

### **SECTION 4: ERROR BOUNDARY TESTING**

#### **Test Case 4.1: Error Boundary - Component Error**

**Test ID:** ERR-BOUND-001  
**Priority:** CRITICAL (Week 3-4 Implementation)  
**Complexity:** Medium

**Preconditions:**
- [ ] ErrorBoundaryTest component available
- [ ] Error boundary wrapped around app in layout.tsx

**Test Steps:**

1. **Add Test Component to Dashboard**
   - [ ] Edit `farmer/dashboard/page.tsx`
   - [ ] Import ErrorBoundaryTest component
   - [ ] Add component to bottom of dashboard
   - [ ] Save and refresh browser

2. **Verify Test Component Visible**
   - [ ] Navigate to `/farmer/dashboard`
   - [ ] **VERIFY:** Yellow test panel in bottom-right corner
   - [ ] **VERIFY:** "Error Boundary Test" heading visible
   - [ ] **VERIFY:** "Throw Test Error" button visible

3. **Trigger Component Error**
   - [ ] Click "🧪 Throw Test Error" button
   - [ ] **VERIFY:** Component error thrown
   - [ ] **VERIFY:** App does NOT crash (no white screen)
   - [ ] **VERIFY:** Error boundary catches error

4. **Verify Error UI Display**
   - [ ] **VERIFY:** Thai error UI appears:
     - [ ] Red error icon visible
     - [ ] Title: "เกิดข้อผิดพลาด"
     - [ ] Description: "ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง"
   - [ ] **VERIFY:** Three action buttons visible:
     - [ ] "🔄 ลองใหม่อีกครั้ง" (Try Again)
     - [ ] "↻ โหลดหน้าใหม่" (Reload Page)
     - [ ] "🏠 กลับหน้าแรก" (Go Home)

5. **Verify Development Error Details**
   - [ ] **VERIFY:** Error details section visible (dev mode only)
   - [ ] **VERIFY:** Error message shown: "🧪 Test Error: This is an intentional error..."
   - [ ] **VERIFY:** Component stack visible
   - [ ] Expand "Component Stack"
   - [ ] **VERIFY:** Stack trace displayed

6. **Test Recovery - Try Again Button**
   - [ ] Click "🔄 ลองใหม่อีกครั้ง" button
   - [ ] **VERIFY:** Error UI disappears
   - [ ] **VERIFY:** Dashboard reloads normally
   - [ ] **VERIFY:** No page refresh occurred (check URL doesn't reload)
   - [ ] **VERIFY:** Test component visible again

7. **Test Recovery - Reload Page Button**
   - [ ] Throw error again
   - [ ] Click "↻ โหลดหน้าใหม่" button
   - [ ] **VERIFY:** Full page reload occurs
   - [ ] **VERIFY:** Dashboard loads fresh
   - [ ] **VERIFY:** No error state

8. **Test Recovery - Go Home Button**
   - [ ] Throw error again
   - [ ] Click "🏠 กลับหน้าแรก" button
   - [ ] **VERIFY:** Redirected to `/` or home page
   - [ ] **VERIFY:** Home page loads correctly
   - [ ] **VERIFY:** No error persists

9. **Test Error Isolation**
   - [ ] Navigate back to dashboard
   - [ ] Throw error again
   - [ ] Open browser DevTools
   - [ ] Check other tabs/sections of app
   - [ ] **VERIFY:** Other components outside error boundary still work
   - [ ] **VERIFY:** Header/navigation still functional
   - [ ] **VERIFY:** Error is isolated to affected component

10. **Test Console Logging**
    - [ ] Open browser Console
    - [ ] Throw error again
    - [ ] **VERIFY:** Console shows error log:
      ```
      🔴 ErrorBoundary caught an error: Error: 🧪 Test Error...
      ```
    - [ ] **VERIFY:** Component stack logged

**Expected Result:** ✅ Error boundary catches errors, Thai UI displays, recovery works

**Cross-Browser Testing:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)

**Status:** ⏳ Not Started

---

### **SECTION 5: CROSS-BROWSER & DEVICE TESTING**

#### **Test Case 5.1: Responsive Design - Mobile**

**Test ID:** RESP-MOB-001  
**Priority:** HIGH  
**Complexity:** Medium

**Devices to Test:**
- iPhone 13 Pro (iOS Safari)
- iPhone 13 Pro (iOS Chrome)
- Samsung Galaxy S21 (Android Chrome)
- Samsung Galaxy S21 (Android Firefox)

**Test Steps for Each Device:**

1. **Test Login Page**
   - [ ] Navigate to `/login`
   - [ ] **VERIFY:** Form fits screen (no horizontal scroll)
   - [ ] **VERIFY:** Input fields large enough for touch
   - [ ] **VERIFY:** Buttons easily tappable
   - [ ] **VERIFY:** Text readable without zooming

2. **Test Registration Page**
   - [ ] Navigate to `/register`
   - [ ] **VERIFY:** Multi-field form displays correctly
   - [ ] **VERIFY:** Dropdown menus work on mobile
   - [ ] **VERIFY:** Form validation messages visible
   - [ ] **VERIFY:** Virtual keyboard doesn't obscure inputs

3. **Test Dashboard**
   - [ ] Navigate to `/farmer/dashboard`
   - [ ] **VERIFY:** Cards stack vertically
   - [ ] **VERIFY:** Navigation menu accessible (hamburger menu)
   - [ ] **VERIFY:** Charts/graphs responsive
   - [ ] **VERIFY:** Touch gestures work

4. **Test Application Form**
   - [ ] Navigate to `/farmer/applications/new`
   - [ ] **VERIFY:** Long form scrollable
   - [ ] **VERIFY:** All fields accessible
   - [ ] **VERIFY:** Date pickers work (native mobile pickers)
   - [ ] **VERIFY:** Dropdowns work
   - [ ] Fill and submit form
   - [ ] **VERIFY:** Submission successful

5. **Test Applications List**
   - [ ] Navigate to `/farmer/applications`
   - [ ] **VERIFY:** List view optimized for mobile
   - [ ] **VERIFY:** Cards readable
   - [ ] **VERIFY:** Swipe gestures work (if implemented)
   - [ ] **VERIFY:** Filter/search accessible

6. **Test Document Upload**
   - [ ] Navigate to document upload
   - [ ] Tap "Upload"
   - [ ] **VERIFY:** Mobile file picker opens
   - [ ] **VERIFY:** Can select from Photos/Files
   - [ ] **VERIFY:** Upload progress visible
   - [ ] **VERIFY:** Upload succeeds

7. **Test Error Boundary (Mobile)**
   - [ ] Trigger test error
   - [ ] **VERIFY:** Error UI displays correctly
   - [ ] **VERIFY:** Buttons tappable
   - [ ] **VERIFY:** Recovery works

**Expected Result:** ✅ All functionality works on mobile, responsive design proper

**Status:** ⏳ Not Started

---

#### **Test Case 5.2: Cross-Browser Compatibility**

**Test ID:** CROSS-BROW-001  
**Priority:** HIGH  
**Complexity:** High

**Browsers to Test:**

**Desktop:**
- Chrome (latest)
- Firefox (latest)
- Safari (macOS latest)
- Edge (latest)

**Mobile:**
- iOS Safari (latest)
- iOS Chrome (latest)
- Android Chrome (latest)
- Android Firefox (latest)

**Test Matrix:**

| Feature | Chrome | Firefox | Safari | Edge | iOS Safari | iOS Chrome | Android Chrome | Android Firefox |
|---------|--------|---------|--------|------|------------|------------|----------------|-----------------|
| Login | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Registration | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Create Application | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Document Upload | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Error Boundary | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Retry Logic | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Timeouts | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

**Status:** ⏳ Not Started

---

### **SECTION 6: REGRESSION TESTING**

#### **Test Case 6.1: Full Regression Suite**

**Test ID:** REG-FULL-001  
**Priority:** CRITICAL  
**Complexity:** Very High

**Objective:** Ensure Week 3-4 improvements (retry logic, error boundaries) didn't break existing functionality

**Pre-Implementation Baseline (Before Week 3-4):**
- [ ] Document baseline functionality state
- [ ] List all known working features
- [ ] Capture screenshots of working UI

**Post-Implementation Verification (After Week 3-4):**

1. **Authentication Still Works**
   - [ ] Login without network issues
   - [ ] **VERIFY:** Works same as before (no degradation)
   - [ ] Registration without network issues
   - [ ] **VERIFY:** Works same as before
   - [ ] Password reset
   - [ ] **VERIFY:** Works same as before

2. **Application CRUD Still Works**
   - [ ] Create application (normal network)
   - [ ] **VERIFY:** Works same as before
   - [ ] Read/view applications
   - [ ] **VERIFY:** Works same as before
   - [ ] Update application
   - [ ] **VERIFY:** Works same as before
   - [ ] Delete draft
   - [ ] **VERIFY:** Works same as before

3. **Verify No Performance Degradation**
   - [ ] Measure page load times
   - [ ] **VERIFY:** No slower than before
   - [ ] Measure API response times
   - [ ] **VERIFY:** No slower than before
   - [ ] Check console for new errors
   - [ ] **VERIFY:** No new console errors

4. **Verify No UI Regressions**
   - [ ] Compare screenshots to baseline
   - [ ] **VERIFY:** UI looks identical
   - [ ] Check all buttons still work
   - [ ] **VERIFY:** No broken buttons
   - [ ] Check all links still work
   - [ ] **VERIFY:** No broken links

5. **Verify Data Integrity**
   - [ ] Check database records
   - [ ] **VERIFY:** No corrupted data
   - [ ] **VERIFY:** All relationships intact
   - [ ] **VERIFY:** No orphaned records

**Expected Result:** ✅ All existing functionality works, no regressions introduced

**Status:** ⏳ Not Started

---

## 📊 TESTING EXECUTION TRACKER

### **Overall Progress**

| Section | Test Cases | Completed | Pass | Fail | Blocked | Coverage |
|---------|------------|-----------|------|------|---------|----------|
| Authentication & Authorization | 3 | 0 | 0 | 0 | 0 | 0% |
| Farmer Workflows | 5 | 0 | 0 | 0 | 0 | 0% |
| Officer Workflows | 1 | 0 | 0 | 0 | 0 | 0% |
| Error Boundary Testing | 1 | 0 | 0 | 0 | 0 | 0% |
| Cross-Browser/Device | 2 | 0 | 0 | 0 | 0 | 0% |
| Regression Testing | 1 | 0 | 0 | 0 | 0 | 0% |
| **TOTAL** | **13** | **0** | **0** | **0** | **0** | **0%** |

---

## 🐛 DEFECT TRACKING

### **Critical Defects**
| ID | Title | Description | Steps to Reproduce | Status |
|----|-------|-------------|-------------------|--------|
| - | - | - | - | - |

### **High Priority Defects**
| ID | Title | Description | Steps to Reproduce | Status |
|----|-------|-------------|-------------------|--------|
| - | - | - | - | - |

### **Medium Priority Defects**
| ID | Title | Description | Steps to Reproduce | Status |
|----|-------|-------------|-------------------|--------|
| - | - | - | - | - |

### **Low Priority Defects**
| ID | Title | Description | Steps to Reproduce | Status |
|----|-------|-------------|-------------------|--------|
| - | - | - | - | - |

---

## ✅ SIGN-OFF CHECKLIST

### **Developer Self-Testing Checklist**

Before marking as "Ready for QA," developer must complete:

- [ ] **Unit Tests Written** - All new functions have unit tests
- [ ] **Integration Tests Passed** - Components integrate with APIs correctly
- [ ] **Manual Smoke Test Completed** - Clicked through all new features
- [ ] **Form Validation Tested** - All forms validate correctly
- [ ] **Error States Tested** - Error messages display properly
- [ ] **Network Retry Logic Verified** - Console shows retry attempts
- [ ] **Error Boundary Verified** - Test component triggers recovery UI
- [ ] **Cross-Browser Tested** - Tested in Chrome, Firefox, Safari
- [ ] **Mobile Responsive Checked** - Tested on mobile device/emulator
- [ ] **No Console Errors** - Browser console clean
- [ ] **No Linter Errors** - Code passes linting
- [ ] **Documentation Updated** - README/docs reflect changes
- [ ] **Self-Review Completed** - Code reviewed by self first

### **QA Team Checklist**

QA team will perform:

- [ ] **Full E2E Testing** - All test cases in this plan
- [ ] **Exploratory Testing** - Ad-hoc testing for edge cases
- [ ] **Security Testing** - Auth, permissions, data validation
- [ ] **Performance Testing** - Load times, API response times
- [ ] **Accessibility Testing** - WCAG compliance
- [ ] **Regression Testing** - Existing features still work
- [ ] **Cross-Browser Matrix** - All browsers/devices tested
- [ ] **Data Validation** - Database integrity verified

---

## 📈 SUCCESS CRITERIA

### **Test Completion Criteria**

Testing is **COMPLETE** when:

✅ **100% Test Case Coverage** - All 13+ test cases executed  
✅ **95%+ Pass Rate** - At least 95% of tests pass  
✅ **Zero Critical Defects** - No P0/P1 bugs remaining  
✅ **Cross-Browser Verified** - All supported browsers tested  
✅ **Mobile Verified** - iOS and Android tested  
✅ **Regression Clean** - No new bugs in existing features  
✅ **Performance Acceptable** - No degradation from baseline  
✅ **Documentation Complete** - All defects documented  

### **Production Readiness Criteria**

Code is **READY FOR PRODUCTION** when:

✅ **All Tests Passed** - 100% pass rate achieved  
✅ **Zero Critical/High Bugs** - Only low priority issues remain  
✅ **Stakeholder Sign-Off** - Product owner approves  
✅ **Performance Targets Met** - Response times within SLA  
✅ **Security Verified** - No security vulnerabilities  
✅ **Rollback Plan Ready** - Reversion strategy documented  

---

## 🚀 EXECUTION INSTRUCTIONS

### **Phase 1: Developer Self-Testing** (2-3 hours)

**Immediate Actions:**

1. **Start Servers**
   ```powershell
   # Terminal 1 - Backend
   cd apps/backend
   node server.js
   
   # Terminal 2 - Frontend
   cd frontend-nextjs
   npm run dev
   ```

2. **Execute Core Test Cases**
   - [ ] Test Case 1.1: Registration
   - [ ] Test Case 1.2: Login
   - [ ] Test Case 2.2: Create Application
   - [ ] Test Case 4.1: Error Boundary

3. **Verify Retry Logic**
   - [ ] Enable network throttling
   - [ ] Test all retry scenarios
   - [ ] Document console output

4. **Fix Any Bugs Found**
   - [ ] Document in defect tracker
   - [ ] Fix immediately
   - [ ] Re-test

### **Phase 2: Comprehensive Testing** (4-6 hours)

1. **Execute All Test Cases** (13 cases)
2. **Test All Cross-Browser Combinations** (8 browsers)
3. **Test All Mobile Devices** (4 devices)
4. **Document All Results**

### **Phase 3: QA Handoff** (After 100% developer testing)

1. **Prepare QA Package:**
   - [ ] Test results documented
   - [ ] Known issues listed
   - [ ] Test data provided
   - [ ] Environment ready

2. **QA Execution** (QA team performs)

3. **Production Deployment** (After QA approval)

---

## 📞 SUPPORT & ESCALATION

### **Issue Escalation Path**

**Level 1:** Developer Self-Resolution (0-2 hours)  
**Level 2:** Team Lead Review (2-4 hours)  
**Level 3:** Technical Architect (4-8 hours)  
**Level 4:** Product Owner Decision (> 8 hours)

### **Contact Information**

**Developer:** [Your Name]  
**Team Lead:** [Lead Name]  
**QA Lead:** [QA Name]  
**Product Owner:** [PO Name]

---

## 📚 APPENDICES

### **Appendix A: Test Data**

**Test Users:**
```javascript
// FARMER
Email: farmer1@test.com
Password: SecurePass123!

// DTAM_OFFICER
Email: officer@test.com
Password: OfficerPass123!

// INSPECTOR
Email: inspector@test.com
Password: InspectorPass123!

// ADMIN
Email: admin@test.com
Password: AdminPass123!
```

### **Appendix B: Test Environment**

**Backend:**
- URL: http://localhost:3004
- Database: MongoDB Atlas (gacp-development)
- Connection Pool: maxPoolSize=10

**Frontend:**
- URL: http://localhost:3000
- Framework: Next.js 14.2.18
- Build: Development

### **Appendix C: Related Documentation**

- `docs/WEEK_3-4_RESILIENCE_IMPLEMENTATION_SUMMARY.md`
- `docs/TESTING_AND_DEPLOYMENT_GUIDE.md`
- `docs/FINAL_IMPLEMENTATION_REPORT.md`

---

**Test Plan Version:** 1.0  
**Last Updated:** October 22, 2025  
**Status:** ⏳ Ready for Execution  
**Estimated Duration:** 6-9 hours (Developer) + 8-12 hours (QA)

---

**END OF TEST PLAN**
