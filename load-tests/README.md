# Load Testing Guide

Performance testing suite for GACP Botanical Audit Framework using Artillery.

## 📋 Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:5000`
- MongoDB and Redis running
- Test user accounts created

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create Test Users

Run the setup script to create load test users:

```bash
node load-tests/setup-test-users.js
```

### 3. Start Backend Server

```bash
pm2 start ecosystem.config.js
# or
pnpm run dev
```

### 4. Run Load Tests

**Interactive Mode:**
```bash
node run-load-tests.js
```

**Command Line:**
```bash
# Run all recommended tests
node run-load-tests.js all

# Run specific tests
node run-load-tests.js auth
node run-load-tests.js api
node run-load-tests.js stress
node run-load-tests.js spike
node run-load-tests.js soak
```

## 📊 Test Scenarios

### 1. Authentication Load Test (`auth-load-test.yml`)

**Duration**: ~5 minutes  
**Target**: Authentication endpoints  
**Load Pattern**:
- Warm-up: 10 users/sec for 30s
- Ramp-up: 10 → 50 users/sec over 60s
- Sustained: 100 users/sec for 120s
- Peak: 200 users/sec for 60s
- Cool-down: 100 → 20 users/sec over 30s

**Scenarios**:
- User login flow (60%)
- Token refresh flow (25%)
- Failed login attempts (10%)
- Profile update flow (5%)

**Success Criteria**:
- ✅ Error rate < 1%
- ✅ P95 latency < 100ms
- ✅ P99 latency < 200ms

**Run**:
```bash
artillery run load-tests/auth-load-test.yml
```

### 2. API Endpoints Load Test (`api-load-test.yml`)

**Duration**: ~6 minutes  
**Target**: Main API endpoints  
**Load Pattern**:
- Warm-up: 5 users/sec for 30s
- Ramp-up: 5 → 30 users/sec over 60s
- Sustained: 50 users/sec for 180s
- Spike: 100 users/sec for 30s
- Recovery: 50 → 30 users/sec over 60s

**Scenarios**:
- Farmer management (40%)
- Certificate verification (30%)
- Inspection management (20%)
- Dashboard and reports (10%)

**Success Criteria**:
- ✅ Error rate < 2%
- ✅ P95 latency < 200ms
- ✅ P99 latency < 500ms

**Run**:
```bash
artillery run load-tests/api-load-test.yml
```

### 3. Stress Test (`stress-test.yml`)

**Duration**: ~7 minutes  
**Purpose**: Find system breaking point  
**Load Pattern**: Gradually increases from 10 → 1000 RPS

**Phases**:
1. Baseline: 10 RPS (60s)
2. Low: 50 RPS (60s)
3. Medium: 100 RPS (60s)
4. High: 200 RPS (60s)
5. Very High: 300 RPS (60s)
6. Extreme: 500 RPS (60s)
7. Stress Point: 1000 RPS (60s)

**Run**:
```bash
artillery run load-tests/stress-test.yml
```

**Monitor**:
- CPU usage
- Memory usage
- Response times
- Error rates
- Database connections
- Redis memory

### 4. Spike Test (`spike-test.yml`)

**Duration**: ~5 minutes  
**Purpose**: Test sudden traffic surge  
**Scenario**: Viral certificate sharing

**Load Pattern**:
- Normal: 20 RPS for 120s
- **SPIKE**: 500 RPS for 60s
- Recovery: 20 RPS for 120s
- **MEGA SPIKE**: 1000 RPS for 30s
- Final recovery: 20 RPS for 60s

**Focus**: Public certificate verification endpoints

**Run**:
```bash
artillery run load-tests/spike-test.yml
```

### 5. Soak Test (`soak-test.yml`)

**Duration**: ~64 minutes (1 hour sustained)  
**Purpose**: Test long-term stability  
**Load**: 50 RPS for 1 hour

**Detects**:
- Memory leaks
- Resource exhaustion
- Performance degradation
- Connection pool issues

**Run**:
```bash
artillery run load-tests/soak-test.yml
```

⚠️ **Warning**: This test runs for over 1 hour. Monitor system resources throughout.

## 📈 Reading Results

### Terminal Output

Artillery displays real-time metrics:

```
Summary report @ 14:35:15(+0700)
--------------------------------
scenarios.launched: 1000
scenarios.completed: 998
requests.completed: 4990
response_time.min: 12
response_time.max: 245
response_time.median: 45
response_time.p95: 89
response_time.p99: 156
codes.200: 4980
codes.429: 10
errors.ETIMEDOUT: 2
```

**Key Metrics**:
- `scenarios.completed`: Successful user journeys
- `response_time.p95`: 95% of requests faster than this
- `response_time.p99`: 99% of requests faster than this
- `codes.200`: Successful responses
- `codes.429`: Rate limited (expected)
- `errors.*`: Failed requests

### HTML Reports

Generated automatically in `load-tests/reports/`:

```bash
# Open HTML report
start load-tests/reports/auth-load-test-1234567890.html
```

**Report Sections**:
1. **Summary**: Overall performance metrics
2. **Latency Distribution**: Response time percentiles
3. **Request Rate**: Requests per second over time
4. **Status Codes**: HTTP response code breakdown
5. **Errors**: Detailed error information

## 🎯 Performance Targets

### Authentication Endpoints
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| P95 Latency | < 100ms | TBD | ⏳ |
| P99 Latency | < 200ms | TBD | ⏳ |
| Error Rate | < 1% | TBD | ⏳ |
| Throughput | > 100 RPS | TBD | ⏳ |

### API Endpoints
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| P95 Latency | < 200ms | TBD | ⏳ |
| P99 Latency | < 500ms | TBD | ⏳ |
| Error Rate | < 2% | TBD | ⏳ |
| Throughput | > 50 RPS | TBD | ⏳ |

### System Resources
| Resource | Target | Current | Status |
|----------|--------|---------|--------|
| CPU Usage | < 70% | TBD | ⏳ |
| Memory Usage | < 80% | TBD | ⏳ |
| DB Connections | < 80% pool | TBD | ⏳ |
| Redis Memory | < 2GB | TBD | ⏳ |

## 🔍 Analyzing Results

### Good Performance Indicators
✅ Response times stable across duration  
✅ Error rate < 1%  
✅ No memory leaks (soak test)  
✅ Quick recovery from spikes  
✅ Rate limiting working (429 codes)  

### Warning Signs
⚠️ Response times increasing over time  
⚠️ Error rate > 2%  
⚠️ Memory continuously growing  
⚠️ Slow recovery after spike  
⚠️ Database connection pool exhausted  

### Critical Issues
❌ Response times > 1 second  
❌ Error rate > 5%  
❌ System crashes under load  
❌ Memory leaks detected  
❌ Data corruption  

## 🛠️ Troubleshooting

### High Response Times

**Check**:
1. Database query performance
2. N+1 query problems
3. Missing indexes
4. Redis connection pool

**Solutions**:
- Add database indexes
- Implement query caching
- Optimize N+1 queries
- Increase connection pools

### High Error Rates

**Check**:
1. Error logs (`pm2 logs gacp-backend`)
2. Rate limiting configuration
3. Database connection limits
4. Redis memory usage

**Solutions**:
- Adjust rate limits
- Increase database connections
- Add Redis memory
- Fix application bugs

### Memory Leaks

**Detect**:
```bash
# Monitor memory during soak test
pm2 monit
```

**Common Causes**:
- Event listeners not removed
- Unclosed database connections
- Large object caching
- Circular references

**Solutions**:
- Add event listener cleanup
- Use connection pooling
- Implement cache eviction
- Fix circular references

### Database Performance

**Monitor**:
```bash
# MongoDB slow queries
mongo
> db.setProfilingLevel(2)
> db.system.profile.find().sort({ts: -1}).limit(10)
```

**Optimize**:
```bash
# Add indexes
> db.farmers.createIndex({ email: 1 })
> db.certificates.createIndex({ qrCode: 1 })
```

## 🔧 Configuration

### Adjust Load Levels

Edit YAML files to change load:

```yaml
config:
  phases:
    - duration: 60        # Run for 60 seconds
      arrivalRate: 100    # 100 requests per second
      rampTo: 200         # Ramp up to 200 RPS
```

### Change Target Server

```yaml
config:
  target: "https://api.gacp.dtam.go.th"  # Production server
```

### Add Custom Scenarios

```yaml
scenarios:
  - name: "My Custom Test"
    weight: 20  # 20% of traffic
    flow:
      - post:
          url: "/api/my-endpoint"
          json:
            field: "value"
```

## 📝 Best Practices

### Before Testing
1. ✅ Backup production data
2. ✅ Use dedicated test environment
3. ✅ Monitor system resources
4. ✅ Set up logging/monitoring
5. ✅ Create test users
6. ✅ Document baseline performance

### During Testing
1. 📊 Monitor real-time metrics
2. 👀 Watch system resources
3. 📝 Note any anomalies
4. 🔍 Check error logs
5. 💾 Save test results
6. 📸 Screenshot dashboards

### After Testing
1. 📊 Analyze HTML reports
2. 📈 Compare with targets
3. 🐛 Identify bottlenecks
4. 🔧 Plan optimizations
5. 📝 Document findings
6. ✅ Verify fixes work

## 🚨 Safety Guidelines

### DO
- ✅ Test in staging environment first
- ✅ Start with small load
- ✅ Monitor system resources
- ✅ Have rollback plan ready
- ✅ Inform team before testing
- ✅ Use realistic data

### DON'T
- ❌ Test on production without approval
- ❌ Start with maximum load
- ❌ Leave tests running unmonitored
- ❌ Test during business hours
- ❌ Use real user credentials
- ❌ Ignore warning signs

## 📚 Additional Resources

### Artillery Documentation
- https://www.artillery.io/docs

### Performance Testing Best Practices
- Martin Fowler: https://martinfowler.com/articles/practical-test-pyramid.html
- Google SRE Book: https://sre.google/books/

### Monitoring Tools
- PM2 Dashboard: `pm2 web`
- MongoDB Compass: Query profiler
- Redis Commander: Memory analysis

## 🤝 Support

For questions or issues:
- Create GitHub issue with label `performance`
- Slack: #backend-performance
- Email: performance@gacp.dtam.go.th
