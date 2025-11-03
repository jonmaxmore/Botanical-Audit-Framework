# ============================================================================
# Monitoring Module - Variables
# ============================================================================

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "alarm_email" {
  description = "Email address for alarm notifications"
  type        = string
}

variable "alarm_cpu_threshold" {
  description = "CPU utilization threshold for alarms (%)"
  type        = number
  default     = 80
}

variable "alarm_memory_threshold" {
  description = "Memory utilization threshold for alarms (%)"
  type        = number
  default     = 85
}

variable "alarm_5xx_threshold" {
  description = "Number of 5xx errors to trigger alarm"
  type        = number
  default     = 10
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

variable "alb_arn_suffix" {
  description = "ARN suffix of the ALB for metrics"
  type        = string
}

variable "target_group_arn_suffix" {
  description = "ARN suffix of the target group for metrics"
  type        = string
}

variable "autoscaling_group_name" {
  description = "Name of the Auto Scaling Group (optional)"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
