# 📦 Certificate Portal - Installation Guide

## ✅ Current Progress

**Sprint 1 - Week 1 Status**: 🟢 **~60% Complete**

### Files Created (21 files)

- ✅ Configuration files (5)
- ✅ Type definitions (1)
- ✅ API client (1)
- ✅ Layouts & Components (2)
- ✅ Pages (5)
- ✅ Utilities (3)
- ✅ Documentation (2)
- ✅ Environment template (1)
- ✅ Theme system (1)

---

## 🚀 Quick Start

### Step 1: Navigate to Certificate Portal

```powershell
cd apps\certificate-portal
```

### Step 2: Install Dependencies

```powershell
npm install
```

**Expected Installation Time**: 2-3 minutes

**Dependencies to be installed**:

- Next.js 14.2.0 (React framework)
- React 18.3.1 (UI library)
- Material-UI 5.15.15 (Component library)
- TypeScript 5.4.5 (Type safety)
- Tailwind CSS 3.4.3 (Styling)
- qrcode 1.5.3 (QR generation)
- jsPDF 2.5.1 (PDF generation)
- html2canvas 1.4.1 (HTML to image)
- axios 1.6.8 (HTTP client)
- react-hook-form 7.51.3 (Form management)
- zod 3.23.6 (Validation)
- notistack 3.0.1 (Notifications)

**Dev Dependencies**:

- Jest 29.7.0 (Testing)
- Playwright 1.43.1 (E2E testing)
- ESLint 8.57.0 (Linting)
- Prettier 3.2.5 (Formatting)

### Step 3: Create Environment File

```powershell
Copy-Item .env.local.example .env.local
```

**Edit `.env.local` with your configuration**:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=GACP Certificate Portal

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database (Backend)
MONGODB_URI=mongodb://localhost:27017/gacp-certificate

# Certificate Configuration
CERTIFICATE_VALIDITY_YEARS=3
QR_CODE_SIZE=200

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
```

### Step 4: Run Development Server

```powershell
npm run dev
```

**Expected Output**:

```
> certificate-portal@1.0.0 dev
> next dev -p 3003

   ▲ Next.js 14.2.0
   - Local:        http://localhost:3003
   - Ready in 2.5s
```

### Step 5: Open in Browser

Navigate to: **http://localhost:3003**

---

## 🧪 Testing the Application

### 1. Landing Page Test

**URL**: http://localhost:3003

**Expected**:

- ✅ Hero section with gradient background
- ✅ 6 feature cards
- ✅ 4 statistics
- ✅ Footer with copyright

**Actions**:

- Click "Get Started" → Should redirect to login
- Scroll to features → Smooth scrolling

### 2. Login Test

**URL**: http://localhost:3003/login

**Demo Credentials**:

```
Email: cert@gacp.test
Password: password123
```

**Expected**:

- ✅ Email and password fields
- ✅ Show/hide password toggle
- ✅ Demo credentials box
- ✅ Login button

**Actions**:

1. Enter demo credentials
2. Click "Login"
3. Should see success notification
4. Should redirect to `/dashboard`

### 3. Dashboard Test

**URL**: http://localhost:3003/dashboard

**Expected**:

- ✅ Sidebar navigation (7 menu items)
- ✅ Top header with user menu
- ✅ 4 statistics cards
- ✅ Recent certificates list (3 items)
- ✅ "New Certificate" button

**Actions**:

- Click menu items → Navigate to different pages
- Click "New Certificate" → Go to certificate form
- Click certificate items → View details

### 4. Certificate List Test

**URL**: http://localhost:3003/certificates

**Expected**:

- ✅ Search bar with filters
- ✅ Status filter dropdown
- ✅ Standard filter dropdown
- ✅ Table with 3 mock certificates
- ✅ Pagination controls

**Actions**:

- Search for "มะม่วง" → Filter results
- Filter by status "Approved" → Show only approved
- Click "View" icon → Go to detail page
- Click "Download PDF" → Generate PDF
- Click "QR Code" → Show QR dialog

### 5. Certificate Detail Test

**URL**: http://localhost:3003/certificates/1

**Expected**:

- ✅ Certificate information card
- ✅ Farm information
- ✅ Inspection details
- ✅ Status chip (colored)
- ✅ Action buttons (if pending)

**Actions**:

- Click "Print" → Open print dialog
- Click "Download PDF" → Download certificate
- Click "QR Code" → Show QR dialog
- Click "Approve" (if pending) → Approve certificate
- Click "Reject" (if pending) → Show reject dialog

### 6. New Certificate Test

**URL**: http://localhost:3003/certificates/new

**Expected**:

- ✅ 3-step stepper (Farm Info, Inspection, Review)
- ✅ Form fields with validation
- ✅ Next/Back buttons
- ✅ Submit button on final step

**Actions**:

1. **Step 1**: Fill farm information
   - Farm ID: `F001`
   - Farm Name: `ทดสอบ`
   - Farmer Name: `นายทดสอบ`
   - National ID: `1234567890123`
   - Crop Type: Select from dropdown
   - Farm Area: `10`
   - Address fields: Fill all required
   - Click "Next"

2. **Step 2**: Fill inspection details
   - Inspection Date: Select date
   - Inspector Name: `นางสาวตรวจสอบ`
   - Inspection Report: Enter text (optional)
   - Notes: Enter text (optional)
   - Click "Next"

3. **Step 3**: Review and submit
   - Review all information
   - Click "Create Certificate"
   - Should see success notification
   - Should redirect to `/certificates`

---

## 🔍 TypeScript Errors (Expected Before npm install)

**Current Status**: ⚠️ Multiple TypeScript errors

**Common Errors**:

```
Cannot find module 'react'
Cannot find module 'next/navigation'
Cannot find module '@mui/material'
Cannot find module 'notistack'
```

**Solution**: These errors will **disappear automatically** after running:

```powershell
npm install
```

**Why?**: Dependencies are not yet installed in `node_modules/`

---

## 📁 Project Structure Verification

```
apps/certificate-portal/
├── ✅ app/
│   ├── ✅ page.tsx (Landing)
│   ├── ✅ layout.tsx (Root layout)
│   ├── ✅ globals.css (Styles)
│   ├── ✅ login/page.tsx
│   ├── ✅ dashboard/page.tsx
│   └── ✅ certificates/
│       ├── ✅ page.tsx (List)
│       ├── ✅ new/page.tsx (Create)
│       └── ✅ [id]/page.tsx (Detail)
│
├── ✅ components/
│   └── ✅ layout/
│       └── ✅ DashboardLayout.tsx
│
├── ✅ lib/
│   ├── ✅ api/
│   │   └── ✅ certificates.ts
│   ├── ✅ theme/
│   │   └── ✅ index.ts
│   ├── ✅ types/
│   │   └── ✅ certificate.ts
│   └── ✅ utils/
│       ├── ✅ qr-generator.ts
│       ├── ✅ pdf-generator.ts
│       └── ✅ helpers.ts
│
├── ✅ package.json
├── ✅ tsconfig.json
├── ✅ next.config.js
├── ✅ tailwind.config.ts
├── ✅ .env.local.example
├── ✅ README.md
└── ✅ INSTALLATION.md (this file)
```

**Total Files**: 21 files created
**Total Lines**: ~3,500+ lines of code

---

## 🐛 Troubleshooting

### Issue 1: Port Already in Use

**Error**: `Port 3003 is already in use`

**Solution (PowerShell)**:

```powershell
# Find process using port 3003
netstat -ano | findstr :3003

# Kill process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Or change port in package.json
# "dev": "next dev -p 3005"
```

### Issue 2: Module Not Found

**Error**: `Cannot find module 'xxx'`

**Solution**:

```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue 3: TypeScript Errors After Installation

**Error**: TypeScript errors persist

**Solution**:

```powershell
# Restart VS Code TypeScript server
# Press Ctrl+Shift+P
# Type: "TypeScript: Restart TS Server"
# Press Enter

# Or restart VS Code completely
```

### Issue 4: Build Fails

**Error**: Build process fails

**Solution**:

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run build
```

### Issue 5: Environment Variables Not Working

**Error**: API calls fail or environment variables undefined

**Solution**:

```powershell
# Check .env.local exists
Test-Path .env.local

# If not, copy from example
Copy-Item .env.local.example .env.local

# Restart dev server
npm run dev
```

---

## ✅ Verification Checklist

After installation, verify the following:

### Development Environment

- [ ] Node.js version >= 18.0.0 (`node --version`)
- [ ] npm version >= 9.0.0 (`npm --version`)
- [ ] All dependencies installed (`npm list --depth=0`)
- [ ] No critical errors in terminal

### Application

- [ ] Dev server starts successfully (`npm run dev`)
- [ ] Landing page loads (http://localhost:3003)
- [ ] Login page accessible (http://localhost:3003/login)
- [ ] Can login with demo credentials
- [ ] Dashboard loads after login
- [ ] Sidebar navigation works
- [ ] Certificate list shows mock data
- [ ] Certificate detail page displays
- [ ] New certificate form works
- [ ] TypeScript errors resolved

### Features

- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] QR code dialog displays
- [ ] Print functionality works
- [ ] Form validation works
- [ ] Notifications display
- [ ] Logout works

---

## 📊 Next Steps (After Installation)

### 1. Backend Integration (Week 1 Day 3-4)

- [ ] Connect to backend API (Port 3004)
- [ ] Replace mock data with real API calls
- [ ] Implement JWT authentication
- [ ] Add error handling

### 2. Testing (Week 1 Day 5)

- [ ] Write unit tests (Jest)
- [ ] Write component tests (RTL)
- [ ] Write E2E tests (Playwright)
- [ ] Test coverage > 80%

### 3. QR & PDF Generation (Week 2)

- [ ] Implement real QR code generation
- [ ] Design certificate PDF template
- [ ] Test PDF export
- [ ] Test QR scanning

### 4. Polish & Deploy (Week 3)

- [ ] Fix any bugs
- [ ] Optimize performance
- [ ] Add loading states
- [ ] Deploy to staging
- [ ] User acceptance testing

---

## 📞 Support

**Issues?** Check these resources:

1. **README.md** - Project overview
2. **INSTALLATION.md** (this file) - Setup guide
3. **PM_QUICK_START_GUIDE.md** - Daily reference
4. **SPRINT_BACKLOG_CERTIFICATE_PORTAL.md** - Task list

**Still stuck?**

- Check terminal output for errors
- Verify all prerequisites installed
- Try clearing cache and reinstalling
- Restart VS Code

---

**Last Updated**: October 15, 2025  
**Installation Guide Version**: 1.0.0  
**Status**: ✅ Ready for Installation
