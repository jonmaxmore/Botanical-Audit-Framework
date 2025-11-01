# organize-docs.ps1
# -------------------------------------------------
# PowerShell script to organize scattered .md docs
# into structured folders under /docs/
# -------------------------------------------------

$root = Get-Location
$docsRoot = "$root\docs"

# Target folders
$folders = @("deployment", "development", "governance", "legacy")
foreach ($f in $folders) {
    $path = Join-Path $docsRoot $f
    if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

# Move rules
$moveMap = @{
    "DEPLOY_CHECKLIST.md"                  = "deployment\deploy-checklist.md"
    "DEPLOY_COMMANDS.md"                   = "deployment\deploy-commands.md"
    "AWS_EC2_SETUP.md"                     = "deployment\aws-ec2-setup.md"
    "AWS_VPC_SETUP.md"                     = "deployment\aws-vpc-setup.md"
    "PRODUCTION_DEPLOYMENT_GUIDE.md"       = "deployment\production-deployment-guide.md"
    "PRODUCTION_DEPLOYMENT_READY.md"       = "deployment\production-deployment-ready.md"
    "ARCHITECTURE_CODING_STANDARDS_AUDIT.md" = "deployment\architecture-coding-standards.md"
    "DEVELOPMENT_GUIDE.md"                 = "development\development-guide.md"
    "DOCUMENTATION_CONSOLIDATION_PLAN.md"  = "development\documentation-consolidation-plan.md"
    "QUICK_START.md"                       = "development\quick-start.md"
    "COPY_PASTE_COMMANDS.txt"              = "legacy\copy-paste-commands.txt"
    "DEPLOY_47.130.0.164.txt"              = "legacy\deploy_47.130.0.164.txt"
}

# Move each file if exists
foreach ($src in $moveMap.Keys) {
    $srcPath = Join-Path $root $src
    if (Test-Path $srcPath) {
        $destPath = Join-Path $docsRoot $moveMap[$src]
        Move-Item $srcPath $destPath -Force
        Write-Host "Moved $src → $destPath" -ForegroundColor Green
    } else {
        Write-Host "File not found: $src" -ForegroundColor Yellow
    }
}

# Create docs/README.md index
$indexPath = Join-Path $docsRoot "README.md"
@"
# Documentation Hub

Welcome to the Botanical Audit Framework Documentation.

## Deployment
- [Production Deployment Guide](deployment/production-deployment-guide.md)
- [Deployment Checklist](deployment/deploy-checklist.md)
- [AWS EC2 Setup](deployment/aws-ec2-setup.md)
- [Docker Compose Setup](deployment/docker-compose-setup.md)

## Development
- [Development Guide](development/development-guide.md)
- [Quick Start](development/quick-start.md)
- [Documentation Consolidation Plan](development/documentation-consolidation-plan.md)

## Governance
- [Documentation Log](governance/documentation-log.md)
- [Archive Validation](governance/archive-validation.md)

## Legacy
- [Old Commands](legacy/copy-paste-commands.txt)
"@ | Out-File -Encoding utf8 $indexPath

Write-Host "`n✅ Documentation successfully organized!" -ForegroundColor Cyan
