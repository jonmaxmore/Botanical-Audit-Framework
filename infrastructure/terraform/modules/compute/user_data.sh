#!/bin/bash
# ============================================================================
# User Data Script for Backend EC2 Instances
# Botanical Audit Framework - Node.js Application Setup
# ============================================================================

set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install Node.js ${nodejs_version}
curl -fsSL https://deb.nodesource.com/setup_${nodejs_version} | bash -
apt-get install -y nodejs

# Install required packages
apt-get install -y git build-essential nginx

# Install PM2 globally
npm install -g pm2

# Create application directory
mkdir -p /opt/botanical-audit
cd /opt/botanical-audit

# Clone repository
%{ if github_repo != "" }
git clone -b ${github_branch} ${github_repo} .
%{ endif }

# Install dependencies
npm ci --production

# Create .env file
cat > /opt/botanical-audit/.env << 'EOF'
NODE_ENV=production
PORT=${backend_port}
MONGODB_URI=${mongodb_connection_string}
%{ for key, value in app_environment_vars }
${key}=${value}
%{ endfor }
EOF

# Set permissions
chown -R ubuntu:ubuntu /opt/botanical-audit

# Start application with PM2
cd /opt/botanical-audit
su ubuntu -c "pm2 start ecosystem.config.js --env production"
su ubuntu -c "pm2 save"

# Configure PM2 to start on boot
env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Configure nginx as reverse proxy
cat > /etc/nginx/sites-available/botanical-audit << 'NGINXCONF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:${backend_port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:${backend_port}/health;
        access_log off;
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/botanical-audit /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb

# Create CloudWatch agent config
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json << 'CWCONFIG'
{
  "metrics": {
    "namespace": "BotanicalAudit/EC2",
    "metrics_collected": {
      "mem": {
        "measurement": [
          {
            "name": "mem_used_percent",
            "rename": "MemoryUtilization",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          {
            "name": "used_percent",
            "rename": "DiskUtilization",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "/"
        ]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/botanical-audit/logs/*.log",
            "log_group_name": "/aws/ec2/botanical-audit",
            "log_stream_name": "{instance_id}/application"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/aws/ec2/botanical-audit",
            "log_stream_name": "{instance_id}/nginx-access"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/aws/ec2/botanical-audit",
            "log_stream_name": "{instance_id}/nginx-error"
          }
        ]
      }
    }
  }
}
CWCONFIG

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

echo "Setup complete!"
