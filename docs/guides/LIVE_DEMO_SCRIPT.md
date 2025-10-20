# 🎬 GACP Platform Live Demo

## การสาธิตระบบรับรองมาตรฐาน GACP แบบสด

---

## 🚀 **การเตรียมระบบ**

### ขั้นตอนที่ 1: เริ่มต้นเซิร์ฟเวอร์

```bash
cd apps/backend
node server.js
```

### ขั้นตอนที่ 2: ตรวจสอบสถานะระบบ

```bash
curl http://localhost:3004/health
```

---

## 🎯 **การสาธิตฟีเจอร์หลัก**

### 1. 🔐 **ระบบยืนยันตัวตน (Authentication)**

#### การลงทะเบียนเกษตรกร:

```json
POST /api/auth/register
{
  "name": "นายสมชาย ใจดี",
  "email": "farmer@example.com",
  "password": "gacp2025",
  "role": "farmer",
  "farmName": "ฟาร์มสมุนไพรสมชาย",
  "location": "เชียงใหม่"
}
```

#### การเข้าสู่ระบบ:

```json
POST /api/auth/login
{
  "email": "farmer@example.com",
  "password": "gacp2025"
}
```

**ผลลัพธ์:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "farmer_001",
    "name": "นายสมชาย ใจดี",
    "role": "farmer",
    "farmName": "ฟาร์มสมุนไพรสมชาย"
  }
}
```

---

### 2. 📋 **การยื่นใบสมัครรับรอง**

#### การสร้างใบสมัครใหม่:

```json
POST /api/applications
Headers: { "Authorization": "Bearer <token>" }
{
  "applicantInfo": {
    "name": "นายสมชาย ใจดี",
    "idCard": "1234567890123",
    "address": "123 หมู่ 5 ต.สันป่าข่อย อ.สันทราย จ.เชียงใหม่",
    "phone": "081-234-5678",
    "email": "farmer@example.com"
  },
  "farmInfo": {
    "farmName": "ฟาร์มสมุนไพรสมชาย",
    "farmSize": "10 ไร่",
    "farmType": "organic",
    "coordinates": {
      "lat": 18.7883,
      "lng": 98.9853
    },
    "waterSource": "บ่อน้ำบาดาล",
    "soilType": "ดินร่วนปนทราย"
  },
  "herbInfo": {
    "herbs": [
      {
        "name": "ขมิ้นชัน",
        "scientificName": "Curcuma longa",
        "plantingArea": "5 ไร่",
        "harvestSeason": "พฤศจิกายน - ธันวาคม",
        "usePurpose": "สมุนไพร"
      },
      {
        "name": "ขิง",
        "scientificName": "Zingiber officinale",
        "plantingArea": "3 ไร่",
        "harvestSeason": "ตุลาคม - พฤศจิกายน",
        "usePurpose": "เครื่องปรุง"
      }
    ]
  }
}
```

**ผลลัพธ์:**

```json
{
  "success": true,
  "message": "สร้างใบสมัครสำเร็จ",
  "applicationId": "GACP2025001",
  "status": "draft",
  "nextStep": "อัปโหลดเอกสาร"
}
```

---

### 3. 📁 **การอัปโหลดเอกสาร**

#### เอกสารที่ต้องใช้:

- หนังสือรับรองการทำเกษตรอินทรีย์
- แผนที่ฟาร์ม
- ผลตรวจสอบดินและน้ำ
- บันทึกการปฏิบัติงาน 6 เดือน
- ใบอนุญาตประกอบการ (ถ้ามี)

```json
POST /api/documents/upload
Headers: { "Authorization": "Bearer <token>" }
{
  "applicationId": "GACP2025001",
  "documents": [
    {
      "type": "organic_certificate",
      "fileName": "หนังสือรับรองอินทรีย์.pdf",
      "fileSize": 2048000,
      "uploadDate": "2025-10-18"
    },
    {
      "type": "farm_map",
      "fileName": "แผนที่ฟาร์ม.jpg",
      "fileSize": 1024000,
      "uploadDate": "2025-10-18"
    }
  ]
}
```

---

### 4. 💰 **การชำระเงิน**

#### การเริ่มต้นการชำระเงิน:

```json
POST /api/payments/initiate
{
  "applicationId": "GACP2025001",
  "stage": "document_review",
  "amount": 5000,
  "paymentMethod": "promptpay"
}
```

**ผลลัพธ์:**

```json
{
  "success": true,
  "paymentId": "PAY-1729264800",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "promptPayId": "1234567890123",
  "amount": 5000,
  "expiresAt": "2025-10-18T17:30:00Z"
}
```

---

### 5. 📊 **Dashboard เกษตรกร**

#### ข้อมูลสรุป:

```json
GET /api/farmer/dashboard
Headers: { "Authorization": "Bearer <token>" }
```

**ผลลัพธ์:**

```json
{
  "summary": {
    "totalApplications": 3,
    "pendingApplications": 1,
    "approvedApplications": 2,
    "totalCertifiedArea": "15.5 ไร่"
  },
  "recentApplications": [
    {
      "id": "GACP2025001",
      "farmName": "ฟาร์มสมุนไพรสมชาย",
      "status": "รอตรวจสอบเอกสาร",
      "submittedDate": "2025-10-18",
      "lastUpdate": "2025-10-18"
    }
  ],
  "upcomingEvents": [
    {
      "type": "field_audit",
      "date": "2025-10-25",
      "time": "09:00",
      "auditor": "นายวิชาญ เชี่ยวชาญ",
      "applicationId": "GACP2025001"
    }
  ],
  "certifiedHerbs": [
    {
      "name": "ขมิ้นชัน",
      "area": "5 ไร่",
      "certificateNumber": "GACP-TH-2024-001",
      "validUntil": "2027-10-18"
    }
  ]
}
```

---

### 6. 🔍 **ระบบตรวจสอบภาคสนาม**

#### การกำหนดตารางตรวจสอบ (DTAM Staff):

```json
POST /api/audits/schedule-field-audit
{
  "applicationId": "GACP2025001",
  "auditorId": "AUD001",
  "scheduledDate": "2025-10-25T09:00:00Z",
  "location": "ฟาร์มสมุนไพรสมชาย",
  "estimatedDuration": 480
}
```

#### บันทึกผลการตรวจสอบ:

```json
POST /api/audits/field-report
{
  "applicationId": "GACP2025001",
  "auditorId": "AUD001",
  "auditDate": "2025-10-25",
  "findings": {
    "soilQuality": {
      "score": 9,
      "notes": "ดินมีคุณภาพดี ไม่พบสารเคมีตกค้าง"
    },
    "waterSource": {
      "score": 8,
      "notes": "แหล่งน้ำสะอาด แต่ควรปรับปรุงระบบกรอง"
    },
    "storage": {
      "score": 10,
      "notes": "การจัดเก็บถูกหลักสุขลักษณะ"
    },
    "documentation": {
      "score": 9,
      "notes": "บันทึกครบถ้วน ถูกต้อง"
    }
  },
  "overallScore": 90,
  "recommendation": "ผ่านการตรวจสอบ",
  "conditions": []
}
```

---

### 7. 🏆 **การออกใบรับรอง**

#### การสร้างใบรับรอง:

```json
POST /api/certificates/generate/GACP2025001
{
  "options": {
    "template": "official",
    "language": "th",
    "digitalSignature": true
  }
}
```

**ผลลัพธ์:**

```json
{
  "success": true,
  "certificateNumber": "GACP-TH-2025-001",
  "issuedDate": "2025-10-18",
  "validUntil": "2028-10-18",
  "downloadUrl": "/api/certificates/download/GACP-TH-2025-001",
  "qrVerificationCode": "https://gacp.doa.go.th/verify/GACP-TH-2025-001"
}
```

---

### 8. 🔍 **การตรวจสอบใบรับรอง (สาธารณะ)**

#### API สำหรับประชาชน:

```
GET /verify/GACP-TH-2025-001
```

**ผลลัพธ์:**

```json
{
  "valid": true,
  "certificateNumber": "GACP-TH-2025-001",
  "farmerName": "นายสมชาย ใจดี",
  "farmName": "ฟาร์มสมุนไพรสมชาย",
  "location": "เชียงใหม่",
  "certifiedHerbs": ["ขมิ้นชัน", "ขิง"],
  "issuedDate": "2025-10-18",
  "validUntil": "2028-10-18",
  "status": "active"
}
```

---

## 📱 **Frontend Demo**

### หน้าแรก (Landing Page):

```
http://localhost:3001/
```

### หน้าเข้าสู่ระบบ:

```
http://localhost:3001/login
```

### Dashboard เกษตรกร:

```
http://localhost:3001/farmer/dashboard
```

### Dashboard DTAM:

```
http://localhost:3001/dtam/dashboard
```

---

## 🎯 **สถิติการใช้งาน**

### ผลลัพธ์ที่คาดหวัง:

- **เวลาประมวลผล**: ลดลง 50% (จาก 60 วัน เหลือ 30 วัน)
- **ความแม่นยำ**: 99.5%
- **ความพึงพอใจ**: 95%
- **การลดการใช้กระดาษ**: 80%

### KPI หลัก:

- จำนวนใบสมัครต่อเดือน: 500+
- เกษตรกรที่ผ่านการรับรอง: 85%
- ระยะเวลาเฉลี่ยในการออกใบรับรอง: 28 วัน

---

## 🛡️ **การทดสอบความปลอดภัย**

### ทดสอบ Authentication:

```bash
# ทดสอบการเข้าถึงโดยไม่มี Token
curl -X GET http://localhost:3004/api/applications
# Expected: 401 Unauthorized

# ทดสอบ Token ที่ไม่ถูกต้อง
curl -X GET http://localhost:3004/api/applications \
  -H "Authorization: Bearer invalid_token"
# Expected: 403 Forbidden
```

### ทดสอบ Rate Limiting:

```bash
# ส่ง Request มากกว่า 100 ครั้งใน 15 นาที
for i in {1..101}; do
  curl http://localhost:3004/api/health
done
# Expected: 429 Too Many Requests หลัง request ที่ 101
```

---

## 🏁 **สรุปการเดโม่**

### ✅ **ฟีเจอร์ที่สาธิต:**

1. ระบบยืนยันตัวตน (JWT Token)
2. การยื่นใบสมัครรับรอง
3. การอัปโหลดเอกสาร
4. ระบบชำระเงิน (PromptPay)
5. Dashboard แบบ Real-time
6. ระบบตรวจสอบภาคสนาม
7. การออกใบรับรองดิจิทัล
8. การตรวจสอบใบรับรองสาธารณะ

### 🎯 **ข้อดีของระบบ:**

- **ดิจิทัล 100%**: ไม่ต้องใช้กระดาษ
- **โปร่งใส**: ติดตามสถานะได้ตลอดเวลา
- **รวดเร็ว**: ลดเวลาประมวลผลครึ่งหนึ่ง
- **ปลอดภัย**: มาตรฐานรักษาความปลอดภัยสูง
- **ครบวงจร**: จัดการทุกขั้นตอนในที่เดียว

### 🚀 **พร้อมใช้งาน:**

ระบบ GACP Platform พร้อมให้บริการเกษตรกรไทยในการยื่นขอรับรองมาตรฐาน GACP อย่างเป็นทางการ

---

**วันที่เดโม่**: 18 ตุลาคม 2025
**สถานะ**: ✅ Production Ready
