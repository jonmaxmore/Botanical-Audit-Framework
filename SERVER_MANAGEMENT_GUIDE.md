# Server Management Guide - Botanical Audit Framework

> **คู่มือการจัดการเซิร์ฟเวอร์ - แบบที่ถูกต้องและยั่งยืน**  
> สำหรับทั้งโหมดพัฒนา (Development) และโหมดใช้งานจริง (Production)

---

## 🎯 Executive Summary

โปรเจคนี้ใช้ **Dual-Mode Approach** สำหรับการจัดการเซิร์ฟเวอร์:

| โหมด            | Script                 | ระบบจัดการ     | เหมาะสำหรับ        |
| --------------- | ---------------------- | -------------- | ------------------ |
| **Development** | `start-dev-simple.ps1` | Native Process | การพัฒนาท้องถิ่น   |
| **Production**  | `start-production.ps1` | PM2            | Production/Staging |

### ⚠️ สิ่งสำคัญที่ต้องจำ

1. **❌ ห้าม** ใช้ PM2 กับ Next.js dev mode (`pnpm dev`) - จะสร้าง zombie processes
2. **✅ ควร** ใช้ PM2 กับ Next.js production mode (`pnpm start`) - ปลอดภัย ไม่มี zombies
3. **Development**: ใช้ `start-dev-simple.ps1` (เปิด 2 terminal แยกกัน)
4. **Production**: ใช้ `start-production.ps1` (PM2 จัดการทุกอย่าง)

---

## 🔧 Development Mode (โหมดพัฒนา)

### วิธีใช้งาน

```powershell
# เริ่มเซิร์ฟเวอร์ในโหมดพัฒนา
.\start-dev-simple.ps1
```

### สิ่งที่จะเกิดขึ้น

1. จะเปิด **2 PowerShell windows** แยกกัน:
   - **Window 1**: Backend (`pnpm start` ใน `apps/backend`)
   - **Window 2**: Frontend (`pnpm dev` ใน `apps/frontend`)

2. ไม่มี PM2, ไม่มี process manager, ไม่มี zombie processes

3. การหยุด: ปิด 2 terminal windows หรือกด `Ctrl+C` ในแต่ละ window

### ข้อดีของวิธีนี้

✅ **ไม่มี zombie processes** - ระบบ Windows จัดการ process tree โดยตรง  
✅ **Hot reload ทันใจ** - Next.js Turbopack ทำงานเต็มประสิทธิภาพ  
✅ **ดู logs ง่าย** - แต่ละ terminal แสดง logs แยกกัน  
✅ **Debug สะดวก** - เห็น console.log ทันที  
✅ **ควบคุมง่าย** - เปิด/ปิดเองได้โดยตรง

### ข้อจำกัด

⚠️ ต้องเปิด terminal 2 windows  
⚠️ ปิด terminal = เซิร์ฟเวอร์หยุด (ไม่มี auto-restart)  
⚠️ ต้องเช็คว่า MongoDB เปิดอยู่ก่อนใช้งาน

---

## 🚀 Production Mode (โหมดใช้งานจริง)

### วิธีใช้งาน

```powershell
# Build frontend ครั้งแรก (ถ้ายังไม่เคย)
cd apps/frontend
pnpm build
cd ..\..

# เริ่ม production servers
.\start-production.ps1
```

### สิ่งที่จะเกิดขึ้น

1. PM2 จะจัดการ **2 processes**:
   - **backend**: API server (port 5000)
   - **frontend**: Next.js production server (port 3000)

2. Auto-restart เมื่อ crash

3. Memory limit protection (backend 500M, frontend 800M)

4. Logs ถูกบันทึกไว้ที่ `./logs/` folder

### PM2 Commands ที่ใช้บ่อย

```powershell
# ดูสถานะ
pnpm exec pm2 status

# ดู logs แบบ real-time
pnpm exec pm2 logs

# ดู logs เฉพาะ backend หรือ frontend
pnpm exec pm2 logs backend
pnpm exec pm2 logs frontend

# Restart ทุก process
pnpm exec pm2 restart all

# Stop ทุก process
pnpm exec pm2 stop all

# Delete ทุก process
pnpm exec pm2 delete all

# Monitor real-time (CPU, Memory)
pnpm exec pm2 monit
```

### ข้อดีของวิธีนี้

✅ **Auto-restart** - ถ้า crash จะเริ่มใหม่อัตโนมัติ  
✅ **Memory protection** - จำกัด memory ป้องกันหน่วยความจำรั่ว  
✅ **Centralized logs** - logs เก็บไว้ใน folder เดียว  
✅ **Production-ready** - เหมาะสำหรับ production/staging  
✅ **Background process** - ปิด terminal ได้ เซิร์ฟเวอร์ยังทำงาน

### ข้อจำกัด

⚠️ ต้อง build frontend ก่อน (`pnpm build`)  
⚠️ Hot reload ไม่ทำงาน (เป็น production build)  
⚠️ แก้โค้ดต้อง rebuild และ restart

---

## 🐛 Zombie Process Problem (ปัญหาที่เราแก้ไข)

### สาเหตุของปัญหา

เดิมเราใช้ PM2 กับ Next.js dev mode (`pnpm dev`) ซึ่งทำให้เกิด **zombie processes**:

1. **Next.js dev mode** จะ spawn child processes สำหรับ:
   - Turbopack compiler
   - HMR (Hot Module Replacement) server
   - Additional worker threads

2. **PM2 บน Windows** ไม่สามารถ track child processes เหล่านี้ได้ครบ

3. เมื่อ PM2 restart frontend → parent process ถูก kill แต่ child processes ยังทำงานอยู่

4. **Result**: zombie node.exe processes สะสม (600-640MB แต่ละตัว)

### ตัวอย่างปัญหา

```powershell
# ใช้งาน PM2 กับ dev mode ไป 30 นาที
Get-Process node | Sort-Object WorkingSet64 -Descending

# ผลลัพธ์:
# PID   Name     Memory
# 17080 node.exe 640MB (zombie)
# 2384  node.exe 638MB (zombie)
# 20892 node.exe 635MB (zombie)
# 11320 node.exe 612MB (zombie)
# 26408 node.exe 180MB (PM2 backend - ปกติ)
# 13992 node.exe 250MB (PM2 frontend - ปกติ)
```

### วิธีแก้ที่เราเลือก

**Dual-Mode Approach**:

- Development: ไม่ใช้ PM2 → ใช้ native process
- Production: ใช้ PM2 + Next.js production build (ไม่มี child processes)

---

## 📊 Performance Comparison (เปรียบเทียบประสิทธิภาพ)

| Metric               | Dev Mode (Native) | Production (PM2)     |
| -------------------- | ----------------- | -------------------- |
| **Startup Time**     | 15-20s            | 8-12s                |
| **Memory Usage**     | ~800MB            | ~600MB               |
| **Hot Reload**       | ✅ Yes (fast)     | ❌ No                |
| **Auto-restart**     | ❌ No             | ✅ Yes               |
| **Zombie Processes** | ✅ None           | ✅ None (prod build) |
| **Suitable for**     | Development       | Production/Staging   |

---

## 🛠️ Troubleshooting

### ปัญหา: Port 3000 หรือ 5000 ถูกใช้แล้ว

```powershell
# ค้นหา process ที่ใช้ port
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5000"

# Kill process (ใส่ PID ที่ได้)
Stop-Process -Id <PID> -Force
```

### ปัญหา: MongoDB ไม่ทำงาน

```powershell
# Check MongoDB service
Get-Service | Where-Object { $_.DisplayName -like "*MongoDB*" }

# Start MongoDB
Start-Service MongoDB
```

### ปัญหา: Frontend build ล้มเหลว

```powershell
# ลบ .next และ build ใหม่
cd apps/frontend
Remove-Item -Recurse -Force .next
pnpm build
```

### ปัญหา: PM2 restart วนไป

```powershell
# ดู logs เพื่อหาสาเหตุ
pnpm exec pm2 logs frontend --lines 50

# ลอง delete และเริ่มใหม่
pnpm exec pm2 delete all
.\start-production.ps1
```

---

## 📁 File Structure

```
Botanical-Audit-Framework/
├── start-dev-simple.ps1      # Development mode (RECOMMENDED)
├── start-production.ps1      # Production mode with PM2
├── ecosystem.config.js       # PM2 configuration
├── apps/
│   ├── backend/
│   │   └── server.js         # Express server
│   └── frontend/
│       ├── .next/            # Production build output
│       └── package.json      # Contains 'start' script
└── logs/                     # PM2 logs (auto-created)
    ├── backend-combined.log
    ├── backend-error.log
    ├── frontend-combined.log
    └── frontend-error.log
```

---

## 🎓 Best Practices

### For Development

1. ใช้ `start-dev-simple.ps1` เสมอ
2. อย่าใช้ PM2 เด็ดขาด
3. เปิด MongoDB ก่อนเสมอ
4. ปิด terminal เมื่อเลิกพัฒนา (ประหยัด memory)

### For Production

1. Build frontend ก่อนทุกครั้ง: `pnpm build`
2. ใช้ PM2 เพื่อ auto-restart
3. Monitor logs เป็นประจำ: `pnpm exec pm2 logs`
4. ตรวจสอบ memory: `pnpm exec pm2 monit`
5. Backup configuration: `ecosystem.config.js`

### General

1. ตรวจสอบ zombie processes เป็นระยะ: `Get-Process node`
2. Restart เซิร์ฟเวอร์หลังแก้โค้ดสำคัญ
3. อ่าน logs เมื่อมีปัญหา
4. ทดสอบใน production mode ก่อน deploy

---

## 🚦 Go-Live Checklist

- [ ] Frontend built สำเร็จ: `pnpm build` (no errors)
- [ ] PM2 installed: `pnpm exec pm2 --version`
- [ ] MongoDB running และเชื่อมต่อได้
- [ ] Health check returns 200: `http://localhost:5000/health`
- [ ] All pages load successfully
- [ ] No zombie processes: `Get-Process node` (เฉพาะ PM2 processes)
- [ ] Logs directory exists: `./logs/`
- [ ] PM2 auto-restart tested (kill process manually)
- [ ] Memory limits working (check with `pm2 monit`)
- [ ] Documentation updated

---

## 📚 Related Documentation

- [PM2_GUIDE.md](./PM2_GUIDE.md) - Detailed PM2 usage
- [DEV_SERVERS_GUIDE.md](./DEV_SERVERS_GUIDE.md) - Development servers setup
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - Full project setup
- [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md) - Production checks

---

## 📞 Support

หากพบปัญหา:

1. ตรวจสอบ logs: `pnpm exec pm2 logs`
2. ดูสถานะ: `pnpm exec pm2 status`
3. หา zombie processes: `Get-Process node`
4. อ่าน error messages ใน terminal
5. ปรึกษาทีมถ้าจำเป็น

---

**Last Updated**: January 2025  
**Version**: 2.0 (Dual-Mode Approach)  
**Status**: Production Ready ✅
