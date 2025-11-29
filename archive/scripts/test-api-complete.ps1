# API and WebSocket Testing Script
$SERVER = "13.214.217.1"
$PORT = "5000"
$BASE_URL = "http://${SERVER}:${PORT}"

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "  API & WebSocket Test Suite" -ForegroundColor White
Write-Host "================================`n" -ForegroundColor Cyan
Write-Host "Target: $BASE_URL`n" -ForegroundColor Gray

$passed = 0
$failed = 0
$warnings = 0

# Test 1: Health Check
Write-Host "[1/7] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method GET
    Write-Host "      ✅ Health Status: $($health.status)" -ForegroundColor Green
    Write-Host "      📊 MongoDB: $($health.services.database)" -ForegroundColor White
    Write-Host "      📡 Notifications: $($health.services.notifications)" -ForegroundColor White
    Write-Host "      💾 Cache: $($health.services.cache)" -ForegroundColor White
    if ($health.details.system) {
        Write-Host "      💻 CPU: $([math]::Round($health.details.system.cpu.usage, 2))%" -ForegroundColor White
        Write-Host "      🧠 Memory: $([math]::Round($health.details.system.memory.usage, 2))%" -ForegroundColor White
    }
    $passed++
} catch {
    Write-Host "      ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Test 2: Status Endpoint
Write-Host "[2/7] Testing Status Endpoint..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$BASE_URL/api/status" -Method GET
    Write-Host "      ✅ Server: $($status.status)" -ForegroundColor Green
    Write-Host "      📦 Version: $($status.version)" -ForegroundColor White
    Write-Host "      🌍 Environment: $($status.environment)" -ForegroundColor White
    Write-Host "      ⏱️  Uptime: $([math]::Round($status.uptime, 2))s" -ForegroundColor White
    $passed++
} catch {
    Write-Host "      ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Test 3: Applications Endpoint (Auth Required)
Write-Host "[3/7] Testing Applications Endpoint..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "$BASE_URL/api/applications" -Method GET
    Write-Host "      ❌ Unexpected: Should require authentication" -ForegroundColor Red
    $failed++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "      ✅ Authentication Required (401) - Expected" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "      ❌ Unexpected Status: $statusCode" -ForegroundColor Red
        $failed++
    }
}
Write-Host ""

# Test 4: Auth Endpoint Validation
Write-Host "[4/7] Testing Auth Endpoint Validation..." -ForegroundColor Yellow
try {
    $body = @{} | ConvertTo-Json
    $null = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "      ❌ Should reject empty credentials" -ForegroundColor Red
    $failed++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 422) {
        Write-Host "      ✅ Validation Working (Status $statusCode)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "      ⚠️  Unexpected Status: $statusCode" -ForegroundColor Yellow
        $warnings++
    }
}
Write-Host ""

# Test 5: Port Connectivity (WebSocket)
Write-Host "[5/7] Testing WebSocket Port..." -ForegroundColor Yellow
$connection = Test-NetConnection -ComputerName $SERVER -Port $PORT -WarningAction SilentlyContinue
if ($connection.TcpTestSucceeded) {
    Write-Host "      ✅ Port $PORT is accessible" -ForegroundColor Green
    Write-Host "      📡 WebSocket Ready" -ForegroundColor White
    $passed++
} else {
    Write-Host "      ❌ Port $PORT not accessible" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Test 6: CORS Headers
Write-Host "[6/7] Testing CORS Configuration..." -ForegroundColor Yellow
try {
    $headers = @{ "Origin" = "http://localhost:3000" }
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/health" -Headers $headers -Method GET
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "      ✅ CORS Enabled" -ForegroundColor Green
        Write-Host "      🌐 Allow-Origin: $corsHeader" -ForegroundColor White
        $passed++
    } else {
        Write-Host "      ⚠️  CORS Header Not Found" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "      ❌ CORS Check Failed" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Test 7: Response Time
Write-Host "[7/7] Testing Response Time..." -ForegroundColor Yellow
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $null = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method GET
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 500) {
        Write-Host "      ✅ Response: ${responseTime}ms (Excellent)" -ForegroundColor Green
        $passed++
    } elseif ($responseTime -lt 1000) {
        Write-Host "      ⚠️  Response: ${responseTime}ms (Good)" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "      ⚠️  Response: ${responseTime}ms (Slow)" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "      ❌ Test Failed" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Passed:   $passed" -ForegroundColor Green
Write-Host "⚠️  Warnings: $warnings" -ForegroundColor Yellow
Write-Host "❌ Failed:   $failed" -ForegroundColor Red
Write-Host ""

$total = $passed + $warnings + $failed
if ($total -gt 0) {
    $successRate = [math]::Round(($passed / $total) * 100, 1)
    $color = if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" }
    Write-Host "Success Rate: $successRate%" -ForegroundColor $color
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "  WebSocket Testing" -ForegroundColor White
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "To test WebSocket connections:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Browser Console (F12):" -ForegroundColor Cyan
Write-Host "   <script src=`"https://cdn.socket.io/4.5.4/socket.io.min.js`"></script>" -ForegroundColor Gray
Write-Host "   <script>" -ForegroundColor Gray
Write-Host "     const socket = io('http://$SERVER`:$PORT');" -ForegroundColor Gray
Write-Host "     socket.on('connect', () => console.log('Connected!', socket.id));" -ForegroundColor Gray
Write-Host "   </script>" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Node.js Test:" -ForegroundColor Cyan
Write-Host "   npm install socket.io-client" -ForegroundColor Gray
Write-Host "   node -e `"const io=require('socket.io-client'); const s=io('http://$SERVER`:$PORT'); s.on('connect',()=>console.log('OK'));`"" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check PM2 Logs:" -ForegroundColor Cyan
Write-Host "   ssh -i C:\Users\usEr\.ssh\gacp-backend-server.pem ec2-user@$SERVER 'pm2 logs backend'" -ForegroundColor Gray
Write-Host ""
