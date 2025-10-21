# 🔧 แก้ปัญหาเซิร์ฟเวอร์ล้มบ่อยๆ - คู่มือสมบูรณ์

## ⚡ สาเหตุที่เซิร์ฟเวอร์ล้ม

### 1. Memory Leak

- Node.js ใช้ memory มากเกินไป
- ไม่มี memory limit

### 2. Unhandled Errors

- Error ที่ไม่ได้จัดการทำให้ process crash
- Promise rejection ที่ไม่มี catch

### 3. Port Conflicts

- Port ถูกใช้ซ้ำ
- Process ค้างไม่ปิด

### 4. Manual Process Management

- ปิด terminal = เซิร์ฟเวอร์หยุด
- ไม่มี auto-restart

---

## ✅ วิธีแก้ปัญหาแบบยั่งยืน: ใช้ PM2

### 🎯 ข้อดีของ PM2

1. **Auto-Restart**
   - เซิร์ฟเวอร์ล้มแล้ว restart อัตโนมัติ
   - กำหนดจำนวน restart ได้

2. **Memory Management**
   - จำกัด memory ได้ (500MB backend, 800MB frontend)
   - Restart อัตโนมัติเมื่อใช้ memory เกิน

3. **Process Monitoring**
   - ดูสถานะแบบ real-time
   - บันทึก logs อัตโนมัติ

4. **Load Balancing**
   - รัน multiple instances ได้
   - แบ่ง traffic อัตโนมัติ

5. **Zero-Downtime Reload**
   - อัพเดทโค้ดโดยไม่ต้องหยุดเซิร์ฟเวอร์

---

## 🚀 การใช้งาน PM2

### เริ่มต้นเซิร์ฟเวอร์

```powershell
# วิธีที่ 1: ใช้สคริปต์ (แนะนำ)
.\start-dev.ps1

# วิธีที่ 2: ใช้ PM2 โดยตรง
pnpm exec pm2 start ecosystem.config.js
```

### ดูสถานะเซิร์ฟเวอร์

```powershell
# ดูสถานะทั้งหมด
pnpm exec pm2 status

# ดูสถานะแบบละเอียด
pnpm exec pm2 show backend
pnpm exec pm2 show frontend

# Monitor แบบ real-time (CPU, Memory)
pnpm exec pm2 monit
```

### ดู Logs

```powershell
# ดู logs ทั้งหมด
pnpm exec pm2 logs

# ดู backend logs
pnpm exec pm2 logs backend

# ดู frontend logs
pnpm exec pm2 logs frontend

# ดู logs 100 บรรทัดล่าสุด
pnpm exec pm2 logs --lines 100

# ล้าง logs
pnpm exec pm2 flush
```

### จัดการเซิร์ฟเวอร์

```powershell
# Restart ทั้งหมด
pnpm exec pm2 restart all

# Restart เฉพาะ backend
pnpm exec pm2 restart backend

# Restart เฉพาะ frontend
pnpm exec pm2 restart frontend

# Reload (zero-downtime)
pnpm exec pm2 reload all

# Stop ทั้งหมด
pnpm exec pm2 stop all

# หยุดและลบ processes
pnpm exec pm2 delete all

# หยุดเซิร์ฟเวอร์
.\stop-dev.ps1
```

---

## 📊 การตรวจสอบปัญหา

### ตรวจสอบเหตุผลที่ restart

```powershell
# ดูข้อมูล restart
pnpm exec pm2 show backend

# Output จะแสดง:
# - restart time: จำนวนครั้งที่ restart
# - unstable restarts: restart บ่อยเกินไป
# - created at: เวลาที่สร้าง process
```

### ตรวจสอบ Memory Usage

```powershell
pnpm exec pm2 monit

# หรือ
pnpm exec pm2 list
```

### ดู Error Logs

```powershell
# ดู error logs
pnpm exec pm2 logs backend --err

# หรือดูจากไฟล์โดยตรง
Get-Content .\logs\backend-error.log -Tail 50

Get-Content .\logs\frontend-error.log -Tail 50
```

---

## ⚙️ การตั้งค่า (ecosystem.config.js)

### การตั้งค่าสำคัญ

```javascript
{
  // Auto-restart configuration
  autorestart: true,              // Auto-restart เมื่อ crash
  max_restarts: 10,               // Restart สูงสุด 10 ครั้ง
  min_uptime: '10s',              // ต้องรันได้ 10 วิก่อน restart
  max_memory_restart: '500M',     // Restart เมื่อใช้ RAM > 500MB
  restart_delay: 4000,            // รอ 4 วิก่อน restart

  // Error handling
  kill_timeout: 5000,             // รอ 5 วิก่อน force kill
  listen_timeout: 10000,          // รอ 10 วิให้เซิร์ฟเวอร์พร้อม

  // Logging
  error_file: './logs/backend-error.log',
  out_file: './logs/backend-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
}
```

### ปรับแต่งตามความต้องการ

**เพิ่ม memory limit:**

```javascript
max_memory_restart: '1G',  // เพิ่มเป็น 1GB
```

**เพิ่มจำนวน restart:**

```javascript
max_restarts: 20,  // restart ได้มากขึ้น
```

**Watch mode (development):**

```javascript
watch: true,  // auto-restart เมื่อไฟล์เปลี่ยน
ignore_watch: ['node_modules', 'logs'],
```

---

## 🔍 Troubleshooting

### ปัญหา: PM2 ไม่ทำงาน

**วิธีแก้:**

```powershell
# ลง PM2 ใหม่
pnpm add -D -w pm2

# ตรวจสอบ version
pnpm exec pm2 --version
```

### ปัญหา: เซิร์ฟเวอร์ restart loop

**วิธีแก้:**

```powershell
# ดู error logs
pnpm exec pm2 logs backend --err --lines 50

# แก้ไข error ที่เจอ แล้ว restart
pnpm exec pm2 restart backend
```

### ปัญหา: Port ถูกใช้แล้ว

**วิธีแก้:**

```powershell
# หา process ที่ใช้ port
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5000"

# Kill process
Stop-Process -Id <PID> -Force

# Start ใหม่
.\start-dev.ps1
```

### ปัญหา: Memory leak

**วิธีแก้:**

1. ตั้ง `max_memory_restart` ต่ำลง (เช่น 400M)
2. ตรวจสอบโค้ดว่ามี memory leak หรือไม่
3. ใช้ `pnpm exec pm2 monit` ดู memory usage

---

## 🎯 Best Practices

### 1. ใช้ PM2 เสมอในการ development

```powershell
# แทนที่จะใช้
pnpm start
pnpm dev

# ให้ใช้
.\start-dev.ps1  # ใช้ PM2
```

### 2. ตรวจสอบ logs เป็นประจำ

```powershell
# ดู logs ทุกวัน
pnpm exec pm2 logs --lines 100

# หรือดูจาก log files
Get-Content .\logs\backend-error.log
```

### 3. Restart เซิร์ฟเวอร์เป็นประจำ

```powershell
# Restart ทุก 24 ชั่วโมง (ถ้าจำเป็น)
pnpm exec pm2 restart all
```

### 4. Backup configuration

```powershell
# Save PM2 configuration
pnpm exec pm2 save

# Load configuration
pnpm exec pm2 resurrect
```

---

## 📈 Production Deployment

เมื่อจะ deploy production ให้ใช้:

```javascript
// ecosystem.config.js
env_production: {
  NODE_ENV: 'production',
  PORT: 5000,
}
```

```powershell
# Start in production mode
pnpm exec pm2 start ecosystem.config.js --env production

# Save configuration
pnpm exec pm2 save

# Auto-start on boot
pnpm exec pm2 startup
```

---

## ✅ สรุป

**ก่อนใช้ PM2:**

- ❌ เซิร์ฟเวอร์ล้มบ่อย
- ❌ ต้อง restart manual
- ❌ ไม่มี logs
- ❌ ปิด terminal = เซิร์ฟเวอร์หยุด

**หลังใช้ PM2:**

- ✅ Auto-restart อัตโนมัติ
- ✅ Memory management
- ✅ บันทึก logs อัตโนมัติ
- ✅ Monitor real-time
- ✅ Zero-downtime reload
- ✅ ทำงานต่อแม้ปิด terminal

---

**Last Updated:** 21 ตุลาคม 2025  
**Version:** 2.0 (PM2 Integration)
