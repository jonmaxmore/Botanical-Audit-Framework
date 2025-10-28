# GACP Platform - Complete Setup Instructions

**Region:** ap-southeast-1 (Singapore)  
**Environment:** Production

---

## Step-by-Step Setup

### 1. Install Prerequisites

```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Configure AWS

```bash
aws configure
# AWS Access Key ID: [YOUR_KEY]
# AWS Secret Access Key: [YOUR_SECRET]
# Default region name: ap-southeast-1
# Default output format: json

# Verify
aws sts get-caller-identity
```

### 3. Generate Secrets

```bash
cd Botanical-Audit-Framework
node scripts/security/generate-secrets.js
```

**Save the output securely!**

### 4. Configure Terraform Variables

```bash
cd infrastructure/aws
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
```

**Edit terraform.tfvars:**
```hcl
aws_region = "ap-southeast-1"
environment = "production"

# SSL Certificate (get from ACM first)
ssl_certificate_arn = "arn:aws:acm:ap-southeast-1:ACCOUNT:certificate/ID"

# Paste secrets from step 3
farmer_jwt_secret = "..."
dtam_jwt_secret = "..."
mongodb_uri = "mongodb+srv://..."
redis_url = "redis://..."
smtp_password = "..."
sms_api_key = "..."
line_notify_token = "..."
payment_secret_key = "..."
```

### 5. Request SSL Certificate

```bash
aws acm request-certificate \
  --domain-name gacp-platform.com \
  --subject-alternative-names "*.gacp-platform.com" \
  --validation-method DNS \
  --region ap-southeast-1

# Get certificate ARN
aws acm list-certificates --region ap-southeast-1

# Add ARN to terraform.tfvars
```

### 6. Deploy Infrastructure

```bash
# Make scripts executable
chmod +x ../../scripts/deploy/setup-infrastructure.sh
chmod +x ../../scripts/deploy/deploy-aws.sh

# Run infrastructure setup
bash ../../scripts/deploy/setup-infrastructure.sh
```

**This will:**
- Initialize Terraform
- Create ECR repository
- Deploy AWS Secrets Manager
- Create VPC and networking
- Create ECS cluster
- Create ALB
- Create Redis cluster
- Create S3 bucket

**Time:** ~10-15 minutes

### 7. Deploy Backend Application

```bash
# Deploy backend to ECS
bash ../../scripts/deploy/deploy-aws.sh
```

**This will:**
- Build Docker image
- Push to ECR
- Deploy to ECS
- Update service

**Time:** ~5-10 minutes

### 8. Configure MongoDB Atlas

```bash
# Get NAT Gateway IP
aws ec2 describe-nat-gateways \
  --filter "Name=tag:Name,Values=gacp-nat" \
  --query 'NatGateways[0].NatGatewayAddresses[0].PublicIp' \
  --output text \
  --region ap-southeast-1
```

**Add this IP to MongoDB Atlas whitelist**

### 9. Verify Deployment

```bash
# Get ALB DNS
cd infrastructure/aws
terraform output alb_dns_name

# Test health endpoint
curl http://ALB_DNS/health

# Expected response:
# {"status":"OK","timestamp":"...","database":{"status":"connected"}}

# Check ECS service
aws ecs describe-services \
  --cluster gacp-cluster-production \
  --services gacp-backend \
  --region ap-southeast-1

# View logs
aws logs tail /ecs/gacp-backend --follow --region ap-southeast-1
```

---

## Configuration Summary

### AWS Resources Created

| Resource | Name | Purpose |
|----------|------|---------|
| VPC | gacp-vpc-production | Network isolation |
| Subnets | gacp-public-1/2, gacp-private-1/2 | Multi-AZ deployment |
| NAT Gateway | gacp-nat | Outbound internet |
| ECS Cluster | gacp-cluster-production | Container orchestration |
| ALB | gacp-alb | Load balancing |
| Redis | gacp-redis | Caching & sessions |
| S3 | gacp-documents-production | Document storage |
| Secrets Manager | gacp-platform/production | Secret storage |

### Estimated Monthly Cost

- **ECS Fargate:** $50-100 (2-4 tasks)
- **ALB:** $20
- **ElastiCache:** $30 (t3.micro x2)
- **S3:** $5-20
- **NAT Gateway:** $30-50
- **Other:** $10-20

**Total:** ~$150-250/month

---

## Troubleshooting

### Issue: Terraform Init Fails

```bash
# Create S3 backend bucket first
aws s3 mb s3://gacp-terraform-state --region ap-southeast-1
aws s3api put-bucket-versioning \
  --bucket gacp-terraform-state \
  --versioning-configuration Status=Enabled
```

### Issue: ECS Tasks Not Starting

```bash
# Check task logs
aws ecs list-tasks --cluster gacp-cluster-production --region ap-southeast-1
aws ecs describe-tasks --cluster gacp-cluster-production --tasks TASK_ARN --region ap-southeast-1

# Common causes:
# 1. Secrets not accessible
# 2. MongoDB connection failed
# 3. Image pull failed
```

### Issue: Health Check Failing

```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn $(terraform output -raw target_group_arn) \
  --region ap-southeast-1

# Test directly
curl http://TASK_IP:3000/health
```

### Issue: Cannot Access ALB

```bash
# Check security groups
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=gacp-alb-sg" \
  --region ap-southeast-1

# Ensure ports 80 and 443 are open
```

---

## Post-Deployment Checklist

- [ ] Infrastructure deployed successfully
- [ ] Backend running on ECS (2+ tasks)
- [ ] Health checks passing
- [ ] MongoDB Atlas connected
- [ ] Redis accessible
- [ ] S3 bucket created
- [ ] Secrets loading correctly
- [ ] ALB responding to requests
- [ ] Logs visible in CloudWatch
- [ ] Auto-scaling configured

---

## Next Steps

### Week 2: Portal Completion
1. Complete admin portal
2. Complete certificate portal
3. Integration testing

### Week 3: Testing
1. E2E tests
2. Load testing
3. Security testing

### Week 4: Production Launch
1. Final review
2. Production deployment
3. Monitoring setup

---

## Support

**Documentation:** See AWS_DEPLOYMENT_GUIDE.md  
**Logs:** `aws logs tail /ecs/gacp-backend --follow`  
**Status:** `aws ecs describe-services --cluster gacp-cluster-production --services gacp-backend`

---

**Region:** ap-southeast-1 (Singapore)  
**Last Updated:** 2025-01-XX  
**Status:** Ready for deployment
