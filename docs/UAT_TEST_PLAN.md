# 🧪 UAT Test Plan - Botanical Audit Framework

**Generated:** October 20, 2025  
**Version:** 1.0  
**Status:** Ready for Testing

---

## 📋 Table of Contents

1. [User Roles Overview](#user-roles-overview)
2. [Module Testing Matrix](#module-testing-matrix)
3. [UAT Test Cases by Role](#uat-test-cases-by-role)
4. [UAT Test Cases by Module](#uat-test-cases-by-module)
5. [Test Environment Setup](#test-environment-setup)
6. [Test Data Requirements](#test-data-requirements)
7. [Test Execution Checklist](#test-execution-checklist)

---

## 👥 User Roles Overview

### 1. **UAT Farmer** 👨‍🌾
- **Primary User:** Farm owners, Cannabis cultivators
- **Access Level:** Basic user (own data only)
- **Key Responsibilities:**
  - Register and manage farm information
  - Submit GACP certification applications
  - Complete cannabis surveys
  - View certification status
  - Track farm activities

### 2. **UAT DTAM Reviewer** 👔
- **Primary User:** DTAM staff - initial reviewer
- **Access Level:** Reviewer (assigned applications)
- **Key Responsibilities:**
  - Review submitted applications
  - Request additional information
  - Preliminary document verification
  - Assign to inspectors

### 3. **UAT DTAM Inspector** 🔍
- **Primary User:** DTAM staff - field inspector
- **Access Level:** Inspector (assigned inspections)
- **Key Responsibilities:**
  - Conduct on-site inspections
  - Complete inspection checklists
  - Upload inspection evidence
  - Submit inspection reports

### 4. **UAT DTAM Approver** ✅
- **Primary User:** DTAM staff - final approver
- **Access Level:** Approver (all pending approvals)
- **Key Responsibilities:**
  - Final review of inspection reports
  - Approve/reject certification
  - Issue certificates
  - Quality assurance

### 5. **UAT DTAM Admin** 👑
- **Primary User:** System administrator
- **Access Level:** Full system access
- **Key Responsibilities:**
  - User management
  - System configuration
  - Data management
  - Report generation
  - Audit trail review

---

## 🎯 Module Testing Matrix

| Module | Farmer | Reviewer | Inspector | Approver | Admin |
|--------|:------:|:--------:|:---------:|:--------:|:-----:|
| **Member Management** | ✅ View | ✅ View | ✅ View | ✅ View | ✅ Full |
| **Certification** | ✅ Submit | ✅ Review | ✅ Inspect | ✅ Approve | ✅ Manage |
| **Farm Management** | ✅ Full | ✅ View | ✅ View | ✅ View | ✅ Full |
| **Track & Trace** | ✅ Record | ✅ View | ✅ View | ✅ View | ✅ Manage |
| **Survey** | ✅ Complete | ✅ View | ✅ View | ✅ View | ✅ Manage |
| **GACP Compare** | ✅ View | ✅ View | ✅ View | ✅ View | ✅ Manage |

---

## 🧪 UAT Test Cases by Role

### 1️⃣ UAT Farmer Test Cases

#### TC-F001: Farmer Registration & Login
- **Priority:** Critical
- **Steps:**
  1. Navigate to farmer portal
  2. Click "Register" button
  3. Fill registration form (name, email, phone, national ID)
  4. Submit registration
  5. Verify email confirmation
  6. Login with credentials
- **Expected Result:** ✅ Successful registration and login
- **Test Data:** Valid farmer information
- **Module:** Member Management

#### TC-F002: Farm Profile Creation
- **Priority:** Critical
- **Steps:**
  1. Login as farmer
  2. Navigate to "My Farms"
  3. Click "Add New Farm"
  4. Fill farm details (name, location, size, crop type)
  5. Upload farm map/photos
  6. Submit farm profile
- **Expected Result:** ✅ Farm profile created successfully
- **Test Data:** Farm location coordinates, farm documents
- **Module:** Farm Management

#### TC-F003: GACP Certification Application
- **Priority:** Critical
- **Steps:**
  1. Login as farmer
  2. Navigate to "Certifications"
  3. Click "Apply for GACP Certification"
  4. Select farm
  5. Fill application form
  6. Upload required documents (land deed, water test, etc.)
  7. Submit application
- **Expected Result:** ✅ Application submitted with tracking number
- **Test Data:** Complete application documents
- **Module:** Certification

#### TC-F004: Cannabis Survey Completion
- **Priority:** High
- **Steps:**
  1. Login as farmer
  2. Navigate to "Surveys"
  3. Select assigned survey (4 regions)
  4. Complete all survey questions
  5. Upload supporting photos
  6. Submit survey
- **Expected Result:** ✅ Survey completed and saved
- **Test Data:** Survey responses for Central/Northern/Southern/Northeastern regions
- **Module:** Survey

#### TC-F005: Track & Trace Recording
- **Priority:** High
- **Steps:**
  1. Login as farmer
  2. Navigate to "Track & Trace"
  3. Record planting activity (date, quantity, location)
  4. Record harvesting activity
  5. View activity timeline
- **Expected Result:** ✅ Activities recorded with timestamps
- **Test Data:** Activity dates, quantities
- **Module:** Track & Trace

#### TC-F006: GACP Standards Comparison
- **Priority:** Medium
- **Steps:**
  1. Login as farmer
  2. Navigate to "GACP Standards"
  3. View standards checklist
  4. Compare farm practices against standards
  5. Download compliance report
- **Expected Result:** ✅ Gap analysis report generated
- **Test Data:** None required
- **Module:** GACP Compare

---

### 2️⃣ UAT DTAM Reviewer Test Cases

#### TC-R001: Reviewer Login & Dashboard
- **Priority:** Critical
- **Steps:**
  1. Navigate to DTAM portal
  2. Login with reviewer credentials
  3. View dashboard with assigned applications
  4. Check pending review count
- **Expected Result:** ✅ Dashboard shows assigned applications
- **Test Data:** Reviewer credentials
- **Module:** Member Management

#### TC-R002: Application Review
- **Priority:** Critical
- **Steps:**
  1. Login as reviewer
  2. Select pending application
  3. Review application details
  4. Verify submitted documents
  5. Add review comments
  6. Request additional information (if needed)
  7. Forward to inspector OR reject
- **Expected Result:** ✅ Application status updated, farmer notified
- **Test Data:** Pending applications
- **Module:** Certification

#### TC-R003: Document Verification
- **Priority:** High
- **Steps:**
  1. Login as reviewer
  2. Open application
  3. Download attached documents
  4. Verify document authenticity
  5. Mark documents as verified/rejected
  6. Add verification notes
- **Expected Result:** ✅ Document status updated
- **Test Data:** Application with documents
- **Module:** Certification

#### TC-R004: Inspector Assignment
- **Priority:** High
- **Steps:**
  1. Login as reviewer
  2. Select reviewed application
  3. Click "Assign Inspector"
  4. Select available inspector
  5. Set inspection date
  6. Add inspection notes
  7. Submit assignment
- **Expected Result:** ✅ Inspector notified, inspection scheduled
- **Test Data:** Available inspectors list
- **Module:** Certification

#### TC-R005: Member Management Review
- **Priority:** Medium
- **Steps:**
  1. Login as reviewer
  2. Navigate to "Members"
  3. Search for specific farmer
  4. View farmer profile and history
  5. View all farmer's applications
- **Expected Result:** ✅ Complete farmer information displayed
- **Test Data:** Farmer member ID
- **Module:** Member Management

---

### 3️⃣ UAT DTAM Inspector Test Cases

#### TC-I001: Inspector Login & Assignments
- **Priority:** Critical
- **Steps:**
  1. Login to DTAM portal as inspector
  2. View assigned inspections dashboard
  3. Check upcoming inspections calendar
  4. View inspection details
- **Expected Result:** ✅ Assigned inspections displayed with dates
- **Test Data:** Inspector credentials
- **Module:** Certification

#### TC-I002: On-Site Inspection (Mobile)
- **Priority:** Critical
- **Steps:**
  1. Login on mobile device
  2. Select today's inspection
  3. View farm location on map
  4. Navigate to farm
  5. Start inspection checklist
  6. Complete all inspection items
  7. Take photos for evidence
  8. Add GPS coordinates
  9. Save inspection progress
- **Expected Result:** ✅ Inspection recorded with geo-location
- **Test Data:** GPS-enabled mobile device
- **Module:** Certification

#### TC-I003: Inspection Checklist Completion
- **Priority:** Critical
- **Steps:**
  1. Login as inspector
  2. Open assigned inspection
  3. Complete GACP checklist items:
     - Water quality verification
     - Pest control measures
     - Storage facility inspection
     - Record keeping verification
     - Equipment inspection
  4. Mark items as Pass/Fail/N/A
  5. Add notes for each item
  6. Upload supporting photos
- **Expected Result:** ✅ Checklist 100% completed
- **Test Data:** Inspection checklist template
- **Module:** Certification

#### TC-I004: Inspection Report Submission
- **Priority:** Critical
- **Steps:**
  1. Login as inspector
  2. Complete inspection checklist
  3. Generate inspection report
  4. Review report summary
  5. Add overall recommendation (Approve/Reject/Conditional)
  6. Submit report to approver
- **Expected Result:** ✅ Report submitted, approver notified
- **Test Data:** Completed inspection
- **Module:** Certification

#### TC-I005: Farm Management Verification
- **Priority:** High
- **Steps:**
  1. Login as inspector
  2. During inspection, verify farm profile data
  3. Update farm coordinates if needed
  4. Verify crop types and quantities
  5. Add inspection notes to farm record
- **Expected Result:** ✅ Farm data verified and updated
- **Test Data:** Farm profile information
- **Module:** Farm Management

---

### 4️⃣ UAT DTAM Approver Test Cases

#### TC-A001: Approver Dashboard
- **Priority:** Critical
- **Steps:**
  1. Login as approver
  2. View pending approvals dashboard
  3. Check inspection reports queue
  4. View KPIs (approval rate, average processing time)
- **Expected Result:** ✅ Dashboard shows pending approvals
- **Test Data:** Approver credentials
- **Module:** Certification

#### TC-A002: Inspection Report Review
- **Priority:** Critical
- **Steps:**
  1. Login as approver
  2. Select pending inspection report
  3. Review inspector's findings
  4. View inspection photos and evidence
  5. Check compliance with GACP standards
  6. Verify inspector recommendations
- **Expected Result:** ✅ Complete report review performed
- **Test Data:** Completed inspection report
- **Module:** Certification

#### TC-A003: Certificate Approval
- **Priority:** Critical
- **Steps:**
  1. Login as approver
  2. Review inspection report
  3. Verify all requirements met
  4. Click "Approve Certification"
  5. Set certificate validity period (1 year)
  6. Add approval notes
  7. Submit approval
- **Expected Result:** ✅ Certificate generated, farmer notified
- **Test Data:** Passing inspection report
- **Module:** Certification

#### TC-A004: Certificate Rejection
- **Priority:** High
- **Steps:**
  1. Login as approver
  2. Review inspection report with failures
  3. Click "Reject Certification"
  4. Select rejection reasons (checklist)
  5. Add detailed rejection notes
  6. Submit rejection
- **Expected Result:** ✅ Application rejected, farmer notified with reasons
- **Test Data:** Failing inspection report
- **Module:** Certification

#### TC-A005: Conditional Approval
- **Priority:** High
- **Steps:**
  1. Login as approver
  2. Review inspection with minor issues
  3. Click "Conditional Approval"
  4. List required corrective actions
  5. Set deadline for corrections
  6. Submit conditional approval
- **Expected Result:** ✅ Farmer notified of required actions
- **Test Data:** Inspection with minor non-conformances
- **Module:** Certification

#### TC-A006: Certificate Management
- **Priority:** Medium
- **Steps:**
  1. Login as approver
  2. Navigate to "Issued Certificates"
  3. Search for specific certificate
  4. View certificate details
  5. Download PDF certificate
  6. Verify certificate information
- **Expected Result:** ✅ Certificate displayed and downloadable
- **Test Data:** Certificate ID
- **Module:** Certification

---

### 5️⃣ UAT DTAM Admin Test Cases

#### TC-AD001: Admin Dashboard
- **Priority:** Critical
- **Steps:**
  1. Login as admin
  2. View system dashboard
  3. Check system metrics:
     - Total users by role
     - Active applications
     - Certificates issued (monthly)
     - System health status
- **Expected Result:** ✅ Complete system overview displayed
- **Test Data:** Admin credentials
- **Module:** Member Management

#### TC-AD002: User Management
- **Priority:** Critical
- **Steps:**
  1. Login as admin
  2. Navigate to "User Management"
  3. Create new reviewer account
  4. Create new inspector account
  5. Create new approver account
  6. Assign roles and permissions
  7. Activate accounts
- **Expected Result:** ✅ Users created with correct roles
- **Test Data:** New user information
- **Module:** Member Management

#### TC-AD003: User Role Modification
- **Priority:** High
- **Steps:**
  1. Login as admin
  2. Select existing user
  3. Modify user role (e.g., Reviewer → Inspector)
  4. Update permissions
  5. Save changes
- **Expected Result:** ✅ User role updated successfully
- **Test Data:** Existing user account
- **Module:** Member Management

#### TC-AD004: Farm Data Management
- **Priority:** High
- **Steps:**
  1. Login as admin
  2. Navigate to "Farm Management"
  3. Search for specific farm
  4. Edit farm details
  5. Update farm status (Active/Inactive/Suspended)
  6. Save changes
- **Expected Result:** ✅ Farm data updated
- **Test Data:** Farm ID
- **Module:** Farm Management

#### TC-AD005: Certificate Management (Admin)
- **Priority:** High
- **Steps:**
  1. Login as admin
  2. Navigate to "Certificate Management"
  3. Search for certificate
  4. Revoke certificate (if needed)
  5. Reissue certificate (if needed)
  6. View certificate history
- **Expected Result:** ✅ Certificate management operations successful
- **Test Data:** Certificate ID
- **Module:** Certification

#### TC-AD006: Survey Management
- **Priority:** Medium
- **Steps:**
  1. Login as admin
  2. Navigate to "Survey Management"
  3. Create new survey template
  4. Assign survey to farmers (by region)
  5. Set survey deadline
  6. Activate survey
- **Expected Result:** ✅ Survey deployed to farmers
- **Test Data:** Survey questions and regions
- **Module:** Survey

#### TC-AD007: Track & Trace Data Management
- **Priority:** Medium
- **Steps:**
  1. Login as admin
  2. Navigate to "Track & Trace"
  3. View all farm activities
  4. Filter by farm/date/activity type
  5. Export data to Excel
  6. Generate activity report
- **Expected Result:** ✅ Data exported and report generated
- **Test Data:** Date range, farm filter
- **Module:** Track & Trace

#### TC-AD008: GACP Standards Management
- **Priority:** Medium
- **Steps:**
  1. Login as admin
  2. Navigate to "GACP Standards"
  3. Update standards checklist
  4. Add new compliance parameters
  5. Set parameter weights
  6. Publish updated standards
- **Expected Result:** ✅ Standards updated system-wide
- **Test Data:** Updated standards document
- **Module:** GACP Compare

#### TC-AD009: System Audit Logs
- **Priority:** High
- **Steps:**
  1. Login as admin
  2. Navigate to "Audit Logs"
  3. Filter by user role
  4. Filter by action type
  5. Filter by date range
  6. Export audit log
- **Expected Result:** ✅ Complete audit trail available
- **Test Data:** Date range
- **Module:** Member Management

#### TC-AD010: Report Generation
- **Priority:** Medium
- **Steps:**
  1. Login as admin
  2. Navigate to "Reports"
  3. Generate monthly certification report
  4. Generate farm activity report
  5. Generate compliance report
  6. Schedule automated reports
- **Expected Result:** ✅ Reports generated and scheduled
- **Test Data:** Report parameters
- **Module:** Multiple modules

---

## 🧩 UAT Test Cases by Module

### 📝 Module 1: Member Management

#### Test Scenarios:
- ✅ User registration (all roles)
- ✅ User login/logout
- ✅ Password reset
- ✅ Profile management
- ✅ Role-based access control
- ✅ User search and filtering
- ✅ User activation/deactivation

#### Integration Points:
- Authentication service
- Database (MongoDB)
- Email notification service

---

### 🎓 Module 2: Certification Management

#### Test Scenarios:
- ✅ Application submission
- ✅ Application review workflow
- ✅ Inspector assignment
- ✅ Inspection scheduling
- ✅ Inspection checklist completion
- ✅ Report generation
- ✅ Approval/rejection process
- ✅ Certificate issuance
- ✅ Certificate renewal
- ✅ Certificate revocation

#### Integration Points:
- Member management module
- Farm management module
- Notification service
- PDF generation service
- File storage service

---

### 🌾 Module 3: Farm Management

#### Test Scenarios:
- ✅ Farm profile creation
- ✅ Farm location mapping (GPS)
- ✅ Crop type management
- ✅ Farm size validation
- ✅ Document upload (land deed, permits)
- ✅ Farm status management
- ✅ Multiple farms per farmer
- ✅ Farm data export

#### Integration Points:
- Member management module
- Certification module
- Track & trace module
- Map/GPS service

---

### 📦 Module 4: Track & Trace

#### Test Scenarios:
- ✅ Activity recording (planting, harvesting, processing)
- ✅ Batch/lot number generation
- ✅ Quantity tracking
- ✅ Timestamp validation
- ✅ Activity timeline view
- ✅ Chain of custody
- ✅ Data export (Excel/PDF)
- ✅ QR code generation

#### Integration Points:
- Farm management module
- Certification module
- Report generation service

---

### 📊 Module 5: Survey Management

#### Test Scenarios:
- ✅ Survey template creation
- ✅ Question types (multiple choice, text, rating)
- ✅ Regional survey deployment (4 regions)
- ✅ Survey assignment to farmers
- ✅ Survey response recording
- ✅ Photo attachment
- ✅ Survey completion validation
- ✅ Response analysis and reporting

#### Integration Points:
- Member management module
- Farm management module
- Notification service
- Report generation service

---

### 📋 Module 6: GACP Standards Comparison

#### Test Scenarios:
- ✅ Standards checklist display
- ✅ Farm compliance scoring
- ✅ Gap analysis
- ✅ Parameter weighting
- ✅ Compliance report generation
- ✅ Historical compliance tracking
- ✅ Standards update notification

#### Integration Points:
- Farm management module
- Certification module
- Report generation service

---

## 🔧 Test Environment Setup

### 1. Database Setup
```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/botanical-audit-uat

# Create test database
use botanical-audit-uat

# Import test data
mongoimport --db botanical-audit-uat --collection users --file test-users.json
```

### 2. Backend Server
```bash
cd apps/backend
pnpm install
cp .env.example .env.uat

# Update .env.uat with test configuration
NODE_ENV=uat
PORT=3001
JWT_SECRET=test_secret_key_uat
MONGODB_URI=mongodb://localhost:27017/botanical-audit-uat

# Start server
node server.js
```

### 3. Frontend Portal
```bash
cd apps/farmer-portal
pnpm install
pnpm dev

# Access at http://localhost:3000
```

---

## 📦 Test Data Requirements

### Test Users

#### Farmers (5 users)
```json
{
  "farmers": [
    {
      "username": "farmer001",
      "password": "Test@1234",
      "name": "Somchai Prasert",
      "nationalId": "1234567890123",
      "phone": "0812345678",
      "region": "Central"
    },
    {
      "username": "farmer002",
      "password": "Test@1234",
      "name": "Somsri Boonmee",
      "nationalId": "1234567890124",
      "phone": "0823456789",
      "region": "Northern"
    }
  ]
}
```

#### DTAM Staff
```json
{
  "staff": [
    {
      "username": "reviewer001",
      "password": "Rev@1234",
      "name": "Panya Review",
      "role": "reviewer",
      "staffId": "REV-001"
    },
    {
      "username": "inspector001",
      "password": "Insp@1234",
      "name": "Krit Inspector",
      "role": "inspector",
      "staffId": "INS-001"
    },
    {
      "username": "approver001",
      "password": "App@1234",
      "name": "Wichai Approver",
      "role": "approver",
      "staffId": "APR-001"
    },
    {
      "username": "admin001",
      "password": "Admin@1234",
      "name": "Narong Admin",
      "role": "admin",
      "staffId": "ADM-001"
    }
  ]
}
```

### Test Farms (10 farms)
- Central region: 3 farms
- Northern region: 3 farms
- Southern region: 2 farms
- Northeastern region: 2 farms

### Test Applications (20 applications)
- Pending review: 5
- Under inspection: 5
- Pending approval: 5
- Approved: 3
- Rejected: 2

---

## ✅ Test Execution Checklist

### Pre-Testing
- [ ] UAT environment deployed
- [ ] Test database populated
- [ ] Test users created
- [ ] All services running
- [ ] Test data verified

### Role-Based Testing
- [ ] **Farmer Role**
  - [ ] TC-F001 to TC-F006 completed
  - [ ] All modules accessible
  - [ ] No unauthorized access
  
- [ ] **Reviewer Role**
  - [ ] TC-R001 to TC-R005 completed
  - [ ] Review workflow functional
  - [ ] Inspector assignment working
  
- [ ] **Inspector Role**
  - [ ] TC-I001 to TC-I005 completed
  - [ ] Mobile inspection working
  - [ ] Photo upload functional
  
- [ ] **Approver Role**
  - [ ] TC-A001 to TC-A006 completed
  - [ ] Approval workflow functional
  - [ ] Certificate generation working
  
- [ ] **Admin Role**
  - [ ] TC-AD001 to TC-AD010 completed
  - [ ] All management functions working
  - [ ] Reports generating correctly

### Module Testing
- [ ] **Member Management** (10 test cases)
- [ ] **Certification** (30 test cases)
- [ ] **Farm Management** (15 test cases)
- [ ] **Track & Trace** (12 test cases)
- [ ] **Survey** (15 test cases)
- [ ] **GACP Compare** (10 test cases)

### Integration Testing
- [ ] End-to-end certification workflow
- [ ] Cross-module data flow
- [ ] Notification system
- [ ] Report generation
- [ ] File upload/download

### Performance Testing
- [ ] Load testing (100 concurrent users)
- [ ] Response time < 3 seconds
- [ ] Database query optimization
- [ ] File upload speed

### Security Testing
- [ ] Role-based access control
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Password encryption

---

## 📊 Test Results Template

### Test Summary Report

**Test Period:** [Start Date] - [End Date]  
**Test Team:** [Names]

| Role | Total Cases | Passed | Failed | Blocked | Pass Rate |
|------|------------|--------|--------|---------|-----------|
| Farmer | 6 | - | - | - | - |
| Reviewer | 5 | - | - | - | - |
| Inspector | 5 | - | - | - | - |
| Approver | 6 | - | - | - | - |
| Admin | 10 | - | - | - | - |
| **TOTAL** | **32** | **-** | **-** | **-** | **-%** |

### Critical Issues Log

| ID | Module | Description | Severity | Status | Assigned To |
|----|--------|-------------|----------|--------|-------------|
| ISS-001 | - | - | Critical | - | - |

---

## 🎯 Success Criteria

- ✅ **Functional:** All test cases pass (100%)
- ✅ **Performance:** Response time < 3 seconds
- ✅ **Security:** No critical vulnerabilities
- ✅ **Usability:** User satisfaction score > 80%
- ✅ **Stability:** No system crashes during testing
- ✅ **Integration:** All modules work together seamlessly

---

## 📝 Sign-Off

**Prepared By:** GitHub Copilot  
**Date:** October 20, 2025  

**Approved By:**
- [ ] Project Manager: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] Technical Lead: _________________ Date: _______
- [ ] Business Owner: _________________ Date: _______

---

**Total Test Cases:** 92  
**Estimated Testing Time:** 40 hours  
**Testing Team Required:** 5 testers (1 per role)
