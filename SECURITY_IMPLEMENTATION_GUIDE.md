# Security Implementation Guide

## Phase 1: AWS Secrets Manager Integration

### Step 1: Install Dependencies

```bash
cd apps/backend
npm install @aws-sdk/client-secrets-manager
```

### Step 2: Configure AWS Credentials

**Option A: AWS CLI (Recommended for local development)**

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: ap-southeast-1
```

**Option B: Environment Variables**

```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=ap-southeast-1
```

### Step 3: Deploy Secrets to AWS

```bash
cd infrastructure/aws

# Initialize Terraform
terraform init

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual secrets

# Plan deployment
terraform plan

# Deploy secrets
terraform apply
```

### Step 4: Update Backend Configuration

Edit `apps/backend/.env`:

```bash
NODE_ENV=production
USE_AWS_SECRETS=true
AWS_REGION=ap-southeast-1
AWS_SECRET_NAME=gacp-platform/production
```

### Step 5: Test Secrets Loading

```bash
cd apps/backend
node atlas-server.js
```

Expected output:

```
🔐 Loading secrets from AWS Secrets Manager...
✅ Secrets loaded successfully
✅ Environment validation passed
```

## Phase 2: Fix Hardcoded Secrets

### Automated Fix

```bash
# Scan for hardcoded secrets
node scripts/security/secrets-audit.js

# Fix production files
node scripts/security/fix-secrets.js apps/backend

# Review changes
git diff
```

### Manual Review Required

Files that need manual review:

1. `apps/backend/shared/auth.js` - JWT secret references
2. `apps/backend/config/config-manager.js` - Database URIs
3. `apps/backend/routes/auth.js` - Authentication logic

### Test Files

Test files can keep hardcoded values but should use fixtures:

```javascript
// ❌ Bad
const JWT_SECRET = 'hardcoded-secret';

// ✅ Good
const JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-for-ci';
```

## Phase 3: Environment-Specific Configuration

### Development (.env.development)

```bash
NODE_ENV=development
USE_AWS_SECRETS=false
FARMER_JWT_SECRET=dev-farmer-secret
DTAM_JWT_SECRET=dev-dtam-secret
MONGODB_URI=mongodb://localhost:27017/gacp-dev
```

### Staging (.env.staging)

```bash
NODE_ENV=staging
USE_AWS_SECRETS=true
AWS_SECRET_NAME=gacp-platform/staging
```

### Production (.env.production)

```bash
NODE_ENV=production
USE_AWS_SECRETS=true
AWS_SECRET_NAME=gacp-platform/production
```

## Phase 4: Docker Integration

### Dockerfile with Secrets

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# AWS credentials will be provided via ECS task role
ENV USE_AWS_SECRETS=true
ENV AWS_REGION=ap-southeast-1

CMD ["node", "atlas-server.js"]
```

### ECS Task Definition

```json
{
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/gacp-ecs-task-role",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/gacp-ecs-execution-role",
  "containerDefinitions": [
    {
      "name": "gacp-backend",
      "image": "ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest",
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "USE_AWS_SECRETS", "value": "true" },
        { "name": "AWS_REGION", "value": "ap-southeast-1" },
        { "name": "AWS_SECRET_NAME", "value": "gacp-platform/production" }
      ]
    }
  ]
}
```

## Security Checklist

### Pre-Deployment

- [ ] All hardcoded secrets removed from production code
- [ ] AWS Secrets Manager configured
- [ ] Environment variables validated
- [ ] Test files use fixtures
- [ ] .env files added to .gitignore
- [ ] Secrets rotation policy defined

### Post-Deployment

- [ ] Secrets loading tested in staging
- [ ] Application starts successfully
- [ ] Authentication works correctly
- [ ] Database connections established
- [ ] External services (email, SMS) functional
- [ ] Monitoring alerts configured

## Troubleshooting

### Secrets Not Loading

**Error:** `Failed to load secrets from AWS`

**Solutions:**

1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify IAM permissions for Secrets Manager
3. Confirm secret name matches: `gacp-platform/production`
4. Check AWS region configuration

### Environment Validation Failed

**Error:** `Missing required environment variables`

**Solutions:**

1. Verify secrets are loaded: Check logs for "✅ Secrets loaded"
2. Ensure all required secrets exist in AWS Secrets Manager
3. Check secret JSON structure matches expected format

### Database Connection Failed

**Error:** `MongoDB connection failed`

**Solutions:**

1. Verify MONGODB_URI is loaded correctly
2. Check MongoDB Atlas IP whitelist
3. Confirm database credentials are valid

## Best Practices

### Secret Rotation

Rotate secrets every 90 days:

```bash
# Generate new secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Update in AWS
aws secretsmanager update-secret \
  --secret-id gacp-platform/production \
  --secret-string "{\"FARMER_JWT_SECRET\":\"$NEW_SECRET\"}"

# Restart application
kubectl rollout restart deployment/gacp-backend
```

### Monitoring

Set up CloudWatch alarms:

- Failed secret retrieval attempts
- Unauthorized access attempts
- Secret rotation failures

### Audit Logging

Enable AWS CloudTrail for Secrets Manager:

- Track who accessed secrets
- Monitor secret modifications
- Alert on suspicious activity

## Next Steps

1. Complete Phase 1 (AWS Secrets Manager)
2. Run security audit and fix findings
3. Test in staging environment
4. Deploy to production
5. Set up monitoring and alerts
6. Document incident response procedures

## Support

For issues or questions:

- Check logs: `tail -f apps/backend/logs/combined.log`
- Review AWS CloudWatch logs
- Contact DevOps team
