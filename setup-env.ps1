# Environment Setup Script
# Generates secure environment files for GACP Platform

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GACP Platform - Environment Setup    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generate secure JWT secret using .NET crypto
$bytes = New-Object byte[] 64
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)
$rng.Dispose()

Write-Host "🔐 Generated secure JWT secret (64 bytes)" -ForegroundColor Green

# Backend .env
$backendEnv = @"
# GACP Platform - Backend Environment Variables
# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gacp-platform
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
BASE_URL=http://localhost:3001
LOG_LEVEL=info
"@

Set-Content -Path "apps\backend\.env" -Value $backendEnv
Write-Host "✓ Created apps/backend/.env" -ForegroundColor Green

# Farmer Portal .env.local
$farmerEnv = @"
# GACP Platform - Farmer Portal Environment Variables
# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=GACP Platform
NEXT_PUBLIC_APP_VERSION=2.0.0
"@

Set-Content -Path "apps\farmer-portal\.env.local" -Value $farmerEnv
Write-Host "✓ Created apps/farmer-portal/.env.local" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Environment Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
