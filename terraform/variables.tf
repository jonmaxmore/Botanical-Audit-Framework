variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "gacp-certify-flow"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"]
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "database_subnet_cidrs" {
  description = "Database subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
}

# MongoDB Atlas Configuration
variable "mongodb_atlas_org_id" {
  description = "MongoDB Atlas Organization ID"
  type        = string
}

variable "mongodb_atlas_public_key" {
  description = "MongoDB Atlas Public API Key"
  type        = string
  sensitive   = true
}

variable "mongodb_atlas_private_key" {
  description = "MongoDB Atlas Private API Key"
  type        = string
  sensitive   = true
}

variable "mongodb_instance_size" {
  description = "MongoDB Atlas instance size (M10, M20, M30, etc.)"
  type        = string
  default     = "M10"
  
  validation {
    condition     = contains(["M10", "M20", "M30", "M40", "M50"], var.mongodb_instance_size)
    error_message = "MongoDB instance size must be M10, M20, M30, M40, or M50."
  }
}

variable "mongodb_disk_size_gb" {
  description = "MongoDB disk size in GB"
  type        = number
  default     = 10
}

variable "mongodb_database_name" {
  description = "MongoDB database name"
  type        = string
  default     = "gacp_production"
}

variable "mongodb_username" {
  description = "MongoDB database username"
  type        = string
  default     = "gacp_admin"
  sensitive   = true
}

variable "mongodb_password" {
  description = "MongoDB database password"
  type        = string
  sensitive   = true
}

variable "mongodb_auto_scale_compute" {
  description = "Enable MongoDB auto-scaling for compute"
  type        = bool
  default     = true
}

variable "enable_vpc_peering" {
  description = "Enable VPC peering for MongoDB Atlas"
  type        = bool
  default     = false
}

variable "alb_ip_addresses" {
  description = "Application Load Balancer IP addresses for MongoDB Atlas whitelist"
  type        = list(string)
  default     = []
}

variable "alert_email" {
  description = "Email address for MongoDB Atlas alerts"
  type        = string
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 2
}

variable "ecs_task_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 1024
}

variable "ecs_task_memory" {
  description = "ECS task memory (MB)"
  type        = number
  default     = 2048
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 3
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 3000
}

variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "admin.gacp-certify.com"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for critical resources"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 30
}

variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring for RDS"
  type        = bool
  default     = true
}

variable "monitoring_interval" {
  description = "Enhanced monitoring interval in seconds"
  type        = number
  default     = 60
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
