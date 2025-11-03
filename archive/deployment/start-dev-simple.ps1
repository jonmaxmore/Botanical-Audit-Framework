# Development Start Script
# ใช้สำหรับ development - ไม่ใช้ PM2 เพื่อหลีกเลี่ยง zombie processes

$separator = "=" * 80

Write-Host "Starting Botanical Audit Framework (Development Mode)" -ForegroundColor Green
Write-Host $separator
Write-Host ""

# Check MongoDB
$mongoService = Get-Service | Where-Object { $_.DisplayName -like "*MongoDB*" }
if ($mongoService.Status -ne "Running") {
    Write-Host "MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    exit 1
}
Write-Host "MongoDB is running" -ForegroundColor Green

Write-Host ""
Write-Host "Starting servers in development mode..." -ForegroundColor Cyan
Write-Host "This will open 2 terminal windows:" -ForegroundColor Yellow
Write-Host "  1. Backend  (Port 5000)" -ForegroundColor White
Write-Host "  2. Frontend (Port 3000)" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
Write-Host ""

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\backend'; Write-Host '=== Backend Server ===' -ForegroundColor Green; pnpm start"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\frontend'; Write-Host '=== Frontend Server ===' -ForegroundColor Cyan; pnpm dev"

Write-Host ""
Write-Host $separator
Write-Host "Servers starting..." -ForegroundColor Green
Write-Host $separator
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "To stop: Close both terminal windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host ""
