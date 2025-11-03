# 🚀 GACP Load Testing - Quick Start Guide

## ขั้นตอนการทดสอบ (2 ขั้นตอน)

### ✅ ขั้นตอนที่ 1: เปิด Backend

เปิด **Terminal ใหม่** (อย่าปิด terminal นี้) และรัน:

```powershell
cd apps/backend
npm start
```

รอจนเห็นข้อความ:

```
✅ GACP Atlas Server started successfully
🌐 Server: http://localhost:3000
Ready for frontend development! 🚀
```

### ✅ ขั้นตอนที่ 2: รัน Load Test

กลับมาที่ terminal นี้ (หรือเปิดใหม่) และรัน:

```powershell
# วิธีที่ 1: รัน script อัตโนมัติ
.\quick-test.ps1

# หรือ วิธีที่ 2: รันเอง
node load-tests/scripts/run-load-test.js smoke
```

---

## 📊 ประเภทการทดสอบ

### 1. Smoke Test (1 นาที) - แนะนำเริ่มที่นี่

```powershell
node load-tests/scripts/run-load-test.js smoke
```

- ทดสอบฟังก์ชันพื้นฐาน
- 10 users พร้อมกัน
- ใช้เวลา 1 นาที
- ต้องผ่าน 100% ถึงจะทดสอบต่อ

### 2. Load Test (5 นาที) - จำลองวันทำงานปกติ

```powershell
node load-tests/scripts/run-load-test.js load
```

- จำลอง 1,000 users/วัน
- จำลองช่วงเวลา 09:00-17:00
- ทดสอบ response time < 2s
- Error rate < 1%

### 3. Stress Test (10 นาที) - ทดสอบขีดจำกัด

```powershell
node load-tests/scripts/run-load-test.js stress
```

- จำลองช่วง peak hours
- 200-500 users พร้อมกัน
- หา bottleneck
- Error rate < 5% ยอมรับได้

### 4. Soak Test (8 ชั่วโมง) - ทดสอบระยะยาว

```powershell
node load-tests/scripts/run-load-test.js soak
```

- ทดสอบ memory leak
- รันทิ้งไว้ข้ามคืน
- ต้อง stable ตลอด 8 ชั่วโมง

---

## 📈 วิเคราะห์ผล

หลังรันเสร็จ จะได้:

- **JSON Report**: `load-tests/results/report-{type}-{timestamp}.json`
- **HTML Report**: `load-tests/results/report-{type}-{timestamp}.html`

วิเคราะห์เพิ่มเติม:

```powershell
node load-tests/scripts/analyze-performance.js load-tests/results/report-smoke-XXX.json
```

---

## ✅ เกณฑ์ผ่าน (Production Ready)

1. **Smoke Test**: 0% error, p95 < 1s
2. **Load Test**: < 1% error, p95 < 2s
3. **Stress Test**: < 5% error, p95 < 5s
4. **Soak Test**: ไม่มี memory leak

---

## 🔧 Troubleshooting

### ❌ "Backend not running"

```powershell
# เปิด backend ใน terminal ใหม่
cd apps/backend
npm start
```

### ❌ "ECONNREFUSED"

- Backend ยังเปิดไม่เสร็จ รอ 5-10 วินาที
- ตรวจสอบ: `curl http://localhost:3000/health`

### ❌ "Artillery not found"

```powershell
npm install -g artillery
```

### ❌ "Error rate > 5%"

- ตรวจสอบ MongoDB connection
- เพิ่ม connection pool size
- ลอง scale up server resources

---

## 📊 การสร้างข้อมูล 10 ปี (Optional)

**เตือน**: ใช้เวลา 2-4 ชั่วโมง และต้องมี MongoDB พร้อม

```powershell
node load-tests/scripts/populate-10-years.js
```

จะสร้าง:

- 2.5M users
- 1M applications
- 600K certificates

---

## 🎯 ตัวอย่างผลลัพธ์ที่ดี

```
✅ SMOKE TEST PASSED
  Total Requests: 60
  Successful: 60 (100%)
  Failed: 0 (0%)
  p95: 850ms
  p99: 1200ms

  Performance: EXCELLENT ✅
  Ready for production!
```

---

## 📞 ต้องการความช่วยเหลือ?

1. ดู README: `load-tests/README.md`
2. ตรวจสอบ logs: `apps/backend/logs/`
3. ดู error report: `load-tests/results/`
