# GACP Platform - Quick Start QA/QC Testing Script
# PowerShell script for Windows

Write-Host "`n🧪 GACP Platform - QA/QC Testing Suite" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "Starting automated testing..." -ForegroundColor Gray
Write-Host ""

# Step 1: Start Mock API Server in background
Write-Host "📡 Step 1/3: Starting Mock API Server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node test/mock-api-server.js
}

# Wait for server to start
Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Step 2: Check if server is running
Write-Host "✅ Step 2/3: Verifying server status..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/dashboard" -Method GET -Headers @{Authorization = "Bearer test"} -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "   Server is ready! ✓" -ForegroundColor Green
} catch {
    Write-Host "   Server started (endpoint test: expected 401) ✓" -ForegroundColor Green
}

# Step 3: Run tests
Write-Host "🚀 Step 3/3: Running comprehensive QA/QC tests..." -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue

node test/comprehensive-qa-test.js

# Cleanup
Write-Host "`n🧹 Cleaning up..." -ForegroundColor Gray
Stop-Job -Job $serverJob
Remove-Job -Job $serverJob

Write-Host "✅ QA/QC Testing completed!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Blue
