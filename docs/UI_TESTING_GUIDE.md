# UI Testing Guide - GACP Certification System

**Date**: October 22, 2025  
**Frontend**: Running on http://localhost:3000  
**Status**: ✅ Ready for Testing

---

## 🚀 Quick Start

### 1. Start Frontend

```powershell
cd frontend-nextjs
npm run dev
```

**URL**: http://localhost:3000

### 2. Test Users (Mock Login)

Currently using **mock authentication** (no backend required):

| Role             | Email                 | Password | Access                 |
| ---------------- | --------------------- | -------- | ---------------------- |
| **Farmer**       | farmer@example.com    | any      | Application submission |
| **DTAM Officer** | officer@example.com   | any      | Document review        |
| **Inspector**    | inspector@example.com | any      | Farm inspection        |
| **Admin**        | admin@example.com     | any      | Final approval         |

**Note**: Password validation is mock - any password works!

---

## 📋 Testing Scenarios

### Scenario 1: Farmer Application Flow (4 Pages)

**Login**: farmer@example.com

**Step 1: Dashboard**

- URL: `/farmer/dashboard`
- ✅ Check: Welcome message, Application status, Quick actions
- ✅ Click: "ยื่นใบสมัครใหม่" button

**Step 2: Application Form**

- URL: `/farmer/application/new`
- ✅ Fill Farm Info:
  - Farm Name: "ฟาร์มทดสอบ 1"
  - Size: "10" ไร่
  - Crop Type: Select "Cannabis"
  - Province: "Chiang Mai"
  - Address: "123 ถนนทดสอบ"
- ✅ Fill Farmer Info:
  - Full Name: "สมชาย ทดสอบ"
  - National ID: "1234567890123"
  - Phone: "0812345678"
  - Email: "farmer@example.com"
  - Experience: "5" years
- ✅ Click: "ถัดไป" button
- ✅ Check: Application created + redirected to detail page

**Step 3: View Application**

- URL: `/farmer/application/[id]`
- ✅ Check: Application number, Status chip
- ✅ Check: Workflow progress stepper (8 steps)
- ✅ Check: Farm & Farmer info display
- ✅ Click: "อัปโหลดเอกสาร" button

**Step 4: Upload Documents**

- URL: `/farmer/application/[id]/upload`
- ✅ Check: 5 document upload sections:
  1. บัตรประชาชน (ID Card)
  2. ทะเบียนบ้าน (House Registration)
  3. โฉนดที่ดิน (Land Deed)
  4. แผนที่ฟาร์ม (Farm Map)
  5. ใบอนุญาตใช้น้ำ (Water Permit)
- ✅ Upload Files (Mock):
  - Click "เลือกไฟล์" for each document
  - Mock generates placeholder URL
- ✅ Click: "ยืนยันและส่งเอกสาร" button
- ✅ Check: workflowState = 'PAYMENT_PROCESSING_1'

**Step 5: Payment Page**

- URL: `/farmer/application/[id]/payment`
- ✅ Check: Payment summary (5,000 THB)
- ✅ Check: QR Code display
- ✅ Select: Payment method (Bank Transfer/QR Code/Counter)
- ✅ Upload: Slip (Mock)
- ✅ Click: "ยืนยันการชำระเงิน" button
- ✅ Check: workflowState = 'DOCUMENT_REVIEW'

---

### Scenario 2: Officer Document Review (3 Pages)

**Login**: officer@example.com

**Step 1: Officer Dashboard**

- URL: `/officer/dashboard`
- ✅ Check: 4 Summary Cards (Pending, Reviewed, Approval Rate, Avg Time)
- ✅ Check: Today's Tasks list (priority indicators)
- ✅ Check: Statistics panel (progress bars)
- ✅ Click: Application row or "ดูทั้งหมด"

**Step 2: Applications List**

- URL: `/officer/applications`
- ✅ Test Search:
  - Enter application number
  - Enter farmer name
  - Enter farm name
  - Check case-insensitive filtering
- ✅ Test Filters:
  - All Applications
  - Payment Processing 1
  - Document Review
  - Document Revision
- ✅ Check Table:
  - 8 columns display
  - Priority badges (High/Medium/Low)
  - Days waiting counter
  - Status chips
- ✅ Test Pagination:
  - Change rows per page (5/10/25/50)
  - Navigate pages
  - Thai labels
- ✅ Click: Application row → Review page

**Step 3: Review Page** ⭐ **Most Complex**

- URL: `/officer/applications/[id]/review`
- ✅ Check Left Column:
  - Farm info (all fields)
  - Farmer info (all fields)
- ✅ Check Right Column:
  - 5 Documents list
  - View/Download buttons (mock)
- ✅ Test Document Review:
  - Click "อนุมัติ" (Approve) for each document
  - Check green status chip appears
  - Try clicking "ปฏิเสธ" (Reject) for one document
  - Check red status chip + notes field appears
  - Enter rejection notes
- ✅ Fill Review Form:
  - Completeness: Select 4 stars
  - Accuracy: Select 5 stars
  - Risk Assessment: Select "Low"
  - Comments: Enter review notes
- ✅ Test Decision Buttons:
  - **Approve All** (enabled when all 5 docs approved):
    - Click button
    - Check confirmation dialog
    - Confirm
    - Check workflowState = 'DOCUMENT_APPROVED'
    - Check currentStep = 4
  - **Request Revision** (enabled when ≥1 doc rejected):
    - Reject one document first
    - Click button
    - Check confirmation dialog
    - Confirm
    - Check workflowState = 'DOCUMENT_REVISION'
  - **Reject Application** (always enabled):
    - Click button
    - Check confirmation warning
    - Confirm
    - Check workflowState = 'DOCUMENT_REJECTED'
- ✅ Navigate: Back to dashboard

---

### Scenario 3: Inspector Farm Inspection (4 Pages)

**Login**: inspector@example.com

**Prepare**: Set one application to `workflowState = 'INSPECTION_SCHEDULED'`

**Step 1: Inspector Dashboard**

- URL: `/inspector/dashboard`
- ✅ Check: 4 Summary Cards (Upcoming, Completed, Avg Score, Active)
- ✅ Check: Today's Schedule (priority: Today/Tomorrow)
- ✅ Check: Type chips (VDO Call/On-Site)
- ✅ Check: Statistics panel (Score, Pass Rate, Inspection Types)
- ✅ Check: Help section (inspector duties)
- ✅ Click: Inspection row or "ดูตารางงาน"

**Step 2: Schedule Page**

- URL: `/inspector/schedule`
- ✅ Test Filters:
  - All Inspections
  - VDO Call Only
  - On-Site Only
  - Check counts update
- ✅ Check Inspection Cards:
  - Farm name, type, status
  - Farmer, application number
  - Date/time (Thai format with weekday)
  - Address (for on-site)
  - Today indicator (blue border)
- ✅ Test Actions:
  - **Pending** status:
    - Click "ยอมรับ" (Accept) → status = accepted
    - Click "เลื่อนนัด" (Reschedule) → open dialog
      - Select new date
      - Select new time
      - Confirm
      - Check updated scheduledDate/Time
  - **Accepted** status:
    - Click "เริ่มตรวจ" → navigate to inspection page
- ✅ Check Alert: Pending count warning

**Step 3: VDO Call Inspection**

- URL: `/inspector/inspections/[id]/vdo-call`
- ✅ Check Left Column:
  - Application details (farm + farmer)
- ✅ Check Right Column:
  - 8-item checklist
  - Photo upload section
  - Notes field
  - Decision radio buttons
- ✅ Test Checklist:
  - Check all 8 items
  - Watch completion indicator update (8/8 - 100%)
  - Uncheck some items
  - Check warning if <6 items
- ✅ Test Photo Upload:
  - Click "อัปโหลดรูปภาพ" (mock)
  - Check placeholder image appears in grid
  - Upload 2-3 photos
  - Check warning if <3 photos
- ✅ Fill Notes:
  - Enter observations
- ✅ Test Decision:
  - **Option 1: Sufficient** (เพียงพอ):
    - Select radio button
    - Check green icon
    - Click "ส่งรายงาน"
    - Check confirmation dialog shows impact
    - Confirm
    - Check workflowState = 'INSPECTION_COMPLETED'
    - Check currentStep = 7 (Skip on-site)
  - **Option 2: Need On-Site** (ต้องลงพื้นที่):
    - Select radio button
    - Check purple icon
    - Click "ส่งรายงาน"
    - Confirm
    - Check workflowState = 'INSPECTION_ON_SITE'
    - Check currentStep = 6

**Step 4: On-Site Inspection** ⭐ **Most Complex**

- URL: `/inspector/inspections/[id]/on-site`
- ✅ Check Left Sidebar (Sticky):
  - Total score display (large number X/100)
  - Progress bar (color-coded)
  - Pass/Fail status badge
  - 8 CCP mini progress bars
  - Farm info
- ✅ Check Right Column:
  - 8 CCPs accordions
- ✅ Test Scoring (Each CCP):
  1. **CCP 1: Seed/Planting Material Quality** (15 pts):
     - Expand accordion
     - Read description
     - Move slider to 12
     - Check score updates
     - Enter notes: "พันธุ์ดี มาจากแหล่งที่เชื่อถือได้"
     - Upload 2 photos (mock)
     - Check mini progress bar updates
  2. **CCP 2: Soil Management & Fertilizer** (15 pts):
     - Score: 14
     - Notes: "มีการวิเคราะห์ดิน ใช้ปุ๋ยอินทรีย์"
     - Photos: 3
  3. **CCP 3: Pest & Disease Management** (15 pts):
     - Score: 13
     - Notes: "ใช้สารเคมีตามมาตรฐาน มีการบันทึก"
     - Photos: 2
  4. **CCP 4: Harvesting Practices** (15 pts):
     - Score: 14
     - Notes: "เครื่องมือสะอาด การขนย้ายดี"
     - Photos: 3
  5. **CCP 5: Post-Harvest Handling** (15 pts):
     - Score: 13
     - Notes: "การคัดแยกดี มีการอบแห้ง"
     - Photos: 2
  6. **CCP 6: Storage & Transportation** (10 pts):
     - Score: 8
     - Notes: "คลังสะอาด อุณหภูมิควบคุมดี"
     - Photos: 2
  7. **CCP 7: Record Keeping** (10 pts):
     - Score: 9
     - Notes: "มีปูมบันทึกครบถ้วน"
     - Photos: 1
  8. **CCP 8: Worker Training & Safety** (5 pts):
     - Score: 5
     - Notes: "มีการอบรม มีอุปกรณ์ป้องกัน"
     - Photos: 2

- ✅ Check Total Score Calculation:
  - Auto-sum: 12+14+13+14+13+8+9+5 = **88/100**
  - Check real-time update
  - Check progress bar
  - Check pass status: **Pass** (≥80) ✅ (green badge)
- ✅ Test Different Scores:
  - Lower CCP 1 to 8 → Total = 84 → Still **Pass**
  - Lower to 78 → **Conditional** (yellow badge)
  - Lower to 65 → **Fail** (red badge)

- ✅ Fill Final Notes:
  - "ฟาร์มมีมาตรฐานดี ผ่านทุก CCP ควรรักษาระดับ"

- ✅ Submit Report:
  - Click "ส่งรายงาน" button
  - Check button shows: "ส่งรายงาน - คะแนนรวม 88/100 (Pass)"
  - Check validation: All CCPs have score
  - Check confirmation dialog:
    - Shows total score
    - Shows pass status
    - Lists all 8 CCPs with scores
  - Confirm
  - Check workflowState = 'INSPECTION_COMPLETED'
  - Check currentStep = 7
  - Check inspectionData saved with all CCPs

---

### Scenario 4: Admin Final Approval (3 Pages)

**Login**: admin@example.com

**Prepare**: Set one application to `workflowState = 'PENDING_APPROVAL'` with inspection data

**Step 1: Admin Dashboard**

- URL: `/admin/dashboard`
- ✅ Check System Health Alert:
  - Green: "ระบบทำงานปกติ"
  - Uptime 99.8%
  - Response Time 245ms
- ✅ Check 4 Summary Cards:
  - Total Applications (purple)
  - Pending Approvals (pink) + urgent badge
  - Approval Rate (blue) + percentage
  - Certificates Issued (green)
- ✅ Check Pending Approvals List:
  - Top 5 applications
  - Priority chips (สูง/ปานกลาง/ปกติ)
  - Score chips (⭐ if ≥90)
  - Days waiting
  - Click row → approval page
- ✅ Check Statistics by Step:
  - 8 cards (Step 1-8)
  - Counts per step
- ✅ Check Right Sidebar:
  - Financial Overview (revenue, pending)
  - User Statistics (total, by role)
  - System Performance (processing time, uptime)

**Step 2: Approval Page** ⭐ **Most Important**

- URL: `/admin/applications/[id]/approve`
- ✅ Check Workflow Stepper:
  - 8 steps displayed
  - Current step highlighted
  - Completed steps marked
- ✅ Check Left Column:

  **Application Info**:
  - Farm name, size, crop, farmer
  - Submitted date (Thai format)

  **Document Review (Step 3)**:
  - Completeness stars (X/5)
  - Accuracy stars (X/5)
  - Risk level chip
  - Officer comments

  **Farm Inspection (Step 6)** 🌟:
  - Inspection type chip (VDO Call/On-Site)
  - **If ON_SITE**:
    - Large score alert: 88/100
    - Pass status badge: "ผ่าน (Pass)" ✅
    - **8 CCPs Breakdown** (Accordions):
      - Expand each CCP
      - Check: Score chip (green/yellow/red)
      - Check: Description
      - Check: Notes
      - Check: Photos count
    - Final notes from inspector
  - **If VDO_CALL**:
    - Shows VDO-only completion
    - Score: 85/100

- ✅ Check Right Sidebar:

  **Recommendation Card**:
  - Auto-generated based on score:
    - 88/100 → "แนะนำอนุมัติ" (green)
    - If 92 → "แนะนำอนุมัติเป็นพิเศษ ⭐"
    - If 75 → "พิจารณาอนุมัติแบบมีเงื่อนไข"
    - If 65 → "แนะนำปฏิเสธ"
  - Criteria list (≥80/70/<70)

  **Decision Form**:
  - Test 3 buttons:
    1. ✅ **Approve** (green):
       - Click button (becomes contained)
       - Add notes: "ผ่านทุกเกณฑ์ คะแนนดีมาก"
       - Click "ยืนยันการตัดสินใจ"
       - Check confirmation dialog:
         - Shows decision impact
         - Shows cert generation message
         - Shows application number
         - Shows score 88/100
         - Shows admin notes
       - Confirm
       - Check workflowState = 'APPROVED'
       - Check currentStep = 8
       - Check alert: "อนุมัติเรียบร้อย - ระบบจะออกใบรับรอง GACP"
    2. ❌ **Reject** (red):
       - Click button
       - Add notes: "ไม่ผ่านเกณฑ์ CCP 3"
       - Confirm
       - Check workflowState = 'REJECTED'
       - Check alert: "ปฏิเสธใบสมัคร - แจ้งผลให้เกษตรกร"
    3. ℹ️ **Request More Info** (yellow):
       - Click button
       - Add notes: "ขอเอกสารเพิ่มเติมสำหรับ CCP 7"
       - Confirm
       - Check workflowState = 'PENDING_APPROVAL'
       - Check alert: "ส่งคำขอข้อมูลเพิ่มเติม"

**Step 3: Management Page**

- URL: `/admin/management`
- ✅ **Tab 1: Certificates**:
  - Check Search:
    - Enter cert number
    - Enter farm name
    - Enter farmer name
  - Check Statistics Alert:
    - Total certificates issued
    - Active certificates count
  - Check Table (9 columns):
    - Certificate Number: GACP-2025-0001
    - Application Number
    - Farm Name
    - Farmer Name
    - Score chip (88/100 - green if ≥90)
    - Issue Date (Thai)
    - Expiry Date (1 year)
    - Status chip (ใช้งาน)
    - Actions menu
  - Test Actions:
    - Click 3-dot menu
    - View Certificate (mock alert)
    - Download PDF (mock alert)
    - Revoke Certificate (confirm dialog)
  - Test Pagination:
    - Change rows per page
    - Navigate pages
    - Thai labels

- ✅ **Tab 2: Users**:
  - Check Search:
    - Enter name
    - Enter email
    - Enter role
  - Click "เพิ่มผู้ใช้" button:
    - Dialog opens
    - Fill Name: "ทดสอบ ระบบ"
    - Fill Email: "test@example.com"
    - Select Role: "FARMER"
    - Select Status: "active"
    - Check validation (name + email required)
    - Click "บันทึก"
    - Check user added to table
    - Check alert: "เพิ่มผู้ใช้สำเร็จ"
  - Check Table (6 columns):
    - Name
    - Email
    - Role chip (color-coded by role)
    - Status chip (ใช้งาน/ระงับ)
    - Created Date
    - Actions menu
  - Test Edit User:
    - Click 3-dot menu
    - Click "แก้ไข"
    - Dialog opens with current data
    - Change role to "INSPECTOR"
    - Change status to "inactive"
    - Save
    - Check table updates
    - Check alert: "แก้ไขผู้ใช้สำเร็จ"
  - Test Delete User:
    - Click 3-dot menu
    - Click "ลบ"
    - Confirm dialog appears
    - Confirm
    - Check user removed
    - Check alert: "ลบผู้ใช้สำเร็จ"
  - Test Pagination:
    - Change rows per page
    - Navigate pages

---

## 🔍 Data Flow Testing

### Test Complete Workflow (8 Steps):

1. **Farmer: Submit Application**
   - workflowState: 'DRAFT' → 'PAYMENT_PROCESSING_1'
   - currentStep: 1 → 2

2. **Farmer: Upload Documents**
   - 5 documents uploaded (mock URLs)
   - workflowState: 'PAYMENT_PROCESSING_1' (unchanged)

3. **Farmer: Pay Fee 1**
   - Upload slip (mock)
   - workflowState: 'PAYMENT_PROCESSING_1' → 'DOCUMENT_REVIEW'
   - currentStep: 2 → 3

4. **Officer: Review Documents**
   - Approve all 5 documents
   - reviewData saved (completeness, accuracy, risk, comments)
   - workflowState: 'DOCUMENT_REVIEW' → 'DOCUMENT_APPROVED'
   - currentStep: 3 → 4

5. **System: Document Approved**
   - currentStep: 4 → 5 (auto)
   - workflowState: 'DOCUMENT_APPROVED' → 'PAYMENT_PROCESSING_2'

6. **Farmer: Pay Fee 2**
   - workflowState: 'PAYMENT_PROCESSING_2' → 'INSPECTION_SCHEDULED'
   - currentStep: 5 → 6

7. **Inspector: Accept Inspection**
   - Inspection status: pending → accepted

8. **Inspector: VDO Call**
   - Decision: Need On-Site
   - workflowState: 'INSPECTION_SCHEDULED' → 'INSPECTION_ON_SITE'

9. **Inspector: On-Site (8 CCPs)**
   - Score all 8 CCPs → Total 88/100
   - inspectionData saved (type: ON_SITE, ccps, totalScore, passStatus)
   - workflowState: 'INSPECTION_ON_SITE' → 'INSPECTION_COMPLETED'
   - currentStep: 6 → 7

10. **Admin: Approve**
    - Decision: Approve
    - approvalData saved (decision, notes, approvedAt, approvedBy)
    - workflowState: 'INSPECTION_COMPLETED' → 'APPROVED'
    - currentStep: 7 → 8

11. **System: Issue Certificate**
    - workflowState: 'APPROVED' → 'CERTIFICATE_ISSUED'
    - Certificate visible in admin management page

---

## 🎨 UI/UX Testing

### Responsive Design:

- ✅ Desktop (1920x1080): Full layout
- ✅ Tablet (768x1024): Grid adjusts
- ✅ Mobile (375x667): Stack layout

### Material-UI Components:

- ✅ Cards with gradients
- ✅ Chips (status, priority, role)
- ✅ Progress bars (linear)
- ✅ Tables with pagination
- ✅ Dialogs (confirmation)
- ✅ Forms (TextField, Select, Slider, Rating)
- ✅ Accordions (CCPs)
- ✅ Tabs (management page)
- ✅ Alerts (info, success, warning, error)

### Thai Language:

- ✅ All labels in Thai
- ✅ Thai date format
- ✅ Thai number format (commas)
- ✅ Thai currency (฿)

### Icons:

- ✅ Dashboard icons
- ✅ Status icons (check, cancel, warning)
- ✅ Action icons (edit, delete, download)
- ✅ Navigation icons (back, next)

---

## ⚠️ Known Issues to Test

### All Roles:

1. ❌ **Mock Authentication**:
   - Any password works
   - No real token validation
   - Refresh doesn't lose auth (uses localStorage)

2. ❌ **Mock File Upload**:
   - No actual file upload
   - Generates placeholder URLs
   - No file validation

3. ❌ **Mock Data Persistence**:
   - Uses ApplicationContext (React state)
   - Data lost on page refresh
   - No backend sync

4. ⚠️ **No Real-time Updates**:
   - No WebSocket/polling
   - Manual refresh needed
   - No notifications

### Officer Pages:

1. ❌ Document viewer modal not implemented (View button → mock alert)
2. ❌ Document download not working (Download button → mock alert)
3. ⚠️ No revision limit (should max at 2 revisions)

### Inspector Pages:

1. ❌ Photo upload is mock (no actual file storage)
2. ❌ Calendar integration not working (button exists)
3. ⚠️ Reschedule only updates state (no backend)

### Admin Pages:

1. ❌ Certificate PDF not generated (Download → mock alert)
2. ❌ Certificate viewer not implemented (View → mock alert)
3. ❌ User password management missing
4. ⚠️ System metrics hardcoded (99.8% uptime, etc.)

---

## 🐛 Bug Testing Checklist

### Critical Bugs:

- [ ] Login with invalid credentials → should reject (currently accepts any)
- [ ] Refresh page → lose authentication (expected - no backend)
- [ ] Multiple tabs → auth state not synced
- [ ] Upload same file twice → no duplicate check
- [ ] Submit without required fields → validation works?

### UI Bugs:

- [ ] Long farm names → text overflow?
- [ ] Large numbers → formatting breaks?
- [ ] Empty states → show placeholder?
- [ ] Loading states → spinner appears?
- [ ] Error states → error message shows?

### Data Bugs:

- [ ] Negative numbers in slider → should prevent
- [ ] Decimal in integer fields → should validate
- [ ] Special characters in text → should sanitize
- [ ] Very long text → truncation?
- [ ] Empty arrays → handle gracefully?

---

## 📊 Performance Testing

### Page Load Times:

- [ ] Dashboard: < 2 seconds
- [ ] Tables with 50+ rows: < 3 seconds
- [ ] Form submission: < 1 second
- [ ] Image upload: < 2 seconds

### Memory Usage:

- [ ] Open all pages → check memory leak
- [ ] Navigate back/forth → state cleanup?
- [ ] Upload 100 files → memory spike?

---

## ✅ Test Results Template

Use this template to record test results:

```markdown
## Test Session: [Date]

**Tester**: [Name]
**Duration**: [X minutes]

### Scenario 1: Farmer Flow

- [x] Dashboard loaded successfully
- [x] Form validation works
- [x] Document upload works (mock)
- [x] Payment submission works
- [ ] **BUG**: Found issue with...

### Scenario 2: Officer Review

- [x] Applications list displays
- [x] Search works correctly
- [ ] **BUG**: Pagination issue when...

### Scenario 3: Inspector Inspection

- [x] VDO Call checklist works
- [x] On-Site scoring works
- [x] Total score calculates correctly
- [ ] **BUG**: Photo upload fails when...

### Scenario 4: Admin Approval

- [x] All previous steps display
- [x] 8 CCPs visible in accordions
- [x] Approval workflow works
- [ ] **BUG**: Certificate generation...

### Overall Assessment:

**Pass**: X/Y tests  
**Severity**: Critical/Major/Minor  
**Recommended Actions**:

1. Fix authentication (Phase 5)
2. Implement file upload (Phase 5)
3. Connect backend API (Phase 5)
```

---

## 🚀 Next Steps After UI Testing

1. **Document Bugs**: List all found issues
2. **Prioritize Fixes**: Critical → Major → Minor
3. **Backend Integration** (Phase 5):
   - Real authentication API
   - File upload endpoints
   - Database persistence
   - API endpoints for all workflows
4. **End-to-End Testing** (Phase 6):
   - Automated tests (Playwright/Cypress)
   - API integration tests
   - Load testing
   - Security testing

---

## 📝 Notes

- **Browser**: Chrome/Edge recommended
- **Screen**: 1920x1080 or larger for best experience
- **Mock Data**: Applications reset on page refresh
- **Test Duration**: ~30-45 minutes for full workflow
- **Prerequisites**: Frontend running on localhost:3000

---

**Happy Testing!** 🧪✨

If you find any bugs, document them with:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/OS info
