# ========================================
# GACP Load Testing - Quick Start
# ========================================
#
# คำแนะนำ:
# 1. เปิด Terminal window ใหม่และรัน Backend:
#    cd apps/backend
#    npm start
#
# 2. รอจนเห็น "Ready for frontend development!"
#
# 3. กลับมารัน script นี้:
#    .\quick-test.ps1
#
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  GACP Load Testing - Quick Start" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ตรวจสอบ Backend
Write-Host "Checking backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "Backend OK" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Backend NOT running!" -ForegroundColor Red
    Write-Host "`nPlease start backend first in a new terminal:" -ForegroundColor Yellow
    Write-Host "  cd apps/backend" -ForegroundColor White
    Write-Host "  npm start`n" -ForegroundColor White
    Write-Host "Then run this script again.`n" -ForegroundColor Yellow
    exit 1
}

# รัน Smoke Test
Write-Host "Running Smoke Test (60 seconds)...`n" -ForegroundColor Green
node load-tests/scripts/run-load-test.js smoke

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# แสดงผลลัพธ์
$latestReport = Get-ChildItem -Path "load-tests\results\" -Filter "report-smoke-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestReport) {
    Write-Host "Report: $($latestReport.Name)" -ForegroundColor Cyan
    Write-Host "`nTo analyze results:" -ForegroundColor Yellow
    Write-Host "  node load-tests/scripts/analyze-performance.js load-tests/results/$($latestReport.Name)`n" -ForegroundColor White
}
