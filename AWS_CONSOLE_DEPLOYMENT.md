# AWS Console Deployment Guide - GACP Platform

## 🎯 Deploy ผ่าน AWS Console (ไม่ต้องใช้ Terraform)

### Prerequisites
- ✅ AWS Account (มีแล้ว)
- ✅ Docker Desktop installed
- ✅ Code พร้อม

---

## Step 1: Build Docker Image (5 นาที)

```powershell
# Build Docker image
cd apps\backend
docker build -t gacp-backend .

# Test locally (optional)
docker run -p 3000:3000 -e MONGODB_URI="mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform" gacp-backend
```

---

## Step 2: Create ECR Repository (2 นาที)

### ใน AWS Console:
1. ไปที่: **ECR (Elastic Container Registry)**
   - https://ap-southeast-1.console.aws.amazon.com/ecr/repositories
2. คลิก **Create repository**
3. Repository name: `gacp-backend`
4. คลิก **Create repository**
5. **เก็บ URI:** `[ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend`

---

## Step 3: Push Docker Image to ECR (5 นาที)

### Get Push Commands จาก AWS Console:
1. คลิกที่ repository `gacp-backend`
2. คลิก **View push commands**
3. รันคำสั่งทั้ง 4 ใน PowerShell:

```powershell
# 1. Login to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com

# 2. Tag image
docker tag gacp-backend:latest [ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest

# 3. Push image
docker push [ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest
```

---

## Step 4: Create ECS Cluster (3 นาที)

### ใน AWS Console:
1. ไปที่: **ECS (Elastic Container Service)**
   - https://ap-southeast-1.console.aws.amazon.com/ecs/v2/clusters
2. คลิก **Create cluster**
3. Cluster name: `gacp-cluster`
4. Infrastructure: **AWS Fargate (serverless)**
5. คลิก **Create**

---

## Step 5: Create Task Definition (5 นาที)

### ใน AWS Console:
1. ไปที่: **ECS → Task definitions**
2. คลิก **Create new task definition**
3. กรอกข้อมูล:

**Task definition family:** `gacp-backend-task`

**Infrastructure:**
- Launch type: **AWS Fargate**
- OS: **Linux/X86_64**
- CPU: **0.5 vCPU**
- Memory: **1 GB**

**Container:**
- Name: `gacp-backend`
- Image URI: `[ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest`
- Port mappings: `3000` (TCP)

**Environment variables:**
```
MONGODB_URI = mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp
NODE_ENV = production
PORT = 3000
FARMER_JWT_SECRET = [GENERATE_SECRET]
DTAM_JWT_SECRET = [GENERATE_SECRET]
```

**Generate secrets:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. คลิก **Create**

---

## Step 6: Create Application Load Balancer (5 นาที)

### ใน AWS Console:
1. ไปที่: **EC2 → Load Balancers**
   - https://ap-southeast-1.console.aws.amazon.com/ec2/home#LoadBalancers
2. คลิก **Create load balancer**
3. เลือก **Application Load Balancer**
4. กรอกข้อมูล:

**Basic configuration:**
- Name: `gacp-alb`
- Scheme: **Internet-facing**
- IP address type: **IPv4**

**Network mapping:**
- VPC: **Default VPC**
- Mappings: เลือก **ทุก Availability Zones**

**Security groups:**
- Create new security group:
  - Name: `gacp-alb-sg`
  - Inbound rules:
    - HTTP (80) from Anywhere (0.0.0.0/0)
    - HTTPS (443) from Anywhere (0.0.0.0/0)

**Listeners:**
- Protocol: **HTTP**
- Port: **80**
- Default action: **Create target group**

**Target group:**
- Name: `gacp-backend-tg`
- Target type: **IP addresses**
- Protocol: **HTTP**
- Port: **3000**
- Health check path: `/health`

5. คลิก **Create load balancer**
6. **เก็บ DNS name:** `gacp-alb-xxxxx.ap-southeast-1.elb.amazonaws.com`

---

## Step 7: Create ECS Service (5 นาที)

### ใน AWS Console:
1. ไปที่: **ECS → Clusters → gacp-cluster**
2. คลิก **Create service**
3. กรอกข้อมูล:

**Deployment configuration:**
- Family: `gacp-backend-task`
- Service name: `gacp-backend-service`
- Desired tasks: **2**

**Networking:**
- VPC: **Default VPC**
- Subnets: เลือก **ทุก subnets**
- Security group:
  - Create new:
    - Name: `gacp-ecs-sg`
    - Inbound rules:
      - Custom TCP (3000) from ALB security group

**Load balancing:**
- Load balancer type: **Application Load Balancer**
- Load balancer: `gacp-alb`
- Target group: `gacp-backend-tg`
- Health check grace period: **60 seconds**

4. คลิก **Create**

---

## Step 8: Verify Deployment (2 นาที)

### Test Application:
```powershell
# Get ALB DNS from AWS Console
curl http://gacp-alb-xxxxx.ap-southeast-1.elb.amazonaws.com/health
```

**Expected response:**
```json
{
  "status": "OK",
  "database": {
    "status": "connected"
  }
}
```

### Check ECS Service:
1. ไปที่: **ECS → Clusters → gacp-cluster → Services**
2. ตรวจสอบ:
   - Running tasks: **2/2**
   - Health status: **Healthy**

### View Logs:
1. ไปที่: **CloudWatch → Log groups**
2. เลือก: `/ecs/gacp-backend-task`
3. ดู logs

---

## 💰 Cost Estimate

### Monthly Costs
- **ECS Fargate:** $30-50 (2 tasks, 0.5 vCPU, 1GB)
- **ALB:** $20
- **Data Transfer:** $10
- **CloudWatch Logs:** $5
- **Total:** ~$65-85/month

### Free Tier (First 12 months)
- 750 hours Fargate
- 750 hours ALB
- **Estimated:** ~$30-40/month

---

## 🔄 Update Deployment

### Update Code:
```powershell
# 1. Build new image
cd apps\backend
docker build -t gacp-backend .

# 2. Push to ECR
docker tag gacp-backend:latest [ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest
docker push [ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest

# 3. Update ECS service (in AWS Console)
# ECS → Clusters → gacp-cluster → Services → gacp-backend-service
# Click "Update service" → "Force new deployment" → "Update"
```

---

## 🗑️ Cleanup (Delete Everything)

1. **ECS Service:** Delete service
2. **ECS Cluster:** Delete cluster
3. **Load Balancer:** Delete ALB
4. **Target Group:** Delete target group
5. **ECR Repository:** Delete repository
6. **CloudWatch Logs:** Delete log groups

---

## 📊 Summary

**Total Time:** 30-35 minutes  
**Total Cost:** $30-85/month  
**Difficulty:** Medium (no CLI required)

---

## 🎯 Quick Checklist

- [ ] Build Docker image
- [ ] Create ECR repository
- [ ] Push image to ECR
- [ ] Create ECS cluster
- [ ] Create task definition
- [ ] Create ALB
- [ ] Create ECS service
- [ ] Test deployment

**พร้อมเริ่มหรือยัง?** เริ่มจาก Step 1!
