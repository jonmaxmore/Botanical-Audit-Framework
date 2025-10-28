# AWS Deployment Guide - GACP Platform

## 🚀 Complete Deployment Workflow

### Phase 1: AWS Account Setup (Day 1)

#### 1.1 Install Required Tools

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

#### 1.2 Configure AWS Credentials

```bash
aws configure
# AWS Access Key ID: YOUR_KEY
# AWS Secret Access Key: YOUR_SECRET
# Default region: ap-southeast-1
# Default output format: json

# Verify
aws sts get-caller-identity
```

### Phase 2: Generate Secrets (Day 1)

```bash
cd scripts/security
node generate-secrets.js > secrets.txt

# Save output securely - DO NOT COMMIT
```

### Phase 3: Deploy Secrets Manager (Day 2)

```bash
cd infrastructure/aws

# Initialize Terraform
terraform init

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Add your secrets

# Deploy secrets only
terraform apply -target=aws_secretsmanager_secret.gacp_production
terraform apply -target=aws_secretsmanager_secret_version.gacp_production_version
```

### Phase 4: Request SSL Certificate (Day 2)

```bash
# Request certificate
aws acm request-certificate \
  --domain-name gacp-platform.com \
  --subject-alternative-names "*.gacp-platform.com" \
  --validation-method DNS \
  --region ap-southeast-1

# Get certificate ARN
aws acm list-certificates --region ap-southeast-1

# Add ARN to terraform.tfvars
echo 'ssl_certificate_arn = "arn:aws:acm:..."' >> terraform.tfvars
```

### Phase 5: Deploy Infrastructure (Day 3)

```bash
cd infrastructure/aws

# Create S3 backend for Terraform state
aws s3 mb s3://gacp-terraform-state --region ap-southeast-1
aws s3api put-bucket-versioning \
  --bucket gacp-terraform-state \
  --versioning-configuration Status=Enabled

# Plan deployment
terraform plan -out=tfplan

# Review plan carefully
terraform show tfplan

# Deploy
terraform apply tfplan

# Save outputs
terraform output > outputs.txt
```

### Phase 6: Build and Deploy Backend (Day 4)

#### 6.1 Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name gacp-backend \
  --region ap-southeast-1
```

#### 6.2 Build Docker Image

```bash
cd apps/backend

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV USE_AWS_SECRETS=true

EXPOSE 3000

CMD ["node", "atlas-server.js"]
EOF

# Build
docker build -t gacp-backend .
```

#### 6.3 Push to ECR

```bash
# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  $ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Tag and push
docker tag gacp-backend:latest \
  $ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest

docker push $ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest
```

#### 6.4 Deploy ECS Service

```bash
# Service will auto-deploy from task definition
# Force new deployment if needed
aws ecs update-service \
  --cluster gacp-cluster-production \
  --service gacp-backend \
  --force-new-deployment \
  --region ap-southeast-1
```

### Phase 7: Verify Deployment (Day 4)

#### 7.1 Check ECS Service

```bash
aws ecs describe-services \
  --cluster gacp-cluster-production \
  --services gacp-backend \
  --region ap-southeast-1 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

#### 7.2 Check ALB Health

```bash
# Get ALB DNS
ALB_DNS=$(terraform output -raw alb_dns_name)

# Test health endpoint
curl http://$ALB_DNS/health

# Expected response:
# {"status":"OK","timestamp":"...","database":{"status":"connected"}}
```

#### 7.3 Check Logs

```bash
aws logs tail /ecs/gacp-backend --follow --region ap-southeast-1
```

### Phase 8: Configure MongoDB Atlas (Day 5)

#### 8.1 Whitelist AWS IPs

```bash
# Get NAT Gateway IP
NAT_IP=$(aws ec2 describe-nat-gateways \
  --filter "Name=tag:Name,Values=gacp-nat" \
  --query 'NatGateways[0].NatGatewayAddresses[0].PublicIp' \
  --output text)

echo "Add this IP to MongoDB Atlas whitelist: $NAT_IP"
```

#### 8.2 Update Connection String

In MongoDB Atlas:
1. Go to Database Access → Add IP Address
2. Add NAT Gateway IP
3. Copy connection string
4. Update in AWS Secrets Manager

```bash
# Update MongoDB URI in secrets
aws secretsmanager update-secret \
  --secret-id gacp-platform/production \
  --secret-string file://updated-secrets.json
```

### Phase 9: Deploy Frontend (Day 6)

#### 9.1 Build Frontend Apps

```bash
# Farmer Portal
cd apps/farmer-portal
npm run build

# Admin Portal
cd ../admin-portal
npm run build

# Certificate Portal
cd ../certificate-portal
npm run build
```

#### 9.2 Deploy to S3 + CloudFront (Optional)

```bash
# Create S3 bucket for frontend
aws s3 mb s3://gacp-frontend-production

# Upload build
aws s3 sync apps/farmer-portal/out s3://gacp-frontend-production/farmer --delete

# Create CloudFront distribution (manual or Terraform)
```

### Phase 10: Final Testing (Day 7)

#### 10.1 Smoke Tests

```bash
# Health check
curl https://api.gacp-platform.com/health

# Authentication
curl -X POST https://api.gacp-platform.com/api/auth-farmer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Database connectivity
curl https://api.gacp-platform.com/api/db/test
```

#### 10.2 Load Testing

```bash
cd load-tests
artillery run load-test.yml
```

## 📊 Post-Deployment Checklist

### Security
- [ ] All secrets in AWS Secrets Manager
- [ ] No hardcoded credentials in code
- [ ] SSL certificate configured
- [ ] Security groups properly configured
- [ ] IAM roles follow least privilege
- [ ] CloudTrail enabled

### Monitoring
- [ ] CloudWatch alarms configured
- [ ] Log aggregation working
- [ ] Health checks passing
- [ ] Auto-scaling configured
- [ ] Backup strategy in place

### Performance
- [ ] API response time < 200ms
- [ ] Page load time < 2s
- [ ] Database queries optimized
- [ ] CDN configured for static assets
- [ ] Caching enabled

### Documentation
- [ ] Deployment runbook updated
- [ ] Architecture diagrams current
- [ ] API documentation published
- [ ] Troubleshooting guide available
- [ ] Incident response plan documented

## 🔧 Common Issues & Solutions

### Issue: ECS Tasks Failing to Start

**Symptoms:** Tasks start then immediately stop

**Solutions:**
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster gacp-cluster-production \
  --tasks $(aws ecs list-tasks --cluster gacp-cluster-production --query 'taskArns[0]' --output text)

# Common causes:
# 1. Secrets not accessible → Check IAM permissions
# 2. MongoDB connection failed → Check whitelist
# 3. Port conflict → Check task definition
```

### Issue: ALB Health Checks Failing

**Symptoms:** Targets marked unhealthy

**Solutions:**
```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn $(terraform output -raw target_group_arn)

# Test health endpoint directly
curl http://TASK_IP:3000/health

# Common causes:
# 1. Health endpoint not responding → Check application logs
# 2. Security group blocking traffic → Check SG rules
# 3. Application startup slow → Increase health check grace period
```

### Issue: Secrets Not Loading

**Symptoms:** Application fails with "Missing required environment variables"

**Solutions:**
```bash
# Verify secrets exist
aws secretsmanager get-secret-value \
  --secret-id gacp-platform/production

# Check IAM permissions
aws iam simulate-principal-policy \
  --policy-source-arn $(aws iam get-role --role-name gacp-ecs-task-role --query 'Role.Arn' --output text) \
  --action-names secretsmanager:GetSecretValue

# Common causes:
# 1. Wrong secret name → Check AWS_SECRET_NAME env var
# 2. IAM permissions missing → Attach secrets policy to task role
# 3. Region mismatch → Check AWS_REGION env var
```

## 💰 Cost Optimization

### Development Environment

```hcl
# terraform.tfvars for dev
backend_desired_count = 1
backend_min_count     = 1
backend_max_count     = 2
redis_node_type       = "cache.t3.micro"
redis_num_nodes       = 1
```

**Estimated cost:** ~$50-80/month

### Production Environment

```hcl
# terraform.tfvars for production
backend_desired_count = 2
backend_min_count     = 2
backend_max_count     = 10
redis_node_type       = "cache.t3.small"
redis_num_nodes       = 2
```

**Estimated cost:** ~$150-300/month

## 🔄 CI/CD Pipeline (Next Phase)

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
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
      
      - name: Build and push Docker image
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker build -t gacp-backend .
          docker push $ECR_REGISTRY/gacp-backend:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster gacp-cluster-production --service gacp-backend --force-new-deployment
```

## 📞 Support

**Emergency Contact:** DevOps Team  
**Slack Channel:** #gacp-platform-ops  
**Documentation:** https://docs.gacp-platform.com  
**Status Page:** https://status.gacp-platform.com

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0  
**Maintained By:** GACP Platform Team
