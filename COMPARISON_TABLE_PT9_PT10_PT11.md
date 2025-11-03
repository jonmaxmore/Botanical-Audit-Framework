# ตารางเปรียบเทียบ: ระบบปัจจุบัน vs ข้อกำหนด PT9/PT10/PT11

**วันที่:** 3 พฤศจิกายน 2025

---

## 📊 สรุปภาพรวม

| โมดูล | มีอยู่ | ครบถ้วน | ต้องเพิ่ม | Priority |
|-------|--------|---------|-----------|----------|
| 1. Users/Accounts | ✅ | 95% | accountType, company | 🟡 กลาง |
| 2. Establishments | ✅ | 90% | establishmentType | 🟢 ต่ำ |
| 3. Files | ✅ | 100% | - | ✅ เสร็จแล้ว |
| 4. Applications | ⚠️ | 70% | PT9/PT10/PT11 formData | 🔴 สูง |
| 5. Reports (PT27-32) | ❌ | 0% | ทั้งหมด | 🟢 ต่ำ |
| 6. Payments | ✅ | 100% | - | ✅ เสร็จแล้ว |
| 7. Admin/RBAC | ⚠️ | 80% | provincePermissions | 🟡 กลาง |
| 8. Audit Logs | ✅ | 100% | - | ✅ เสร็จแล้ว |
| 9. Validation Rules | ✅ | 95% | checksum validation | 🟢 ต่ำ |
| 10. Indexes | ⚠️ | 60% | text search | 🟡 กลาง |
| 11. Mongoose Models | ✅ | 85% | Report model | 🟡 กลาง |
| 12. UI Forms | ❌ | 0% | ทั้งหมด | 🔴 สูงสุด |

**รวม:** 6/12 ✅ | 4/12 ⚠️ | 2/12 ❌

---

## 1️⃣ Users / Accounts - Detailed Comparison

### ฟิลด์ที่ต้องการ (ตามข้อกำหนด)

| Field | Type | Required | Current Status | Action |
|-------|------|----------|----------------|--------|
| `_id` | ObjectId | Yes | ✅ มี | - |
| `role` | String | Yes | ✅ มี | - |
| `accountType` | String | Yes | ❌ ไม่มี | 🔴 เพิ่ม |
| `nationalId` | String | Conditional | ✅ มี | - |
| `passportNo` | String | Optional | ❌ ไม่มี | 🟡 เพิ่ม |
| `firstNameTh` | String | If individual | ❌ ไม่มี | 🔴 แยกจาก fullName |
| `lastNameTh` | String | If individual | ❌ ไม่มี | 🔴 แยกจาก fullName |
| `firstNameEn` | String | Optional | ❌ ไม่มี | 🟡 เพิ่ม |
| `lastNameEn` | String | Optional | ❌ ไม่มี | 🟡 เพิ่ม |
| `dateOfBirth` | Date | Optional | ❌ ไม่มี | 🟢 เพิ่ม |
| `email` | String | Yes | ✅ มี | - |
| `phone` | String | Yes | ✅ มี | - |
| `passwordHash` | String | Yes | ✅ มี (password) | - |
| `isPhoneVerified` | Boolean | Yes | ✅ มี | - |
| `isEmailVerified` | Boolean | Yes | ✅ มี | - |
| `company` | Object | Conditional | ❌ ไม่มี | 🔴 เพิ่ม subfields |
| `company.companyNameTh` | String | If company | ❌ ไม่มี | 🔴 เพิ่ม |
| `company.companyNameEn` | String | Optional | ❌ ไม่มี | 🟡 เพิ่ม |
| `company.registrationNumber` | String | If company | ❌ ไม่มี | 🔴 เพิ่ม |
| `company.registrationDocumentFileId` | ObjectId | If company | ❌ ไม่มี | 🔴 เพิ่ม |
| `company.representative` | Object | If company | ❌ ไม่มี | 🔴 เพิ่ม |
| `address` | Object | Optional | ✅ มี | - |
| `createdAt` | Date | Yes | ✅ มี | - |
| `updatedAt` | Date | Yes | ✅ มี | - |

**สรุป:** 13/24 ฟิลด์ (54%)

### Migration Script ที่ต้องการ

```javascript
// Migration: Split fullName into Thai names
db.users.find({ fullName: { $exists: true } }).forEach(doc => {
  const names = doc.fullName.split(' ');
  db.users.updateOne(
    { _id: doc._id },
    { 
      $set: {
        firstNameTh: names[0] || '',
        lastNameTh: names.slice(1).join(' ') || '',
        accountType: doc.role === 'farmer' ? 'individual' : 'individual'
      },
      $unset: { fullName: "" }
    }
  );
});
```

---

## 2️⃣ Establishments - Detailed Comparison

### ฟิลด์ที่ต้องการ

| Field | Type | Required | Current Status | Action |
|-------|------|----------|----------------|--------|
| `_id` | ObjectId | Yes | ✅ มี | - |
| `userId` | ObjectId | Yes | ✅ มี (owner) | - |
| `name` | String | Yes | ✅ มี | - |
| `establishmentType` | String | Yes | ❌ ไม่มี | 🔴 เพิ่ม |
| `address` | Object | Yes | ✅ มี (location) | - |
| `gps` | Object | Optional | ✅ มี (coordinates) | - |
| `areaSize` | Number | Optional | ✅ มี (area.total) | 🟢 Rename |
| `ownershipType` | String | Optional | ✅ มี | - |
| `establishmentPhotos` | [ObjectId] | Optional | ✅ มี (documents) | 🟢 Rename |
| `businessLicenseFileId` | ObjectId | Optional | ❌ ไม่มี | 🟡 เพิ่ม |
| `contactName` | String | Yes | ✅ มี (contact.name) | - |
| `contactPhone` | String | Yes | ✅ มี (contact.phone) | - |
| `contactEmail` | String | Optional | ✅ มี (contact.email) | - |
| `createdAt` | Date | Yes | ✅ มี | - |
| `updatedAt` | Date | Yes | ✅ มี | - |

**สรุป:** 12/14 ฟิลด์ (86%)

### Update Schema

```javascript
// Add to Farm model
establishmentType: {
  type: String,
  required: true,
  enum: ['farm','processor','retail','warehouse','service'],
  default: 'farm'
},
businessLicenseFileId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Document'
}
```

---

## 3️⃣ Files - Detailed Comparison

### ฟิลด์ที่ต้องการ

| Field | Type | Required | Current Status | Action |
|-------|------|----------|----------------|--------|
| `_id` | ObjectId | Yes | ✅ มี | - |
| `filename` | String | Yes | ✅ มี (originalName) | - |
| `key` | String | Yes | ❌ ไม่มี | 🟡 เพิ่ม (S3 key) |
| `mimeType` | String | Yes | ✅ มี (mimetype) | - |
| `size` | Number | Yes | ✅ มี | - |
| `checksum` | String | Optional | ❌ ไม่มี | 🟢 เพิ่ม |
| `uploadedBy` | ObjectId | Yes | ✅ มี | - |
| `status` | String | Yes | ✅ มี | - |
| `scanResult` | Object | Optional | ❌ ไม่มี | 🟡 เพิ่ม |
| `purpose` | String | Optional | ✅ มี (category) | 🟢 Rename |
| `linkedTo` | Object | Optional | ❌ ไม่มี | 🟡 เพิ่ม |
| `versions` | [Object] | Optional | ✅ มี | - |
| `createdAt` | Date | Yes | ✅ มี | - |
| `updatedAt` | Date | Yes | ✅ มี | - |

**สรุป:** 10/14 ฟิลด์ (71%)

**ครบถ้วนแล้วส่วนใหญ่ แค่เพิ่ม security features:**
- Virus scanning
- File checksum
- S3 key tracking

---

## 4️⃣ Applications - Detailed Comparison ⚠️ **Priority สูงสุด**

### ฟิลด์พื้นฐานที่ต้องการ

| Field | Type | Required | Current Status | Action |
|-------|------|----------|----------------|--------|
| `_id` | ObjectId | Yes | ✅ มี | - |
| `applicationNo` | String | Generated | ✅ มี | - |
| `applicationType` | String | Yes | ⚠️ มีแต่ไม่ครบ | 🔴 เพิ่ม PT9/10/11 |
| `applicantId` | ObjectId | Yes | ✅ มี (applicant) | - |
| `establishmentId` | ObjectId | Conditional | ⚠️ อ้อมผ่าน farm | 🟡 เพิ่มโดยตรง |
| `formData` | Mixed | Yes | ❌ ไม่มี | 🔴 เพิ่ม |
| `attachedFiles` | [ObjectId] | Optional | ✅ มี (documents) | - |
| `status` | String | Yes | ✅ มี | - |
| `statusHistory` | [Object] | Yes | ✅ มี | - |
| `payment` | Object | Optional | ✅ มี | - |
| `submittedAt` | Date | Optional | ✅ มี (submissionDate) | - |
| `assignedTo` | ObjectId | Optional | ✅ มี (assignedOfficer) | - |
| `createdAt` | Date | Yes | ✅ มี | - |
| `updatedAt` | Date | Yes | ✅ มี | - |

**สรุป:** 11/14 ฟิลด์พื้นฐาน (79%)

### PT9/PT10/PT11 formData Structures 🔴 **ยังไม่มีเลย**

#### PT9 (ใบอนุญาตเพาะปลูก) - ยังไม่มี

```typescript
interface PT9FormData {
  // ข้อมูลผู้ยื่น
  applicant: {
    type: 'individual' | 'company';
    individual?: {
      firstNameTh: string;
      lastNameTh: string;
      nationalId: string;
      dateOfBirth: Date;
    };
    company?: {
      companyNameTh: string;
      registrationNumber: string;
      taxId: string;
      representative: {
        name: string;
        nationalId: string;
        position: string;
      };
    };
    address: Address;
    phone: string;
    email: string;
  };

  // ข้อมูลแปลงเพาะปลูก
  cultivationDetails: {
    farmName: string;
    location: {
      address: Address;
      gps: { lat: number; lng: number };
    };
    landArea: {
      total: number;
      cultivated: number;
      unit: 'rai' | 'hectare';
    };
    landOwnership: {
      type: 'owned' | 'leased' | 'rented';
      documentFileId: string; // โฉนดที่ดิน/สัญญาเช่า
    };
    species: string[]; // ชนิดพืชสมุนไพร
    variety: string;
    plantingMethod: 'seeds' | 'seedlings' | 'cuttings' | 'rhizomes';
    expectedYield: number; // กิโลกรัมต่อปี
    harvestPeriod: {
      start: Date;
      end: Date;
    };
  };

  // คุณภาพดินและน้ำ
  quality: {
    soilTest: {
      ph: number;
      organicMatter: number;
      reportFileId: string;
      testDate: Date;
    };
    waterTest: {
      source: 'well' | 'river' | 'canal' | 'rainwater';
      quality: 'good' | 'fair' | 'poor';
      reportFileId: string;
      testDate: Date;
    };
  };

  // มาตรการความปลอดภัย
  safety: {
    pestControl: boolean;
    chemicalFree: boolean;
    organicCertification?: {
      certified: boolean;
      certNumber?: string;
      certFileId?: string;
    };
  };

  // เอกสารแนบ
  documents: {
    idCardFileId: string; // สำเนาบัตรประชาชน
    landDocumentFileId: string; // โฉนด/สัญญาเช่า
    farmMapFileId: string; // แผนที่แปลง
    farmPhotos: string[]; // 4-6 รูป
    soilTestFileId?: string;
    waterTestFileId?: string;
    organicCertFileId?: string;
  };

  // คำรับรอง
  declaration: {
    accepted: boolean;
    signedBy: string;
    signedAt: Date;
    signature?: string; // base64 or fileId
  };
}
```

#### PT10 (ใบอนุญาตแปรรูป) - ยังไม่มี

```typescript
interface PT10FormData {
  applicant: { /* same as PT9 */ };

  // ข้อมูลสถานที่แปรรูป
  processingFacility: {
    name: string;
    location: {
      address: Address;
      gps: { lat: number; lng: number };
    };
    facilityArea: number; // ตารางเมตร
    facilityType: 'factory' | 'workshop' | 'home_based';
    licenseNumber?: string; // ใบอนุญาตโรงงาน (ถ้ามี)
  };

  // กระบวนการแปรรูป
  processingDetails: {
    processType: 'drying' | 'extraction' | 'fermentation' | 'distillation' | 'grinding' | 'other';
    processDescription: string;
    capacity: number; // กิโลกรัม/วัน
    machinery: Array<{
      name: string;
      model: string;
      quantity: number;
    }>;
    ingredients: Array<{
      name: string;
      source: string; // แหล่งที่มา
      quantity: number;
      unit: string;
    }>;
  };

  // มาตรฐานและควบคุมคุณภาพ
  qualityControl: {
    gmpCertified: boolean;
    gmpCertFileId?: string;
    haccp: boolean;
    haccpFileId?: string;
    iso: boolean;
    isoNumber?: string;
    isoFileId?: string;
    testingProcedures: string;
    hygiene: {
      waterSupply: 'municipal' | 'well' | 'filtered';
      wasteManagement: boolean;
      staffTraining: boolean;
    };
  };

  // การเก็บรักษา
  storage: {
    location: string;
    temperatureControlled: boolean;
    temperatureRange?: { min: number; max: number };
    capacity: number; // กิโลกรัม
    shelfLife: number; // เดือน
  };

  // เอกสารแนบ
  documents: {
    idCardFileId: string;
    companyRegFileId?: string;
    facilityLicenseFileId?: string;
    facilityPhotos: string[]; // 6-10 รูป
    machineryPhotos: string[];
    processFlowDiagram: string;
    gmpCertFileId?: string;
    productSamples?: string[];
  };

  declaration: { /* same as PT9 */ };
}
```

#### PT11 (ใบอนุญาตจำหน่าย) - ยังไม่มี

```typescript
interface PT11FormData {
  applicant: { /* same as PT9 */ };

  // ข้อมูลร้านค้า/คลัง
  distributionPoint: {
    name: string;
    type: 'retail' | 'wholesale' | 'online' | 'export';
    location: {
      address: Address;
      gps?: { lat: number; lng: number };
    };
    storeArea: number; // ตารางเมตร
    businessLicense: string;
    businessLicenseFileId: string;
  };

  // ช่องทางจำหน่าย
  distributionDetails: {
    channels: Array<'store' | 'online' | 'wholesale' | 'export'>;
    onlineDetails?: {
      website?: string;
      platforms: string[]; // Shopee, Lazada, etc.
    };
    exportDetails?: {
      countries: string[];
      exportLicense?: string;
      exportLicenseFileId?: string;
    };
  };

  // สินค้าที่จำหน่าย
  products: Array<{
    productName: string;
    category: string;
    source: 'own_production' | 'purchased';
    supplierName?: string;
    supplierLicense?: string;
    quantityPerMonth: number;
    unit: string;
    priceRange: { min: number; max: number };
  }>;

  // การจัดเก็บ
  storage: {
    location: string;
    temperatureControlled: boolean;
    capacity: number;
    storageConditions: string;
  };

  // การขนส่ง
  transportation: {
    method: 'own_vehicle' | 'courier' | 'postal' | 'carrier';
    temperatureControlled: boolean;
    packagingType: string;
  };

  // เป้าหมายตลาด
  targetMarket: {
    domestic: boolean;
    domesticProvinces?: string[];
    export: boolean;
    exportCountries?: string[];
    estimatedAnnualSales: number; // บาท
  };

  // เอกสารแนบ
  documents: {
    idCardFileId: string;
    companyRegFileId?: string;
    businessLicenseFileId: string;
    storePhotos: string[]; // 4-6 รูป
    productPhotos: string[];
    productLabels: string[];
    supplierLicenses?: string[];
    exportLicense?: string;
  };

  declaration: { /* same as PT9 */ };
}
```

### สรุป Applications

**PT9/PT10/PT11 formData: 0% (ยังไม่มีเลย)** 🔴

---

## 5️⃣ Reports (PT27-32) - Detailed Comparison

### ฟิลด์ที่ต้องการ

**Status:** ❌ **ยังไม่มี Model เลย (0%)**

```typescript
// ต้องสร้างใหม่ทั้งหมด
interface Report {
  _id: ObjectId;
  reportType: 'PT27' | 'PT28' | 'PT29' | 'PT30' | 'PT31' | 'PT32';
  ownerId: ObjectId;
  licenseNumber: string;
  period: {
    year: number;
    month: number;
    dateRange?: { from: Date; to: Date };
  };
  entries: Array<{
    itemId: string;
    productName: string;
    lotNo: string;
    source: string;
    quantity: number;
    unit: string;
    storageLocation: string;
    remarks: string;
  }>;
  attachments: ObjectId[];
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Report Types:**
- **PT27**: รายงานการเพาะปลูกรายเดือน
- **PT28**: รายงานการเก็บเกี่ยวรายเดือน
- **PT29**: รายงานการแปรรูปรายเดือน
- **PT30**: รายงานสต็อกคงเหลือรายเดือน
- **PT31**: รายงานการจำหน่ายรายเดือน
- **PT32**: รายงานการส่งออกรายเดือน

---

## 6️⃣-8️⃣ Payments, RBAC, Audit Logs

### Payments ✅ 100%
- มีครบทุกฟิลด์แล้ว
- QR Code, Bank Transfer, Counter Service
- Receipt upload
- Verification workflow

### RBAC ⚠️ 80%
**ต้องเพิ่ม:**
```javascript
provincePermissions: [String],
assignedRegions: [{
  province: String,
  districts: [String]
}],
departmentCode: String,
officerLevel: enum ['provincial','central','regional']
```

### Audit Logs ✅ 100%
- มีครบทุกฟิลด์แล้ว

---

## 🎯 Priority Matrix

| Task | Effort | Impact | Priority | Timeline |
|------|--------|--------|----------|----------|
| UI Forms PT9/PT10/PT11 | สูง (5 วัน) | สูงมาก | 🔴 1 | Week 1-2 |
| Update Application Model | กลาง (2 วัน) | สูง | 🔴 2 | Week 1 |
| Create Report Model | กลาง (1 วัน) | กลาง | 🟡 3 | Week 2 |
| Update User Model | ต่ำ (1 วัน) | กลาง | 🟡 4 | Week 2 |
| Add Text Search Indexes | ต่ำ (0.5 วัน) | ต่ำ | 🟢 5 | Week 3 |
| RBAC Province Permissions | ต่ำ (0.5 วัน) | ต่ำ | 🟢 6 | Week 3 |

---

## 📦 Next Steps

**Phase 1 (Week 1): Critical Path**
1. ✅ วิเคราะห์เสร็จแล้ว (เอกสารนี้)
2. 🔴 สร้าง UI Forms PT9/PT10/PT11
3. 🔴 Update Application Model

**Phase 2 (Week 2): Core Features**
4. 🟡 Create Report Model
5. 🟡 Update User Model
6. 🟡 Build APIs

**Phase 3 (Week 3): Enhancement**
7. 🟢 Add indexes
8. 🟢 RBAC updates
9. 🟢 Testing

---

## ❓ คำถามสำหรับคุณ

**ต้องการให้สร้างอะไรก่อน:**

1. 🔴 **UI Forms (PT9/PT10/PT11 Wizard)** - แนะนำ เพราะยังไม่มีเลย
2. 🔴 **Updated Mongoose Models** - Application + Report
3. 🟡 **JSON Schemas (Zod)** - For form validation
4. 🟡 **API Routes** - Express endpoints
5. 🟢 **OpenAPI Spec** - Documentation

**บอกมาได้เลยครับว่าจะเริ่มจากอะไร!** 🚀
