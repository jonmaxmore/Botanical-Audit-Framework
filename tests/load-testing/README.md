# 🧪 GACP Load Testing Suite

## Overview

ระบบจำลองการทดสอบโดย **200 QA Testers** พร้อมกันแบบ realistic แบ่งเป็น 3 กลุ่มตามระดับความรู้:

### 👥 User Groups

| Group            | Count | Knowledge | Error Rate | Think Time | Description                              |
| ---------------- | ----- | --------- | ---------- | ---------- | ---------------------------------------- |
| **Beginners**    | 100   | 0%        | 40%        | 5-15s      | ไม่รู้จักระบบเลย มือใหม่ทั้งหมด          |
| **Intermediate** | 50    | 50%       | 20%        | 2-8s       | รู้จักโครงการพอประมาณ                    |
| **Experts**      | 50    | 100%      | 5%         | 0.5-3s     | เชี่ยวชาญระบบเต็มที่                     |
| **DTAM Staff**   | 60    | 100%      | 3%         | 1-4s       | 20 คน x 3 roles (Admin/Reviewer/Manager) |

**Total: 260 Concurrent Users**

---

## 🎯 Test Scenarios

### Farmer Portal (150 users)

1. ✅ **Registration** - ลงทะเบียนผู้ใช้ใหม่
2. ✅ **Login** - เข้าสู่ระบบ
3. ✅ **Profile Setup** - ตั้งค่าข้อมูลโปรไฟล์
4. ✅ **Document Upload** - อัปโหลดเอกสาร GAP
5. ✅ **Application Submit** - ส่งคำขอรับรอง
6. ✅ **Dashboard View** - ดูสถานะเอกสาร
7. ✅ **Search & Filter** - ค้นหาและกรองเอกสาร
8. ✅ **Document Download** - ดาวน์โหลดเอกสาร
9. ✅ **Notification Check** - ตรวจสอบการแจ้งเตือน

### DTAM Portal (60 users)

1. ✅ **DTAM Login** - เข้าสู่ระบบเจ้าหน้าที่
2. ✅ **Dashboard View** - ดูสถิติและภาพรวม
3. ✅ **Applications List** - ดูรายการคำขอทั้งหมด
4. ✅ **Review Approve** - อนุมัติคำขอ
5. ✅ **Review Reject** - ปฏิเสธคำขอ
6. ✅ **Statistics View** - ดูสถิติการทำงาน
7. ✅ **Export Report** - ส่งออกรายงาน

---

## 📋 Prerequisites

### 1. Backend Service Running

```bash
cd ../../backend
npm run dev
# หรือ
npm start
```

### 2. Database Ready

- MongoDB ต้อง running บน `localhost:27017`
- หรือตั้งค่า `MONGODB_URI` ใน `.env`

### 3. Dependencies Installed

```bash
cd tests/load-testing
npm install
```

---

## 🚀 Usage

### Quick Test (Recommended for first run)

```bash
npm test
```

### Full Load Test (260 concurrent users)

```bash
npm run test:full
```

### Custom Configuration

```bash
# ปรับ API URL
API_URL=http://localhost:5000 npm test

# ปรับจำนวน users
node multi-user-qa-simulation.js --beginners=50 --intermediate=25 --experts=25
```

---

## 📊 What Gets Tested

### Beginner Behavior (100 users)

- ❌ **High Error Rate (40%)**: กรอกข้อมูลผิด, ลืมฟิลด์, ใช้ password ง่ายๆ
- ⏱️ **Slow Actions**: ใช้เวลานาน 5-15 วินาที ต่อ action
- 🔄 **50% Retry**: ลองใหม่เมื่อเจอ error
- 📤 **Wrong File Types**: อัปโหลดไฟล์ขนาดใหญ่เกินไป หรือ format ผิด
- 🎯 **Random Priority**: เลือก urgency แบบสุ่ม (ไม่เข้าใจความหมาย)

**Example Actions:**

```javascript
// กรอก password ง่ายๆ
{
  password: '123456';
}

// อัปโหลดไฟล์ใหญ่มาก
{
  fileSize: 10000000;
} // 10 MB

// เลือก urgency แบบสุ่ม
{
  urgency: 'high';
} // แม้ว่าจะไม่เร่งด่วน
```

### Intermediate Behavior (50 users)

- ⚠️ **Medium Error Rate (20%)**: ทำผิดบ้างเป็นครั้งคราว
- ⏱️ **Moderate Speed**: 2-8 วินาที ต่อ action
- 🔄 **70% Retry**: มักจะลองใหม่เมื่อผิดพลาด
- 📤 **Better Files**: ใช้ไฟล์ขนาดเหมาะสม (500KB - 3MB)
- 🎯 **Correct Priority**: เข้าใจ urgency level พอสมควร

**Example Actions:**

```javascript
// Password ดีกว่า
{
  password: 'Test@1234';
}

// ไฟล์ขนาดเหมาะสม
{
  fileSize: 2000000;
} // 2 MB

// เข้าใจ urgency
{
  urgency: 'medium';
}
```

### Expert Behavior (50 users)

- ✅ **Low Error Rate (5%)**: แทบไม่มี error
- ⚡ **Fast Actions**: 0.5-3 วินาที ต่อ action
- 🔄 **90% Retry**: พยายามแก้ปัญหาจนได้
- 📤 **Perfect Files**: ไฟล์ขนาดเหมาะสม format ถูกต้อง
- 🎯 **Correct Everything**: เข้าใจทุกขั้นตอน ทำถูกทุกอย่าง

**Example Actions:**

```javascript
// Password แข็งแรง
{ password: "Expert@2024!Secure" }

// Complete profile
{
  farmAddress: "เชียงใหม่",
  farmSize: 50,
  cropTypes: ["กัญชา", "กัญชง"],
  certifications: ["GAP", "Organic"]
}

// Perfect workflow
await setupProfile()
await uploadDocument()
await submitApplication()
await checkNotifications()
```

### DTAM Staff Behavior (60 users)

- ✨ **Very Low Error Rate (3%)**: เชี่ยวชาญมาก
- ⚡ **Efficient**: 1-4 วินาที ต่อ action
- 🔄 **95% Retry**: แก้ปัญหาได้เกือบทุกครั้ง
- 📊 **Complete Workflow**: ทดสอบทุกฟีเจอร์ DTAM portal

**Roles:**

- **Admin** (20 users): จัดการระบบ, ตั้งค่า
- **Reviewer** (20 users): รีวิวและอนุมัติเอกสาร
- **Manager** (20 users): ดูสถิติ, export รายงาน

---

## 📈 Metrics Collected

### Overall Statistics

- ✅ Total Requests
- ✅ Successful Requests
- ❌ Failed Requests
- 📊 Success Rate %
- ❌ Error Rate %
- ⚡ Requests per Second

### Response Times

- 📏 Average
- 📊 Median (P50)
- 📈 P95 Percentile
- 📈 P99 Percentile
- 🔽 Min
- 🔼 Max

### By User Group

- Beginners success rate
- Intermediate success rate
- Experts success rate
- DTAM staff success rate

### By Scenario

- Registration success rate
- Login success rate
- Document upload success rate
- Application submit success rate
- Review approve/reject rates
- Each with average response times

### Error Types

- HTTP 400 (Bad Request)
- HTTP 401 (Unauthorized)
- HTTP 404 (Not Found)
- HTTP 500 (Server Error)
- Network Errors
- Timeout Errors

---

## 📄 Output Reports

### Console Output

```
═══════════════════════════════════════════════════════════
  🧪 GACP COMPREHENSIVE QA LOAD TEST SIMULATION
═══════════════════════════════════════════════════════════

📊 Test Configuration:
   • Beginners (0% knowledge): 100 users
   • Intermediate (50% knowledge): 50 users
   • Experts (100% knowledge): 50 users
   • DTAM Staff: 20 x 3 roles = 60 users
   • Total Users: 210 concurrent testers

🎯 Test Scenarios:
   ✓ registration
   ✓ login
   ✓ profile_setup
   ✓ document_upload
   ...

🚀 Starting load test...

Progress |████████████████████████████████| 100% | 210/210 Users | ETA: 0s

✅ Load test completed!

═══════════════════════════════════════════════════════════
  📊 TEST RESULTS SUMMARY
═══════════════════════════════════════════════════════════

📈 Overall Statistics:
   Duration: 305.42s
   Total Requests: 2,847
   Successful: 2,698
   Failed: 149
   Success Rate: 94.77%
   Error Rate: 5.23%
   Requests/sec: 9.32

⏱️  Response Times:
   Average: 1,234.56ms
   Median: 987.23ms
   P95: 2,456.78ms
   P99: 3,789.45ms
   Min: 123.45ms
   Max: 8,901.23ms

👥 Results by User Group:
   beginners:
     • Total: 1,200
     • Success: 720 (60.00%)
     • Failed: 480

   intermediate:
     • Total: 850
     • Success: 765 (90.00%)
     • Failed: 85

   experts:
     • Total: 597
     • Success: 567 (95.00%)
     • Failed: 30

   dtamStaff:
     • Total: 200
     • Success: 194 (97.00%)
     • Failed: 6

🎯 Top 5 Scenarios by Success Rate:
   login: 98.50% (234ms avg)
   dashboard_view: 97.20% (456ms avg)
   profile_setup: 95.80% (789ms avg)
   document_upload: 92.30% (1234ms avg)
   application_submit: 89.70% (1567ms avg)

✅ Performance Thresholds:
   Response Time < 2000ms: PASS ✓
   Error Rate < 5%: PASS ✓
   Success Rate > 95%: FAIL ✗

   Overall: FAILED ❌

📄 Detailed report saved to: qa-simulation-report-2025-10-13T08-30-45-123Z.json

═══════════════════════════════════════════════════════════
```

### JSON Report

Saved to `qa-simulation-report-[timestamp].json`:

```json
{
  "summary": {
    "duration": "305.42s",
    "totalRequests": 2847,
    "successfulRequests": 2698,
    "failedRequests": 149,
    "successRate": "94.77%",
    "errorRate": "5.23%",
    "requestsPerSecond": "9.32"
  },
  "responseTimes": {
    "average": "1234.56ms",
    "median": "987.23ms",
    "p95": "2456.78ms",
    "p99": "3789.45ms",
    "min": "123.45ms",
    "max": "8901.23ms"
  },
  "errorsByType": {
    "400": 45,
    "401": 23,
    "500": 12,
    "ECONNREFUSED": 69
  },
  "scenarioResults": {
    "registration": {
      "total": 210,
      "success": 198,
      "failed": 12,
      "avgResponseTime": 1234,
      "successRate": 0.9428
    }
    // ... more scenarios
  },
  "userGroupResults": {
    "beginners": {
      "total": 1200,
      "success": 720,
      "failed": 480
    }
    // ... more groups
  }
}
```

---

## 🎛️ Configuration Options

### Environment Variables

```bash
# API Base URL
API_URL=http://localhost:5000

# MongoDB Connection (if needed)
MONGODB_URI=mongodb://localhost:27017/gacp

# Test Duration (milliseconds)
TEST_DURATION=300000

# Max Concurrent Users per Batch
MAX_CONCURRENT=50

# Ramp-up Time (milliseconds)
RAMP_UP_TIME=60000
```

### Edit `CONFIG` in `multi-user-qa-simulation.js`

```javascript
const CONFIG = {
  userGroups: {
    beginners: {
      count: 100, // ปรับจำนวน
      errorRate: 0.4, // ปรับ error rate
      thinkTime: [5000, 15000], // ปรับเวลาคิด
    },
    // ... more groups
  },
  performance: {
    maxConcurrent: 50, // users พร้อมกันสูงสุด
    rampUpTime: 60000, // เวลาเพิ่ม users ค่อยๆ
    testDuration: 300000, // ระยะเวลาทดสอบ
    thresholds: {
      responseTime: 2000, // threshold response time
      errorRate: 0.05, // threshold error rate
      successRate: 0.95, // threshold success rate
    },
  },
};
```

---

## 🐛 Troubleshooting

### ❌ Error: ECONNREFUSED

**Problem**: ไม่สามารถเชื่อมต่อ backend API

**Solution**:

```bash
# ตรวจสอบว่า backend running หรือไม่
cd ../../backend
npm start

# ตรวจสอบ port ถูกต้อง
netstat -an | findstr :5000
```

### ❌ Error: Cannot find module 'axios'

**Problem**: ไม่มี dependencies

**Solution**:

```bash
cd tests/load-testing
npm install
```

### ⚠️ High Error Rate (>10%)

**Problem**: ระบบไม่รองรับ load

**Solutions**:

1. ลดจำนวน concurrent users: `maxConcurrent: 25`
2. เพิ่ม ramp-up time: `rampUpTime: 120000` (2 minutes)
3. ตรวจสอบ database performance
4. เพิ่ม server resources (CPU/RAM)

### ⚠️ Slow Response Times (>3s average)

**Problem**: Performance bottleneck

**Solutions**:

1. ตรวจสอบ database indexes
2. Enable caching (Redis)
3. Optimize API queries
4. Scale horizontally (load balancer)

---

## 📚 Understanding Results

### Success Rate Expectations

| User Group   | Expected Success Rate | Why?                                   |
| ------------ | --------------------- | -------------------------------------- |
| Beginners    | 60-70%                | High error rate (40%), confused users  |
| Intermediate | 80-90%                | Some mistakes (20%), partial knowledge |
| Experts      | 95-98%                | Very few errors (5%), full knowledge   |
| DTAM Staff   | 97-99%                | Professional users (3% errors)         |
| **Overall**  | **85-92%**            | Weighted average                       |

### Performance Benchmarks

| Metric            | Good | Warning | Critical |
| ----------------- | ---- | ------- | -------- |
| Avg Response Time | <1s  | 1-2s    | >2s      |
| P95 Response Time | <2s  | 2-3s    | >3s      |
| Error Rate        | <5%  | 5-10%   | >10%     |
| Success Rate      | >95% | 90-95%  | <90%     |
| Requests/sec      | >10  | 5-10    | <5       |

### Common Error Patterns

#### 400 Bad Request

- **Cause**: Invalid input data
- **User Group**: Mainly beginners (wrong formats, missing fields)
- **Action**: Improve validation error messages

#### 401 Unauthorized

- **Cause**: Token expired or invalid
- **User Group**: All groups (session timeout)
- **Action**: Implement token refresh, increase session duration

#### 500 Server Error

- **Cause**: Backend bugs or database issues
- **User Group**: All groups equally
- **Action**: Fix bugs, add error handling, monitor logs

#### ECONNREFUSED / Timeout

- **Cause**: Server overloaded or crashed
- **User Group**: All groups (infrastructure issue)
- **Action**: Scale servers, optimize performance, add rate limiting

---

## 🔍 Analyzing Reports

### Find Performance Bottlenecks

```bash
# หา scenario ที่ช้าที่สุด
cat qa-simulation-report-*.json | jq '.scenarioResults | to_entries | sort_by(.value.avgResponseTime) | reverse | .[0:5]'

# หา error มากที่สุด
cat qa-simulation-report-*.json | jq '.errorsByType | to_entries | sort_by(.value) | reverse'
```

### Compare User Groups

```bash
# ดู success rate แต่ละกลุ่ม
cat qa-simulation-report-*.json | jq '.userGroupResults | to_entries | map({group: .key, successRate: (.value.success / .value.total * 100)})'
```

---

## 🎯 Best Practices

### 1. Warm-up Phase

```bash
# Run small test first
node multi-user-qa-simulation.js --beginners=10 --intermediate=5 --experts=5
```

### 2. Incremental Load

```javascript
// ค่อยๆ เพิ่ม users
rampUpTime: 120000, // 2 minutes
maxConcurrent: 25   // เริ่มต่ำๆ
```

### 3. Monitor System

```bash
# Watch backend logs
cd ../../backend
npm run dev

# Monitor database
mongosh
> use gacp
> db.currentOp()
```

### 4. Analyze & Fix

1. รัน load test
2. ดู error patterns
3. แก้ issues
4. รันอีกครั้ง
5. เปรียบเทียบผล

---

## 📖 Additional Resources

- [Load Testing Best Practices](../docs/LOAD_TESTING.md)
- [Performance Optimization Guide](../docs/PERFORMANCE.md)
- [API Documentation](../../API_DOCUMENTATION.md)
- [Error Handling Guide](../../ERROR_HANDLING_GUIDE.md)

---

## 📞 Support

**Issues?** Contact:

- 📧 Email: dev-team@gacp.go.th
- 💬 Slack: #gacp-testing
- 📚 Docs: [Internal Wiki](http://wiki.gacp.go.th/testing)

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-13  
**Maintainer**: GACP Development Team
