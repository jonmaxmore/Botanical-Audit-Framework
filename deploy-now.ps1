# Deploy to EC2 in one command
$KeyPath = "C:\Users\usEr\.ssh\gacp-backend-server.pem"
$EC2_IP = "13.250.13.249"

Write-Host "🚀 Deploying to EC2: $EC2_IP" -ForegroundColor Green

# Setup script
$SetupScript = @'
#!/bin/bash
set -e
echo "🚀 Starting GACP Platform Setup..."
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pnpm pm2
sudo systemctl start nginx && sudo systemctl enable nginx
cd /home/ubuntu
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git || (cd Botanical-Audit-Framework && git pull)
cd Botanical-Audit-Framework && pnpm install
JWT_FARMER=$(openssl rand -hex 64)
JWT_DTAM=$(openssl rand -hex 64)
cat > apps/backend/.env <<EOF
MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp
JWT_SECRET_FARMER=$JWT_FARMER
JWT_SECRET_DTAM=$JWT_DTAM
NODE_ENV=production
PORT=5000
EOF
cd apps/backend
pm2 delete gacp-backend 2>/dev/null || true
pm2 start server.js --name gacp-backend
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo tee /etc/nginx/sites-available/gacp > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;
    location / {
    proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
sudo ln -sf /etc/nginx/sites-available/gacp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
echo ""
echo "✅ Setup complete!"
echo "Test: http://13.250.13.249/health"
'@

# Upload and run script
Write-Host "📤 Uploading setup script..." -ForegroundColor Yellow
$SetupScript | ssh -i $KeyPath ubuntu@$EC2_IP 'cat > setup.sh && bash setup.sh'

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "Test URL: http://$EC2_IP/health" -ForegroundColor Cyan
