# Terraform Deployment - Step by Step

## Prerequisites Setup

### 1. Install AWS CLI
```powershell
# Download and install
https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation
aws --version
```

### 2. Install Terraform
```powershell
# Download from
https://www.terraform.io/downloads

# Or use Chocolatey
choco install terraform

# Verify
terraform --version
```

### 3. Configure AWS Credentials
```bash
aws configure

# Enter:
AWS Access Key ID: [YOUR_KEY]
AWS Secret Access Key: [YOUR_SECRET]
Default region name: ap-southeast-1
Default output format: json
```

---

## Deployment Steps

### Step 1: Generate JWT Secrets
```bash
cd apps/backend

# Generate secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Save these for terraform.tfvars
```

### Step 2: Get AWS Account ID
```bash
aws sts get-caller-identity --query Account --output text
```

### Step 3: Create ECR Repository
```bash
aws ecr create-repository --repository-name gacp-backend --region ap-southeast-1
```

### Step 4: Build Docker Image
```bash
cd apps/backend

# Build
docker build -t gacp-backend .

# Test locally
docker run -p 3000:3000 -e MONGODB_URI="mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform" gacp-backend

# Test health
curl http://localhost:3000/health
```

### Step 5: Push to ECR
```bash
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com

# Tag
docker tag gacp-backend:latest [ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest

# Push
docker push [ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest
```

### Step 6: Configure Terraform
```bash
cd ../../infrastructure/aws

# Copy example
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
```

**terraform.tfvars:**
```hcl
aws_region  = "ap-southeast-1"
environment = "production"

# MongoDB
mongodb_uri = "mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp"

# JWT Secrets (from Step 1)
farmer_jwt_secret = "YOUR_GENERATED_SECRET_1"
dtam_jwt_secret   = "YOUR_GENERATED_SECRET_2"

# ECR Image (from Step 2)
backend_image = "[ACCOUNT_ID].dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest"

# ECS Config
backend_cpu           = "512"
backend_memory        = "1024"
backend_desired_count = 2
```

### Step 7: Deploy with Terraform
```bash
# Initialize
terraform init

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan
```

### Step 8: Get Outputs
```bash
terraform output

# Save ALB DNS name
terraform output -raw alb_dns_name
```

### Step 9: Test Deployment
```bash
# Get ALB DNS
ALB_DNS=$(terraform output -raw alb_dns_name)

# Test health
curl http://$ALB_DNS/health

# Test API
curl http://$ALB_DNS/api
```

---

## Quick Commands

```bash
# View logs
aws logs tail /ecs/gacp-backend --follow --region ap-southeast-1

# Check ECS service
aws ecs describe-services --cluster gacp-cluster-production --services gacp-backend --region ap-southeast-1

# Update deployment
aws ecs update-service --cluster gacp-cluster-production --service gacp-backend --force-new-deployment --region ap-southeast-1

# Destroy everything
terraform destroy -auto-approve
```

---

## Estimated Time
- Prerequisites: 10 min
- Docker build: 5 min
- Terraform deploy: 10-15 min
- **Total: 25-30 min**

## Estimated Cost
- **$50-80/month** (with Free Tier)
- **$107-127/month** (after Free Tier)
