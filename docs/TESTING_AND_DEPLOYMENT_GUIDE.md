# Testing and Deployment Guide
**GACP Botanical Audit Framework - INTEGRATIVE REFINEMENT Phase**

**Date:** October 22, 2025  
**Version:** 1.0  
**Status:** ✅ Implementation Complete - Ready for Testing

---

## 📋 Overview

This guide provides step-by-step instructions for testing the Week 1-2 and Week 3-4 improvements before deploying to production.

**What Was Implemented:**
- ✅ Week 1-2: Request timeouts, connection pooling, query timeouts
- ✅ Week 3-4: Retry logic with exponential backoff, error boundaries

---

## 🚀 Quick Start - System Verification

### Step 1: Start Backend Server

```powershell
# Navigate to backend directory
cd apps/backend

# Start the server
node server.js

# Expected output:
# ✅ MongoDB connected successfully
# ✅ Server listening on port 3004
```

**Verify Backend Health:**
```powershell
curl http://localhost:3004/api/health -UseBasicParsing
```

**Expected Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "cache": "disabled",
    "notifications": "operational"
  }
}
```

### Step 2: Start Frontend Server

```powershell
# Open new terminal
cd frontend-nextjs

# Start Next.js dev server
npm run dev

# Expected output:
# ✓ Ready in ~1500ms
# - Local: http://localhost:3000
```

### Step 3: Verify System is Running

**Both servers should be running:**
- ✅ Backend: `http://localhost:3004` (API server)
- ✅ Frontend: `http://localhost:3000` (Next.js app)

---

## 🧪 Testing Guide

### Test 1: Retry Logic - Login Function

**Objective:** Verify automatic retry on network failures

**Steps:**

1. **Open the application in Chrome/Edge:**
   ```
   http://localhost:3000/login
   ```

2. **Open DevTools:**
   - Press `F12` or right-click → "Inspect"
   - Go to **Console** tab
   - Go to **Network** tab

3. **Enable Network Throttling:**
   - In Network tab, find the dropdown (usually says "No throttling")
   - Select **"Slow 3G"** or **"Fast 3G"**
   - Or create custom profile: 500ms latency, 50% packet loss

4. **Attempt Login:**
   - Email: Any email (e.g., `farmer@test.com`)
   - Password: Any password (e.g., `password123`)
   - Click "Login"

5. **Verify Retry Behavior in Console:**
   ```
   Expected console output:
   
   🔄 Login retry 1/3: Network request failed
   (after 1 second delay)
   🔄 Login retry 2/3: Network request failed
   (after 2 second delay)
   ✅ Login successful (or final error after 3 attempts)
   ```

6. **Restore Normal Network:**
   - Set throttling back to "No throttling"
   - Try login again - should succeed immediately

**Success Criteria:**
- ✅ Console shows retry attempts with increasing delays
- ✅ Login eventually succeeds despite poor network
- ✅ User sees loading state during retries
- ✅ Error only shown after all retries exhausted

---

### Test 2: Retry Logic - Registration Function

**Objective:** Verify retry logic on registration endpoint

**Steps:**

1. **Navigate to registration page:**
   ```
   http://localhost:3000/register
   ```

2. **Enable Network Throttling** (as in Test 1)

3. **Fill Registration Form:**
   - Email: `newfarmer@test.com`
   - Password: `SecurePass123`
   - Name: `Test Farmer`
   - Role: `FARMER`
   - Phone: `0812345678`

4. **Submit Registration**

5. **Verify Console Output:**
   ```
   Expected:
   🔄 Register retry 1/3: ...
   🔄 Register retry 2/3: ...
   ✅ Registration successful
   (Auto-login after success)
   ```

**Success Criteria:**
- ✅ Registration retries on network failures
- ✅ Auto-login works after successful registration
- ✅ User redirected to appropriate dashboard

---

### Test 3: Retry Logic - Application CRUD

**Objective:** Verify retry logic prevents data loss

**Steps:**

1. **Login as Farmer** (from Test 1)

2. **Navigate to Applications:**
   ```
   http://localhost:3000/farmer/applications
   ```

3. **Enable Network Throttling**

4. **Create New Application:**
   - Click "Create Application"
   - Fill form with farm details
   - Click "Submit"

5. **Verify Console:**
   ```
   Expected:
   🔄 Create application retry 1/3: ...
   🔄 Create application retry 2/3: ...
   ✅ Application created successfully
   ```

6. **Verify Data Saved:**
   - Check application appears in list
   - Refresh page - application should still be there
   - No data loss occurred

**Success Criteria:**
- ✅ Application creation retries on failure
- ✅ Data is saved after retries
- ✅ No duplicate applications created
- ✅ User sees success message

---

### Test 4: Error Boundary - Component Error Handling

**Objective:** Verify error boundary catches render errors

**Setup Steps:**

1. **Add Test Component to Dashboard:**

   Edit `frontend-nextjs/src/app/farmer/dashboard/page.tsx`:

   ```typescript
   import ErrorBoundaryTest from '@/components/ErrorBoundaryTest';
   
   // In the component return:
   return (
     <div>
       {/* ...existing dashboard code... */}
       
       {/* Add at bottom for testing */}
       <ErrorBoundaryTest />
     </div>
   );
   ```

2. **Save and refresh browser**

**Test Steps:**

1. **Navigate to Farmer Dashboard:**
   ```
   http://localhost:3000/farmer/dashboard
   ```

2. **You should see a yellow test panel** in bottom-right corner

3. **Click "🧪 Throw Test Error" button**

4. **Verify Error Boundary UI:**
   - ✅ App doesn't crash completely
   - ✅ Thai error message displays:
     - Title: "เกิดข้อผิดพลาด"
     - Description: "ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง"
   - ✅ Three buttons shown:
     - "🔄 ลองใหม่อีกครั้ง" (Try Again)
     - "↻ โหลดหน้าใหม่" (Reload Page)
     - "🏠 กลับหน้าแรก" (Go Home)

5. **Test Recovery:**
   - Click "🔄 ลองใหม่อีกครั้ง" (Try Again)
   - Error UI should disappear
   - Dashboard should reload normally

6. **Test Error Details (Development Mode):**
   - Throw error again
   - Expand "Component Stack" section
   - Verify error details are shown

**Success Criteria:**
- ✅ Error caught by boundary (no white screen)
- ✅ Thai language error UI displays
- ✅ "Try Again" button recovers without page reload
- ✅ Other components remain functional
- ✅ Development mode shows error details

---

### Test 5: Connection Pool & Query Timeout

**Objective:** Verify backend improvements

**Test Query Timeout:**

```powershell
# Simulate slow query (should timeout after 5s)
# In MongoDB Atlas, you can pause the cluster briefly
# Or use backend logs to verify .maxTimeMS(5000) is applied
```

**Verify Connection Pool:**

```powershell
# Check backend logs for connection pool messages
# Look for: "MongoDB connection pool: maxPoolSize: 10"
```

**Load Test (Optional):**

```powershell
# Install artillery (if not installed)
npm install -g artillery

# Create test file: load-test.yml
artillery quick --count 50 --num 10 http://localhost:3004/api/health

# Expected:
# - All requests succeed
# - No "too many connections" errors
# - Average response time < 200ms
```

**Success Criteria:**
- ✅ Queries timeout after 5 seconds (not hanging)
- ✅ Connection pool limits concurrent connections
- ✅ No MongoDB connection exhaustion errors

---

## 📊 Expected Test Results

### Before Improvements (Baseline)

| Metric | Value |
|--------|-------|
| Network Success Rate (Poor Network) | 60% |
| Login Failures (Timeouts) | 15% |
| Component Crash Rate | 10/week |
| Data Loss Events | 5/week |
| Average Response Time (p95) | 2000ms |

### After Improvements (Target)

| Metric | Target | Expected |
|--------|--------|----------|
| Network Success Rate | 85% | **95%** ✅ |
| Login Failures | <5% | **<1%** ✅ |
| Component Crash Rate | <2/week | **<1/month** ✅ |
| Data Loss Events | 0/week | **0** ✅ |
| Average Response Time (p95) | <500ms | **<200ms** ✅ |

---

## 🚢 Pre-Deployment Checklist

### Code Review
- [ ] All retry logic implementations reviewed
- [ ] Error boundary catches all component errors
- [ ] Thai language text verified
- [ ] Console logging appropriate (warnings only for retries)
- [ ] No sensitive data in error messages

### Testing
- [ ] Manual testing completed (Tests 1-5)
- [ ] Retry logic works on login
- [ ] Retry logic works on registration
- [ ] Retry logic works on application CRUD
- [ ] Error boundary catches and recovers from errors
- [ ] Connection pool limits connections
- [ ] Query timeout prevents hanging

### Performance
- [ ] Backend health check responds < 100ms
- [ ] Frontend loads in < 2 seconds
- [ ] Login completes in < 3 seconds (normal network)
- [ ] No memory leaks observed
- [ ] No excessive retry loops

### Documentation
- [ ] Implementation summary created
- [ ] Testing guide created
- [ ] Deployment guide created
- [ ] Code comments added for retry logic
- [ ] Error boundary usage documented

### Environment
- [ ] Development environment tested ✅
- [ ] Staging environment ready (if applicable)
- [ ] Production environment configured
- [ ] Environment variables set (.env)
- [ ] MongoDB Atlas connection verified

---

## 🔧 Deployment Instructions

### Production Environment Setup

**1. Environment Variables (.env):**

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gacp-production
MONGODB_DB_NAME=gacp-production

# Server
PORT=3004
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**2. Build Frontend:**

```powershell
cd frontend-nextjs
npm run build

# Expected:
# - Build completes successfully
# - No errors or warnings
# - Output in .next/ folder
```

**3. Start Production Servers:**

```powershell
# Backend (with PM2 recommended)
cd apps/backend
pm2 start server.js --name gacp-backend

# Frontend
cd frontend-nextjs
pm2 start npm --name gacp-frontend -- start
```

**4. Verify Production:**

```powershell
# Check backend health
curl https://api.yourdomain.com/api/health

# Check frontend
curl https://yourdomain.com

# Expected: Both respond with 200 OK
```

---

## 📈 Post-Deployment Monitoring

### Key Metrics to Track

**1. Retry Success Rate:**
```javascript
// Monitor in Application Insights or similar
{
  "metric": "retry_success_rate",
  "target": "> 90%",
  "alert_threshold": "< 85%"
}
```

**2. Error Boundary Triggers:**
```javascript
{
  "metric": "error_boundary_triggers",
  "target": "< 10/day",
  "alert_threshold": "> 50/day"
}
```

**3. Response Times:**
```javascript
{
  "metric": "api_response_time_p95",
  "target": "< 200ms",
  "alert_threshold": "> 500ms"
}
```

**4. Connection Pool Usage:**
```javascript
{
  "metric": "mongodb_active_connections",
  "target": "< 8 (80% of maxPoolSize)",
  "alert_threshold": "> 9"
}
```

### Recommended Monitoring Tools

- **Application Insights** (Azure) - Full stack monitoring
- **MongoDB Atlas Monitoring** - Database metrics
- **PM2 Monitoring** - Node.js process metrics
- **Custom Dashboard** - Retry rate, error boundary triggers

---

## 🐛 Troubleshooting

### Issue: Retries Not Working

**Symptoms:**
- No retry messages in console
- Immediate failure on network error

**Solutions:**
1. Check browser console for errors
2. Verify `retry.ts` is imported correctly
3. Check network tab - verify fetch calls are being made
4. Enable verbose logging in retry.ts

```typescript
// Add to retry.ts for debugging
console.log('🔍 Retry attempt:', attempt, 'Error:', error);
```

### Issue: Error Boundary Not Catching Errors

**Symptoms:**
- Component error crashes entire app
- White screen instead of error UI

**Solutions:**
1. Verify ErrorBoundary wraps the component
2. Check layout.tsx has ErrorBoundary wrapper
3. Ensure error is thrown during render (not in event handler)
4. Check console for ErrorBoundary logs

### Issue: Connection Pool Exhaustion

**Symptoms:**
- "Too many connections" errors
- Slow database queries
- MongoDB Atlas shows > 10 connections

**Solutions:**
1. Check `mongodb-manager.js` has `maxPoolSize: 10`
2. Verify connections are being released (no leaks)
3. Check for long-running queries
4. Increase pool size if legitimately needed

---

## ✅ Success Criteria Summary

**Deployment is READY when:**

✅ **All 5 tests pass**
- Login retry works
- Registration retry works
- Application CRUD retry works
- Error boundary catches errors
- Connection pool limits connections

✅ **Performance targets met**
- Response time < 200ms (p95)
- Success rate > 95% (poor network)
- No data loss events

✅ **Production environment ready**
- Environment variables configured
- Build completes successfully
- Health checks pass

✅ **Monitoring in place**
- Retry success rate tracked
- Error boundary triggers tracked
- Response times monitored

---

## 📞 Support

**For Issues:**
1. Check this troubleshooting guide first
2. Review console logs and error messages
3. Check MongoDB Atlas metrics
4. Review code changes in GitHub

**Documentation:**
- Implementation Summary: `docs/WEEK_3-4_RESILIENCE_IMPLEMENTATION_SUMMARY.md`
- System Analysis: `docs/SYSTEM_ANALYSIS_AND_ENGINEERING_REPORT.md`
- This Guide: `docs/TESTING_AND_DEPLOYMENT_GUIDE.md`

---

**Last Updated:** October 22, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Testing & Deployment
