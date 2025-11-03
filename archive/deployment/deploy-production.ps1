# ==========================================
# GACP Platform - Production Deployment Script
# ==========================================
# Date: October 21, 2025
# Purpose: One-click production deployment
# ==========================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('docker', 'local', 'cloud')]
    [string]$DeploymentType = 'docker',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipChecks,
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateSecrets,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild
)

# Color functions
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Error-Custom { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Header { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Magenta }

# ==========================================
# 1. HEADER & INTRODUCTION
# ==========================================
Clear-Host
Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 GACP Platform - Production Deployment Wizard        ║
║                                                           ║
║   Botanical Audit Framework                              ║
║   Version: 2.0.0 Production                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Info "Deployment Type: $DeploymentType"
Write-Info "Script Location: $PSScriptRoot"
Write-Host ""

# ==========================================
# 2. PRE-DEPLOYMENT CHECKS
# ==========================================
Write-Header "Pre-Deployment Checks"

$checks = @{
    Docker = $false
    DockerCompose = $false
    Node = $false
    Git = $false
    MongoDB = $false
    Redis = $false
}

if (-not $SkipChecks) {
    # Check Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            $checks.Docker = $true
            Write-Success "Docker installed: $dockerVersion"
        }
    } catch {
        Write-Warning "Docker not found"
    }

    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        if ($composeVersion) {
            $checks.DockerCompose = $true
            Write-Success "Docker Compose installed: $composeVersion"
        }
    } catch {
        Write-Warning "Docker Compose not found"
    }

    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $checks.Node = $true
            Write-Success "Node.js installed: $nodeVersion"
        }
    } catch {
        Write-Warning "Node.js not found"
    }

    # Check Git
    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            $checks.Git = $true
            Write-Success "Git installed: $gitVersion"
        }
    } catch {
        Write-Warning "Git not found"
    }

    Write-Host ""
} else {
    Write-Info "Skipping pre-deployment checks..."
}

# ==========================================
# 3. GENERATE SECRETS
# ==========================================
if ($GenerateSecrets) {
    Write-Header "Generating Secure Secrets"
    
    function Generate-Secret {
        param([int]$length = 64)
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        -join ((1..$length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    }
    
    $secrets = @{
        JWT_SECRET = Generate-Secret -length 64
        JWT_REFRESH_SECRET = Generate-Secret -length 64
        MONGO_ROOT_PASSWORD = Generate-Secret -length 32
        REDIS_PASSWORD = Generate-Secret -length 32
        GRAFANA_PASSWORD = Generate-Secret -length 24
        SESSION_SECRET = Generate-Secret -length 48
    }
    
    Write-Info "Generated secrets (save these securely!):"
    Write-Host ""
    foreach ($key in $secrets.Keys) {
        Write-Host "${key}=" -NoNewline -ForegroundColor Yellow
        Write-Host "$($secrets[$key])" -ForegroundColor White
    }
    Write-Host ""
    
    $secretsFile = Join-Path $PSScriptRoot ".env.secrets"
    $secrets.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" } | Out-File $secretsFile -Encoding utf8
    Write-Success "Secrets saved to: $secretsFile"
    Write-Warning "⚠️  Keep this file secure and do NOT commit to Git!"
    Write-Host ""
}

# ==========================================
# 4. ENVIRONMENT CONFIGURATION
# ==========================================
Write-Header "Environment Configuration"

$envFile = Join-Path $PSScriptRoot ".env.production"
$envExampleFile = Join-Path $PSScriptRoot ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExampleFile) {
        Write-Info "Creating .env.production from .env.example..."
        Copy-Item $envExampleFile $envFile
        Write-Success "Created .env.production"
        Write-Warning "⚠️  Please edit .env.production with your production values!"
        
        # Prompt user to edit
        $editNow = Read-Host "Would you like to edit .env.production now? (y/n)"
        if ($editNow -eq 'y') {
            notepad $envFile
            Write-Info "Waiting for you to save and close the editor..."
            Read-Host "Press Enter when you're done editing"
        }
    } else {
        Write-Error-Custom ".env.example not found! Creating minimal .env.production..."
        
        $minimalEnv = @"
# GACP Platform - Production Environment
NODE_ENV=production

# Database
MONGO_ROOT_USER=gacp_admin
MONGO_ROOT_PASSWORD=CHANGE_ME_STRONG_PASSWORD
MONGODB_URI=mongodb://gacp_admin:CHANGE_ME_STRONG_PASSWORD@mongodb:27017/gacp_production?authSource=admin

# Redis
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD

# JWT
JWT_SECRET=CHANGE_ME_JWT_SECRET_64_CHARS_MIN
JWT_REFRESH_SECRET=CHANGE_ME_JWT_REFRESH_SECRET_64_CHARS_MIN

# API
GACP_API_PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=CHANGE_ME_GRAFANA_PASSWORD

# SSL (for production)
DOMAIN_NAME=yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
"@
        $minimalEnv | Out-File $envFile -Encoding utf8
        Write-Warning "⚠️  Created minimal .env.production - MUST edit before deploying!"
        Write-Warning "⚠️  Run with -GenerateSecrets flag to generate secure passwords"
        
        $continueAnyway = Read-Host "Continue with default values? (NOT RECOMMENDED) (y/n)"
        if ($continueAnyway -ne 'y') {
            Write-Error-Custom "Deployment cancelled. Please configure .env.production first."
            exit 1
        }
    }
} else {
    Write-Success ".env.production exists"
    
    # Validate critical variables
    $envContent = Get-Content $envFile -Raw
    $criticalVars = @('MONGO_ROOT_PASSWORD', 'JWT_SECRET', 'REDIS_PASSWORD')
    $missingVars = @()
    
    foreach ($var in $criticalVars) {
        if ($envContent -notmatch "$var=.+") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Warning "Missing or empty critical variables: $($missingVars -join ', ')"
        $editNow = Read-Host "Would you like to edit .env.production now? (y/n)"
        if ($editNow -eq 'y') {
            notepad $envFile
        }
    } else {
        Write-Success "All critical environment variables are set"
    }
}

Write-Host ""

# ==========================================
# 5. DEPLOYMENT EXECUTION
# ==========================================
Write-Header "Starting Deployment: $DeploymentType"

switch ($DeploymentType) {
    'docker' {
        Write-Info "Deploying with Docker Compose..."
        
        if (-not $checks.Docker -or -not $checks.DockerCompose) {
            Write-Error-Custom "Docker or Docker Compose not found!"
            Write-Info "Install from: https://docs.docker.com/get-docker/"
            exit 1
        }
        
        $composeFile = Join-Path $PSScriptRoot "docker-compose.production.yml"
        
        if (-not (Test-Path $composeFile)) {
            Write-Error-Custom "docker-compose.production.yml not found!"
            exit 1
        }
        
        Write-Info "Docker Compose file: $composeFile"
        Write-Info "Environment file: $envFile"
        Write-Host ""
        
        # Confirm deployment
        Write-Warning "This will:"
        Write-Host "  • Pull/build Docker images"
        Write-Host "  • Create Docker volumes for persistent data"
        Write-Host "  • Start 12+ services (MongoDB, Redis, API, Frontend, Monitoring, etc.)"
        Write-Host "  • Expose ports: 80, 443, 3000, 4000, 27017, 6379, 9090, 3001, 9200, 5601"
        Write-Host ""
        
        $confirm = Read-Host "Continue with deployment? (y/n)"
        if ($confirm -ne 'y') {
            Write-Info "Deployment cancelled by user"
            exit 0
        }
        
        Write-Info "Building and starting services..."
        
        if ($SkipBuild) {
            docker-compose -f $composeFile --env-file $envFile up -d
        } else {
            docker-compose -f $composeFile --env-file $envFile up -d --build
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker services started successfully!"
            Write-Host ""
            
            # Wait for services to be ready
            Write-Info "Waiting for services to be ready (30 seconds)..."
            Start-Sleep -Seconds 30
            
            # Show service status
            Write-Header "Service Status"
            docker-compose -f $composeFile ps
            
            Write-Host ""
            Write-Success "✅ Deployment Complete!"
            Write-Host ""
            Write-Info "Access your services:"
            Write-Host "  • Frontend:    http://localhost:3000" -ForegroundColor Cyan
            Write-Host "  • API:         http://localhost:4000" -ForegroundColor Cyan
            Write-Host "  • Grafana:     http://localhost:3001" -ForegroundColor Cyan
            Write-Host "  • Prometheus:  http://localhost:9090" -ForegroundColor Cyan
            Write-Host "  • Kibana:      http://localhost:5601" -ForegroundColor Cyan
            Write-Host ""
            
            # Health check
            Write-Header "Health Check"
            Write-Info "Checking API health..."
            Start-Sleep -Seconds 5
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Success "API is healthy!"
                }
            } catch {
                Write-Warning "Could not reach API health endpoint (may still be starting up)"
            }
            
        } else {
            Write-Error-Custom "Docker deployment failed! Check logs above."
            Write-Info "View logs with: docker-compose -f $composeFile logs"
            exit 1
        }
    }
    
    'local' {
        Write-Info "Deploying locally with PM2..."
        
        if (-not $checks.Node) {
            Write-Error-Custom "Node.js not found! Install from: https://nodejs.org/"
            exit 1
        }
        
        # Check PM2
        try {
            $pm2Version = pm2 --version 2>$null
            Write-Success "PM2 installed: v$pm2Version"
        } catch {
            Write-Info "Installing PM2..."
            npm install -g pm2
        }
        
        # Install dependencies
        Write-Info "Installing dependencies..."
        pnpm install
        
        # Build applications
        if (-not $SkipBuild) {
            Write-Info "Building applications..."
            
            # Build frontend
            Set-Location (Join-Path $PSScriptRoot "frontend-nextjs")
            npm run build
            
            Set-Location $PSScriptRoot
        }
        
        # Start with PM2
        Write-Info "Starting services with PM2..."
        $ecosystemFile = Join-Path $PSScriptRoot "ecosystem.config.js"
        
        if (Test-Path $ecosystemFile) {
            pm2 start $ecosystemFile --env production
            pm2 save
            
            Write-Success "Services started with PM2!"
            Write-Info "View status: pm2 status"
            Write-Info "View logs: pm2 logs"
            Write-Info "Monitor: pm2 monit"
        } else {
            Write-Error-Custom "ecosystem.config.js not found!"
            exit 1
        }
    }
    
    'cloud' {
        Write-Info "Cloud deployment selected..."
        Write-Host ""
        Write-Info "Choose your cloud provider:"
        Write-Host "  1. AWS (Elastic Beanstalk / ECS)"
        Write-Host "  2. Azure (Container Instances / App Service)"
        Write-Host "  3. Google Cloud (Cloud Run / GKE)"
        Write-Host "  4. Manual (show instructions)"
        Write-Host ""
        
        $cloudChoice = Read-Host "Enter choice (1-4)"
        
        switch ($cloudChoice) {
            '1' {
                Write-Info "AWS Deployment Instructions:"
                Write-Host ""
                Write-Host "Option A - Elastic Beanstalk:" -ForegroundColor Yellow
                Write-Host "  eb init -p docker gacp-platform"
                Write-Host "  eb create gacp-production"
                Write-Host "  eb deploy"
                Write-Host ""
                Write-Host "Option B - ECS with Fargate:" -ForegroundColor Yellow
                Write-Host "  aws ecr create-repository --repository-name gacp-api"
                Write-Host "  docker build -f Dockerfile.api -t gacp-api ."
                Write-Host "  docker tag gacp-api:latest <account>.dkr.ecr.us-east-1.amazonaws.com/gacp-api:latest"
                Write-Host "  docker push <account>.dkr.ecr.us-east-1.amazonaws.com/gacp-api:latest"
                Write-Host ""
                Write-Info "Full guide: docs/PRODUCTION_DEPLOYMENT_GUIDE.md"
            }
            '2' {
                Write-Info "Azure Deployment Instructions:"
                Write-Host ""
                Write-Host "az login"
                Write-Host "az group create --name gacp-rg --location eastus"
                Write-Host "az acr create --resource-group gacp-rg --name gacpregistry --sku Basic"
                Write-Host "az acr build --registry gacpregistry --image gacp-api:latest ."
                Write-Host "az container create --resource-group gacp-rg --name gacp-api --image gacpregistry.azurecr.io/gacp-api:latest"
                Write-Host ""
                Write-Info "Full guide: docs/PRODUCTION_DEPLOYMENT_GUIDE.md"
            }
            '3' {
                Write-Info "Google Cloud Deployment Instructions:"
                Write-Host ""
                Write-Host "gcloud init"
                Write-Host "gcloud builds submit --tag gcr.io/PROJECT_ID/gacp-api"
                Write-Host "gcloud run deploy gacp-api --image gcr.io/PROJECT_ID/gacp-api --platform managed --region us-central1"
                Write-Host ""
                Write-Info "Full guide: docs/PRODUCTION_DEPLOYMENT_GUIDE.md"
            }
            '4' {
                Write-Info "Please refer to: DEPLOY_GUIDE.md for detailed cloud deployment instructions"
                explorer (Join-Path $PSScriptRoot "DEPLOY_GUIDE.md")
            }
            default {
                Write-Error-Custom "Invalid choice"
                exit 1
            }
        }
    }
}

# ==========================================
# 6. POST-DEPLOYMENT TASKS
# ==========================================
if ($DeploymentType -eq 'docker' -and $LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Header "Post-Deployment Tasks"
    
    Write-Info "Recommended next steps:"
    Write-Host ""
    Write-Host "  1. Configure SSL Certificate:" -ForegroundColor Yellow
    Write-Host "     docker-compose -f docker-compose.production.yml run --rm certbot"
    Write-Host ""
    Write-Host "  2. Run QA Tests:" -ForegroundColor Yellow
    Write-Host "     .\start-qa-testing.ps1"
    Write-Host ""
    Write-Host "  3. Run UAT Tests:" -ForegroundColor Yellow
    Write-Host "     .\start-uat-testing.ps1"
    Write-Host ""
    Write-Host "  4. Setup Monitoring Dashboards:" -ForegroundColor Yellow
    Write-Host "     Open Grafana at http://localhost:3001 and import dashboards"
    Write-Host ""
    Write-Host "  5. Configure Backup Schedule:" -ForegroundColor Yellow
    Write-Host "     Edit docker-compose.production.yml backup service cron schedule"
    Write-Host ""
    Write-Host "  6. View Logs:" -ForegroundColor Yellow
    Write-Host "     docker-compose -f docker-compose.production.yml logs -f"
    Write-Host ""
}

# ==========================================
# 7. SUMMARY & COMPLETION
# ==========================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║   ✅ DEPLOYMENT COMPLETE                                  ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Success "GACP Platform is now running in production mode!"
Write-Host ""
Write-Info "For more information:"
Write-Host "  • Full Deployment Guide: DEPLOY_GUIDE.md"
Write-Host "  • Production Guide: docs/PRODUCTION_DEPLOYMENT_GUIDE.md"
Write-Host "  • Monitoring Guide: monitoring/README.md"
Write-Host ""
Write-Info "Need help? Check the troubleshooting section in DEPLOY_GUIDE.md"
Write-Host ""
