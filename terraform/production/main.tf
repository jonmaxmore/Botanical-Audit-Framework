# Botanical Audit Framework - AWS Infrastructure
# Production Environment - Bangkok Region (ap-southeast-1)

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state management
  backend "s3" {
    bucket         = "botanical-audit-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "botanical-audit-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Botanical Audit Framework"
      Environment = "production"
      ManagedBy   = "Terraform"
      CostCenter  = "cannabis-traceability"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local variables
locals {
  name_prefix = "botanical-audit-prod"
  azs         = slice(data.aws_availability_zones.available.names, 0, 2)

  common_tags = {
    Project     = "Botanical Audit Framework"
    Environment = "production"
    Region      = var.aws_region
  }
}
