# Staging Deployment Configuration Guide

This document explains how to configure GitHub Secrets and deploy to staging environment.

## Required GitHub Secrets

Navigate to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. SSH Authentication

**Secret Name**: `STAGING_SSH_KEY`
**Description**: Private SSH key for staging server access (no passphrase)
**How to generate**:

```bash
# Generate SSH key pair (without passphrase for CI/CD)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/staging_deploy_key -N ""

# Copy private key content for GitHub Secret
cat ~/.ssh/staging_deploy_key

# Add public key to staging server
ssh-copy-id -i ~/.ssh/staging_deploy_key.pub deploy@your-staging-server.com
```

**Value**: Paste the entire private key content including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`

---

### 2. Staging Host

**Secret Name**: `STAGING_HOST`
**Description**: IP address or domain of staging server
**Example Values**:
- `staging.botanicalaudit.com`
- `13.214.217.1`
- `staging-api.example.com`

---

### 3. Staging User

**Secret Name**: `STAGING_USER`
**Description**: SSH username for deployment
**Common Values**:
- `deploy`
- `ubuntu`
- `ec2-user`
- `root` (not recommended)

---

### 4. Staging Path

**Secret Name**: `STAGING_PATH`
**Description**: Absolute path to deployment directory on staging server
**Example Values**:
- `/var/www/botanical-audit`
- `/home/deploy/apps/gacp-backend`
- `/opt/botanical/api`

**Requirements**:
- User must have write permissions
- Directory should exist (or parent directory writable)
- PM2 or equivalent process manager installed

---

### 5. Environment Variables (Application Secrets)

These are set on the staging server itself in `.env` file or environment:

**Required Secrets**:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/botanical_staging
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate with: openssl rand -hex 64)
JWT_SECRET=<64-character-hex-string>
FARMER_JWT_SECRET=<64-character-hex-string>
DTAM_JWT_SECRET=<64-character-hex-string>

# Environment
NODE_ENV=production
PORT=5000

# AWS (if using Secrets Manager)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
```

**Setup on staging server**:

```bash
# SSH into staging server
ssh deploy@your-staging-server.com

# Navigate to app directory
cd /var/www/botanical-audit

# Create .env file
nano .env
# Paste the environment variables above

# Secure the file
chmod 600 .env
chown deploy:deploy .env
```

---

## Staging Server Setup

### Prerequisites

1. **Node.js 22+** installed
2. **pnpm** package manager
3. **PM2** process manager
4. **MongoDB** connection (Atlas or local)
5. **Redis** (optional, for queues)

### Initial Setup Script

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Create deploy user (if not exists)
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy

# Create deployment directory
sudo mkdir -p /var/www/botanical-audit
sudo chown deploy:deploy /var/www/botanical-audit

# Setup PM2 startup script
pm2 startup
# Follow the command it outputs

# Configure firewall (if using ufw)
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 5000/tcp # API (or use nginx reverse proxy)
sudo ufw enable
```

---

## PM2 Ecosystem Configuration

The project already has `ecosystem.config.js` at root. Verify it exists:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gacp-backend',
    script: 'apps/backend/atlas-server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

---

## GitHub Actions Workflow

The CI workflow is already configured in `.github/workflows/auth-farmer-ci.yml`:

```yaml
deploy-staging:
  name: Deploy to Staging
  needs: test-auth-farmer
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup SSH Key
      uses: webfactory/ssh-agent@v0.9.0
      with:
        ssh-private-key: ${{ secrets.STAGING_SSH_KEY }}
    
    - name: Deploy to staging via rsync
      run: |
        rsync -avz --delete \
          --exclude 'node_modules' \
          --exclude '.git' \
          --exclude 'coverage' \
          ./ ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }}:${{ secrets.STAGING_PATH }}
    
    - name: Install dependencies and restart
      run: |
        ssh ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} \
          "cd ${{ secrets.STAGING_PATH }} && \
           pnpm install --prod --frozen-lockfile && \
           pm2 restart gacp-backend || pm2 start ecosystem.config.js"
    
    - name: Health check
      run: |
        sleep 10
        curl -f http://${{ secrets.STAGING_HOST }}/health || exit 1
```

---

## Deployment Process

### Automatic Deployment

1. Push changes to `main` branch
2. GitHub Actions runs tests
3. If tests pass, deploys to staging
4. Verifies with health check

### Manual Deployment

```bash
# SSH into staging
ssh deploy@your-staging-server.com

# Navigate to app directory
cd /var/www/botanical-audit

# Pull latest changes
git pull origin main

# Install dependencies
pnpm install --prod

# Restart application
pm2 restart gacp-backend

# Check status
pm2 status
pm2 logs gacp-backend --lines 50
```

---

## Health Checks

After deployment, verify:

```bash
# Basic health
curl http://your-staging-server.com/health

# Readiness probe
curl http://your-staging-server.com/ready

# Liveness probe
curl http://your-staging-server.com/live

# API docs
curl http://your-staging-server.com/api/docs/auth-farmer

# Specific endpoint
curl -X POST http://your-staging-server.com/api/auth/farmer/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestP@ss123","firstName":"Test","lastName":"User","idCard":"1234567890123","phoneNumber":"+66812345678"}'
```

---

## Rollback Procedure

### Option 1: Git Revert

```bash
# On staging server
cd /var/www/botanical-audit
git log --oneline -n 5
git checkout <previous-working-commit>
pnpm install --prod
pm2 restart gacp-backend
```

### Option 2: Keep Release Folders

```bash
# Modify deployment to use timestamped releases
/var/www/botanical-audit/
  releases/
    20250108-143022/
    20250108-120000/ (current)
  current -> releases/20250108-120000/

# Rollback: just change symlink
ln -sfn releases/20250108-120000 current
pm2 restart gacp-backend
```

---

## Monitoring

### PM2 Monitoring

```bash
# Dashboard
pm2 monit

# Logs
pm2 logs gacp-backend

# Process info
pm2 info gacp-backend

# Resource usage
pm2 status
```

### Log Files

```bash
# Application logs
tail -f /var/www/botanical-audit/logs/pm2-out.log
tail -f /var/www/botanical-audit/logs/pm2-error.log

# System logs
journalctl -u pm2-deploy -f
```

---

## Troubleshooting

### Deployment Fails

**Check SSH connection**:
```bash
ssh -i <path-to-key> deploy@staging-server.com
```

**Check GitHub Actions logs**:
- Go to Actions tab → Select failed workflow → View logs

**Verify secrets are set**:
- Settings → Secrets → Actions

### Application Won't Start

**Check PM2 status**:
```bash
pm2 status
pm2 logs gacp-backend --err --lines 100
```

**Check environment variables**:
```bash
cat /var/www/botanical-audit/.env
```

**Check MongoDB connection**:
```bash
mongo <MONGODB_URI>
# or
mongosh <MONGODB_URI>
```

### Health Check Fails

**Check if server is listening**:
```bash
netstat -tlnp | grep 5000
# or
ss -tlnp | grep 5000
```

**Check firewall**:
```bash
sudo ufw status
```

**Test localhost**:
```bash
curl http://localhost:5000/health
```

---

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use SSH keys** without passphrases for CI/CD
3. **Rotate secrets** regularly (every 90 days)
4. **Limit SSH access** with firewall rules
5. **Use HTTPS** with SSL certificates (Let's Encrypt)
6. **Monitor logs** for suspicious activity
7. **Keep dependencies** updated (`pnpm update`)
8. **Use environment-specific** MongoDB databases

---

## Next Steps

- [ ] Configure all GitHub Secrets
- [ ] Setup staging server with prerequisites
- [ ] Test deployment manually
- [ ] Trigger automatic deployment
- [ ] Setup monitoring/alerts
- [ ] Configure SSL certificate
- [ ] Setup nginx reverse proxy (optional)
- [ ] Configure database backups
