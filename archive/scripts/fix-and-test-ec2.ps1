# 🔧 Fix EC2 Security Group and Run Tests
# This script will guide you through fixing the connection issue

$ErrorActionPreference = "Continue"

$EC2_HOST = "13.212.147.92"
$EC2_USER = "ec2-user"
$KEY_FILE = "gacp-backend-server.pem"
$INSTANCE_ID = "i-0b7d2294695d6c8de"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔧 Fix EC2 and Run Code Quality Checks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we can SSH
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$sshTest = ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "echo 'Connected'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect via SSH" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. EC2 instance is running" -ForegroundColor Yellow
    Write-Host "2. Security Group allows SSH (port 22)" -ForegroundColor Yellow
    Write-Host "3. Key file is correct" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ SSH connection successful!" -ForegroundColor Green
Write-Host ""

# Step 1: Check if application is deployed
Write-Host "Step 1: Checking deployment status..." -ForegroundColor Yellow
$deployCheck = ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" @"
if [ -d '/home/ec2-user/gacp-platform' ]; then
    echo 'DEPLOYED'
else
    echo 'NOT_DEPLOYED'
fi
"@

if ($deployCheck -eq "NOT_DEPLOYED") {
    Write-Host "⚠️  Application not deployed yet!" -ForegroundColor Yellow
    Write-Host "Please run: .\deploy-to-ec2.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Application is deployed" -ForegroundColor Green
Write-Host ""

# Step 2: Check PM2 status
Write-Host "Step 2: Checking PM2 status..." -ForegroundColor Yellow
ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "pm2 status"
Write-Host ""

# Step 3: Check if port 3004 is open locally
Write-Host "Step 3: Checking if app is listening on port 3004..." -ForegroundColor Yellow
$portCheck = ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3004/api/health 2>&1"
if ($portCheck -eq "200") {
    Write-Host "✅ Application is running and responding!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Application not responding (status: $portCheck)" -ForegroundColor Yellow
    Write-Host "Attempting to start application..." -ForegroundColor Yellow
    ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" @"
cd /home/ec2-user/gacp-platform/apps/backend
pm2 restart all || pm2 start atlas-server.js --name gacp-backend
pm2 logs --lines 10 --nostream
"@
}
Write-Host ""

# Step 4: Run ESLint on server
Write-Host "Step 4: Running ESLint on server..." -ForegroundColor Yellow
Write-Host "Command: npm run lint:backend" -ForegroundColor Gray
ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" @"
cd /home/ec2-user/gacp-platform
echo '📋 ESLint Results:'
npm run lint:backend 2>&1 | tail -20
"@
Write-Host ""

# Step 5: Run TypeScript check on server
Write-Host "Step 5: Running TypeScript type-check on server..." -ForegroundColor Yellow
Write-Host "Command: npm run type-check" -ForegroundColor Gray
ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" @"
cd /home/ec2-user/gacp-platform
echo '📋 TypeScript Check Results:'
npm run type-check 2>&1 | tail -20
"@
Write-Host ""

# Step 6: Check Security Group
Write-Host "Step 6: Checking Security Group configuration..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: You need to manually update the Security Group" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔒 AWS Console Steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://ap-southeast-1.console.aws.amazon.com/ec2/v2/home?region=ap-southeast-1#SecurityGroups:" -ForegroundColor White
Write-Host "2. Find the Security Group attached to instance: $INSTANCE_ID" -ForegroundColor White
Write-Host "3. Click 'Edit inbound rules'" -ForegroundColor White
Write-Host "4. Add new rule:" -ForegroundColor White
Write-Host "   - Type: Custom TCP" -ForegroundColor Gray
Write-Host "   - Port range: 3004" -ForegroundColor Gray
Write-Host "   - Source: 0.0.0.0/0 (for public access)" -ForegroundColor Gray
Write-Host "   - Description: GACP Platform API" -ForegroundColor Gray
Write-Host "5. Click 'Save rules'" -ForegroundColor White
Write-Host ""

# Step 7: Test after security group update
Write-Host "Step 7: Testing external access..." -ForegroundColor Yellow
Write-Host "After updating Security Group, press Enter to test..." -ForegroundColor Yellow
Read-Host

Write-Host "Testing http://${EC2_HOST}:3004..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://${EC2_HOST}:3004/api/health" -TimeoutSec 10 -UseBasicParsing
    Write-Host ""
    Write-Host "✅ SUCCESS! Port 3004 is now accessible!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 Your API is now live at:" -ForegroundColor Cyan
    Write-Host "   http://${EC2_HOST}:3004" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "❌ Still cannot connect" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please verify:" -ForegroundColor Yellow
    Write-Host "1. Security Group rule was saved correctly" -ForegroundColor Yellow
    Write-Host "2. Port is 3004 (not 3000)" -ForegroundColor Yellow
    Write-Host "3. Source is 0.0.0.0/0" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Check Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
