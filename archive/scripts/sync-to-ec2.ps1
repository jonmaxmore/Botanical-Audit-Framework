# Sync Code to EC2
# This script syncs local code to EC2 and restarts the application

$EC2_IP = "13.212.147.92"
$KEY_FILE = "C:\Users\usEr\.ssh\gacp-backend-server.pem"
$EC2_USER = "ec2-user"
$REMOTE_PATH = "/home/ec2-user/Botanical-Audit-Framework"
$LOCAL_PATH = "c:\Users\usEr\Documents\GitHub\Botanical-Audit-Framework"

Write-Host "🚀 Syncing Code to EC2..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop PM2 process
Write-Host "1️⃣ Stopping PM2 backend process..." -ForegroundColor Yellow
ssh -i $KEY_FILE $EC2_USER@$EC2_IP "pm2 stop backend"

# Step 2: Backup current code
Write-Host "2️⃣ Backing up current code..." -ForegroundColor Yellow
ssh -i $KEY_FILE $EC2_USER@$EC2_IP "cd $REMOTE_PATH && tar -czf ../backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz ."

# Step 3: Sync apps/backend directory (excluding node_modules)
Write-Host "3️⃣ Syncing apps/backend to EC2..." -ForegroundColor Yellow
Write-Host "   Excluding: node_modules, .env, logs" -ForegroundColor Gray

# Create exclude file
$excludeFile = Join-Path $env:TEMP "rsync-exclude.txt"
@"
node_modules/
.env
.env.local
logs/
*.log
.DS_Store
dist/
build/
coverage/
"@ | Out-File -FilePath $excludeFile -Encoding ASCII

# Use SCP with compression (rsync not available on Windows by default)
Write-Host "   Using SCP to transfer files..." -ForegroundColor Gray
ssh -i $KEY_FILE $EC2_USER@$EC2_IP "rm -rf $REMOTE_PATH/apps/backend/routes $REMOTE_PATH/apps/backend/services/scheduler"

# Copy specific fixed files
Write-Host "   Uploading fixed files..." -ForegroundColor Green
scp -i $KEY_FILE -r "$LOCAL_PATH/apps/backend/routes" "${EC2_USER}@${EC2_IP}:${REMOTE_PATH}/apps/backend/"
scp -i $KEY_FILE -r "$LOCAL_PATH/apps/backend/services" "${EC2_USER}@${EC2_IP}:${REMOTE_PATH}/apps/backend/"
scp -i $KEY_FILE -r "$LOCAL_PATH/apps/backend/middleware" "${EC2_USER}@${EC2_IP}:${REMOTE_PATH}/apps/backend/"
scp -i $KEY_FILE -r "$LOCAL_PATH/apps/backend/models" "${EC2_USER}@${EC2_IP}:${REMOTE_PATH}/apps/backend/"
scp -i $KEY_FILE -r "$LOCAL_PATH/apps/backend/utils" "${EC2_USER}@${EC2_IP}:${REMOTE_PATH}/apps/backend/"

# Step 4: Install dependencies if package.json changed
Write-Host "4️⃣ Checking dependencies..." -ForegroundColor Yellow
scp -i $KEY_FILE "$LOCAL_PATH/apps/backend/package.json" "${EC2_USER}@${EC2_IP}:${REMOTE_PATH}/apps/backend/package.json.new"
ssh -i $KEY_FILE $EC2_USER@$EC2_IP @"
cd $REMOTE_PATH/apps/backend
if ! diff -q package.json package.json.new > /dev/null 2>&1; then
  echo '   📦 package.json changed, running npm install...'
  mv package.json.new package.json
  npm install --production
else
  echo '   ✅ package.json unchanged, skipping npm install'
  rm package.json.new
fi
"@

# Step 5: Run lint on server
Write-Host "5️⃣ Running ESLint on server..." -ForegroundColor Yellow
ssh -i $KEY_FILE $EC2_USER@$EC2_IP "cd $REMOTE_PATH/apps/backend && npx eslint . --ext .js --max-warnings 50 || true"

# Step 6: Restart PM2
Write-Host "6️⃣ Restarting PM2 backend..." -ForegroundColor Yellow
ssh -i $KEY_FILE $EC2_USER@$EC2_IP "cd $REMOTE_PATH/apps/backend && pm2 restart backend --update-env"

# Step 7: Wait and check status
Write-Host "7️⃣ Waiting 5 seconds for startup..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "8️⃣ Checking PM2 status..." -ForegroundColor Yellow
ssh -i $KEY_FILE $EC2_USER@$EC2_IP "pm2 status"

Write-Host ""
Write-Host "9️⃣ Checking for new errors..." -ForegroundColor Yellow
ssh -i $KEY_FILE $EC2_USER@$EC2_IP "pm2 logs backend --lines 20 --nostream"

Write-Host ""
Write-Host "✅ Sync Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open Security Group in AWS Console"
Write-Host "2. Add Inbound Rule: Custom TCP, Port 3004, Source 0.0.0.0/0"
Write-Host "3. Test: curl http://13.212.147.92:3004/api/health"
Write-Host ""
Write-Host "🔍 Monitor logs: ssh -i $KEY_FILE $EC2_USER@$EC2_IP 'pm2 logs backend --tail'" -ForegroundColor Gray
