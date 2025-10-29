# 🌿 ภาพรวมธุรกิจและสถาปัตยกรรมระบบ GACP Platform

## 📋 ภาพรวมธุรกิจ

### วิสัยทัศน์
แพลตฟอร์มบริหารจัดการกัญชาทางการแพทย์และพืชสมุนไพรครบวงจร สำหรับเกษตรกรและหน่วยงานราชการ พร้อมรองรับการขยายเป็น **SaaS/Subscription Model** ในอนาคต

---

## 🏗️ สถาปัตยกรรมระบบ

### Build 1: Farmer Portal (เกษตรกร)
**URL:** `farmer.gacp.go.th`

### Build 2: Government Portal (กรมการแพทย์แผนไทยฯ)
**URL:** `admin.gacp.go.th`

---

## 🎯 Core Services (Phase 1 - เปิดให้บริการครั้งแรก)

### 1. ระบบสมาชิก (Member Management) ✅
**สถานะ:** Core Service - เปิดใช้งานตลอด

**ฟีเจอร์:**
- ลงทะเบียนเกษตรกร
- จัดการข้อมูลส่วนตัว
- ระบบ Authentication แยก 2 ระบบ

**ไม่สามารถปิดได้:** เป็นระบบพื้นฐาน

---

### 2. ระบบยื่นเอกสารขออนุญาต (License Application) ✅
**สถานะ:** Core Service - เปิดใช้งานตลอด

**ฟีเจอร์:**
- ยื่นคำขอใบอนุญาตปลูกกัญชา
- ติดตามสถานะคำขอ
- อนุมัติ/ปฏิเสธโดยเจ้าหน้าที่

**ไม่สามารถปิดได้:** เป็นระบบหลักของแพลตฟอร์ม

---

### 3. ระบบติดตามย้อนกลับ (Traceability) 🔄
**สถานะ:** Optional Service - สามารถเปิด/ปิดได้

**ฟีเจอร์:**
- ติดตามสินค้าด้วย Batch Code
- สแกน QR Code
- ตรวจสอบข้อมูลสาธารณะ

**แผนอนาคต:**
- แยกเป็น Microservice
- เสนอเป็นบริการเสริม (Add-on)
- รองรับ Subscription แบบ Pay-per-scan

**Database:** `track-trace` collection
**API Prefix:** `/api/track-trace/*`

---

### 4. ระบบบริหารจัดการฟาร์ม (Farm Management) 🔄
**สถานะ:** Optional Service - สามารถเปิด/ปิดได้

**ฟีเจอร์:**
- จัดการ Cultivation Cycles
- บันทึกกิจกรรม SOP
- ออก QR Code สำหรับสินค้า
- Dashboard เกษตรกร

**แผนอนาคต:**
- แยกเป็น Standalone Service
- เสนอเป็น Premium Package
- รองรับ IoT Integration (Add-on)

**Database:** `cultivationcycles`, `harvestrecords`, `qualitytests`
**API Prefix:** `/api/farm/*`

---

### 5. ระบบแบบสอบถาม (Survey System) 🔄
**สถานะ:** Optional Service - สามารถเปิด/ปิดได้

**ฟีเจอร์:**
- Survey Wizard 4 ภูมิภาค
- วิเคราะห์ข้อมูลภูมิภาค
- เปรียบเทียบภูมิภาค

**แผนอนาคต:**
- แยกเป็น Analytics Service
- เสนอเป็น Research Package
- API สำหรับ Third-party

**Database:** `surveyresponses`, `surveytemplates`
**API Prefix:** `/api/surveys/*`

---

### 6. ระบบเปรียบเทียบมาตรฐาน (Standard Comparison) 🔄
**สถานะ:** Optional Service - สามารถเปิด/ปิดได้

**ฟีเจอร์:**
- เปรียบเทียบ GACP vs WHO/FDA/ASEAN
- วิเคราะห์ความเข้มงวดของมาตรฐาน

**แผนอนาคต:**
- แยกเป็น Compliance Service
- เสนอเป็น Consulting Package

**Database:** `standards`, `parameters`, `standardvalues`
**API Prefix:** `/api/standards/*`

---

## 🎛️ Feature Toggle System (ต้องพัฒนา)

### ความต้องการ

```javascript
// ตัวอย่าง Feature Configuration
{
  "services": {
    "member": { "enabled": true, "canDisable": false },
    "license": { "enabled": true, "canDisable": false },
    "traceability": { "enabled": true, "canDisable": true },
    "farmManagement": { "enabled": true, "canDisable": true },
    "survey": { "enabled": false, "canDisable": true },
    "standardComparison": { "enabled": false, "canDisable": true }
  }
}
```

### สถาปัตยกรรมที่แนะนำ

#### 1. Feature Toggle Database Schema
```javascript
// Collection: feature_toggles
{
  _id: ObjectId,
  serviceId: "traceability",
  serviceName: "ระบบติดตามย้อนกลับ",
  enabled: true,
  canDisable: true,
  category: "optional",
  pricing: {
    tier: "premium",
    monthlyPrice: 5000,
    perUsagePrice: 10 // per scan
  },
  dependencies: [],
  routes: ["/api/track-trace/*"],
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    lastToggledBy: "admin_user_id"
  }
}
```

#### 2. Middleware สำหรับตรวจสอบ Feature
```javascript
// middleware/feature-toggle.js
const checkFeatureEnabled = (serviceId) => {
  return async (req, res, next) => {
    const feature = await FeatureToggle.findOne({ serviceId });
    
    if (!feature || !feature.enabled) {
      return res.status(403).json({
        success: false,
        message: 'This service is currently disabled',
        serviceId,
        contactAdmin: true
      });
    }
    
    next();
  };
};
```

#### 3. Admin Panel UI
```
┌─────────────────────────────────────────┐
│  Service Management                      │
├─────────────────────────────────────────┤
│                                          │
│  ✅ Member Management      [Core]       │
│  ✅ License Application    [Core]       │
│  🔄 Traceability          [Toggle] ✓    │
│  🔄 Farm Management       [Toggle] ✓    │
│  🔄 Survey System         [Toggle] ✗    │
│  🔄 Standard Comparison   [Toggle] ✗    │
│                                          │
└─────────────────────────────────────────┘
```

---

## 📊 Service Dependency Map

```
Core Services (Always On)
├── Member Management
└── License Application
    
Optional Services (Can Toggle)
├── Traceability
│   └── Depends on: Member
├── Farm Management
│   ├── Depends on: Member
│   └── Integrates with: Traceability
├── Survey System
│   └── Depends on: Member
└── Standard Comparison
    └── Standalone
```

---

## 🚀 Roadmap: SaaS/Subscription Model

### Phase 1: Current (Core Services)
- ✅ Member Management
- ✅ License Application
- ✅ Basic Farm Management
- ✅ Basic Traceability

### Phase 2: Feature Toggle Implementation (ต้องพัฒนา)
- 🔨 สร้าง Feature Toggle Database
- 🔨 พัฒนา Middleware
- 🔨 สร้าง Admin UI สำหรับเปิด/ปิด Services
- 🔨 ทดสอบการเปิด/ปิดระบบ

### Phase 3: Service Separation
- 📦 แยก Traceability เป็น Microservice
- 📦 แยก Farm Management เป็น Standalone
- 📦 แยก Survey System
- 📦 แยก Standard Comparison

### Phase 4: Subscription Tiers
```
┌─────────────────────────────────────────┐
│  Free Tier                               │
│  - Member Management                     │
│  - License Application (Basic)           │
│  - 10 Products/month                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Professional Tier (5,000 THB/month)    │
│  - All Free features                     │
│  - Farm Management                       │
│  - Traceability (100 scans/month)       │
│  - Survey System                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Enterprise Tier (15,000 THB/month)     │
│  - All Professional features             │
│  - Unlimited Traceability                │
│  - Standard Comparison                   │
│  - IoT Integration                       │
│  - API Access                            │
│  - Priority Support                      │
└─────────────────────────────────────────┘
```

---

## 🛠️ Implementation Plan

### ขั้นตอนที่ 1: สร้าง Feature Toggle System
1. สร้าง Database Schema
2. สร้าง Middleware
3. สร้าง Admin UI
4. ทดสอบการเปิด/ปิด

### ขั้นตอนที่ 2: Refactor Services
1. แยก Routes ตาม Service
2. แยก Database Collections
3. สร้าง Service Registry
4. ทดสอบ Independence

### ขั้นตอนที่ 3: Implement Subscription
1. สร้าง Subscription Database
2. สร้าง Payment Gateway Integration
3. สร้าง Usage Tracking
4. สร้าง Billing System

---

## 📝 สรุป

### สถานะปัจจุบัน
- ✅ ระบบทั้งหมดทำงานได้ 100%
- ✅ โค้ดเป็น Modular Architecture
- ✅ พร้อมสำหรับการแยก Services

### สิ่งที่ต้องพัฒนา
- 🔨 Feature Toggle System
- 🔨 Admin Panel สำหรับจัดการ Services
- 🔨 Subscription Management
- 🔨 Usage Tracking & Billing

### ข้อดีของสถาปัตยกรรมปัจจุบัน
- ✅ Services แยกกันชัดเจน
- ✅ Database Collections แยกตาม Service
- ✅ API Routes มี Prefix ชัดเจน
- ✅ ง่ายต่อการแยกเป็น Microservices

---

**สรุป:** ระบบพร้อมสำหรับการพัฒนาเป็น SaaS Platform แล้ว! 🚀
