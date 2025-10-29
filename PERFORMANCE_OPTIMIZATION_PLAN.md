# Backend Performance Optimization Plan

**Date:** October 26, 2025  
**Current Status:** 92.3% timeout rate, 1.2GB memory usage  
**Target:** < 5% error rate, < 500MB memory usage

---

## Critical Issues Identified

### 1. High Timeout Rate (92.3%) - CRITICAL

**Impact:** Most requests never complete  
**Root Causes:**

- MongoDB connection pool too small (maxPoolSize: 10)
- Bcrypt operations may block during high load
- No request timeout configuration
- Possible rate limiter overhead

### 2. High Memory Usage (1.2GB) - HIGH

**Impact:** Server instability, possible crashes  
**Root Causes:**

- Winston logger may buffer too much
- Request/response objects not properly released
- Possible event listener leaks
- Large object caching without limits

### 3. Limited Concurrency - MEDIUM

**Impact:** Only 2-3 RPS effectively handled  
**Root Causes:**

- Single-threaded bottlenecks
- No request queuing
- Synchronous operations in hot paths

---

## Optimization Actions

### Phase 1: Quick Wins (Immediate - 1-2 hours)

#### 1.1 Increase MongoDB Connection Pool

**File:** `apps/backend/config/mongodb-manager.js`

```javascript
// CURRENT
maxPoolSize: 10,
minPoolSize: 2,

// RECOMMENDED
maxPoolSize: 50,        // Increase to handle more concurrent requests
minPoolSize: 5,         // Keep more warm connections
```

**Rationale:**

- Atlas M0 tier supports up to 500 connections
- Current limit of 10 is too restrictive
- More connections = less waiting for available connection

#### 1.2 Add Request Timeouts

**File:** `apps/backend/server.js`

```javascript
// Add after app initialization
app.use((req, res, next) => {
  // Set request timeout to 30 seconds
  req.setTimeout(30000, () => {
    res.status(408).json({
      success: false,
      error: 'REQUEST_TIMEOUT',
      message: 'Request took too long to process'
    });
  });

  // Set response timeout
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Server is overloaded'
      });
    }
  });

  next();
});
```

#### 1.3 Optimize Winston Logger

**File:** Need to check current logger configuration

```javascript
// Reduce log levels in development
// Add log rotation
// Limit buffer size
```

#### 1.4 Add Express Response Compression

**File:** `apps/backend/server.js`

```javascript
const compression = require('compression');

// Add after body parsers
app.use(
  compression({
    level: 6, // Compression level (1-9)
    threshold: 1024, // Only compress > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  })
);
```

### Phase 2: Concurrency Improvements (Short-term - 2-4 hours)

#### 2.1 Implement Request Queue

**New File:** `apps/backend/middleware/request-queue.js`

```javascript
const Queue = require('bull'); // Or p-queue for in-memory

// Limit concurrent requests
const MAX_CONCURRENT = 50;
const requestQueue = new Queue('api-requests', {
  redis: process.env.REDIS_URL,
  limiter: {
    max: MAX_CONCURRENT,
    duration: 1000
  }
});

module.exports = (req, res, next) => {
  requestQueue.add(() => next());
};
```

#### 2.2 Add Database Query Indexes

**Check missing indexes:**

```javascript
// User model - likely needed:
email: { index: true }              // ✅ Already exists
status: { index: true }             // ❌ MISSING - add this!
'loginAttempts.count': { index: true }  // ❌ Consider adding

// Run in MongoDB:
db.users.createIndex({ status: 1 })
db.users.createIndex({ 'loginAttempts.count': 1 })
```

#### 2.3 Cache Frequently Accessed Data

**File:** `apps/backend/middleware/cache.js`

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default
  checkperiod: 120, // Check for expired keys every 2 min
  maxKeys: 1000, // Limit cache size
  useClones: false // Better performance
});

module.exports = cache;
```

### Phase 3: Architecture Changes (Medium-term - 1 day)

#### 3.1 Move Bcrypt to Worker Threads

**New File:** `apps/backend/workers/bcrypt-worker.js`

```javascript
const { Worker } = require('worker_threads');

// Offload bcrypt operations to separate thread
class BcryptWorker {
  constructor(poolSize = 2) {
    this.workers = [];
    for (let i = 0; i < poolSize; i++) {
      this.workers.push(new Worker('./bcrypt-worker-thread.js'));
    }
    this.currentWorker = 0;
  }

  async hash(password, rounds = 12) {
    const worker = this.workers[this.currentWorker];
    this.currentWorker = (this.currentWorker + 1) % this.workers.length;

    return new Promise((resolve, reject) => {
      worker.postMessage({ operation: 'hash', password, rounds });
      worker.once('message', resolve);
      worker.once('error', reject);
    });
  }

  async compare(password, hash) {
    // Similar implementation
  }
}

module.exports = new BcryptWorker();
```

#### 3.2 Implement Circuit Breaker

**File:** `apps/backend/middleware/circuit-breaker.js`

```javascript
const CircuitBreaker = require('opossum');

// Wrap database operations
const breaker = new CircuitBreaker(asyncFunction, {
  timeout: 5000, // Fail after 5s
  errorThresholdPercentage: 50, // Open after 50% failures
  resetTimeout: 30000 // Try again after 30s
});

breaker.fallback(() => {
  return { error: 'Service temporarily unavailable' };
});
```

#### 3.3 Add Health Check Endpoint

**File:** `apps/backend/routes/health.js`

```javascript
router.get('/health', async (req, res) => {
  const mongoStatus = await mongoManager.healthCheck();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: mongoStatus.status === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
    },
    database: mongoStatus
  });
});
```

### Phase 4: Monitoring & Profiling (Ongoing)

#### 4.1 Add Performance Monitoring

**Install APM tools:**

```bash
pnpm add @sentry/node
# or
pnpm add newrelic
# or
pnpm add elastic-apm-node
```

#### 4.2 Memory Profiling

```bash
# Take heap snapshot
node --inspect apps/backend/server.js

# Or use clinic.js
pnpm add -D clinic
clinic doctor -- node apps/backend/server.js
```

#### 4.3 Add Request Metrics

**File:** `apps/backend/middleware/metrics.js`

```javascript
const metrics = {
  requests: 0,
  errors: 0,
  responseTimes: []
};

app.use((req, res, next) => {
  const start = Date.now();
  metrics.requests++;

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.responseTimes.push(duration);

    // Keep only last 100 measurements
    if (metrics.responseTimes.length > 100) {
      metrics.responseTimes.shift();
    }

    if (res.statusCode >= 400) {
      metrics.errors++;
    }
  });

  next();
});
```

---

## Implementation Order

### Immediate (Do Now - 1 hour)

1. ✅ Increase MongoDB pool size (maxPoolSize: 50, minPoolSize: 5)
2. ✅ Add request timeouts (30s)
3. ✅ Add status index to User model
4. ✅ Enable compression

### Next Session (2-4 hours)

5. Add request queue/rate limiting per IP
6. Implement simple caching
7. Add health check endpoint
8. Profile memory usage

### Future Sessions (1-2 days)

9. Move bcrypt to worker threads
10. Implement circuit breaker
11. Add APM monitoring
12. Optimize queries with explain()

---

## Expected Results

### After Phase 1 (Quick Wins):

- Timeout rate: 92.3% → **< 50%**
- Memory usage: 1.2GB → **< 800MB**
- Success rate: 7.7% → **> 50%**

### After Phase 2 (Concurrency):

- Timeout rate: < 50% → **< 20%**
- Success rate: > 50% → **> 80%**
- Handle: 10 RPS → **25-50 RPS**

### After Phase 3 (Architecture):

- Timeout rate: < 20% → **< 5%**
- Success rate: > 80% → **> 95%**
- Handle: 50 RPS → **100+ RPS**
- Memory stable: < 500MB

---

## Testing Plan

After each phase:

1. Run `node run-load-tests.js all` (light mode)
2. Monitor memory usage
3. Check backend logs for errors
4. Compare metrics with baseline
5. Document improvements

---

## Dependencies Needed

```bash
# Phase 1
pnpm add compression

# Phase 2
pnpm add node-cache

# Phase 3 (optional)
pnpm add bull  # If using Redis queue
pnpm add opossum  # Circuit breaker

# Phase 4 (monitoring)
pnpm add @sentry/node
# or
pnpm add clinic -D
```

---

## Rollback Plan

If optimizations cause issues:

1. Git revert to current commit
2. Restore original mongodb-manager.js
3. Remove new middleware
4. Restart server

Keep backup of working configuration!

---

**Next Action:** Start Phase 1 - Quick Wins
