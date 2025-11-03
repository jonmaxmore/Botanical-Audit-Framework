# Cleanup and Organize Project Structure
# This script moves temporary/old files to archive and organizes the project

Write-Host "🧹 Starting Project Cleanup..." -ForegroundColor Cyan

# Create archive directories if they don't exist
$archiveDirs = @(
    "archive/scripts",
    "archive/docs-old",
    "archive/configs",
    "archive/deployment-scripts"
)

foreach ($dir in $archiveDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created: $dir" -ForegroundColor Green
    }
}

# Move old/temporary script files
$scriptsToArchive = @(
    "add-eslint-disable.js",
    "api-integration-layer.js",
    "fix-all-logger-imports.js",
    "fix-grid-size-to-item.js",
    "fix-logger-imports.js",
    "fix-mui-grid.js",
    "fix-unused-vars.js",
    "generate-jwt-secret.js",
    "remove-unused-imports.js",
    "gacp-simple-server.mjs",
    "robust-gacp-server.mjs",
    "server.mjs"
)

Write-Host "`n📦 Archiving temporary scripts..." -ForegroundColor Yellow
foreach ($file in $scriptsToArchive) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "archive/scripts/" -Force
        Write-Host "  ✓ Moved: $file" -ForegroundColor Gray
    }
}

# Move old documentation files
$docsToArchive = @(
    "ARCHITECTURE_UPDATE_MONGODB_IOT_SUMMARY.md",
    "DIGITAL_SIGNATURE_MONGODB_IOT_ARCHITECTURE.md",
    "DIGITAL_SIGNATURE_TRACEABILITY_ARCHITECTURE.md",
    "DOCUMENTATION_CLEANUP_SUMMARY.md",
    "FEATURE_2_COMPLETE.md",
    "FEATURE_2_TESTING_REPORT.md",
    "FEATURE_3_COMPLETE.md",
    "INSPECTION_SYSTEM_SUMMARY.md",
    "INTEGRATION_TEST_REPORT.md",
    "NOTIFICATION_TESTING_GUIDE.md",
    "NOTIFICATION_TESTING_SUMMARY.md",
    "PHASE1_COMPLETION_SUMMARY.md",
    "PHASE_2_FARM_MANAGEMENT_STATUS.md",
    "QUICK_TEST_GUIDE.md",
    "SMART_PLATFORM_360_DESIGN.md",
    "STAFF_WORKFLOW_SUMMARY.md",
    "STRATEGIC_BUSINESS_TECHNOLOGY_ANALYSIS_2025-2035.md",
    "SYSTEM_STATUS.md",
    "TEAM_ONBOARDING_GUIDE.md",
    "UPGRADE_PLAN_PHASE1.md",
    "WEEK1_COMPLETE_SUMMARY.md"
)

Write-Host "`n📚 Archiving old documentation..." -ForegroundColor Yellow
foreach ($file in $docsToArchive) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "archive/docs-old/" -Force
        Write-Host "  ✓ Moved: $file" -ForegroundColor Gray
    }
}

# Move old deployment scripts
$deployScriptsToArchive = @(
    "create-ec2.ps1",
    "create-ec2.sh",
    "deploy-now.ps1",
    "deploy-pdf-system.bat",
    "deploy-production.ps1",
    "deploy-simple.ps1",
    "deploy.ps1",
    "quick-test.ps1",
    "run-smoke-test.ps1",
    "run-tests.bat",
    "setup-ec2.sh",
    "setup-infrastructure.js",
    "start-all-services.js",
    "start-dev-simple.ps1",
    "start-dev.js",
    "start-dev.ps1",
    "start-frontend.js",
    "start-production.ps1",
    "stop-dev.ps1",
    "test-api.ps1",
    "test-notification-system.js",
    "upload-to-ec2.ps1",
    "verify-deployment.ps1"
)

Write-Host "`n🚀 Archiving old deployment scripts..." -ForegroundColor Yellow
foreach ($file in $deployScriptsToArchive) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "archive/deployment-scripts/" -Force
        Write-Host "  ✓ Moved: $file" -ForegroundColor Gray
    }
}

# Move old config files
$configsToArchive = @(
    "docker-compose.pdf.yml",
    "docker-compose.prod.yml",
    "docker-compose.production.yml"
)

Write-Host "`n⚙️  Archiving old config files..." -ForegroundColor Yellow
foreach ($file in $configsToArchive) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "archive/configs/" -Force
        Write-Host "  ✓ Moved: $file" -ForegroundColor Gray
    }
}

# Clean up empty directories
$emptyDirs = @(
    "empty_tmp",
    "business-logic",
    "backend"
)

Write-Host "`n🗑️  Removing empty directories..." -ForegroundColor Yellow
foreach ($dir in $emptyDirs) {
    if (Test-Path $dir) {
        $items = Get-ChildItem -Path $dir -Recurse
        if ($items.Count -eq 0) {
            Remove-Item -Path $dir -Recurse -Force
            Write-Host "  ✓ Removed: $dir" -ForegroundColor Gray
        } else {
            Write-Host "  ⚠ Skipped (not empty): $dir" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n✅ Project cleanup completed!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "  - Old scripts moved to: archive/scripts/" -ForegroundColor Gray
Write-Host "  - Old docs moved to: archive/docs-old/" -ForegroundColor Gray
Write-Host "  - Deployment scripts moved to: archive/deployment-scripts/" -ForegroundColor Gray
Write-Host "  - Old configs moved to: archive/configs/" -ForegroundColor Gray
Write-Host "`n💡 Tip: Review archive folder before committing." -ForegroundColor Yellow
