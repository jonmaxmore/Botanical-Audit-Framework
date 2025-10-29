# ระบบดาวน์โหลด PDF สำหรับเอกสารราชการ

# PDF Export System for Government Documentation

## 📋 ภาพรวมระบบ (System Overview)

ระบบ GACP Platform ต้องรองรับการดาวน์โหลดเอกสารเป็น PDF สำหรับใช้ในการทำงานราชการ โดยแต่ละแผนกมีความต้องการเอกสารที่แตกต่างกันตามหน้าที่และความรับผิดชอบ

---

## 🎯 การวิเคราะห์ความต้องการตามแผนก

### 1. 📋 **REVIEWER (ผู้ตรวจสอบเอกสาร)**

#### เอกสารที่ต้องดาวน์โหลด:

**1.1 รายงานสรุปคำขอรับรองมาตรฐาน (Application Summary Report)**

- ข้อมูลเกษตรกรและฟาร์ม
- รายละเอียดพืชที่ขอรับรอง
- เอกสารประกอบทั้งหมด (checklist)
- สถานะการตรวจสอบเอกสาร
- ประวัติการแก้ไข
- **ใช้สำหรับ:** นำเสนอหัวหน้างาน, เก็บเข้าแฟ้ม

**1.2 รายงานการตรวจสอบเอกสาร (Document Verification Report)**

- รายการเอกสารที่ตรวจสอบแล้ว
- ผลการตรวจสอบแต่ละเอกสาร (ผ่าน/ไม่ผ่าน)
- ข้อบกพร่องที่พบ
- คำแนะนำแก้ไข
- ลายเซ็นดิจิทัล/ชื่อผู้ตรวจสอบ
- **ใช้สำหรับ:** ส่งต่อให้ Inspector, เก็บหลักฐาน

**1.3 รายงานการมอบหมายงาน (Assignment Report)**

- รายการคำขอที่มอบหมายให้ Inspector
- วันที่มอบหมาย
- เหตุผลการมอบหมาย
- ระดับความเร่งด่วน
- **ใช้สำหรับ:** ติดตามงาน, รายงานผลงาน

**1.4 รายงานสถิติการทำงาน (Reviewer Performance Report)**

- จำนวนคำขอที่ตรวจสอบ (รายวัน/รายเดือน)
- เวลาเฉลี่ยในการตรวจสอบ
- อัตราการผ่าน/ไม่ผ่าน
- **ใช้สำหรับ:** ประเมินผลงาน, รายงานต้นสังกัด

---

### 2. 🔍 **INSPECTOR (ผู้ตรวจสอบภาคสนาม)**

#### เอกสารที่ต้องดาวน์โหลด:

**2.1 ใบนัดหมายตรวจสอบ (Inspection Appointment Letter)**

- ข้อมูลเกษตรกรและฟาร์ม
- วันเวลานัดหมาย (Video Call/Onsite)
- รายการที่ต้องตรวจสอบ
- เอกสารที่เกษตรกรต้องเตรียม
- แผนที่ตั้งฟาร์ม (สำหรับ Onsite)
- **ใช้สำหรับ:** ส่งให้เกษตรกร, เก็บหลักฐานการนัดหมาย

**2.2 แบบฟอร์มตรวจสอบ GACP (GACP Inspection Checklist)**

- 8 Critical Control Points พร้อมช่องกรอก
- พื้นที่สำหรับบันทึกข้อสังเกต
- ช่องลายเซ็นเกษตรกร/ผู้ตรวจสอบ
- **ใช้สำหรับ:** พิมพ์ไปใช้ในการตรวจสอบภาคสนาม

**2.3 รายงานผลการตรวจสอบ (Inspection Report)**

- ผลการตรวจสอบแต่ละข้อ
- ภาพถ่ายประกอบ (snapshots)
- จุดแข็ง/จุดอ่อน
- คำแนะนำปรับปรุง
- คำตัดสิน (อนุมัติ/ต้องตรวจสอบเพิ่ม/ไม่ผ่าน)
- ลายเซ็นดิจิทัล
- **ใช้สำหรับ:** ส่งให้ Approver, เก็บหลักฐาน

**2.4 รายงานการตรวจสอบแบบ Video Call (Video Inspection Report)**

- บันทึกการประชุม (วันเวลา, ระยะเวลา)
- รายชื่อผู้เข้าร่วม
- ภาพถ่ายจาก Video Call
- ข้อสังเกตจากการตรวจสอบทางไกล
- **ใช้สำหรับ:** หลักฐานการตรวจสอบทางไกล

**2.5 รายงานสถิติการตรวจสอบ (Inspector Performance Report)**

- จำนวนการตรวจสอบ (Video/Onsite)
- เวลาเฉลี่ยต่อการตรวจสอบ
- อัตราการอนุมัติ
- KPI Dashboard
- **ใช้สำหรับ:** ประเมินผลงาน, รายงานต้นสังกัด

---

### 3. ✅ **APPROVER (ผู้อนุมัติ)**

#### เอกสารที่ต้องดาวน์โหลด:

**3.1 รายงานสรุปการตรวจสอบทั้งหมด (Complete Inspection Summary)**

- ข้อมูลคำขอ
- ผลการตรวจสอบเอกสาร (Reviewer)
- ผลการตรวจสอบภาคสนาม (Inspector)
- ภาพถ่ายประกอบทั้งหมด
- คะแนนรวม
- **ใช้สำหรับ:** ประกอบการตัดสินใจ

**3.2 หนังสืออนุมัติ/ไม่อนุมัติ (Approval/Rejection Letter)**

- คำตัดสินอย่างเป็นทางการ
- เหตุผลประกอบการตัดสิน
- เงื่อนไข (ถ้ามี)
- วันที่มีผลบังคับใช้
- ลายเซ็นดิจิทัล/ตราประทับ
- **ใช้สำหรับ:** ส่งให้เกษตรกร, เก็บหลักฐานทางราชการ

**3.3 ใบรับรองมาตรฐาน GACP (GACP Certificate)**

- เลขที่ใบรับรอง
- ข้อมูลเกษตรกรและฟาร์ม
- พืชที่ได้รับการรับรอง
- วันที่ออกและวันหมดอายุ
- QR Code สำหรับตรวจสอบ
- ลายเซ็นดิจิทัล/ตราประทับ
- **ใช้สำหรับ:** มอบให้เกษตรกร, เก็บต้นฉบับ

**3.4 รายงานสถิติการอนุมัติ (Approval Statistics Report)**

- จำนวนการอนุมัติ/ไม่อนุมัติ (รายเดือน)
- เวลาเฉลี่ยในการพิจารณา
- สาเหตุการไม่อนุมัติ
- **ใช้สำหรับ:** รายงานผู้บริหาร

---

### 4. 👨‍💼 **ADMIN (ผู้ดูแลระบบ)**

#### เอกสารที่ต้องดาวน์โหลด:

**4.1 รายงานสรุประบบ (System Summary Report)**

- จำนวนผู้ใช้งานทั้งหมด
- จำนวนคำขอแยกตามสถานะ
- สถิติการใช้งานระบบ
- **ใช้สำหรับ:** รายงานผู้บริหาร

**4.2 รายงานผู้ใช้งาน (User Management Report)**

- รายชื่อเจ้าหน้าที่ทั้งหมด
- บทบาทและสิทธิ์
- ประวัติการเข้าใช้งาน
- **ใช้สำหรับ:** ตรวจสอบการใช้งาน

**4.3 รายงานการเงิน (Financial Report)**

- รายได้จากค่าธรรมเนียม
- สถานะการชำระเงิน
- รายงานภาษี
- **ใช้สำหรับ:** ส่งกรมบัญชีกลาง

**4.4 รายงาน Audit Log (System Audit Report)**

- บันทึกการเข้าถึงข้อมูล
- การเปลี่ยนแปลงข้อมูลสำคัญ
- **ใช้สำหรับ:** ตรวจสอบความปลอดภัย

---

### 5. 👨‍🌾 **FARMER (เกษตรกร)**

#### เอกสารที่ต้องดาวน์โหลด:

**5.1 ใบยืนยันการส่งคำขอ (Application Confirmation)**

- เลขที่คำขอ
- วันที่ส่งคำขอ
- รายการเอกสารที่ส่ง
- ขั้นตอนต่อไป
- **ใช้สำหรับ:** เก็บเป็นหลักฐาน

**5.2 ใบเสร็จรับเงิน (Payment Receipt)**

- รายละเอียดการชำระเงิน
- จำนวนเงิน
- วันที่ชำระ
- **ใช้สำหรับ:** เบิกจ่าย, ภาษี

**5.3 ใบนัดหมายตรวจสอบ (Inspection Appointment)**

- วันเวลานัดหมาย
- ประเภทการตรวจสอบ
- สิ่งที่ต้องเตรียม
- **ใช้สำหรับ:** เตรียมตัวรับการตรวจสอบ

**5.4 ใบรับรองมาตรฐาน GACP (GACP Certificate)**

- ใบรับรองฉบับเต็ม
- QR Code
- **ใช้สำหรับ:** แสดงลูกค้า, ส่งออก

**5.5 รายงานผลการตรวจสอบ (Inspection Result)**

- ผลการตรวจสอบ
- คำแนะนำปรับปรุง
- **ใช้สำหรับ:** ปรับปรุงฟาร์ม

---

## 🛠️ เทคโนโลยีที่แนะนำ

### PDF Generation Libraries

**1. PDFKit (Node.js)**

```javascript
// Pros: ยืดหยุ่น, รองรับภาษาไทย, สร้าง PDF ได้ตรง
// Cons: ต้องเขียน layout เอง
```

**2. Puppeteer (HTML to PDF)**

```javascript
// Pros: ใช้ HTML/CSS ที่คุ้นเคย, รองรับภาษาไทย
// Cons: ใช้ memory มาก
```

**3. jsPDF (Client-side)**

```javascript
// Pros: สร้าง PDF ฝั่ง client, ไม่ต้องส่ง request
// Cons: จำกัดความสามารถ
```

**แนะนำ: Puppeteer** เพราะ:

- รองรับภาษาไทยดี
- ใช้ HTML/CSS ที่มีอยู่แล้ว
- สร้าง PDF สวยงาม
- รองรับ header/footer, page numbers

---

## 📐 โครงสร้างระบบ

### Backend API Endpoints

```javascript
// PDF Export Routes
POST /api/pdf/application-summary/:applicationId
POST /api/pdf/document-verification/:applicationId
POST /api/pdf/assignment-report/:reviewerId
POST /api/pdf/reviewer-performance/:reviewerId

POST /api/pdf/inspection-appointment/:inspectionId
POST /api/pdf/inspection-checklist/:inspectionId
POST /api/pdf/inspection-report/:inspectionId
POST /api/pdf/video-inspection-report/:inspectionId
POST /api/pdf/inspector-performance/:inspectorId

POST /api/pdf/complete-summary/:applicationId
POST /api/pdf/approval-letter/:applicationId
POST /api/pdf/certificate/:certificateId
POST /api/pdf/approval-statistics/:approverId

POST /api/pdf/system-summary
POST /api/pdf/user-management
POST /api/pdf/financial-report
POST /api/pdf/audit-log

POST /api/pdf/farmer-confirmation/:applicationId
POST /api/pdf/payment-receipt/:paymentId
POST /api/pdf/farmer-appointment/:inspectionId
POST /api/pdf/farmer-certificate/:certificateId
POST /api/pdf/farmer-inspection-result/:inspectionId
```

### PDF Template Structure

```
apps/backend/
├── services/
│   └── pdf/
│       ├── pdf-generator.service.js       # Core PDF generation
│       ├── templates/
│       │   ├── reviewer/
│       │   │   ├── application-summary.html
│       │   │   ├── document-verification.html
│       │   │   ├── assignment-report.html
│       │   │   └── performance-report.html
│       │   ├── inspector/
│       │   │   ├── appointment-letter.html
│       │   │   ├── inspection-checklist.html
│       │   │   ├── inspection-report.html
│       │   │   ├── video-report.html
│       │   │   └── performance-report.html
│       │   ├── approver/
│       │   │   ├── complete-summary.html
│       │   │   ├── approval-letter.html
│       │   │   ├── certificate.html
│       │   │   └── statistics.html
│       │   ├── admin/
│       │   │   ├── system-summary.html
│       │   │   ├── user-management.html
│       │   │   ├── financial-report.html
│       │   │   └── audit-log.html
│       │   └── farmer/
│       │       ├── confirmation.html
│       │       ├── receipt.html
│       │       ├── appointment.html
│       │       ├── certificate.html
│       │       └── inspection-result.html
│       └── styles/
│           ├── government-official.css    # สไตล์เอกสารราชการ
│           ├── certificate.css            # สไตล์ใบรับรอง
│           └── common.css                 # สไตล์ทั่วไป
├── routes/
│   └── pdf-export.routes.js
└── utils/
    ├── pdf-watermark.js                   # ลายน้ำ
    └── pdf-signature.js                   # ลายเซ็นดิจิทัล
```

---

## 🎨 มาตรฐานเอกสารราชการไทย

### รูปแบบเอกสาร

**1. Header**

- ตราครุฑ (ถ้าเป็นเอกสารทางการ)
- ชื่อหน่วยงาน: กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
- ที่อยู่หน่วยงาน

**2. เนื้อหา**

- ฟอนต์: TH Sarabun New (ฟอนต์ราชการ)
- ขนาดฟอนต์: 16pt (เนื้อหา), 18pt (หัวข้อ)
- ระยะขอบ: 1 นิ้ว (ทุกด้าน)
- เลขหน้า: มุมล่างขวา

**3. Footer**

- ลายเซ็นดิจิทัล/ชื่อผู้อนุมัติ
- วันที่ออกเอกสาร
- เลขที่อ้างอิง

**4. Watermark**

- "ต้นฉบับ" สำหรับเอกสารต้นฉบับ
- "สำเนา" สำหรับเอกสารสำเนา
- "ร่าง" สำหรับเอกสารร่าง

---

## 💾 Database Schema Updates

```javascript
// Add to Application model
{
  pdfExports: [{
    type: { type: String, enum: ['summary', 'verification', 'report', 'certificate'] },
    generatedBy: { type: ObjectId, ref: 'User' },
    generatedAt: Date,
    fileUrl: String,
    fileSize: Number,
    version: Number
  }]
}

// New PDFExport model
{
  documentType: String,
  relatedEntity: { type: ObjectId, refPath: 'entityModel' },
  entityModel: String,
  generatedBy: { type: ObjectId, ref: 'User' },
  generatedAt: Date,
  fileUrl: String,
  fileSize: Number,
  downloadCount: Number,
  lastDownloadedAt: Date,
  metadata: Object
}
```

---

## 🔐 Security & Access Control

### การควบคุมการเข้าถึง

**1. Role-Based Access**

- Reviewer: ดาวน์โหลดเฉพาะเอกสารที่ตนรับผิดชอบ
- Inspector: ดาวน์โหลดเฉพาะการตรวจสอบที่ได้รับมอบหมาย
- Approver: ดาวน์โหลดเฉพาะที่อยู่ในขั้นตอนอนุมัติ
- Farmer: ดาวน์โหลดเฉพาะเอกสารของตนเอง

**2. Watermark**

- เอกสารแต่ละฉบับมี watermark ระบุผู้ดาวน์โหลด
- วันเวลาที่ดาวน์โหลด

**3. Audit Trail**

- บันทึกทุกครั้งที่มีการดาวน์โหลด PDF
- ใคร, เมื่อไหร่, เอกสารอะไร

---

## 📊 สรุปจำนวนเอกสาร PDF

| แผนก      | จำนวนประเภทเอกสาร | ความสำคัญ |
| --------- | ----------------- | --------- |
| Reviewer  | 4                 | สูง       |
| Inspector | 5                 | สูงมาก    |
| Approver  | 4                 | สูงมาก    |
| Admin     | 4                 | ปานกลาง   |
| Farmer    | 5                 | สูง       |
| **รวม**   | **22 ประเภท**     |           |

---

## 🚀 Implementation Priority

### Phase 1: Critical Documents (สัปดาห์ที่ 1)

1. ✅ Inspection Report (Inspector)
2. ✅ Approval Letter (Approver)
3. ✅ GACP Certificate (Approver/Farmer)
4. ✅ Payment Receipt (Farmer)

### Phase 2: Workflow Documents (สัปดาห์ที่ 2)

5. ✅ Application Summary (Reviewer)
6. ✅ Document Verification Report (Reviewer)
7. ✅ Inspection Appointment (Inspector/Farmer)
8. ✅ Inspection Checklist (Inspector)

### Phase 3: Performance Reports (สัปดาห์ที่ 3)

9. ✅ Reviewer Performance Report
10. ✅ Inspector Performance Report
11. ✅ Approval Statistics Report
12. ✅ System Summary Report

### Phase 4: Additional Documents (สัปดาห์ที่ 4)

13-22. ✅ เอกสารเสริมอื่นๆ

---

## 💡 คำแนะนำเพิ่มเติม

### การออกแบบ Template

**1. ใช้ HTML/CSS ที่สะอาด**

- แยก template แต่ละประเภทชัดเจน
- ใช้ CSS สำหรับ styling
- รองรับการพิมพ์ (print-friendly)

**2. รองรับภาษาไทย**

- ใช้ฟอนต์ TH Sarabun New
- ตรวจสอบ encoding (UTF-8)
- ทดสอบกับข้อความยาว

**3. Performance**

- Cache template ที่ใช้บ่อย
- Generate PDF แบบ async
- ใช้ queue สำหรับ bulk export

**4. User Experience**

- แสดง progress bar ขณะสร้าง PDF
- ให้ preview ก่อนดาวน์โหลด
- รองรับ bulk download (zip)

---

**Estimated Development Time:**

- Setup & Infrastructure: 2 days
- Phase 1 (4 documents): 3 days
- Phase 2 (4 documents): 3 days
- Phase 3 (4 documents): 2 days
- Phase 4 (10 documents): 4 days
- Testing & Refinement: 2 days
- **Total: 16 days (3-4 weeks)**

**Current Status:** Not started (0%)
**Next Priority:** Setup PDF generation infrastructure
