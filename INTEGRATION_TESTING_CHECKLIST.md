# Integration Testing Checklist

**Platform:** GACP Botanical Audit Framework  
**Version:** 2.0  
**Date:** 2025-01-XX  
**Status:** Ready for Testing

---

## 🎯 Testing Overview

### Scope

- ✅ Admin Portal (12 pages)
- ✅ Certificate Portal (5 pages)
- ✅ Farmer Portal (31 routes)
- ✅ Backend API (16+ services)

### Test Environment

- **Local Development:** http://localhost:3000-3003
- **Backend API:** http://localhost:3000
- **Database:** MongoDB (local or Atlas)
- **Redis:** Local or Cloud instance

---

## 📋 Admin Portal Testing (12 Pages)

### 1. Dashboard (`/dashboard`)

- [ ] Page loads without errors
- [ ] Stats cards display correctly
- [ ] Loading state works
- [ ] ErrorBoundary catches errors
- [ ] Responsive on mobile/tablet/desktop

### 2. Users (`/users`)

- [ ] User table displays
- [ ] Search functionality works
- [ ] Filter by role works
- [ ] Pagination works
- [ ] Add/Edit user modals open
- [ ] ErrorBoundary works

### 3. Settings (`/settings`)

- [ ] Form fields display
- [ ] Input validation works
- [ ] Save button functional
- [ ] Success/error messages show
- [ ] ErrorBoundary works

### 4. Reports (`/reports`)

- [ ] Report generation form displays
- [ ] Date pickers work
- [ ] Report type selection works
- [ ] Generate button functional
- [ ] ErrorBoundary works

### 5. Audit Logs (`/audit-logs`)

- [ ] Audit log table displays
- [ ] Timestamp formatting correct
- [ ] Status chips show correctly
- [ ] Pagination works
- [ ] ErrorBoundary works

### 6. Inspectors (`/inspectors`)

- [ ] Inspector cards display
- [ ] Stats show correctly
- [ ] Assigned cases list works
- [ ] Card layout responsive
- [ ] ErrorBoundary works

### 7. Reviews (`/reviews`)

- [ ] Review table displays
- [ ] Status chips show correctly
- [ ] Action buttons work
- [ ] Sorting works
- [ ] ErrorBoundary works

### 8. Roles (`/roles`)

- [ ] Role cards display
- [ ] Permissions list shows
- [ ] Edit functionality works
- [ ] Card layout responsive
- [ ] ErrorBoundary works

### 9. Statistics (`/statistics`)

- [ ] Stats cards display
- [ ] Metrics show correctly
- [ ] Charts placeholder visible
- [ ] Loading state works
- [ ] ErrorBoundary works

### 10. Applications (`/applications`)

- [ ] Application list displays
- [ ] Filters work
- [ ] Search functionality works
- [ ] Status badges show correctly
- [ ] ErrorBoundary works

### 11. Certificates (`/certificates`)

- [ ] Certificate list displays
- [ ] Search works
- [ ] Filter by status works
- [ ] Action menu opens
- [ ] ErrorBoundary works

### 12. Login (`/login`)

- [ ] Login form displays
- [ ] Email/password validation works
- [ ] Submit button functional
- [ ] Demo accounts listed
- [ ] Redirects to dashboard on success

---

## 📋 Certificate Portal Testing (5 Pages)

### 1. Dashboard (`/dashboard`)

- [ ] Page loads without errors
- [ ] Stats cards display
- [ ] Recent certificates list shows
- [ ] "New Certificate" button works
- [ ] ErrorBoundary works
- [ ] Responsive layout

### 2. Certificates List (`/certificates`)

- [ ] Certificate table displays
- [ ] Search functionality works
- [ ] Status filter works
- [ ] Standard filter works
- [ ] Pagination works
- [ ] Action buttons work
- [ ] ErrorBoundary works

### 3. Certificate Detail (`/certificates/[id]`)

- [ ] Certificate details display
- [ ] All information sections show
- [ ] Status chip displays correctly
- [ ] Approve button works (if pending)
- [ ] Reject button works (if pending)
- [ ] QR code dialog opens
- [ ] Download PDF button works
- [ ] Print button works
- [ ] ErrorBoundary works

### 4. Verify Page (`/verify/[certificateNumber]`)

- [ ] Public access (no auth required)
- [ ] Loading state shows
- [ ] Valid certificate displays correctly
- [ ] Invalid certificate shows error
- [ ] All certificate details visible
- [ ] Status alerts show correctly
- [ ] Responsive layout works

### 5. Login (`/login`)

- [ ] Login form displays
- [ ] Authentication works
- [ ] Redirects correctly
- [ ] Error messages show

---

## 📋 Farmer Portal Testing (Key Routes)

### Authentication

- [ ] `/login` - Login page works
- [ ] `/register` - Registration works
- [ ] Token storage works
- [ ] Protected routes redirect

### Dashboard

- [ ] `/farmer/dashboard` - Dashboard loads
- [ ] Stats display correctly
- [ ] Recent activities show
- [ ] Navigation works

### Applications

- [ ] Application list displays
- [ ] New application form works
- [ ] Application detail shows
- [ ] Status updates work

### Documents

- [ ] Document upload works
- [ ] Document list displays
- [ ] Document download works
- [ ] File validation works

---

## 📋 Backend API Testing

### Health Checks

- [ ] `/health` endpoint responds
- [ ] `/api/health` endpoint responds
- [ ] Database connection verified
- [ ] Redis connection verified

### Authentication

- [ ] POST `/api/auth/login` works
- [ ] POST `/api/auth/register` works
- [ ] JWT token generation works
- [ ] Token validation works

### Applications

- [ ] GET `/api/applications` returns list
- [ ] POST `/api/applications` creates new
- [ ] GET `/api/applications/:id` returns detail
- [ ] PUT `/api/applications/:id` updates
- [ ] Status transitions work

### Certificates

- [ ] GET `/api/certificates` returns list
- [ ] POST `/api/certificates` creates new
- [ ] GET `/api/certificates/:id` returns detail
- [ ] GET `/api/verify/:number` verifies certificate

---

## 🔍 Error Handling Testing

### ErrorBoundary

- [ ] Catches component errors
- [ ] Shows error message
- [ ] Reload button works
- [ ] Doesn't crash entire app

### Loading States

- [ ] CircularProgress shows during load
- [ ] Loading message displays
- [ ] Transitions smoothly to content

### Error Messages

- [ ] API errors show user-friendly messages
- [ ] Validation errors display correctly
- [ ] Network errors handled gracefully

---

## 📱 Responsive Design Testing

### Mobile (< 768px)

- [ ] All pages render correctly
- [ ] Navigation works
- [ ] Forms are usable
- [ ] Tables scroll horizontally
- [ ] Buttons are tappable

### Tablet (768px - 1024px)

- [ ] Layout adjusts appropriately
- [ ] Sidebar behavior correct
- [ ] Grid layouts work
- [ ] Cards display properly

### Desktop (> 1024px)

- [ ] Full layout displays
- [ ] Sidebar always visible
- [ ] Multi-column layouts work
- [ ] All features accessible

---

## 🔐 Security Testing

### Authentication

- [ ] Protected routes require login
- [ ] Tokens expire correctly
- [ ] Logout clears session
- [ ] Unauthorized access blocked

### Authorization

- [ ] Role-based access works
- [ ] Admin-only pages protected
- [ ] User permissions enforced

### Input Validation

- [ ] XSS prevention works
- [ ] SQL injection prevented
- [ ] File upload validation works
- [ ] Form validation enforced

---

## ⚡ Performance Testing

### Page Load Times

- [ ] Dashboard loads < 2 seconds
- [ ] List pages load < 3 seconds
- [ ] Detail pages load < 2 seconds
- [ ] API responses < 1 second

### Resource Usage

- [ ] No memory leaks
- [ ] CPU usage reasonable
- [ ] Network requests optimized
- [ ] Images optimized

---

## 🧪 Browser Compatibility

### Chrome

- [ ] All features work
- [ ] Layout correct
- [ ] No console errors

### Firefox

- [ ] All features work
- [ ] Layout correct
- [ ] No console errors

### Safari

- [ ] All features work
- [ ] Layout correct
- [ ] No console errors

### Edge

- [ ] All features work
- [ ] Layout correct
- [ ] No console errors

---

## ✅ Test Results Summary

### Admin Portal

- **Total Pages:** 12
- **Tested:** \_\_\_
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Status:** ⏳ Pending

### Certificate Portal

- **Total Pages:** 5
- **Tested:** \_\_\_
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Status:** ⏳ Pending

### Farmer Portal

- **Total Routes:** 31
- **Tested:** \_\_\_
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Status:** ⏳ Pending

### Backend API

- **Total Endpoints:** 50+
- **Tested:** \_\_\_
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Status:** ⏳ Pending

---

## 🐛 Issues Found

### Critical Issues

_None identified yet_

### Major Issues

_None identified yet_

### Minor Issues

_None identified yet_

### Enhancement Requests

_None identified yet_

---

## 📝 Testing Notes

### Environment Setup

1. Start backend: `cd apps/backend && npm run dev`
2. Start farmer portal: `cd apps/farmer-portal && npm run dev`
3. Start admin portal: `cd apps/admin-portal && npm run dev`
4. Start certificate portal: `cd apps/certificate-portal && npm run dev`

### Test Data

- Use mock data provided in each portal
- Demo accounts available in login pages
- Sample certificates in database

### Known Limitations

- TypeScript errors in legacy code (non-blocking)
- Some API endpoints use mock data
- Charts show placeholders (not implemented)

---

## ✅ Sign-Off

### Tested By

- **Name:** ******\_\_\_******
- **Date:** ******\_\_\_******
- **Signature:** ******\_\_\_******

### Approved By

- **Name:** ******\_\_\_******
- **Date:** ******\_\_\_******
- **Signature:** ******\_\_\_******

---

**Status:** Ready for Testing  
**Next Step:** Execute tests and document results  
**Target Completion:** End of Day 4
