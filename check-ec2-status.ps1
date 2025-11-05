# 🔍 Check EC2 Deployment Status
# Troubleshooting ERR_CONNECTION_TIMED_OUT

$ErrorActionPreference = "Continue"

$EC2_HOST = "13.212.147.92"
$EC2_USER = "ec2-user"
$KEY_FILE = "gacp-backend-server.pem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 EC2 Deployment Troubleshooting" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Ping EC2
Write-Host "1️⃣ Testing network connectivity..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $EC2_HOST -Count 2 -Quiet
if ($pingResult) {
    Write-Host "   ✅ EC2 instance is reachable via ping" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cannot ping EC2 (this is normal if ICMP is blocked)" -ForegroundColor Yellow
}

# Check 2: SSH Connection
Write-Host ""
Write-Host "2️⃣ Testing SSH connection (port 22)..." -ForegroundColor Yellow
if (Test-Path $KEY_FILE) {
    Write-Host "   ✅ Key file found: $KEY_FILE" -ForegroundColor Green
    
    Write-Host "   Attempting SSH connection..." -ForegroundColor Gray
    $sshTest = ssh -i "$KEY_FILE" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "echo 'SSH OK'" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ SSH connection successful!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SSH connection failed!" -ForegroundColor Red
        Write-Host "   Error: $sshTest" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Possible causes:" -ForegroundColor Yellow
        Write-Host "   - Security Group doesn't allow SSH (port 22) from your IP" -ForegroundColor Yellow
        Write-Host "   - EC2 instance is stopped" -ForegroundColor Yellow
        Write-Host "   - Wrong key file" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "   ❌ Key file not found: $KEY_FILE" -ForegroundColor Red
    Write-Host "   Please place the key file in current directory" -ForegroundColor Yellow
    exit 1
}

# Check 3: Application Status
Write-Host ""
Write-Host "3️⃣ Checking application status..." -ForegroundColor Yellow
$pmStatus = ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "pm2 status" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   PM2 Status:" -ForegroundColor Gray
    Write-Host $pmStatus
} else {
    Write-Host "   ⚠️  PM2 not running or not installed" -ForegroundColor Yellow
    Write-Host "   Application may not be deployed yet" -ForegroundColor Yellow
}

# Check 4: Check if port 3004 is listening
Write-Host ""
Write-Host "4️⃣ Checking if application is listening on port 3004..." -ForegroundColor Yellow
$portCheck = ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "sudo netstat -tlnp | grep :3004 || echo 'Not listening'" 2>&1
Write-Host "   $portCheck" -ForegroundColor Gray

# Check 5: Test HTTP connection from EC2
Write-Host ""
Write-Host "5️⃣ Testing HTTP from inside EC2..." -ForegroundColor Yellow
$curlTest = ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3004 2>&1"
if ($curlTest -eq "200") {
    Write-Host "   ✅ Application responds on localhost:3004" -ForegroundColor Green
} else {
    Write-Host "   ❌ Application not responding (HTTP code: $curlTest)" -ForegroundColor Red
}

# Check 6: Security Group Check
Write-Host ""
Write-Host "6️⃣ Testing external HTTP access (port 3004)..." -ForegroundColor Yellow
try {
    $webTest = Invoke-WebRequest -Uri "http://${EC2_HOST}:3004" -TimeoutSec 5 -UseBasicParsing
    Write-Host "   ✅ Port 3004 is accessible from internet!" -ForegroundColor Green
    Write-Host "   HTTP Status: $($webTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Cannot connect to port 3004 from internet" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   🔧 SOLUTION: Update EC2 Security Group" -ForegroundColor Yellow
    Write-Host "   You need to add an inbound rule:" -ForegroundColor Yellow
    Write-Host "   - Type: Custom TCP" -ForegroundColor White
    Write-Host "   - Port: 3004" -ForegroundColor White
    Write-Host "   - Source: 0.0.0.0/0 (or your IP for security)" -ForegroundColor White
}

# Check 7: Check logs
Write-Host ""
Write-Host "7️⃣ Checking application logs..." -ForegroundColor Yellow
$logs = ssh -i "$KEY_FILE" "${EC2_USER}@${EC2_HOST}" "pm2 logs --lines 20 --nostream 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Recent logs:" -ForegroundColor Gray
    Write-Host $logs
}

# Summary and recommendations
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 Summary & Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Common fixes for ERR_CONNECTION_TIMED_OUT:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🔒 Update Security Group (Most likely issue)" -ForegroundColor White
Write-Host "   AWS Console → EC2 → Security Groups → Select your SG" -ForegroundColor Gray
Write-Host "   Add Inbound Rule:" -ForegroundColor Gray
Write-Host "   - Type: Custom TCP" -ForegroundColor Gray
Write-Host "   - Port: 3004" -ForegroundColor Gray
Write-Host "   - Source: 0.0.0.0/0" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🚀 If application not running:" -ForegroundColor White
Write-Host "   ssh -i '$KEY_FILE' ${EC2_USER}@${EC2_HOST}" -ForegroundColor Gray
Write-Host "   pm2 restart all" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 📝 Run lint and type-check:" -ForegroundColor White
Write-Host "   ssh -i '$KEY_FILE' ${EC2_USER}@${EC2_HOST}" -ForegroundColor Gray
Write-Host "   cd /home/ec2-user/gacp-platform" -ForegroundColor Gray
Write-Host "   npm run lint:backend" -ForegroundColor Gray
Write-Host "   npm run type-check" -ForegroundColor Gray
Write-Host ""
