# AWS Deployment Guide - GACP Platform

## 🚀 Quick Deployment (30 นาที)

### Prerequisites
- ✅ AWS Account
- ✅ AWS CLI installed
- ✅ Terraform installed
- ✅ Docker installed
- ✅ MongoDB Atlas setup (เสร็จแล้ว)

---

## Step 1: AWS CLI Setup (5 นาที)

### ติดตั้ง AWS CLI
```bash
# Windows
choco install awscli

# หรือ download: https://aws.amazon.com/cli/
```

### Configure AWS Credentials
```bash
aws configure

# ใส่ข้อมูล:
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region: ap-southeast-1
Default output format: json
```

### ทดสอบ
```bash
aws sts get-caller-identity
```

---

## Step 2: Create ECR Repository (2 นาที)

```bash
# สร้าง ECR repository
aws ecr create-repository \
  --repository-name gacp-backend \
  --region ap-southeast-1

# เก็บ repository URI
# Output: ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend
```

---

## Step 3: Build & Push Docker Image (10 นาที)

### สร้าง Dockerfile
```bash
cd apps/backend
```

สร้างไฟล์ `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "atlas-server.js"]
```

### Build & Push
```bash
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Build image
docker build -t gacp-backend .

# Tag image
docker tag gacp-backend:latest ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest

# Push to ECR
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest
```

---

## Step 4: Deploy with Terraform (10 นาที)

### Setup Terraform
```bash
cd ../../infrastructure/aws

# Copy variables
cp terraform.tfvars.example terraform.tfvars
```

### Edit `terraform.tfvars`
```hcl
# AWS Configuration
aws_region  = "ap-southeast-1"
environment = "production"

# MongoDB Atlas (ใช้ที่มีอยู่แล้ว)
mongodb_uri = "mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp"

# JWT Secrets (generate ใหม่)
farmer_jwt_secret = "GENERATE_64_CHAR_SECRET_HERE"
dtam_jwt_secret   = "GENERATE_64_CHAR_SECRET_HERE"

# ECR Image
backend_image = "ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest"

# ECS Configuration
backend_cpu           = "512"
backend_memory        = "1024"
backend_desired_count = 2
```

### Generate Secrets
```bash
# Generate JWT secrets
node -e "console.log('FARMER_JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('DTAM_JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### Deploy
```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply (deploy)
terraform apply -auto-approve
```

### Get Outputs
```bash
terraform output

# จะได้:
# alb_dns_name = "gacp-alb-xxxxx.ap-southeast-1.elb.amazonaws.com"
# backend_url = "http://gacp-alb-xxxxx.ap-southeast-1.elb.amazonaws.com"
```

---

## Step 5: Verify Deployment (3 นาที)

### Test Health Endpoint
```bash
# Get ALB DNS
ALB_DNS=$(terraform output -raw alb_dns_name)

# Test health
curl http://$ALB_DNS/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-10-29T...",
  "database": {
    "status": "connected"
  }
}
```

### Check ECS Service
```bash
aws ecs describe-services \
  --cluster gacp-cluster-production \
  --services gacp-backend \
  --region ap-southeast-1
```

### View Logs
```bash
aws logs tail /ecs/gacp-backend --follow --region ap-southeast-1
```

---

## 💰 Cost Estimate

### Monthly Costs (Production)
| Service | Configuration | Cost/Month |
|---------|--------------|------------|
| ECS Fargate | 2 tasks (0.5 vCPU, 1GB) | $30-50 |
| ALB | Application Load Balancer | $20 |
| ElastiCache | Redis t3.micro x2 | $30 |
| S3 | 100GB storage | $5 |
| Secrets Manager | 5 secrets | $2 |
| CloudWatch | Logs & Metrics | $10 |
| Data Transfer | 100GB/month | $10 |
| **Total** | | **$107-127/month** |

### Free Tier (First 12 months)
- ✅ 750 hours ECS Fargate
- ✅ 750 hours ALB
- ✅ 5GB S3 storage
- ✅ 10GB data transfer

**Estimated First Year:** ~$50-80/month

---

## 🔒 Security Checklist

- ✅ Secrets in AWS Secrets Manager
- ✅ Private subnets for ECS
- ✅ Security groups configured
- ✅ MongoDB Atlas Network Access
- ✅ SSL/TLS encryption
- ✅ IAM roles with least privilege
- ✅ CloudTrail logging enabled

---

## 📊 Monitoring

### CloudWatch Dashboard
```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name GACP-Production \
  --dashboard-body file://dashboard.json
```

### Alarms
```bash
# CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name gacp-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions
สร้างไฟล์ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-1
      
      - name: Login to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
      
      - name: Build and Push
        run: |
          docker build -t gacp-backend apps/backend
          docker tag gacp-backend:latest $ECR_REGISTRY/gacp-backend:latest
          docker push $ECR_REGISTRY/gacp-backend:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster gacp-cluster-production \
            --service gacp-backend \
            --force-new-deployment
```

---

## 🆘 Troubleshooting

### ECS Tasks Not Starting
```bash
# Check task status
aws ecs describe-tasks \
  --cluster gacp-cluster-production \
  --tasks $(aws ecs list-tasks --cluster gacp-cluster-production --query 'taskArns[0]' --output text)

# Check logs
aws logs tail /ecs/gacp-backend --follow
```

### Health Check Failing
```bash
# Test locally
docker run -p 3000:3000 gacp-backend
curl http://localhost:3000/health

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### MongoDB Connection Issues
```bash
# Test from ECS task
aws ecs execute-command \
  --cluster gacp-cluster-production \
  --task TASK_ID \
  --container gacp-backend \
  --interactive \
  --command "/bin/sh"

# Inside container:
curl -I https://thai-gacp.re1651p.mongodb.net
```

---

## 🔄 Update Deployment

### Update Code
```bash
# 1. Build new image
cd apps/backend
docker build -t gacp-backend:v2 .

# 2. Push to ECR
docker tag gacp-backend:v2 ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:v2
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:v2

# 3. Update ECS
aws ecs update-service \
  --cluster gacp-cluster-production \
  --service gacp-backend \
  --force-new-deployment
```

### Update Infrastructure
```bash
cd infrastructure/aws
terraform plan
terraform apply
```

---

## 🗑️ Cleanup (ถ้าต้องการลบทั้งหมด)

```bash
# Destroy infrastructure
terraform destroy -auto-approve

# Delete ECR images
aws ecr batch-delete-image \
  --repository-name gacp-backend \
  --image-ids imageTag=latest

# Delete ECR repository
aws ecr delete-repository \
  --repository-name gacp-backend \
  --force
```

---

## 📞 Next Steps

1. ✅ Deploy infrastructure
2. ✅ Test all endpoints
3. ⏳ Setup custom domain (Route 53)
4. ⏳ Configure SSL certificate
5. ⏳ Setup CI/CD pipeline
6. ⏳ Configure monitoring alerts
7. ⏳ Deploy frontend portals

**พร้อมเริ่มหรือยัง?** บอกผมเมื่อพร้อม deploy!
