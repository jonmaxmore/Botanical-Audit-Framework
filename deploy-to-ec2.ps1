# 🚀 Deploy GACP Platform to AWS EC2
# PowerShell Deployment Script for Windows

$ErrorActionPreference = "Stop"

# Configuration
$EC2_HOST = "13.212.147.92"
$EC2_USER = "ec2-user"
$KEY_FILE = "gacp-backend-server.pem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 GACP Platform Deployment to AWS EC2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if key file exists
if (-not (Test-Path $KEY_FILE)) {
    Write-Host "❌ Key file '$KEY_FILE' not found!" -ForegroundColor Red
    Write-Host "Please place your AWS key file in the current directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Key file found: $KEY_FILE" -ForegroundColor Green

# Function to execute SSH command
function Invoke-SSHCommand {
    param(
        [string]$Command
    )
    
    $sshCmd = "ssh -i `"$KEY_FILE`" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} `"$Command`""
    Write-Host "Executing: $Command" -ForegroundColor Gray
    Invoke-Expression $sshCmd
}

# Step 1: Test connection
Write-Host ""
Write-Host "Step 1: Testing connection to EC2..." -ForegroundColor Yellow
try {
    Invoke-SSHCommand "echo 'Connection successful!'"
    Write-Host "✅ Connected to EC2 successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to EC2. Please check:" -ForegroundColor Red
    Write-Host "   - Key file permissions" -ForegroundColor Yellow
    Write-Host "   - Security group allows SSH (port 22)" -ForegroundColor Yellow
    Write-Host "   - EC2 instance is running" -ForegroundColor Yellow
    exit 1
}

# Step 2: Update system
Write-Host ""
Write-Host "Step 2: Updating system and installing dependencies..." -ForegroundColor Yellow
$updateScript = @"
set -e
echo '📦 Updating system...'
sudo yum update -y

echo '📦 Installing Node.js 18...'
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

echo '📦 Installing Git...'
sudo yum install -y git

echo '📦 Installing PM2 and pnpm...'
sudo npm install -g pm2 pnpm

echo '✅ System dependencies installed!'
"@

ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" $updateScript

# Step 3: Clone repository
Write-Host ""
Write-Host "Step 3: Cloning repository..." -ForegroundColor Yellow
$cloneScript = @"
set -e
cd /home/ec2-user

if [ -d 'gacp-platform' ]; then
  echo '🗑️  Removing old installation...'
  rm -rf gacp-platform
fi

echo '📥 Cloning repository...'
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git gacp-platform

cd gacp-platform
echo 'Git branch: '`$(git branch --show-current)
echo 'Latest commit: '`$(git log -1 --oneline)
echo '✅ Repository cloned!'
"@

ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" $cloneScript

# Step 4: Install dependencies
Write-Host ""
Write-Host "Step 4: Installing application dependencies..." -ForegroundColor Yellow
$installScript = @"
set -e
cd /home/ec2-user/gacp-platform

echo '📦 Installing root dependencies...'
pnpm install

echo '📦 Installing backend dependencies...'
cd apps/backend
pnpm install

echo '✅ Dependencies installed!'
"@

ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" $installScript

# Step 5: Configure environment
Write-Host ""
Write-Host "Step 5: Configuring environment..." -ForegroundColor Yellow
Write-Host "⚠️  You need to provide configuration values:" -ForegroundColor Yellow
Write-Host ""

$MONGODB_URI = Read-Host "MongoDB URI (DocumentDB endpoint or leave empty for later)"
$REDIS_HOST = Read-Host "Redis Host (ElastiCache endpoint or leave empty for later)"

if ([string]::IsNullOrWhiteSpace($MONGODB_URI)) {
    $MONGODB_URI = "mongodb://localhost:27017/gacp_platform"
    Write-Host "Using default MongoDB URI (will need to update later)" -ForegroundColor Yellow
}

if ([string]::IsNullOrWhiteSpace($REDIS_HOST)) {
    $REDIS_HOST = "localhost"
    Write-Host "Using default Redis host (will need to update later)" -ForegroundColor Yellow
}

# Generate secrets
Add-Type -AssemblyName System.Security
$JWT_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
$SESSION_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

Write-Host "Generated JWT Secret: $JWT_SECRET" -ForegroundColor Green

$envContent = @"
# Database
MONGODB_URI=$MONGODB_URI
MONGODB_DB_NAME=gacp_platform

# Redis
REDIS_HOST=$REDIS_HOST
REDIS_PORT=6379
ENABLE_QUEUE=true
ENABLE_CACHE=true

# Security
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
CERTIFICATE_SECRET_KEY=$SESSION_SECRET

# Server
PORT=3004
HOST=0.0.0.0

# Email (Optional - configure later)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@gacp-platform.com
"@

# Save env file locally first
$envContent | Out-File -FilePath ".env.production.temp" -Encoding UTF8

# Upload to EC2
scp -i "$KEY_FILE" ".env.production.temp" "${EC2_USER}@${EC2_HOST}:/home/ec2-user/gacp-platform/apps/backend/.env"
Remove-Item ".env.production.temp"

Write-Host "✅ Environment configured!" -ForegroundColor Green

# Step 6: Start application
Write-Host ""
Write-Host "Step 6: Starting application..." -ForegroundColor Yellow
$startScript = @"
set -e
cd /home/ec2-user/gacp-platform/apps/backend

echo '🚀 Starting backend with PM2...'
pm2 delete all 2>/dev/null || true
pm2 start atlas-server.js --name 'gacp-backend' --env production

echo '💾 Saving PM2 configuration...'
pm2 save

echo '🔄 Setting up PM2 startup...'
pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -1 | sudo bash

echo '✅ Application started!'
"@

ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" $startScript

# Final status
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is now running at:" -ForegroundColor Cyan
Write-Host "   http://13.212.147.92:3004" -ForegroundColor White
Write-Host ""
Write-Host "📊 Check application status:" -ForegroundColor Cyan
Write-Host "   ssh -i $KEY_FILE ${EC2_USER}@${EC2_HOST}" -ForegroundColor White
Write-Host "   pm2 status" -ForegroundColor White
Write-Host "   pm2 logs" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update MongoDB and Redis endpoints in .env" -ForegroundColor White
Write-Host "   2. Configure your domain DNS to point to 13.212.147.92" -ForegroundColor White
Write-Host "   3. Set up SSL certificate" -ForegroundColor White
Write-Host "   4. Configure monitoring" -ForegroundColor White
Write-Host ""
