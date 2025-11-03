# ============================================================================
# Terraform Outputs
# Botanical Audit Framework - Production Infrastructure
# ============================================================================

# ------------------------------
# VPC Outputs
# ------------------------------

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

output "nat_gateway_ids" {
  description = "IDs of NAT Gateways"
  value       = module.vpc.nat_gateway_ids
}

# ------------------------------
# Security Outputs
# ------------------------------

output "alb_security_group_id" {
  description = "ID of ALB security group"
  value       = module.security.alb_security_group_id
}

output "backend_security_group_id" {
  description = "ID of backend security group"
  value       = module.security.backend_security_group_id
}

output "kms_key_id" {
  description = "ID of KMS key"
  value       = module.security.kms_key_id
  sensitive   = true
}

output "kms_key_arn" {
  description = "ARN of KMS key"
  value       = module.security.kms_key_arn
}

# ------------------------------
# Compute Outputs
# ------------------------------

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.compute.alb_dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.compute.alb_arn
}

output "alb_zone_id" {
  description = "Route53 zone ID of the ALB"
  value       = module.compute.alb_zone_id
}

output "autoscaling_group_name" {
  description = "Name of the Auto Scaling Group"
  value       = module.compute.autoscaling_group_name
}

output "autoscaling_group_arn" {
  description = "ARN of the Auto Scaling Group"
  value       = module.compute.autoscaling_group_arn
}

output "launch_template_id" {
  description = "ID of the EC2 launch template"
  value       = module.compute.launch_template_id
}

# ------------------------------
# Storage Outputs
# ------------------------------

output "s3_certificates_bucket_name" {
  description = "Name of S3 bucket for certificates"
  value       = module.storage.certificates_bucket_name
}

output "s3_certificates_bucket_arn" {
  description = "ARN of S3 bucket for certificates"
  value       = module.storage.certificates_bucket_arn
}

output "s3_photos_bucket_name" {
  description = "Name of S3 bucket for photos"
  value       = module.storage.photos_bucket_name
}

output "s3_photos_bucket_arn" {
  description = "ARN of S3 bucket for photos"
  value       = module.storage.photos_bucket_arn
}

output "s3_backups_bucket_name" {
  description = "Name of S3 bucket for backups"
  value       = module.storage.backups_bucket_name
}

output "s3_backups_bucket_arn" {
  description = "ARN of S3 bucket for backups"
  value       = module.storage.backups_bucket_arn
}

output "cloudfront_distribution_id" {
  description = "ID of CloudFront distribution for photos"
  value       = module.storage.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of CloudFront distribution"
  value       = module.storage.cloudfront_domain_name
}

# ------------------------------
# Networking Outputs
# ------------------------------

output "route53_zone_id" {
  description = "ID of Route53 hosted zone"
  value       = module.networking.route53_zone_id
}

output "route53_zone_name" {
  description = "Name of Route53 hosted zone"
  value       = module.networking.route53_zone_name
}

output "route53_name_servers" {
  description = "Name servers for Route53 hosted zone"
  value       = module.networking.route53_name_servers
}

output "api_fqdn" {
  description = "Fully qualified domain name for API"
  value       = module.networking.api_fqdn
}

output "acm_certificate_arn" {
  description = "ARN of ACM certificate"
  value       = module.networking.acm_certificate_arn
}

# ------------------------------
# Monitoring Outputs
# ------------------------------

output "cloudwatch_log_group_name" {
  description = "Name of CloudWatch log group"
  value       = module.monitoring.log_group_name
}

output "cloudwatch_dashboard_name" {
  description = "Name of CloudWatch dashboard"
  value       = module.monitoring.dashboard_name
}

output "sns_alarm_topic_arn" {
  description = "ARN of SNS topic for alarms"
  value       = module.monitoring.sns_alarm_topic_arn
}

# ------------------------------
# Connection Information
# ------------------------------

output "api_endpoint" {
  description = "API endpoint URL"
  value       = "https://${module.networking.api_fqdn}"
}

output "health_check_url" {
  description = "Health check URL"
  value       = "https://${module.networking.api_fqdn}/health"
}

# ------------------------------
# Deployment Information
# ------------------------------

output "deployment_instructions" {
  description = "Next steps for deployment"
  value       = <<-EOT
    ╔══════════════════════════════════════════════════════════════╗
    ║     AWS Infrastructure Deployed Successfully! 🎉              ║
    ╚══════════════════════════════════════════════════════════════╝
    
    📊 Deployment Summary:
    • VPC: ${module.vpc.vpc_id}
    • Region: ${var.aws_region}
    • Environment: ${var.environment}
    • ALB DNS: ${module.compute.alb_dns_name}
    • API Endpoint: https://${module.networking.api_fqdn}
    
    🔧 Next Steps:
    
    1. Configure DNS:
       Update your domain registrar with these nameservers:
       ${join("\n       ", module.networking.route53_name_servers)}
    
    2. Wait for SSL Certificate Validation:
       The ACM certificate is being validated via DNS.
       This usually takes 5-30 minutes.
       
    3. Deploy Application:
       SSH into EC2 instances or use CodeDeploy to deploy your application.
       Auto Scaling Group: ${module.compute.autoscaling_group_name}
       
    4. Configure Application:
       Set environment variables in launch template user data:
       • MONGODB_URI: Your MongoDB Atlas connection string
       • JWT_SECRET: Your JWT secret key
       • NODE_ENV: production
       
    5. Verify Deployment:
       curl https://${module.networking.api_fqdn}/health
       
    6. Monitor:
       CloudWatch Dashboard: ${module.monitoring.dashboard_name}
       Logs: ${module.monitoring.log_group_name}
       
    📧 Alarms configured to send to: ${var.alarm_email != "" ? var.alarm_email : "Not configured"}
    
    💰 Estimated Monthly Cost: ~$150-200 USD
    
    ✅ Infrastructure is ready for production use!
  EOT
}

# ------------------------------
# Cost Estimation
# ------------------------------

output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (USD)"
  value       = <<-EOT
    💰 Estimated Monthly Costs (ap-southeast-1):
    
    Compute:
    • EC2 t3.medium (2 instances): ~$60.80
    • ALB: ~$23.00
    • NAT Gateway (2 AZs): ~$64.80
    • EBS Storage (20GB × 2): ~$4.00
    
    Storage:
    • S3 Standard (100GB): ~$2.30
    • S3 Glacier (1TB after 90 days): ~$4.10
    • CloudFront (100GB transfer): ~$8.50
    
    Networking:
    • Data Transfer (500GB): ~$45.00
    • Route53 (1 hosted zone): ~$0.50
    
    Monitoring:
    • CloudWatch Logs (10GB): ~$5.00
    • CloudWatch Alarms (10 alarms): ~$1.00
    
    Security:
    • KMS (1 key, 1000 requests/month): ~$1.20
    • ACM Certificate: FREE
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Total Estimated: ~$220/month
    
    Note: Actual costs may vary based on usage.
    Consider reserved instances for 30-40% savings.
  EOT
}
