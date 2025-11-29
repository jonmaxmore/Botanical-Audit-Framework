# Simple Deploy Script
$KeyPath = "C:\Users\usEr\.ssh\gacp-backend-server.pem"
$EC2_IP = "13.250.13.249"

Write-Host "Deploying to EC2: $EC2_IP" -ForegroundColor Green

$cmd = @"
sudo apt update && sudo apt upgrade -y && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs git nginx && sudo npm install -g pnpm pm2 && sudo systemctl start nginx && sudo systemctl enable nginx && cd /home/ubuntu && git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git && cd Botanical-Audit-Framework && pnpm install && cd apps/backend && echo 'MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp' > .env && echo 'NODE_ENV=production' >> .env && echo 'PORT=3000' >> .env && echo \"JWT_SECRET_FARMER=`$(openssl rand -hex 64)\" >> .env && echo \"JWT_SECRET_DTAM=`$(openssl rand -hex 64)\" >> .env && pm2 start server.js --name gacp-backend && pm2 save && echo 'server { listen 80; server_name _; location / { proxy_pass http://localhost:3000; proxy_http_version 1.1; proxy_set_header Upgrade `$http_upgrade; proxy_set_header Connection upgrade; proxy_set_header Host `$host; proxy_cache_bypass `$http_upgrade; } }' | sudo tee /etc/nginx/sites-available/gacp && sudo ln -sf /etc/nginx/sites-available/gacp /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl restart nginx && echo 'Setup complete! Test: http://13.250.13.249/health'
"@

ssh -i $KeyPath ubuntu@$EC2_IP $cmd

Write-Host ""
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "Test: http://$EC2_IP/health" -ForegroundColor Cyan
