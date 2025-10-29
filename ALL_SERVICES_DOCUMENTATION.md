# 🏢 GACP Botanical Audit Framework - All Services & Applications

**System Architecture:** Multi-Portal Enterprise Application  
**Last Updated:** December 2024  
**Total Applications:** 5 main + supporting services

---

## 📱 Main Applications

### 1. 🌾 Farmer Portal (`@gacp/farmer-portal`)

**Status:** ✅ **PRODUCTION READY** (100%)  
**Framework:** Next.js 15 + React 18 + TypeScript  
**Port:** 3000 (development)

#### Purpose

Portal สำหรับเกษตรกร เพื่อจัดการใบสมัคร เอกสาร และติดตามสถานะการรับรอง GACP

#### Features (31 Routes)

```
Landing & Authentication:
├── /                          - หน้าแรก
├── /login                     - เข้าสู่ระบบ
├── /register                  - ลงทะเบียน
└── /api/auth/*                - Authentication APIs

Farmer Features:
├── /farmer/dashboard          - Dashboard หลัก
├── /farmer/documents          - จัดการเอกสาร
├── /farmer/documents/[id]     - รายละเอียดเอกสาร
├── /farmer/documents/upload   - อัปโหลดเอกสาร
├── /farmer/reports            - รายงาน
└── /farmer/settings           - ตั้งค่า

DTAM System:
├── /dtam/dashboard            - DTAM Dashboard
├── /dtam/applications         - จัดการใบสมัคร
├── /dtam/applications/review  - รีวิวใบสมัคร
├── /dtam/reports              - รายงาน DTAM
├── /dtam/users                - จัดการผู้ใช้
└── /dtam/settings             - ตั้งค่าระบบ

Multi-Role Dashboards:
├── /dashboard/farmer          - Farmer view
├── /dashboard/inspector       - Inspector view
├── /dashboard/reviewer        - Reviewer view
├── /dashboard/approver        - Approver view
└── /dashboard/admin           - Admin view

Demo & Examples:
├── /demo                      - Demo landing
├── /demo/farmer               - Farmer demo
├── /demo/inspector            - Inspector demo
├── /examples                  - Examples
└── /test-sentry               - Sentry testing
```

#### Tech Stack

```json
{
  "framework": "Next.js 15.1.3",
  "react": "18.3.1",
  "typescript": "5.7.2",
  "styling": "Tailwind CSS 3.4.17",
  "state": "React Context + Hooks",
  "forms": "React Hook Form",
  "validation": "Zod",
  "testing": "Jest + React Testing Library",
  "monitoring": "@sentry/nextjs"
}
```

#### Tests

- **Total:** 540 test suites
- **Passing:** 527 (97.6%)
- **Coverage:** ~85%

#### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=GACP Farmer Portal
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### Deployment

```bash
# Development
pnpm run dev

# Production Build
pnpm run build
pnpm run start

# Docker
docker build -t farmer-portal .
docker run -p 3000:3000 farmer-portal
```

---

### 2. 👨‍💼 Admin Portal (`@gacp/admin-portal`)

**Status:** ⚠️ **INCOMPLETE** (40%)  
**Framework:** Next.js + React + TypeScript  
**Port:** 3001 (development)

#### Purpose

Portal สำหรับผู้ดูแลระบบ เพื่อจัดการผู้ใช้ รีวิวใบสมัคร และสร้างรายงาน

#### Existing Features (2 Routes)

```
✅ /admin/dashboard             - Dashboard หลัก
✅ /admin/applications          - รายการใบสมัคร
```

#### Missing Features (60%)

```
❌ User Management:
   ├── /admin/users             - จัดการผู้ใช้
   ├── /admin/users/[id]        - รายละเอียดผู้ใช้
   ├── /admin/roles             - จัดการบทบาท
   └── /admin/permissions       - จัดการสิทธิ์

❌ Application Review:
   ├── /admin/applications/[id] - รีวิวใบสมัคร
   └── /admin/applications/bulk - ดำเนินการแบบกลุ่ม

❌ Reports & Analytics:
   ├── /admin/reports           - ระบบรายงาน
   ├── /admin/analytics         - การวิเคราะห์
   └── /admin/reports/custom    - สร้างรายงานแบบกำหนดเอง

❌ System Settings:
   ├── /admin/settings          - ตั้งค่าระบบ
   ├── /admin/settings/email    - Email templates
   └── /admin/settings/security - ตั้งค่าความปลอดภัย

❌ Audit Logs:
   └── /admin/audit-logs        - ดู Audit logs
```

#### Tech Stack

Similar to Farmer Portal (Next.js 15 + React 18 + TypeScript)

#### Required Development

- **Time Estimate:** 2-3 weeks
- **Priority:** HIGH
- **Dependencies:** Backend APIs, Role-based access control

---

### 3. 📜 Certificate Portal (`@gacp/certificate-portal`)

**Status:** ⚠️ **INCOMPLETE** (60%)  
**Framework:** Next.js + React + TypeScript  
**Port:** 3002 (development)

#### Purpose

Portal สำหรับการขอและตรวจสอบใบรับรอง GACP

#### Existing Features (2 Routes)

```
✅ /certificate/request         - แบบฟอร์มขอใบรับรอง (70% complete)
✅ /certificate/verify          - ตรวจสอบใบรับรอง (50% complete)
```

#### Missing Features (40%)

```
❌ Certificate Management:
   ├── /certificate/my-certificates     - รายการใบรับรอง
   ├── /certificate/my-certificates/[id] - รายละเอียด
   ├── /certificate/renewal             - ต่ออายุใบรับรอง
   └── /certificate/revoke              - ยกเลิกใบรับรอง

❌ Backend Integration:
   ├── Certificate validation service
   ├── Blockchain integration
   ├── PDF generation service
   └── QR code generation
```

#### Special Features

- **Blockchain Verification:** ใช้ blockchain เพื่อตรวจสอบความถูกต้อง
- **QR Code:** สร้างและสแกน QR code สำหรับตรวจสอบ
- **PDF Download:** ดาวน์โหลดใบรับรองเป็น PDF

#### Tech Stack

Similar to Farmer Portal + blockchain integration libraries

#### Required Development

- **Time Estimate:** 1-2 weeks
- **Priority:** HIGH
- **Dependencies:** Blockchain service, PDF generation library

---

### 4. 🔧 Backend API (`@gacp/backend`)

**Status:** ✅ **FUNCTIONAL** (80%)  
**Framework:** Node.js + Express + MongoDB  
**Port:** 5000 (development)

#### Purpose

RESTful API สำหรับทุก portal รองรับการจัดการข้อมูล authentication และ business logic

#### API Modules

##### Authentication & Authorization

```
POST   /api/auth/register       - ลงทะเบียนผู้ใช้
POST   /api/auth/login          - เข้าสู่ระบบ
POST   /api/auth/logout         - ออกจากระบบ
POST   /api/auth/refresh        - Refresh token
GET    /api/auth/me             - ข้อมูลผู้ใช้ปัจจุบัน
```

##### User Management

```
GET    /api/users               - รายการผู้ใช้
GET    /api/users/:id           - รายละเอียดผู้ใช้
POST   /api/users               - สร้างผู้ใช้
PUT    /api/users/:id           - อัปเดตผู้ใช้
DELETE /api/users/:id           - ลบผู้ใช้
```

##### Applications (GACP)

```
GET    /api/applications        - รายการใบสมัคร
GET    /api/applications/:id    - รายละเอียดใบสมัคร
POST   /api/applications        - สร้างใบสมัคร
PUT    /api/applications/:id    - อัปเดตใบสมัคร
DELETE /api/applications/:id    - ลบใบสมัคร
POST   /api/applications/:id/submit - ส่งใบสมัคร
```

##### Inspections

```
GET    /api/inspections         - รายการตรวจสอบ
POST   /api/inspections         - สร้างรายงานตรวจสอบ
GET    /api/inspections/:id     - รายละเอียด
PUT    /api/inspections/:id     - อัปเดต
```

##### Certificates

```
GET    /api/certificates        - รายการใบรับรอง
POST   /api/certificates        - สร้างใบรับรอง
GET    /api/certificates/:id    - รายละเอียด
POST   /api/certificates/:id/verify - ตรวจสอบความถูกต้อง
GET    /api/certificates/:id/download - ดาวน์โหลด PDF
```

##### Documents

```
GET    /api/documents           - รายการเอกสาร
POST   /api/documents/upload    - อัปโหลดเอกสาร
GET    /api/documents/:id       - ดาวน์โหลดเอกสาร
DELETE /api/documents/:id       - ลบเอกสาร
```

##### Audit Logs

```
GET    /api/audit-logs          - ดู audit logs
GET    /api/audit-logs/:id      - รายละเอียด log
POST   /api/audit-logs          - บันทึก action
```

##### Compliance & Reports

```
GET    /api/compliance/status   - สถานะการปฏิบัติตาม
GET    /api/reports/applications - รายงานใบสมัคร
GET    /api/reports/inspections - รายงานตรวจสอบ
POST   /api/reports/custom      - สร้างรายงานแบบกำหนดเอง
```

##### Government Integration

```
POST   /api/government/submit    - ส่งข้อมูลไปยังหน่วยงาน
GET    /api/government/status    - ตรวจสอบสถานะ
POST   /api/government/sync      - ซิงค์ข้อมูล
```

#### Tech Stack

```json
{
  "runtime": "Node.js 18+",
  "framework": "Express 4",
  "database": "MongoDB 6+",
  "orm": "Mongoose 8",
  "authentication": "JWT + bcrypt",
  "validation": "Joi",
  "logging": "Winston",
  "testing": "Jest + Supertest",
  "security": "Helmet, CORS, Rate limiting"
}
```

#### Database Collections

```
- users                    - ผู้ใช้ระบบ
- applications             - ใบสมัคร GACP
- inspections              - รายงานตรวจสอบ
- certificates             - ใบรับรอง
- documents                - เอกสาร/ไฟล์
- audit_logs               - Audit trail
- sessions                 - User sessions
- notifications            - การแจ้งเตือน
- settings                 - System settings
```

#### Tests

- **API Tests:** 160/160 passing ✅
- **Load Tests:** 91.1% success rate ✅
- **Coverage:** ~75%

#### Code Quality

- **Current:** 395 problems (182 errors, 213 warnings)
- **Progress:** -82% from initial 2163 problems
- **Target:** <50 problems

#### Security

- **OWASP Compliance:** 8/10 ✅
- **Vulnerabilities:** 1 HIGH (Playwright - fixed)
- **Rate Limiting:** ✅ Implemented
- **Input Validation:** ✅ Implemented
- **SQL Injection Protection:** ✅ (using Mongoose)
- **XSS Protection:** ✅ (Helmet)

#### Environment Variables

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gacp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

---

### 5. 🎨 Frontend (Legacy)

**Status:** ❓ **UNKNOWN** (Possibly deprecated)  
**Framework:** Unknown (likely React or Vue)  
**Port:** Unknown

#### Purpose

อาจเป็น frontend เดิมก่อนแยก multi-portal หรือเป็น shared components

#### Action Required

- [ ] ตรวจสอบว่ายังใช้งานหรือไม่
- [ ] ถ้าไม่ใช้แล้ว → ลบออก
- [ ] ถ้ายังใช้ → อัปเดต documentation

---

## 🛠️ Supporting Services

### 6. 📊 MongoDB Database

**Type:** NoSQL Document Database  
**Version:** 6.0+  
**Port:** 27017

#### Purpose

ฐานข้อมูลหลักของระบบ เก็บข้อมูลผู้ใช้ ใบสมัคร เอกสาร และ audit logs

#### Collections

See Backend API section above

#### Backup Strategy

```bash
# Daily backup at 2 AM
mongodump --uri="mongodb://localhost:27017/gacp" --out=/backup/$(date +%Y%m%d)

# Retention: 30 days
# Weekly full backup
# Daily incremental backup
```

---

### 7. 🔐 Authentication Service

**Type:** JWT-based authentication  
**Implementation:** Built into Backend API

#### Features

- User registration & login
- Password hashing (bcrypt)
- JWT token generation
- Token refresh mechanism
- Role-based access control (RBAC)
- Session management

---

### 8. 📁 File Storage Service

**Type:** Cloud storage integration  
**Provider:** AWS S3 / MinIO (self-hosted)

#### Features

- Document upload
- Virus scanning
- File type validation
- Thumbnail generation
- Secure download links (presigned URLs)

#### Storage Structure

```
gacp-storage/
├── documents/
│   ├── applications/       - ใบสมัคร
│   ├── inspections/        - รายงานตรวจสอบ
│   └── certificates/       - ใบรับรอง
├── temp/                   - ไฟล์ชั่วคราว
└── backups/                - สำรองข้อมูล
```

---

### 9. 📧 Email Service

**Type:** SMTP / AWS SES  
**Purpose:** ส่งอีเมลแจ้งเตือนและยืนยันตัวตน

#### Email Templates

- Welcome email
- Email verification
- Password reset
- Application status update
- Certificate issued
- Inspection scheduled

#### Configuration

```javascript
{
  "provider": "AWS SES",
  "from": "noreply@gacp.go.th",
  "templates": "ejs",
  "queueing": "Bull + Redis"
}
```

---

### 10. 📲 Notification Service

**Type:** Multi-channel notification  
**Channels:** Email, SMS, In-app

#### Features

- Real-time notifications (WebSocket)
- Push notifications
- SMS alerts (Twilio)
- In-app notification center
- Notification preferences

---

### 11. 🔗 Blockchain Service

**Type:** Smart contract integration  
**Purpose:** บันทึกและตรวจสอบใบรับรอง

#### Features

- Certificate recording on blockchain
- Immutable audit trail
- Public verification
- Hash generation and storage

#### Tech Stack

```javascript
{
  "blockchain": "Ethereum / Hyperledger",
  "library": "Web3.js / ethers.js",
  "wallet": "MetaMask integration"
}
```

---

### 12. 🎯 Government API Integration

**Type:** External API integration  
**Purpose:** ส่งข้อมูลไปยังหน่วยงานภาครัฐ

#### Integrated Systems

- กรมวิชาการเกษตร (DOA)
- กรมส่งเสริมการเกษตร
- กระทรวงพาณิชย์
- ระบบ Single Sign-On (SSO)

#### Features

- Data synchronization
- Status tracking
- Error handling and retry
- Rate limiting compliance

---

### 13. 📈 Analytics Service

**Type:** Data analytics and reporting  
**Tools:** MongoDB Aggregation + Chart.js

#### Metrics Tracked

- User activity
- Application submissions
- Approval rates
- Inspection statistics
- Certificate issuance
- System performance

---

### 14. 🚨 Monitoring & Logging

**Type:** Application monitoring  
**Tools:** Sentry + Winston + CloudWatch

#### Features

- Error tracking (Sentry)
- Application logs (Winston)
- Performance monitoring
- Uptime monitoring
- Alert notifications

---

### 15. 🔄 Background Jobs

**Type:** Job queue system  
**Implementation:** Bull + Redis

#### Job Types

- Email sending
- File processing
- Report generation
- Data synchronization
- Scheduled tasks (cron jobs)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interfaces                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Farmer Portal│ Admin Portal │ Certificate  │ Frontend       │
│ (Next.js)    │ (Next.js)    │ Portal       │ (Legacy)       │
│ Port 3000    │ Port 3001    │ (Next.js)    │ Port ?         │
│              │              │ Port 3002    │                │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                            │
                ┌───────────▼───────────┐
                │    Load Balancer      │
                │   (Nginx/ALB)         │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │   Backend API         │
                │   (Express)           │
                │   Port 5000           │
                └───────────┬───────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
   ┌───▼────┐         ┌─────▼─────┐       ┌─────▼─────┐
   │MongoDB │         │  Redis    │       │   S3      │
   │Port    │         │  (Cache)  │       │  (Files)  │
   │27017   │         │           │       │           │
   └────────┘         └───────────┘       └───────────┘

External Integrations:
├── Government APIs (DOA, MOC)
├── Blockchain Network
├── Email Service (AWS SES)
├── SMS Service (Twilio)
└── Monitoring (Sentry, CloudWatch)
```

---

## 🚀 Deployment Architecture (Planned)

### Development Environment

```
Local Machine:
├── All portals (pnpm workspace)
├── Backend API (localhost:5000)
├── MongoDB (localhost:27017)
└── Redis (localhost:6379)
```

### Staging Environment

```
AWS EC2 / ECS:
├── Farmer Portal (staging.farmer.gacp.go.th)
├── Admin Portal (staging.admin.gacp.go.th)
├── Certificate Portal (staging.cert.gacp.go.th)
├── Backend API (staging.api.gacp.go.th)
├── MongoDB (RDS/DocumentDB)
└── S3 (staging bucket)
```

### Production Environment

```
AWS Production:
├── Multi-AZ deployment
├── Auto-scaling groups
├── CloudFront CDN
├── RDS Multi-AZ (MongoDB)
├── ElastiCache (Redis)
├── S3 with versioning
└── Route 53 for DNS
```

---

## 📊 Resource Requirements

### Development

```
CPU: 8 cores minimum
RAM: 16 GB minimum
Disk: 100 GB SSD
Network: 100 Mbps
```

### Production (Estimated)

```
App Servers: 4x t3.large (8GB RAM, 2 vCPUs)
Database: db.r5.xlarge (32GB RAM, 4 vCPUs)
Redis: cache.t3.medium (3.09GB RAM)
S3: 500 GB storage + transfer
CDN: CloudFront
Load Balancer: Application Load Balancer
Total Est. Cost: $800-1000/month
```

---

## 🔗 Quick Links

### Development

- **Farmer Portal:** http://localhost:3000
- **Admin Portal:** http://localhost:3001
- **Certificate Portal:** http://localhost:3002
- **Backend API:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017

### Documentation

- [PROJECT_TODO_LIST.md](./PROJECT_TODO_LIST.md) - Complete TODO list
- [COMPLETE_SYSTEM_STATUS_REPORT.md](./COMPLETE_SYSTEM_STATUS_REPORT.md) - System status
- [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md) - Production checklist
- [OWASP_SECURITY_AUDIT_REPORT.md](./OWASP_SECURITY_AUDIT_REPORT.md) - Security audit

### Commands

```bash
# Start all services
pnpm run dev

# Start specific portal
pnpm --filter @gacp/farmer-portal dev
pnpm --filter @gacp/admin-portal dev
pnpm --filter @gacp/certificate-portal dev
pnpm --filter @gacp/backend dev

# Run tests
pnpm run test

# Build for production
pnpm run build

# Lint
pnpm run lint
```

---

**Last Updated:** December 2024  
**Maintained By:** GACP Development Team  
**Contact:** tech@gacp.go.th
