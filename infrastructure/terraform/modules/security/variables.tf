# ============================================================================
# Security Module - Variables
# ============================================================================

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "backend_port" {
  description = "Backend application port"
  type        = number
}

variable "allowed_ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
}

variable "allowed_alb_cidr_blocks" {
  description = "CIDR blocks allowed to access ALB"
  type        = list(string)
}

variable "enable_kms_encryption" {
  description = "Enable KMS encryption"
  type        = bool
}

variable "kms_key_rotation" {
  description = "Enable KMS key rotation"
  type        = bool
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
