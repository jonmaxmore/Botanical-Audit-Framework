# 🌿 GACP Certification Application System - Complete Design

**วันที่:** 3 พฤศจิกายน 2025  
**เวอร์ชัน:** 1.0  
**Purpose:** ระบบยื่นขอรับรองมาตรฐาน GACP สำหรับพืชสมุนไพร (โดยเฉพาะกัญชา)

---

## 📋 Table of Contents

1. [System Overview](#1-overview)
2. [GACP Application Types](#2-types)
3. [Application Workflow](#3-workflow)
4. [Required Documents](#4-documents)
5. [Database Schema](#5-schema)
6. [Frontend Forms Design](#6-forms)
7. [API Endpoints](#7-api)
8. [SOP Checklist Implementation](#8-sop)
9. [Implementation Plan](#9-plan)

---

## 1️⃣ System Overview {#1-overview}

### GACP Certification Overview

| Aspect | GACP Certification |
|--------|-------------------|
| **Purpose** | ใบรับรองมาตรฐานคุณภาพ |
| **Issuer** | กรมการแพทย์แผนไทย (Traditional Medicine Dept) |
| **Process** | สมัคร → ตรวจสอบเอกสาร → ตรวจประเมินภาคสนาม → รับรอง |
| **Duration** | 90-180 วัน |
| **Validity** | 3 ปี |
| **Focus** | Quality & Safety Standards |
| **Documents** | 20+ เอกสาร + SOP |
| **Inspection** | **Mandatory** (ภาคสนาม) |
| **Standards** | WHO GACP + ASEAN + Thai FDA |

### GACP Certification Scope

ระบบรับรองมาตรฐาน GACP ครอบคลุม:

1. **แหล่งปลูก** (Cultivation Site)
2. **การเก็บรวบรวม** (Collection)
3. **แปรรูปเบื้องต้น** (Primary Processing)

---

## 2️⃣ GACP Application Types {#2-types}

### Type 1: GACP-Cultivation (การปลูก)

**สำหรับ:** ฟาร์มปลูกพืชสมุนไพร

**ขั้นตอนหลัก:**
1. Pre-Planting (เตรียมพื้นที่)
2. Planting (การปลูก)
3. Growing (การดูแล)
4. Harvesting (เก็บเกี่ยว)
5. Post-Harvest (หลังเก็บเกี่ยว)

### Type 2: GACP-Collection (การเก็บรวบรวม)

**สำหรับ:** การเก็บพืชสมุนไพรจากธรรมชาติ

**ขั้นตอนหลัก:**
1. Area Survey (สำรวจพื้นที่)
2. Collection Planning (วางแผนเก็บ)
3. Collection Process (กระบวนการเก็บ)
4. Post-Collection (หลังเก็บ)

### Type 3: GACP-Processing (แปรรูปเบื้องต้น)

**สำหรับ:** โรงแปรรูปเบื้องต้น (ตาก อบ คัด บรรจุ)

**ขั้นตอนหลัก:**
1. Receiving (รับวัตถุดิบ)
2. Cleaning (ทำความสะอาด)
3. Drying (อบแห้ง)
4. Sorting (คัดแยก)
5. Packaging (บรรจุ)

---

## 3️⃣ Application Workflow {#3-workflow}

### Phase-by-Phase Process

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: Online Application (1-2 สัปดาห์)                  │
├─────────────────────────────────────────────────────────────┤
│  1. เกษตรกร/ผู้ประกอบการลงทะเบียน                          │
│  2. กรอกข้อมูลฟาร์ม/สถานประกอบการ                         │
│  3. อัปโหลดเอกสารประกอบ (20+ ไฟล์)                          │
│  4. ชำระค่าธรรมเนียม (3,000-10,000 บาท)                    │
│  5. ส่งคำขอออนไลน์                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: Document Review (2-4 สัปดาห์)                     │
├─────────────────────────────────────────────────────────────┤
│  6. เจ้าหน้าที่ตรวจสอบเอกสาร                               │
│  7. ประเมินความครบถ้วน (Completeness Check)                │
│  8. ประเมินความเสี่ยง (Risk Assessment)                     │
│  9. Decision:                                               │
│     - APPROVED → Schedule Field Inspection                  │
│     - REVISION → Return to Applicant                        │
│     - REJECTED → End with Reason                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: Field Inspection (1 วัน)                          │
├─────────────────────────────────────────────────────────────┤
│ 10. เจ้าหน้าที่ลงพื้นที่ตรวจประเมิน                        │
│ 11. ตรวจสอบตาม GACP Checklist (100 items)                  │
│ 12. เก็บตัวอย่างส่งตรวจ (ดิน/น้ำ/พืช)                      │
│ 13. ถ่ายรูปประกอบ                                           │
│ 14. สัมภาษณ์เจ้าของฟาร์ม/พนักงาน                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 4: Laboratory Testing (2-4 สัปดาห์)                  │
├─────────────────────────────────────────────────────────────┤
│ 15. ทดสอบดิน (Soil Analysis)                                │
│ 16. ทดสอบน้ำ (Water Quality)                                │
│ 17. ทดสอบสารเคมีตกค้าง (Pesticide Residue)                 │
│ 18. ทดสอบโลหะหนัก (Heavy Metals)                            │
│ 19. ทดสอบจุลินทรีย์ (Microbiology)                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 5: Evaluation & Decision (1-2 สัปดาห์)               │
├─────────────────────────────────────────────────────────────┤
│ 20. คณะกรรมการพิจารณา                                      │
│ 21. คำนวณคะแนนรวม (Scoring)                                │
│ 22. Decision:                                               │
│     - PASS (≥80) → Issue Certificate                        │
│     - CONDITIONAL PASS (70-79) → CAR Required               │
│     - FAIL (<70) → Re-application after 6 months            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 6: Certificate Issuance (1 สัปดาห์)                  │
├─────────────────────────────────────────────────────────────┤
│ 23. ออกใบรับรองแบบดิจิทัล                                  │
│ 24. สร้าง QR Code                                           │
│ 25. ลงทะเบียนในระบบสาธารณะ                                 │
│ 26. ส่งใบรับรองให้ผู้สมัคร                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 7: Surveillance & Renewal (Annual)                   │
├─────────────────────────────────────────────────────────────┤
│ 27. Surveillance Visit (ปีที่ 1, 2)                         │
│ 28. Certificate Renewal (ปีที่ 3)                           │
│ 29. Market Sample Testing                                   │
│ 30. Complaint Investigation                                 │
└─────────────────────────────────────────────────────────────┘
```

### Status Flow Diagram

```
NEW APPLICATION
    ↓
SUBMITTED → UNDER_REVIEW ──→ REVISION_REQUIRED ──┐
    ↓                              ↓              │
DOCUMENT_APPROVED              RESUBMITTED ←──────┘
    ↓
INSPECTION_SCHEDULED
    ↓
INSPECTION_IN_PROGRESS
    ↓
LAB_TESTING
    ↓
EVALUATION ──→ CONDITIONAL_PASS → CAR_SUBMITTED → CAR_VERIFIED
    ↓                                                   ↓
APPROVED ←──────────────────────────────────────────────┘
    ↓
CERTIFICATE_ISSUED
    ↓
ACTIVE (3 years) ──→ RENEWAL_DUE ──→ RENEWED
    ↓                      ↓
SUSPENDED            EXPIRED
    ↓
REVOKED
```

---

## 4️⃣ Required Documents {#4-documents}

### Document Checklist (GACP-Cultivation)

#### **Category A: Organization/Personal Documents (6 items)**

| No. | Document Name | Thai Name | Format | Required |
|-----|--------------|-----------|--------|----------|
| A1 | National ID / Company Registration | สำเนาบัตรประชาชน / ทะเบียนนิติบุคคล | PDF | ✅ Yes |
| A2 | House Registration | สำเนาทะเบียนบ้าน | PDF | ✅ Yes |
| A3 | VAT Registration (if any) | ทะเบียนภาษีมูลค่าเพิ่ม | PDF | ⚪ Optional |
| A4 | Business License | ใบอนุญาตประกอบกิจการ | PDF | ✅ Yes |
| A5 | PT9 License | ใบอนุญาต PT9 (ถ้ามี) | PDF | ⚪ Optional |
| A6 | Organization Chart | แผนผังองค์กร | PDF/Image | ✅ Yes |

#### **Category B: Site & Facility Documents (7 items)**

| No. | Document Name | Thai Name | Format | Required |
|-----|--------------|-----------|--------|----------|
| B1 | Land Title Deed / Lease Agreement | โฉนดที่ดิน / สัญญาเช่า | PDF | ✅ Yes |
| B2 | Site Plan with GPS | แผนผังพื้นที่ + พิกัด GPS | PDF/CAD | ✅ Yes |
| B3 | Farm Layout Map | แผนผังฟาร์ม (แปลง) | PDF/Image | ✅ Yes |
| B4 | Facility Photos (min 10) | รูปถ่ายสถานที่ | JPG/PNG | ✅ Yes |
| B5 | Storage Area Photos | รูปถ่ายคลังเก็บ | JPG/PNG | ✅ Yes |
| B6 | Water Source Documentation | เอกสารแหล่งน้ำ | PDF | ✅ Yes |
| B7 | Drainage System Plan | แผนระบบระบายน้ำ | PDF/Image | ✅ Yes |

#### **Category C: Testing & Analysis (5 items)**

| No. | Document Name | Thai Name | Format | Required |
|-----|--------------|-----------|--------|----------|
| C1 | Soil Test Report (< 6 months) | รายงานทดสอบดิน | PDF | ✅ Yes |
| C2 | Water Test Report (< 3 months) | รายงานทดสอบน้ำ | PDF | ✅ Yes |
| C3 | Heavy Metal Test | ทดสอบโลหะหนัก | PDF | ✅ Yes |
| C4 | Pesticide Residue Test | ทดสอบสารเคมีตกค้าง | PDF | ⚪ Optional |
| C5 | Environmental Risk Assessment | ประเมินผลกระทบสิ่งแวดล้อม | PDF | ✅ Yes |

#### **Category D: Seed & Planting Material (4 items)**

| No. | Document Name | Thai Name | Format | Required |
|-----|--------------|-----------|--------|----------|
| D1 | Seed Certificate | ใบรับรองเมล็ดพันธุ์ | PDF | ✅ Yes |
| D2 | Seed Source Documentation | เอกสารแหล่งที่มาเมล็ด | PDF | ✅ Yes |
| D3 | Genetic Purity Certificate | ใบรับรองความบริสุทธิ์พันธุกรรม | PDF | ⚪ Optional |
| D4 | Phytosanitary Certificate | ใบรับรองสุขอนามัยพืช | PDF | ⚪ Optional |

#### **Category E: SOP & Quality Management (10+ items)**

| No. | Document Name | Thai Name | Format | Required |
|-----|--------------|-----------|--------|----------|
| E1 | Farm Management Plan | แผนการจัดการฟาร์ม | PDF | ✅ Yes |
| E2 | SOP - Land Preparation | SOP เตรียมพื้นที่ | PDF | ✅ Yes |
| E3 | SOP - Planting | SOP การปลูก | PDF | ✅ Yes |
| E4 | SOP - Fertilizer Application | SOP การใส่ปุ๋ย | PDF | ✅ Yes |
| E5 | SOP - Pest Control | SOP กำจัดศัตรูพืช | PDF | ✅ Yes |
| E6 | SOP - Irrigation | SOP การรดน้ำ | PDF | ✅ Yes |
| E7 | SOP - Harvesting | SOP การเก็บเกี่ยว | PDF | ✅ Yes |
| E8 | SOP - Post-Harvest Handling | SOP หลังเก็บเกี่ยว | PDF | ✅ Yes |
| E9 | SOP - Storage | SOP การเก็บรักษา | PDF | ✅ Yes |
| E10 | SOP - Cleaning & Sanitation | SOP ทำความสะอาด | PDF | ✅ Yes |
| E11 | Pest Control Plan | แผนควบคุมศัตรูพืช | PDF | ✅ Yes |
| E12 | Traceability System | ระบบติดตามย้อนกลับ | PDF | ✅ Yes |

#### **Category F: Personnel & Training (4 items)**

| No. | Document Name | Thai Name | Format | Required |
|-----|--------------|-----------|--------|----------|
| F1 | Worker List | รายชื่อพนักงาน | PDF/Excel | ✅ Yes |
| F2 | Training Records | บันทึกการอบรม | PDF | ✅ Yes |
| F3 | Training Certificates | ใบรับรองการอบรม | PDF | ⚪ Optional |
| F4 | Health Certificates | ใบรับรองสุขภาพ | PDF | ✅ Yes |

#### **Category G: Input Materials & Equipment (5 items)**

| No. | Document Name | Thai Name | Format | Required |
|-----|--------------|-----------|--------|----------|
| G1 | Fertilizer Registration Docs | ทะเบียนปุ๋ย | PDF | ✅ Yes |
| G2 | Pesticide Registration Docs | ทะเบียนสารเคมี | PDF | ⚪ Optional |
| G3 | MSDS (Material Safety Data Sheets) | เอกสารความปลอดภัย | PDF | ✅ Yes |
| G4 | Equipment List | รายการอุปกรณ์ | PDF/Excel | ✅ Yes |
| G5 | Equipment Calibration Records | บันทึกการสอบเทียบ | PDF | ⚪ Optional |

#### **Category H: Record Keeping (6 items)**

| No. | Document Name | Thai Name | Format | Required |
|-----|--------------|-----------|--------|----------|
| H1 | Daily Activity Log (3 months) | บันทึกกิจกรรมรายวัน | PDF/Excel | ✅ Yes |
| H2 | Cultivation Records | บันทึกการเพาะปลูก | PDF/Excel | ✅ Yes |
| H3 | Harvest Records | บันทึกการเก็บเกี่ยว | PDF/Excel | ✅ Yes |
| H4 | Input Usage Records | บันทึกการใช้วัสดุ | PDF/Excel | ✅ Yes |
| H5 | Lot/Batch Tracking Records | บันทึกติดตาม Lot/Batch | PDF/Excel | ✅ Yes |
| H6 | Internal Audit Records | บันทึกการตรวจสอบภายใน | PDF | ⚪ Optional |

### **Total Documents Required: 47+ items**
- **Mandatory:** 35 items
- **Optional:** 12 items

---

## 5️⃣ Database Schema {#5-schema}

### Collections/Tables

#### **1. gacpApplications**

```typescript
{
  _id: ObjectId,
  applicationNumber: String, // GACP-2025-0001
  applicationType: 'cultivation' | 'collection' | 'processing',
  
  // Applicant Information
  applicant: {
    type: 'individual' | 'organization',
    
    // If individual
    individual: {
      firstNameTh: String,
      lastNameTh: String,
      nationalId: String,
      dateOfBirth: Date,
      phone: String,
      email: String,
      address: {
        addressLine1: String,
        subDistrict: String,
        district: String,
        province: String,
        postalCode: String
      }
    },
    
    // If organization
    organization: {
      companyNameTh: String,
      companyNameEn: String,
      registrationNumber: String,
      taxId: String,
      vatRegistered: Boolean,
      representative: {
        title: String,
        firstNameTh: String,
        lastNameTh: String,
        position: String,
        phone: String,
        email: String
      }
    }
  },
  
  // Site Information
  site: {
    siteName: String,
    siteType: 'farm' | 'collection_area' | 'processing_facility',
    location: {
      type: 'Point',
      coordinates: [Number, Number] // [lng, lat]
    },
    address: {
      addressLine1: String,
      subDistrict: String,
      district: String,
      province: String,
      postalCode: String,
      nearestLandmark: String
    },
    area: {
      total: Number,
      cultivated: Number,
      unit: 'rai' | 'hectare' | 'sqm'
    },
    landOwnership: 'owned' | 'leased' | 'cooperative',
    landTitleNumber: String
  },
  
  // Cultivation Details (for cultivation type)
  cultivation: {
    plantSpecies: [String], // ['Cannabis sativa', 'Cannabis indica']
    varieties: [String],
    plantingMethod: 'outdoor' | 'greenhouse' | 'indoor' | 'hydroponic',
    estimatedAnnualProduction: {
      quantity: Number,
      unit: 'kg' | 'ton'
    },
    cultivationHistory: {
      yearsExperience: Number,
      previousCrops: [String],
      previousCertifications: [String]
    }
  },
  
  // Documents (Category A-H)
  documents: {
    categoryA: [
      {
        documentId: ObjectId,
        type: 'national_id' | 'company_registration' | 'house_registration' | 'business_license' | 'pt9_license' | 'org_chart',
        fileName: String,
        fileSize: Number,
        uploadedAt: Date,
        status: 'pending' | 'verified' | 'rejected',
        verifiedBy: ObjectId,
        verifiedAt: Date,
        remarks: String
      }
    ],
    categoryB: [...], // Site & Facility
    categoryC: [...], // Testing & Analysis
    categoryD: [...], // Seed & Planting
    categoryE: [...], // SOP & Quality
    categoryF: [...], // Personnel
    categoryG: [...], // Input Materials
    categoryH: [...]  // Record Keeping
  },
  
  // SOP Compliance
  sopCompliance: {
    prePlanting: {
      completed: Boolean,
      documents: [ObjectId],
      checklist: [
        {
          item: String,
          status: 'not_started' | 'in_progress' | 'completed',
          evidence: [ObjectId]
        }
      ]
    },
    planting: { ... },
    growing: { ... },
    harvesting: { ... },
    postHarvest: { ... }
  },
  
  // Fee Payment
  payment: {
    applicationFee: Number,
    inspectionFee: Number,
    testingFee: Number,
    totalAmount: Number,
    paidAmount: Number,
    paymentStatus: 'pending' | 'partial' | 'paid',
    paymentMethod: String,
    paymentDate: Date,
    receiptNumber: String,
    receiptFileId: ObjectId
  },
  
  // Application Status
  status: 'draft' | 'submitted' | 'under_review' | 'revision_required' | 
          'document_approved' | 'inspection_scheduled' | 'inspection_in_progress' |
          'lab_testing' | 'evaluation' | 'conditional_pass' | 'approved' | 
          'certificate_issued' | 'rejected',
  
  statusHistory: [
    {
      status: String,
      date: Date,
      changedBy: ObjectId,
      remarks: String
    }
  ],
  
  // Document Review
  documentReview: {
    reviewedBy: ObjectId,
    reviewDate: Date,
    completenessScore: Number, // 0-100
    comments: String,
    missingDocuments: [String],
    revisionRequired: Boolean
  },
  
  // Risk Assessment
  riskAssessment: {
    assessedBy: ObjectId,
    assessmentDate: Date,
    riskLevel: 'low' | 'medium' | 'high',
    factors: [
      {
        factor: String,
        score: Number,
        weight: Number
      }
    ],
    totalScore: Number,
    recommendations: [String]
  },
  
  // Inspection
  inspection: {
    scheduled: Boolean,
    scheduledDate: Date,
    inspectorId: ObjectId,
    completedDate: Date,
    inspectionReport: ObjectId,
    findings: [
      {
        category: String,
        item: String,
        status: 'conformance' | 'minor_nc' | 'major_nc' | 'critical_nc',
        evidence: [ObjectId],
        remarks: String
      }
    ],
    inspectionScore: Number // 0-100
  },
  
  // Laboratory Testing
  labTesting: {
    samples: [
      {
        sampleId: String,
        sampleType: 'soil' | 'water' | 'plant' | 'product',
        collectionDate: Date,
        labName: String,
        labCertNumber: String,
        testingDate: Date,
        reportDate: Date,
        reportFileId: ObjectId,
        results: {
          parameters: [
            {
              parameter: String,
              value: Number,
              unit: String,
              limit: Number,
              status: 'pass' | 'fail'
            }
          ],
          overallStatus: 'pass' | 'fail'
        }
      }
    ]
  },
  
  // Final Evaluation
  evaluation: {
    evaluatedBy: [ObjectId], // Committee members
    evaluationDate: Date,
    scores: {
      documentation: Number,
      siteInspection: Number,
      labResults: Number,
      riskAssessment: Number
    },
    totalScore: Number,
    decision: 'pass' | 'conditional_pass' | 'fail',
    conditions: [String], // If conditional pass
    remarks: String
  },
  
  // Corrective Action Request (CAR)
  correctiveActions: [
    {
      carNumber: String,
      description: String,
      issuedDate: Date,
      dueDate: Date,
      status: 'open' | 'submitted' | 'verified' | 'closed',
      evidence: [ObjectId],
      verifiedBy: ObjectId,
      verifiedDate: Date,
      remarks: String
    }
  ],
  
  // Certificate
  certificate: {
    certificateNumber: String,
    issueDate: Date,
    expiryDate: Date,
    certificateFileId: ObjectId,
    qrCode: String,
    publicUrl: String,
    scope: String,
    conditions: [String]
  },
  
  // Timeline
  submittedAt: Date,
  approvedAt: Date,
  completedAt: Date,
  
  // Metadata
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6️⃣ Frontend Forms Design {#6-forms}

### Main GACP Application Wizard (7 Steps)

```
┌─────────────────────────────────────────┐
│  GACP Certification Application Wizard  │
├─────────────────────────────────────────┤
│                                         │
│  [1] [2] [3] [4] [5] [6] [7]            │
│   •   ○   ○   ○   ○   ○   ○             │
│                                         │
│  Step 1: Application Type & Applicant   │
│  Step 2: Site Information               │
│  Step 3: Cultivation/Operation Details  │
│  Step 4: Document Upload (47+ files)    │
│  Step 5: SOP Compliance Checklist       │
│  Step 6: Payment                        │
│  Step 7: Review & Submit                │
│                                         │
│  [Back]           [Save Draft] [Next]   │
└─────────────────────────────────────────┘
```

### Step 1: Application Type & Applicant Info

```typescript
interface Step1Form {
  // Application Type
  applicationType: 'cultivation' | 'collection' | 'processing';
  
  // Applicant Type
  applicantType: 'individual' | 'organization';
  
  // Individual (if applicantType = 'individual')
  individual: {
    firstNameTh: string;
    lastNameTh: string;
    nationalId: string; // 13 digits
    dateOfBirth: Date;
    phone: string;
    email: string;
    address: ThaiAddress;
  };
  
  // Organization (if applicantType = 'organization')
  organization: {
    companyNameTh: string;
    companyNameEn: string;
    registrationNumber: string;
    taxId: string;
    vatRegistered: boolean;
    representative: {
      title: string;
      firstNameTh: string;
      lastNameTh: string;
      position: string;
      phone: string;
      email: string;
    };
    address: ThaiAddress;
  };
}
```

### Step 2: Site Information

```typescript
interface Step2Form {
  siteName: string;
  siteType: 'farm' | 'collection_area' | 'processing_facility';
  
  // GPS Location
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    method: 'gps' | 'manual';
  };
  
  // Address
  address: {
    addressLine1: string;
    addressLine2?: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    nearestLandmark: string;
  };
  
  // Area
  area: {
    total: number;
    cultivated: number;
    unit: 'rai' | 'hectare' | 'sqm';
  };
  
  // Land Ownership
  landOwnership: 'owned' | 'leased' | 'cooperative';
  landTitleNumber: string;
  landTitleDocument: File;
  
  // Site Plan
  sitePlanDocument: File;
  farmLayoutMap: File;
  facilityPhotos: File[]; // min 10 photos
}
```

### Step 3: Cultivation/Operation Details

```typescript
interface Step3Form {
  // Plant Information
  plants: {
    species: string[]; // Multi-select
    varieties: string[];
    cultivationArea: number;
  };
  
  // Planting Method
  plantingMethod: 'outdoor' | 'greenhouse' | 'indoor' | 'hydroponic';
  
  // Production Capacity
  estimatedAnnualProduction: {
    quantity: number;
    unit: 'kg' | 'ton';
  };
  
  // Cultivation History
  cultivationHistory: {
    yearsExperience: number;
    previousCrops: string[];
    previousCertifications: string[];
  };
  
  // Seed Source
  seedSource: {
    supplier: string;
    certificateNumber: string;
    certificateDocument: File;
  };
  
  // Water Source
  waterSource: {
    type: 'well' | 'river' | 'canal' | 'municipal' | 'rainwater';
    testReport: File; // < 3 months old
  };
  
  // Soil Information
  soilInfo: {
    type: string;
    testReport: File; // < 6 months old
  };
}
```

### Step 4: Document Upload (Organized by Category)

```typescript
interface Step4Form {
  // Category A: Organization/Personal (6 docs)
  categoryA: {
    nationalId: File;
    companyRegistration?: File;
    houseRegistration: File;
    businessLicense: File;
    pt9License?: File;
    organizationChart: File;
  };
  
  // Category B: Site & Facility (7 docs)
  categoryB: {
    landTitleDeed: File;
    sitePlanWithGPS: File;
    farmLayoutMap: File;
    facilityPhotos: File[]; // min 10
    storagePhotos: File[];
    waterSourceDoc: File;
    drainageSystemPlan: File;
  };
  
  // Category C: Testing & Analysis (5 docs)
  categoryC: {
    soilTestReport: File;
    waterTestReport: File;
    heavyMetalTest: File;
    pesticideResidueTest?: File;
    environmentalRiskAssessment: File;
  };
  
  // Category D: Seed & Planting (4 docs)
  categoryD: {
    seedCertificate: File;
    seedSourceDoc: File;
    geneticPurityCert?: File;
    phytosanitaryCert?: File;
  };
  
  // Category E: SOP & Quality (12 docs)
  categoryE: {
    farmManagementPlan: File;
    sopLandPreparation: File;
    sopPlanting: File;
    sopFertilizer: File;
    sopPestControl: File;
    sopIrrigation: File;
    sopHarvesting: File;
    sopPostHarvest: File;
    sopStorage: File;
    sopCleaning: File;
    pestControlPlan: File;
    traceabilitySystem: File;
  };
  
  // Category F: Personnel (4 docs)
  categoryF: {
    workerList: File;
    trainingRecords: File;
    trainingCertificates?: File;
    healthCertificates: File;
  };
  
  // Category G: Input Materials (5 docs)
  categoryG: {
    fertilizerRegistration: File;
    pesticideRegistration?: File;
    msdsDocuments: File;
    equipmentList: File;
    calibrationRecords?: File;
  };
  
  // Category H: Record Keeping (6 docs)
  categoryH: {
    dailyActivityLog: File; // Last 3 months
    cultivationRecords: File;
    harvestRecords: File;
    inputUsageRecords: File;
    lotBatchTracking: File;
    internalAuditRecords?: File;
  };
}
```

### Step 5: SOP Compliance Checklist

```typescript
interface Step5Form {
  sopChecklist: {
    prePlanting: {
      landSelected: boolean;
      soilTested: boolean;
      waterSourceVerified: boolean;
      seedsObtained: boolean;
      equipmentPrepared: boolean;
      personnelTrained: boolean;
    };
    
    planting: {
      landPrepared: boolean;
      seedsVerified: boolean;
      plantingRecorded: boolean;
      labelsApplied: boolean;
    };
    
    growing: {
      irrigationSchedule: boolean;
      fertilizerPlan: boolean;
      pestMonitoring: boolean;
      recordKeeping: boolean;
    };
    
    harvesting: {
      harvestTiming: boolean;
      harvestMethod: boolean;
      postHarvestHandling: boolean;
      lotTracking: boolean;
    };
    
    postHarvest: {
      drying: boolean;
      storage: boolean;
      packaging: boolean;
      labeling: boolean;
    };
  };
  
  // Self-Assessment Score
  selfAssessmentScore: number;
}
```

### Step 6: Payment

```typescript
interface Step6Form {
  fees: {
    applicationFee: number; // ฿3,000
    inspectionFee: number;  // ฿5,000
    testingFee: number;     // ฿2,000-10,000
    totalAmount: number;
  };
  
  paymentMethod: 'bank_transfer' | 'credit_card' | 'qr_payment';
  
  // If bank transfer
  bankTransfer?: {
    bank: string;
    accountNumber: string;
    transferDate: Date;
    amount: number;
    slipImage: File;
  };
  
  // If credit card
  creditCard?: {
    // Stripe/Omise integration
  };
  
  // If QR Payment
  qrPayment?: {
    // PromptPay QR integration
  };
}
```

### Step 7: Review & Submit

```typescript
interface Step7Form {
  // Review all previous steps
  
  // Declaration
  declaration: {
    certifyTruthfulness: boolean;
    acknowledgeConsequences: boolean;
    agreedToInspection: boolean;
    agreedToTerms: boolean;
  };
  
  // Digital Signature
  signature: {
    signedBy: string;
    signedAt: Date;
    ipAddress: string;
  };
}
```

---

## 7️⃣ API Endpoints {#7-api}

```typescript
// Application Management
POST   /api/gacp/applications                    // Create new application
GET    /api/gacp/applications                    // List all (with filters)
GET    /api/gacp/applications/:id                // Get single application
PUT    /api/gacp/applications/:id                // Update application
DELETE /api/gacp/applications/:id                // Delete draft
POST   /api/gacp/applications/:id/submit         // Submit for review
POST   /api/gacp/applications/:id/save-draft     // Save as draft

// Document Management
POST   /api/gacp/applications/:id/documents      // Upload document
GET    /api/gacp/applications/:id/documents      // List documents
DELETE /api/gacp/documents/:documentId           // Delete document
GET    /api/gacp/documents/:documentId/download  // Download document

// Review & Assessment
POST   /api/gacp/applications/:id/review         // Submit review
PUT    /api/gacp/applications/:id/risk-assessment // Update risk assessment
POST   /api/gacp/applications/:id/request-revision // Request revision

// Inspection
POST   /api/gacp/applications/:id/schedule-inspection // Schedule inspection
GET    /api/gacp/inspections/:id                 // Get inspection details
PUT    /api/gacp/inspections/:id                 // Update inspection
POST   /api/gacp/inspections/:id/complete        // Complete inspection
POST   /api/gacp/inspections/:id/upload-photos   // Upload inspection photos

// Laboratory Testing
POST   /api/gacp/applications/:id/lab-samples    // Register lab samples
GET    /api/gacp/lab-samples/:sampleId           // Get sample status
PUT    /api/gacp/lab-samples/:sampleId/results   // Upload test results

// Evaluation & Decision
POST   /api/gacp/applications/:id/evaluate       // Submit evaluation
POST   /api/gacp/applications/:id/approve        // Approve application
POST   /api/gacp/applications/:id/conditional-approve // Conditional approval
POST   /api/gacp/applications/:id/reject         // Reject application

// Corrective Action
POST   /api/gacp/applications/:id/car            // Issue CAR
PUT    /api/gacp/car/:carId/submit               // Submit CAR response
PUT    /api/gacp/car/:carId/verify               // Verify CAR

// Certificate
POST   /api/gacp/applications/:id/issue-certificate // Issue certificate
GET    /api/gacp/certificates/:certNumber        // Get certificate
GET    /api/gacp/certificates/:certNumber/verify // Verify certificate (public)
GET    /api/gacp/certificates/qr/:qrCode         // QR code lookup (public)

// Statistics & Reports
GET    /api/gacp/statistics                      // Dashboard statistics
GET    /api/gacp/reports/monthly                 // Monthly report
GET    /api/gacp/reports/export                  // Export data

// Public APIs
GET    /api/public/gacp/search                   // Search certified farms
GET    /api/public/gacp/verify/:certNumber       // Verify certificate
GET    /api/public/gacp/map                      // Map of certified farms
```

---

## 8️⃣ SOP Checklist Implementation {#8-sop}

### GACP Inspection Checklist (100 Items)

#### Section 1: Management & Organization (10 items)

```typescript
const managementChecklist = [
  {
    id: '1.1',
    requirement: 'มีโครงสร้างองค์กรและการบริหารจัดการที่ชัดเจน',
    criteria: 'มีแผนผังองค์กร มีการกำหนดหน้าที่รับผิดชอบ',
    evidence: ['org_chart', 'job_descriptions'],
    weight: 1,
    critical: false
  },
  {
    id: '1.2',
    requirement: 'มีระบบบันทึกและการจัดเก็บเอกสาร',
    criteria: 'มีระบบ filing ที่เป็นระเบียบ สามารถค้นหาได้ง่าย',
    evidence: ['document_system', 'filing_photos'],
    weight: 1,
    critical: false
  },
  // ... 8 more items
];
```

#### Section 2: Site & Environment (15 items)

```typescript
const siteChecklist = [
  {
    id: '2.1',
    requirement: 'พื้นที่ห่างจากแหล่งมลพิษอย่างน้อย 5 กม.',
    criteria: 'ไม่มีโรงงานอุตสาหกรรม ขยะ หรือแหล่งมลพิษใกล้เคียง',
    evidence: ['site_survey', 'gps_coordinates', 'area_photos'],
    weight: 2,
    critical: true
  },
  {
    id: '2.2',
    requirement: 'มีแผนที่แสดงขอบเขตพื้นที่และแปลงเพาะปลูก',
    criteria: 'แผนที่ชัดเจน ระบุขนาด มีพิกัด GPS',
    evidence: ['site_map', 'gps_data'],
    weight: 1,
    critical: false
  },
  // ... 13 more items
];
```

#### Section 3: Seed & Planting Material (10 items)

#### Section 4: Cultivation Practices (20 items)

#### Section 5: Pest & Disease Management (10 items)

#### Section 6: Harvesting (10 items)

#### Section 7: Post-Harvest Handling (10 items)

#### Section 8: Storage & Transportation (5 items)

#### Section 9: Personnel & Training (5 items)

#### Section 10: Record Keeping & Traceability (5 items)

### Scoring System

```typescript
function calculateComplianceScore(checklist: ChecklistItem[]): number {
  let totalWeight = 0;
  let earnedScore = 0;
  
  checklist.forEach(item => {
    totalWeight += item.weight;
    
    if (item.status === 'conformance') {
      earnedScore += item.weight;
    } else if (item.status === 'minor_nc') {
      earnedScore += item.weight * 0.5;
    } else if (item.status === 'major_nc' || item.status === 'critical_nc') {
      earnedScore += 0;
    }
  });
  
  return (earnedScore / totalWeight) * 100;
}

// Decision Matrix
if (score >= 80 && noCriticalNC && noMajorNC) {
  return 'PASS';
} else if (score >= 70 && noCriticalNC && majorNC <= 2) {
  return 'CONDITIONAL_PASS'; // Requires CAR
} else {
  return 'FAIL';
}
```

---

## 9️⃣ Implementation Plan {#9-plan}

### Phase 1: Foundation (Week 1-2)

**Backend:**
- [ ] Create `gacpApplications` Mongoose Model
- [ ] Create Application API endpoints (CRUD)
- [ ] Document upload system (AWS S3/MinIO)
- [ ] Payment integration (Stripe/Omise)

**Frontend:**
- [ ] GACP Application selection page
- [ ] Step 1: Application Type & Applicant form
- [ ] Step 2: Site Information form
- [ ] Integration with existing GPSPicker and AddressForm

### Phase 2: Document Management (Week 3)

**Backend:**
- [ ] Document categorization system
- [ ] Document validation logic
- [ ] Document status tracking

**Frontend:**
- [ ] Step 4: Document Upload with 8 categories
- [ ] Document checklist with progress tracking
- [ ] Drag & drop multi-file upload

### Phase 3: SOP & Compliance (Week 4)

**Backend:**
- [ ] SOP checklist system
- [ ] Self-assessment scoring
- [ ] Compliance calculation

**Frontend:**
- [ ] Step 3: Cultivation/Operation Details
- [ ] Step 5: SOP Compliance Checklist
- [ ] Interactive checklist with tooltips

### Phase 4: Review & Submission (Week 5)

**Backend:**
- [ ] Application submission logic
- [ ] Status workflow management
- [ ] Email notifications

**Frontend:**
- [ ] Step 6: Payment integration
- [ ] Step 7: Review & Submit
- [ ] Application tracking dashboard

### Phase 5: Inspection Module (Week 6-7)

**Backend:**
- [ ] Inspection scheduling system
- [ ] Inspector assignment
- [ ] Inspection checklist API
- [ ] Photo upload for inspections

**Frontend:**
- [ ] Inspector Dashboard
- [ ] Inspection Checklist (100 items)
- [ ] Mobile-responsive inspection form
- [ ] Photo documentation

### Phase 6: Lab Testing & Evaluation (Week 8)

**Backend:**
- [ ] Lab sample registration
- [ ] Test results integration
- [ ] Evaluation & scoring system
- [ ] Certificate generation

**Frontend:**
- [ ] Lab results dashboard
- [ ] Evaluation interface
- [ ] Certificate preview

### Phase 7: Certificate & Public Portal (Week 9)

**Backend:**
- [ ] Digital certificate generation (PDF)
- [ ] QR code generation
- [ ] Public verification API
- [ ] Certificate registry

**Frontend:**
- [ ] Certificate display
- [ ] Public verification page
- [ ] Certified farms map
- [ ] QR code scanner

### Phase 8: Testing & Deployment (Week 10)

- [ ] Unit tests
- [ ] Integration tests
- [ ] UAT with real users
- [ ] Production deployment

---

## ✅ Next Steps

คุณต้องการให้ผมเริ่มสร้างอะไรก่อนครับ?

1. **Backend Models** - สร้าง Mongoose Schema สำหรับ GACP Applications
2. **Frontend Forms** - สร้าง GACP Application Wizard (7 steps)
3. **Document Upload System** - ระบบอัปโหลดเอกสาร 47+ ไฟล์
4. **Inspection Checklist** - ระบบ 100-item checklist
5. **Certificate System** - ระบบออกใบรับรองดิจิทัล

**บอกผมได้เลยครับ!** 🚀
