# 🔧 Test Environment - Quick Fix Guide

## ⚠️ Problem: npm test ค้าง (Hanging)

### 🔍 Root Cause Analysis

**ปัญหาที่พบ:**

1. **MongoDB Connections ไม่ปิด** - Jest รอ async operations
2. **Node.js processes ค้าง** - ทับซ้อนกับ test run ใหม่
3. **Jest cache ล้าสมัย** - โค้ดใหม่ไม่ถูก reload
4. **Module dependencies** - Circular dependencies หรือ async ไม่เสร็จ

**ทำไมเกิด:**

- MongoDB Memory Server ไม่ถูก cleanup อย่างสมบูรณ์
- `mongoose.disconnect()` ไม่บังคับปิด connections
- Jest รอ timers/intervals ที่ยังทำงานอยู่
- Windows มักเกิดปัญหา port locking

---

## ✅ Solutions (ใช้ตามลำดับ)

### 🚀 Solution 1: Auto Cleanup (แนะนำ)

```powershell
# วิธีที่ดีที่สุด - cleanup อัตโนมัติก่อน test
npm test
```

**ทำอะไร:**

- รัน `pretest` script ที่ cleanup ก่อนอัตโนมัติ
- Jest มี `--forceExit` และ `--detectOpenHandles`
- MongoDB connections ถูกปิดแบบ force close

**เมื่อไหร่ใช้:**

- ✅ ใช้เป็นค่าเริ่มต้น (recommended)
- ✅ หลังจาก restart เครื่อง
- ✅ หลังจาก pull code ใหม่

---

### 🧹 Solution 2: Manual Cleanup

```powershell
# 1. Run cleanup script
npm run test:clean

# 2. Wait 2 seconds
Start-Sleep -Seconds 2

# 3. Run tests
npm test
```

**ทำอะไร:**

- Kill Node.js processes
- Clear Jest cache
- Clear MongoDB Memory Server temp files
- Close hanging connections

**เมื่อไหร่ใช้:**

- ❌ Tests ค้างครั้งแรก
- ⚠️ `npm test` แก้ไม่ได้
- 🔧 Debug connection issues

---

### 💪 Solution 3: Force Kill Everything

```powershell
# Nuclear option - kill ทุกอย่าง
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name mongod -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3
npm test
```

**เมื่อไหร่ใช้:**

- 🚨 ทุกอย่างล้มเหลว
- 🔥 Emergency fix
- ⚠️ ระวัง: จะ kill Node.js ทั้งหมด (รวม dev server)

---

### 🔬 Solution 4: Debug Mode

```powershell
# ดู open handles
npm test -- --detectOpenHandles

# ดู verbose output
npm test -- --verbose

# Run specific test file
npm test -- tests/integration/application.test.js
```

**ทำอะไร:**

- แสดง async operations ที่ยังไม่เสร็จ
- ระบุ connection leaks
- ช่วย debug ปัญหา

**เมื่อไหร่ใช้:**

- 🐛 หา root cause
- 🔍 ตรวจสอบว่าอะไรทำให้ค้าง
- 📊 วิเคราะห์ performance

---

## 📋 Quick Commands Reference

| Command                    | Purpose                  | When to Use       |
| -------------------------- | ------------------------ | ----------------- |
| `npm test`                 | Run tests (auto cleanup) | ✅ Default        |
| `npm run test:clean`       | Manual cleanup only      | 🧹 Before test    |
| `npm run test:coverage`    | Test + coverage report   | 📊 Check coverage |
| `npm run test:unit`        | Unit tests only          | ⚡ Fast check     |
| `npm run test:integration` | Integration tests only   | 🔗 Full flow      |

---

## 🛡️ Prevention (Best Practices)

### ✅ Code Level

```javascript
// ❌ BAD: ไม่ปิด connection
afterAll(async () => {
  await mongoose.disconnect();
});

// ✅ GOOD: บังคับปิด connection
afterAll(async () => {
  await mongoose.connection.close(true); // force: true
  if (mongoServer) {
    await mongoServer.stop({ force: true, doCleanup: true });
  }
  jest.clearAllTimers();
});
```

### ✅ Jest Config

```javascript
// jest.config.js
module.exports = {
  testTimeout: 30000,
  forceExit: true, // ✅ Exit หลัง tests เสร็จ
  detectOpenHandles: true, // ✅ แจ้งเตือน open handles
  maxWorkers: 1, // ✅ Run serially
  clearMocks: true, // ✅ Clear mocks
  resetMocks: true,
  restoreMocks: true,
};
```

### ✅ Package.json Scripts

```json
{
  "scripts": {
    "test": "jest --runInBand --forceExit --detectOpenHandles",
    "pretest": "powershell -ExecutionPolicy Bypass -File ./cleanup-test.ps1"
  }
}
```

---

## 🔍 Troubleshooting

### Issue: Tests still hanging after cleanup

**Check:**

```powershell
# 1. Check Node processes
Get-Process -Name node

# 2. Check MongoDB connections
netstat -ano | findstr :27017

# 3. Check MongoDB temp files
ls $env:TEMP\mongodb-memory-server
```

**Fix:**

```powershell
# Manual cleanup
npm run test:clean
Start-Sleep -Seconds 3
npm test
```

### Issue: "Port 27017 already in use"

**Fix:**

```powershell
# Find and kill process using port 27017
$processId = (netstat -ano | findstr :27017 | Select-String -Pattern '\d+$').Matches.Value
Stop-Process -Id $processId -Force
```

### Issue: "Cannot find module" after cleanup

**Fix:**

```powershell
# Reinstall dependencies
npm install
npm test
```

---

## 📊 Verification

**Test cleanup is working when:**

- ✅ Tests start immediately (< 5 seconds)
- ✅ Tests complete without hanging
- ✅ No "ECONNREFUSED" errors
- ✅ Coverage report generated
- ✅ Jest exits cleanly (exit code 0)

**Still has issues when:**

- ❌ Tests hang for > 30 seconds
- ❌ See "Jest did not exit" warning
- ❌ MongoDB connection errors
- ❌ Need to Ctrl+C to stop

---

## 🎯 Summary

**Default Workflow:**

```powershell
# Just run this - cleanup happens automatically
npm test
```

**If Tests Hang:**

```powershell
# 1. Try manual cleanup first
npm run test:clean
npm test

# 2. If still hanging, force kill
Get-Process node | Stop-Process -Force
npm test

# 3. If nothing works, restart VS Code/Terminal
```

**Prevention:**

- ✅ Always use `npm test` (has auto cleanup)
- ✅ Don't kill tests with Ctrl+C (let them finish)
- ✅ Close tests properly with `afterAll`
- ✅ Use `--forceExit` flag in jest

---

## 🔗 Related Files

- `tests/setup.js` - Test setup with force close
- `jest.config.js` - Jest configuration with forceExit
- `package.json` - Scripts with cleanup
- `cleanup-test.ps1` - Cleanup script

---

**Last Updated:** October 16, 2025  
**Author:** GACP Platform Team (SA/SE Analysis)  
**Status:** Production-Ready ✅
