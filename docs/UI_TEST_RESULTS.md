# 🧪 UI Test Results - Session 1

**Date**: October 22, 2025  
**Tester**: [Your Name]  
**Frontend**: http://localhost:3000  
**Status**: ✅ Ready

---

## 🎯 Scenario 1: Farmer Flow

**Duration**: _____ minutes

### Login Page
- [ ] ✅ Login works with farmer@example.com
- [ ] ✅ Redirects to dashboard
- [ ] ⚠️ Error shows for invalid credentials
- **Issues**: _______________________

### Dashboard
- [ ] ✅ Welcome message displays
- [ ] ✅ Application cards show
- [ ] ✅ "ยื่นใบสมัครใหม่" button works
- **Issues**: _______________________

### Application Form (Wizard)

**Step 1: Farm Info**
- [ ] ✅ Form fields work
- [ ] ✅ Validation shows errors
- [ ] ✅ "ถัดไป" enabled
- **Issues**: _______________________

**Step 2: Farmer Info**
- [ ] ✅ All fields work
- [ ] ✅ Validation works
- [ ] ✅ "ถัดไป" works
- **Issues**: _______________________

**Step 3: Confirmation**
- [ ] ✅ Summary displays correctly
- [ ] ✅ "บันทึกแบบร่าง" creates draft
- [ ] ✅ "ยื่นคำขอ" submits
- **Issues**: _______________________

### View Application
- [ ] ✅ Application number shows
- [ ] ✅ Workflow stepper (8 steps) displays
- [ ] ✅ Farm + Farmer info correct
- [ ] ✅ Status chip shows
- **Issues**: _______________________

### Upload Documents
- [ ] ✅ 5 document sections visible
- [ ] ⚠️ File upload works (MOCK - no real file)
- [ ] ✅ Progress shows
- [ ] ✅ "ยืนยันและส่งเอกสาร" works
- [ ] ✅ Status changes to PAYMENT_PROCESSING_1
- **Issues**: _______________________

### Payment
- [ ] ✅ Payment summary 5,000 THB
- [ ] ✅ QR code displays
- [ ] ⚠️ Slip upload works (MOCK)
- [ ] ✅ "ยืนยันการชำระเงิน" works
- [ ] ✅ Status → DOCUMENT_REVIEW
- **Issues**: _______________________

**Scenario 1 Result**: ✅ Pass / ❌ Fail  
**Total Tests**: ___ | **Passed**: ___ | **Failed**: ___

---

## 🎯 Scenario 2: Officer Review

**Duration**: _____ minutes

### Dashboard
- [ ] ✅ Login with officer@example.com
- [ ] ✅ 4 cards display
- [ ] ✅ Today's tasks list
- [ ] ✅ Statistics panel
- **Issues**: _______________________

### Applications List
- [ ] ✅ Table displays
- [ ] ✅ Search works
- [ ] ✅ Filter by status works
- [ ] ✅ Pagination works
- [ ] ✅ Click row navigates
- **Issues**: _______________________

### Review Page

**Document Review (5 Documents)**
- [ ] ✅ ID_CARD section shows
- [ ] ✅ HOUSE_REGISTRATION shows
- [ ] ✅ LAND_DEED shows
- [ ] ✅ FARM_MAP shows
- [ ] ✅ WATER_PERMIT shows
- [ ] ⚠️ View button works (MOCK - no real viewer)
- [ ] ✅ Approve/Reject per document
- [ ] ✅ Notes textarea works
- **Issues**: _______________________

**Review Form**
- [ ] ✅ Completeness rating (stars)
- [ ] ✅ Accuracy rating (stars)
- [ ] ✅ Risk level dropdown
- [ ] ✅ Comments textarea
- **Issues**: _______________________

**Decision Buttons**
- [ ] ✅ "อนุมัติทั้งหมด" (all approved)
  - [ ] ✅ Confirmation dialog
  - [ ] ✅ Status → DOCUMENT_APPROVED
  - [ ] ✅ currentStep → 4
- [ ] ✅ "ส่งกลับแก้ไข" (≥1 rejected)
  - [ ] ✅ Shows when doc rejected
  - [ ] ✅ Status → DOCUMENT_REVISION
- [ ] ✅ "ปฏิเสธคำขอ" (always available)
  - [ ] ✅ Status → DOCUMENT_REJECTED
- **Issues**: _______________________

**Scenario 2 Result**: ✅ Pass / ❌ Fail  
**Total Tests**: ___ | **Passed**: ___ | **Failed**: ___

---

## 🎯 Scenario 3: Inspector Inspection

**Duration**: _____ minutes

### Dashboard
- [ ] ✅ Login with inspector@example.com
- [ ] ✅ 4 summary cards
- [ ] ✅ Today badge on cards
- [ ] ✅ Type chips (VDO/On-Site)
- **Issues**: _______________________

### Schedule Page
- [ ] ✅ Filter All/VDO/On-Site
- [ ] ✅ Cards display (not table)
- [ ] ✅ "รับงาน" button
- [ ] ✅ "นัดหมายใหม่" + dialog
- [ ] ✅ "เริ่มตรวจสอบ" navigates
- **Issues**: _______________________

### VDO Call Inspection
- [ ] ✅ Application details (left)
- [ ] ✅ 8 checklist items
- [ ] ⚠️ Photo upload (MOCK)
- [ ] ✅ Photos display in grid
- [ ] ✅ Notes textarea
- **Decisions**:
  - [ ] ✅ "เพียงพอ - ผ่าน" → COMPLETED (Step 7)
  - [ ] ✅ "ต้อง On-Site" → ON_SITE (Step 6)
- **Validation**:
  - [ ] ✅ Warning <6/8 checked
  - [ ] ✅ Warning <3 photos
- **Issues**: _______________________

### On-Site Inspection ⭐ (CRITICAL TEST)

**Left Sidebar (Sticky)**
- [ ] ✅ Total score displays
- [ ] ✅ Progress bar
- [ ] ✅ Color changes:
  - [ ] Green (≥80)
  - [ ] Yellow (70-79)
  - [ ] Red (<70)
- [ ] ✅ Pass status badge
- [ ] ✅ 8 mini progress bars
- **Issues**: _______________________

**8 CCPs - Real-time Scoring Test**

| CCP | Max Points | Slider Works | Real-time Update | Notes | Photos | Result |
|-----|-----------|--------------|------------------|-------|--------|--------|
| 1. Seed | 15 | [ ] | [ ] | [ ] | [ ] | ✅/❌ |
| 2. Soil | 15 | [ ] | [ ] | [ ] | [ ] | ✅/❌ |
| 3. Pest | 15 | [ ] | [ ] | [ ] | [ ] | ✅/❌ |
| 4. Harvest | 15 | [ ] | [ ] | [ ] | [ ] | ✅/❌ |
| 5. Post-Harvest | 15 | [ ] | [ ] | [ ] | [ ] | ✅/❌ |
| 6. Storage | 10 | [ ] | [ ] | [ ] | [ ] | ✅/❌ |
| 7. Records | 10 | [ ] | [ ] | [ ] | [ ] | ✅/❌ |
| 8. Safety | 5 | [ ] | [ ] | [ ] | [ ] | ✅/❌ |

**Score Calculation Test**
- [ ] Set all max → Total = 100 ✅/❌
- [ ] Set to 88 → Green (Pass) ✅/❌
- [ ] Set to 78 → Yellow (Conditional) ✅/❌
- [ ] Set to 65 → Red (Fail) ✅/❌
- [ ] Real-time accurate ✅/❌

**Submit**
- [ ] ✅ "ส่งรายงาน" button
- [ ] ✅ Status → INSPECTION_COMPLETED
- [ ] ✅ currentStep → 7
- **Issues**: _______________________

**Scenario 3 Result**: ✅ Pass / ❌ Fail  
**Total Tests**: ___ | **Passed**: ___ | **Failed**: ___

---

## 🎯 Scenario 4: Admin Approval

**Duration**: _____ minutes

### Dashboard
- [ ] ✅ Login with admin@example.com
- [ ] ✅ System health alert
- [ ] ✅ 4 summary cards
- [ ] ✅ Pending approvals list (top 5)
  - [ ] Priority chips
  - [ ] Score chip
  - [ ] Days waiting
- [ ] ✅ Statistics by step (8 cards)
- [ ] ✅ Right sidebar:
  - [ ] Financial stats
  - [ ] User counts
  - [ ] Performance metrics
- **Issues**: _______________________

### Approval Page ⭐

**Workflow Stepper**
- [ ] ✅ 8 steps display
- [ ] ✅ Current step highlighted
- **Issues**: _______________________

**Left Column - Review**

**Application Info**
- [ ] ✅ Farm info displays
- [ ] ✅ Farmer info displays
- **Issues**: _______________________

**Document Review (Step 3)**
- [ ] ✅ 3 cards: Completeness, Accuracy, Risk
- [ ] ✅ Star ratings correct
- [ ] ✅ Risk chip color-coded
- [ ] ✅ Officer comments show
- **Issues**: _______________________

**Farm Inspection (Step 6)** 🌟

**If VDO_CALL**:
- [ ] ✅ Type chip shows
- [ ] ✅ Decision displays
- [ ] ✅ Mock score 85
- **Issues**: _______________________

**If ON_SITE**:
- [ ] ✅ Large score alert X/100
- [ ] ✅ Pass/Conditional/Fail badge
- **8 CCPs in Accordions**:
  - [ ] ✅ Accordion expand/collapse
  - [ ] ✅ Score chips color-coded
  - [ ] ✅ All 8 CCPs display:
    - [ ] 1. Seed (X/15)
    - [ ] 2. Soil (X/15)
    - [ ] 3. Pest (X/15)
    - [ ] 4. Harvest (X/15)
    - [ ] 5. Post-Harvest (X/15)
    - [ ] 6. Storage (X/10)
    - [ ] 7. Records (X/10)
    - [ ] 8. Safety (X/5)
  - [ ] ✅ Notes + Photos count per CCP
- [ ] ✅ Final notes from inspector
- **Issues**: _______________________

**Right Sidebar - Decision**

**Auto-Recommendation**
- [ ] ✅ Score ≥90: "อนุมัติเป็นพิเศษ ⭐" (green)
- [ ] ✅ Score ≥80: "อนุมัติ" (green)
- [ ] ✅ Score ≥70: "มีเงื่อนไข" (yellow)
- [ ] ✅ Score <70: "ปฏิเสธ" (red)
- [ ] ✅ Criteria list
- **Issues**: _______________________

**Decision Form**
- [ ] ✅ Notes textarea
- [ ] ✅ "✅ อนุมัติ" button
  - [ ] Confirmation dialog
  - [ ] Status → APPROVED
  - [ ] currentStep → 8
- [ ] ✅ "❌ ปฏิเสธ" button
  - [ ] Confirmation dialog
  - [ ] Reason required
  - [ ] Status → REJECTED
- [ ] ✅ "ℹ️ ขอข้อมูลเพิ่มเติม" button
  - [ ] Info request field
  - [ ] Status → PENDING_APPROVAL
- **Issues**: _______________________

### Management Page

**Tab 1: Certificates**
- [ ] ✅ Tab switches
- [ ] ✅ Search works
- [ ] ✅ Table 9 columns display
- [ ] ✅ Cert number format
- [ ] ✅ Score chip color
- [ ] ✅ Actions menu: View/Download/Revoke
- [ ] ⚠️ Download PDF (MOCK - placeholder)
- [ ] ✅ Pagination works
- **Issues**: _______________________

**Tab 2: Users**
- [ ] ✅ Tab switches
- [ ] ✅ Search works
- [ ] ✅ "เพิ่มผู้ใช้" button
- [ ] ✅ Table 6 columns
- [ ] ✅ Role chips (4 types)
- [ ] ✅ Actions: Edit/Delete
- **Issues**: _______________________

**Add/Edit Dialog**
- [ ] ✅ Dialog opens
- [ ] ✅ Name field
- [ ] ✅ Email field
- [ ] ✅ Role dropdown (4 options)
- [ ] ✅ Status dropdown
- [ ] ✅ Validation: name + email required
- [ ] ✅ "บันทึก" saves (mock)
- [ ] ✅ "ยกเลิก" closes
- **Issues**: _______________________

**Mock Users (5 users)**
- [ ] ✅ สมชาย ใจดี - FARMER
- [ ] ✅ สมหญิง รักษ์ดี - FARMER
- [ ] ✅ วิชัย ตรวจสอบ - DTAM_OFFICER
- [ ] ✅ สุดา ลงพื้นที่ - INSPECTOR
- [ ] ✅ ผู้จัดการ ระบบ - ADMIN
- **Issues**: _______________________

**Delete Confirmation**
- [ ] ✅ Dialog shows
- [ ] ✅ "ยืนยัน" deletes (mock)
- [ ] ✅ "ยกเลิก" closes
- **Issues**: _______________________

**Scenario 4 Result**: ✅ Pass / ❌ Fail  
**Total Tests**: ___ | **Passed**: ___ | **Failed**: ___

---

## 🐛 Known Issues Verification

### Critical Issues (จาก Guide)
- [ ] ❌ **Data หายหลัง refresh**
  - Test: Create application → F5 → Check if data persists
  - Result: ✅ Fixed / ❌ Still broken / ⚠️ Partial
  - Notes: _______________________

- [ ] ❌ **Mock file upload (ไม่มีไฟล์จริง)**
  - Test: Upload file → Check if saved to storage
  - Result: ⚠️ Expected (Mock) / ❌ Broken
  - Notes: _______________________

- [ ] ❌ **Mock authentication (no backend)**
  - Test: Login with wrong password → Should fail
  - Result: ⚠️ Expected (Mock accepts any) / ❌ Security issue
  - Notes: _______________________

### UI Issues
- [ ] ⚠️ **Document viewer ยังไม่ทำ**
  - Test: Click "View" on document → Should open viewer
  - Result: ❌ Not implemented / ⚠️ Shows placeholder
  - Notes: _______________________

- [ ] ⚠️ **Certificate PDF ยังไม่ generate**
  - Test: Click "Download PDF" → Should download
  - Result: ❌ Not implemented / ⚠️ Shows placeholder
  - Notes: _______________________

- [ ] ⚠️ **No real-time updates**
  - Test: Open 2 tabs → Update in one → Check other
  - Result: ❌ Not synced (Expected - no Socket.IO)
  - Notes: _______________________

### Additional Issues Found

**🔴 Critical**:
1. _______________________
2. _______________________
3. _______________________

**🟡 Medium**:
1. _______________________
2. _______________________
3. _______________________

**🟢 Low**:
1. _______________________
2. _______________________
3. _______________________

---

## 📊 Overall Summary

**Testing Date**: October 22, 2025  
**Total Duration**: _____ minutes  
**Browser**: Chrome / Firefox / Edge / Safari (version: _____)  
**Screen**: Desktop / Laptop / Tablet / Mobile (resolution: _______)

### Results

| Scenario | Total Tests | Passed | Failed | Pass Rate |
|----------|-------------|--------|--------|-----------|
| 1. Farmer Flow | ___ | ___ | ___ | ___% |
| 2. Officer Review | ___ | ___ | ___ | ___% |
| 3. Inspector Inspection | ___ | ___ | ___ | ___% |
| 4. Admin Approval | ___ | ___ | ___ | ___% |
| **Overall** | **___** | **___** | **___** | **___%** |

### Critical Findings

**Must Fix Before Phase 5**:
1. _______________________
2. _______________________
3. _______________________

**Should Fix in Phase 5**:
1. _______________________
2. _______________________
3. _______________________

**Can Fix Later**:
1. _______________________
2. _______________________

### Recommendations

**High Priority**:
- [ ] _______________________
- [ ] _______________________

**Medium Priority**:
- [ ] _______________________
- [ ] _______________________

**Low Priority**:
- [ ] _______________________
- [ ] _______________________

### Next Steps

1. [ ] Fix critical bugs
2. [ ] Connect Backend API (Phase 5A)
3. [ ] Replace Mock Data with real API calls (Phase 5B)
4. [ ] Implement Document Viewer
5. [ ] Implement Certificate PDF Generator
6. [ ] Add Socket.IO for real-time updates

---

## 📝 Additional Notes

_______________________
_______________________
_______________________
_______________________
_______________________

---

**Testing Complete**: [ ] Yes [ ] No  
**Ready for Backend Integration**: [ ] Yes [ ] No  
**Tester Signature**: _______________  
**Date**: _______________
