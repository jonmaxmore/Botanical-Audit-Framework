# ============================================================================
# Compute Module - Outputs
# ============================================================================

output "alb_id" {
  description = "ID of the Application Load Balancer"
  value       = aws_lb.main.id
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "target_group_arn" {
  description = "ARN of the backend target group"
  value       = aws_lb_target_group.backend.arn
}

output "target_group_name" {
  description = "Name of the backend target group"
  value       = aws_lb_target_group.backend.name
}

output "launch_template_id" {
  description = "ID of the launch template (null if not created)"
  value       = var.github_repo != "" ? aws_launch_template.backend[0].id : null
}

output "launch_template_latest_version" {
  description = "Latest version of the launch template (null if not created)"
  value       = var.github_repo != "" ? aws_launch_template.backend[0].latest_version : null
}

output "autoscaling_group_name" {
  description = "Name of the Auto Scaling Group (null if not created)"
  value       = var.github_repo != "" && length(var.private_subnet_ids) > 0 ? aws_autoscaling_group.backend[0].name : null
}

output "autoscaling_group_arn" {
  description = "ARN of the Auto Scaling Group (null if not created)"
  value       = var.github_repo != "" && length(var.private_subnet_ids) > 0 ? aws_autoscaling_group.backend[0].arn : null
}

output "existing_instance_registered" {
  description = "Whether existing instance was registered to target group"
  value       = var.existing_instance_id != ""
}

output "http_listener_arn" {
  description = "ARN of HTTP listener"
  value       = aws_lb_listener.http.arn
}

output "https_listener_arn" {
  description = "ARN of HTTPS listener (null if not created)"
  value       = var.acm_certificate_arn != "" ? aws_lb_listener.https[0].arn : null
}
