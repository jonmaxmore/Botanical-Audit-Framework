# 🚀 GACP Platform - Complete Deployment Guide

**Date**: October 21, 2025  
**Platform**: Botanical Audit Framework (GACP Certification)  
**Status**: Production Ready

---

## 📋 Deployment Options

Choose the deployment method that best fits your needs:

1. **🐳 Docker Production** (Recommended) - Full stack with monitoring
2. **☁️ Cloud Platform** - AWS/Azure/GCP deployment
3. **🖥️ Local Production** - Direct server deployment

---

## Option 1: 🐳 Docker Production Deployment (RECOMMENDED)

### Prerequisites
- Docker Engine 24.0+ installed
- Docker Compose v2.20+ installed
- 4GB+ RAM available
- 20GB+ disk space
- Domain name (for SSL)

### Step 1: Prepare Environment Variables

Create `.env.production` file in project root:

```bash
# Copy the example
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

```env
# === Database Configuration ===
MONGO_ROOT_USER=gacp_admin
MONGO_ROOT_PASSWORD=<STRONG_PASSWORD_HERE>
MONGODB_URI=mongodb://gacp_admin:<STRONG_PASSWORD>@mongodb:27017/gacp_production?authSource=admin

# === Redis Cache ===
REDIS_PASSWORD=<STRONG_REDIS_PASSWORD>

# === JWT Security ===
JWT_SECRET=<GENERATE_256_BIT_SECRET_KEY>
JWT_REFRESH_SECRET=<GENERATE_ANOTHER_256_BIT_KEY>

# === API Configuration ===
GACP_API_PORT=4000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# === Monitoring ===
GRAFANA_USER=admin
GRAFANA_PASSWORD=<GRAFANA_ADMIN_PASSWORD>

# === SSL Configuration ===
DOMAIN_NAME=yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# === Backup Configuration ===
AWS_ACCESS_KEY_ID=<YOUR_AWS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET>
BACKUP_S3_BUCKET=gacp-backups
```

### Step 2: Generate Secrets

```powershell
# Generate JWT secrets (256-bit)
$jwt1 = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$jwt2 = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "JWT_SECRET=$jwt1"
Write-Host "JWT_REFRESH_SECRET=$jwt2"

# Generate passwords
$mongoPass = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$redisPass = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "MONGO_ROOT_PASSWORD=$mongoPass"
Write-Host "REDIS_PASSWORD=$redisPass"
```

### Step 3: Deploy with Docker Compose

```powershell
# Build and start all services
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f gacp-api
```

### Step 4: Verify Deployment

```powershell
# Check API health
curl http://localhost:4000/health

# Check Frontend
curl http://localhost:3000

# Check MongoDB
docker exec -it gacp-mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis
docker exec -it gacp-redis redis-cli ping
```

### Step 5: Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **API** | http://localhost:4000 | - |
| **MongoDB** | localhost:27017 | gacp_admin / [password] |
| **Redis** | localhost:6379 | [password] |
| **Grafana** | http://localhost:3001 | admin / [GRAFANA_PASSWORD] |
| **Prometheus** | http://localhost:9090 | - |
| **Kibana** | http://localhost:5601 | - |

### Step 6: SSL Configuration (Production)

```bash
# Generate SSL certificate with Let's Encrypt
docker-compose -f docker-compose.production.yml run --rm certbot

# Restart nginx to apply SSL
docker-compose -f docker-compose.production.yml restart nginx

# Set up auto-renewal
docker-compose -f docker-compose.production.yml run --rm certbot renew
```

---

## Option 2: ☁️ Cloud Platform Deployment

### AWS Deployment

#### A. Using AWS ECS (Elastic Container Service)

```bash
# Install AWS CLI
# Configure credentials
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name gacp-api
aws ecr create-repository --repository-name gacp-frontend

# Build and push Docker images
$(aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com)

docker build -f Dockerfile.api -t gacp-api:latest .
docker tag gacp-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/gacp-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/gacp-api:latest

# Deploy to ECS
aws ecs create-cluster --cluster-name gacp-production
# Create task definitions and services...
```

#### B. Using AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init -p docker gacp-platform

# Create environment
eb create gacp-production --database.engine mongodb --database.size db.t3.small

# Deploy
eb deploy

# View status
eb status
eb open
```

### Azure Deployment

```bash
# Install Azure CLI
az login

# Create resource group
az group create --name gacp-rg --location eastus

# Create container registry
az acr create --resource-group gacp-rg --name gacpregistry --sku Basic

# Build and push images
az acr build --registry gacpregistry --image gacp-api:latest -f Dockerfile.api .

# Deploy to Azure Container Instances
az container create \
  --resource-group gacp-rg \
  --name gacp-api \
  --image gacpregistry.azurecr.io/gacp-api:latest \
  --cpu 2 --memory 4 \
  --ports 4000 \
  --environment-variables \
    NODE_ENV=production \
    MONGODB_URI=$MONGODB_URI
```

### Google Cloud Platform (GCP)

```bash
# Install gcloud CLI
gcloud init

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/gacp-api

# Deploy to Cloud Run
gcloud run deploy gacp-api \
  --image gcr.io/PROJECT_ID/gacp-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

---

## Option 3: 🖥️ Local Production Deployment

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Redis installed and running
- PM2 installed globally

### Step 1: Install Dependencies

```powershell
# Install root dependencies
pnpm install

# Install backend dependencies
cd apps\backend
npm install
cd ..\..

# Install frontend dependencies
cd frontend-nextjs
npm install
cd ..
```

### Step 2: Build Applications

```powershell
# Build backend (if needed)
cd apps\backend
npm run build
cd ..\..

# Build frontend
cd frontend-nextjs
npm run build
cd ..
```

### Step 3: Start with PM2

```powershell
# Install PM2 globally
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Step 4: Configure Nginx (Windows/Linux)

**Windows (using nginx):**

Download nginx from http://nginx.org/en/download.html

Edit `nginx.conf`:

```nginx
http {
    upstream gacp_api {
        server localhost:4000;
    }
    
    upstream gacp_frontend {
        server localhost:3000;
    }
    
    server {
        listen 80;
        server_name yourdomain.com;
        
        location /api {
            proxy_pass http://gacp_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
        
        location / {
            proxy_pass http://gacp_frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

Start nginx:
```powershell
cd C:\nginx
start nginx
```

---

## 🔍 Post-Deployment Verification

### Health Checks

```powershell
# API health check
curl http://localhost:4000/health

# Database connectivity
curl http://localhost:4000/api/monitoring/database

# Redis connectivity
curl http://localhost:4000/api/monitoring/redis

# Frontend health
curl http://localhost:3000/api/health
```

### Performance Testing

```powershell
# Run QA tests
.\start-qa-testing.ps1

# Run UAT tests
.\start-uat-testing.ps1

# Load testing (if you have it)
cd test
node load-test.js
```

### Monitoring Setup

1. **Grafana Dashboards**
   - Access: http://localhost:3001
   - Import dashboard from `monitoring/grafana/dashboards/`

2. **Prometheus Metrics**
   - Access: http://localhost:9090
   - Query: `rate(http_requests_total[5m])`

3. **Log Analysis**
   - Access Kibana: http://localhost:5601
   - View logs in real-time

---

## 📊 Monitoring & Maintenance

### Daily Tasks

```powershell
# Check service status
docker-compose -f docker-compose.production.yml ps

# View recent logs
docker-compose -f docker-compose.production.yml logs --tail=100 gacp-api

# Check disk space
docker system df
```

### Weekly Tasks

```powershell
# Backup database
docker exec gacp-mongodb mongodump --out /backups/$(date +%Y%m%d)

# Clean old logs
docker system prune -f

# Update security patches
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

### Monthly Tasks

- Review monitoring dashboards
- Check and rotate SSL certificates
- Perform security audit: `npm audit`
- Review and optimize database indexes
- Test backup restoration process

---

## 🔒 Security Checklist

- [ ] All default passwords changed
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular backups configured
- [ ] Monitoring and alerting set up
- [ ] Security headers enabled (Helmet.js)

---

## 🆘 Troubleshooting

### Services Won't Start

```powershell
# Check logs
docker-compose -f docker-compose.production.yml logs

# Restart specific service
docker-compose -f docker-compose.production.yml restart gacp-api

# Rebuild from scratch
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d --build
```

### Database Connection Issues

```powershell
# Check MongoDB status
docker exec -it gacp-mongodb mongosh --eval "db.adminCommand('serverStatus')"

# Check connection string
echo $MONGODB_URI

# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(err => console.error(err));"
```

### High Memory Usage

```powershell
# Check container stats
docker stats

# Restart services with memory limits
docker-compose -f docker-compose.production.yml down
# Edit docker-compose to add memory limits
docker-compose -f docker-compose.production.yml up -d
```

---

## 📞 Support & Documentation

- **Full Documentation**: `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Monitoring Guide**: `monitoring/README.md`
- **Backup Guide**: `docs/04_DATABASE/MONGODB_BACKUP_DR_PLAN.md`

---

## 🎉 Quick Deployment Summary

**For Quick Docker Deployment:**

```powershell
# 1. Configure environment
cp .env.example .env.production
# Edit .env.production with your settings

# 2. Deploy
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build

# 3. Verify
curl http://localhost:4000/health
curl http://localhost:3000

# 4. Access monitoring
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
# Kibana: http://localhost:5601
```

**🚀 Your GACP Platform is now deployed!**

---

**Need Help?** Check the troubleshooting section or review the detailed documentation in the `docs/` folder.
