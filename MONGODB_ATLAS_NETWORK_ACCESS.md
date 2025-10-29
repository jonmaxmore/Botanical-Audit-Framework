# MongoDB Atlas Network Access Setup

## ⚠️ ปัญหา: SSL Error - Network Access ไม่อนุญาต

**Error Message:**
```
Unable to connect: SSL routines:OPENSSL_internal:TLSV1_ALERT_INTERNAL_ERROR
Please ensure that your Network Access List allows connections from your IP.
```

---

## 🔧 วิธีแก้ไข (5 นาที)

### ขั้นตอนที่ 1: เข้าสู่ MongoDB Atlas
1. ไปที่: https://cloud.mongodb.com
2. เข้าสู่ระบบด้วย account ของคุณ
3. เลือก Project: **thai-gacp**

### ขั้นตอนที่ 2: เปิด Network Access
1. คลิกเมนู **Network Access** (ด้านซ้าย)
2. คลิกปุ่ม **+ ADD IP ADDRESS** (สีเขียว)

### ขั้นตอนที่ 3: เพิ่ม IP Address
**ตัวเลือก A: Allow Access from Anywhere (แนะนำสำหรับ Development)**
1. คลิก **ALLOW ACCESS FROM ANYWHERE**
2. IP Address จะเป็น: `0.0.0.0/0`
3. Comment: `Development - Allow All`
4. คลิก **Confirm**

**ตัวเลือก B: Add Current IP Address (ปลอดภัยกว่า)**
1. คลิก **ADD CURRENT IP ADDRESS**
2. ระบบจะตรวจจับ IP ของคุณอัตโนมัติ
3. Comment: `My Development Machine`
4. คลิก **Confirm**

### ขั้นตอนที่ 4: รอ Network Access อัพเดท
- รอประมาณ 1-2 นาที
- สถานะจะเปลี่ยนจาก "Pending" เป็น "Active"

### ขั้นตอนที่ 5: ทดสอบการเชื่อมต่อ
```bash
cd apps/backend
node atlas-server.js
```

---

## ✅ ตรวจสอบว่าสำเร็จ

เมื่อ Network Access ถูกต้อง คุณจะเห็น log:

```
info: 🔗 Connecting to MongoDB Atlas...
info: ✅ MongoDB Atlas connected successfully
info: 📊 Database: gacp-platform
info: ✅ GACP Atlas Server started successfully
info: 🌐 Server: http://localhost:3000
```

---

## 📸 Screenshot คำแนะนำ

### 1. Network Access Menu
```
MongoDB Atlas Dashboard
├── Overview
├── Database
├── Network Access  ← คลิกที่นี่
├── Database Access
└── ...
```

### 2. Add IP Address Dialog
```
┌─────────────────────────────────────┐
│  Add IP Access List Entry          │
├─────────────────────────────────────┤
│                                     │
│  ○ Add Current IP Address           │
│  ○ Allow Access from Anywhere       │ ← เลือกนี้
│  ○ Add IP Address                   │
│                                     │
│  IP Address: 0.0.0.0/0              │
│  Comment: Development - Allow All   │
│                                     │
│  [Cancel]  [Confirm]                │
└─────────────────────────────────────┘
```

---

## 🔒 Security Note

**สำหรับ Development:**
- ใช้ `0.0.0.0/0` (Allow from Anywhere) ได้

**สำหรับ Production:**
- ใช้เฉพาะ IP ของ Server
- หรือใช้ VPC Peering
- หรือใช้ Private Endpoint

---

## ❓ Troubleshooting

### ปัญหา: ยังเชื่อมต่อไม่ได้หลังเพิ่ม IP
**แก้ไข:**
1. รอ 2-3 นาที ให้ Network Access อัพเดท
2. ตรวจสอบว่า IP Address ถูกต้อง
3. ลอง restart server

### ปัญหา: Connection String ผิด
**ตรวจสอบ:**
```env
# ✅ ถูกต้อง
MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority

# ❌ ผิด (ไม่มี password)
MONGODB_URI=mongodb+srv://gacp-premierprime@thai-gacp.re1651p.mongodb.net/gacp-platform

# ❌ ผิด (cluster name ผิด)
MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@wrong-cluster.mongodb.net/gacp-platform
```

### ปัญหา: Username/Password ผิด
**แก้ไข:**
1. ไปที่ **Database Access**
2. ตรวจสอบ username: `gacp-premierprime`
3. ถ้าจำ password ไม่ได้ → Edit User → Change Password

---

## 🚀 Quick Commands

```bash
# 1. แก้ไข Network Access ใน MongoDB Atlas
# (ทำตามขั้นตอนด้านบน)

# 2. เริ่ม Backend Server
cd apps/backend
node atlas-server.js

# 3. ทดสอบ Health Endpoint (terminal ใหม่)
curl http://localhost:3000/health

# 4. ทดสอบ Database Connection
curl http://localhost:3000/api/db/test
```

---

## 📞 ต้องการความช่วยเหลือ?

หลังจากแก้ไข Network Access แล้ว:
1. เริ่ม server: `node atlas-server.js`
2. แจ้งผมว่าเห็น log อะไร
3. ผมจะช่วยทดสอบต่อ

---

**อัพเดท:** 29 ตุลาคม 2025  
**สถานะ:** รอคุณแก้ไข Network Access ใน MongoDB Atlas
