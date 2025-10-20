# วิธีเปิด Frontend (Farmer Portal)

## 🚀 วิธีที่ 1: เปิดใน VS Code Terminal

1. เปิด Terminal ใน VS Code
2. รันคำสั่ง:

```powershell
cd apps/farmer-portal
pnpm dev
```

3. รอจนเห็นข้อความ:

```
▲ Next.js 14.2.18
- Local: http://localhost:3001
✓ Ready in 2-3s
```

4. **อย่ากด Ctrl+C** และ**อย่ากดปุ่มใดๆ** ใน terminal นี้
5. เปิดเบราว์เซอร์ไปที่:
   - http://localhost:3001
   - http://localhost:3001/examples
   - http://localhost:3001/farmer/dashboard

---

## 🚀 วิธีที่ 2: เปิด Terminal แยก (แนะนำ)

**Windows PowerShell:**

```powershell
# เปิด PowerShell ใหม่และรัน:
cd "C:\Users\charo\OneDrive\Documents\gacp-certify-flow-main\apps\farmer-portal"
pnpm dev
```

**หรือ double-click ที่:**

- `start-frontend.ps1` (ถ้าแก้ encoding issue แล้ว)

---

## 🚀 วิธีที่ 3: เปิดทั้ง Backend + Frontend พร้อมกัน

ใช้ Turborepo (รัน 1 คำสั่งได้ทั้งคู่):

```powershell
cd C:\Users\charo\OneDrive\Documents\gacp-certify-flow-main
pnpm dev
```

จะเปิด:

- Backend: http://localhost:3004
- Frontend: http://localhost:3001

---

## ⚠️ ปัญหาที่พบบ่อย

### 1. หน้าเว็บขาว/ว่างเปล่า

**สาเหตุ:** Frontend ยังไม่ compile เสร็จหรือหยุดทำงาน

**แก้ไข:**

1. เช็ค terminal ว่า server ยังทำงานอยู่หรือไม่
2. ดูว่ามีข้อความ error หรือไม่
3. ลอง refresh เบราว์เซอร์ (F5)
4. ถ้ายังไม่ได้ ให้ปิดและเปิด server ใหม่

### 2. ERR_CONNECTION_REFUSED

**สาเหตุ:** Server ไม่ได้ทำงาน

**แก้ไข:**

```powershell
# เช็คว่า port 3001 ทำงานหรือไม่
netstat -ano | findstr ":3001"

# ถ้าไม่มี ให้เริ่ม server ใหม่
cd apps/farmer-portal
pnpm dev
```

### 3. Port 3001 is already in use

**สาเหตุ:** มี process อื่นใช้ port 3001 อยู่

**แก้ไข:**

```powershell
# หา process ที่ใช้ port 3001
netstat -ano | findstr ":3001"

# ฆ่า process (ใส่ PID จาก netstat)
taskkill /PID <PID> /F

# หรือ เปลี่ยน port ใน package.json
# "dev": "next dev -p 3002"
```

### 4. Compile Error

**สาเหตุ:** มี syntax error ในโค้ด

**แก้ไข:**

1. ดู error message ใน terminal
2. แก้ไขไฟล์ตาม error
3. Next.js จะ auto-reload

---

## 📝 สิ่งที่ต้องจำ

1. **อย่าปิด Terminal** ที่รัน `pnpm dev`
2. **อย่ากด Ctrl+C** เว้นแต่จะหยุด server
3. เมื่อ edit โค้ด Next.js จะ **auto-reload** เอง
4. ถ้า error ให้ดู **terminal output** เสมอ
5. หน้าเว็บอาจใช้เวลา **2-5 วินาที** ในการโหลดครั้งแรก

---

## 🔧 Troubleshooting Quick Commands

```powershell
# ตรวจสอบ Frontend กำลังทำงาน
netstat -ano | findstr ":3001"

# ตรวจสอบ Node processes
Get-Process -Name "node" | Select-Object Id, ProcessName, StartTime

# ฆ่า Node processes ทั้งหมด (ระวัง!)
Stop-Process -Name "node" -Force

# เริ่มใหม่
cd apps/farmer-portal
pnpm dev
```

---

## 📚 เอกสารเพิ่มเติม

- `TAILWIND_GUIDE.md` - คู่มือใช้ Tailwind CSS
- `README.md` - ข้อมูลโปรเจกต์
- `/examples` - ตัวอย่าง Component ต่างๆ

---

## ✅ ขั้นตอนที่แนะนำ (Best Practice)

1. เปิด VS Code
2. เปิด Terminal (Ctrl + `)
3. รัน: `cd apps/farmer-portal && pnpm dev`
4. **ทิ้ง Terminal นี้ไว้**
5. เปิด Terminal ใหม่ (คลิก + ข้างๆ tab terminal) สำหรับรันคำสั่งอื่น
6. เปิดเบราว์เซอร์: http://localhost:3001

**หรือ**

1. เปิด PowerShell แยกต่างหาก (ไม่ใช่ใน VS Code)
2. รัน: `cd path\to\project\apps\farmer-portal && pnpm dev`
3. ใช้ VS Code Terminal ทำงานอื่นต่อได้

---

Happy Coding! 🚀
