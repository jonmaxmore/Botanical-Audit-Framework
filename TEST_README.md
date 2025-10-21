# 🧪 GACP Platform Testing System

Complete testing infrastructure with **QA/QC automation** and **UAT (User Acceptance Testing)**

---

## ⚡ Quick Start

### QA Testing (Automated Technical Testing)

```powershell
# Run automated QA tests - 66 test cases
.\start-qa-testing.ps1
```

### UAT Testing (User Acceptance Testing)

```powershell
# Run UAT scenarios - 19 real-world scenarios
.\start-uat-testing.ps1
```

---

## 📊 Test Coverage

### 👥 5 User Roles Tested

- ✅ เกษตรกร (Farmer)
- ✅ พนักงานตรวจเอกสาร (Document Reviewer)
- ✅ พนักงานตรวจสอบฟาร์ม (Inspector)
- ✅ พนักงานอนุมัติ (Approver)
- ✅ ผู้ดูแลระบบ (Admin)

### 🔧 10 Systems Tested

- ✅ Auth/SSO System
- ✅ GACP Application
- ✅ Farm Management
- ✅ Track & Trace
- ✅ Survey System (Standalone)
- ✅ Standards Comparison (Standalone)
- ✅ Document Management
- ✅ Notification System
- ✅ Certificate Generation
- ✅ Reporting System

### 📋 Complete Test Suite

| Test Type         | Count | Focus                           |
| ----------------- | ----- | ------------------------------- |
| **QA Tests**      | 66    | Technical correctness & bugs    |
| **UAT Scenarios** | 19    | Business acceptance & workflows |
| **Total**         | 85    | Complete system validation      |

**QA Tests Breakdown:**

- 56 Main Tests (all features)
- 10 Reverse Tests (data integrity)

**UAT Scenarios Breakdown:**

- 9 Role-based scenarios (user journeys)
- 10 System-based scenarios (end-to-end)

---

## 📚 Documentation

### 📖 QA Testing

| File                                | Description                 |
| ----------------------------------- | --------------------------- |
| `docs/QA_TESTING_GUIDE.md`          | Complete QA testing guide   |
| `docs/QA_TESTING_SUMMARY_REPORT.md` | Executive summary & results |

### 🎯 UAT Testing

| File                         | Description                       |
| ---------------------------- | --------------------------------- |
| `docs/UAT_GUIDE.md`          | Complete UAT guide with scenarios |
| `docs/UAT_SUMMARY_REPORT.md` | UAT summary & acceptance criteria |

### 📝 General

| File             | Description                  |
| ---------------- | ---------------------------- |
| `TEST_README.md` | This file - testing overview |

---

## 🎯 Testing Strategy

### 1️⃣ QA Testing First (Technical Validation)

**Purpose:** Find bugs and verify technical correctness

**When to run:** After code changes, before UAT

```powershell
.\start-qa-testing.ps1
```

**What it tests:**

- ✅ API endpoints work correctly
- ✅ Data validation rules
- ✅ Error handling
- ✅ System integration
- ✅ Reverse operations (data integrity)

**Expected result:**

```
✓ Total Passed: 66
✗ Total Failed: 0
📊 Success Rate: 100%
```

---

### 2️⃣ UAT Testing Second (Business Validation)

**Purpose:** Validate business requirements and user workflows

**When to run:** After QA tests pass, before production

```powershell
.\start-uat-testing.ps1
```

**What it tests:**

- ✅ Complete user journeys (registration → certificate)
- ✅ Real-world scenarios
- ✅ Business acceptance criteria
- ✅ End-to-end workflows
- ✅ Stakeholder requirements

**Expected result:**

```
✓ Total Scenarios: 19
✗ Total Failed: 0
📊 Success Rate: 100%
🎉 System ready for production!
```

---

## 🔍 Verify Environment

Before running tests, verify your environment:

```bash
node scripts/verify-test-environment.js
```

**Checks:**

- ✅ All test files exist
- ✅ Dependencies installed
- ✅ Mock server ready
- ✅ Port 3000 available
- ✅ Test modules load correctly

---

## 📋 Manual Testing Steps

If you prefer manual control:

### Step 1: Start Mock API Server

```bash
# Terminal 1
node test/mock-api-server.js
```

### Step 2: Run QA Tests

```bash
# Terminal 2
node scripts/run-qa-tests.js
# OR direct execution
node test/comprehensive-qa-test.js
```

### Step 3: Run UAT Tests

```bash
# Terminal 3
node scripts/run-uat-tests.js
# OR direct execution
node test/uat-test-suite.js
```

---

## 📊 Test Results Format

### QA Testing Results

```
🧪 GACP Platform - Quality Assurance Testing
═══════════════════════════════════════════════════════════════

👨‍🌾 TEST 1: เกษตรกร (Farmer Role)
────────────────────────────────────────────────────────────────
  ✓ Register New Farmer (145ms)
  ✓ Login as Farmer (89ms)
  ✓ View Farmer Dashboard (45ms)
  ...

📊 FINAL QA/QC TEST REPORT
════════════════════════════════════════════════════════════════
  ✓ Total Passed: 66
  ✗ Total Failed: 0
  📊 Success Rate: 100.0%

🎉 ✅ EXCELLENT! All systems are production ready!
```

### UAT Testing Results

```
🎯 GACP Platform - User Acceptance Testing (UAT)
═══════════════════════════════════════════════════════════════

👨‍🌾 UAT: เกษตรกร (Farmer Role)
────────────────────────────────────────────────────────────────
  ✓ UAT-F-001: เกษตรกรใหม่สมัครสมาชิกและยื่นขอรับรองครั้งแรก
  ✓ UAT-F-002: เกษตรกรอัปโหลดเอกสารและส่งคำขอรับรอง
  ...

📊 UAT FINAL REPORT
═══════════════════════════════════════════════════════════════
  ✓ Total Passed: 19
  ✗ Total Failed: 0
  📊 Success Rate: 100.0%

🎉 ✅ UAT PASSED! System ready for production!
```

---

## 🎨 Tested Features

### เกษตรกร (Farmer)

**QA Tests:**

- Registration & Login
- Farm Management (CRUD)
- GACP Application
- Document Upload
- Survey System (Standalone)
- Standards Comparison (Standalone)

**UAT Scenarios:**

- Complete registration journey
- Application submission workflow
- Document upload and tracking
- Survey and standards comparison

---

### พนักงานตรวจเอกสาร (Document Reviewer)

**QA Tests:**

- Document review workflow
- Approve/Reject documents
- Review reports
- Reverse operations

**UAT Scenarios:**

- Document review process
- Approval and revision requests

---

### พนักงานตรวจสอบฟาร์ม (Inspector)

**QA Tests:**

- Start online inspection
- Record findings
- Upload photos
- GACP compliance check
- Edit findings (Reverse)

**UAT Scenarios:**

- Complete online inspection workflow

---

### พนักงานอนุมัติ (Approver)

**QA Tests:**

- Approve/Reject applications
- Generate certificates
- Revoke certificates (Reverse)

**UAT Scenarios:**

- Final approval and certificate generation

---

### ผู้ดูแลระบบ (Admin)

**QA Tests:**

- User management
- System settings
- Survey templates
- Standards database
- Theme customization
- Data backup

**UAT Scenarios:**

- Complete admin workflow
- Report generation

---

## 🔄 Reverse Testing

QA tests include data integrity checks:

- 🔄 Cancel Application
- 🔄 Delete Farm
- 🔄 Revert Document Approval
- 🔄 Edit Inspection Findings
- 🔄 Reopen Inspection
- 🔄 Reject Application
- 🔄 Revoke Certificate
- 🔄 Deactivate/Activate User
- 🔄 Rollback Settings

---

## 🚨 Troubleshooting

### Port 3000 in use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /F /PID <PID>
```

### Missing dependencies

```bash
# Install dependencies
pnpm add -D axios chalk express cors body-parser uuid -w
```

### Tests fail

```bash
# 1. Verify environment
node scripts/verify-test-environment.js

# 2. Check mock server logs
node test/mock-api-server.js

# 3. Review console output for errors
```

---

## 📁 Files Structure

```
Botanical-Audit-Framework/
├── test/
│   ├── comprehensive-qa-test.js     # QA test suite (66 tests)
│   ├── uat-test-suite.js            # UAT test suite (19 scenarios)
│   └── mock-api-server.js           # Mock API server
├── scripts/
│   ├── run-qa-tests.js              # QA test runner
│   ├── run-uat-tests.js             # UAT test runner
│   └── verify-test-environment.js   # Environment checker
├── docs/
│   ├── QA_TESTING_GUIDE.md          # QA guide (400 lines)
│   ├── QA_TESTING_SUMMARY_REPORT.md # QA report (450 lines)
│   ├── UAT_GUIDE.md                 # UAT guide (600 lines)
│   └── UAT_SUMMARY_REPORT.md        # UAT report (500 lines)
├── start-qa-testing.ps1             # QA quick start
├── start-uat-testing.ps1            # UAT quick start
└── TEST_README.md                   # This file
```

---

## 🎯 Success Criteria

### ✅ System is Production-Ready When:

**QA Tests (Technical):**

- [x] 100% pass rate (66/66 tests)
- [x] All features work correctly
- [x] No critical bugs
- [x] Reverse operations validated

**UAT Tests (Business):**

- [x] 100% pass rate (19/19 scenarios)
- [x] All user journeys complete
- [x] Business requirements met
- [x] Stakeholder acceptance

---

## 🎓 Best Practices

### Before Testing

1. ✅ Verify environment with `verify-test-environment.js`
2. ✅ Review test documentation
3. ✅ Ensure port 3000 is available

### During Testing

1. 🧪 Run QA tests first (technical validation)
2. 🎯 Run UAT tests second (business validation)
3. 📝 Review all test output
4. ⏱️ Check timing information

### After Testing

1. 📊 Analyze results
2. 🐛 Fix any failures
3. 🔄 Re-run failed tests
4. ✅ Get stakeholder sign-off (UAT)

---

## 📞 Support & Next Steps

### If Tests Fail

1. Check console output for errors
2. Run `node scripts/verify-test-environment.js`
3. Read relevant documentation:
   - QA: `docs/QA_TESTING_GUIDE.md`
   - UAT: `docs/UAT_GUIDE.md`
4. Check mock server logs

### After All Tests Pass

1. ✅ Review QA and UAT results
2. ✅ Get stakeholder approval (UAT)
3. ✅ Prepare for production deployment
4. 🚀 Deploy with confidence!

---

## 🎉 Summary

**Complete Testing Infrastructure:**

- ✅ 66 QA automated tests
- ✅ 19 UAT real-world scenarios
- ✅ 85 total test cases
- ✅ 5 user roles covered
- ✅ 10 systems tested
- ✅ Mock API server
- ✅ Comprehensive documentation
- ✅ One-command execution

**Status:** 🎯 **READY FOR TESTING**

---

**Last Updated:** October 21, 2025  
**Version:** 2.0.0 (QA + UAT)  
**Status:** ✅ Complete Testing Infrastructure

---

**Happy Testing! 🎉**
