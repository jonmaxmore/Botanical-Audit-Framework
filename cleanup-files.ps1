# Cleanup Project - Move old files to archive
Write-Host "Starting project cleanup..." -ForegroundColor Cyan

# Create archive directories
$dirs = "archive/scripts", "archive/docs-old", "archive/configs", "archive/deployment"
foreach ($d in $dirs) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
        Write-Host "Created: $d" -ForegroundColor Green
    }
}

# Move script files
$scripts = @(
    "add-eslint-disable.js",
    "api-integration-layer.js",
    "fix-*.js",
    "generate-jwt-secret.js",
    "remove-unused-imports.js",
    "*-server.mjs",
    "server.mjs"
)

Write-Host "Moving scripts..." -ForegroundColor Yellow
foreach ($pattern in $scripts) {
    Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item $_.FullName "archive/scripts/" -Force
        Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
    }
}

# Move documentation
$docs = @(
    "*_SUMMARY.md",
    "*_COMPLETE.md",
    "*_REPORT.md",
    "*_GUIDE.md",
    "*_STATUS.md",
    "*_ANALYSIS_*.md",
    "*_DESIGN.md"
)

Write-Host "Moving documentation..." -ForegroundColor Yellow
foreach ($pattern in $docs) {
    Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.Name -ne "README.md") {
            Move-Item $_.FullName "archive/docs-old/" -Force
            Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
        }
    }
}

# Move deployment scripts
$deploy = @(
    "deploy-*.ps1",
    "deploy*.bat",
    "start-*.ps1",
    "start-*.js",
    "stop-*.ps1",
    "test-*.ps1",
    "*-ec2.*",
    "setup-*.sh",
    "upload-*.ps1",
    "verify-*.ps1"
)

Write-Host "Moving deployment scripts..." -ForegroundColor Yellow
foreach ($pattern in $deploy) {
    Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item $_.FullName "archive/deployment/" -Force
        Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
    }
}

# Move old docker configs
Write-Host "Moving old configs..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "docker-compose.*.yml" -File -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.Name -ne "docker-compose.yml") {
        Move-Item $_.FullName "archive/configs/" -Force
        Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
    }
}

Write-Host "Project cleanup completed!" -ForegroundColor Green
Write-Host "Review archive/ folder before committing." -ForegroundColor Yellow
