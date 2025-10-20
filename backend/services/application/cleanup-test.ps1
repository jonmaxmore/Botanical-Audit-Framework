# ===================================
# GACP Test Cleanup Script
# ===================================
# Purpose: Clean up hanging processes and connections
# Usage: .\cleanup-test.ps1
# Author: GACP Platform Team
# Date: 2025-10-16
# ===================================

Write-Host "🧹 Starting Test Environment Cleanup..." -ForegroundColor Cyan

# 1. Kill hanging Node.js test processes
Write-Host "`n📍 Step 1: Killing Node.js test processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        Write-Host "  ❌ Killing Node.js process (PID: $($proc.Id))" -ForegroundColor Red
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✅ All Node.js processes killed" -ForegroundColor Green
} else {
    Write-Host "  ✅ No Node.js processes found" -ForegroundColor Green
}

# 2. Clear Jest cache
Write-Host "`n📍 Step 2: Clearing Jest cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Jest cache cleared" -ForegroundColor Green
} else {
    Write-Host "  ✅ No cache to clear" -ForegroundColor Green
}

# 3. Clear MongoDB Memory Server data
Write-Host "`n📍 Step 3: Clearing MongoDB Memory Server data..." -ForegroundColor Yellow
$mongoTempPaths = @(
    "$env:TEMP\mongodb-memory-server",
    "$env:LOCALAPPDATA\Temp\mongodb-memory-server",
    "$env:USERPROFILE\AppData\Local\Temp\mongodb-memory-server"
)

foreach ($path in $mongoTempPaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Cleared: $path" -ForegroundColor Green
    }
}

# 4. Check MongoDB connections
Write-Host "`n📍 Step 4: Checking MongoDB connections..." -ForegroundColor Yellow
$mongoConnections = netstat -ano | findstr ":27017" | findstr "ESTABLISHED"
if ($mongoConnections) {
    Write-Host "  ⚠️  Found MongoDB connections:" -ForegroundColor Yellow
    Write-Host $mongoConnections -ForegroundColor Gray
    
    # Extract PIDs and kill
    $pids = $mongoConnections | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') {
            $matches[1]
        }
    } | Select-Object -Unique
    
    foreach ($processId in $pids) {
        Write-Host "  ❌ Killing process with PID: $processId" -ForegroundColor Red
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "  ✅ No hanging MongoDB connections" -ForegroundColor Green
}

# 5. Wait for cleanup to complete
Write-Host "`n📍 Step 5: Waiting for cleanup to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "  ✅ Cleanup delay complete" -ForegroundColor Green

# 6. Verify cleanup
Write-Host "`n📍 Step 6: Verifying cleanup..." -ForegroundColor Yellow
$remainingNode = Get-Process -Name node -ErrorAction SilentlyContinue
$remainingMongo = netstat -ano | findstr ":27017" | findstr "ESTABLISHED"

if (-not $remainingNode -and -not $remainingMongo) {
    Write-Host "  ✅ All processes cleaned successfully!" -ForegroundColor Green
} else {
    if ($remainingNode) {
        Write-Host "  ⚠️  Some Node.js processes still running" -ForegroundColor Yellow
    }
    if ($remainingMongo) {
        Write-Host "  ⚠️  Some MongoDB connections still active" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Cleanup Complete! Ready to run tests." -ForegroundColor Cyan
Write-Host "Run: npm test" -ForegroundColor White
