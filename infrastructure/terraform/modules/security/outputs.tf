# ============================================================================
# Security Module - Outputs
# ============================================================================

output "alb_security_group_id" {
  description = "ID of ALB security group"
  value       = aws_security_group.alb.id
}

output "backend_security_group_id" {
  description = "ID of backend security group"
  value       = aws_security_group.backend.id
}

output "mongodb_security_group_id" {
  description = "ID of MongoDB security group"
  value       = aws_security_group.mongodb.id
}

output "redis_security_group_id" {
  description = "ID of Redis security group"
  value       = aws_security_group.redis.id
}

output "kms_key_id" {
  description = "ID of KMS key"
  value       = var.enable_kms_encryption ? aws_kms_key.main[0].id : null
  sensitive   = true
}

output "kms_key_arn" {
  description = "ARN of KMS key"
  value       = var.enable_kms_encryption ? aws_kms_key.main[0].arn : null
}

output "kms_key_alias" {
  description = "Alias of KMS key"
  value       = var.enable_kms_encryption ? aws_kms_alias.main[0].name : null
}
