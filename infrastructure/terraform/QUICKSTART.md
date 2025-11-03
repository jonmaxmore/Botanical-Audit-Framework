# Quick Start Guide - Deploying with Existing AWS Resources

This guide will help you deploy the Botanical Audit Framework infrastructure using your existing AWS EC2 instance and VPC.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [DNS Configuration](#dns-configuration)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Your Current Resources
- **EC2 Instance**: `i-036cad13893eb6511` (47.130.0.164)
- **VPC**: `vpc-03768ea49251845c3`
- **Subnet**: `subnet-0a9aedf2d5d4793b4`
- **Region**: `ap-southeast-1` (Bangkok)

### What Terraform Will Create
- ✅ **Application Load Balancer** (ALB) - HTTPS traffic distribution
- ✅ **Target Group** - Register your existing instance
- ✅ **S3 Buckets** (3) - Certificates, Photos, Backups
- ✅ **CloudFront CDN** - Fast photo delivery
- ✅ **Route53 DNS** - Domain management
- ✅ **ACM Certificate** - Free SSL/TLS
- ✅ **CloudWatch Monitoring** - Logs, metrics, alarms
- ✅ **Security Groups** - ALB, Backend, MongoDB, Redis

### What Terraform Will NOT Touch
- ❌ Your existing EC2 instance (read-only reference)
- ❌ Your existing VPC (read-only reference)
- ❌ Your existing subnet (read-only reference)

---

## ✅ Prerequisites

### 1. Install Required Tools

**Terraform** (>= 1.5.0):
```powershell
# Windows (using Chocolatey)
choco install terraform

# Verify installation
terraform --version
```

**AWS CLI** (>= 2.0):
```powershell
# Windows (MSI Installer)
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation
aws --version
```

### 2. Configure AWS Credentials

```powershell
aws configure
```

Enter your credentials:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region**: `ap-southeast-1`
- **Default output format**: `json`

### 3. Verify IAM Permissions

Your AWS user/role needs these permissions:
- ✅ EC2 (describe instances, security groups)
- ✅ VPC (describe VPCs, subnets)
- ✅ ELB (create/manage ALB, target groups)
- ✅ S3 (create/manage buckets)
- ✅ CloudFront (create/manage distributions)
- ✅ Route53 (create/manage hosted zones, records)
- ✅ ACM (request/manage certificates)
- ✅ CloudWatch (create/manage logs, alarms, dashboards)
- ✅ SNS (create/manage topics)
- ✅ KMS (create/manage encryption keys)

### 4. Required Information

Before starting, gather:
- ✅ **Domain name** (e.g., `botanical-audit.com`)
- ✅ **MongoDB connection string** (from Task 1)
- ✅ **Alarm email address** (for CloudWatch alerts)
- ✅ **GitHub repository URL** (optional, for ASG)

---

## 🚀 Step-by-Step Deployment

### Step 1: Navigate to Terraform Directory

```powershell
cd C:\Users\charo\Botanical-Audit-Framework\infrastructure\terraform
```

### Step 2: Create `terraform.tfvars` File

Copy the example and edit with your values:

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars
```

**Edit the following values:**

```hcl
# ============================================================================
# REQUIRED: Update these values
# ============================================================================

# General Configuration
project_name = "botanical-audit"
environment  = "production"
aws_region   = "ap-southeast-1"

# Existing Resources (Option 1: Data Sources)
use_existing_vpc     = true
existing_vpc_id      = "vpc-03768ea49251845c3"
existing_subnet_ids  = ["subnet-0a9aedf2d5d4793b4"]
existing_instance_id = "i-036cad13893eb6511"

# Domain Configuration
domain_name = "YOUR-DOMAIN.com"  # ⚠️ CHANGE THIS
api_subdomain = "api"
create_route53_zone = true  # Set to false if zone already exists

# Database Configuration
mongodb_connection_string = "mongodb+srv://..." # ⚠️ FROM TASK 1

# Monitoring
alarm_email = "your-email@example.com"  # ⚠️ CHANGE THIS

# Application (Optional - for Auto Scaling Group)
github_repo = ""  # Leave empty to use existing instance only
github_branch = "main"

# Storage Configuration
s3_force_destroy = false  # Set to true for dev/test
s3_versioning_enabled = true
s3_lifecycle_glacier_days = 90
s3_lifecycle_expiration_days = 2555  # ~7 years

# ============================================================================
# Optional: Advanced Configuration
# ============================================================================

# Compute (only used if github_repo is set)
ec2_instance_type = "t3.medium"
asg_min_size = 2
asg_max_size = 10
asg_desired_capacity = 2

# Backend
backend_port = 5000
nodejs_version = "18.x"

# Monitoring Thresholds
alarm_cpu_threshold = 80
alarm_memory_threshold = 85
alarm_5xx_threshold = 10
log_retention_days = 7

# CloudFront
cloudfront_price_class = "PriceClass_200"  # Asia, Europe, North America

# Security
enable_kms_encryption = true
kms_key_rotation = true
```

**Save and close the file.**

### Step 3: Initialize Terraform

```powershell
terraform init
```

Expected output:
```
Initializing modules...
Initializing the backend...
Initializing provider plugins...
Terraform has been successfully initialized!
```

### Step 4: Validate Configuration

```powershell
terraform validate
```

Expected output:
```
Success! The configuration is valid.
```

### Step 5: Format Code (Optional)

```powershell
terraform fmt -recursive
```

### Step 6: Review Execution Plan

```powershell
terraform plan -out=tfplan
```

**Review the output carefully:**
- ✅ Check resources to be created (~40-50 resources)
- ✅ Verify NO resources will be destroyed
- ✅ Confirm existing instance will be registered to ALB
- ✅ Check estimated costs (~$27-41/month for new resources)

**Example output:**
```
Plan: 45 to add, 0 to change, 0 to destroy.
```

### Step 7: Apply Configuration

```powershell
terraform apply tfplan
```

**This will:**
1. Create ALB with target group (2-3 minutes)
2. Register your existing instance to target group
3. Create 3 S3 buckets with encryption
4. Create CloudFront distribution (10-15 minutes)
5. Create Route53 hosted zone and records
6. Request ACM certificate (immediate)
7. **Wait for DNS validation** (5-30 minutes) ⏳
8. Create CloudWatch log groups, alarms, dashboard
9. Create SNS topic and email subscription

**Total deployment time: ~20-40 minutes**

---

## 🌐 DNS Configuration

### Step 1: Get Route53 Name Servers

After `terraform apply` completes, get the name servers:

```powershell
terraform output route53_name_servers
```

Example output:
```
[
  "ns-123.awsdns-12.com",
  "ns-456.awsdns-34.net",
  "ns-789.awsdns-56.org",
  "ns-012.awsdns-78.co.uk"
]
```

### Step 2: Update Domain Registrar

**Go to your domain registrar** (e.g., GoDaddy, Namecheap, Google Domains):

1. Find **DNS Settings** or **Name Servers**
2. Select **Custom Name Servers**
3. Enter all 4 Route53 name servers from above
4. Save changes

**⏳ DNS propagation time: 5 minutes to 48 hours** (usually ~1 hour)

### Step 3: Verify DNS Propagation

```powershell
# Check nameservers
nslookup -type=NS botanical-audit.com

# Check API record
nslookup api.botanical-audit.com

# Check CDN record
nslookup cdn.botanical-audit.com
```

### Step 4: Wait for ACM Certificate Validation

The ACM certificate validates automatically via DNS, but requires:
1. ✅ DNS propagation complete
2. ✅ Route53 validation records created
3. ✅ ACM to verify the records (5-30 minutes)

**Check certificate status:**
```powershell
terraform output acm_certificate_status
```

When it shows `ISSUED`, the certificate is ready! 🎉

---

## ✅ Verification

### 1. Check Infrastructure Status

```powershell
# View all outputs
terraform output

# Specific outputs
terraform output api_endpoint
terraform output cloudfront_url
terraform output alb_dns_name
terraform output dashboard_url
```

### 2. Test Health Check

```powershell
# Using ALB DNS (HTTP, before SSL)
curl http://<alb-dns-name>/health

# Using API domain (HTTPS, after SSL validated)
curl https://api.botanical-audit.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03T10:30:00Z",
  "version": "1.0.0"
}
```

### 3. Verify Target Group Health

```powershell
aws elbv2 describe-target-health `
  --target-group-arn <target-group-arn>
```

Should show:
```json
{
  "TargetHealthDescriptions": [
    {
      "Target": {
        "Id": "i-036cad13893eb6511",
        "Port": 5000
      },
      "HealthCheckPort": "5000",
      "TargetHealth": {
        "State": "healthy"
      }
    }
  ]
}
```

### 4. Check CloudWatch Dashboard

Open the dashboard URL from outputs:
```powershell
terraform output dashboard_url
```

You should see:
- ✅ ALB request/response metrics
- ✅ Target health status
- ✅ Response time graphs
- ✅ Connection counts

### 5. Confirm Email Subscription

Check your email for SNS subscription confirmation:
1. Look for email from "AWS Notifications"
2. Subject: "AWS Notification - Subscription Confirmation"
3. Click "Confirm subscription" link
4. You'll receive alarms at this email

### 6. Test S3 Buckets

```powershell
# List buckets
aws s3 ls | findstr botanical-audit

# Test upload to certificates bucket
echo "test" > test.txt
aws s3 cp test.txt s3://botanical-audit-production-certificates/test.txt
aws s3 rm s3://botanical-audit-production-certificates/test.txt
del test.txt
```

### 7. Test CloudFront CDN

Get CloudFront URL:
```powershell
terraform output cloudfront_url
```

Access in browser:
```
https://<cloudfront-id>.cloudfront.net
```

Or via custom domain (after DNS propagates):
```
https://cdn.botanical-audit.com
```

---

## 🔧 Troubleshooting

### Issue: "terraform init" fails

**Error**: `Failed to query available provider packages`

**Solution**:
```powershell
# Clear Terraform cache
Remove-Item -Recurse -Force .terraform

# Re-initialize
terraform init
```

### Issue: "Invalid provider configuration"

**Error**: `Error: Insufficient authentication credentials`

**Solution**:
```powershell
# Reconfigure AWS CLI
aws configure

# Verify credentials
aws sts get-caller-identity
```

### Issue: ACM certificate stuck in "Pending Validation"

**Possible causes:**
1. DNS not propagated yet - **Wait longer** (up to 48 hours)
2. Route53 not authoritative - **Check nameserver delegation**
3. Validation records not created - **Check Route53 records**

**Check validation records:**
```powershell
aws route53 list-resource-record-sets `
  --hosted-zone-id <zone-id> `
  --query "ResourceRecordSets[?Type=='CNAME']"
```

**Force recreation:**
```powershell
terraform taint module.networking.aws_acm_certificate_validation.api
terraform apply
```

### Issue: Target showing unhealthy

**Possible causes:**
1. Application not responding on port 5000
2. Health check path `/health` not implemented
3. Security group blocking ALB → Instance traffic

**Check instance logs:**
```powershell
# SSH to instance
ssh -i your-key.pem ubuntu@47.130.0.164

# Check if app is running
sudo pm2 status

# Check app logs
sudo pm2 logs

# Test local health check
curl http://localhost:5000/health
```

**Check security group:**
```powershell
aws ec2 describe-instances `
  --instance-ids i-036cad13893eb6511 `
  --query "Reservations[0].Instances[0].SecurityGroups"
```

Ensure backend security group allows:
- ✅ Inbound: Port 5000 from ALB security group

### Issue: "Error creating S3 bucket: BucketAlreadyExists"

**Error**: Bucket name is globally unique and taken

**Solution**:
Change `project_name` in `terraform.tfvars`:
```hcl
project_name = "botanical-audit-xyz"  # Add unique suffix
```

### Issue: 403 Forbidden on CloudFront

**Cause**: No content in S3 bucket yet

**Solution**: Upload a test file:
```powershell
echo "<h1>Hello CDN</h1>" > index.html
aws s3 cp index.html s3://botanical-audit-production-photos/index.html
```

### Issue: High costs

**Check current spending:**
```powershell
# Use AWS Cost Explorer in console
# Or estimate with terraform:
terraform output estimated_monthly_cost
```

**Cost optimization:**
1. Use single NAT gateway (if you created VPC)
2. Use `PriceClass_100` for CloudFront (North America + Europe only)
3. Set aggressive S3 lifecycle policies
4. Use Reserved Instances for EC2 (not applicable with existing instance)

---

## 📊 Expected Monthly Costs

With **existing EC2 instance**:

| Service | Monthly Cost |
|---------|--------------|
| ALB | $16-20 |
| S3 + Storage | $5-10 |
| CloudFront | $5-10 (usage-based) |
| Route53 | $0.50/zone |
| ACM Certificate | **FREE** |
| CloudWatch | $5-10 |
| KMS | $1/key |
| **Total NEW costs** | **~$27-41** |

**Note**: Your existing EC2 costs remain the same.

---

## 🎯 Next Steps

After successful deployment:

1. ✅ **Update Application Environment**
   - Add `ALB_DNS_NAME` to your app config
   - Update `ALLOWED_HOSTS` to include API domain
   - Configure CORS for API domain

2. ✅ **Implement Health Check Endpoint**
   ```javascript
   // In your Express app
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version
     });
   });
   ```

3. ✅ **Configure Application Logging**
   - Install CloudWatch agent (already in user_data script)
   - Send logs to `/aws/ec2/botanical-audit-production`

4. ✅ **Test End-to-End**
   - Upload certificate to S3
   - Upload photo to S3
   - Access via CloudFront CDN
   - Trigger an alarm (manually)
   - Verify email notification

5. ✅ **Set up CI/CD** (Optional)
   - Use GitHub Actions to deploy
   - Auto-update AMI and roll instances
   - Blue/green deployments

6. ✅ **Enable Auto Scaling** (Optional)
   - Set `github_repo` in terraform.tfvars
   - Apply changes
   - Scale beyond single instance

---

## 🆘 Need Help?

- **Terraform Issues**: [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- **AWS CLI Issues**: [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- **DNS Issues**: [Route53 Troubleshooting](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/troubleshooting.html)
- **SSL Issues**: [ACM Certificate Validation](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html)

---

## 🎉 Success!

Your infrastructure is deployed! Access your API at:

**https://api.botanical-audit.com**

View monitoring dashboard:
```powershell
terraform output dashboard_url | Invoke-Expression
```

Happy coding! 🚀🌿
