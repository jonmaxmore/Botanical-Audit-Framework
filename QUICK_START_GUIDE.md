# 🚀 GACP Platform - Quick Start Guide

## เริ่มต้นใช้งานระบบ GACP Platform

### 📋 ข้อกำหนดเบื้องต้น

- Node.js 18.x หรือ 20.x
- MongoDB Atlas account (หรือ MongoDB local)
- Git
- Web browser ที่รองรับ ES6+

### ⚡ เริ่มต้นใช้งานด่วน (5 นาที)

#### 1. Clone และติดตั้ง Dependencies

```bash
# Clone repository
git clone https://github.com/your-org/gacp-certify-flow-main.git
cd gacp-certify-flow-main

# ติดตั้ง dependencies
npm install
cd apps/backend && npm install
```

#### 2. กำหนดค่า Environment

```bash
# คัดลอกไฟล์ configuration
cp config/production.env apps/backend/.env

# แก้ไขการตั้งค่าใน .env
# - MONGODB_URI=your-mongodb-connection-string
# - JWT_SECRET=your-jwt-secret
```

#### 3. เริ่มระบบ

```bash
# เริ่ม backend server
cd apps/backend
npm start

# Server จะรันที่ http://localhost:3004
```

#### 4. เข้าใช้งานระบบ

เปิด browser และไปที่:

- **🎮 หน้าการใช้งานจริง**: http://localhost:3004/demo.html
- **📊 Monitoring Dashboard**: http://localhost:3004/monitoring-dashboard.html
- **📚 API Documentation**: http://localhost:3004/api/docs/docs
- **🏥 Health Check**: http://localhost:3004/api/monitoring/health

---

## 🎯 การใช้งานหลัก

### 1. ทดสอบ GACP Workflow API

```bash
# ข้อมูล workflow ทั้งหมด 17 ขั้นตอน
curl http://localhost:3004/api/gacp/workflow

# ข้อมูล Critical Control Points (8 CCPs)
curl http://localhost:3004/api/gacp/ccps

# ข้อมูลกรอบมาตรฐาน compliance
curl http://localhost:3004/api/gacp/compliance
```

### 2. ทดสอบการคำนวณคะแนน

```bash
curl -X POST http://localhost:3004/api/gacp/test/score-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "scores": {
      "CCP01": 85,
      "CCP02": 90,
      "CCP03": 80,
      "CCP04": 88,
      "CCP05": 92,
      "CCP06": 78,
      "CCP07": 85,
      "CCP08": 87
    }
  }'
```

### 3. ตรวจสอบสถานะระบบ

```bash
# ตรวจสอบสถานะระบบ
curl http://localhost:3004/api/monitoring/health

# ตรวจสอบสถานะฐานข้อมูล
curl http://localhost:3004/api/monitoring/health/database

# ตรวจสอบ performance metrics
curl http://localhost:3004/api/monitoring/health/metrics
```

---

## 🌟 คุณสมบัติหลัก

### ✅ GACP Business Logic

- **17 ขั้นตอน Workflow** ตามมาตรฐาน WHO-GACP
- **8 จุดวิกฤต (CCPs)** ตาม HACCP methodology
- **ระบบคำนวณคะแนน** แบบถ่วงน้ำหนัก
- **State Transition Validation** การตรวจสอบการเปลี่ยนสถานะ

### ✅ Production Monitoring

- **Real-time Health Monitoring** ตรวจสอบสถานะระบบแบบ real-time
- **Database Health Tracking** ติดตามสถานะฐานข้อมูล
- **Performance Metrics** วัดประสิทธิภาพระบบ
- **Visual Dashboard** หน้าจอติดตามแบบ interactive

### ✅ API Documentation

- **Comprehensive Docs** เอกสาร API ฉบับสมบูรณ์
- **OpenAPI Specification** มาตรฐาน OpenAPI 3.0
- **Interactive Testing** ทดสอบ API แบบ interactive
- **Response Examples** ตัวอย่าง response จริง

### ✅ Security & Compliance

- **WHO-GACP 2024.1** มาตรฐาน World Health Organization
- **Thai-FDA Compliance** ตามกฎหมายไทย
- **ASEAN-TM Standards** มาตรฐาน ASEAN
- **Enterprise Security** ความปลอดภัยระดับองค์กร

---

## 📊 ตัวอย่างการใช้งาน

### 1. การตรวจสอบ Workflow

```javascript
// GET /api/gacp/workflow
{
  "success": true,
  "data": {
    "workflowStates": 17,
    "currentWorkflow": "WHO-GACP-2024",
    "states": [
      {
        "id": 1,
        "name": "Initial Application",
        "status": "active",
        "requirements": ["Farm registration", "Soil assessment"]
      },
      // ... 16 states อื่น
    ]
  }
}
```

### 2. การดู Critical Control Points

```javascript
// GET /api/gacp/ccps
{
  "success": true,
  "data": {
    "totalCCPs": 8,
    "methodology": "HACCP-based",
    "ccps": [
      {
        "id": "CCP01",
        "name": "Soil Quality Management",
        "weight": 15,
        "compliance": "WHO-GACP Section 4.2"
      },
      // ... 7 CCPs อื่น
    ]
  }
}
```

### 3. การคำนวณคะแนน

```javascript
// POST /api/gacp/test/score-calculation
{
  "success": true,
  "data": {
    "totalScore": 85.5,
    "weightedScore": "Good",
    "certificateLevel": "GACP-Standard",
    "breakdown": {
      "CCP01": { "score": 85, "weight": 15, "weighted": 12.75 },
      // ... CCPs อื่น
    }
  }
}
```

---

## 🔧 การกำหนดค่าขั้นสูง

### Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=3004
API_VERSION=1.0.0

# Database Configuration
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gacp-db
MONGODB_MAX_POOL_SIZE=100

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGINS=https://your-domain.com

# GACP Configuration
GACP_VERSION=2024.1
CCP_TOTAL_COUNT=8
WORKFLOW_TOTAL_STATES=17

# Monitoring Configuration
HEALTH_CHECK_INTERVAL=30000
MONITORING_ENABLED=true
```

### การเชื่อมต่อฐานข้อมูล

```javascript
// กำหนดค่าการเชื่อมต่อ MongoDB Atlas
const mongoConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    maxPoolSize: 100,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    w: 'majority',
  },
};
```

---

## 📱 การใช้งานบน Mobile

ระบบรองรับการใช้งานบน mobile devices:

- **Responsive Design** ออกแบบให้รองรับทุกขนาดหน้าจอ
- **Touch-friendly Interface** อินเทอร์เฟซที่เหมาะกับการสัมผัส
- **Offline Capability** สามารถใช้งานแบบ offline ได้บางส่วน

---

## 🚨 การแก้ไขปัญหาเบื้องต้น

### ปัญหาการเชื่อมต่อฐานข้อมูล

```bash
# ตรวจสอบการเชื่อมต่อ
curl http://localhost:3004/api/monitoring/health/database

# Force reconnection
curl -X POST http://localhost:3004/api/monitoring/health/database/reconnect
```

### ปัญหา API ไม่ตอบสนอง

```bash
# ตรวจสอบ server logs
npm run logs

# Restart server
npm restart
```

### ปัญหา Performance

```bash
# ตรวจสอบ performance metrics
curl http://localhost:3004/api/monitoring/health/metrics

# ดู memory usage
curl http://localhost:3004/api/monitoring/health | grep memory
```

---

## 📞 การติดต่อสนับสนุน

- **Technical Support**: tech-support@gacp-platform.com
- **Documentation**: https://docs.gacp-platform.com
- **GitHub Issues**: https://github.com/your-org/gacp-certify-flow-main/issues
- **Emergency**: +66-xxx-xxx-xxxx

---

## 🎓 การเรียนรู้เพิ่มเติม

### เอกสารอ้างอิง

- [WHO-GACP Guidelines](https://www.who.int/medicines/areas/quality_safety/quality_assurance/GACP2003.pdf)
- [Thai FDA Regulations](https://www.fda.moph.go.th/)
- [ASEAN Traditional Medicine](https://asean.org/)

### Tutorials

- [GACP Implementation Guide](./docs/GACP_IMPLEMENTATION_GUIDE.md)
- [API Integration Tutorial](./docs/API_INTEGRATION_TUTORIAL.md)
- [Monitoring Setup Guide](./docs/MONITORING_SETUP_GUIDE.md)

---

## ⭐ Quick Links

| Purpose             | URL                          | Description                    |
| ------------------- | ---------------------------- | ------------------------------ |
| 🎮 **Live Demo**    | `/demo.html`                 | ทดลองใช้งานระบบแบบ interactive |
| 📊 **Monitoring**   | `/monitoring-dashboard.html` | ติดตามสถานะระบบ real-time      |
| 📚 **API Docs**     | `/api/docs/docs`             | เอกสาร API ฉบับสมบูรณ์         |
| 🔧 **OpenAPI**      | `/api/docs/openapi`          | Swagger/OpenAPI specification  |
| 🏥 **Health Check** | `/api/monitoring/health`     | ตรวจสอบสถานะระบบ               |

**🎉 ยินดีต้อนรับสู่ GACP Platform - ระบบมาตรฐาน WHO-GACP สำหรับการปลูกกัญชาเพื่อการแพทย์!**
