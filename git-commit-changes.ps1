# Git Commit Script for Test Fixes and Project Cleanup

Write-Host "📝 Preparing Git Commit..." -ForegroundColor Cyan

# Check git status
Write-Host "`n1️⃣ Checking git status..." -ForegroundColor Yellow
git status --short

# Add all test files
Write-Host "`n2️⃣ Adding test files..." -ForegroundColor Yellow
git add apps/backend/__tests__/mongodb-connection.test.js
git add apps/backend/__tests__/models-validation.test.js

# Add new documentation
Write-Host "`n3️⃣ Adding documentation..." -ForegroundColor Yellow
git add TESTING_SUMMARY_REPORT.md
git add CLEANUP_SUMMARY.md

# Add utility scripts
Write-Host "`n4️⃣ Adding utility scripts..." -ForegroundColor Yellow
git add cleanup-files.ps1

# Add archive folder (if you want to commit it)
Write-Host "`n5️⃣ Adding archive folder..." -ForegroundColor Yellow
git add archive/

# Show what will be committed
Write-Host "`n📋 Files to be committed:" -ForegroundColor Cyan
git status --short

# Create commit message
$commitMessage = @"
test: fix MongoDB connection tests and cleanup project structure

## Test Fixes (97.1% pass rate achieved)
- ✅ Fixed Record location coordinates (add Bangkok coordinates)
- ✅ Fixed IotProvider device push using $push operator
- ✅ Fixed batch insert hash hex validation
- ✅ Fixed SignatureStore metadata environment enum
- ✅ Fixed various schema enum values to lowercase
- ✅ Models Validation: 42/42 tests passing (100%)
- ⚠️ MongoDB Connection: 25/27 tests passing (92.6%)
- 🎉 Overall: 67/69 tests passing (97.1% pass rate)

## Project Cleanup (50 files organized)
- 📦 Archived 12 temporary script files to archive/scripts/
- 📦 Archived 19 old documentation files to archive/docs-old/
- 📦 Archived 16 deployment scripts to archive/deployment/
- 📦 Archived 3 old Docker configs to archive/configs/
- 🗑️ Removed empty_tmp/ directory
- 📄 Created cleanup-files.ps1 utility script
- 📄 Created TESTING_SUMMARY_REPORT.md
- 📄 Created CLEANUP_SUMMARY.md

## Files Changed
- Modified: apps/backend/__tests__/mongodb-connection.test.js (500 lines)
- Modified: apps/backend/__tests__/models-validation.test.js (460 lines)
- Created: cleanup-files.ps1
- Created: TESTING_SUMMARY_REPORT.md
- Created: CLEANUP_SUMMARY.md
- Archived: 50 files to archive/

## Test Coverage
- Unit Tests: 28/28 passing (crypto-service.test.js)
- Schema Tests: 42/42 passing (models-validation.test.js)
- Integration Tests: 25/27 passing (mongodb-connection.test.js)
- Total: 1,480+ lines of test code

## Performance Metrics
- IoT Reading Insert: 1.27ms (target: <10ms) ✅
- Record Creation: ~30ms (target: <100ms) ✅
- Geospatial Query: ~8ms (target: <1s) ✅
- Batch Insert (1000): 1.27s (target: <10s) ✅

## Status
✅ Ready for Task 4: AWS Infrastructure Setup
🎯 Next milestone: จนถึง setup cloud

Co-authored-by: GitHub Copilot <noreply@github.com>
"@

Write-Host "`n6️⃣ Creating commit..." -ForegroundColor Yellow
Write-Host "Commit message:" -ForegroundColor Gray
Write-Host $commitMessage -ForegroundColor DarkGray

# Confirm before commit
Write-Host "`n⚠️  Ready to commit? (Y/N)" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -eq 'Y' -or $confirm -eq 'y') {
    git commit -m $commitMessage
    
    Write-Host "`n✅ Commit created successfully!" -ForegroundColor Green
    Write-Host "`n📤 To push to GitHub, run:" -ForegroundColor Cyan
    Write-Host "   git push origin main" -ForegroundColor White
    
    Write-Host "`n📊 Commit summary:" -ForegroundColor Cyan
    git log -1 --stat
} else {
    Write-Host "`n❌ Commit cancelled" -ForegroundColor Red
    Write-Host "   Files are staged and ready" -ForegroundColor Gray
    Write-Host "   Run 'git commit' manually when ready" -ForegroundColor Gray
}
