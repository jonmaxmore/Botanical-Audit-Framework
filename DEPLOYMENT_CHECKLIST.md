# 🚀 GACP Platform - Deployment Checklist

**Last Updated:** November 4, 2025  
**Version:** 2.0.0 (Phase 2.5 Integration Complete)  
**Target Environment:** Production

---

## 📋 Pre-Deployment Checklist

### 1. ✅ Code Quality (COMPLETE)

- [x] **ESLint:** 0 errors, 0 warnings
- [x] **TypeScript:** Type-check passed
- [x] **Security Audit:** No critical vulnerabilities
- [x] **Git:** All changes committed
  - Commit `86ca197`: Phase 2.5 integration
  - Commit `25a0847`: Lint fixes

---

### 2. ⚠️ Infrastructure Setup (REQUIRED)

#### MongoDB Configuration

- [ ] **Install MongoDB**
  ```bash
  # Option A: Docker (Recommended)
  docker run -d -p 27017:27017 --name mongodb \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=<secure-password> \
    mongo:7-alpine
  
  # Option B: Local Installation
  winget install MongoDB.Server
  
  # Option C: Cloud (MongoDB Atlas)
  # https://www.mongodb.com/cloud/atlas
  ```

- [ ] **Create Database**
  ```javascript
  // Connect to MongoDB
  mongosh "mongodb://admin:<password>@localhost:27017"
  
  // Create database
  use gacp_platform
  
  // Create collections (automatically created by app)
  // - applications
  // - certificates
  // - inspections
  // - users
  // - notifications
  ```

- [ ] **Create Indexes**
  ```javascript
  // Applications collection
  db.applications.createIndex({ "farmerData.nationalId": 1 })
  db.applications.createIndex({ status: 1 })
  db.applications.createIndex({ createdAt: -1 })
  
  // Certificates collection
  db.certificates.createIndex({ certificateNumber: 1 }, { unique: true })
  db.certificates.createIndex({ applicationId: 1 })
  db.certificates.createIndex({ "validity.expiryDate": 1 })
  
  // Users collection
  db.users.createIndex({ email: 1 }, { unique: true })
  db.users.createIndex({ role: 1 })
  ```

- [ ] **Test Connection**
  ```bash
  node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/gacp').then(() => console.log('✅ Connected')).catch(err => console.error('❌ Error:', err));"
  ```

#### Redis Configuration

- [ ] **Install Redis**
  ```bash
  # Option A: Docker (Recommended)
  docker run -d -p 6379:6379 --name redis redis:alpine
  
  # Option B: Windows (via WSL)
  wsl --install
  wsl
  sudo apt-get install redis-server
  redis-server
  
  # Option C: Cloud (Redis Cloud)
  # https://redis.com/redis-enterprise-cloud/
  ```

- [ ] **Test Connection**
  ```bash
  redis-cli ping
  # Expected: PONG
  
  # Or via Node.js
  node -e "const redis = require('redis'); const client = redis.createClient(); client.connect().then(() => console.log('✅ Connected')).catch(err => console.error('❌ Error:', err));"
  ```

- [ ] **Configure Persistence (Optional)**
  ```bash
  # Edit redis.conf
  appendonly yes
  appendfsync everysec
  ```

#### Docker Compose (All-in-One)

- [ ] **Start All Services**
  ```bash
  # Use existing docker-compose.yml
  docker-compose up -d
  
  # Verify services running
  docker-compose ps
  
  # Expected output:
  # gacp-mongodb    Up    27017->27017
  # gacp-platform   Up    3004->3004
  ```

---

### 3. ⚠️ Environment Configuration (REQUIRED)

- [ ] **Create `.env` file**
  ```bash
  cp .env.example .env
  ```

- [ ] **Configure Required Variables**
  ```bash
  # Database
  MONGODB_URI=mongodb://admin:<password>@localhost:27017/gacp_platform
  MONGODB_DB_NAME=gacp_platform
  
  # Redis
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=<optional-password>
  
  # Queue & Cache
  ENABLE_QUEUE=true
  ENABLE_CACHE=true
  
  # Security
  JWT_SECRET=<generate-with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
  SESSION_SECRET=<generate-random-string>
  CERTIFICATE_SECRET_KEY=<generate-random-string>
  
  # Server
  NODE_ENV=production
  PORT=3004
  
  # Email (Optional - for notifications)
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=<your-email>
  SMTP_PASSWORD=<app-password>
  SMTP_FROM=noreply@gacp-platform.com
  
  # Monitoring (Optional)
  ENABLE_METRICS=true
  ENABLE_ALERTS=true
  ```

- [ ] **Generate Secrets**
  ```bash
  # JWT Secret
  node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
  
  # Session Secret
  node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Verify Configuration**
  ```bash
  # Check environment variables loaded
  node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');"
  ```

---

### 4. ⚠️ Dependency Installation (REQUIRED)

- [ ] **Install Node.js Dependencies**
  ```bash
  # Root dependencies
  pnpm install
  
  # Backend dependencies
  cd apps/backend
  pnpm install
  
  # Frontend dependencies  
  cd ../frontend
  pnpm install
  ```

- [ ] **Verify Critical Dependencies**
  ```bash
  # Check Bull (Queue)
  node -e "require('bull'); console.log('✅ Bull installed');"
  
  # Check Redis client
  node -e "require('redis'); console.log('✅ Redis client installed');"
  
  # Check Mongoose
  node -e "require('mongoose'); console.log('✅ Mongoose installed');"
  ```

---

### 5. ⚠️ Database Migration & Seeding (REQUIRED)

- [ ] **Run Database Setup Script**
  ```bash
  cd apps/backend
  node setup-production-database.js
  ```

- [ ] **Create Admin User**
  ```bash
  # Via MongoDB shell
  mongosh "mongodb://localhost:27017/gacp_platform"
  
  db.users.insertOne({
    email: "admin@gacp-platform.com",
    password: "<bcrypt-hash>",
    role: "admin",
    firstName: "Admin",
    lastName: "User",
    createdAt: new Date(),
    isActive: true
  })
  ```

- [ ] **Create Sample Data (Optional - Development)**
  ```bash
  # Run seed script if available
  node scripts/seed-data.js
  ```

---

### 6. ⚠️ Testing (REQUIRED)

#### Unit Tests

- [ ] **Run Backend Tests**
  ```bash
  cd apps/backend
  npm test
  
  # Expected: 111/111 tests pass
  ```

- [ ] **Run Frontend Tests**
  ```bash
  cd apps/frontend
  npm test
  ```

#### Integration Tests

- [ ] **Test API Endpoints**
  ```bash
  # Start server
  npm run dev:backend
  
  # Health check
  curl http://localhost:3004/api/health
  
  # Queue stats
  curl http://localhost:3004/api/queue/stats
  
  # Cache stats
  curl http://localhost:3004/api/cache/stats
  ```

- [ ] **Test Queue System**
  ```bash
  # Add test job
  curl -X POST http://localhost:3004/api/queue/test \
    -H "Content-Type: application/json" \
    -d '{"type": "test"}'
  
  # Check job processed
  curl http://localhost:3004/api/queue/jobs/recent
  ```

- [ ] **Test Cache System**
  ```bash
  # Check Redis connection
  redis-cli ping
  
  # Test cache operations
  redis-cli set test "value"
  redis-cli get test
  redis-cli del test
  ```

#### Smoke Tests

- [ ] **Run Console Smoke Tests**
  ```bash
  node smoke-test-console.js
  
  # Expected: 24/24 tests pass (after infrastructure setup)
  ```

- [ ] **Test Full Workflow**
  ```bash
  # 1. Create application
  # 2. Submit application
  # 3. Assign inspector
  # 4. Complete inspection
  # 5. Review application
  # 6. Generate certificate
  # 7. Verify queue processed jobs
  # 8. Verify cache hit rates
  ```

---

### 7. ⚠️ Performance Verification (RECOMMENDED)

- [ ] **Benchmark API Response Times**
  ```bash
  # Install artillery (if not already)
  npm install -g artillery
  
  # Run load test
  artillery quick --count 100 --num 10 http://localhost:3004/api/health
  
  # Expected: <100ms p95 response time
  ```

- [ ] **Check Cache Hit Rates**
  ```bash
  # Via Redis CLI
  redis-cli info stats | grep keyspace_hits
  
  # Expected: 85-95% hit rate after warm-up
  ```

- [ ] **Monitor Queue Performance**
  ```bash
  # Via API
  curl http://localhost:3004/api/queue/stats
  
  # Expected: 
  # - Processing rate: >100 jobs/min
  # - Success rate: >99%
  # - Avg processing time: <500ms
  ```

---

### 8. ⚠️ Security Hardening (CRITICAL)

- [ ] **Update Default Passwords**
  - MongoDB admin password
  - Redis password (if applicable)
  - Admin user password

- [ ] **Configure Firewall**
  ```bash
  # Allow only necessary ports
  # - 3004 (API)
  # - 3000 (Frontend)
  # - 27017 (MongoDB - internal only)
  # - 6379 (Redis - internal only)
  ```

- [ ] **Enable HTTPS**
  ```bash
  # Generate SSL certificate
  # Configure nginx/reverse proxy
  # Update API URLs to https://
  ```

- [ ] **Set Secure Headers**
  ```javascript
  // Verify in apps/backend/middleware/security.js
  helmet()
  cors({ origin: ['https://yourdomain.com'] })
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
  ```

- [ ] **Rotate Secrets**
  ```bash
  # Generate new JWT_SECRET every 90 days
  # Update .env.production
  # Restart server
  ```

---

### 9. ⚠️ Monitoring Setup (RECOMMENDED)

- [ ] **Configure Logging**
  ```bash
  # Verify winston logger configured
  # Log levels: error, warn, info, debug
  # Log files: logs/error.log, logs/combined.log
  ```

- [ ] **Set Up Alerts**
  ```javascript
  // Configure in apps/backend/services/alerts/alertService.js
  - High queue length (>1000 jobs)
  - Cache miss rate >20%
  - API response time >500ms
  - MongoDB connection errors
  ```

- [ ] **Enable Metrics Collection**
  ```bash
  # Verify metrics service running
  curl http://localhost:3004/api/metrics
  
  # Expected: JSON with:
  # - Request count
  # - Response times (p50, p95, p99)
  # - Queue stats
  # - Cache stats
  # - Memory usage
  ```

---

### 10. ⚠️ Backup & Recovery (CRITICAL)

- [ ] **Configure MongoDB Backups**
  ```bash
  # Manual backup
  mongodump --uri="mongodb://localhost:27017/gacp_platform" --out=/backup/$(date +%Y%m%d)
  
  # Automated backup (cron)
  0 2 * * * /usr/bin/mongodump --uri="mongodb://..." --out=/backup/$(date +\%Y\%m\%d)
  ```

- [ ] **Configure Redis Persistence**
  ```bash
  # Enable AOF (Append Only File)
  # Edit redis.conf
  appendonly yes
  appendfsync everysec
  
  # Backup RDB file
  cp /var/lib/redis/dump.rdb /backup/redis-$(date +%Y%m%d).rdb
  ```

- [ ] **Test Recovery Process**
  ```bash
  # Restore MongoDB
  mongorestore --uri="mongodb://..." --drop /backup/20251104
  
  # Restore Redis
  redis-cli --rdb /backup/redis-20251104.rdb
  ```

---

## 🚀 Deployment Steps

### Production Deployment

1. **Pull Latest Code**
   ```bash
   git pull origin main
   git checkout 25a0847  # Latest commit with lint fixes
   ```

2. **Install Dependencies**
   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Build Frontend**
   ```bash
   cd apps/frontend
   npm run build
   ```

4. **Start Backend**
   ```bash
   cd apps/backend
   npm run start:production
   
   # Or with PM2
   pm2 start ecosystem.config.js --env production
   ```

5. **Start Frontend**
   ```bash
   cd apps/frontend
   npm run start
   
   # Or with PM2
   pm2 start npm --name "gacp-frontend" -- start
   ```

6. **Verify Deployment**
   ```bash
   # Check services
   pm2 status
   
   # Check logs
   pm2 logs gacp-backend
   
   # Test API
   curl https://api.yourdomain.com/health
   ```

---

## 📊 Post-Deployment Verification

### Immediate Checks (0-5 minutes)

- [ ] ✅ API health check responds
- [ ] ✅ Frontend loads
- [ ] ✅ MongoDB connection established
- [ ] ✅ Redis connection established
- [ ] ✅ Queue processing jobs
- [ ] ✅ Cache serving requests

### Short-term Monitoring (5-30 minutes)

- [ ] ✅ No error logs
- [ ] ✅ Response times <100ms
- [ ] ✅ Cache hit rate >80%
- [ ] ✅ Queue success rate >99%

### Long-term Monitoring (1-24 hours)

- [ ] ✅ Memory usage stable
- [ ] ✅ CPU usage <50%
- [ ] ✅ Disk usage <80%
- [ ] ✅ No memory leaks
- [ ] ✅ Database performance stable

---

## 🆘 Rollback Plan

If deployment fails:

1. **Immediate Rollback**
   ```bash
   # Stop current deployment
   pm2 stop all
   
   # Restore previous version
   git checkout <previous-commit>
   
   # Reinstall dependencies
   pnpm install
   
   # Restart services
   pm2 restart all
   ```

2. **Restore Database (if needed)**
   ```bash
   mongorestore --uri="mongodb://..." --drop /backup/<previous-backup>
   ```

3. **Notify Team**
   - Report issue
   - Document errors
   - Plan fix

---

## 📞 Support Contacts

**Development Team:**
- Lead Developer: [Contact Info]
- DevOps: [Contact Info]
- Database Admin: [Contact Info]

**Service Providers:**
- MongoDB Atlas Support: https://www.mongodb.com/support
- Redis Cloud Support: https://redis.com/support

**Emergency Contacts:**
- On-call Engineer: [Phone]
- System Administrator: [Phone]

---

## 📚 Additional Resources

- **Phase 2.5 Integration Guide:** `PHASE2.5_INTEGRATION_COMPLETE.md`
- **Testing Report:** `TESTING_REPORT.md`
- **API Documentation:** `apps/backend/API_ENDPOINTS.md`
- **Production Guide:** `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Development Guide:** `DEVELOPMENT_GUIDE.md`

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] All infrastructure services running
- [ ] All tests passing (111/111)
- [ ] Production environment configured
- [ ] Monitoring and alerts active
- [ ] Backups configured and tested
- [ ] Security hardening complete
- [ ] Documentation updated
- [ ] Team notified
- [ ] Post-deployment verification complete

---

**Deployment Ready:** ⚠️ Pending Infrastructure Setup

**Next Steps:** 
1. Install MongoDB + Redis
2. Configure `.env` file
3. Run integration tests
4. Deploy to production

---

*Generated by GitHub Copilot - GACP Platform Deployment Team*
