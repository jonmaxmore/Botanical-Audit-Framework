# 🏗️ AWS Infrastructure as Code (Terraform)

**Botanical Audit Framework - Production Infrastructure**

Complete AWS infrastructure for the Botanical Audit Framework platform using Terraform.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure Components](#infrastructure-components)
- [Cost Estimation](#cost-estimation)
- [Deployment Guide](#deployment-guide)
- [Configuration](#configuration)
- [Monitoring & Alerts](#monitoring--alerts)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Route53 (DNS)                          │
│              botanical-audit.com                             │
│              api.botanical-audit.com                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Application Load Balancer (ALB)                  │
│              HTTPS (443) + HTTP→HTTPS redirect              │
│              ACM Certificate (SSL/TLS)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   EC2 Instance  │     │   EC2 Instance  │
│   (Backend #1)  │     │   (Backend #2)  │
│   t3.medium     │     │   t3.medium     │
│   Node.js 20.x  │     │   Node.js 20.x  │
│   Port 5000     │     │   Port 5000     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    Auto Scaling       │
         │    Min: 2, Max: 10    │
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  MongoDB Atlas   │          │   S3 Buckets     │
│   M10 Bangkok    │          │  - Certificates  │
│   Managed        │          │  - Photos        │
│                  │          │  - Backups       │
└──────────────────┘          └──────────────────┘
```

### Key Features

✅ **High Availability:** Multi-AZ deployment across 2 availability zones  
✅ **Auto Scaling:** 2-10 instances based on CPU/Memory utilization  
✅ **Security:** KMS encryption, Security Groups, VPC isolation  
✅ **Monitoring:** CloudWatch metrics, logs, and alarms  
✅ **SSL/TLS:** ACM certificate with automatic renewal  
✅ **Backup:** S3 versioning + lifecycle policies to Glacier  
✅ **Cost Optimized:** ~$220/month with reserved instance potential  

---

## 🔧 Prerequisites

### Required Tools

1. **Terraform** >= 1.5.0
   ```bash
   # Install Terraform
   # Windows (using Chocolatey)
   choco install terraform
   
   # macOS (using Homebrew)
   brew install terraform
   
   # Linux
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   
   # Verify installation
   terraform version
   ```

2. **AWS CLI** >= 2.0
   ```bash
   # Install AWS CLI
   # Windows
   msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
   
   # macOS
   brew install awscli
   
   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Verify installation
   aws --version
   ```

3. **AWS Account** with appropriate permissions

### AWS Permissions Required

Your AWS IAM user/role needs these permissions:
- VPC (full access)
- EC2 (full access)
- ELB (full access)
- Auto Scaling (full access)
- S3 (full access)
- CloudFront (full access)
- Route53 (full access)
- ACM (full access)
- CloudWatch (full access)
- KMS (full access)
- IAM (read + pass role)

**Tip:** Use `AdministratorAccess` policy for initial setup (production should use least-privilege policies)

---

## 🚀 Quick Start

### Step 1: Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: ap-southeast-1
# - Default output format: json
```

### Step 2: Clone and Navigate

```bash
cd Botanical-Audit-Framework/infrastructure/terraform
```

### Step 3: Create Configuration File

```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
# IMPORTANT: Update these values:
# - mongodb_connection_string (your MongoDB Atlas URI)
# - alarm_email (your email for alerts)
# - domain_name (your domain)
# - app_environment_vars.JWT_SECRET (generate secure key)
```

### Step 4: Initialize Terraform

```bash
# Initialize Terraform (downloads providers)
terraform init
```

### Step 5: Review Plan

```bash
# See what will be created
terraform plan

# Save plan to file for review
terraform plan -out=tfplan
```

### Step 6: Deploy Infrastructure

```bash
# Apply the configuration
terraform apply

# Or use saved plan
terraform apply tfplan

# Type 'yes' when prompted to confirm
```

### Step 7: Get Outputs

```bash
# View all outputs
terraform output

# View specific output
terraform output api_endpoint
terraform output alb_dns_name
```

---

## 🏗️ Infrastructure Components

### 1. VPC Configuration

**Module:** `modules/vpc/`

- **VPC CIDR:** 10.0.0.0/16
- **Public Subnets:** 10.0.1.0/24, 10.0.2.0/24
- **Private Subnets:** 10.0.11.0/24, 10.0.12.0/24
- **Internet Gateway:** For public subnet internet access
- **NAT Gateways:** 2 (one per AZ) for private subnet outbound
- **Route Tables:** Separate for public/private subnets
- **VPC Flow Logs:** Enabled (7-day retention)

### 2. Security Module

**Module:** `modules/security/`

#### Security Groups

| Name | Purpose | Inbound Rules |
|------|---------|---------------|
| ALB SG | Load Balancer | 80/tcp (0.0.0.0/0), 443/tcp (0.0.0.0/0) |
| Backend SG | Application Servers | 5000/tcp (from ALB SG only) |
| MongoDB SG | Database | 27017/tcp (from Backend SG only) |
| Redis SG | Cache | 6379/tcp (from Backend SG only) |

#### KMS Encryption

- **Key Rotation:** Enabled (automatic yearly rotation)
- **Key Policy:** Allows EC2, S3, CloudWatch access
- **Alias:** `alias/botanical-audit-production`

### 3. Compute Module

**Module:** `modules/compute/`

#### Application Load Balancer (ALB)

- **Type:** Application Load Balancer
- **Scheme:** Internet-facing
- **Listeners:**
  - HTTPS (443) → Backend Target Group
  - HTTP (80) → Redirect to HTTPS
- **SSL Certificate:** ACM certificate with DNS validation
- **Health Check:**
  - Path: `/health`
  - Interval: 30 seconds
  - Timeout: 5 seconds
  - Healthy threshold: 2
  - Unhealthy threshold: 3

#### Auto Scaling Group

- **Instance Type:** t3.medium (2 vCPU, 4GB RAM)
- **Min Size:** 2 instances
- **Max Size:** 10 instances
- **Desired:** 2 instances
- **Scaling Policies:**
  - Scale UP: CPU > 70% for 5 minutes
  - Scale DOWN: CPU < 30% for 5 minutes
- **Health Check:** ELB + EC2
- **User Data:** Installs Node.js 20.x, clones GitHub repo, starts app

### 4. Storage Module

**Module:** `modules/storage/`

#### S3 Buckets

| Bucket | Purpose | Features |
|--------|---------|----------|
| botanical-audit-certificates | Digital certificates | Private, Versioning, KMS encryption, Lifecycle to Glacier (90 days) |
| botanical-audit-photos | Farm/product photos | Presigned URLs, CloudFront CDN, Public read with CDN |
| botanical-audit-backups | Database backups | Versioning, Lifecycle to Glacier (30 days), Expiration (7 years) |

#### CloudFront Distribution

- **Origin:** botanical-audit-photos bucket
- **Price Class:** PriceClass_200 (Asia, Europe, North America)
- **Caching:** TTL 86400 seconds (24 hours)
- **Compression:** Enabled (gzip, brotli)

### 5. Networking Module

**Module:** `modules/networking/`

#### Route53

- **Hosted Zone:** botanical-audit.com
- **Records:**
  - `api.botanical-audit.com` → ALB (A record)
  - `www.botanical-audit.com` → api (CNAME)
- **Health Checks:** ALB endpoint monitoring

#### ACM Certificate

- **Domain:** *.botanical-audit.com (wildcard)
- **Validation:** DNS validation (automatic)
- **Renewal:** Automatic

### 6. Monitoring Module

**Module:** `modules/monitoring/`

#### CloudWatch Log Groups

- `/aws/ec2/botanical-audit-production` - Application logs
- `/aws/vpc/botanical-audit-production-flow-log` - VPC flow logs

#### CloudWatch Alarms

| Alarm | Threshold | Actions |
|-------|-----------|---------|
| High CPU | > 80% for 5 min | SNS notification + Auto scale |
| High Memory | > 85% for 5 min | SNS notification |
| 5xx Errors | > 10/min | SNS notification |
| Unhealthy Targets | < 2 healthy | SNS notification |

#### CloudWatch Dashboard

- EC2 CPU/Memory/Network metrics
- ALB request count, latency, 5xx errors
- Target group health
- Auto Scaling group metrics

---

## 💰 Cost Estimation

### Monthly Costs (ap-southeast-1)

| Service | Configuration | Monthly Cost (USD) |
|---------|--------------|-------------------|
| **EC2** | 2× t3.medium (2 vCPU, 4GB) | ~$60.80 |
| **ALB** | Application Load Balancer | ~$23.00 |
| **NAT Gateway** | 2× NAT (one per AZ) | ~$64.80 |
| **EBS** | 2× 20GB gp3 | ~$4.00 |
| **S3 Standard** | 100GB storage | ~$2.30 |
| **S3 Glacier** | 1TB after lifecycle | ~$4.10 |
| **CloudFront** | 100GB data transfer | ~$8.50 |
| **Data Transfer** | 500GB outbound | ~$45.00 |
| **Route53** | 1 hosted zone | ~$0.50 |
| **CloudWatch** | 10GB logs + 10 alarms | ~$6.00 |
| **KMS** | 1 key, 1000 requests | ~$1.20 |
| **ACM** | SSL certificate | **FREE** |
| | **Total (Standard)** | **~$220/month** |

### Cost Optimization Tips

1. **Reserved Instances:** Save 30-40% on EC2 costs
   ```bash
   # 1-year reserved: ~$42/month (save $18/month)
   # 3-year reserved: ~$27/month (save $33/month)
   ```

2. **Single NAT Gateway:** Set `single_nat_gateway = true`
   ```bash
   # Saves: ~$32/month
   # Trade-off: Single point of failure
   ```

3. **Smaller Instances:** Use t3.small in development
   ```bash
   # t3.small: ~$15/month per instance
   # Saves: ~$30/month for 2 instances
   ```

4. **S3 Lifecycle:** Aggressive Glacier transitions
   ```bash
   # Move to Glacier after 30 days instead of 90
   # Saves: ~$1-2/month
   ```

**Estimated with optimizations:** ~$150-170/month

---

## 📖 Deployment Guide

### Initial Deployment

1. **Prepare Configuration**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   nano terraform.tfvars
   ```

2. **Generate JWT Secret**
   ```bash
   # Generate secure JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Add to terraform.tfvars:
   # app_environment_vars = {
   #   JWT_SECRET = "your-generated-secret-here"
   # }
   ```

3. **Initialize Terraform**
   ```bash
   terraform init
   ```

4. **Validate Configuration**
   ```bash
   terraform validate
   terraform fmt -recursive
   ```

5. **Plan Deployment**
   ```bash
   terraform plan -out=tfplan
   ```

6. **Review Plan**
   - Check resources to be created
   - Verify costs estimate
   - Confirm configuration values

7. **Apply Infrastructure**
   ```bash
   terraform apply tfplan
   ```

8. **Note Outputs**
   ```bash
   terraform output > outputs.txt
   terraform output -json > outputs.json
   ```

### DNS Configuration

After deployment, update your domain registrar:

```bash
# Get nameservers
terraform output route53_name_servers

# Update your domain registrar with these nameservers:
# ns-1234.awsdns-12.org
# ns-567.awsdns-34.com
# ns-890.awsdns-56.co.uk
# ns-1234.awsdns-78.net

# Wait 5-30 minutes for DNS propagation
```

### SSL Certificate Validation

```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw acm_certificate_arn) \
  --region ap-southeast-1

# Wait for Status: ISSUED
# Usually takes 5-30 minutes after DNS configuration
```

### Application Deployment

**Option 1: Manual Deployment**
```bash
# SSH into EC2 instance (if key configured)
ssh -i your-key.pem ec2-user@<instance-ip>

# Clone repository
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework

# Install dependencies
cd apps/backend
npm install

# Set environment variables
export NODE_ENV=production
export PORT=5000
export MONGODB_URI="your-mongodb-connection-string"
export JWT_SECRET="your-jwt-secret"

# Start application
npm start

# Or use PM2
npm install -g pm2
pm2 start npm --name "botanical-audit" -- start
pm2 save
pm2 startup
```

**Option 2: User Data Auto-Deployment (Recommended)**

The launch template includes user data that automatically:
1. Installs Node.js 20.x
2. Clones the GitHub repository
3. Installs dependencies
4. Starts the application with PM2

No manual SSH required!

### Verification

```bash
# Check health endpoint
curl https://api.botanical-audit.com/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-03T..."}

# Check ALB DNS
curl http://$(terraform output -raw alb_dns_name)/health

# Check CloudWatch logs
aws logs tail /aws/ec2/botanical-audit-production --follow
```

---

## ⚙️ Configuration

### Environment Variables

Set in `terraform.tfvars`:

```hcl
app_environment_vars = {
  NODE_ENV   = "production"
  PORT       = "5000"
  JWT_SECRET = "your-super-secret-key-change-this"
  
  # MongoDB Atlas
  MONGODB_URI = "mongodb+srv://..."
  
  # AWS S3 (auto-configured by Terraform)
  AWS_REGION              = "ap-southeast-1"
  S3_CERTIFICATES_BUCKET  = "botanical-audit-prod-certificates"
  S3_PHOTOS_BUCKET        = "botanical-audit-prod-photos"
  S3_BACKUPS_BUCKET       = "botanical-audit-prod-backups"
  
  # Optional: Redis (if enabled)
  # REDIS_HOST = "redis-endpoint"
  # REDIS_PORT = "6379"
}
```

### Scaling Configuration

```hcl
# Auto Scaling
asg_min_size         = 2   # Minimum instances
asg_max_size         = 10  # Maximum instances
asg_desired_capacity = 2   # Initial instances

# Instance type
ec2_instance_type = "t3.medium" # 2 vCPU, 4GB RAM
```

### Cost Optimization

```hcl
# Use single NAT Gateway (saves ~$32/month)
single_nat_gateway = true

# Disable KMS if not needed (saves ~$1.20/month)
enable_kms_encryption = false

# Smaller instance type for dev
ec2_instance_type = "t3.small"
```

---

## 📊 Monitoring & Alerts

### CloudWatch Dashboard

Access at: https://console.aws.amazon.com/cloudwatch/

**Widgets:**
- EC2 CPU utilization (per instance)
- EC2 Memory utilization
- ALB request count
- ALB target response time
- ALB 5xx error rate
- Target group health count

### CloudWatch Alarms

Configured alarms send SNS notifications to your email:

| Alarm Name | Condition | Action |
|------------|-----------|--------|
| High CPU | CPU > 80% for 5 min | Email + Auto scale up |
| High Memory | Memory > 85% for 5 min | Email notification |
| High 5xx Errors | 5xx > 10/min | Email notification |
| Unhealthy Targets | Healthy < 2 for 5 min | Email notification |

### Log Aggregation

```bash
# View recent logs
aws logs tail /aws/ec2/botanical-audit-production --follow

# Filter errors
aws logs filter-pattern /aws/ec2/botanical-audit-production --filter-pattern "ERROR"

# Export logs to S3
aws logs create-export-task \
  --task-name "export-$(date +%Y%m%d)" \
  --log-group-name "/aws/ec2/botanical-audit-production" \
  --from $(date -d '7 days ago' +%s)000 \
  --to $(date +%s)000 \
  --destination "botanical-audit-prod-backups" \
  --destination-prefix "logs/"
```

### Custom Metrics

Add to your Node.js application:

```javascript
// Send custom metric to CloudWatch
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch({ region: 'ap-southeast-1' });

async function recordMetric(metricName, value, unit = 'Count') {
  await cloudwatch.putMetricData({
    Namespace: 'BotanicalAudit/Application',
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date()
    }]
  }).promise();
}

// Example usage
await recordMetric('RecordsCreated', 1);
await recordMetric('SignatureVerificationTime', 45, 'Milliseconds');
```

---

## 🔒 Security

### Security Best Practices

✅ **Network Isolation**
- Private subnets for backend servers
- Security groups restrict access between layers
- VPC Flow Logs enabled

✅ **Encryption**
- KMS encryption for S3 buckets
- SSL/TLS (ACM certificate) for all traffic
- Encrypted EBS volumes

✅ **Access Control**
- IAM roles for EC2 instances (no hardcoded credentials)
- S3 bucket policies restrict access
- Security groups allow only necessary ports

✅ **Secrets Management**
- Use AWS Secrets Manager or Parameter Store for sensitive data
- Never commit secrets to Git
- Rotate credentials regularly

### SSH Access

By default, SSH is **disabled**. To enable:

```hcl
# In terraform.tfvars
allowed_ssh_cidr_blocks = ["YOUR_IP/32"]
ec2_key_name = "your-ec2-key-pair"
```

**Recommended:** Use AWS Systems Manager Session Manager instead of SSH

```bash
# Connect without SSH key
aws ssm start-session --target <instance-id>
```

### Security Group Rules

Review and update as needed:

```bash
# View security groups
terraform state show module.security.aws_security_group.alb
terraform state show module.security.aws_security_group.backend

# Modify in variables.tf or terraform.tfvars
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Terraform init fails

**Error:** `Failed to download provider`

**Solution:**
```bash
# Clear cache
rm -rf .terraform .terraform.lock.hcl

# Re-initialize
terraform init
```

#### Issue: Apply fails with "already exists"

**Error:** `Resource already exists`

**Solution:**
```bash
# Import existing resource
terraform import module.vpc.aws_vpc.main vpc-xxxxx

# Or destroy and recreate
terraform destroy -target=module.vpc.aws_vpc.main
terraform apply
```

#### Issue: Health checks failing

**Error:** Targets marked unhealthy

**Solution:**
1. Check application is running:
   ```bash
   curl http://localhost:5000/health
   ```

2. Check security group allows ALB traffic:
   ```bash
   # Backend SG should allow port 5000 from ALB SG
   ```

3. Check CloudWatch logs:
   ```bash
   aws logs tail /aws/ec2/botanical-audit-production --follow
   ```

#### Issue: SSL certificate pending validation

**Error:** Certificate status: PENDING_VALIDATION

**Solution:**
1. Check DNS records are created:
   ```bash
   dig api.botanical-audit.com
   ```

2. Wait 5-30 minutes for DNS propagation

3. Force DNS refresh:
   ```bash
   aws acm describe-certificate \
     --certificate-arn $(terraform output -raw acm_certificate_arn)
   ```

#### Issue: High costs

**Solution:**
1. Check for idle resources:
   ```bash
   aws ec2 describe-instances --filters "Name=instance-state-name,Values=running"
   ```

2. Review CloudWatch metrics

3. Optimize:
   - Use reserved instances
   - Enable single NAT Gateway
   - Reduce log retention periods

### Debug Commands

```bash
# Check Terraform state
terraform state list
terraform state show <resource-name>

# Refresh state from AWS
terraform refresh

# View detailed plan
terraform plan -detailed-exitcode

# Enable debug logging
export TF_LOG=DEBUG
terraform apply

# Check AWS resources
aws ec2 describe-vpcs
aws elbv2 describe-load-balancers
aws autoscaling describe-auto-scaling-groups
```

---

## 🔄 Maintenance

### Updates and Upgrades

#### Update Terraform Configuration

```bash
# Pull latest changes
git pull origin main

# Review changes
terraform plan

# Apply updates
terraform apply
```

#### Update EC2 Instances

**Zero-downtime deployment:**

```bash
# Update launch template
terraform apply -target=module.compute.aws_launch_template.main

# Trigger instance refresh
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name $(terraform output -raw autoscaling_group_name) \
  --preferences MinHealthyPercentage=50
```

#### Backup and Restore

**Backup Terraform State:**
```bash
# Backup state file
cp terraform.tfstate terraform.tfstate.backup-$(date +%Y%m%d)

# Use S3 backend (recommended)
terraform {
  backend "s3" {
    bucket         = "botanical-audit-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

**Restore from Backup:**
```bash
# Restore state
cp terraform.tfstate.backup-20251103 terraform.tfstate
terraform refresh
```

### Cleanup

**Destroy All Infrastructure:**
```bash
# Review what will be destroyed
terraform plan -destroy

# Destroy everything
terraform destroy

# Type 'yes' to confirm
```

**⚠️ WARNING:** This will delete ALL resources and cannot be undone!

---

## 📞 Support

### Resources

- **Terraform Documentation:** https://www.terraform.io/docs
- **AWS Documentation:** https://docs.aws.amazon.com
- **Project Repository:** https://github.com/jonmaxmore/Botanical-Audit-Framework

### Contact

- **Email:** admin@botanical-audit.com
- **GitHub Issues:** https://github.com/jonmaxmore/Botanical-Audit-Framework/issues

---

## 📄 License

Copyright © 2025 Botanical Audit Framework  
All rights reserved.

---

**Generated:** November 3, 2025  
**Version:** 1.0.0  
**Terraform:** >= 1.5.0  
**AWS Provider:** ~> 5.0
