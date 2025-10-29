#!/bin/bash
# GACP Platform - EC2 Setup Script
# รันบน EC2: bash setup-ec2.sh

set -e

echo "🚀 Starting GACP Platform Setup..."

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
echo "✅ Node.js $(node --version) installed"

# Install PNPM
echo "📦 Installing PNPM..."
sudo npm install -g pnpm
echo "✅ PNPM $(pnpm --version) installed"

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2
echo "✅ PM2 $(pm2 --version) installed"

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git
echo "✅ Git installed"

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
echo "✅ Nginx installed"

# Clone repository
echo "📥 Cloning repository..."
cd /home/ubuntu
if [ -d "Botanical-Audit-Framework" ]; then
  echo "⚠️  Repository exists, pulling latest..."
  cd Botanical-Audit-Framework
  git pull
else
  git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
  cd Botanical-Audit-Framework
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate JWT secrets
echo "🔐 Generating JWT secrets..."
JWT_FARMER=$(openssl rand -hex 64)
JWT_DTAM=$(openssl rand -hex 64)

# Create .env file
echo "📝 Creating .env file..."
cat > apps/backend/.env <<EOF
# MongoDB Atlas
MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp

# JWT Secrets
JWT_SECRET_FARMER=$JWT_FARMER
JWT_SECRET_DTAM=$JWT_DTAM

# Server
NODE_ENV=production
PORT=3000
EOF

echo "✅ .env file created"

# Start backend with PM2
echo "🚀 Starting backend..."
cd apps/backend
pm2 delete gacp-backend 2>/dev/null || true
pm2 start server.js --name gacp-backend
pm2 save

# Setup PM2 startup
echo "⚙️  Setting up PM2 auto-start..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/gacp > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/gacp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "🎉 Setup Complete!"
echo "===================="
echo ""
echo "✅ Backend running on PM2"
echo "✅ Nginx configured"
echo ""
echo "📝 Next Steps:"
echo "1. Add EC2 IP to MongoDB Atlas Network Access:"
echo "   https://cloud.mongodb.com"
echo "   IP: 13.250.13.249"
echo ""
echo "2. Test your API:"
echo "   http://13.250.13.249/health"
echo ""
echo "📊 Useful Commands:"
echo "   pm2 status          - View PM2 status"
echo "   pm2 logs            - View logs"
echo "   pm2 monit           - Monitor resources"
echo ""
