# Variables for Botanical Audit Framework Infrastructure

variable "aws_region" {
  description = "AWS region for resources (Bangkok)"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "botanical-audit"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

# Compute Configuration
variable "backend_instance_type" {
  description = "EC2 instance type for backend"
  type        = string
  default     = "t3.medium" # 2 vCPU, 4GB RAM
}

variable "backend_desired_count" {
  description = "Desired number of backend instances"
  type        = number
  default     = 2
}

variable "backend_min_count" {
  description = "Minimum number of backend instances"
  type        = number
  default     = 2
}

variable "backend_max_count" {
  description = "Maximum number of backend instances"
  type        = number
  default     = 10
}

# Database Configuration
variable "mongodb_atlas_connection_string" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "botanical-audit.com"
}

variable "api_subdomain" {
  description = "API subdomain"
  type        = string
  default     = "api"
}

# SSL Certificate
variable "certificate_arn" {
  description = "ARN of ACM certificate for HTTPS"
  type        = string
  default     = "" # Will be created if empty
}

# Monitoring & Alerts
variable "alert_email" {
  description = "Email address for CloudWatch alarms"
  type        = string
}

variable "cpu_threshold" {
  description = "CPU utilization threshold for alarms (%)"
  type        = number
  default     = 80
}

variable "memory_threshold" {
  description = "Memory utilization threshold for alarms (%)"
  type        = number
  default     = 85
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

# S3 Buckets
variable "enable_s3_versioning" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = true
}

variable "s3_lifecycle_days" {
  description = "Days before transitioning S3 objects to Glacier"
  type        = number
  default     = 90
}

# Backup Configuration
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

# KMS Configuration
variable "enable_key_rotation" {
  description = "Enable automatic KMS key rotation"
  type        = bool
  default     = true
}

# Network Configuration
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access ALB"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Change to specific IPs in production
}

variable "office_ip_ranges" {
  description = "Office IP ranges for SSH access"
  type        = list(string)
  default     = [] # Add your office IPs here
}
