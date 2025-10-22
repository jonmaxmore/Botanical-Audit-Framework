# 🧪 UI Testing Checklist - Quick Reference

**Date**: October 22, 2025  
**Frontend**: http://localhost:3000  
**Status**: ✅ Ready for Testing

---

## ✅ Quick Testing Checklist

### 📝 Test Users (Mock Login)

| Role | Email | Password | Pages to Test |
|------|-------|----------|---------------|
| 🌾 Farmer | farmer@example.com | any | 4 pages |
| 📋 Officer | officer@example.com | any | 3 pages |
| 🔍 Inspector | inspector@example.com | any | 4 pages |
| 👑 Admin | admin@example.com | any | 3 pages |

---

## 🎯 Scenario 1: Farmer Flow (15-20 min)

### [ ] **Login Page** (`/login`)
- [ ] Login with farmer@example.com works
- [ ] Redirects to farmer dashboard
- [ ] Error shows for invalid credentials (mock)

### [ ] **Dashboard** (`/farmer/dashboard`)
- [ ] Welcome message displays
- [ ] Application status cards show (mock data)
- [ ] "ยื่นใบสมัครใหม่" button visible
- [ ] Quick actions menu works

### [ ] **Application Form** (`/farmer/applications/new`)
- [ ] **Step 1: ข้อมูลฟาร์ม**
  - [ ] Fill farm name: "ฟาร์มทดสอบ 1"
  - [ ] Fill size: "10" ไร่
  - [ ] Select province: "Chiang Mai"
  - [ ] Select crop: "Cannabis"
  - [ ] "ถัดไป" button enabled
  - [ ] Validation shows error if required field empty
  
- [ ] **Step 2: ข้อมูลเกษตรกร**
  - [ ] Fill name: "สมชาย ทดสอบ"
  - [ ] Fill ID: "1234567890123"
  - [ ] Fill phone: "0812345678"
  - [ ] Fill email: "farmer@example.com"
  - [ ] Fill experience: "5" years
  - [ ] "ถัดไป" works
  
- [ ] **Step 3: ยืนยันข้อมูล**
  - [ ] Summary shows all data correctly
  - [ ] Alert shows payment info (5,000 THB)
  - [ ] "บันทึกแบบร่าง" creates draft
  - [ ] "ยื่นคำขอ" submits application

### [ ] **View Application** (`/farmer/applications/[id]`)
- [ ] Application number displays
- [ ] Workflow stepper shows (8 steps)
- [ ] Farm info displays correctly
- [ ] Farmer info displays correctly
- [ ] Status chip shows current state
- [ ] "อัปโหลดเอกสาร" button visible

### [ ] **Upload Documents** (`/farmer/applications/[id]/upload`)
- [ ] 5 document sections visible:
  - [ ] ID Card (บัตรประชาชน)
  - [ ] House Registration (ทะเบียนบ้าน)
  - [ ] Land Deed (โฉนดที่ดิน)
  - [ ] Farm Map (แผนที่ฟาร์ม)
  - [ ] Water Permit (ใบอนุญาตใช้น้ำ)
- [ ] File upload button works (mock)
- [ ] Upload progress shows
- [ ] "ยืนยันและส่งเอกสาร" button enabled
- [ ] Status changes to PAYMENT_PROCESSING_1

### [ ] **Payment** (`/farmer/applications/[id]/payment`)
- [ ] Payment summary shows 5,000 THB
- [ ] QR code displays
- [ ] Payment method selection works
- [ ] Slip upload button works (mock)
- [ ] "ยืนยันการชำระเงิน" submits
- [ ] Status changes to DOCUMENT_REVIEW

**Issues Found**: _______________________________________________

---

## 🎯 Scenario 2: Officer Review (10-15 min)

### [ ] **Officer Dashboard** (`/officer/dashboard`)
- [ ] Login with officer@example.com
- [ ] 4 summary cards display
- [ ] Today's tasks list shows
- [ ] Statistics panel visible
- [ ] Priority badges work (High/Medium/Low)
- [ ] "ดูทั้งหมด" redirects to applications list

### [ ] **Applications List** (`/officer/applications`)
- [ ] Table displays applications
- [ ] Search by application number works
- [ ] Filter by status works (All/Review/Revision)
- [ ] Pagination works (5/10/25/50 rows)
- [ ] Click row navigates to review page
- [ ] Priority legend displays

### [ ] **Review Page** (`/officer/applications/[id]/review`)
- [ ] **Left Column**:
  - [ ] Farm info displays
  - [ ] Farmer info displays
  
- [ ] **Right Column - 5 Documents**:
  - [ ] ID_CARD section shows
  - [ ] HOUSE_REGISTRATION section shows
  - [ ] LAND_DEED section shows
  - [ ] FARM_MAP section shows
  - [ ] WATER_PERMIT section shows
  - [ ] Each has View/Download/Approve/Reject buttons
  - [ ] Notes textarea per document
  
- [ ] **Review Form**:
  - [ ] Completeness rating (1-5 stars) works
  - [ ] Accuracy rating (1-5 stars) works
  - [ ] Risk level (Low/Medium/High) dropdown works
  - [ ] Comments textarea works
  
- [ ] **Decisions**:
  - [ ] "อนุมัติทั้งหมด" button (all docs approved)
    - [ ] Confirmation dialog shows
    - [ ] Changes status to DOCUMENT_APPROVED
    - [ ] currentStep = 4
  - [ ] "ส่งกลับแก้ไข" button (≥1 doc rejected)
    - [ ] Shows if any doc rejected
    - [ ] Changes status to DOCUMENT_REVISION
  - [ ] "ปฏิเสธคำขอ" button
    - [ ] Always available
    - [ ] Changes status to DOCUMENT_REJECTED

**Issues Found**: _______________________________________________

---

## 🎯 Scenario 3: Inspector Inspection (20-25 min)

### [ ] **Inspector Dashboard** (`/inspector/dashboard`)
- [ ] Login with inspector@example.com
- [ ] 4 cards show: Upcoming, Completed, Avg Score, Active
- [ ] Today badge shows on today's inspections
- [ ] Type chips: VDO Call (blue), On-Site (purple)
- [ ] "ดูตารางงาน" button works

### [ ] **Schedule** (`/inspector/schedule`)
- [ ] Filter All/VDO Call/On-Site works
- [ ] Inspection cards display (not table)
- [ ] Each card shows: Farm, Type, Status, Date/Time, Address
- [ ] **Pending inspections**:
  - [ ] "รับงาน" button visible
  - [ ] "นัดหมายใหม่" button visible
  - [ ] Reschedule dialog works (date + time picker)
- [ ] **Accepted inspections**:
  - [ ] "เริ่มตรวจสอบ" button visible
  - [ ] Navigates to VDO Call or On-Site

### [ ] **VDO Call Inspection** (`/inspector/inspections/[id]/vdo-call`)
- [ ] **Left**: Application details display
- [ ] **Right - Checklist**:
  - [ ] 8 checklist items show
  - [ ] Checkboxes work
  - [ ] Photo upload button works (mock)
  - [ ] Photos display in grid
  - [ ] Notes textarea works
  
- [ ] **Decisions**:
  - [ ] "เพียงพอ - ผ่าน" button
    - [ ] Changes to INSPECTION_COMPLETED
    - [ ] currentStep = 7 (skip on-site)
  - [ ] "ต้องตรวจสอบ On-Site" button
    - [ ] Changes to INSPECTION_ON_SITE
    - [ ] currentStep = 6
  
- [ ] **Validation**:
  - [ ] Warning if <6/8 checklist checked
  - [ ] Warning if <3 photos uploaded

### [ ] **On-Site Inspection** (`/inspector/inspections/[id]/on-site`) ⭐
- [ ] **Left Sidebar (Sticky)**:
  - [ ] Total score displays (X/100)
  - [ ] Progress bar shows
  - [ ] Color changes: Green (≥80), Yellow (70-79), Red (<70)
  - [ ] Pass status badge shows
  - [ ] 8 mini progress bars display
  - [ ] Farm info summary shows
  
- [ ] **Right - 8 CCPs (Accordions)**:
  
  **CCP 1: Seed/Planting Material (15 pts)**
  - [ ] Accordion expands/collapses
  - [ ] Slider works (0-15)
  - [ ] Score updates in sidebar (real-time)
  - [ ] Notes textarea works
  - [ ] Photo upload works (mock)
  - [ ] Color changes by percentage
  
  **CCP 2: Soil Management (15 pts)**
  - [ ] Slider: 0-15
  - [ ] Real-time update works
  - [ ] Notes + Photos work
  
  **CCP 3: Pest Management (15 pts)**
  - [ ] Slider: 0-15
  - [ ] All features work
  
  **CCP 4: Harvesting (15 pts)**
  - [ ] Slider: 0-15
  - [ ] All features work
  
  **CCP 5: Post-Harvest (15 pts)**
  - [ ] Slider: 0-15
  - [ ] All features work
  
  **CCP 6: Storage (10 pts)**
  - [ ] Slider: 0-10
  - [ ] All features work
  
  **CCP 7: Record Keeping (10 pts)**
  - [ ] Slider: 0-10
  - [ ] All features work
  
  **CCP 8: Worker Safety (5 pts)**
  - [ ] Slider: 0-5
  - [ ] All features work
  
- [ ] **Score Testing**:
  - [ ] Set all to max → Total = 100
  - [ ] Set to 88 → Pass (green)
  - [ ] Set to 78 → Conditional (yellow)
  - [ ] Set to 65 → Fail (red)
  - [ ] Real-time calculation accurate
  
- [ ] **Final Notes**: Textarea works
- [ ] **Submit Button**: "ส่งรายงาน" works
  - [ ] Changes to INSPECTION_COMPLETED
  - [ ] currentStep = 7
  - [ ] Saves inspectionData with 8 CCPs

**Issues Found**: _______________________________________________

---

## 🎯 Scenario 4: Admin Approval (15-20 min)

### [ ] **Admin Dashboard** (`/admin/dashboard`)
- [ ] Login with admin@example.com
- [ ] **System Health Alert**: Shows uptime, response time
- [ ] **4 Cards**: Total Apps, Pending, Approval Rate, Certs Issued
- [ ] **Pending Approvals List** (top 5):
  - [ ] Priority chips show (สูง/ปานกลาง/ปกติ)
  - [ ] Score chip shows (⭐ if ≥90)
  - [ ] Days waiting shows
  - [ ] Click navigates to approval page
- [ ] **Statistics by Step**: 8 cards for Steps 1-8
- [ ] **Right Sidebar**:
  - [ ] Financial: Revenue, Pending, Monthly
  - [ ] Users: Total, Farmers, Officers, Inspectors
  - [ ] Performance: Avg days, Uptime

### [ ] **Approval Page** (`/admin/applications/[id]/approve`) ⭐
- [ ] **Workflow Stepper**: Shows 8 steps visually
- [ ] **Current Step Highlighted**: Based on currentStep
  
- [ ] **Left Column - Review All Steps**:
  
  **Application Info**
  - [ ] Farm name, size, crop display
  - [ ] Farmer name, ID, phone, email display
  - [ ] Application date shows
  
  **Document Review (Step 3)**
  - [ ] 3 cards show: Completeness, Accuracy, Risk
  - [ ] Star ratings display correctly
  - [ ] Risk chip color-coded
  - [ ] Officer comments show in alert box
  
  **Farm Inspection (Step 6)** 🌟
  - [ ] Type chip shows: VDO_CALL or ON_SITE
  
  **If VDO_CALL**:
  - [ ] Decision shows
  - [ ] Mock score 85 displays
  
  **If ON_SITE**:
  - [ ] Large score alert: X/100
  - [ ] Pass/Conditional/Fail badge shows
  - [ ] **8 CCPs in Accordions**:
    - [ ] Each accordion shows: Name, Score chip
    - [ ] Expand shows: Description, Notes, Photos count
    - [ ] Score color-coded: Green (≥80% max), Yellow (≥60%), Red (<60%)
    - [ ] All 8 CCPs display correctly:
      1. [ ] Seed (X/15)
      2. [ ] Soil (X/15)
      3. [ ] Pest (X/15)
      4. [ ] Harvest (X/15)
      5. [ ] Post-Harvest (X/15)
      6. [ ] Storage (X/10)
      7. [ ] Records (X/10)
      8. [ ] Safety (X/5)
  - [ ] Final notes from inspector show
  
- [ ] **Right Sidebar - Decision Panel**:
  
  **Auto-Recommendation**
  - [ ] Score ≥90: "แนะนำอนุมัติเป็นพิเศษ ⭐" (green)
  - [ ] Score ≥80: "แนะนำอนุมัติ" (green)
  - [ ] Score ≥70: "พิจารณาอนุมัติแบบมีเงื่อนไข" (yellow)
  - [ ] Score <70: "แนะนำปฏิเสธ" (red)
  - [ ] Criteria list displays
  
  **Decision Form**
  - [ ] Notes textarea works
  - [ ] **3 Decision Buttons**:
    
    1. [ ] "✅ อนุมัติ" (Approve)
       - [ ] Confirmation dialog shows
       - [ ] Summary displays
       - [ ] Changes to APPROVED
       - [ ] currentStep = 8
    
    2. [ ] "❌ ปฏิเสธ" (Reject)
       - [ ] Confirmation dialog shows
       - [ ] Reason required
       - [ ] Changes to REJECTED
       - [ ] currentStep = 7
    
    3. [ ] "ℹ️ ขอข้อมูลเพิ่มเติม" (Request Info)
       - [ ] Confirmation dialog shows
       - [ ] Info request field shows
       - [ ] Changes to PENDING_APPROVAL
       - [ ] currentStep = 7

### [ ] **Management Page** (`/admin/management`)

**Tab 1: Certificates** 📜
- [ ] Tab switches correctly
- [ ] Search works (cert number, farm, farmer)
- [ ] Stats alert shows: Total, active count
- [ ] **Table (9 columns)**:
  - [ ] Cert Number (GACP-2025-XXXX)
  - [ ] App Number
  - [ ] Farm
  - [ ] Farmer
  - [ ] Score chip (color-coded)
  - [ ] Issue Date
  - [ ] Expiry Date (1 year)
  - [ ] Status
  - [ ] Actions menu
- [ ] Actions menu works: View, Download PDF, Revoke
- [ ] Pagination works (5/10/25/50)

**Tab 2: Users** 👥
- [ ] Tab switches correctly
- [ ] Search works (name, email, role)
- [ ] "เพิ่มผู้ใช้" button visible
- [ ] Stats alert shows: Total, farmers, officers
- [ ] **Table (6 columns)**:
  - [ ] Name
  - [ ] Email
  - [ ] Role chip (FARMER/DTAM_OFFICER/INSPECTOR/ADMIN)
  - [ ] Status
  - [ ] Created Date
  - [ ] Actions menu
- [ ] Actions menu works: Edit, Delete
  
**Add/Edit Dialog**
- [ ] Dialog opens on "เพิ่มผู้ใช้"
- [ ] Name field works
- [ ] Email field works
- [ ] Role dropdown works (4 options)
- [ ] Status dropdown works
- [ ] Validation: name + email required
- [ ] "บันทึก" saves (mock)
- [ ] "ยกเลิก" closes

**Mock Users (5 users)**
- [ ] สมชาย ใจดี - FARMER
- [ ] สมหญิง รักษ์ดี - FARMER
- [ ] วิชัย ตรวจสอบ - DTAM_OFFICER
- [ ] สุดา ลงพื้นที่ - INSPECTOR
- [ ] ผู้จัดการ ระบบ - ADMIN

**Delete Confirmation**
- [ ] Dialog shows on delete
- [ ] "ยืนยัน" deletes (mock)
- [ ] "ยกเลิก" closes

**Issues Found**: _______________________________________________

---

## 🐛 Known Issues Testing

### Critical Issues
- [ ] **Data persistence**: Refresh page → Data lost (ApplicationContext only)
- [ ] **Mock file upload**: Files don't save to storage
- [ ] **Mock authentication**: Any password works
- [ ] **Duplicate prevention**: Can create duplicate applications

### UI Issues
- [ ] **Document viewer**: Not implemented (View button doesn't work)
- [ ] **Certificate PDF**: Not generated (Download shows placeholder)
- [ ] **Real-time updates**: No Socket.IO connection
- [ ] **Text overflow**: Long text doesn't truncate
- [ ] **Mobile responsive**: Some pages break on mobile
- [ ] **Empty states**: No "No data" message

### Data Issues
- [ ] **Validation**: Can submit negative numbers
- [ ] **ID validation**: Accepts invalid National ID format
- [ ] **Email validation**: Accepts invalid emails
- [ ] **Phone validation**: Accepts non-Thai phone numbers
- [ ] **Date validation**: Can select past dates for future events

---

## 📊 Test Results Summary

**Date**: _______________  
**Tester**: _______________  
**Duration**: _______________ minutes

### Overall Results

| Scenario | Total Tests | Passed | Failed | Issues |
|----------|-------------|--------|--------|--------|
| 1. Farmer Flow | ___ | ___ | ___ | ___ |
| 2. Officer Review | ___ | ___ | ___ | ___ |
| 3. Inspector Inspection | ___ | ___ | ___ | ___ |
| 4. Admin Approval | ___ | ___ | ___ | ___ |
| **Total** | **___** | **___** | **___** | **___** |

### Priority Bugs Found

**🔴 Critical** (blocks workflow):
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**🟡 Medium** (impacts UX):
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**🟢 Low** (minor issues):
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Browser Compatibility

- [ ] Chrome (version: _____) - Status: _______________
- [ ] Firefox (version: _____) - Status: _______________
- [ ] Edge (version: _____) - Status: _______________
- [ ] Safari (version: _____) - Status: _______________

### Screen Sizes Tested

- [ ] Desktop (1920x1080) - Status: _______________
- [ ] Laptop (1366x768) - Status: _______________
- [ ] Tablet (768x1024) - Status: _______________
- [ ] Mobile (375x667) - Status: _______________

### Recommendations

**High Priority** (fix before Phase 5):
1. _______________________________________________
2. _______________________________________________

**Medium Priority** (fix in Phase 5):
1. _______________________________________________
2. _______________________________________________

**Low Priority** (fix later):
1. _______________________________________________
2. _______________________________________________

---

## 📝 Notes

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

**Testing Complete**: [ ] Yes [ ] No  
**Ready for Phase 5**: [ ] Yes [ ] No  
**Signature**: _______________
