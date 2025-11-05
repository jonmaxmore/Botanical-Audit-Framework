# 🚀 AWS Deployment Guide - GACP Platform

**Target:** Production deployment on AWS  
**Status:** ✅ Code Ready - Ready to Deploy  
**Date:** November 4, 2025

---

## 📋 AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     AWS Cloud                            │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐               │
│  │   Route 53   │─────▶│  CloudFront  │               │
│  │     DNS      │      │     CDN      │               │
│  └──────────────┘      └──────┬───────┘               │
│                               │                         │
│  ┌────────────────────────────┼─────────────────────┐  │
│  │            Application Load Balancer              │  │
│  └────────────┬───────────────┴──────────┬──────────┘  │
│               │                           │             │
│  ┌────────────▼─────────┐   ┌───────────▼──────────┐  │
│  │   EC2 Instance 1     │   │   EC2 Instance 2     │  │
│  │   - Backend API      │   │   - Backend API      │  │
│  │   - Frontend (Next)  │   │   - Frontend (Next)  │  │
│  └──────────────────────┘   └──────────────────────┘  │
│               │                           │             │
│  ┌────────────▼───────────────────────────▼─────────┐  │
│  │         ElastiCache (Redis)                      │  │
│  │         - Queue (Bull)                           │  │
│  │         - Cache Layer                            │  │
│  └──────────────────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │         DocumentDB (MongoDB Compatible)          │  │
│  │         - Primary Database                       │  │
│  │         - Automatic Backups                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 AWS Services Required

### 1. **Compute**
- **EC2 Instances:** t3.medium (2 vCPU, 4GB RAM) × 2
- **Auto Scaling Group:** Min 2, Max 4 instances
- **Application Load Balancer:** For high availability

### 2. **Database**
- **DocumentDB:** 3-node cluster (MongoDB compatible)
  - Instance: db.t3.medium
  - Storage: 100GB with auto-scaling
  - Backup: 7-day retention

### 3. **Cache & Queue**
- **ElastiCache for Redis:** 
  - Node: cache.t3.medium
  - Engine: Redis 7.x
  - Multi-AZ: Enabled

### 4. **Storage**
- **S3 Buckets:**
  - `gacp-uploads` (certificates, documents)
  - `gacp-backups` (database backups)
  - `gacp-static` (frontend assets)

### 5. **Networking**
- **VPC:** Custom VPC with public/private subnets
- **Security Groups:** Configured for each service
- **NAT Gateway:** For private subnet internet access

### 6. **DNS & CDN**
- **Route 53:** Domain management
- **CloudFront:** CDN for static assets

---

## 🎯 Your AWS EC2 Instance Details

**Instance ID:** `i-0b7d2294695d6c8de`  
**Public IP:** `13.212.147.92`  
**Public DNS:** `ec2-13-212-147-92.ap-southeast-1.compute.amazonaws.com`  
**Private IP:** `172.31.12.190`  
**Private DNS:** `ip-172-31-12-190.ap-southeast-1.compute.internal`  
**Region:** `ap-southeast-1` (Singapore)  
**Key Pair:** `gacp-backend-server.pem`

### Quick Connect to Your EC2

```bash
# Set correct permissions for key file
chmod 400 "gacp-backend-server.pem"

# Connect via SSH
ssh -i "gacp-backend-server.pem" ec2-user@ec2-13-212-147-92.ap-southeast-1.compute.amazonaws.com
# OR using public IP
ssh -i "gacp-backend-server.pem" ec2-user@13.212.147.92
```

---

## 🚀 Quick Deploy (Option 1: Deploy to Your EC2)

### Prerequisites
```bash
# Install AWS CLI (if not already installed)
winget install Amazon.AWSCLI

# Configure AWS credentials
aws configure
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: ap-southeast-1
# Default output format: json
```

### Deploy Using Terraform (Recommended)

```bash
# 1. Navigate to terraform directory
cd terraform

# 2. Initialize Terraform
terraform init

# 3. Review deployment plan
terraform plan

# 4. Deploy infrastructure
terraform apply
# Type 'yes' when prompted

# Wait 10-15 minutes for complete deployment
```

### Deploy Using AWS CLI (Alternative)

```bash
# 1. Create VPC and subnets
aws cloudformation create-stack \
  --stack-name gacp-network \
  --template-body file://./infrastructure/aws-network.yaml

# 2. Create DocumentDB cluster
aws cloudformation create-stack \
  --stack-name gacp-database \
  --template-body file://./infrastructure/aws-documentdb.yaml

# 3. Create ElastiCache
aws cloudformation create-stack \
  --stack-name gacp-cache \
  --template-body file://./infrastructure/aws-elasticache.yaml

# 4. Create EC2 instances
aws cloudformation create-stack \
  --stack-name gacp-compute \
  --template-body file://./infrastructure/aws-ec2.yaml
```

---

## 📝 Manual Deployment (Option 2: Step-by-Step)

### Step 1: Create DocumentDB Cluster

```bash
# Create subnet group
aws docdb create-db-subnet-group \
  --db-subnet-group-name gacp-docdb-subnet \
  --subnet-ids subnet-xxx subnet-yyy \
  --db-subnet-group-description "GACP DocumentDB Subnet Group"

# Create DocumentDB cluster
aws docdb create-db-cluster \
  --db-cluster-identifier gacp-docdb-cluster \
  --engine docdb \
  --master-username admin \
  --master-user-password <SECURE-PASSWORD> \
  --db-subnet-group-name gacp-docdb-subnet \
  --vpc-security-group-ids sg-xxx

# Create DocumentDB instance
aws docdb create-db-instance \
  --db-instance-identifier gacp-docdb-instance-1 \
  --db-instance-class db.t3.medium \
  --engine docdb \
  --db-cluster-identifier gacp-docdb-cluster
```

### Step 2: Create ElastiCache for Redis

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name gacp-redis-subnet \
  --subnet-ids subnet-xxx subnet-yyy \
  --cache-subnet-group-description "GACP Redis Subnet Group"

# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id gacp-redis \
  --replication-group-description "GACP Redis Cache" \
  --engine redis \
  --cache-node-type cache.t3.medium \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --cache-subnet-group-name gacp-redis-subnet \
  --security-group-ids sg-xxx
```

### Step 3: Create EC2 Instances

```bash
# Create key pair
aws ec2 create-key-pair \
  --key-name gacp-keypair \
  --query 'KeyMaterial' \
  --output text > gacp-keypair.pem

chmod 400 gacp-keypair.pem

# Launch EC2 instances
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name gacp-keypair \
  --security-group-ids sg-xxx \
  --subnet-id subnet-xxx \
  --user-data file://./scripts/ec2-user-data.sh \
  --count 2 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=gacp-backend}]'
```

### Step 4: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name gacp-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# Create target group
aws elbv2 create-target-group \
  --name gacp-targets \
  --protocol HTTP \
  --port 3004 \
  --vpc-id vpc-xxx \
  --health-check-path /api/health

# Register EC2 instances to target group
aws elbv2 register-targets \
  --target-group-arn <target-group-arn> \
  --targets Id=i-xxx Id=i-yyy
```

---

## 🔧 EC2 Instance Setup Script

สร้างไฟล์ `ec2-user-data.sh`:

```bash
#!/bin/bash
set -e

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Git
yum install -y git

# Install PM2
npm install -g pm2 pnpm

# Clone repository
cd /home/ec2-user
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework

# Install dependencies
pnpm install

# Create .env file
cat > /home/ec2-user/Botanical-Audit-Framework/apps/backend/.env << 'EOF'
# Database
MONGODB_URI=mongodb://<DOCDB-ENDPOINT>:27017/gacp_platform?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
MONGODB_DB_NAME=gacp_platform

# Redis
REDIS_HOST=<ELASTICACHE-ENDPOINT>
REDIS_PORT=6379
ENABLE_QUEUE=true
ENABLE_CACHE=true

# Security
NODE_ENV=production
JWT_SECRET=<GENERATE-SECURE-SECRET>
SESSION_SECRET=<GENERATE-SECURE-SECRET>

# Server
PORT=3004
EOF

# Build frontend
cd apps/frontend
pnpm build

# Start backend with PM2
cd ../backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Configure PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "✅ GACP Platform deployed successfully!"
```

---

## 🔐 Security Configuration

### 1. Security Groups

**ALB Security Group:**
```bash
# Allow HTTP/HTTPS from internet
Inbound:
- Port 80 (HTTP) from 0.0.0.0/0
- Port 443 (HTTPS) from 0.0.0.0/0

Outbound:
- All traffic to EC2 Security Group
```

**EC2 Security Group:**
```bash
Inbound:
- Port 3004 (API) from ALB Security Group
- Port 22 (SSH) from your IP only

Outbound:
- Port 27017 (DocumentDB) to DocumentDB Security Group
- Port 6379 (Redis) to ElastiCache Security Group
- Port 443 (HTTPS) for external APIs
```

**DocumentDB Security Group:**
```bash
Inbound:
- Port 27017 from EC2 Security Group only

Outbound:
- None required
```

**ElastiCache Security Group:**
```bash
Inbound:
- Port 6379 from EC2 Security Group only

Outbound:
- None required
```

### 2. IAM Roles

Create IAM role for EC2:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::gacp-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:gacp/*"
    }
  ]
}
```

---

## 📊 Cost Estimation (Monthly)

| Service | Configuration | Cost (USD) |
|---------|--------------|-----------|
| EC2 (2 × t3.medium) | 2 vCPU, 4GB RAM | ~$60 |
| DocumentDB (3 nodes) | db.t3.medium | ~$200 |
| ElastiCache Redis | cache.t3.medium | ~$50 |
| ALB | Standard | ~$25 |
| S3 Storage | 100GB | ~$3 |
| Data Transfer | 1TB/month | ~$90 |
| CloudFront | 1TB/month | ~$85 |
| Route 53 | 1 hosted zone | ~$1 |
| **Total Estimated** | | **~$514/month** |

*Costs are approximate and may vary based on usage*

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] AWS account created and configured
- [ ] AWS CLI installed and configured
- [ ] Domain name registered (Route 53 or external)
- [ ] SSL certificate created (ACM)
- [ ] Secrets generated (JWT_SECRET, etc.)

### Infrastructure
- [ ] VPC and subnets created
- [ ] Security groups configured
- [ ] DocumentDB cluster created
- [ ] ElastiCache Redis created
- [ ] S3 buckets created
- [ ] EC2 instances launched
- [ ] Load balancer configured

### Application
- [ ] Code deployed to EC2
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] PM2 configured and running
- [ ] Health checks passing

### Post-Deployment
- [ ] DNS configured (Route 53)
- [ ] SSL certificate installed
- [ ] CloudFront distribution created
- [ ] Monitoring configured (CloudWatch)
- [ ] Backups configured (automated)
- [ ] Load testing completed
- [ ] Documentation updated

---

## 🔍 Post-Deployment Verification

```bash
# 1. Check EC2 instances
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=gacp-backend" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' \
  --output table

# 2. Check DocumentDB cluster
aws docdb describe-db-clusters \
  --db-cluster-identifier gacp-docdb-cluster

# 3. Check ElastiCache
aws elasticache describe-replication-groups \
  --replication-group-id gacp-redis

# 4. Test API endpoint
curl https://api.yourdomain.com/api/health

# 5. Test frontend
curl https://yourdomain.com

# 6. Check logs
ssh -i gacp-keypair.pem ec2-user@<EC2-IP>
pm2 logs
```

---

## 🆘 Troubleshooting

### Issue: Cannot connect to DocumentDB
```bash
# Download DocumentDB certificate
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Update connection string
MONGODB_URI=mongodb://<endpoint>:27017/?ssl=true&ssl_ca_certs=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

### Issue: Redis connection timeout
```bash
# Check security group
aws elasticache describe-cache-clusters \
  --cache-cluster-id gacp-redis \
  --show-cache-node-info

# Test connection from EC2
redis-cli -h <elasticache-endpoint> ping
```

### Issue: Application not starting
```bash
# SSH to EC2
ssh -i gacp-keypair.pem ec2-user@<EC2-IP>

# Check PM2 status
pm2 status

# Check logs
pm2 logs gacp-backend

# Restart application
pm2 restart all
```

---

## 📞 Support

**AWS Support:**
- Basic Plan: Free
- Developer: $29/month
- Business: $100/month

**Documentation:**
- AWS DocumentDB: https://docs.aws.amazon.com/documentdb/
- AWS ElastiCache: https://docs.aws.amazon.com/elasticache/
- AWS EC2: https://docs.aws.amazon.com/ec2/

---

## 🚀 Quick Start Command

```bash
# Deploy everything with one command (requires Terraform)
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework/terraform
terraform init
terraform apply -auto-approve

# Wait 15 minutes, then access your application
# https://your-alb-endpoint.amazonaws.com
```

---

**Ready to deploy!** 🎉

Your codebase is production-ready. Follow this guide to deploy on AWS.
