# Quick Deploy Guide

## Prerequisites

```bash
# Install AWS CLI
aws --version

# Install Terraform
terraform --version

# Install Docker
docker --version

# Configure AWS
aws configure
```

## Step 1: Generate Secrets

```bash
node scripts/security/generate-secrets.js > secrets.txt
```

## Step 2: Configure Terraform

```bash
cd infrastructure/aws
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Add your secrets
```

## Step 3: Deploy Infrastructure

```bash
chmod +x ../../scripts/deploy/setup-infrastructure.sh
../../scripts/deploy/setup-infrastructure.sh
```

## Step 4: Deploy Backend

```bash
chmod +x ../../scripts/deploy/deploy-aws.sh
../../scripts/deploy/deploy-aws.sh
```

## Step 5: Verify

```bash
# Get ALB DNS
terraform output alb_dns_name

# Test health
curl http://ALB_DNS/health

# Check logs
aws logs tail /ecs/gacp-backend --follow
```

## Troubleshooting

**ECS tasks not starting:**
```bash
aws ecs describe-tasks --cluster gacp-cluster-production --tasks TASK_ID
```

**Secrets not loading:**
```bash
aws secretsmanager get-secret-value --secret-id gacp-platform/production
```

**Health check failing:**
```bash
aws elbv2 describe-target-health --target-group-arn TG_ARN
```
