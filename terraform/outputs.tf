output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "Database subnet IDs"
  value       = aws_subnet.database[*].id
}

# MongoDB Atlas Outputs
output "mongodb_atlas_cluster_id" {
  description = "MongoDB Atlas cluster ID"
  value       = mongodbatlas_cluster.gacp.cluster_id
}

output "mongodb_connection_string" {
  description = "MongoDB Atlas connection string (SRV format)"
  value       = mongodbatlas_cluster.gacp.connection_strings[0].standard_srv
  sensitive   = true
}

output "mongodb_srv_address" {
  description = "MongoDB SRV address"
  value       = mongodbatlas_cluster.gacp.srv_address
}

output "mongodb_cluster_state" {
  description = "MongoDB cluster state"
  value       = mongodbatlas_cluster.gacp.state_name
}

output "mongodb_full_uri" {
  description = "Full MongoDB connection URI with credentials"
  value       = "mongodb+srv://${var.mongodb_username}:${var.mongodb_password}@${mongodbatlas_cluster.gacp.srv_address}/${var.mongodb_database_name}?retryWrites=true&w=majority&readPreference=secondaryPreferred"
  sensitive   = true
}


output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = 6379
}

output "redis_reader_endpoint" {
  description = "Redis reader endpoint"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
  sensitive   = true
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB zone ID"
  value       = aws_lb.main.zone_id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}

output "s3_uploads_bucket" {
  description = "S3 uploads bucket name"
  value       = aws_s3_bucket.uploads.id
}

output "s3_backups_bucket" {
  description = "S3 backups bucket name"
  value       = aws_s3_bucket.backups.id
}

output "sns_alerts_topic_arn" {
  description = "SNS alerts topic ARN"
  value       = aws_sns_topic.alerts.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.app.name
}

output "dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}
