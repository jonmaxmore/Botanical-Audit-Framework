# Production Start Script with PM2
# ใช้สำหรับ production - PM2 จะจัดการ auto-restart

$separator = "=" * 80

Write-Host "Starting Botanical Audit Framework (Production Mode)" -ForegroundColor Green
Write-Host $separator
Write-Host ""

# Check MongoDB
$mongoService = Get-Service | Where-Object { $_.DisplayName -like "*MongoDB*" }
if ($mongoService.Status -ne "Running") {
    Write-Host "MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    exit 1
}
Write-Host "MongoDB is running" -ForegroundColor Green

# Check if PM2 is installed
try {
    $null = pnpm exec pm2 --version
    Write-Host "PM2 is installed" -ForegroundColor Green
} catch {
    Write-Host "PM2 is not installed. Installing..." -ForegroundColor Yellow
    pnpm add -D -w pm2
}

# Check if frontend is built
$buildPath = ".\apps\frontend\.next"
if (-not (Test-Path $buildPath)) {
    Write-Host ""
    Write-Host "Frontend not built. Building..." -ForegroundColor Yellow
    Set-Location ".\apps\frontend"
    pnpm build
    Set-Location "..\..\"
}

Write-Host ""
Write-Host "Checking for port conflicts..." -ForegroundColor Yellow

$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
if ($port3000) {
    Write-Host "Killing process on port 3000..." -ForegroundColor Yellow
    $processId = ($port3000 -split "\s+")[5]
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

$port5000 = netstat -ano | findstr ":5000" | findstr "LISTENING"
if ($port5000) {
    Write-Host "Killing process on port 5000..." -ForegroundColor Yellow
    $processId = ($port5000 -split "\s+")[5]
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Write-Host "Ports are clear" -ForegroundColor Green

Write-Host ""
Write-Host "Stopping existing PM2 processes..." -ForegroundColor Yellow
pnpm exec pm2 delete all 2>$null

Write-Host "Starting servers with PM2 (production mode)..." -ForegroundColor Cyan
pnpm exec pm2 start ecosystem.config.js --env production

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "PM2 Status:" -ForegroundColor Green
pnpm exec pm2 status

Write-Host ""
Write-Host $separator
Write-Host "Production servers are running with PM2!" -ForegroundColor Green
Write-Host ""

Write-Host "Useful PM2 Commands:" -ForegroundColor Cyan
Write-Host "  pnpm exec pm2 status        - View status" -ForegroundColor White
Write-Host "  pnpm exec pm2 logs          - View logs (real-time)" -ForegroundColor White
Write-Host "  pnpm exec pm2 logs backend  - View backend logs" -ForegroundColor White
Write-Host "  pnpm exec pm2 logs frontend - View frontend logs" -ForegroundColor White
Write-Host "  pnpm exec pm2 restart all   - Restart all" -ForegroundColor White
Write-Host "  pnpm exec pm2 stop all      - Stop all" -ForegroundColor White
Write-Host "  pnpm exec pm2 monit         - Monitor (real-time)" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host $separator
