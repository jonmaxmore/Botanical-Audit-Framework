# รัน Smoke Test สำหรับ GACP Platform
# Backend ต้องรันอยู่แล้วที่ port 3000

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  🎯 GACP Smoke Test Runner" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ตรวจสอบว่า Backend รันอยู่หรือไม่
Write-Host "🔍 Checking backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "`nPlease start backend first:" -ForegroundColor Yellow
    Write-Host "  cd apps/backend" -ForegroundColor White
    Write-Host "  npm start`n" -ForegroundColor White
    exit 1
}

# รัน Smoke Test
Write-Host "`n🚀 Starting Smoke Test (60 seconds)...`n" -ForegroundColor Green
node load-tests/scripts/run-load-test.js smoke

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Smoke Test completed successfully!" -ForegroundColor Green
    
    # ถามว่าจะรัน Load Test ต่อหรือไม่
    Write-Host "`n📊 Do you want to run Load Test (5 minutes)? [Y/N]" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "`n🚀 Starting Load Test (5 minutes)...`n" -ForegroundColor Green
        node load-tests/scripts/run-load-test.js load
    }
} else {
    Write-Host "`n❌ Smoke Test failed!" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ Testing Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
