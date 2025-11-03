# 🔬 GACP + Legal Compliance - System Analysis & Expansion

**วันที่:** 3 พฤศจิกายน 2025  
**เวอร์ชัน:** 2.0 - GACP Compliant Edition

---

## 📋 สารบัญ

1. [ภาพรวมระบบปัจจุบัน](#1-overview)
2. [GACP Requirements Gap Analysis](#2-gacp-gap)
3. [Legal Compliance Requirements](#3-legal)
4. [Database Schema Extensions](#4-schema)
5. [API Endpoints Extensions](#5-api)
6. [Frontend Forms Additions](#6-forms)
7. [Traceability System](#7-traceability)
8. [Audit & Inspection Module](#8-audit)
9. [Implementation Roadmap](#9-roadmap)

---

## 1️⃣ ภาพรวมระบบปัจจุบัน {#1-overview}

### ✅ ที่มีอยู่แล้ว (Based on PT9 Forms)

| Module | Status | Completeness |
|--------|--------|--------------|
| Users Management | ✅ | 95% |
| Farm Registration | ✅ | 70% |
| Document Upload | ✅ | 100% |
| GPS Location | ✅ | 100% |
| Thai Address | ✅ | 100% |
| File Management | ✅ | 100% |
| Audit Logs | ✅ | 100% |

### ❌ ที่ยังขาด (GACP & Legal)

| Module | Missing | Priority |
|--------|---------|----------|
| Soil/Water Testing | ❌ 0% | 🔴 Critical |
| Input Materials Tracking | ❌ 0% | 🔴 Critical |
| Harvest Recording | ❌ 0% | 🔴 Critical |
| Batch/Lot Management | ❌ 0% | 🔴 Critical |
| SOP Documentation | ❌ 0% | 🟡 High |
| Internal Audit | ❌ 0% | 🟡 High |
| License Management | ❌ 0% | 🔴 Critical |
| GACP Certificate | ❌ 0% | 🟡 High |
| Polygon Boundaries | ❌ 0% | 🟢 Medium |
| Compliance Dashboard | ❌ 0% | 🟡 High |

---

## 2️⃣ GACP Requirements Gap Analysis {#2-gacp}

### 📚 GACP (Good Agricultural and Collection Practices) หลักการ

GACP มีหลักการ 5 ประการหลัก:

1. **ความปลอดภัยของผลิตภัณฑ์** - ต้องปลอดสารพิษ
2. **คุณภาพของผลิตภัณฑ์** - คุณภาพตรงตามมาตรฐาน
3. **Traceability** - สามารถติดตามย้อนกลับได้
4. **เอกสารและบันทึก** - มีหลักฐานครบถ้วน
5. **การตรวจสอบภายใน** - มีระบบตรวจสอบ

### 🔍 Gap Analysis แต่ละหลักการ

#### Principle 1: Product Safety (ความปลอดภัย)

| GACP Requirement | Current Status | Action Needed |
|------------------|----------------|---------------|
| ✅ ทดสอบดิน (Soil Analysis) | ❌ ไม่มี | เพิ่ม soilTest collection |
| ✅ ทดสอบน้ำ (Water Analysis) | ⚠️ มีแต่ไม่ละเอียด | ขยาย waterTest fields |
| ✅ วิเคราะห์โลหะหนัก (Heavy Metals) | ❌ ไม่มี | เพิ่ม heavyMetalTest |
| ✅ วิเคราะห์สารเคมีตกค้าง | ❌ ไม่มี | เพิ่ม pesticideResidueTest |
| ✅ พื้นที่ปลอดภัย (Safe Zone) | ⚠️ มี GPS แต่ไม่เช็ค | เพิ่ม zoneVerification |
| ✅ ควบคุมสารกำจัดศัตรูพืช | ⚠️ มีแต่ไม่ track | เพิ่ม pestControlLog |

#### Principle 2: Product Quality (คุณภาพ)

| GACP Requirement | Current Status | Action Needed |
|------------------|----------------|---------------|
| ✅ พันธุ์พืชรับรอง | ⚠️ มี variety แต่ไม่เชื่อม cert | เพิ่ม seedCertification |
| ✅ วิธีการปลูกมาตรฐาน | ✅ มี plantingMethod | - |
| ✅ การเก็บรักษาหลังเก็บเกี่ยว | ❌ ไม่มี | เพิ่ม postHarvestHandling |
| ✅ สภาพแวดล้อมเหมาะสม | ⚠️ มี quality partial | ขยาย environmentalConditions |
| ✅ การอบแห้ง/แปรรูป | ❌ ไม่มี | เพิ่ม processingLog |

#### Principle 3: Traceability (ติดตามย้อนกลับ)

| GACP Requirement | Current Status | Action Needed |
|------------------|----------------|---------------|
| ✅ Lot Number | ❌ ไม่มี | 🔴 เพิ่ม lotManagement |
| ✅ Batch Number | ❌ ไม่มี | 🔴 เพิ่ม batchTracking |
| ✅ บันทึกการเก็บเกี่ยว | ❌ ไม่มี | 🔴 เพิ่ม harvestRecords |
| ✅ บันทึกวัสดุปลูก | ❌ ไม่มี | 🔴 เพิ่ม inputMaterials |
| ✅ บันทึกการขาย | ❌ ไม่มี | 🔴 เพิ่ม salesRecords |
| ✅ Chain of Custody | ❌ ไม่มี | 🔴 เพิ่ม custodyChain |

#### Principle 4: Documentation (เอกสาร)

| GACP Requirement | Current Status | Action Needed |
|------------------|----------------|---------------|
| ✅ SOP การปลูก | ❌ ไม่มี | เพิ่ม sopDocuments |
| ✅ บันทึกกิจกรรมรายวัน | ❌ ไม่มี | เพิ่ม dailyActivityLog |
| ✅ การฝึกอบรมพนักงาน | ❌ ไม่มี | เพิ่ม trainingRecords |
| ✅ เอกสารสารเคมี (MSDS) | ❌ ไม่มี | เพิ่ม msdsDocuments |
| ✅ บันทึกอุปกรณ์ | ❌ ไม่มี | เพิ่ม equipmentLog |

#### Principle 5: Internal Audit (การตรวจสอบ)

| GACP Requirement | Current Status | Action Needed |
|------------------|----------------|---------------|
| ✅ แผนการตรวจ | ❌ ไม่มี | เพิ่ม auditPlan |
| ✅ บันทึกการตรวจ | ⚠️ มี auditLogs พื้นฐาน | ขยาย internalAuditRecords |
| ✅ Non-conformance | ❌ ไม่มี | เพิ่ม nonConformanceLog |
| ✅ Corrective Actions | ❌ ไม่มี | เพิ่ม correctiveActions |
| ✅ Follow-up | ❌ ไม่มี | เพิ่ม auditFollowUp |

---

## 3️⃣ Legal Compliance Requirements {#3-legal}

### 📜 กฎหมายที่เกี่ยวข้อง

1. **พ.ร.บ. ยา พ.ศ. 2510** (Drug Act)
2. **พ.ร.บ. ควบคุมยาเสพติด พ.ศ. 2522**
3. **ประกาศกระทรวงสาธารณสุข** เรื่องพืชสมุนไพรควบคุม
4. **มาตรฐาน GACP ของ WHO/FAO**

### 🔐 License Management (ใบอนุญาต)

| License Type | Description | Required Fields |
|-------------|-------------|-----------------|
| **PT9** | ใบอนุญาตเพาะปลูก | ✅ มีแล้วใน PT9 Forms |
| **PT10** | ใบอนุญาตแปรรูป | ❌ ยังไม่มี |
| **PT11** | ใบอนุญาตจำหน่าย | ❌ ยังไม่มี |
| **GACP Certificate** | ใบรับรอง GACP | ❌ ยังไม่มี |
| **Organic Cert** | ใบรับรองเกษตรอินทรีย์ | ⚠️ มีแต่ไม่ครบ |
| **GMP** | Good Manufacturing Practice | ❌ ยังไม่มี |

### 📋 Required Legal Fields

```typescript
interface LegalCompliance {
  // ใบอนุญาต
  licenses: [
    {
      type: 'PT9' | 'PT10' | 'PT11' | 'GACP' | 'ORGANIC' | 'GMP';
      licenseNumber: string;
      issuedBy: string; // กรมการแพทย์แผนไทย ฯลฯ
      issueDate: Date;
      expiryDate: Date;
      status: 'active' | 'expired' | 'suspended' | 'revoked';
      certificateFileId: ObjectId;
      renewalDate?: Date;
      conditions?: string[]; // เงื่อนไขพิเศษ
    }
  ];

  // การแจ้งเปลี่ยนแปลง
  changeNotifications: [
    {
      changeType: 'location' | 'owner' | 'crop' | 'method' | 'area';
      changeDate: Date;
      notifiedTo: string; // หน่วยงาน
      notificationDate: Date;
      approvalStatus: 'pending' | 'approved' | 'rejected';
      remarks: string;
    }
  ];

  // การตรวจสอบโซนพื้นที่
  zoneCompliance: {
    isInAllowedZone: boolean;
    zoneType: 'agricultural' | 'protected' | 'reserved' | 'restricted';
    verifiedBy: string; // API / Manual
    verifiedAt: Date;
    restrictedReason?: string;
  };

  // พืชควบคุม (ถ้ามี)
  controlledPlants: [
    {
      plantName: string;
      controlLevel: 'high' | 'medium' | 'low';
      quotaAllowed?: number; // ปริมาณที่อนุญาต
      quotaUsed?: number;
      specialPermitRequired: boolean;
    }
  ];
}
```

---

## 4️⃣ Database Schema Extensions {#4-schema}

### 🗄️ New Collections

#### A. **soilTests** (การทดสอบดิน)

```typescript
{
  _id: ObjectId,
  farmId: ObjectId,
  testDate: Date,
  labName: string,
  labCertNumber: string,
  results: {
    pH: { value: Number, unit: String, status: 'pass'|'fail' },
    organicMatter: { value: Number, unit: '%', status: 'pass'|'fail' },
    nitrogen: { value: Number, unit: 'mg/kg' },
    phosphorus: { value: Number, unit: 'mg/kg' },
    potassium: { value: Number, unit: 'mg/kg' },
    heavyMetals: {
      lead: { value: Number, limit: Number, status: 'pass'|'fail' },
      cadmium: { value: Number, limit: Number, status: 'pass'|'fail' },
      mercury: { value: Number, limit: Number, status: 'pass'|'fail' },
      arsenic: { value: Number, limit: Number, status: 'pass'|'fail' }
    },
    salinity: { value: Number, unit: 'dS/m' },
    texture: String, // 'clay' | 'loam' | 'sand'
  },
  reportFileId: ObjectId,
  gacpCompliant: boolean,
  remarks: String,
  nextTestDue: Date,
  createdAt: Date
}
```

#### B. **waterTests** (การทดสอบน้ำ)

```typescript
{
  _id: ObjectId,
  farmId: ObjectId,
  testDate: Date,
  source: 'well' | 'river' | 'canal' | 'rainwater' | 'municipal',
  labName: string,
  results: {
    pH: { value: Number, status: 'pass'|'fail' },
    turbidity: { value: Number, unit: 'NTU', status: 'pass'|'fail' },
    totalDissolvedSolids: { value: Number, unit: 'mg/L' },
    electricalConductivity: { value: Number, unit: 'µS/cm' },
    bacteria: {
      totalColiform: { value: Number, limit: Number, status: 'pass'|'fail' },
      eColi: { value: Number, limit: Number, status: 'pass'|'fail' }
    },
    heavyMetals: {
      lead: { value: Number, limit: Number, status: 'pass'|'fail' },
      cadmium: { value: Number, limit: Number, status: 'pass'|'fail' },
      mercury: { value: Number, limit: Number, status: 'pass'|'fail' }
    },
    pesticides: [
      {
        name: String,
        value: Number,
        limit: Number,
        status: 'pass'|'fail'
      }
    ]
  },
  reportFileId: ObjectId,
  gacpCompliant: boolean,
  nextTestDue: Date,
  createdAt: Date
}
```

#### C. **inputMaterials** (วัสดุปลูก/ปุ๋ย/สารเคมี)

```typescript
{
  _id: ObjectId,
  farmId: ObjectId,
  type: 'seed' | 'fertilizer' | 'pesticide' | 'herbicide' | 'fungicide' | 'organic',
  productName: String,
  manufacturer: String,
  registrationNumber: String, // เลขทะเบียนของ อย.
  batchNumber: String,
  lotNumber: String,
  quantity: Number,
  unit: String,
  purchaseDate: Date,
  supplier: String,
  cost: Number,
  usageRecords: [
    {
      usedDate: Date,
      plotId: ObjectId, // แปลงที่ใช้
      quantity: Number,
      appliedBy: ObjectId, // user id
      method: String, // วิธีการใช้
      weather: String, // สภาพอากาศขณะใช้
      remarks: String
    }
  ],
  msdsFileId: ObjectId, // Material Safety Data Sheet
  gacpApproved: boolean,
  expiryDate: Date,
  storageLocation: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### D. **harvestRecords** (บันทึกการเก็บเกี่ยว)

```typescript
{
  _id: ObjectId,
  farmId: ObjectId,
  plotId: ObjectId,
  cropId: ObjectId,
  harvestDate: Date,
  lotNumber: String, // PT27-2024-001
  batchNumber: String, // BATCH-001
  quantity: {
    fresh: Number,
    dried?: Number,
    unit: 'kg' | 'ton'
  },
  quality: {
    grade: 'A' | 'B' | 'C',
    moisture: Number, // %
    appearance: String,
    defects: String,
  },
  harvestedBy: [ObjectId], // worker ids
  weather: String,
  storageLocation: String,
  packagingMethod: String,
  photos: [ObjectId],
  chainOfCustody: [
    {
      transferDate: Date,
      from: String,
      to: String,
      purpose: String,
      quantity: Number,
      transportMethod: String,
      receivedBy: String,
      signature: String
    }
  ],
  gacpVerified: boolean,
  createdAt: Date
}
```

#### E. **sopDocuments** (Standard Operating Procedures)

```typescript
{
  _id: ObjectId,
  farmId: ObjectId,
  category: 'planting' | 'harvesting' | 'processing' | 'storage' | 'pest_control' | 'safety',
  title: String,
  version: String,
  effectiveDate: Date,
  reviewDate: Date,
  content: String, // หรือ Markdown
  fileId: ObjectId, // PDF
  approvedBy: ObjectId,
  status: 'draft' | 'active' | 'archived',
  trainingRequired: boolean,
  trainedPersonnel: [
    {
      userId: ObjectId,
      trainedDate: Date,
      assessmentScore?: Number,
      certificateFileId?: ObjectId
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

#### F. **internalAudits** (การตรวจสอบภายใน)

```typescript
{
  _id: ObjectId,
  farmId: ObjectId,
  auditType: 'scheduled' | 'surprise' | 'follow_up',
  auditDate: Date,
  auditorId: ObjectId,
  scope: String[], // ['soil', 'water', 'storage', 'documentation']
  checklistUsed: ObjectId,
  findings: [
    {
      area: String,
      observation: String,
      severity: 'critical' | 'major' | 'minor' | 'observation',
      gacpClause: String, // ข้อที่เกี่ยวข้อง
      evidence: [ObjectId], // photos
      isConformance: boolean
    }
  ],
  nonConformances: [
    {
      ncNumber: String, // NC-2024-001
      description: String,
      rootCause: String,
      correctiveAction: String,
      responsiblePerson: ObjectId,
      dueDate: Date,
      status: 'open' | 'in_progress' | 'closed' | 'verified',
      closureDate?: Date,
      verifiedBy?: ObjectId,
      verificationEvidence?: [ObjectId]
    }
  ],
  overallRating: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant',
  reportFileId: ObjectId,
  nextAuditDue: Date,
  createdAt: Date
}
```

#### G. **licenses** (ใบอนุญาต/ใบรับรอง)

```typescript
{
  _id: ObjectId,
  entityType: 'user' | 'farm',
  entityId: ObjectId,
  licenseType: 'PT9' | 'PT10' | 'PT11' | 'GACP' | 'ORGANIC' | 'GMP' | 'HALAL' | 'KOSHER',
  licenseNumber: String,
  issuedBy: String,
  issueDate: Date,
  expiryDate: Date,
  status: 'active' | 'expired' | 'suspended' | 'revoked' | 'renewal_pending',
  certificateFileId: ObjectId,
  conditions: [String],
  scope: String, // ขอบเขตการรับรอง
  annualReviewDates: [Date],
  renewalHistory: [
    {
      renewalDate: Date,
      newExpiryDate: Date,
      cost: Number,
      processedBy: ObjectId
    }
  ],
  suspensionHistory: [
    {
      suspendedDate: Date,
      reason: String,
      reinstatedDate?: Date
    }
  ],
  alerts: {
    expiryWarning: boolean,
    daysUntilExpiry: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5️⃣ API Endpoints Extensions {#5-api}

### 🌐 New API Routes

#### A. Soil & Water Testing

```typescript
POST   /api/farms/:farmId/soil-tests          // เพิ่มผลทดสอบดิน
GET    /api/farms/:farmId/soil-tests          // ดูประวัติทดสอบดิน
GET    /api/farms/:farmId/soil-tests/latest   // ผลล่าสุด
PUT    /api/soil-tests/:id                    // อัปเดต

POST   /api/farms/:farmId/water-tests         // เพิ่มผลทดสอบน้ำ
GET    /api/farms/:farmId/water-tests         // ดูประวัติ
GET    /api/farms/:farmId/water-tests/latest  // ผลล่าสุด
```

#### B. Input Materials Tracking

```typescript
POST   /api/farms/:farmId/inputs                     // เพิ่มวัสดุใหม่
GET    /api/farms/:farmId/inputs                     // รายการวัสดุทั้งหมด
POST   /api/farms/:farmId/inputs/:id/use             // บันทึกการใช้
GET    /api/farms/:farmId/inputs/expiring            // วัสดุใกล้หมดอายุ
GET    /api/farms/:farmId/inputs/inventory           // Stock overview
```

#### C. Harvest & Traceability

```typescript
POST   /api/farms/:farmId/harvests                   // บันทึกการเก็บเกี่ยว
GET    /api/farms/:farmId/harvests                   // ประวัติการเก็บเกี่ยว
GET    /api/harvests/:id/traceability                // ติดตามย้อนกลับ
POST   /api/harvests/:id/transfer                    // โอนสินค้า/ขาย
GET    /api/lots/:lotNumber/history                  // ประวัติ lot
GET    /api/batches/:batchNumber/chain               // Chain of custody
```

#### D. SOP & Training

```typescript
POST   /api/farms/:farmId/sops                       // เพิ่ม SOP
GET    /api/farms/:farmId/sops                       // รายการ SOP
PUT    /api/sops/:id/version                         // สร้าง version ใหม่
POST   /api/sops/:id/training                        // บันทึกการอบรม
GET    /api/users/:userId/training-records           // ประวัติอบรม
```

#### E. Internal Audits

```typescript
POST   /api/farms/:farmId/audits                     // สร้างการตรวจ
GET    /api/farms/:farmId/audits                     // ประวัติตรวจ
PUT    /api/audits/:id/findings                      // บันทึกผล
POST   /api/audits/:id/non-conformances              // เพิ่ม NC
PUT    /api/non-conformances/:id/corrective-action   // แก้ไข NC
GET    /api/farms/:farmId/compliance-score           // คะแนนรวม
```

#### F. License Management

```typescript
POST   /api/licenses                                 // ขอใบอนุญาตใหม่
GET    /api/licenses/entity/:type/:id                // ใบอนุญาตของ farm/user
PUT    /api/licenses/:id/renew                       // ต่ออายุ
GET    /api/licenses/expiring                        // ใบอนุญาตใกล้หมดอายุ
POST   /api/licenses/:id/suspend                     // พักใบอนุญาต
```

#### G. GACP Compliance Dashboard

```typescript
GET    /api/farms/:farmId/gacp-status                // สถานะ GACP
GET    /api/farms/:farmId/compliance-report          // รายงานความครบถ้วน
GET    /api/farms/:farmId/readiness-score            // คะแนนพร้อมรับรอง
GET    /api/gacp/requirements                        // รายการข้อกำหนด
POST   /api/farms/:farmId/gacp-application           // ยื่นขอรับรอง GACP
```

---

## 6️⃣ Frontend Forms Additions {#6-forms}

### 📝 New Forms Needed

#### Form 1: Soil Test Entry

```typescript
interface SoilTestForm {
  testDate: Date;
  labName: string;
  labCertNumber: string;
  
  // Results
  pH: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  
  // Heavy Metals
  lead: number;
  cadmium: number;
  mercury: number;
  arsenic: number;
  
  salinity: number;
  texture: 'clay' | 'loam' | 'sand' | 'mixed';
  
  reportFile: File; // PDF upload
  remarks?: string;
}
```

#### Form 2: Input Material Registration

```typescript
interface InputMaterialForm {
  type: 'seed' | 'fertilizer' | 'pesticide' | 'herbicide' | 'fungicide';
  productName: string;
  manufacturer: string;
  registrationNumber: string; // เลขทะเบียน อย.
  batchNumber: string;
  quantity: number;
  unit: string;
  purchaseDate: Date;
  supplier: string;
  cost: number;
  msdsFile?: File; // Material Safety Data Sheet
  expiryDate: Date;
  storageLocation: string;
}
```

#### Form 3: Harvest Recording

```typescript
interface HarvestForm {
  plotId: string;
  cropId: string;
  harvestDate: Date;
  
  // Auto-generate
  lotNumber: string; // PT27-2024-001
  batchNumber: string;
  
  // Quantity
  freshWeight: number;
  driedWeight?: number;
  unit: 'kg' | 'ton';
  
  // Quality
  grade: 'A' | 'B' | 'C';
  moisture: number; // %
  appearance: string;
  defects?: string;
  
  harvestedBy: string[]; // Worker IDs
  weather: string;
  storageLocation: string;
  packagingMethod: string;
  photos: File[]; // 3-5 รูป
}
```

#### Form 4: Internal Audit

```typescript
interface InternalAuditForm {
  auditType: 'scheduled' | 'surprise' | 'follow_up';
  auditDate: Date;
  scope: string[]; // ['soil', 'water', 'storage']
  
  findings: Array<{
    area: string;
    observation: string;
    severity: 'critical' | 'major' | 'minor';
    gacpClause: string;
    evidencePhotos: File[];
    isConformance: boolean;
  }>;
  
  nonConformances: Array<{
    description: string;
    rootCause: string;
    correctiveAction: string;
    responsiblePerson: string;
    dueDate: Date;
  }>;
  
  overallRating: 'compliant' | 'minor_issues' | 'major_issues';
  reportFile?: File;
}
```

#### Form 5: License Application

```typescript
interface LicenseApplicationForm {
  licenseType: 'PT9' | 'PT10' | 'PT11' | 'GACP';
  entityType: 'user' | 'farm';
  entityId: string;
  
  // Supporting Documents
  applicationLetter: File;
  identityDocs: File[];
  businessRegistration?: File;
  facilityPhotos: File[];
  qualityDocuments: File[];
  
  // For GACP
  soilTestReport?: File;
  waterTestReport?: File;
  sopDocuments?: File[];
  trainingRecords?: File[];
  previousCertificates?: File[];
  
  remarks?: string;
}
```

---

## 7️⃣ Traceability System {#7-traceability}

### 🔗 Chain of Custody Flow

```
[พืช/เมล็ด] → [ปลูก] → [ดูแล] → [เก็บเกี่ยว] → [แปรรูป] → [บรรจุ] → [จำหน่าย]
    ↓           ↓        ↓         ↓            ↓           ↓          ↓
  Seed ID   Plot ID   Input    Lot Number   Batch No.  Package    Sales
   Record    Farm     Logs      PT27-xxx     BATCH-xx     QR      Invoice
```

### 📊 Traceability Data Model

```typescript
interface TraceabilityRecord {
  productId: string;
  lotNumber: string;
  batchNumber: string;
  
  // Origin
  origin: {
    farmId: ObjectId;
    plotId: ObjectId;
    farmerName: string;
    gpsCoordinates: [number, number];
    plantingDate: Date;
  };
  
  // Cultivation
  cultivation: {
    seedSource: string;
    seedCertNumber?: string;
    inputsUsed: Array<{
      materialId: ObjectId;
      productName: string;
      quantity: number;
      appliedDate: Date;
    }>;
    growingPeriod: number; // days
  };
  
  // Harvest
  harvest: {
    harvestDate: Date;
    harvestedBy: string[];
    freshWeight: number;
    quality: string;
  };
  
  // Processing
  processing?: {
    method: string;
    processedDate: Date;
    processedBy: ObjectId;
    driedWeight: number;
    moistureContent: number;
  };
  
  // Testing
  testing: {
    soilTest: { id: ObjectId, date: Date, status: 'pass'|'fail' };
    waterTest: { id: ObjectId, date: Date, status: 'pass'|'fail' };
    productTest?: { id: ObjectId, date: Date, status: 'pass'|'fail' };
  };
  
  // Certifications
  certifications: Array<{
    type: string;
    certNumber: string;
    issuedDate: Date;
  }>;
  
  // Distribution
  distribution: Array<{
    transferDate: Date;
    from: string;
    to: string;
    quantity: number;
    transportMethod: string;
    documentRef: string;
  }>;
  
  // QR Code
  qrCode: string; // Base64 or URL
  publicViewUrl: string; // สำหรับลูกค้าสแกนดู
}
```

### 🎯 QR Code Tracking

**URL Format:**
```
https://system.example.com/trace/PT27-2024-12345
```

**ข้อมูลที่แสดง:**
- ✅ ต้นกำเนิด (ฟาร์ม + GPS)
- ✅ เกษตรกร
- ✅ วันที่เพาะปลูก
- ✅ วันที่เก็บเกี่ยว
- ✅ ผลทดสอบดิน/น้ำ
- ✅ ใบรับรอง (GACP/Organic)
- ✅ วิธีการปลูก
- ✅ ภาพถ่ายฟาร์ม

---

## 8️⃣ Audit & Inspection Module {#8-audit}

### 👨‍🔬 Inspector Dashboard

#### A. Pending Inspections

```typescript
interface InspectionTask {
  id: string;
  farmId: string;
  farmName: string;
  inspectionType: 'initial' | 'surveillance' | 'recertification';
  scheduledDate: Date;
  priority: 'urgent' | 'high' | 'normal';
  location: {
    address: string;
    gps: [number, number];
  };
  documentsToCheck: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
}
```

#### B. Inspection Checklist

```typescript
interface GACPChecklist {
  sections: [
    {
      category: 'Land & Location';
      items: [
        { id: '1.1', requirement: 'ที่ตั้งห่างจากแหล่งมลพิษ', status: 'pass'|'fail'|'n/a', evidence: [] },
        { id: '1.2', requirement: 'มีแผนที่แสดงพื้นที่', status: 'pass'|'fail'|'n/a', evidence: [] },
        { id: '1.3', requirement: 'ดินและน้ำผ่านการทดสอบ', status: 'pass'|'fail'|'n/a', evidence: [] }
      ]
    },
    {
      category: 'Seed & Planting Material';
      items: [
        { id: '2.1', requirement: 'ใช้พันธุ์รับรอง', status: 'pass'|'fail'|'n/a', evidence: [] },
        { id: '2.2', requirement: 'มีบันทึกแหล่งที่มาเมล็ด', status: 'pass'|'fail'|'n/a', evidence: [] }
      ]
    },
    {
      category: 'Cultivation & Maintenance';
      items: [
        { id: '3.1', requirement: 'มี SOP การปลูก', status: 'pass'|'fail'|'n/a', evidence: [] },
        { id: '3.2', requirement: 'บันทึกการใช้ปุ๋ย/สารเคมี', status: 'pass'|'fail'|'n/a', evidence: [] },
        { id: '3.3', requirement: 'ควบคุมศัตรูพืชตาม IPM', status: 'pass'|'fail'|'n/a', evidence: [] }
      ]
    },
    {
      category: 'Harvesting & Post-Harvest';
      items: [
        { id: '4.1', requirement: 'เก็บเกี่ยวตามเวลาที่เหมาะสม', status: 'pass'|'fail'|'n/a', evidence: [] },
        { id: '4.2', requirement: 'มีการอบแห้ง/เก็บรักษาที่ถูกต้อง', status: 'pass'|'fail'|'n/a', evidence: [] },
        { id: '4.3', requirement: 'มี Lot/Batch tracking', status: 'pass'|'fail'|'n/a', evidence: [] }
      ]
    },
    {
      category: 'Documentation';
      items: [
        { id: '5.1', requirement: 'มีบันทึกกิจกรรมรายวัน', status: 'pass'|'fail'|'n/a', evidence: [] },
        { id: '5.2', requirement: 'เอกสารครบถ้วน', status: 'pass'|'fail'|'n/a', evidence: [] }
      ]
    }
  ];
  
  score: {
    totalItems: number;
    passed: number;
    failed: number;
    notApplicable: number;
    percentage: number;
  };
  
  recommendation: 'approve' | 'conditional' | 'reject';
}
```

---

## 9️⃣ Implementation Roadmap {#9-roadmap}

### 📅 Phase-by-Phase Plan

#### **Phase 1: Critical GACP Foundations (Week 1-2)**

**Priority:** 🔴 Critical

| Task | Effort | Description |
|------|--------|-------------|
| Soil/Water Test Models | 2 days | Create collections + APIs |
| Input Materials Tracking | 2 days | Create tracking system |
| Harvest Records | 2 days | Lot/Batch management |
| License Management | 2 days | PT9/PT10/PT11/GACP |
| **Total** | **8 days** | |

#### **Phase 2: Traceability System (Week 3)**

**Priority:** 🔴 Critical

| Task | Effort | Description |
|------|--------|-------------|
| Chain of Custody | 2 days | From seed to sale |
| QR Code Generation | 1 day | Unique per batch |
| Public Trace Page | 1 day | Customer-facing |
| Traceability API | 1 day | Query endpoints |
| **Total** | **5 days** | |

#### **Phase 3: Documentation & SOP (Week 4)**

**Priority:** 🟡 High

| Task | Effort | Description |
|------|--------|-------------|
| SOP Documents | 2 days | Upload + versioning |
| Training Records | 1 day | Personnel tracking |
| Daily Activity Log | 1 day | Farming activities |
| MSDS Management | 1 day | Chemical docs |
| **Total** | **5 days** | |

#### **Phase 4: Audit & Inspection (Week 5-6)**

**Priority:** 🟡 High

| Task | Effort | Description |
|------|--------|-------------|
| Internal Audit System | 3 days | Audit scheduling |
| GACP Checklist | 2 days | Inspection form |
| Non-conformance Tracking | 2 days | NC + CA |
| Inspector Dashboard | 3 days | Mobile-friendly |
| **Total** | **10 days** | |

#### **Phase 5: Compliance Dashboard (Week 7)**

**Priority:** 🟢 Medium

| Task | Effort | Description |
|------|--------|-------------|
| GACP Readiness Score | 2 days | Algorithm |
| Compliance Reports | 2 days | Auto-generated |
| Alert System | 1 day | Expiry warnings |
| Analytics | 2 days | Charts/graphs |
| **Total** | **7 days** | |

#### **Phase 6: Legal Compliance (Week 8)**

**Priority:** 🟢 Medium

| Task | Effort | Description |
|------|--------|-------------|
| Zone Verification | 2 days | API integration |
| Controlled Plants | 1 day | Quota tracking |
| Change Notifications | 2 days | Government alerts |
| License Renewal | 1 day | Auto-reminders |
| **Total** | **6 days** | |

#### **Phase 7: Testing & UAT (Week 9-10)**

**Priority:** 🔴 Critical

| Task | Effort | Description |
|------|--------|-------------|
| Unit Tests | 3 days | Backend + Frontend |
| Integration Tests | 3 days | E2E flows |
| UAT with Users | 4 days | Real farmers |
| Bug Fixes | 4 days | Issues found |
| **Total** | **14 days** | |

---

### 📊 Total Timeline: **9-10 Weeks**

### 💰 Resource Requirements

| Role | Allocation | Duration |
|------|------------|----------|
| Backend Developer | Full-time | 10 weeks |
| Frontend Developer | Full-time | 10 weeks |
| QA Engineer | Half-time | 4 weeks |
| GACP Consultant | Advisory | As needed |
| Project Manager | Half-time | 10 weeks |

---

## 🎯 Success Metrics

### KPIs to Track

1. **GACP Compliance Score:** Target 95%+
2. **Traceability Coverage:** 100% of harvests
3. **License Renewal Rate:** 95%+
4. **Audit Pass Rate:** 90%+
5. **User Adoption:** 80% of farms using tracking
6. **Data Completeness:** 95%+ fields filled
7. **Response Time:** <24h for inspections

---

## 📚 References

1. WHO Guidelines on GACP - https://www.who.int/publications
2. กระทรวงสาธารณสุข - มาตรฐาน GACP ไทย
3. FAO GACP Standards
4. กรมการแพทย์แผนไทยฯ - ระเบียบใบอนุญาต

---

**เอกสารนี้พร้อมใช้สำหรับการพัฒนาต่อครับ!** 🚀
