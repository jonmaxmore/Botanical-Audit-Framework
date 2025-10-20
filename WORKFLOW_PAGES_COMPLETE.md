# GACP Platform - Complete Workflow & Pages Summary

## ✅ Fixed Issues

### 1. Backend API Routes Configuration
- ✅ Added authentication routes (`/api/auth/*`)
- ✅ Added application routes (`/api/applications/*`)
- ✅ Fixed `UserApi.getCurrentUser()` to use `/auth/me` instead of `/users/me`
- ✅ Added missing middleware exports:
  - `authenticate` - Generic authentication
  - `authorize` - Role-based authorization
  - `handleAsync` - Async error handler alias
  - `rateLimitSensitive` - Rate limiting placeholder

### 2. Frontend Pages Created
- ✅ Created `/document-checker/review/[id].tsx` - Document review page

### 3. Backend Services Fixed
- ✅ Fixed `mock-database.js` logger import
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:3001

## 🌟 GACP Workflow & Available Pages

### Complete Workflow Process

```
1. FARMER (เกษตรกร)
   └─> Submit Application
       ├─> /farmer/dashboard
       ├─> /farmer/applications/new
       └─> /farmer/applications/[id]

2. DOCUMENT CHECKER (เจ้าหน้าที่ตรวจเอกสาร)
   └─> Check Documents
       ├─> /document-checker/dashboard  ✅ COMPLETED
       └─> /document-checker/review/[id]  ✅ NEWLY CREATED
           ├─> View application details
           ├─> Check document list
           ├─> Approve/Reject documents
           └─> Add notes

3. INSPECTOR (เจ้าหน้าที่ตรวจประเมิน)
   └─> Conduct Inspection
       ├─> /inspector/dashboard  ✅ EXISTS
       ├─> /inspector/schedule  ✅ EXISTS
       ├─> /inspector/applications  ✅ EXISTS
       ├─> /inspector/reports  ✅ EXISTS
       └─> /inspector/inspection/[id]  📋 TODO

4. APPROVER (ผู้อนุมัติ)
   └─> Final Approval
       ├─> /approver/dashboard  ✅ EXISTS
       └─> /approver/review/[id]  📋 TODO

5. CERTIFICATE ISSUED
   └─> Certificate Generation
       └─> /certificate/[id]  📋 TODO
```

## 📋 Application Status Flow

```typescript
export enum ApplicationStatus {
  DRAFT = 'draft',                           // ร่าง
  SUBMITTED = 'submitted',                   // ยื่นคำขอแล้ว
  DOCUMENT_CHECKING = 'document_checking',   // ระหว่างตรวจเอกสาร ⬅️ NEW PAGE
  DOCUMENT_APPROVED = 'document_approved',   // เอกสารผ่าน
  DOCUMENT_REJECTED = 'document_rejected',   // เอกสารไม่ผ่าน
  INSPECTION_SCHEDULED = 'inspection_scheduled', // กำหนดวันตรวจ
  INSPECTING = 'inspecting',                 // ระหว่างตรวจประเมิน
  INSPECTION_COMPLETED = 'inspection_completed', // ตรวจเสร็จ
  INSPECTION_PASSED = 'inspection_passed',   // ตรวจผ่าน
  INSPECTION_FAILED = 'inspection_failed',   // ตรวจไม่ผ่าน
  PENDING_APPROVAL = 'pending_approval',     // รอการอนุมัติ
  APPROVED = 'approved',                     // อนุมัติแล้ว
  REJECTED = 'rejected',                     // ไม่อนุมัติ
  CERTIFICATE_ISSUED = 'certificate_issued'  // ออกใบรับรองแล้ว
}
```

## 🎯 Document Checker Review Page Features

### URL Pattern
```
/document-checker/review/[applicationId]
```

### Page Features
1. **Application Details Display**
   - Farmer information (ข้อมูลเกษตรกร)
   - Farm information (ข้อมูลฟาร์ม)
   - Crop information (ข้อมูลพืชที่ปลูก)
   - Submission date (วันที่ยื่นคำขอ)

2. **Document Checklist** ✅
   - ใบทะเบียนฟาร์ม / ใบรับรองการจดทะเบียน
   - เอกสารแสดงกรรมสิทธิ์ที่ดิน (โฉนด/น.ส.3)
   - สำเนาบัตรประชาชนเกษตรกร
   - แผนการปลูก / ปฏิทินการผลิต
   - ใบรับรองมาตรฐานอื่นๆ (ถ้ามี)
   - รูปถ่ายฟาร์ม / แปลงปลูก

3. **Review Actions**
   - ✅ Approve (เอกสารครบถ้วนถูกต้อง)
     - Updates status to `DOCUMENT_APPROVED`
     - Proceeds to inspection scheduling
   - ❌ Reject (เอกสารไม่ครบ/ไม่ถูกต้อง)
     - Updates status to `DOCUMENT_REJECTED`
     - Returns to farmer for correction
   - 📝 Notes (หมายเหตุ / ข้อเสนอแนะ)
     - Required field for both approve/reject
     - Helps farmers understand what's missing

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
GET    /api/auth/me                - Get current user  ✅ FIXED
PUT    /api/auth/profile           - Update profile
POST   /api/auth/change-password   - Change password
POST   /api/auth/forgot-password   - Forgot password
```

### Applications
```
GET    /api/applications           - List applications
GET    /api/applications/:id       - Get application
POST   /api/applications           - Create application
PUT    /api/applications/:id       - Update application
PUT    /api/applications/:id/status - Update status  ✅ USED BY REVIEW PAGE
GET    /api/applications/:id/history - Get history
```

## 🚀 How to Run

### Backend (Port 5000)
```bash
cd apps/backend
node server.js
```

### Frontend (Port 3001)
```bash
cd apps/frontend
pnpm dev
```

## 📝 Next Steps (TODO)

### High Priority
1. **Create Inspector Inspection Page**
   - `/inspector/inspection/[id].tsx`
   - Checklist based on GACP control points
   - Scoring system
   - Photo upload
   - Report generation

2. **Create Approver Review Page**
   - `/approver/review/[id].tsx`
   - View all previous stages
   - Final approval/rejection
   - Certificate issuance trigger

3. **Create Farmer Application Pages**
   - `/farmer/applications/new.tsx` - Submit new application
   - `/farmer/applications/[id].tsx` - View/edit application

### Medium Priority
4. **Certificate Management**
   - `/certificate/[id].tsx` - View certificate
   - PDF generation
   - QR code for verification

5. **MongoDB Connection**
   - Add `.env` file with MONGODB_URI
   - Replace mock database with real MongoDB

6. **User Model Integration**
   - Create User model in MongoDB
   - Implement proper JWT authentication
   - Add password hashing

### Low Priority
7. **File Upload**
   - Document upload functionality
   - Image storage for farm photos
   - PDF handling

8. **Notifications**
   - Email notifications for status changes
   - In-app notifications
   - SMS integration (optional)

## 🛡️ Security Notes

⚠️ **Current State: Development Mode**
- Using temporary JWT secrets
- No MongoDB connection (using mock data)
- Rate limiting is placeholder only
- File upload not implemented

✅ **Ready for Production After:**
1. Set proper JWT secrets in `.env`
2. Configure MongoDB connection
3. Implement proper rate limiting
4. Add file upload with validation
5. Enable HTTPS
6. Add CSRF protection

## 📊 Database Schema

### GACPApplication
```typescript
{
  id: string;
  applicationNumber: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  farmAddress: string;
  farmArea: number;
  cropType: string;
  cropVariety: string;
  status: ApplicationStatus;
  
  // Document Checker fields  ✅ NEW
  documentCheckerId?: string;
  documentCheckerName?: string;
  documentCheckedAt?: Date;
  documentCheckResult?: 'approved' | 'rejected';
  documentCheckNotes?: string;
  
  // Inspector fields
  inspectorId?: string;
  inspectionScore?: number;
  inspectionResult?: 'passed' | 'failed';
  
  // Approver fields
  approverId?: string;
  approvalResult?: 'approved' | 'rejected';
  
  // Certificate fields
  certificateNumber?: string;
  certificateIssuedAt?: Date;
}
```

## 🎨 UI/UX Features

### Document Checker Review Page
- ✅ Clean, professional layout
- ✅ Material-UI components
- ✅ Thai language support
- ✅ Mobile responsive (Grid system)
- ✅ Loading states
- ✅ Error handling
- ✅ Status chips with colors
- ✅ Clear action buttons
- ✅ Required field validation

### Workflow Service
```typescript
WorkflowService.getStatusLabel(status)  // Get Thai label
WorkflowService.getStatusColor(status)  // Get color code
```

---

**Last Updated:** October 20, 2025
**Version:** 1.0.0
**Status:** ✅ Document Checker Review Page Completed & Tested
