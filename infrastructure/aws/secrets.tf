# AWS Secrets Manager Configuration for GACP Platform

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_secretsmanager_secret" "gacp_production" {
  name        = "gacp-platform/production"
  description = "GACP Platform production secrets"
  
  recovery_window_in_days = 7
  
  tags = {
    Environment = "production"
    Application = "gacp-platform"
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "gacp_production_version" {
  secret_id = aws_secretsmanager_secret.gacp_production.id
  secret_string = jsonencode({
    FARMER_JWT_SECRET     = var.farmer_jwt_secret
    DTAM_JWT_SECRET       = var.dtam_jwt_secret
    MONGODB_URI           = var.mongodb_uri
    REDIS_URL             = var.redis_url
    SMTP_PASSWORD         = var.smtp_password
    SMS_API_KEY           = var.sms_api_key
    LINE_NOTIFY_TOKEN     = var.line_notify_token
    PAYMENT_SECRET_KEY    = var.payment_secret_key
  })
}

resource "aws_iam_policy" "secrets_access" {
  name        = "gacp-secrets-access"
  description = "Allow ECS tasks to access GACP secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.gacp_production.arn
      }
    ]
  })
}

variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

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

output "production_secret_arn" {
  value       = aws_secretsmanager_secret.gacp_production.arn
  description = "ARN of production secrets"
}

output "secrets_policy_arn" {
  value       = aws_iam_policy.secrets_access.arn
  description = "ARN of secrets access policy"
}
