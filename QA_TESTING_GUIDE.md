# 🧪 QA Testing Guide - Admin Portal

## 📋 Overview

Admin Portal ได้ลบ Mock data ทั้งหมดออกแล้ว ระบบจะแสดงเฉพาะข้อมูลจาก Backend API จริงเท่านั้น

**ทีม QA ต้องสร้างข้อมูลทดสอบเองผ่าน API หรือ Database**

---

## 🎯 Test Data Requirements

### 1. Users (ผู้ใช้งาน)

**ต้องสร้าง:**
- Admin users (อย่างน้อย 2 คน)
- Reviewer users (อย่างน้อย 3 คน)
- Inspector users (อย่างน้อย 3 คน)
- Approver users (อย่างน้อย 2 คน)
- Farmer users (อย่างน้อย 10 คน)

**API Endpoint:**
```
POST /api/users
{
  "name": "ชื่อผู้ใช้",
  "email": "email@example.com",
  "password": "password123",
  "role": "admin|reviewer|inspector|approver|farmer",
  "status": "active"
}
```

---

### 2. Applications (คำขอรับรอง)

**ต้องสร้าง:**
- Draft applications (5 รายการ)
- Submitted applications (10 รายการ)
- Under review applications (8 รายการ)
- Inspection pending (5 รายการ)
- Approved applications (15 รายการ)
- Rejected applications (3 รายการ)
- Certificate issued (10 รายการ)

**API Endpoint:**
```
POST /api/farmer/applications
{
  "farmerCitizenId": "1234567890123",
  "farmerFirstName": "สมชาย",
  "farmerLastName": "ใจดี",
  "farmerEmail": "somchai@example.com",
  "farmerPhoneNumber": "0812345678",
  "farmName": "ฟาร์มทดสอบ",
  "farmAddress": {
    "province": "เชียงใหม่",
    "district": "แม่ริม",
    "subDistrict": "ริมใต้",
    "postalCode": "50180",
    "coordinates": {
      "latitude": 18.8969,
      "longitude": 98.9164
    }
  },
  "farmSize": 5,
  "farmSizeUnit": "rai",
  "cultivationType": "GREENHOUSE",
  "cannabisVariety": "CBD"
}
```

---

### 3. Reviews (การตรวจสอบ)

**ต้องสร้าง:**
- Assign reviewers to applications
- Complete reviews with decisions
- Add comments to applications

**API Endpoints:**
```
POST /api/dtam/applications/:id/assign-reviewer
{
  "reviewerId": "reviewer-user-id"
}

POST /api/dtam/applications/:id/review/complete
{
  "decision": "approve|reject|request_changes",
  "comments": "ความเห็น",
  "documentsVerified": true,
  "inspectionRequired": true
}

POST /api/dtam/applications/:id/comments
{
  "message": "ข้อความ",
  "type": "general|review|inspection"
}
```

---

### 4. Inspections (การตรวจสอบภาคสนาม)

**ต้องสร้าง:**
- Assign inspectors to applications
- Complete inspections with results

**API Endpoints:**
```
POST /api/dtam/applications/:id/assign-inspector
{
  "inspectorId": "inspector-user-id"
}

POST /api/dtam/applications/:id/inspection/complete
{
  "passed": true,
  "score": 85,
  "findings": "ผลการตรวจสอบ",
  "recommendations": "ข้อเสนอแนะ"
}
```

---

### 5. Approvals (การอนุมัติ)

**ต้องสร้าง:**
- Approve applications
- Reject applications

**API Endpoints:**
```
POST /api/dtam/applications/:id/approve
{
  "comments": "อนุมัติคำขอ",
  "certificateData": {
    "certificateType": "gacp",
    "validUntil": "2027-01-01T00:00:00.000Z"
  }
}

POST /api/dtam/applications/:id/reject
{
  "reason": "เหตุผล",
  "comments": "ความเห็น"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete Application Workflow

1. **สร้าง Farmer user**
2. **สร้าง Application** (status: submitted)
3. **Assign Reviewer** → Application status: under_review
4. **Complete Review** (approve) → Application status: inspection_pending
5. **Assign Inspector** → Application status: inspection_in_progress
6. **Complete Inspection** (passed) → Application status: compliance_review
7. **Approve Application** → Application status: approved, certificate_issued

**Expected Result:**
- ✅ Application ปรากฏใน `/applications` list
- ✅ Application detail แสดงข้อมูลครบถ้วน
- ✅ Timeline แสดงประวัติทุกขั้นตอน
- ✅ Certificate ปรากฏใน `/certificates` list

---

### Scenario 2: Rejection Workflow

1. **สร้าง Application** (status: submitted)
2. **Assign Reviewer**
3. **Complete Review** (reject) → Application status: rejected

**Expected Result:**
- ✅ Application status = rejected
- ✅ Rejection reason แสดงใน detail page
- ✅ ไม่สามารถ approve ได้อีก

---

### Scenario 3: Multiple Applications

1. **สร้าง 20+ Applications** ในสถานะต่างๆ
2. **Test filtering** by status
3. **Test search** by farm name, farmer name
4. **Test pagination**

**Expected Result:**
- ✅ Filter ทำงานถูกต้อง
- ✅ Search ทำงานถูกต้อง
- ✅ Pagination ทำงานถูกต้อง

---

### Scenario 4: User Management

1. **สร้าง Users** ในแต่ละ role
2. **Test user list** filtering by role
3. **Test user detail** page

**Expected Result:**
- ✅ Users แสดงครบถ้วน
- ✅ Filter by role ทำงาน
- ✅ User detail แสดงข้อมูลถูกต้อง

---

### Scenario 5: Statistics & Reports

1. **สร้างข้อมูลเพียงพอ** (20+ applications)
2. **Check Dashboard** statistics
3. **Check Statistics** page
4. **Export Reports** to CSV

**Expected Result:**
- ✅ Dashboard แสดงสถิติถูกต้อง
- ✅ Statistics page แสดงข้อมูลถูกต้อง
- ✅ Export CSV ทำงาน

---

## 📊 Minimum Test Data

### ข้อมูลขั้นต่ำที่ต้องมี:

| Type | Minimum | Recommended |
|------|---------|-------------|
| **Users** | 10 | 20+ |
| - Admin | 1 | 2 |
| - Reviewer | 2 | 3 |
| - Inspector | 2 | 3 |
| - Approver | 1 | 2 |
| - Farmer | 4 | 10+ |
| **Applications** | 10 | 30+ |
| - Draft | 1 | 3 |
| - Submitted | 2 | 5 |
| - Under Review | 2 | 5 |
| - Approved | 3 | 10 |
| - Rejected | 1 | 3 |
| - Certificate Issued | 1 | 5 |
| **Comments** | 5 | 20+ |
| **Reviews** | 5 | 15+ |
| **Inspections** | 3 | 10+ |

---

## 🔧 Setup Instructions

### Option 1: ใช้ API (แนะนำ)

```bash
# 1. Start Backend
cd apps/backend
npm run dev

# 2. Use Postman/Insomnia to create test data
# Import collection: docs/api/postman-collection.json

# 3. Run test data script (if available)
node scripts/seed-test-data.js
```

### Option 2: ใช้ Database Direct

```bash
# 1. Connect to MongoDB
mongosh "mongodb://localhost:27017/gacp"

# 2. Insert test data
db.users.insertMany([...])
db.applications.insertMany([...])
```

### Option 3: ใช้ Seed Script

```bash
# Run seed script
cd apps/backend
npm run seed:test
```

---

## ✅ Testing Checklist

### Login & Authentication
- [ ] Login with admin account
- [ ] Login with reviewer account
- [ ] Login with inspector account
- [ ] Login with approver account
- [ ] Logout functionality
- [ ] Token expiration handling

### Applications Management
- [ ] View applications list
- [ ] Filter by status
- [ ] Search applications
- [ ] View application detail
- [ ] Assign reviewer
- [ ] Complete review
- [ ] Assign inspector
- [ ] Complete inspection
- [ ] Approve application
- [ ] Reject application
- [ ] Add comments

### User Management
- [ ] View users list
- [ ] Filter by role
- [ ] Search users
- [ ] View user detail
- [ ] Create new user
- [ ] Update user
- [ ] Delete user

### Certificates
- [ ] View certificates list
- [ ] Search certificates
- [ ] View certificate detail
- [ ] Download certificate PDF
- [ ] Revoke certificate

### Reports & Statistics
- [ ] View dashboard statistics
- [ ] View statistics page
- [ ] Export applications CSV
- [ ] Generate reports

### Error Handling
- [ ] Empty state (no data)
- [ ] Loading states
- [ ] Error messages
- [ ] Network errors
- [ ] Invalid data

---

## 🐛 Known Issues

### None yet - Please report any issues found!

---

## 📝 Test Report Template

```markdown
## Test Report - [Date]

### Tester: [Name]
### Environment: [Dev/Staging/Production]

### Test Results:

| Test Case | Status | Notes |
|-----------|--------|-------|
| Login | ✅ Pass | - |
| Applications List | ✅ Pass | - |
| Application Detail | ❌ Fail | Error message XYZ |
| ... | ... | ... |

### Issues Found:
1. [Issue description]
2. [Issue description]

### Screenshots:
[Attach screenshots]
```

---

## 🔗 Related Documents

- [API Documentation](./API_DOCUMENTATION.md)
- [Backend Setup](../apps/backend/README.md)
- [Admin Portal README](../apps/admin-portal/README.md)

---

## 📞 Support

**หากพบปัญหาหรือต้องการความช่วยเหลือ:**
- สร้าง Issue ใน GitHub
- ติดต่อ Development Team
- ดู Documentation ใน `docs/` folder

---

**สถานะ:** ✅ Ready for QA Testing  
**อัพเดทล่าสุด:** 2025-01-XX  
**Version:** 1.0.0
