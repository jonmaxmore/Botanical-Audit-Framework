# ============================================================================
# Terraform Variables
# Botanical Audit Framework - Production Infrastructure
# ============================================================================

# ------------------------------
# General Configuration
# ------------------------------

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "botanical-audit"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

variable "aws_region" {
  description = "AWS region for infrastructure deployment"
  type        = string
  default     = "ap-southeast-1" # Bangkok, Thailand

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.aws_region))
    error_message = "AWS region must be in format: xx-xxxx-x (e.g., ap-southeast-1)."
  }
}

# ------------------------------
# VPC Configuration
# ------------------------------

variable "use_existing_vpc" {
  description = "Use existing VPC instead of creating a new one (recommended for existing infrastructure)"
  type        = bool
  default     = false
}

variable "existing_vpc_id" {
  description = "ID of existing VPC to use (required if use_existing_vpc is true)"
  type        = string
  default     = ""
  
  validation {
    condition     = var.use_existing_vpc ? can(regex("^vpc-[a-z0-9]{8,}$", var.existing_vpc_id)) : true
    error_message = "The existing_vpc_id must be a valid VPC ID (vpc-xxxxxxxx)."
  }
}

variable "existing_subnet_ids" {
  description = "List of existing subnet IDs to use (required if use_existing_vpc is true)"
  type        = list(string)
  default     = []
  
  validation {
    condition     = var.use_existing_vpc ? length(var.existing_subnet_ids) > 0 : true
    error_message = "At least one subnet ID must be provided when using an existing VPC."
  }
}

variable "existing_instance_id" {
  description = "ID of existing EC2 instance to register with ALB target group"
  type        = string
  default     = ""
  
  validation {
    condition     = var.existing_instance_id == "" ? true : can(regex("^i-[a-z0-9]{8,}$", var.existing_instance_id))
    error_message = "The existing_instance_id must be a valid instance ID (i-xxxxxxxx) or empty."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC (ignored if use_existing_vpc is true)"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
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

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single NAT Gateway for all private subnets (cost optimization)"
  type        = bool
  default     = false # Use one per AZ for high availability
}

# ------------------------------
# Compute Configuration
# ------------------------------

variable "ec2_instance_type" {
  description = "EC2 instance type for backend servers"
  type        = string
  default     = "t3.medium" # 2 vCPU, 4GB RAM

  validation {
    condition     = can(regex("^t3\\.(micro|small|medium|large)$", var.ec2_instance_type))
    error_message = "Instance type must be t3.micro, t3.small, t3.medium, or t3.large."
  }
}

variable "ec2_key_name" {
  description = "EC2 key pair name for SSH access"
  type        = string
  default     = null
}

variable "asg_min_size" {
  description = "Minimum number of EC2 instances in Auto Scaling Group"
  type        = number
  default     = 2

  validation {
    condition     = var.asg_min_size >= 1 && var.asg_min_size <= 10
    error_message = "ASG min size must be between 1 and 10."
  }
}

variable "asg_max_size" {
  description = "Maximum number of EC2 instances in Auto Scaling Group"
  type        = number
  default     = 10

  validation {
    condition     = var.asg_max_size >= 2 && var.asg_max_size <= 20
    error_message = "ASG max size must be between 2 and 20."
  }
}

variable "asg_desired_capacity" {
  description = "Desired number of EC2 instances in Auto Scaling Group"
  type        = number
  default     = 2

  validation {
    condition     = var.asg_desired_capacity >= 1
    error_message = "ASG desired capacity must be at least 1."
  }
}

variable "backend_port" {
  description = "Backend application port"
  type        = number
  default     = 5000
}

# ------------------------------
# Database Configuration
# ------------------------------

variable "mongodb_connection_string" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
  default     = ""
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type (optional)"
  type        = string
  default     = "cache.t3.micro"
}

variable "enable_redis" {
  description = "Enable ElastiCache Redis for session management"
  type        = bool
  default     = false # Set to true if needed
}

# ------------------------------
# Storage Configuration
# ------------------------------

variable "s3_force_destroy" {
  description = "Force destroy S3 buckets even if they contain objects (use with caution)"
  type        = bool
  default     = false
}

variable "s3_versioning_enabled" {
  description = "Enable versioning for S3 buckets"
  type        = bool
  default     = true
}

variable "s3_lifecycle_glacier_days" {
  description = "Number of days before transitioning to Glacier"
  type        = number
  default     = 90
}

variable "s3_lifecycle_expiration_days" {
  description = "Number of days before object expiration"
  type        = number
  default     = 2555 # ~7 years
}

# ------------------------------
# Domain & SSL Configuration
# ------------------------------

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "botanical-audit.com"
}

variable "api_subdomain" {
  description = "API subdomain"
  type        = string
  default     = "api"
}

variable "create_route53_zone" {
  description = "Create Route53 hosted zone (set to false if zone already exists)"
  type        = bool
  default     = true
}

variable "acm_certificate_arn" {
  description = "Existing ACM certificate ARN (leave empty to create new)"
  type        = string
  default     = ""
}

# ------------------------------
# Monitoring & Alerting
# ------------------------------

variable "enable_cloudwatch_alarms" {
  description = "Enable CloudWatch alarms"
  type        = bool
  default     = true
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarm notifications"
  type        = string
  default     = ""

  validation {
    condition     = var.alarm_email == "" || can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.alarm_email))
    error_message = "Email must be a valid email address or empty string."
  }
}

variable "cpu_alarm_threshold" {
  description = "CPU utilization threshold for alarms (percentage)"
  type        = number
  default     = 80

  validation {
    condition     = var.cpu_alarm_threshold > 0 && var.cpu_alarm_threshold <= 100
    error_message = "CPU alarm threshold must be between 1 and 100."
  }
}

variable "memory_alarm_threshold" {
  description = "Memory utilization threshold for alarms (percentage)"
  type        = number
  default     = 85

  validation {
    condition     = var.memory_alarm_threshold > 0 && var.memory_alarm_threshold <= 100
    error_message = "Memory alarm threshold must be between 1 and 100."
  }
}

# ------------------------------
# Security Configuration
# ------------------------------

variable "enable_kms_encryption" {
  description = "Enable KMS encryption for resources"
  type        = bool
  default     = true
}

variable "kms_key_rotation" {
  description = "Enable automatic KMS key rotation"
  type        = bool
  default     = true
}

variable "allowed_ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access (empty to disable SSH)"
  type        = list(string)
  default     = [] # No SSH access by default
}

variable "allowed_alb_cidr_blocks" {
  description = "CIDR blocks allowed to access ALB (0.0.0.0/0 for public access)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ------------------------------
# Application Configuration
# ------------------------------

variable "app_environment_vars" {
  description = "Application environment variables"
  type        = map(string)
  sensitive   = true
  default     = {}
}

variable "nodejs_version" {
  description = "Node.js version to install"
  type        = string
  default     = "20.x"
}

variable "enable_auto_deploy" {
  description = "Enable automatic deployment from GitHub"
  type        = bool
  default     = false
}

variable "github_repo" {
  description = "GitHub repository (owner/repo)"
  type        = string
  default     = "jonmaxmore/Botanical-Audit-Framework"
}

variable "github_branch" {
  description = "GitHub branch to deploy"
  type        = string
  default     = "main"
}

# ------------------------------
# Tags
# ------------------------------

variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
