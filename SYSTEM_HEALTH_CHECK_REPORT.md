# รายงานการตรวจสอบระบบ (System Health Check Report)

**วันที่:** 20 ตุลาคม 2568  
**เวลา:** 15:55 น.  
**ผู้ตรวจสอบ:** GitHub Copilot Agent

---

## 📋 สรุปภาพรวม (Executive Summary)

ระบบ GACP Platform สามารถเริ่มต้นได้แล้ว แต่ยังมีปัญหาที่ต้องแก้ไข โดยเฉพาะเรื่องการเชื่อมต่อฐานข้อมูล MongoDB และการโหลด routes บางส่วน

---

## ✅ ปัญหาที่แก้ไขสำเร็จ (Resolved Issues)

### 1. **Winston Dependency**

- **ปัญหา:** ขาด module `winston` สำหรับ logging
- **แก้ไข:** ติดตั้ง winston version 3.18.3 ใน root workspace
- **สถานะ:** ✅ แก้ไขเรียบร้อย

### 2. **User Model Overwrite Error**

- **ปัญหา:** `OverwriteModelError: Cannot overwrite 'User' model once compiled`
- **สาเหตุ:** มี User model ถูกสร้างซ้ำใน 3 ไฟล์:
  - `apps/backend/models/User.js`
  - `apps/backend/modules/auth-farmer/models/User.js`
  - `apps/backend/modules/user-management/infrastructure/models/User.js`
  - `apps/backend/src/models/User.js` (ผ่าน BaseModel)
- **แก้ไข:**
  - แก้ไข `BaseModel.js` ให้ตรวจสอบว่า model มีอยู่แล้วก่อนสร้าง
  - แก้ไขไฟล์ User.js ทั้ง 3 ไฟล์ให้ใช้ try-catch ตรวจสอบก่อนสร้าง model
- **สถานะ:** ✅ แก้ไขเรียบร้อย (เห็น warning "Model User already exists, reusing existing model")

### 3. **Code Style Issues**

- **ปัญหา:** โค้ดไม่ตรงตามมาตรฐาน Prettier
- **แก้ไข:** รัน `npx prettier --write "apps/backend/**/*.js"` จัดฟอร์แมตทั้งหมด
- **สถานะ:** ✅ แก้ไขเรียบร้อย (358 ไฟล์ถูกจัดรูปแบบ)

---

## ⚠️ ปัญหาที่ยังคงอยู่ (Remaining Issues)

### 1. **MongoDB Connection Failed** 🔴 สำคัญ

```
error: ❌ MongoDB connection failed: {"service":"gacp-main-app","timestamp":"2025-10-20T08:55:47.414Z"}
warn: ⚠️ Running in limited mode without database
```

**สาเหตุที่เป็นไปได้:**

- ไม่มี MongoDB connection string ใน `.env`
- MongoDB service ไม่ทำงาน (local หรือ Atlas)
- Connection string ไม่ถูกต้อง

**แนวทางแก้ไข:**

1. ตรวจสอบไฟล์ `.env` ว่ามีค่า:
   ```env
   MONGODB_URI=mongodb://localhost:27017/gacp-platform
   # หรือ
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gacp-platform
   ```
2. ตรวจสอบว่า MongoDB service ทำงานหรือไม่ (local instance)
3. ถ้าใช้ Atlas, ตรวจสอบ:
   - Username/Password ถูกต้อง
   - IP Whitelist รวม IP ปัจจุบัน
   - Cluster พร้อมใช้งาน

---

### 2. **Failed to Load Routes** 🟡 ปานกลาง

Routes ที่โหลดไม่สำเร็จ:

- ❌ DTAM auth routes
- ❌ NEW application routes
- ❌ DTAM Management routes
- ❌ Survey 4-Regions routes
- ❌ Track & Trace routes
- ❌ Standards Comparison routes

Routes ที่โหลดสำเร็จ:

- ✅ MongoDB Auth routes
- ✅ Dashboard routes
- ✅ Compliance comparator routes
- ✅ Survey API routes (legacy)

**แนวทางแก้ไข:**

1. ตรวจสอบไฟล์ routes แต่ละไฟล์ว่ามี syntax error หรือ import error
2. ตรวจสอบ dependencies ที่ routes ต้องการ
3. ดู error log โดยละเอียดในแต่ละ route file

---

### 3. **Duplicate Schema Indexes** 🟡 ปานกลาง

```
Warning: Duplicate schema index on {"applicationNumber":1} found
Warning: Duplicate schema index on {"email":1} found
Warning: Duplicate schema index on {"nationalId":1} found
Warning: Duplicate schema index on {"farmerId":1} found
Warning: Duplicate schema index on {"address.province":1} found
```

**สาเหตุ:** มีการประกาศ index ซ้ำทั้งแบบ `index: true` และ `schema.index()`

**แนวทางแก้ไข:**

1. ค้นหาไฟล์ที่มี schema definitions (Application, Farm, etc.)
2. ลบการประกาศ index ซ้ำ (เลือกใช้แค่วิธีใดวิธีหนึ่ง)
3. แนะนำใช้ `schema.index()` เพราะควบคุมได้ดีกว่า

---

### 4. **JWT Secrets Not Set** 🟡 ปานกลาง

```
⚠️ JWT_SECRET not set - Generated temporary secret for DEVELOPMENT
⚠️ DTAM_JWT_SECRET not set - Generated temporary secret for DEVELOPMENT
```

**แนวทางแก้ไข:**
เพิ่มใน `.env`:

```env
JWT_SECRET=<generate-strong-random-secret-minimum-32-characters>
DTAM_JWT_SECRET=<generate-different-strong-random-secret-minimum-32-characters>
JWT_EXPIRY=24h
DTAM_JWT_EXPIRY=8h
```

**วิธีสร้าง secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 5. **Health Check Failures** 🔴 สำคัญ

```
[Health Check] Main Server: error
[Health Check] MongoDB: error
[Health Check] Auth Service: error
[Health Check] DTAM Service: error
[Health Check] ⚠️ Some checks failed (1/3)
```

**สาเหตุ:** เกิดจากปัญหา MongoDB connection และ routes ที่โหลดไม่สำเร็จ

**แนวทางแก้ไข:** แก้ไขปัญหา #1 และ #2 ก่อน จากนั้น health checks จะผ่านอัตโนมัติ

---

## 🎯 สถานะบริการ (Service Status)

| Service                | Status     | Details                   |
| ---------------------- | ---------- | ------------------------- |
| Backend Server         | 🟢 Running | Port 3003, Node v24.9.0   |
| MongoDB                | 🔴 Failed  | Connection error          |
| Mock Database          | 🟢 Active  | 9 collections initialized |
| NotificationService    | 🟢 Active  | MOCK mode                 |
| CertificateService     | 🟢 Active  | MOCK mode                 |
| DocumentService        | 🟢 Active  | MOCK mode                 |
| Health Check Service   | 🟢 Running | Interval: 30s             |
| Auth Routes (MongoDB)  | 🟢 Loaded  | ✅                        |
| Auth Routes (DTAM)     | 🔴 Failed  | ❌                        |
| Application Routes     | 🔴 Failed  | ❌                        |
| Dashboard Routes       | 🟢 Loaded  | ✅                        |
| Compliance Routes      | 🟢 Loaded  | ✅                        |
| Survey Routes (Legacy) | 🟢 Loaded  | ✅                        |

---

## 📝 คำแนะนำลำดับความสำคัญ (Priority Recommendations)

### 🔴 สำคัญมาก (Critical) - ดำเนินการทันที

1. **แก้ไข MongoDB Connection**
   - สร้าง/แก้ไขไฟล์ `.env` ให้มี `MONGODB_URI`
   - เริ่ม MongoDB service (ถ้าใช้ local)
   - ทดสอบการเชื่อมต่อด้วย `node apps/backend/config/database-mongo-only.js`

2. **ตั้งค่า JWT Secrets**
   - สร้าง strong secrets ใหม่
   - เพิ่มลงใน `.env`
   - Restart server

### 🟡 สำคัญ (High) - ดำเนินการภายใน 1-2 วัน

3. **แก้ไข Routes ที่โหลดไม่สำเร็จ**
   - ตรวจสอบแต่ละไฟล์ routes ที่ล้มเหลว
   - ดู detailed error logs
   - แก้ไข syntax/import errors

4. **ลบ Duplicate Indexes**
   - Review schema files
   - ลบ index declarations ซ้ำ
   - ทดสอบให้แน่ใจว่า indexes ยังทำงาน

### 🟢 ปกติ (Medium) - ดำเนินการเมื่อสะดวก

5. **ปรับปรุง Health Checks**
   - เมื่อแก้ไขปัญหาหลักแล้ว ทดสอบ health checks อีกครั้ง
   - ตรวจสอบว่าทุก service ผ่าน health check

6. **Documentation**
   - อัพเดท README.md ให้มีขั้นตอนการติดตั้ง
   - สร้าง TROUBLESHOOTING.md สำหรับปัญหาที่พบบ่อย

---

## 🔧 ขั้นตอนการแก้ไขด่วน (Quick Fix Steps)

### ขั้นตอนที่ 1: สร้างไฟล์ .env

```bash
# สร้างไฟล์ .env ใหม่หรือแก้ไข
cat > .env << 'EOF'
# Database
MONGODB_URI=mongodb://localhost:27017/gacp-platform

# JWT Configuration
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
DTAM_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRY=24h
DTAM_JWT_EXPIRY=8h

# Server
NODE_ENV=development
PORT=3003
EOF
```

### ขั้นตอนที่ 2: เริ่ม MongoDB (ถ้าใช้ local)

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# หรือ
brew services start mongodb-community
```

### ขั้นตอนที่ 3: ทดสอบการเชื่อมต่อ

```bash
node apps/backend/config/database-mongo-only.js
```

### ขั้นตอนที่ 4: Restart Server

```bash
node apps/backend/server.js
```

---

## 📊 สถิติระบบ (System Statistics)

- **Total Files Formatted:** 358 JavaScript files
- **Dependencies Installed:** winston, mongoose, bcryptjs, และอื่น ๆ
- **Node Version:** v24.9.0
- **PNPM Version:** 8.15.0
- **Server Port:** 3003
- **Mock Collections:** 9 (users, applications, inspections, certificates, documents, notifications, audit_logs, farms, crops)

---

## 📞 การติดต่อและความช่วยเหลือ (Support)

หากต้องการความช่วยเหลือเพิ่มเติม:

1. ตรวจสอบ logs ใน terminal
2. ดู detailed error messages
3. อ้างอิง documentation ใน `docs/` folder
4. ตรวจสอบ TROUBLESHOOTING.md

---

**หมายเหตุ:** รายงานนี้สร้างโดย automated system check และอาจต้องการการตรวจสอบเพิ่มเติมจาก developer
