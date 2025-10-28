# Variables

variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

# ECS Backend
variable "backend_cpu" {
  type    = string
  default = "512"
}

variable "backend_memory" {
  type    = string
  default = "1024"
}

variable "backend_desired_count" {
  type    = number
  default = 2
}

variable "backend_min_count" {
  type    = number
  default = 2
}

variable "backend_max_count" {
  type    = number
  default = 10
}

# Redis
variable "redis_node_type" {
  type    = string
  default = "cache.t3.micro"
}

variable "redis_num_nodes" {
  type    = number
  default = 2
}

# SSL Certificate
variable "ssl_certificate_arn" {
  type        = string
  description = "ARN of SSL certificate in ACM"
}

# Secrets (from secrets.tf)
variable "farmer_jwt_secret" {
  type      = string
  sensitive = true
}

variable "dtam_jwt_secret" {
  type      = string
  sensitive = true
}

variable "mongodb_uri" {
  type      = string
  sensitive = true
}

variable "redis_url" {
  type      = string
  sensitive = true
}

variable "smtp_password" {
  type      = string
  sensitive = true
}

variable "sms_api_key" {
  type      = string
  sensitive = true
}

variable "line_notify_token" {
  type      = string
  sensitive = true
}

variable "payment_secret_key" {
  type      = string
  sensitive = true
}
