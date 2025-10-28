# GACP Platform - AWS Infrastructure

## Overview

Complete Terraform configuration for deploying GACP Platform to AWS.

## Architecture

- **VPC:** 10.0.0.0/16 with public and private subnets across 2 AZs
- **ECS Fargate:** Container orchestration for backend services
- **ALB:** Application Load Balancer with HTTPS
- **ElastiCache:** Redis for caching and sessions
- **S3:** Document storage with encryption and lifecycle policies
- **Secrets Manager:** Secure secret storage
- **CloudWatch:** Logging and monitoring

## Prerequisites

1. AWS CLI configured
2. Terraform >= 1.0 installed
3. SSL certificate in ACM
4. MongoDB Atlas cluster (external)

## Quick Start

```bash
# 1. Initialize Terraform
terraform init

# 2. Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 3. Plan deployment
terraform plan

# 4. Deploy infrastructure
terraform apply

# 5. Get outputs
terraform output
```

## Configuration

### Required Variables

Edit `terraform.tfvars`:

```hcl
# AWS Configuration
aws_region  = "ap-southeast-1"
environment = "production"

# SSL Certificate (from ACM)
ssl_certificate_arn = "arn:aws:acm:ap-southeast-1:ACCOUNT:certificate/ID"

# Secrets
farmer_jwt_secret  = "your-generated-secret"
dtam_jwt_secret    = "your-generated-secret"
mongodb_uri        = "mongodb+srv://..."
redis_url          = "redis://..."
smtp_password      = "your-smtp-password"
sms_api_key        = "your-sms-key"
line_notify_token  = "your-line-token"
payment_secret_key = "your-payment-key"
```

### Optional Variables

```hcl
# ECS Configuration
backend_cpu            = "512"   # CPU units
backend_memory         = "1024"  # MB
backend_desired_count  = 2       # Number of tasks
backend_min_count      = 2       # Min for auto-scaling
backend_max_count      = 10      # Max for auto-scaling

# Redis Configuration
redis_node_type = "cache.t3.micro"
redis_num_nodes = 2  # For high availability
```

## Deployment Steps

### 1. Create S3 Backend (One-time)

```bash
aws s3 mb s3://gacp-terraform-state --region ap-southeast-1
aws s3api put-bucket-versioning \
  --bucket gacp-terraform-state \
  --versioning-configuration Status=Enabled
```

### 2. Request SSL Certificate

```bash
aws acm request-certificate \
  --domain-name gacp-platform.com \
  --subject-alternative-names "*.gacp-platform.com" \
  --validation-method DNS \
  --region ap-southeast-1
```

### 3. Deploy Infrastructure

```bash
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### 4. Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name gacp-backend --region ap-southeast-1

# Build and push
cd ../../apps/backend
docker build -t gacp-backend .
docker tag gacp-backend:latest ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest
docker push ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest
```

### 5. Update ECS Service

```bash
aws ecs update-service \
  --cluster gacp-cluster-production \
  --service gacp-backend \
  --force-new-deployment \
  --region ap-southeast-1
```

## Monitoring

### CloudWatch Logs

```bash
aws logs tail /ecs/gacp-backend --follow --region ap-southeast-1
```

### ECS Service Status

```bash
aws ecs describe-services \
  --cluster gacp-cluster-production \
  --services gacp-backend \
  --region ap-southeast-1
```

### ALB Health

```bash
aws elbv2 describe-target-health \
  --target-group-arn $(terraform output -raw target_group_arn) \
  --region ap-southeast-1
```

## Scaling

### Manual Scaling

```bash
aws ecs update-service \
  --cluster gacp-cluster-production \
  --service gacp-backend \
  --desired-count 5 \
  --region ap-southeast-1
```

### Auto-scaling

Auto-scaling is configured to:
- Scale up when CPU > 70%
- Scale down when CPU < 30%
- Min: 2 tasks
- Max: 10 tasks

## Cost Estimation

### Monthly Costs (Production)

- **ECS Fargate:** ~$50-100 (2-4 tasks)
- **ALB:** ~$20
- **ElastiCache:** ~$30 (t3.micro x2)
- **S3:** ~$5-20 (depends on usage)
- **Secrets Manager:** ~$1
- **CloudWatch:** ~$5-10
- **Data Transfer:** ~$10-50

**Total:** ~$120-250/month

### Cost Optimization

1. Use Savings Plans for ECS
2. Enable S3 lifecycle policies
3. Use CloudWatch Logs retention
4. Right-size ECS tasks
5. Use spot instances for non-critical workloads

## Security

### Network Security

- Private subnets for ECS tasks
- Security groups restrict traffic
- NAT Gateway for outbound traffic
- No direct internet access to containers

### Data Security

- Secrets in AWS Secrets Manager
- S3 encryption at rest
- Redis encryption in transit
- SSL/TLS for all connections

### Access Control

- IAM roles for ECS tasks
- Least privilege policies
- No hardcoded credentials
- CloudTrail audit logging

## Troubleshooting

### ECS Tasks Not Starting

```bash
# Check task logs
aws ecs describe-tasks \
  --cluster gacp-cluster-production \
  --tasks TASK_ID \
  --region ap-southeast-1

# Check CloudWatch logs
aws logs tail /ecs/gacp-backend --follow
```

### ALB Health Checks Failing

```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn TG_ARN

# Test health endpoint
curl http://ALB_DNS/health
```

### Secrets Not Loading

```bash
# Verify secrets exist
aws secretsmanager get-secret-value \
  --secret-id gacp-platform/production \
  --region ap-southeast-1

# Check IAM permissions
aws iam get-role-policy \
  --role-name gacp-ecs-task-role \
  --policy-name secrets-access
```

## Disaster Recovery

### Backup Strategy

- **MongoDB:** Atlas automated backups
- **Redis:** Daily snapshots (5-day retention)
- **S3:** Versioning enabled
- **Terraform State:** S3 versioning enabled

### Recovery Procedure

1. Restore MongoDB from Atlas backup
2. Restore Redis from snapshot
3. Redeploy infrastructure: `terraform apply`
4. Verify all services healthy

## Maintenance

### Update Infrastructure

```bash
# Update Terraform code
git pull

# Plan changes
terraform plan

# Apply changes
terraform apply
```

### Update Application

```bash
# Build new image
docker build -t gacp-backend:v2 .

# Push to ECR
docker push ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:v2

# Update task definition and service
aws ecs update-service --force-new-deployment ...
```

### Rotate Secrets

```bash
# Generate new secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Update in Secrets Manager
aws secretsmanager update-secret \
  --secret-id gacp-platform/production \
  --secret-string "{\"FARMER_JWT_SECRET\":\"$NEW_SECRET\"}"

# Restart ECS service
aws ecs update-service --force-new-deployment ...
```

## Cleanup

```bash
# Destroy all infrastructure
terraform destroy

# Delete ECR images
aws ecr batch-delete-image \
  --repository-name gacp-backend \
  --image-ids imageTag=latest
```

## Support

For issues:
1. Check CloudWatch logs
2. Review ECS task status
3. Verify security group rules
4. Check IAM permissions
5. Contact DevOps team
