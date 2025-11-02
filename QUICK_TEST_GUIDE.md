# Quick Testing Guide - Notification System

**ทดสอบระบบแบบง่าย ๆ ไม่ต้องใช้ Jest**

---

## ✅ สิ่งที่ต้องเตรียม

1. **Backend Server** - เปิด terminal รัน:
   ```bash
   cd apps/backend
   npm run dev
   ```

2. **Frontend Server** - เปิด terminal อีกตัว รัน:
   ```bash
   cd apps/frontend
   npm run dev
   ```

3. **MongoDB** - ตรวจสอบว่ารันอยู่ (ดูจาก MongoDB Compass หรือ `mongod` process)

4. **JWT Token** - Login เข้าระบบแล้ว copy token จาก:
   - localStorage: `localStorage.getItem('token')`
   - หรือจาก Network tab ใน DevTools

---

## 🧪 ขั้นตอนการทดสอบ (เลือกทำตามที่สะดวก)

### วิธีที่ 1: ทดสอบผ่าน Frontend UI (ง่ายที่สุด)

#### 1. ทดสอบ NotificationBell Component
- [ ] เปิดเว็บ http://localhost:3000
- [ ] Login เข้าระบบ
- [ ] สังเกตไอคอน 🔔 ที่ header ด้านขวา
- [ ] ดู badge สีแดงแสดงจำนวน unread notifications
- [ ] คลิกที่ไอคอน → dropdown แสดง 5 notifications ล่าสุด
- [ ] คลิก "ดูทั้งหมด" → ไปที่หน้า Notifications

#### 2. ทดสอบ Notifications Page
- [ ] เปิด http://localhost:3000/notifications
- [ ] เห็น Statistics Cards 4 ตัว (Total, Unread, Read, Priority breakdown)
- [ ] เห็นรายการ notifications แสดงเป็น list
- [ ] ทดสอบ Filter tabs: ทั้งหมด, ยังไม่ได้อ่าน, สำคัญมาก
- [ ] ทดสอบปุ่ม "อ่านทั้งหมด"
- [ ] คลิกปุ่ม "อ่านแล้ว" ที่ notification แต่ละตัว
- [ ] ทดสอบ pagination ถ้ามี notifications มากกว่า 20 รายการ

#### 3. ทดสอบ Real-time Updates
**ขั้นตอน:**
1. เปิด 2 browser windows หรือ 2 tabs
2. Login ด้วย user เดียวกันทั้ง 2 windows
3. Window 1: เปิดหน้า Notifications
4. Window 2: ทำ action ที่จะ trigger notification เช่น:
   - Submit application ใหม่
   - Approve document
   - Update application status

**คาดหวัง:**
- Window 1 จะได้รับ notification ใหม่ทันที (ไม่ต้อง refresh)
- Badge count อัพเดตอัตโนมัติ
- Sound/Animation เล่น (ถ้ามี)

---

### วิธีที่ 2: ทดสอบผ่าน Browser Console (สำหรับ Socket.io)

#### ทดสอบ Socket.io Connection

1. เปิด Browser DevTools (F12)
2. ไปที่ Console tab
3. Paste code นี้:

```javascript
// Get token from localStorage
const token = localStorage.getItem('token');
const userId = JSON.parse(localStorage.getItem('user'))._id;

// Connect to Socket.io
const socket = io('http://localhost:3001', {
  auth: { token, userId },
  reconnection: true
});

// Listen to events
socket.on('connect', () => {
  console.log('✅ Socket.io Connected!', socket.id);
});

socket.on('notification:new', (data) => {
  console.log('🔔 New Notification Received:', data);
});

socket.on('notification:unread-count', (data) => {
  console.log('📊 Unread Count Updated:', data.count);
});

socket.on('disconnect', () => {
  console.log('❌ Socket.io Disconnected');
});

console.log('Socket.io testing setup complete!');
```

4. หลังจากรัน script แล้ว ให้ทำ action ต่าง ๆ (submit application, approve document)
5. สังเกต console จะแสดง notification events ที่เข้ามา

---

### วิธีที่ 3: ทดสอบผ่าน PowerShell API Script

#### ใช้ test-api.ps1

1. เปิด PowerShell ที่ root folder ของ project
2. รัน:
   ```powershell
   .\test-api.ps1
   ```
3. ใส่ JWT token เมื่อถูกถาม (copy จาก localStorage)
4. ดูผลการทดสอบทั้ง 11 endpoints:
   - ✅ สีเขียว = ผ่าน
   - ❌ สีแดง = ไม่ผ่าน

**Endpoints ที่จะถูกทดสอบ:**
- GET /api/notifications (list)
- GET /api/notifications/unread-count
- GET /api/notifications?page=1&limit=5
- GET /api/notifications?isRead=false
- GET /api/notifications?priority=high
- GET /api/notifications/types
- GET /api/notifications/preferences
- PUT /api/notifications/preferences
- PUT /api/notifications/:id/read
- PUT /api/notifications/read-all
- POST /api/notifications (admin)

---

### วิธีที่ 4: ทดสอบผ่าน Postman/Insomnia

#### Import Collection

สร้าง collection ใน Postman:

**Headers สำหรับทุก request:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Requests:**

1. **GET Notifications**
   ```
   GET http://localhost:3001/api/notifications
   ```

2. **GET Unread Count**
   ```
   GET http://localhost:3001/api/notifications/unread-count
   ```

3. **GET with Filters**
   ```
   GET http://localhost:3001/api/notifications?isRead=false&priority=high
   ```

4. **Mark as Read**
   ```
   PUT http://localhost:3001/api/notifications/{notification_id}/read
   ```

5. **Mark All as Read**
   ```
   PUT http://localhost:3001/api/notifications/read-all
   ```

6. **Get Preferences**
   ```
   GET http://localhost:3001/api/notifications/preferences
   ```

7. **Update Preferences**
   ```
   PUT http://localhost:3001/api/notifications/preferences
   Body: {"email": true, "realtime": true}
   ```

---

## 🎯 Notification Triggers - ทดสอบ Triggers ทั้ง 9 แบบ

### 1. Application Submitted
**Action:** ส่งคำขอใหม่
```
POST /api/applications
Body: { /* application data */ }
```
**Expected:** Notification type `application_submitted`, priority `medium`

### 2. Application Approved
**Action:** อนุมัติคำขอ
```
PUT /api/applications/{id}/status
Body: { "status": "approved" }
```
**Expected:** Notification type `application_approved`, priority `high`

### 3. Application Rejected
**Action:** ปฏิเสธคำขอ
```
PUT /api/applications/{id}/status
Body: { "status": "rejected" }
```
**Expected:** Notification type `application_rejected`, priority `high`

### 4. Revision Required
**Action:** ขอแก้ไขคำขอ
```
PUT /api/applications/{id}/status
Body: { "status": "revision_required" }
```
**Expected:** Notification type `application_revision_required`, priority `medium`

### 5. Inspection Scheduled
**Action:** กำหนดวันตรวจ
```
POST /api/applications/{id}/schedule-inspection
Body: { "inspectionDate": "2025-11-15", "inspectorId": "..." }
```
**Expected:** Notification type `inspection_scheduled`, priority `high`

### 6. Inspection Completed
**Action:** ตรวจประเมินเสร็จสิ้น
```
PUT /api/inspections/{id}/complete
Body: { "result": "passed", "score": 85 }
```
**Expected:** Notification type `inspection_completed`, priority `high`

### 7. Certificate Issued
**Action:** ออกใบรับรอง
```
POST /api/applications/{id}/issue-certificate
```
**Expected:** Notification type `certificate_issued`, priority `high`

### 8. Document Approved
**Action:** อนุมัติเอกสาร
```
PUT /api/documents/{id}/approve
```
**Expected:** Notification type `document_approved`, priority `medium`

### 9. Document Rejected
**Action:** ปฏิเสธเอกสาร
```
PUT /api/documents/{id}/reject
Body: { "reason": "..." }
```
**Expected:** Notification type `document_rejected`, priority `high`

### 10. Payment Required
**Action:** สร้างรายการชำระเงิน
```
POST /api/payments
Body: { "applicationId": "...", "amount": 5000 }
```
**Expected:** Notification type `payment_required`, priority `high`

### 11. Payment Received
**Action:** ยืนยันการชำระเงิน
```
PUT /api/payments/{id}/confirm
```
**Expected:** Notification type `payment_received`, priority `medium`

---

## ✅ Checklist - ทดสอบครบหรือยัง?

### Backend
- [ ] Notification model สร้างได้
- [ ] GET /api/notifications ทำงาน
- [ ] Pagination ทำงาน (page, limit)
- [ ] Filters ทำงาน (isRead, priority, type)
- [ ] Mark as read ทำงาน
- [ ] Mark all as read ทำงาน
- [ ] GET unread count ทำงาน
- [ ] GET types ทำงาน
- [ ] GET preferences ทำงาน
- [ ] PUT preferences ทำงาน
- [ ] DELETE notification ทำงาน (soft delete)

### Real-time (Socket.io)
- [ ] Socket.io เชื่อมต่อสำเร็จ
- [ ] ได้รับ event `notification:new`
- [ ] ได้รับ event `notification:unread-count`
- [ ] Multiple clients ได้รับ notification พร้อมกัน
- [ ] Reconnection ทำงาน

### Frontend
- [ ] NotificationBell แสดงใน header
- [ ] Badge แสดงจำนวน unread
- [ ] Dropdown แสดง 5 รายการล่าสุด
- [ ] Notifications Page แสดง list ครบ
- [ ] Statistics Cards แสดงข้อมูลถูกต้อง
- [ ] Filter tabs ทำงาน
- [ ] Pagination ทำงาน
- [ ] Mark as read button ทำงาน
- [ ] Delete button ทำงาน
- [ ] Real-time updates ทำงาน

### Triggers (ทดสอบอย่างน้อย 3-4 triggers)
- [ ] Application submitted trigger
- [ ] Application approved trigger
- [ ] Inspection scheduled trigger
- [ ] Certificate issued trigger
- [ ] Document approved trigger
- [ ] Payment required trigger

### Email Service
- [ ] Email service configured
- [ ] Emails logged in console (dev mode)
- [ ] Thai language แสดงถูกต้อง

---

## 📊 Expected Results - ควรเห็นอะไร?

### ถ้าระบบทำงานปกติ:

1. **API Responses:**
   ```json
   {
     "success": true,
     "data": {
       "notifications": [...],
       "pagination": {
         "currentPage": 1,
         "totalPages": 5,
         "totalItems": 87
       }
     }
   }
   ```

2. **Socket.io Events:**
   ```javascript
   // notification:new
   {
     _id: "...",
     type: "application_submitted",
     title: "คำขอของคุณได้รับการบันทึกแล้ว",
     message: "คำขอเลขที่ GAC-2025-001 ได้รับการบันทึกในระบบเรียบร้อย",
     priority: "medium",
     isRead: false
   }

   // notification:unread-count
   { count: 5 }
   ```

3. **UI Updates:**
   - Badge: แสดงตัวเลข 1-99+ สีแดง
   - List: แสดง notifications พร้อม icon, title, timestamp
   - Real-time: Animation fade-in เมื่อมี notification ใหม่

---

## 🐛 Common Issues & Solutions

### Problem 1: Socket.io ไม่เชื่อมต่อ
**Solution:**
- ตรวจสอบ CORS settings ใน `apps/backend/server.js`
- ตรวจสอบ token ยังไม่ expired
- ตรวจสอบ backend server รันอยู่ที่ port 3001

### Problem 2: Notifications ไม่แสดงใน Frontend
**Solution:**
- เปิด Network tab ดู API calls
- ตรวจสอบ console มี errors หรือไม่
- ตรวจสอบ token ใน localStorage

### Problem 3: Triggers ไม่ทำงาน
**Solution:**
- ตรวจสอบ code ใน routes files
- ตรวจสอบ `Notification.createAndSend()` ถูกเรียกหรือไม่
- ดู backend logs มี errors หรือไม่

### Problem 4: Email ไม่ส่ง
**Solution:**
- อยู่ใน dev mode → check console logs แทน
- Production → ตรวจสอบ SMTP configuration

---

## 🚀 Quick Commands

### Start Backend
```bash
cd apps/backend
npm run dev
```

### Start Frontend
```bash
cd apps/frontend
npm run dev
```

### Check MongoDB
```bash
mongosh
use gacp-dev
db.notifications.find().limit(5)
```

### Run API Tests
```powershell
.\test-api.ps1
```

### Check Logs
```bash
# Backend logs
tail -f apps/backend/logs/app.log

# MongoDB logs (if applicable)
tail -f /var/log/mongodb/mongod.log
```

---

## ✨ Success Criteria

ระบบพร้อมใช้งานถ้า:

- ✅ All API endpoints ตอบกลับ 200 OK
- ✅ Socket.io เชื่อมต่อและได้รับ events
- ✅ Frontend แสดง notifications ถูกต้อง
- ✅ Real-time updates ทำงาน
- ✅ ทดสอบ triggers อย่างน้อย 3-4 แบบสำเร็จ
- ✅ User preferences ทำงาน
- ✅ Email logs แสดงใน console (dev mode)

---

**หมายเหตุ:** 
- ไม่จำเป็นต้องทดสอบทุกอย่าง 100% 
- เลือกทดสอบในส่วนที่สำคัญและใช้บ่อย
- ถ้า API ทำงาน + UI แสดงผล + Real-time ได้ = ผ่านแล้ว!

**Ready to test? เริ่มจากวิธีที่ 1 (Frontend UI) ก่อน - ง่ายที่สุด!** 🎯
