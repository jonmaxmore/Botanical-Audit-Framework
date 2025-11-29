# GACP Platform - AWS Deployment Script
# Run this script to deploy to AWS

Write-Host "🚀 GACP Platform - AWS Deployment" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check AWS CLI
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI not found!" -ForegroundColor Red
    Write-Host "   Download: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ AWS CLI installed" -ForegroundColor Green

# Check Terraform
if (!(Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Terraform not found!" -ForegroundColor Red
    Write-Host "   Download: https://www.terraform.io/downloads" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Terraform installed" -ForegroundColor Green

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker not found!" -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker installed" -ForegroundColor Green

Write-Host ""

# Get AWS Account ID
Write-Host "🔍 Getting AWS Account ID..." -ForegroundColor Yellow
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS credentials not configured!" -ForegroundColor Red
    Write-Host "   Run: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ AWS Account ID: $ACCOUNT_ID" -ForegroundColor Green
Write-Host ""

# Generate JWT Secrets
Write-Host "🔐 Generating JWT Secrets..." -ForegroundColor Yellow
$FARMER_SECRET = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
$DTAM_SECRET = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Write-Host "✅ JWT Secrets generated" -ForegroundColor Green
Write-Host ""

# Create ECR Repository
Write-Host "📦 Creating ECR Repository..." -ForegroundColor Yellow
aws ecr create-repository --repository-name gacp-backend --region ap-southeast-1 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ECR Repository created" -ForegroundColor Green
} else {
    Write-Host "ℹ️  ECR Repository already exists" -ForegroundColor Cyan
}
Write-Host ""

# Build Docker Image
Write-Host "🐳 Building Docker Image..." -ForegroundColor Yellow
Set-Location apps\backend
docker build -t gacp-backend .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker image built" -ForegroundColor Green
Write-Host ""

# Login to ECR
Write-Host "🔑 Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ECR login failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Logged in to ECR" -ForegroundColor Green
Write-Host ""

# Tag and Push
Write-Host "📤 Pushing Docker Image to ECR..." -ForegroundColor Yellow
docker tag gacp-backend:latest "$ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest"
docker push "$ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/gacp-backend:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker image pushed to ECR" -ForegroundColor Green
Write-Host ""

# Update terraform.tfvars
Write-Host "📝 Updating terraform.tfvars..." -ForegroundColor Yellow
Set-Location ..\..\infrastructure\aws

$tfvars = Get-Content terraform.tfvars -Raw
$tfvars = $tfvars -replace 'REPLACE_WITH_GENERATED_SECRET_64_CHARS', $FARMER_SECRET, 1
$tfvars = $tfvars -replace 'REPLACE_WITH_GENERATED_SECRET_64_CHARS', $DTAM_SECRET, 1
$tfvars = $tfvars -replace 'ACCOUNT_ID', $ACCOUNT_ID
Set-Content terraform.tfvars $tfvars

Write-Host "✅ terraform.tfvars updated" -ForegroundColor Green
Write-Host ""

# Terraform Init
Write-Host "🔧 Initializing Terraform..." -ForegroundColor Yellow
terraform init

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform init failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Terraform initialized" -ForegroundColor Green
Write-Host ""

# Terraform Plan
Write-Host "📋 Planning Terraform deployment..." -ForegroundColor Yellow
terraform plan -out=tfplan

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform plan failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Terraform plan created" -ForegroundColor Green
Write-Host ""

# Confirm deployment
Write-Host "⚠️  Ready to deploy to AWS!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Estimated cost: $50-80/month (first year with Free Tier)" -ForegroundColor Cyan
Write-Host ""
$confirm = Read-Host "Deploy now? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

# Terraform Apply
Write-Host ""
Write-Host "🚀 Deploying to AWS..." -ForegroundColor Yellow
terraform apply tfplan

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform apply failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""

# Get outputs
Write-Host "📊 Deployment Information:" -ForegroundColor Yellow
terraform output

Write-Host ""
Write-Host "🎉 GACP Platform deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test health endpoint: curl http://$(terraform output -raw alb_dns_name)/health" -ForegroundColor Cyan
Write-Host "2. View logs: aws logs tail /ecs/gacp-backend --follow --region ap-southeast-1" -ForegroundColor Cyan
Write-Host "3. Setup custom domain (optional)" -ForegroundColor Cyan
Write-Host ""
