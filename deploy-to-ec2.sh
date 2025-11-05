#!/bin/bash
# 🚀 GACP Platform - EC2 Deployment Script
# Target: i-0b7d2294695d6c8de (13.212.147.92)
# Region: ap-southeast-1

set -e

echo "========================================"
echo "🚀 GACP Platform Deployment to AWS EC2"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="13.212.147.92"
EC2_USER="ec2-user"
KEY_FILE="gacp-backend-server.pem"
APP_DIR="/home/ec2-user/gacp-platform"

echo "${YELLOW}Step 1: Update system and install dependencies${NC}"
ssh -i "$KEY_FILE" ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
set -e

echo "📦 Updating system..."
sudo yum update -y

echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

echo "📦 Installing Git..."
sudo yum install -y git

echo "📦 Installing PM2 and pnpm..."
sudo npm install -g pm2 pnpm

echo "✅ System dependencies installed!"
ENDSSH

echo ""
echo "${YELLOW}Step 2: Clone repository${NC}"
ssh -i "$KEY_FILE" ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
set -e

cd /home/ec2-user

# Remove old installation if exists
if [ -d "gacp-platform" ]; then
  echo "🗑️  Removing old installation..."
  rm -rf gacp-platform
fi

echo "📥 Cloning repository..."
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git gacp-platform

cd gacp-platform
echo "Current directory: $(pwd)"
echo "Git branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"

echo "✅ Repository cloned!"
ENDSSH

echo ""
echo "${YELLOW}Step 3: Install application dependencies${NC}"
ssh -i "$KEY_FILE" ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
set -e

cd /home/ec2-user/gacp-platform

echo "📦 Installing root dependencies..."
pnpm install

echo "📦 Installing backend dependencies..."
cd apps/backend
pnpm install

echo "✅ Dependencies installed!"
ENDSSH

echo ""
echo "${YELLOW}Step 4: Configure environment${NC}"
echo "⚠️  You need to provide the following values:"
echo ""
read -p "MongoDB URI (DocumentDB endpoint): " MONGODB_URI
read -p "Redis Host (ElastiCache endpoint): " REDIS_HOST
read -sp "JWT Secret (press Enter to auto-generate): " JWT_SECRET
echo ""

# Generate JWT secret if not provided
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
  echo "Generated JWT Secret: $JWT_SECRET"
fi

SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

ssh -i "$KEY_FILE" ${EC2_USER}@${EC2_HOST} << ENDSSH
set -e

cd /home/ec2-user/gacp-platform/apps/backend

echo "📝 Creating .env file..."
cat > .env << 'EOF'
# Database
MONGODB_URI=${MONGODB_URI}
MONGODB_DB_NAME=gacp_platform

# Redis
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=6379
ENABLE_QUEUE=true
ENABLE_CACHE=true

# Security
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
CERTIFICATE_SECRET_KEY=${SESSION_SECRET}

# Server
PORT=3004
HOST=0.0.0.0

# Email (Optional - configure later)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@gacp-platform.com
EOF

echo "✅ Environment configured!"
ENDSSH

echo ""
echo "${YELLOW}Step 5: Build frontend${NC}"
ssh -i "$KEY_FILE" ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
set -e

cd /home/ec2-user/gacp-platform/apps/frontend

echo "🔨 Building frontend..."
pnpm build

echo "✅ Frontend built!"
ENDSSH

echo ""
echo "${YELLOW}Step 6: Start application with PM2${NC}"
ssh -i "$KEY_FILE" ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
set -e

cd /home/ec2-user/gacp-platform/apps/backend

echo "🚀 Starting backend with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start atlas-server.js --name "gacp-backend" --env production

echo "🚀 Starting frontend with PM2..."
cd ../frontend
pm2 start npm --name "gacp-frontend" -- start

echo "💾 Saving PM2 configuration..."
pm2 save

echo "🔄 Setting up PM2 startup..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "✅ Application started!"
ENDSSH

echo ""
echo "${GREEN}========================================"
echo "✅ Deployment Complete!"
echo "========================================${NC}"
echo ""
echo "🌐 Your application is now running at:"
echo "   http://13.212.147.92:3004"
echo ""
echo "📊 Check application status:"
echo "   ssh -i $KEY_FILE ${EC2_USER}@${EC2_HOST}"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
echo "🔧 Next steps:"
echo "   1. Configure your domain DNS to point to 13.212.147.92"
echo "   2. Set up SSL certificate (Let's Encrypt or AWS Certificate Manager)"
echo "   3. Configure ALB/CloudFront if needed"
echo "   4. Set up monitoring (CloudWatch)"
echo ""
