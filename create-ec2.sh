#!/bin/bash
# AWS EC2 Creation Script
# ต้องติดตั้ง AWS CLI และ configure credentials ก่อน

set -e

echo "🚀 Creating EC2 Instance for GACP Platform..."

# Variables
INSTANCE_NAME="gacp-backend-server"
INSTANCE_TYPE="t2.medium"
AMI_ID="ami-0c55b159cbfafe1f0"  # Ubuntu 22.04 LTS (ap-southeast-1)
KEY_NAME="gacp-server-key"
REGION="ap-southeast-1"

# Create Key Pair
echo "📝 Creating Key Pair..."
aws ec2 create-key-pair \
  --key-name $KEY_NAME \
  --region $REGION \
  --query 'KeyMaterial' \
  --output text > ${KEY_NAME}.pem

chmod 400 ${KEY_NAME}.pem
echo "✅ Key saved to ${KEY_NAME}.pem"

# Create Security Group
echo "🔒 Creating Security Group..."
SG_ID=$(aws ec2 create-security-group \
  --group-name gacp-backend-sg \
  --description "Security group for GACP backend" \
  --region $REGION \
  --query 'GroupId' \
  --output text)

echo "✅ Security Group created: $SG_ID"

# Add Security Group Rules
echo "🔓 Adding Security Group Rules..."
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $REGION
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $REGION
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0 --region $REGION

# User Data Script
USER_DATA=$(cat <<'EOF'
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
EOF
)

# Launch Instance
echo "🚀 Launching EC2 Instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SG_ID \
  --user-data "$USER_DATA" \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
  --region $REGION \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "✅ Instance created: $INSTANCE_ID"

# Wait for instance to be running
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get Public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region $REGION \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo ""
echo "🎉 EC2 Instance Created Successfully!"
echo "=================================="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "Key File: ${KEY_NAME}.pem"
echo ""
echo "📝 Next Steps:"
echo "1. Wait 2-3 minutes for user data script to complete"
echo "2. Connect via SSH:"
echo "   ssh -i ${KEY_NAME}.pem ubuntu@${PUBLIC_IP}"
echo ""
echo "3. Complete setup:"
echo "   cd Botanical-Audit-Framework"
echo "   pnpm install"
echo "   cd apps/backend"
echo "   nano .env  # Add MongoDB URI and JWT secrets"
echo "   pm2 start server.js --name gacp-backend"
echo ""
echo "4. Test:"
echo "   http://${PUBLIC_IP}/health"
echo ""
