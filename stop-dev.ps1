# Stop Development Servers (PM2 Version)
# This script stops all PM2 processes

$separator = "=" * 80

Write-Host "Stopping Botanical Audit Framework (PM2)" -ForegroundColor Red
Write-Host $separator

# Stop all PM2 processes
Write-Host "Stopping all PM2 processes..." -ForegroundColor Yellow
pnpm exec pm2 stop all

Write-Host ""
Write-Host "Deleting PM2 processes..." -ForegroundColor Yellow
pnpm exec pm2 delete all

Write-Host ""
Write-Host $separator
Write-Host "All servers stopped" -ForegroundColor Green
Write-Host $separator
Write-Host ""
