# 🚀 Docker Desktop Installation Guide - สำหรับคุณ!

**วันที่**: 15 ตุลาคม 2025  
**ความสำคัญ**: 🔴 **CRITICAL BLOCKER**  
**เวลาที่ใช้**: 20-30 นาที

---

## ⚡ ทำไมต้องติดตั้ง Docker?

Docker เป็นตัวรันฐานข้อมูล (MongoDB + Redis) ที่จำเป็นสำหรับ Sprint 1

**ถ้าไม่มี Docker**:

- ❌ ไม่สามารถรัน MongoDB (ฐานข้อมูลหลัก)
- ❌ ไม่สามารถรัน Redis (cache + sessions)
- ❌ ไม่สามารถพัฒนาระบบได้เลย

**ถ้ามี Docker**:

- ✅ Infrastructure พร้อมใช้ใน 2 นาที
- ✅ เริ่มพัฒนาได้ทันที
- ✅ ทุกอย่างทำงานเหมือนกับทีม

---

## 📥 วิธีติดตั้ง (ง่ายมาก!)

### **ขั้นตอนที่ 1: ดาวน์โหลด**

1. เปิดเว็บ: https://www.docker.com/products/docker-desktop/
2. คลิกปุ่ม **"Download for Windows"** (สีฟ้า)
3. รอดาวน์โหลดไฟล์ (ประมาณ 500-600 MB)
4. จะได้ไฟล์ชื่อ: `Docker Desktop Installer.exe`

---

### **ขั้นตอนที่ 2: ติดตั้ง**

1. **Double-click** ไฟล์ `Docker Desktop Installer.exe`
2. ถ้าขึ้น User Account Control → คลิก **"Yes"**
3. จะเห็นหน้าต่าง Installation Options:

   ```
   ☑️ Use WSL 2 instead of Hyper-V (recommended)
   ☑️ Add shortcut to desktop
   ```

4. **สำคัญมาก**: ✅ ต้องเลือก **"Use WSL 2"** (ติ๊กถูกมา)
5. คลิก **"OK"** หรือ **"Install"**
6. รอติดตั้ง (5-10 นาที)
7. เมื่อเสร็จจะขึ้น: **"Installation succeeded"**
8. คลิก **"Close and restart"**

---

### **ขั้นตอนที่ 3: Restart คอมพิวเตอร์**

1. **Restart คอมพิวเตอร์** (สำคัญมาก!)
2. หลัง restart, Docker Desktop จะเปิดขึ้นมาอัตโนมัติ
3. ถ้าไม่เปิด → ไปที่ Start Menu → พิมพ์ "Docker Desktop" → เปิด

---

### **ขั้นตอนที่ 4: รอ Docker เริ่มทำงาน**

1. เปิด Docker Desktop แล้วจะเห็นหน้าต่างโปรแกรม
2. รอจนกว่าจะเห็น:
   - **"Docker Desktop is running"** (สีเขียว)
   - หรือ whale icon สีเขียวที่ taskbar
3. อาจใช้เวลา 2-3 นาที (ครั้งแรก)

---

### **ขั้นตอนที่ 5: ตรวจสอบว่าติดตั้งสำเร็จ**

1. เปิด **PowerShell** (กดปุ่ม Windows + X → เลือก "Windows PowerShell")
2. พิมพ์คำสั่ง:

   ```powershell
   docker --version
   ```

3. **ถ้าเห็น**:

   ```
   Docker version 24.x.x, build xxxxx
   ```

   แสดงว่า **สำเร็จแล้ว!** ✅

4. ต่อด้วยคำสั่งที่ 2:

   ```powershell
   docker-compose --version
   ```

5. **ถ้าเห็น**:
   ```
   Docker Compose version v2.x.x
   ```
   แสดงว่า **พร้อมใช้งาน!** ✅

---

## ✅ เมื่อติดตั้งเสร็จแล้ว

### **บอกให้ผมรู้!** 🎉

พิมพ์ว่า:

- **"Docker installed"**
- หรือ **"ติดตั้ง Docker เสร็จแล้ว"**

ผมจะช่วยคุณทันทีด้วย:

1. ⚡ **Start Infrastructure** (2 นาที)
   - Start MongoDB (16 collections พร้อมใช้งาน)
   - Start Redis (cache ready)

2. ⚡ **Install Dependencies** (5-10 นาที)
   - ติดตั้ง ~1,000+ packages ด้วย pnpm

3. ⚡ **Start Development** (2 นาที)
   - Backend running on port 5000
   - 3 Frontend portals running

**รวมเวลา**: 15-20 นาที จาก Docker → ทุกอย่างทำงาน! 🚀

---

## ❓ ถ้าเจอปัญหา

### **ปัญหา 1: "WSL 2 installation is incomplete"**

**วิธีแก้**:

1. เปิด PowerShell **as Administrator**
2. พิมพ์:
   ```powershell
   wsl --install
   ```
3. Restart คอมพิวเตอร์
4. เปิด Docker Desktop อีกครั้ง

---

### **ปัญหา 2: Docker Desktop ไม่เปิด**

**วิธีแก้**:

1. ตรวจสอบว่า Windows 10/11 เป็นเวอร์ชัน 64-bit
2. เปิด Task Manager (Ctrl+Shift+Esc)
3. ดูว่า "Docker Desktop.exe" รันอยู่ไหม
4. ถ้าไม่รัน → เปิดใหม่จาก Start Menu

---

### **ปัญหา 3: "docker: command not found" ใน PowerShell**

**วิธีแก้**:

1. ปิด PowerShell ทั้งหมด
2. เปิด PowerShell ใหม่
3. ลองพิมพ์ `docker --version` อีกครั้ง
4. ถ้ายังไม่ได้ → Restart คอมพิวเตอร์

---

### **ปัญหา 4: การติดตั้งช้ามาก**

**ปกติ**:

- ดาวน์โหลด: 5-10 นาที (ขึ้นกับเน็ต)
- ติดตั้ง: 5-10 นาті
- รวม: 10-20 นาที

**ถ้าเกิน 30 นาที**:

- ยกเลิกการติดตั้ง
- Restart คอมพิวเตอร์
- ติดตั้งใหม่อีกครั้ง

---

## 📋 Checklist การติดตั้ง

ก่อนติดตั้ง:

- [ ] Windows 10/11 (64-bit)
- [ ] มีพื้นที่ว่างอย่างน้อย 10 GB
- [ ] เชื่อมต่ออินเทอร์เน็ต

ระหว่างติดตั้ง:

- [ ] ดาวน์โหลดไฟล์ installer
- [ ] Run installer
- [ ] ✅ **เลือก "Use WSL 2"** (สำคัญ!)
- [ ] คลิก Install
- [ ] Restart คอมพิวเตอร์

หลังติดตั้ง:

- [ ] เปิด Docker Desktop
- [ ] รอจน "Docker Desktop is running"
- [ ] ทดสอบ: `docker --version` ใน PowerShell
- [ ] ทดสอบ: `docker-compose --version` ใน PowerShell
- [ ] **บอกผมว่า "Docker installed"** 🎉

---

## ⏱️ Timeline

**เวลาที่ใช้**:

- ดาวน์โหลด: 5-10 นาที
- ติดตั้ง: 5-10 นาที
- Restart: 2-3 นาที
- เริ่มทำงาน: 2-3 นาที
- **รวม: 15-25 นาที**

**หลังจากนี้**:

- Start Infrastructure: 2 นาที
- Install Dependencies: 5-10 นาที
- Start Development: 2 นาที
- **รวม: 10-15 นาที**

**รวมทั้งหมด: 25-40 นาที** จากตอนนี้ → ทุกอย่างทำงาน! 🚀

---

## 🎯 ทำไมต้องทำตอนนี้?

1. **Sprint 1 เริ่ม**: 1 พฤศจิกายน 2025 (อีก 17 วัน)
2. **Docker คือ BLOCKER**: ไม่มี Docker = ทำงานไม่ได้
3. **ทุกอย่างพร้อมแล้ว**: ติดตั้ง Docker → เริ่มได้ทันที!

---

## 💪 คุณทำได้!

การติดตั้ง Docker ไม่ยากครับ แค่:

1. ดาวน์โหลด
2. Install
3. Restart
4. ตรวจสอบ

**เวลา**: 20-30 นาที  
**ประโยชน์**: เริ่มพัฒนาระบบได้ทันที! 🚀

---

## 📞 หลังจากติดตั้งเสร็จ

**พิมพ์**: "Docker installed" หรือ "ติดตั้งเสร็จแล้ว"

ผมจะ:

1. ✅ Start MongoDB + Redis (2 นาที)
2. ✅ Verify databases (1 นาที)
3. ✅ Install dependencies (5-10 นาที)
4. ✅ Start all services (2 นาที)
5. ✅ Verify everything (1 นาที)

**และเราก็พร้อมเริ่ม Sprint 1!** 🎉

---

_ขอให้การติดตั้งราบรื่นครับ!_ 😊  
_มีคำถามถามได้เลยครับ!_ 💬

---

**เริ่มกันเลย!** 👇

1. ไปที่: https://www.docker.com/products/docker-desktop/
2. คลิก "Download for Windows"
3. ติดตั้งและ restart
4. บอกผมว่า "Docker installed"

**Let's do this!** 🚀
