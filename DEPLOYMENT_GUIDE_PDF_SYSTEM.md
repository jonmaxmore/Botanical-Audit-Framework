# PDF Export System - Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Prerequisites
- [x] Node.js 18+ installed
- [x] MongoDB Atlas connection ready
- [x] Redis instance available
- [x] Domain/subdomain configured
- [x] SSL certificates ready
- [x] Environment variables prepared

---

## 📦 Step 1: Install Dependencies

```bash
# Backend
cd apps/backend
npm install puppeteer qrcode

# Verify installation
npm list puppeteer qrcode
```

**Expected Output:**
```
├── puppeteer@22.0.0
└── qrcode@1.5.3
```

---

## 🔧 Step 2: Environment Configuration

### Backend (.env)
```env
# Existing variables
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_SECRET_DTAM=...

# PDF System (No additional vars needed)
# Puppeteer will use bundled Chromium
```

### Frontend (.env.local)
```env
# Admin Portal
NEXT_PUBLIC_API_URL=https://api.gacp.dtam.go.th

# Farmer Portal
NEXT_PUBLIC_API_URL=https://api.gacp.dtam.go.th
```

---

## 🏗️ Step 3: Build Applications

```bash
# Backend - No build needed (Node.js)
cd apps/backend
npm run lint:fix

# Admin Portal
cd apps/admin-portal
npm run build
npm run start # Test production build

# Farmer Portal
cd apps/farmer-portal
npm run build
npm run start # Test production build
```

---

## 🧪 Step 4: Testing

### Local Testing
```bash
# Start backend
cd apps/backend
npm run dev

# Test PDF endpoints
curl http://localhost:3000/api/pdf/health

# Test PDF generation
curl -X POST http://localhost:3000/api/pdf/inspection-report/TEST001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output test.pdf

# Verify PDF opens correctly
```

### Frontend Testing
```bash
# Test in browser
http://localhost:3002 # Admin Portal
http://localhost:3001 # Farmer Portal

# Test PDF download buttons
# Verify PDFs download and open correctly
```

---

## 🐳 Step 5: Docker Deployment (Recommended)

### Create Dockerfile for Backend
```dockerfile
# apps/backend/Dockerfile
FROM node:18-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "atlas-server.js"]
```

### Build and Run
```bash
# Build image
docker build -t gacp-backend:latest -f apps/backend/Dockerfile apps/backend

# Run container
docker run -d \
  --name gacp-backend \
  -p 3000:3000 \
  --env-file apps/backend/.env \
  gacp-backend:latest

# Check logs
docker logs -f gacp-backend
```

---

## ☁️ Step 6: Cloud Deployment Options

### Option A: AWS EC2 + PM2

```bash
# SSH to EC2 instance
ssh ubuntu@your-ec2-instance

# Install dependencies
sudo apt-get update
sudo apt-get install -y chromium-browser

# Clone repository
git clone https://github.com/your-repo/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework

# Install dependencies
cd apps/backend
npm install

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option B: AWS ECS (Docker)

```bash
# Push to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker tag gacp-backend:latest YOUR_ECR_URL/gacp-backend:latest
docker push YOUR_ECR_URL/gacp-backend:latest

# Deploy to ECS
aws ecs update-service --cluster gacp-cluster --service gacp-backend --force-new-deployment
```

### Option C: Vercel (Frontend Only)

```bash
# Admin Portal
cd apps/admin-portal
vercel --prod

# Farmer Portal
cd apps/farmer-portal
vercel --prod
```

---

## 🔒 Step 7: Security Configuration

### Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/gacp-api
server {
    listen 443 ssl http2;
    server_name api.gacp.dtam.go.th;

    ssl_certificate /etc/letsencrypt/live/gacp.dtam.go.th/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gacp.dtam.go.th/privkey.pem;

    # PDF file size limit
    client_max_body_size 50M;

    location /api/pdf/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout for PDF generation
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

### Rate Limiting
```javascript
// Already implemented in backend
// apps/backend/atlas-server.js uses express-rate-limit
```

---

## 📊 Step 8: Monitoring Setup

### PM2 Monitoring
```bash
# Install PM2
npm install -g pm2

# Start with monitoring
pm2 start atlas-server.js --name gacp-backend
pm2 monit

# Setup logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Health Check Endpoint
```bash
# Add to monitoring system
curl https://api.gacp.dtam.go.th/api/pdf/health

# Expected response
{
  "status": "ok",
  "service": "PDF Export Service",
  "phase": "All Phases Complete (1-4)",
  "documents": 16,
  "version": "1.0.0"
}
```

---

## 🧹 Step 9: Cleanup & Optimization

### Puppeteer Optimization
```javascript
// Already implemented in pdf-generator.service.js
// - Browser instance caching
// - Automatic cleanup
// - Memory management
```

### Disk Space Management
```bash
# Clean old PDFs (if storing temporarily)
find /tmp -name "*.pdf" -mtime +1 -delete

# Add to crontab
0 2 * * * find /tmp -name "*.pdf" -mtime +1 -delete
```

---

## 🔄 Step 10: Deployment Script

```bash
#!/bin/bash
# deploy-pdf-system.sh

echo "🚀 Deploying PDF Export System..."

# Pull latest code
git pull origin main

# Install dependencies
cd apps/backend
npm install

# Restart services
pm2 restart gacp-backend

# Check health
sleep 5
curl http://localhost:3000/api/pdf/health

echo "✅ Deployment complete!"
```

**Make executable:**
```bash
chmod +x deploy-pdf-system.sh
./deploy-pdf-system.sh
```

---

## 📝 Step 11: Post-Deployment Verification

### Test All Endpoints
```bash
# Health check
curl https://api.gacp.dtam.go.th/api/pdf/health

# Test each PDF type
curl -X POST https://api.gacp.dtam.go.th/api/pdf/inspection-report/TEST001 \
  -H "Authorization: Bearer TOKEN" \
  --output test-inspection.pdf

curl -X POST https://api.gacp.dtam.go.th/api/pdf/certificate/TEST001 \
  -H "Authorization: Bearer TOKEN" \
  --output test-certificate.pdf

# Verify PDFs open correctly
```

### Frontend Testing
```bash
# Test in production
https://admin.gacp.dtam.go.th
https://farmer.gacp.dtam.go.th

# Test PDF downloads
# 1. Login as Inspector
# 2. Go to Inspections Dashboard
# 3. Click "ดาวน์โหลด PDF"
# 4. Verify PDF downloads and opens
```

---

## 🐛 Troubleshooting

### Issue: Puppeteer fails to launch

**Solution:**
```bash
# Install missing dependencies
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0
```

### Issue: Thai fonts not rendering

**Solution:**
```bash
# Install Thai fonts
sudo apt-get install -y fonts-thai-tlwg

# Or use Google Fonts (already in templates)
# Templates use: https://fonts.googleapis.com/css2?family=Sarabun
```

### Issue: PDF generation timeout

**Solution:**
```javascript
// Increase timeout in nginx
proxy_read_timeout 120s;

// Or in code (already set)
// pdf-generator.service.js uses reasonable timeouts
```

### Issue: Memory issues

**Solution:**
```bash
# Increase Node.js memory
node --max-old-space-size=4096 atlas-server.js

# Or in PM2
pm2 start atlas-server.js --node-args="--max-old-space-size=4096"
```

---

## 📈 Performance Optimization

### CDN for Static Assets
```javascript
// Use CDN for fonts
// Already implemented in templates
@import url('https://fonts.googleapis.com/css2?family=Sarabun');
```

### Caching Strategy
```nginx
# Cache PDF responses (optional)
location /api/pdf/ {
    proxy_cache pdf_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_key "$request_uri";
}
```

---

## 🔐 Security Checklist

- [x] HTTPS enabled
- [x] JWT authentication required
- [x] Rate limiting configured
- [x] CORS properly set
- [x] Input validation
- [x] File size limits
- [x] Watermarks on documents
- [x] Audit logging enabled

---

## 📊 Monitoring & Alerts

### Setup Alerts
```bash
# PM2 monitoring
pm2 install pm2-server-monit

# Setup email alerts
pm2 set pm2-server-monit:email your@email.com
```

### Log Monitoring
```bash
# View logs
pm2 logs gacp-backend

# Filter PDF errors
pm2 logs gacp-backend | grep "PDF generation error"
```

---

## 🎉 Deployment Complete!

### Verify Everything Works
- [ ] Health check returns OK
- [ ] All 17 PDF endpoints working
- [ ] Frontend components load
- [ ] PDFs download correctly
- [ ] Thai fonts render properly
- [ ] QR codes generate
- [ ] Watermarks appear
- [ ] Performance acceptable (<5s per PDF)

### Next Steps
1. Monitor logs for 24 hours
2. Check error rates
3. Verify user feedback
4. Optimize if needed

---

**🚀 PDF Export System is LIVE in Production!**

**Support:** If issues arise, check logs and refer to troubleshooting section.

**Version:** 1.0.0  
**Status:** ✅ Production  
**Last Updated:** 2025-01-XX
