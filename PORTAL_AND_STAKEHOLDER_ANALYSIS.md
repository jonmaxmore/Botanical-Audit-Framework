# 📊 การวิเคราะห์ Portal และผู้มีส่วนได้ส่วนเสีย (Stakeholder Analysis)

**วันที่:** 26 ตุลาคม 2025  
**สถานะ:** ⚠️ พบช่องว่างที่ต้องดำเนินการ

---

## 🎯 สรุปผลการตรวจสอบ

### ✅ Portal ที่มีอยู่ในระบบ (5 portals)

| # | Portal | ตำแหน่ง | สถานะ | ผู้ใช้หลัก | หมายเหตุ |
|---|--------|---------|-------|-----------|----------|
| 1 | **Farmer Portal** | `apps/farmer-portal/` | ✅ สร้างแล้ว | เกษตรกร | Dashboard, Applications, Surveys |
| 2 | **Admin Portal** | `apps/admin-portal/` | ✅ สร้างแล้ว | ผู้ดูแลระบบ | User Management, Certificates, Audit Logs |
| 3 | **Certificate Portal** | `apps/certificate-portal/` | ✅ สร้างแล้ว | ประชาชนทั่วไป | Certificate Verification (Public) |
| 4 | **Backend API** | `apps/backend/` | ✅ สร้างแล้ว | ทุกระบบ | REST API Services |
| 5 | **Frontend (Legacy)** | `apps/frontend/` | ⚠️ Legacy | หลายบทบาท | ระบบเก่า - ควรพิจารณา migrate |

---

## 👥 ผู้มีส่วนได้ส่วนเสีย (Stakeholders) ทั้งหมด

### ✅ บทบาทที่มีอยู่ในระบบ (6 roles)

#### 1. **FARMER** 👨‍🌾 (เกษตรกร)
- **Portal:** ✅ Farmer Portal (`apps/farmer-portal/`)
- **จำนวนผู้ใช้:** 5 (ตามข้อมูล UAT)
- **Dashboard Route:** `/dashboard/farmer`
- **Permissions:**
  - `farm:read`, `farm:write` - จัดการข้อมูลฟาร์ม
  - `application:create`, `application:read` - ยื่นและติดตามคำขอ
  - `survey:submit` - ส่งแบบสอบถาม
  - `trace:read` - ตรวจสอบการติดตามย้อนกลับ

**ฟีเจอร์ที่ใช้งานได้:**
- ✅ ลงทะเบียนและจัดการโปรไฟล์ฟาร์ม
- ✅ ยื่นคำขอรับรอง GACP (8 ขั้นตอน)
- ✅ ชำระค่าธรรมเนียม (5,000 + 25,000 บาท)
- ✅ อัปโหลดเอกสารและรูปภาพ
- ✅ ติดตามสถานะการตรวจสอบ
- ✅ ดาวน์โหลดใบรับรอง
- ✅ สร้าง QR Code สำหรับผลผลิต

---

#### 2. **REVIEWER** 📋 (เจ้าหน้าที่ตรวจสอบเอกสาร)
- **Portal:** ❌ **ยังไม่มี** - ใช้ Admin Portal ชั่วคราว
- **จำนวนผู้ใช้:** 2 (ตามข้อมูล UAT)
- **Dashboard Route:** `/dashboard/reviewer` (ไม่มีจริง)
- **Permissions:**
  - `application:read`, `application:review`, `application:comment`
  - `farm:read`, `document:verify`

**ฟีเจอร์ที่ต้องการ:**
- ❌ Dashboard แสดงคิวเอกสารที่รอตรวจ
- ❌ ระบบตรวจสอบเอกสารพร้อม checklist
- ❌ ขอข้อมูลเพิ่มเติมจากเกษตรกร
- ❌ อนุมัติ/ปฏิเสธเอกสาร
- ❌ มอบหมายงานให้ Inspector

**สถานะ:** ⚠️ **ขาด Portal เฉพาะ - ใช้งานผ่าน Admin Portal**

---

#### 3. **INSPECTOR** 🔍 (เจ้าหน้าที่ตรวจฟาร์ม)
- **Portal:** ❌ **ยังไม่มี** - ใช้ Admin Portal ชั่วคราว
- **จำนวนผู้ใช้:** 3 (ตามข้อมูล UAT)
- **Dashboard Route:** `/dashboard/inspector` (ไม่มีจริง)
- **Permissions:**
  - `farm:read`, `farm:inspect`
  - `inspection:create`, `inspection:update`
  - `trace:read`, `trace:verify`

**ฟีเจอร์ที่ต้องการ:**
- ❌ Dashboard แสดงงานตรวจที่มอบหมาย
- ❌ ตารางนัดหมายตรวจฟาร์ม
- ❌ ฟอร์มตรวจสอบแบบ checklist (14 ข้อ GACP)
- ❌ อัปโหลดรูปภาพและหลักฐาน
- ❌ บันทึก GPS location
- ❌ ส่งรายงานการตรวจ
- ❌ Mobile App สำหรับใช้งานในสนาม

**สถานะ:** ⚠️ **ขาด Portal และ Mobile App**

---

#### 4. **APPROVER** ✅ (ผู้อนุมัติ)
- **Portal:** ❌ **ยังไม่มี** - ใช้ Admin Portal ชั่วคราว
- **จำนวนผู้ใช้:** 2 (ตามข้อมูล UAT)
- **Dashboard Route:** `/dashboard/approver` (ไม่มีจริง)
- **Permissions:**
  - `application:read`, `application:approve`, `application:reject`
  - `certificate:issue`, `certificate:revoke`
  - `farm:read`, `inspection:read`

**ฟีเจอร์ที่ต้องการ:**
- ❌ Dashboard แสดงคิวรออนุมัติ
- ❌ ดูประวัติการตรวจสอบทั้งหมด
- ❌ อนุมัติขั้นสุดท้าย
- ❌ ออกใบรับรอง
- ❌ เพิกถอนใบรับรอง

**สถานะ:** ⚠️ **ขาด Portal เฉพาะ**

---

#### 5. **ADMIN** 👑 (ผู้ดูแลระบบ)
- **Portal:** ✅ Admin Portal (`apps/admin-portal/`)
- **จำนวนผู้ใช้:** 1+ (ไม่จำกัด)
- **Dashboard Route:** `/dashboard/admin`
- **Permissions:** ทั้งหมด (`user:*`, `system:*`, `audit:*`, `logs:*`, `reports:*`)

**ฟีเจอร์ที่ใช้งานได้:**
- ✅ จัดการผู้ใช้ทั้งหมด
- ✅ ดู Audit Logs
- ✅ จัดการใบรับรอง
- ✅ ตั้งค่าระบบ
- ✅ ดูรายงานและสถิติ

**สถานะ:** ✅ **ครบถ้วน**

---

#### 6. **PUBLIC** 🌐 (ประชาชนทั่วไป)
- **Portal:** ✅ Certificate Portal (`apps/certificate-portal/`)
- **Dashboard Route:** `/` (หน้าแรก)
- **Permissions:** `trace:read` (อ่านอย่างเดียว)

**ฟีเจอร์ที่ใช้งานได้:**
- ✅ ตรวจสอบใบรับรองด้วย Certificate ID
- ✅ สแกน QR Code
- ✅ ดูข้อมูลฟาร์มและผลผลิต
- ✅ ไม่ต้องล็อกอิน (Public access)

**สถานะ:** ✅ **ครบถ้วน**

---

## ⚠️ ช่องว่างที่พบ (Gaps Identified)

### 🔴 ปัญหาเร่งด่วน (Critical)

#### 1. **ขาด Reviewer Portal**
**ผลกระทบ:**
- เจ้าหน้าที่ตรวจเอกสาร (2 คน) ไม่มี workspace เฉพาะ
- ต้องใช้ Admin Portal ที่มี permission มากเกินไป
- ไม่มีเครื่องมือเฉพาะสำหรับการตรวจเอกสาร
- SLA 3 วันทำการอาจไม่ได้รับการติดตาม

**แนวทางแก้ไข:**
```
apps/reviewer-portal/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx (รายการเอกสารรอตรวจ)
│   │   └── applications/
│   │       ├── [id]/page.tsx (รายละเอียดคำขอ)
│   │       └── [id]/review/page.tsx (ฟอร์มตรวจสอบ)
│   ├── assigned/page.tsx (งานที่มอบหมายแล้ว)
│   └── history/page.tsx (ประวัติการตรวจ)
└── components/
    ├── DocumentChecklist.tsx
    ├── ReviewForm.tsx
    └── RevisionRequest.tsx
```

---

#### 2. **ขาด Inspector Portal + Mobile App**
**ผลกระทบ:**
- เจ้าหน้าที่ตรวจฟาร์ม (3 คน) ไม่มีเครื่องมือสำหรับงานในสนาม
- ไม่สามารถบันทึกข้อมูลแบบ real-time ได้
- ไม่มี GPS tracking และ photo upload ในสนาม
- Checklist 14 ข้อ GACP ต้องทำด้วยกระดาษ

**แนวทางแก้ไข:**

**Desktop Portal:**
```
apps/inspector-portal/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx (งานตรวจที่มอบหมาย)
│   │   └── calendar/page.tsx (ตารางนัดหมาย)
│   ├── inspections/
│   │   ├── [id]/page.tsx (รายละเอียดงาน)
│   │   └── [id]/conduct/page.tsx (ฟอร์มตรวจ)
│   └── reports/page.tsx (รายงานที่ส่งแล้ว)
└── components/
    ├── InspectionChecklist.tsx (14 ข้อ GACP)
    ├── PhotoUpload.tsx
    └── GPSMarker.tsx
```

**Mobile App (React Native / Flutter):**
```
apps/inspector-mobile/
├── screens/
│   ├── InspectionList.tsx
│   ├── InspectionForm.tsx
│   ├── Camera.tsx
│   └── MapView.tsx
└── offline/
    ├── OfflineStorage.ts
    └── SyncManager.ts
```

---

#### 3. **ขาด Approver Portal**
**ผลกระทบ:**
- ผู้อนุมัติ (2 คน) ไม่มี dashboard เฉพาะ
- ต้องใช้ Admin Portal ที่ซับซ้อนเกินไป
- ไม่มีมุมมองแบบ approval workflow

**แนวทางแก้ไข:**
```
apps/approver-portal/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx (คิวรออนุมัติ)
│   │   └── pending/[id]/page.tsx (รายละเอียด)
│   ├── approved/page.tsx (อนุมัติแล้ว)
│   ├── rejected/page.tsx (ปฏิเสธแล้ว)
│   └── certificates/
│       ├── issue/page.tsx (ออกใบรับรอง)
│       └── revoke/page.tsx (เพิกถอน)
└── components/
    ├── ApprovalSummary.tsx
    ├── CertificateGenerator.tsx
    └── DecisionForm.tsx
```

---

## 📊 สถิติการใช้งาน

### Portal Coverage by Role

| Role | Portal Status | User Count | Priority |
|------|--------------|------------|----------|
| Farmer | ✅ Complete | 5 | High |
| Reviewer | ❌ Missing | 2 | **Critical** |
| Inspector | ❌ Missing | 3 | **Critical** |
| Approver | ❌ Missing | 2 | **Critical** |
| Admin | ✅ Complete | 1+ | High |
| Public | ✅ Complete | Unlimited | Medium |

**สรุป:**
- ✅ **3/6 roles** มี Portal เฉพาะ (50%)
- ❌ **3/6 roles** ขาด Portal (50%)
- ⚠️ **8 users** (Reviewer + Inspector + Approver) ไม่มีเครื่องมือเฉพาะ

---

## 🔄 Business Workflow ที่ได้รับผลกระทบ

### 1. **Document Review Workflow** (ขั้นตอนที่ 3)
**ปัญหา:**
- Reviewer ไม่มี Portal → ใช้ Admin Portal
- ไม่มี specialized tools สำหรับตรวจเอกสาร
- SLA tracking ไม่มีประสิทธิภาพ

**ผลกระทบ:**
- ⏱️ เวลาตรวจเอกสารช้าลง
- 📋 การขอข้อมูลเพิ่มไม่เป็นระบบ
- ⚠️ คุณภาพการตรวจสอบไม่สม่ำเสมอ

---

### 2. **Field Inspection Workflow** (ขั้นตอนที่ 6)
**ปัญหา:**
- Inspector ไม่มี Portal + Mobile App
- ต้องบันทึกด้วยกระดาษแล้วมาป้อนข้อมูลทีหลัง
- ไม่มี GPS tracking แบบ real-time

**ผลกระทบ:**
- ⏱️ Delay ในการส่งรายงาน
- 📸 รูปภาพและหลักฐานไม่ครบถ้วน
- 🗺️ ไม่มี GPS verification
- 📊 Data quality ต่ำ

---

### 3. **Final Approval Workflow** (ขั้นตอนที่ 7-8)
**ปัญหา:**
- Approver ไม่มี Portal เฉพาะ
- ต้องดูข้อมูลจาก Admin Portal ที่ซับซ้อน
- ไม่มีมุมมองแบบ "approval queue"

**ผลกระทบ:**
- ⏱️ เวลาอนุมัติล่าช้า
- ❌ อาจมองข้ามข้อมูลสำคัญ
- 📝 การออกใบรับรองไม่รวดเร็ว

---

## 🎯 แผนการดำเนินงาน (Recommendations)

### 🔴 Priority 1: Inspector Mobile App (Critical)
**เหตุผล:** Inspector ต้องใช้งานในสนาม - ไม่มี app = งานติดขัด

**เวลาที่ต้องการ:** 4-6 สัปดาห์
**ฟีเจอร์หลัก:**
- ✅ Offline-first architecture
- ✅ GPS tracking + photo capture
- ✅ 14-point GACP checklist
- ✅ Auto-sync เมื่อมี internet
- ✅ Digital signature

---

### 🟠 Priority 2: Reviewer Portal (High)
**เหตุผล:** SLA 3 วันทำการต้องมีเครื่องมือเฉพาะ

**เวลาที่ต้องการ:** 2-3 สัปดาห์
**ฟีเจอร์หลัก:**
- ✅ Document queue with filters
- ✅ Review form with validation rules
- ✅ Revision request system
- ✅ SLA countdown timer
- ✅ Inspector assignment

---

### 🟠 Priority 3: Approver Portal (High)
**เหตุผล:** Final approval เป็นขั้นตอนสุดท้าย - ต้องมีประสิทธิภาพ

**เวลาที่ต้องการ:** 2-3 สัปดาห์
**ฟีเจอร์หลัก:**
- ✅ Approval queue with priority
- ✅ Complete application history view
- ✅ One-click certificate issuance
- ✅ Decision tracking
- ✅ Revocation management

---

### 🟢 Priority 4: Frontend Migration (Medium)
**เหตุผล:** `apps/frontend/` เป็น legacy code - ควร migrate

**เวลาที่ต้องการ:** 3-4 สัปดาห์
**แนวทาง:**
- Migrate functionality ไป portals ที่เกี่ยวข้อง
- Deprecate legacy code
- Update documentation

---

## 📈 Timeline สำหรับการแก้ไข

```
สัปดาห์ที่ 1-2: 
├── วางโครงสร้าง Inspector Mobile App
├── ออกแบบ UI/UX สำหรับ offline mode
└── เริ่ม Reviewer Portal

สัปดาห์ที่ 3-4:
├── พัฒนา Inspector Mobile App (core features)
├── เสร็จ Reviewer Portal → UAT
└── เริ่ม Approver Portal

สัปดาห์ที่ 5-6:
├── เสร็จ Inspector Mobile App → UAT
├── เสร็จ Approver Portal → UAT
└── Integration testing ทั้ง 3 portals ใหม่

สัปดาห์ที่ 7-8:
├── Bug fixes จาก UAT
├── Performance optimization
├── Documentation update
└── Production deployment
```

---

## ✅ สรุปข้อมูล

### Portals ที่มีอยู่:
1. ✅ **Farmer Portal** - ครบถ้วน สมบูรณ์
2. ✅ **Admin Portal** - ครบถ้วน สมบูรณ์
3. ✅ **Certificate Portal** - ครบถ้วน สมบูรณ์
4. ✅ **Backend API** - ครบถ้วน สมบูรณ์
5. ⚠️ **Frontend (Legacy)** - ควรพิจารณา migrate

### Portals ที่ขาดหายไป:
1. ❌ **Reviewer Portal** - ต้องสร้างใหม่
2. ❌ **Inspector Portal (Desktop)** - ต้องสร้างใหม่
3. ❌ **Inspector Mobile App** - ต้องสร้างใหม่ (Priority สูงสุด)
4. ❌ **Approver Portal** - ต้องสร้างใหม่

### ผู้มีส่วนได้ส่วนเสีย:
- ✅ **6/6 roles** ถูกออกแบบไว้ในระบบ (100%)
- ⚠️ **3/6 roles** ยังไม่มี Portal เฉพาะ (50% gap)
- 👥 **8 users** (Reviewer + Inspector + Approver) รอ Portal

---

## 🎯 คำแนะนำสุดท้าย

1. **เร่งสร้าง Inspector Mobile App** - เป็น bottleneck หลักของ workflow
2. **สร้าง Reviewer และ Approver Portal** - ช่วยให้ workflow ราบรื่น
3. **Migrate legacy frontend** - ลดความซับซ้อนของระบบ
4. **Update documentation** - ให้ทีมเข้าใจโครงสร้างใหม่

**เวลาที่ต้องการทั้งหมด:** 8-10 สัปดาห์ (2-2.5 เดือน)

---

**หมายเหตุ:** ข้อมูลนี้ตรวจสอบจาก source code และ documentation ณ วันที่ 26 ตุลาคม 2025
