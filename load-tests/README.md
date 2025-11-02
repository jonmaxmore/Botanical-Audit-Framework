# 🎯 GACP Platform - Load Testing Suite

## 📋 Overview

ระบบทดสอบภาระงาน (Load Testing) สำหรับ GACP Platform ที่จำลองสถานการณ์จริง:

- **1,000 ผู้ใช้/วัน** (เฉพาะวันจันทร์-ศุกร์์)
- **50 พนักงาน** (เจ้าหน้าที่ + ผู้ตรวจสอบ)
- **เวลาทำการ:** 09:00-17:00น.
- **ระยะเวลา:** จำลอง 10 ปี (2015-2024)

---

## 🚀 Quick Start

### 1. ติดตั้ง Dependencies

```bash
# Install Artillery (load testing tool)
npm install -g artillery

# Install Faker for test data generation
npm install @faker-js/faker
```

### 2. เตรียมฐานข้อมูล (Optional - สำหรับทดสอบระยะยาว)

```bash
# Generate 10 years of realistic data
node load-tests/scripts/populate-10-years.js
```

⚠️ **คำเตือน:** Script นี้จะสร้างข้อมูลประมาณ **2.5 ล้าน users** ใช้เวลา ~2-4 ชั่วโมง

### 3. Start Backend Server

```bash
cd apps/backend
npm start
```

### 4. รันการทดสอบ

```bash
# Smoke Test (ทดสอบเบื้องต้น 1 นาที)
node load-tests/scripts/run-load-test.js smoke

# Load Test (ทดสอบภาระปกติ 5 นาที)
node load-tests/scripts/run-load-test.js load

# Stress Test (ทดสอบความทนทาน 10 นาที)
node load-tests/scripts/run-load-test.js stress

# Full Day Simulation (จำลอง 8 ชั่วโมง)
node load-tests/scripts/run-load-test.js full-day
```

---

## 📊 Test Types

### 1. 💨 Smoke Test (1 minute)

**Purpose:** ตรวจสอบว่าระบบทำงานพื้นฐานได้  
**Users:** 10 concurrent  
**Duration:** 60 seconds  
**Acceptance:** 0% error rate, p95 < 1s

```bash
node load-tests/scripts/run-load-test.js smoke
```

**What it tests:**

- Health check endpoint
- User registration
- User login
- Dashboard access
- Certificate verification

---

### 2. 📈 Load Test (5 minutes)

**Purpose:** ทดสอบภาระงานปกติ (1,000 users/day)  
**Users:** 50 concurrent (average)  
**Duration:** 300 seconds  
**Acceptance:** <1% error rate, p95 < 2s

```bash
node load-tests/scripts/run-load-test.js load
```

**What it tests:**

- Farmer workflows (70% of traffic)
  - Registration & Login
  - Application creation & viewing
  - Document uploads
  - Dashboard access
- Officer workflows (20% of traffic)
  - Login & Reviews
  - Application approvals
- Inspector workflows (10% of traffic)
  - Schedule management
  - Inspection completion

---

### 3. 💪 Stress Test (10 minutes)

**Purpose:** ทดสอบความทนทานในช่วง Peak Hours  
**Users:** 200+ concurrent (peak)  
**Duration:** 600 seconds  
**Acceptance:** <5% error rate, p95 < 5s

```bash
node load-tests/scripts/run-load-test.js stress
```

**Peak scenarios:**

- Morning rush (09:00-10:00): 400 users/hour
- Evening rush (16:00-17:00): 500 users/hour
- Database query floods
- Concurrent application submissions

---

### 4. ⚡ Spike Test (5 minutes)

**Purpose:** ทดสอบการรับมือกับการเพิ่มขึ้นกะทันหัน  
**Users:** 10 → 500 → 10  
**Duration:** 300 seconds  
**Acceptance:** System recovers after spike

```bash
node load-tests/scripts/run-load-test.js spike
```

---

### 5. 🕐 Soak Test (8 hours)

**Purpose:** ทดสอบความเสถียรระยะยาว  
**Users:** 30 concurrent  
**Duration:** 28,800 seconds (8 hours)  
**Acceptance:** No memory leaks, consistent performance

```bash
node load-tests/scripts/run-load-test.js soak
```

⚠️ **Run overnight!**

---

### 6. 🌅 Full Day Simulation (8 hours)

**Purpose:** จำลองการใช้งานวันทำงานเต็มวัน  
**Schedule:** 09:00-17:00 (realistic distribution)  
**Users:** Variable (peaks in morning/evening)  
**Duration:** 28,800 seconds

```bash
node load-tests/scripts/run-load-test.js full-day
```

**Hourly distribution:**

- 09:00-10:00: 400 users (40%)
- 10:00-12:00: 200 users (20%)
- 12:00-13:00: 100 users (10%)
- 13:00-16:00: 200 users (20%)
- 16:00-17:00: 100 users (10%)

---

## 📈 Scenarios Tested

### Farmer Workflows (70% of traffic)

1. **Registration** (5%) - New user signup
2. **Login** (20%) - Authentication
3. **Create Application** (15%) - Submit GACP application
4. **View Applications** (15%) - Check application status
5. **View Dashboard** (10%) - Personal dashboard
6. **Upload Documents** (5%) - Document submission

### Officer Workflows (20% of traffic)

1. **Login & Review** (10%) - Authentication + review queue
2. **Review Application** (5%) - Approve/reject applications
3. **Officer Dashboard** (5%) - Statistics & metrics

### Inspector Workflows (10% of traffic)

1. **Inspector Schedule** (5%) - View inspection calendar
2. **Inspector Dashboard** (3%) - Inspection metrics
3. **Complete Inspection** (2%) - Submit inspection results

### Public Access

1. **Verify Certificate** (3%) - Public certificate verification
2. **View Public Info** (2%) - Information pages

---

## 🎯 Performance Targets

### Response Time (p95)

- **Excellent:** < 1 second ✅
- **Good:** < 2 seconds ⚠️
- **Fair:** < 5 seconds ⚠️
- **Poor:** > 5 seconds ❌

### Error Rate

- **Excellent:** < 0.1% ✅
- **Good:** < 1% ⚠️
- **Fair:** < 5% ⚠️
- **Poor:** > 5% ❌

### Throughput

- **Target:** 1,000 users/day = 7 requests/second (avg)
- **Peak:** 400 users/hour = 100 requests/second (morning rush)

---

## 📊 Results & Reporting

### Result Files

All test results are saved to `load-tests/results/`:

```
results/
├── report-smoke-2025-11-02T10-30-00.json      # Raw data
├── report-smoke-2025-11-02T10-30-00.html      # HTML report
├── report-load-2025-11-02T11-00-00.json
├── report-load-2025-11-02T11-00-00.html
└── ...
```

### HTML Reports

Open the HTML report in your browser for interactive visualizations:

```bash
# Example
firefox load-tests/results/report-load-2025-11-02T11-00-00.html
```

**Report includes:**

- Response time distribution
- Request rate over time
- Error rate trends
- Status code breakdown
- Endpoint performance

---

## 🔧 Troubleshooting

### Issue: "Artillery not found"

```bash
npm install -g artillery
# or
npm install artillery --save-dev
```

### Issue: "Backend not running"

```bash
cd apps/backend
npm start
```

Server should be accessible at `http://localhost:5000`

### Issue: "Too many connections to MongoDB"

**Solution:** Increase MongoDB connection pool:

```javascript
// apps/backend/config/database.js
mongoose.connect(uri, {
  maxPoolSize: 100, // Increase from default 10
  minPoolSize: 10
});
```

### Issue: "High error rate during stress test"

**Possible causes:**

1. **CPU/Memory limits** - Scale up server resources
2. **Database bottleneck** - Add indexes, enable caching
3. **Rate limiting** - Adjust rate limiter settings
4. **Connection limits** - Increase max connections

---

## 🎓 Best Practices

### 1. Run Tests Progressively

```bash
# Start small
npm run test:smoke

# If smoke passes, run load test
npm run test:load

# If load passes, run stress test
npm run test:stress
```

### 2. Monitor During Tests

Use these tools to monitor system health:

```bash
# CPU & Memory
htop

# MongoDB
mongostat --port 27017

# Network
netstat -an | grep 5000 | wc -l  # Connection count
```

### 3. Analyze Results

Key metrics to check:

- **p95 Response Time** - Should be < 2s
- **Error Rate** - Should be < 1%
- **Throughput** - Should handle 7 req/s average
- **Memory Usage** - Should not grow over time (soak test)

### 4. Optimize Based on Results

If performance is poor:

**Slow Response Times (>2s):**

- Add Redis caching
- Optimize database queries
- Enable CDN for static assets
- Implement database indexes

**High Error Rates (>1%):**

- Increase connection pool size
- Add rate limiting
- Implement circuit breakers
- Scale horizontally

**Memory Leaks (soak test):**

- Check for unclosed connections
- Review event listener cleanup
- Monitor MongoDB cursors
- Profile with `clinic.js`

---

## 📚 Additional Resources

### Tools Used

- **Artillery** - Modern load testing toolkit
  - Docs: https://artillery.io/docs
  - GitHub: https://github.com/artilleryio/artillery

- **Faker.js** - Generate realistic test data
  - Docs: https://fakerjs.dev/

### Monitoring Tools (Recommended)

- **PM2** - Process manager with monitoring
- **New Relic** - APM for Node.js
- **DataDog** - Infrastructure monitoring
- **MongoDB Atlas** - Built-in performance insights

---

## 🎯 Success Criteria

### Phase 1 Complete ✅

System is ready for production if:

1. ✅ **Smoke test** passes with 0% error rate
2. ✅ **Load test** handles 1,000 users/day with <1% errors
3. ✅ **Stress test** survives peak hours with <5% errors
4. ✅ **p95 response time** < 2 seconds under normal load
5. ✅ **Soak test** shows no memory leaks over 8 hours

### Recommendations for Improvement

Based on test results, implement:

1. **Caching Layer** (Redis) - For dashboard stats, user sessions
2. **Database Indexes** - On frequently queried fields
3. **CDN** - For static assets, documents, certificates
4. **Load Balancer** - For horizontal scaling (if needed)
5. **Auto-scaling** - Based on CPU/Memory metrics

---

## 📞 Support

For questions or issues:

1. Check `load-tests/results/` for detailed error logs
2. Review backend logs: `apps/backend/logs/`
3. Open GitHub Issue with test results attached

---

**Generated:** November 2, 2025  
**Version:** 1.0.0  
**Platform:** GACP (Good Agricultural and Collection Practice)
