# Upload Backend to EC2
$KeyPath = "C:\Users\usEr\.ssh\gacp-backend-server.pem"
$EC2_IP = "47.130.0.164"
$EC2_USER = "ec2-user"

Write-Host "📦 Uploading backend to EC2..." -ForegroundColor Green

# Upload backend folder
scp -i $KeyPath -r apps/backend/* ${EC2_USER}@${EC2_IP}:/home/ec2-user/backend/

# Upload .env
scp -i $KeyPath apps/backend/.env ${EC2_USER}@${EC2_IP}:/home/ec2-user/backend/

Write-Host "✅ Upload complete!" -ForegroundColor Green
Write-Host "🚀 Starting backend..." -ForegroundColor Yellow

# Start backend
ssh -i $KeyPath ${EC2_USER}@${EC2_IP} @"
cd /home/ec2-user/backend
pm2 delete gacp-backend 2>/dev/null || true
pm2 start server.js --name gacp-backend
pm2 save
pm2 logs gacp-backend --lines 20
"@

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Test: http://$EC2_IP/health" -ForegroundColor Cyan
