# ==========================================
# GACP Platform - Deployment Verification Script
# ==========================================
# Purpose: Verify all services are running correctly
# ==========================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('docker', 'local', 'all')]
    [string]$Mode = 'all'
)

function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Error-Custom { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Header { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Magenta }

Clear-Host
Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║   🔍 GACP Platform - Deployment Verification             ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$results = @{
    Passed = 0
    Failed = 0
    Warnings = 0
}

# ==========================================
# 1. DOCKER SERVICES CHECK
# ==========================================
if ($Mode -eq 'docker' -or $Mode -eq 'all') {
    Write-Header "Docker Services Check"
    
    try {
        $containers = docker ps --format "{{.Names}}" 2>$null
        
        $expectedServices = @(
            'gacp-mongodb',
            'gacp-redis',
            'gacp-api',
            'gacp-frontend',
            'gacp-prometheus',
            'gacp-grafana',
            'gacp-elasticsearch',
            'gacp-logstash',
            'gacp-kibana',
            'gacp-nginx',
            'gacp-backup'
        )
        
        foreach ($service in $expectedServices) {
            if ($containers -contains $service) {
                Write-Success "$service is running"
                $results.Passed++
            } else {
                Write-Error-Custom "$service is NOT running"
                $results.Failed++
            }
        }
        
    } catch {
        Write-Error-Custom "Could not check Docker services: $_"
        $results.Failed++
    }
    
    Write-Host ""
}

# ==========================================
# 2. HEALTH ENDPOINTS CHECK
# ==========================================
Write-Header "Health Endpoints Check"

$endpoints = @{
    'API Health' = 'http://localhost:4000/health'
    'Frontend' = 'http://localhost:3000'
    'Prometheus' = 'http://localhost:9090/-/healthy'
    'Grafana' = 'http://localhost:3001/api/health'
    'Kibana' = 'http://localhost:5601/api/status'
}

foreach ($endpoint in $endpoints.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Value -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Success "$($endpoint.Key): Healthy (Status: $($response.StatusCode))"
            $results.Passed++
        } else {
            Write-Warning "$($endpoint.Key): Unexpected status $($response.StatusCode)"
            $results.Warnings++
        }
    } catch {
        Write-Error-Custom "$($endpoint.Key): Unreachable"
        $results.Failed++
    }
}

Write-Host ""

# ==========================================
# 3. DATABASE CONNECTIVITY CHECK
# ==========================================
Write-Header "Database Connectivity Check"

try {
    # MongoDB check
    $mongoCheck = docker exec gacp-mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" 2>$null
    if ($mongoCheck -eq '1') {
        Write-Success "MongoDB: Connected and responsive"
        $results.Passed++
    } else {
        Write-Error-Custom "MongoDB: Not responsive"
        $results.Failed++
    }
} catch {
    Write-Warning "MongoDB: Could not verify (container may not be running)"
    $results.Warnings++
}

try {
    # Redis check
    $redisCheck = docker exec gacp-redis redis-cli ping 2>$null
    if ($redisCheck -eq 'PONG') {
        Write-Success "Redis: Connected and responsive"
        $results.Passed++
    } else {
        Write-Error-Custom "Redis: Not responsive"
        $results.Failed++
    }
} catch {
    Write-Warning "Redis: Could not verify (container may not be running)"
    $results.Warnings++
}

Write-Host ""

# ==========================================
# 4. DISK SPACE CHECK
# ==========================================
Write-Header "Disk Space Check"

try {
    $disk = Get-PSDrive -Name C
    $freeSpaceGB = [math]::Round($disk.Free / 1GB, 2)
    $usedSpaceGB = [math]::Round($disk.Used / 1GB, 2)
    $totalSpaceGB = [math]::Round(($disk.Used + $disk.Free) / 1GB, 2)
    $freePercent = [math]::Round(($disk.Free / ($disk.Used + $disk.Free)) * 100, 2)
    
    Write-Info "Total Space: $totalSpaceGB GB"
    Write-Info "Used Space: $usedSpaceGB GB"
    Write-Info "Free Space: $freeSpaceGB GB ($freePercent%)"
    
    if ($freeSpaceGB -lt 5) {
        Write-Error-Custom "Low disk space! Less than 5GB available"
        $results.Failed++
    } elseif ($freeSpaceGB -lt 10) {
        Write-Warning "Disk space is getting low (less than 10GB)"
        $results.Warnings++
    } else {
        Write-Success "Sufficient disk space available"
        $results.Passed++
    }
} catch {
    Write-Warning "Could not check disk space: $_"
    $results.Warnings++
}

Write-Host ""

# ==========================================
# 5. DOCKER RESOURCES CHECK
# ==========================================
if ($Mode -eq 'docker' -or $Mode -eq 'all') {
    Write-Header "Docker Resources Check"
    
    try {
        $dockerInfo = docker system df --format "{{.Type}},{{.Size}}" 2>$null
        
        Write-Info "Docker Resource Usage:"
        foreach ($line in $dockerInfo) {
            $parts = $line -split ','
            Write-Host "  • $($parts[0]): $($parts[1])" -ForegroundColor White
        }
        
        Write-Success "Docker resources checked"
        $results.Passed++
    } catch {
        Write-Warning "Could not check Docker resources: $_"
        $results.Warnings++
    }
    
    Write-Host ""
}

# ==========================================
# 6. LOG FILES CHECK
# ==========================================
Write-Header "Log Files Check"

$logPaths = @(
    "logs/api",
    "logs/frontend",
    "logs/mongodb",
    "logs/redis"
)

foreach ($logPath in $logPaths) {
    $fullPath = Join-Path $PSScriptRoot $logPath
    if (Test-Path $fullPath) {
        $logFiles = Get-ChildItem $fullPath -Filter "*.log" -ErrorAction SilentlyContinue
        if ($logFiles.Count -gt 0) {
            $latestLog = $logFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            Write-Success "$logPath exists (Latest: $($latestLog.Name))"
            $results.Passed++
        } else {
            Write-Warning "$logPath exists but no log files found"
            $results.Warnings++
        }
    } else {
        Write-Info "$logPath does not exist (may not be configured)"
    }
}

Write-Host ""

# ==========================================
# 7. ENVIRONMENT CONFIGURATION CHECK
# ==========================================
Write-Header "Environment Configuration Check"

$envFile = Join-Path $PSScriptRoot ".env.production"

if (Test-Path $envFile) {
    Write-Success ".env.production exists"
    
    $envContent = Get-Content $envFile -Raw
    
    $criticalVars = @(
        'NODE_ENV',
        'MONGO_ROOT_PASSWORD',
        'REDIS_PASSWORD',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'ALLOWED_ORIGINS'
    )
    
    $allPresent = $true
    foreach ($var in $criticalVars) {
        if ($envContent -match "$var=.+") {
            Write-Success "  $var is set"
        } else {
            Write-Error-Custom "  $var is MISSING or empty"
            $allPresent = $false
            $results.Failed++
        }
    }
    
    if ($allPresent) {
        Write-Success "All critical environment variables are configured"
        $results.Passed++
    }
    
} else {
    Write-Error-Custom ".env.production does NOT exist!"
    $results.Failed++
}

Write-Host ""

# ==========================================
# 8. PORT AVAILABILITY CHECK
# ==========================================
Write-Header "Port Availability Check"

$ports = @{
    3000 = 'Frontend'
    4000 = 'API'
    27017 = 'MongoDB'
    6379 = 'Redis'
    9090 = 'Prometheus'
    3001 = 'Grafana'
    9200 = 'Elasticsearch'
    5601 = 'Kibana'
}

foreach ($port in $ports.GetEnumerator()) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port.Key -WarningAction SilentlyContinue
        
        if ($connection.TcpTestSucceeded) {
            Write-Success "Port $($port.Key) ($($port.Value)): In Use ✓"
            $results.Passed++
        } else {
            Write-Warning "Port $($port.Key) ($($port.Value)): Not in use (service may be down)"
            $results.Warnings++
        }
    } catch {
        Write-Warning "Could not check port $($port.Key)"
        $results.Warnings++
    }
}

Write-Host ""

# ==========================================
# 9. SECURITY CHECK
# ==========================================
Write-Header "Security Check"

# Check for default passwords
$securityIssues = @()

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    $defaultPatterns = @{
        'CHANGE_ME' = 'Default placeholder values'
        'password123' = 'Weak password detected'
        'admin123' = 'Weak admin password'
        'secret' = 'Generic secret value'
    }
    
    foreach ($pattern in $defaultPatterns.GetEnumerator()) {
        if ($envContent -match $pattern.Key) {
            Write-Error-Custom "SECURITY: $($pattern.Value) found in .env.production"
            $securityIssues += $pattern.Value
            $results.Failed++
        }
    }
    
    if ($securityIssues.Count -eq 0) {
        Write-Success "No obvious security issues found"
        $results.Passed++
    } else {
        Write-Error-Custom "Found $($securityIssues.Count) security issue(s)"
    }
}

Write-Host ""

# ==========================================
# 10. BACKUP VERIFICATION
# ==========================================
Write-Header "Backup Configuration Check"

try {
    $backupContainer = docker ps --filter "name=gacp-backup" --format "{{.Names}}" 2>$null
    
    if ($backupContainer -eq 'gacp-backup') {
        Write-Success "Backup service is running"
        $results.Passed++
        
        # Check backup directory
        $backupVolume = docker volume inspect gacp-production_backup-data --format "{{.Mountpoint}}" 2>$null
        if ($backupVolume) {
            Write-Info "Backup volume location: $backupVolume"
            Write-Success "Backup volume exists"
            $results.Passed++
        }
    } else {
        Write-Warning "Backup service is not running"
        $results.Warnings++
    }
} catch {
    Write-Warning "Could not verify backup configuration"
    $results.Warnings++
}

Write-Host ""

# ==========================================
# SUMMARY & REPORT
# ==========================================
Write-Header "Verification Summary"

$total = $results.Passed + $results.Failed + $results.Warnings
$passRate = if ($total -gt 0) { [math]::Round(($results.Passed / $total) * 100, 2) } else { 0 }

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  Verification Results                    ║" -ForegroundColor Cyan
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  ✅ Passed:     $($results.Passed.ToString().PadLeft(3))                                    ║" -ForegroundColor Green
Write-Host "║  ⚠️  Warnings:   $($results.Warnings.ToString().PadLeft(3))                                    ║" -ForegroundColor Yellow
Write-Host "║  ❌ Failed:     $($results.Failed.ToString().PadLeft(3))                                    ║" -ForegroundColor Red
Write-Host "║  📊 Pass Rate:  $($passRate.ToString().PadLeft(6))%                              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($results.Failed -eq 0 -and $results.Warnings -eq 0) {
    Write-Success "🎉 All checks passed! Your deployment is healthy."
} elseif ($results.Failed -eq 0) {
    Write-Warning "⚠️  All checks passed with warnings. Review warnings above."
} else {
    Write-Error-Custom "❌ Some checks failed. Please review the errors above."
    Write-Host ""
    Write-Info "Common fixes:"
    Write-Host "  • Restart services: docker-compose -f docker-compose.production.yml restart"
    Write-Host "  • View logs: docker-compose -f docker-compose.production.yml logs"
    Write-Host "  • Check environment: Review .env.production configuration"
    Write-Host ""
}

Write-Host ""
Write-Info "Next steps:"
Write-Host "  • View detailed logs: docker-compose -f docker-compose.production.yml logs -f"
Write-Host "  • Monitor services: docker-compose -f docker-compose.production.yml ps"
Write-Host "  • Access Grafana: http://localhost:3001"
Write-Host "  • Run QA tests: .\start-qa-testing.ps1"
Write-Host "  • Run UAT tests: .\start-uat-testing.ps1"
Write-Host ""

# Exit with appropriate code
if ($results.Failed -gt 0) {
    exit 1
} else {
    exit 0
}
