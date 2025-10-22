# 🔥 Quick Smoke Test Checklist

**Duration**: 10-15 minutes  
**Purpose**: Quick verification that all pages load without errors

---

## 🚀 Pre-Test Setup

```powershell
# Start Frontend
cd frontend-nextjs
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

---

## ✅ Smoke Test Steps

### 1. Landing & Auth (3 minutes)

- [ ] **Landing Page** (/)
  - [ ] Loads without errors
  - [ ] Logo displays
  - [ ] "เข้าสู่ระบบ" button works → redirects to /login
  
- [ ] **Login Page** (/login)
  - [ ] Email input works
  - [ ] Password input works
  - [ ] "เข้าสู่ระบบ" button enabled
  - [ ] Login with `farmer@example.com` redirects to dashboard

---

### 2. Farmer Pages (4 minutes)

**Login as**: `farmer@example.com`

- [ ] **/farmer/dashboard** - Loads, shows cards
- [ ] **/farmer/applications/new** - Form displays
  - [ ] Click "ถัดไป" → Step 2 shows
  - [ ] Click "ถัดไป" → Step 3 shows
  - [ ] Click "บันทึกแบบร่าง" → Success message
- [ ] **/farmer/applications/app-001** - Application details show
- [ ] **/farmer/applications/app-001/upload** - 5 upload sections display
- [ ] **/farmer/applications/app-001/payment** - QR code shows

**Result**: ✅ All Load / ❌ Errors: _____________

---

### 3. Officer Pages (2 minutes)

**Login as**: `officer@example.com`

- [ ] **/officer/dashboard** - Cards + tasks list show
- [ ] **/officer/applications** - Table loads
- [ ] **/officer/applications/app-001/review** - 5 documents show
  - [ ] Click "อนุมัติ" on ID_CARD → Status changes to Approved

**Result**: ✅ All Load / ❌ Errors: _____________

---

### 4. Inspector Pages (3 minutes)

**Login as**: `inspector@example.com`

- [ ] **/inspector/dashboard** - 4 cards show
- [ ] **/inspector/schedule** - Inspection cards display
- [ ] **/inspector/inspections/ins-001/vdo-call** - Checklist shows
- [ ] **/inspector/inspections/ins-002/on-site** - 8 CCPs show
  - [ ] Move CCP 1 slider → Sidebar score updates (real-time)
  - [ ] Move all sliders to max → Total = 100

**Result**: ✅ All Load / ❌ Errors: _____________

---

### 5. Admin Pages (3 minutes)

**Login as**: `admin@example.com`

- [ ] **/admin/dashboard** - All widgets show
- [ ] **/admin/applications/app-001/approve** - Workflow stepper + review sections
  - [ ] 8-step stepper displays
  - [ ] Inspection section shows 8 CCPs (if ON_SITE)
  - [ ] Decision panel shows auto-recommendation
- [ ] **/admin/management** - Tab 1: Certificates table
  - [ ] Click Tab 2 → Users table shows
  - [ ] Click "เพิ่มผู้ใช้" → Dialog opens

**Result**: ✅ All Load / ❌ Errors: _____________

---

## 📊 Quick Results

| Role | Pages Tested | Pass | Fail | Issues |
|------|-------------|------|------|--------|
| Farmer | 6 | ___ | ___ | _______ |
| Officer | 3 | ___ | ___ | _______ |
| Inspector | 4 | ___ | ___ | _______ |
| Admin | 3 | ___ | ___ | _______ |
| **Total** | **16** | **___** | **___** | **_______** |

**Overall Status**: ✅ PASS / ❌ FAIL  
**Critical Issues**: _______________________  
**Ready for Full Testing**: [ ] Yes [ ] No

---

## 🐛 Browser Console Errors

Open DevTools (F12) → Console tab

**Errors Found**:
1. _______________________
2. _______________________
3. _______________________

**Warnings** (can ignore):
- React hydration warnings
- Material-UI prop warnings

---

## ✅ Next Steps

If Smoke Test **PASSES**:
- [ ] Proceed to Full UI Testing (use UI_TEST_RESULTS.md)
- [ ] Test all scenarios thoroughly
- [ ] Document all issues found

If Smoke Test **FAILS**:
- [ ] Fix critical errors first
- [ ] Re-run smoke test
- [ ] Then proceed to full testing

---

**Tested By**: _______________  
**Date**: _______________  
**Time**: _______________
