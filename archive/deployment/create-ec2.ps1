# AWS EC2 Creation Script (PowerShell)
# ต้องติดตั้ง AWS CLI และ configure credentials ก่อน

$ErrorActionPreference = "Stop"

Write-Host "🚀 Creating EC2 Instance for GACP Platform..." -ForegroundColor Green

# Variables
$InstanceName = "gacp-backend-server"
$InstanceType = "t2.medium"
$AmiId = "ami-0c55b159cbfafe1f0"  # Ubuntu 22.04 LTS (ap-southeast-1)
$KeyName = "gacp-server-key"
$Region = "ap-southeast-1"

# Create Key Pair
Write-Host "📝 Creating Key Pair..." -ForegroundColor Yellow
$KeyMaterial = aws ec2 create-key-pair `
  --key-name $KeyName `
  --region $Region `
  --query 'KeyMaterial' `
  --output text

$KeyMaterial | Out-File -FilePath "$KeyName.pem" -Encoding ASCII
Write-Host "✅ Key saved to $KeyName.pem" -ForegroundColor Green

# Create Security Group
Write-Host "🔒 Creating Security Group..." -ForegroundColor Yellow
$SgId = aws ec2 create-security-group `
  --group-name gacp-backend-sg `
  --description "Security group for GACP backend" `
  --region $Region `
  --query 'GroupId' `
  --output text

Write-Host "✅ Security Group created: $SgId" -ForegroundColor Green

# Add Security Group Rules
Write-Host "🔓 Adding Security Group Rules..." -ForegroundColor Yellow
aws ec2 authorize-security-group-ingress --group-id $SgId --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $Region | Out-Null
aws ec2 authorize-security-group-ingress --group-id $SgId --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $Region | Out-Null
aws ec2 authorize-security-group-ingress --group-id $SgId --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $Region | Out-Null
aws ec2 authorize-security-group-ingress --group-id $SgId --protocol tcp --port 3000 --cidr 0.0.0.0/0 --region $Region | Out-Null

# User Data Script
$UserData = @"
#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PNPM
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install Git
apt-get install -y git

# Install Nginx
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx

# Clone repository
cd /home/ubuntu
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
chown -R ubuntu:ubuntu Botanical-Audit-Framework

echo "✅ Setup complete!"
"@

# Encode user data to base64
$UserDataBytes = [System.Text.Encoding]::UTF8.GetBytes($UserData)
$UserDataBase64 = [System.Convert]::ToBase64String($UserDataBytes)

# Launch Instance
Write-Host "🚀 Launching EC2 Instance..." -ForegroundColor Yellow
$InstanceId = aws ec2 run-instances `
  --image-id $AmiId `
  --instance-type $InstanceType `
  --key-name $KeyName `
  --security-group-ids $SgId `
  --user-data $UserDataBase64 `
  --block-device-mappings '[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":20,\"VolumeType\":\"gp3\"}}]' `
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$InstanceName}]" `
  --region $Region `
  --query 'Instances[0].InstanceId' `
  --output text

Write-Host "✅ Instance created: $InstanceId" -ForegroundColor Green

# Wait for instance to be running
Write-Host "⏳ Waiting for instance to be running..." -ForegroundColor Yellow
aws ec2 wait instance-running --instance-ids $InstanceId --region $Region

# Get Public IP
$PublicIp = aws ec2 describe-instances `
  --instance-ids $InstanceId `
  --region $Region `
  --query 'Reservations[0].Instances[0].PublicIpAddress' `
  --output text

Write-Host ""
Write-Host "🎉 EC2 Instance Created Successfully!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "Instance ID: $InstanceId" -ForegroundColor Cyan
Write-Host "Public IP: $PublicIp" -ForegroundColor Cyan
Write-Host "Key File: $KeyName.pem" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait 2-3 minutes for user data script to complete"
Write-Host "2. Connect via SSH:"
Write-Host "   ssh -i $KeyName.pem ubuntu@$PublicIp" -ForegroundColor White
Write-Host ""
Write-Host "3. Complete setup:"
Write-Host "   cd Botanical-Audit-Framework"
Write-Host "   pnpm install"
Write-Host "   cd apps/backend"
Write-Host "   nano .env  # Add MongoDB URI and JWT secrets"
Write-Host "   pm2 start server.js --name gacp-backend"
Write-Host ""
Write-Host "4. Test:"
Write-Host "   http://$PublicIp/health" -ForegroundColor White
Write-Host ""

# Save info to file
$Info = @"
EC2 Instance Information
========================
Instance ID: $InstanceId
Public IP: $PublicIp
Key File: $KeyName.pem
Region: $Region
Instance Type: $InstanceType
Created: $(Get-Date)

SSH Command:
ssh -i $KeyName.pem ubuntu@$PublicIp

Health Check:
http://$PublicIp/health
"@

$Info | Out-File -FilePath "ec2-instance-info.txt" -Encoding UTF8
Write-Host "💾 Instance info saved to ec2-instance-info.txt" -ForegroundColor Green
