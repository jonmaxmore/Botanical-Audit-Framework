# API and WebSocket Testing Script
# Tests API endpoints and WebSocket connectivity

$SERVER = "13.214.217.1"
$PORT = "5000"
$BASE_URL = "http://${SERVER}:${PORT}"

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "  API & WebSocket Test Suite" -ForegroundColor White
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Target: $BASE_URL" -ForegroundColor Gray
Write-Host ""

# Test Results Tracking
$passed = 0
$failed = 0
$warnings = 0

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null,
        [hashtable]$Headers = $null
    )
    
    Write-Host "[TEST] $Description" -ForegroundColor Yellow
    Write-Host "       $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Headers) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "       ✅ Status: OK" -ForegroundColor Green
        
        # Display key information
        if ($response.status) {
            Write-Host "       📊 Status: $($response.status)" -ForegroundColor White
        }
        if ($response.version) {
            Write-Host "       📦 Version: $($response.version)" -ForegroundColor White
        }
        if ($response.environment) {
            Write-Host "       🌍 Environment: $($response.environment)" -ForegroundColor White
        }
        
        $script:passed++
        Write-Host ""
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401) {
            Write-Host "       ⚠️  Status: 401 Unauthorized (Expected)" -ForegroundColor Yellow
            $script:warnings++
        }
        elseif ($statusCode -eq 404) {
            Write-Host "       ❌ Status: 404 Not Found" -ForegroundColor Red
            $script:failed++
        }
        else {
            Write-Host "       ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:failed++
        }
        Write-Host ""
        return $null
    }
}

# Test 1: Health Check
$health = Test-Endpoint -Method "GET" -Endpoint "/api/health" -Description "Health Check Endpoint"
if ($health) {
    Write-Host "   🔍 Service Status:" -ForegroundColor Cyan
    if ($health.services) {
        $health.services.PSObject.Properties | ForEach-Object {
            $status = $_.Value
            $icon = if ($status -eq "healthy" -or $status -eq "operational") { "✅" } 
                    elseif ($status -eq "disabled") { "⚪" }
                    else { "❌" }
            Write-Host "      $icon $($_.Name): $status" -ForegroundColor White
        }
    }
    
    if ($health.details.mongodb) {
        Write-Host "`n   📊 MongoDB:" -ForegroundColor Cyan
        Write-Host "      Database: $($health.details.mongodb.details.dbName)" -ForegroundColor White
        Write-Host "      Host: $($health.details.mongodb.details.host)" -ForegroundColor White
        Write-Host "      Ready State: $($health.details.mongodb.details.readyState)" -ForegroundColor White
    }
    
    if ($health.details.system) {
        Write-Host "`n   💻 System:" -ForegroundColor Cyan
        Write-Host "      CPU Usage: $([math]::Round($health.details.system.cpu.usage, 2))%" -ForegroundColor White
        Write-Host "      Memory Usage: $([math]::Round($health.details.system.memory.usage, 2))%" -ForegroundColor White
        Write-Host "      Uptime: $([math]::Round($health.details.system.process.uptime, 2))s" -ForegroundColor White
    }
    Write-Host ""
}

# Test 2: Status Endpoint
$status = Test-Endpoint -Method "GET" -Endpoint "/api/status" -Description "Server Status Endpoint"

# Test 3: Applications Endpoint (should require auth)
Test-Endpoint -Method "GET" -Endpoint "/api/applications" -Description "Applications Endpoint (Auth Required)"

# Test 4: Auth Login Endpoint Structure
Write-Host "[TEST] Auth Login Endpoint Structure" -ForegroundColor Yellow
Write-Host "       POST /api/auth/login" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/login" -Method POST -ContentType "application/json" -Body '{}' -ErrorAction Stop
    Write-Host "       ❌ Unexpected success with empty body" -ForegroundColor Red
    $failed++
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 422) {
        Write-Host "       ✅ Validation working (400/422 for empty body)" -ForegroundColor Green
        $passed++
    }
    else {
        Write-Host "       ⚠️  Status: $statusCode" -ForegroundColor Yellow
        $warnings++
    }
}
Write-Host ""

# Test 5: WebSocket Connectivity (using Test-NetConnection)
Write-Host "[TEST] WebSocket Port Connectivity" -ForegroundColor Yellow
Write-Host "       Checking port $PORT..." -ForegroundColor Gray
try {
    $connection = Test-NetConnection -ComputerName $SERVER -Port $PORT -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "       ✅ Port $PORT is accessible" -ForegroundColor Green
        Write-Host "       📡 WebSocket connections should work" -ForegroundColor White
        $passed++
    }
    else {
        Write-Host "       ❌ Port $PORT is not accessible" -ForegroundColor Red
        $failed++
    }
}
catch {
    Write-Host "       ❌ Connection test failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Test 6: CORS Headers Check
Write-Host "[TEST] CORS Configuration" -ForegroundColor Yellow
Write-Host "       Checking CORS headers..." -ForegroundColor Gray
try {
    $headers = @{
        "Origin" = "http://localhost:3000"
    }
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/health" -Headers $headers -Method GET -ErrorAction Stop
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "       ✅ CORS enabled" -ForegroundColor Green
        Write-Host "       📋 Allow-Origin: $corsHeader" -ForegroundColor White
        $passed++
    }
    else {
        Write-Host "       ⚠️  CORS header not found" -ForegroundColor Yellow
        $warnings++
    }
}
catch {
    Write-Host "       ❌ CORS check failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Test 7: Response Time Check
Write-Host "[TEST] API Response Time" -ForegroundColor Yellow
Write-Host "       Measuring response time..." -ForegroundColor Gray
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $null = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method GET -ErrorAction Stop
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 500) {
        Write-Host "       ✅ Response time: ${responseTime}ms (Excellent)" -ForegroundColor Green
        $passed++
    }
    elseif ($responseTime -lt 1000) {
        Write-Host "       ⚠️  Response time: ${responseTime}ms (Good)" -ForegroundColor Yellow
        $warnings++
    }
    else {
        Write-Host "       ⚠️  Response time: ${responseTime}ms (Slow)" -ForegroundColor Yellow
        $warnings++
    }
}
catch {
    $stopwatch.Stop()
    Write-Host "       ❌ Response time test failed" -ForegroundColor Red
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
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "  Recommendations" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host "⚠️  Some tests failed. Review the errors above." -ForegroundColor Yellow
}
else {
    Write-Host "✅ All critical tests passed!" -ForegroundColor Green
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test WebSocket connections with a client" -ForegroundColor White
Write-Host "   2. Test authenticated endpoints with JWT token" -ForegroundColor White
Write-Host "   3. Monitor PM2 logs: ssh ... 'pm2 logs backend'" -ForegroundColor White
Write-Host "   4. Check EC2 metrics in CloudWatch" -ForegroundColor White
Write-Host ""

# WebSocket Test Instructions
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  WebSocket Testing Guide" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test WebSocket connections, use one of these methods:" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣  Browser Console (Chrome/Firefox):" -ForegroundColor Yellow
Write-Host "   const socket = io('http://$SERVER`:$PORT', {" -ForegroundColor Gray
Write-Host "     transports: ['websocket', 'polling']" -ForegroundColor Gray
Write-Host "   });" -ForegroundColor Gray
Write-Host "   " -ForegroundColor Gray
Write-Host "   socket.on('connect', () => {" -ForegroundColor Gray
Write-Host "     console.log('Connected:', socket.id);" -ForegroundColor Gray
Write-Host "   });" -ForegroundColor Gray

Write-Host "`n2️⃣  Node.js Test Script:" -ForegroundColor Yellow
Write-Host "   const io = require('socket.io-client');" -ForegroundColor Gray
Write-Host "   const socket = io('http://$SERVER`:$PORT');" -ForegroundColor Gray
Write-Host "   " -ForegroundColor Gray
Write-Host "   socket.on('connect', () => {" -ForegroundColor Gray
Write-Host "     console.log('Connected!');" -ForegroundColor Gray
Write-Host "     socket.emit('subscribe', 'test-channel');" -ForegroundColor Gray
Write-Host "   });" -ForegroundColor Gray

Write-Host "`n3️⃣  Online WebSocket Tester:" -ForegroundColor Yellow
Write-Host "   • https://www.websocket.org/echo.html" -ForegroundColor Gray
Write-Host "   • Use URL: ws://$SERVER`:$PORT/socket.io/?EIO=4&transport=websocket" -ForegroundColor Gray

Write-Host ""
