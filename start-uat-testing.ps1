# 🎯 Quick Start: UAT Testing
# User Acceptance Testing for GACP Platform

Write-Host "🎯 Starting User Acceptance Testing (UAT)..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if mock server is running
Write-Host "🔍 Checking mock API server..." -ForegroundColor Yellow
$mockServerRunning = Get-Process node -ErrorAction SilentlyContinue | 
    Where-Object { $_.MainWindowTitle -like "*mock-api-server*" }

if (-not $mockServerRunning) {
    Write-Host "🚀 Starting mock API server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "node test/mock-api-server.js" -WindowStyle Minimized
    Write-Host "⏳ Waiting for server to start (5 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
} else {
    Write-Host "✅ Mock server already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Running UAT Test Suite..." -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Run UAT tests
try {
    node scripts/run-uat-tests.js
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✅ UAT Testing Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 View detailed results above" -ForegroundColor Yellow
    Write-Host "📖 Read UAT Guide: docs/UAT_GUIDE.md" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "❌ UAT Testing Failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Verify mock server is running: node test/mock-api-server.js" -ForegroundColor White
    Write-Host "2. Check test environment: node scripts/verify-test-environment.js" -ForegroundColor White
    Write-Host "3. Review UAT Guide: docs/UAT_GUIDE.md" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "🎓 Next Steps:" -ForegroundColor Cyan
Write-Host "  • Compare with QA results: .\start-qa-testing.ps1" -ForegroundColor White
Write-Host "  • Review UAT documentation: docs/UAT_GUIDE.md" -ForegroundColor White
Write-Host "  • Get stakeholder sign-off" -ForegroundColor White
Write-Host ""
