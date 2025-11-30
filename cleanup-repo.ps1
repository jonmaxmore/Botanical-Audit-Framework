# Repository Cleanup Script (Safe Mode)
# Removes debug files, logs, and temporary artifacts
# Author: Repository Maintainer
# Date: 2025-11-30

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GACP Repository Cleanup (Safe Mode)  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define root directory
$rootDir = $PSScriptRoot

# Define file patterns to remove
$patterns = @(
    "*.log",
    "*_output.txt",
    "*_errors.txt",
    "debug_*.txt",
    "lint_*.txt",
    "verify_*.txt",
    "test_*.txt",
    "test_*.log",
    "*_lint.txt",
    "backend_lint*.txt",
    "prod_lint*.txt",
    "final_lint*.txt"
)

# Define specific files to remove
$specificFiles = @(
    "apps\backend\scripts\debug-loader.js"
)

# Collect all files to delete
$filesToDelete = @()

Write-Host "🔍 Scanning for garbage files..." -ForegroundColor Yellow
Write-Host ""

# Find files by pattern
foreach ($pattern in $patterns) {
    $found = Get-ChildItem -Path $rootDir -Recurse -Filter $pattern -File -ErrorAction SilentlyContinue
    foreach ($file in $found) {
        # Exclude node_modules and .git directories
        if ($file.FullName -notmatch "node_modules" -and $file.FullName -notmatch "\.git") {
            $filesToDelete += $file
        }
    }
}

# Add specific files
foreach ($specificFile in $specificFiles) {
    $fullPath = Join-Path $rootDir $specificFile
    if (Test-Path $fullPath) {
        $filesToDelete += Get-Item $fullPath
    }
}

# Remove duplicates
$filesToDelete = $filesToDelete | Sort-Object FullName -Unique

# Display findings
if ($filesToDelete.Count -eq 0) {
    Write-Host "✅ No garbage files found! Repository is clean." -ForegroundColor Green
    exit 0
}

Write-Host "⚠️  Found $($filesToDelete.Count) files to delete:" -ForegroundColor Yellow
Write-Host ""

# Group by directory for better readability
$groupedFiles = $filesToDelete | Group-Object { Split-Path $_.FullName -Parent }

foreach ($group in $groupedFiles) {
    $relativeDir = $group.Name.Replace($rootDir, "").TrimStart("\")
    Write-Host "📁 $relativeDir" -ForegroundColor Cyan
    foreach ($file in $group.Group) {
        $size = "{0:N2} KB" -f ($file.Length / 1KB)
        Write-Host "   - $($file.Name) ($size)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Calculate total size
$totalSize = ($filesToDelete | Measure-Object -Property Length -Sum).Sum
$totalSizeMB = "{0:N2} MB" -f ($totalSize / 1MB)

Write-Host "📊 Total: $($filesToDelete.Count) files, $totalSizeMB" -ForegroundColor Yellow
Write-Host ""

# Confirmation prompt
Write-Host "⚠️  WARNING: This action cannot be undone!" -ForegroundColor Red
$confirmation = Read-Host "Do you want to delete these files? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host ""
    Write-Host "❌ Cleanup cancelled by user." -ForegroundColor Yellow
    exit 0
}

# Delete files
Write-Host ""
Write-Host "🗑️  Deleting files..." -ForegroundColor Yellow

$deletedCount = 0
$failedCount = 0

foreach ($file in $filesToDelete) {
    try {
        Remove-Item $file.FullName -Force
        $deletedCount++
        Write-Host "   ✓ Deleted: $($file.Name)" -ForegroundColor Green
    }
    catch {
        $failedCount++
        Write-Host "   ✗ Failed: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "   Deleted: $deletedCount files" -ForegroundColor Green
if ($failedCount -gt 0) {
    Write-Host "   Failed: $failedCount files" -ForegroundColor Red
}
Write-Host "   Freed: $totalSizeMB" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review changes: git status" -ForegroundColor Gray
Write-Host "   2. Commit cleanup: git add . && git commit -m 'chore: cleanup repository garbage'" -ForegroundColor Gray
Write-Host ""
