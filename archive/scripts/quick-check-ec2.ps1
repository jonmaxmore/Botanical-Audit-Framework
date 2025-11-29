# 🔍 Quick EC2 Check and Lint/Type-check
# Run this script to check deployment and run code quality checks

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 EC2 Deployment Check & Code Quality" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$EC2_HOST = "13.212.147.92"
$EC2_USER = "ec2-user"

# Find key file
$KEY_FILE = $null
$possibleLocations = @(
    "gacp-backend-server.pem",
    ".\gacp-backend-server.pem",
    "..\gacp-backend-server.pem",
    "$HOME\Downloads\gacp-backend-server.pem",
    "$HOME\Documents\gacp-backend-server.pem"
)

foreach ($location in $possibleLocations) {
    if (Test-Path $location) {
        $KEY_FILE = $location
        Write-Host "✅ Found key file: $KEY_FILE" -ForegroundColor Green
        break
    }
}

if (-not $KEY_FILE) {
    Write-Host "❌ Key file 'gacp-backend-server.pem' not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please provide the full path to your key file:" -ForegroundColor Yellow
    $KEY_FILE = Read-Host "Path to gacp-backend-server.pem"
    
    if (-not (Test-Path $KEY_FILE)) {
        Write-Host "❌ File not found: $KEY_FILE" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📡 Testing connection to EC2: $EC2_HOST" -ForegroundColor Yellow
$testResult = ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "echo 'OK'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to EC2!" -ForegroundColor Red
    Write-Host "Error: $testResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Security Group doesn't allow SSH (port 22) from your IP" -ForegroundColor Yellow
    Write-Host "2. EC2 instance is stopped" -ForegroundColor Yellow
    Write-Host "3. Wrong key file or permissions" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Connected to EC2 successfully!" -ForegroundColor Green
Write-Host ""

# Check if deployed
Write-Host "📦 Checking if application is deployed..." -ForegroundColor Yellow
$deployed = ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "test -d /home/ec2-user/gacp-platform && echo 'YES' || echo 'NO'"

if ($deployed.Trim() -eq "NO") {
    Write-Host "⚠️  Application not deployed yet!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To deploy, run: .\deploy-to-ec2.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Application is deployed" -ForegroundColor Green
Write-Host ""

# Check PM2 status
Write-Host "🔄 Checking PM2 status..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "pm2 status"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Check if app is responding locally
Write-Host "🌐 Testing application locally on EC2..." -ForegroundColor Yellow
$localTest = ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3004/api/health 2>&1"

if ($localTest -eq "200") {
    Write-Host "✅ Application is running and responding (HTTP 200)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Application not responding properly (HTTP $localTest)" -ForegroundColor Yellow
    Write-Host "Checking logs..." -ForegroundColor Yellow
    ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "pm2 logs --lines 15 --nostream"
}
Write-Host ""

# Run ESLint
Write-Host "🔍 Running ESLint on server..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" @"
cd /home/ec2-user/gacp-platform
echo '📋 ESLint Backend Results:'
npm run lint:backend 2>&1
"@
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Run TypeScript check
Write-Host "📘 Running TypeScript type-check on server..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" @"
cd /home/ec2-user/gacp-platform
echo '📋 TypeScript Check Results:'
npm run type-check 2>&1
"@
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Test external access
Write-Host "🌍 Testing external access to http://${EC2_HOST}:3004..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${EC2_HOST}:3004/api/health" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Port 3004 is accessible from internet!" -ForegroundColor Green
    Write-Host "   HTTP Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎉 Your application is live at:" -ForegroundColor Cyan
    Write-Host "   http://${EC2_HOST}:3004" -ForegroundColor White
} catch {
    Write-Host "❌ Cannot access from internet (ERR_CONNECTION_TIMED_OUT)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 FIX: Update EC2 Security Group" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps to fix:" -ForegroundColor White
    Write-Host "1. Go to AWS Console → EC2 → Security Groups" -ForegroundColor Gray
    Write-Host "2. Find Security Group for instance: i-0b7d2294695d6c8de" -ForegroundColor Gray
    Write-Host "3. Edit Inbound Rules → Add Rule:" -ForegroundColor Gray
    Write-Host "   - Type: Custom TCP" -ForegroundColor Gray
    Write-Host "   - Port: 3004" -ForegroundColor Gray
    Write-Host "   - Source: 0.0.0.0/0" -ForegroundColor Gray
    Write-Host "   - Description: GACP Platform API" -ForegroundColor Gray
    Write-Host "4. Save rules" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After updating, run this script again to verify." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Check Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
