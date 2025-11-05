# Test External API Access
# Run this after opening Security Group port 5000

$API_BASE = "http://13.214.217.1:5000"

Write-Host "`n=== Testing External API Access ===" -ForegroundColor Cyan
Write-Host "Target: $API_BASE" -ForegroundColor White

# Test 1: Port connectivity
Write-Host "`n[1/4] Testing port 5000 connectivity..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName 13.214.217.1 -Port 5000 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "✅ Port 5000 is OPEN" -ForegroundColor Green
} else {
    Write-Host "❌ Port 5000 is CLOSED - Please open Security Group" -ForegroundColor Red
    Write-Host "`nTo open port 5000:" -ForegroundColor Yellow
    Write-Host "1. Go to AWS Console → EC2 → Security Groups" -ForegroundColor White
    Write-Host "2. Edit inbound rules → Add rule:" -ForegroundColor White
    Write-Host "   Type: Custom TCP, Port: 5000, Source: 0.0.0.0/0" -ForegroundColor White
    exit 1
}

# Test 2: Health endpoint
Write-Host "`n[2/4] Testing /api/health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_BASE/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Health Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor White
    Write-Host "   MongoDB: $($health.details.mongodb.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Status endpoint
Write-Host "`n[3/4] Testing /api/status endpoint..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$API_BASE/api/status" -Method Get -TimeoutSec 10
    Write-Host "✅ Server Status: $($status.status)" -ForegroundColor Green
    Write-Host "   Environment: $($status.environment)" -ForegroundColor White
    Write-Host "   Uptime: $([math]::Round($status.uptime, 2)) seconds" -ForegroundColor White
} catch {
    Write-Host "❌ Status check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Applications endpoint (should return 401 without auth)
Write-Host "`n[4/4] Testing /api/applications endpoint..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "$API_BASE/api/applications" -Method Get -TimeoutSec 10
    Write-Host "⚠️  Unexpected: Got response without auth" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Authentication required (401) - Expected behavior" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`n✅ API is accessible from external network!" -ForegroundColor Green
Write-Host "`nYou can now access the API at: $API_BASE" -ForegroundColor White
Write-Host "`nAvailable endpoints:" -ForegroundColor Cyan
Write-Host "  - GET $API_BASE/api/health" -ForegroundColor White
Write-Host "  - GET $API_BASE/api/status" -ForegroundColor White
Write-Host "  - POST $API_BASE/api/auth/login" -ForegroundColor White
Write-Host "  - GET $API_BASE/api/applications (requires auth)" -ForegroundColor White
