# ============================================================================
# Terraform AWS Provider Configuration
# Botanical Audit Framework - Production Infrastructure
# ============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Backend configuration for state management
  # Uncomment and configure for production use
  # backend "s3" {
  #   bucket         = "botanical-audit-terraform-state"
  #   key            = "production/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Botanical-Audit-Framework"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "GACP-Platform"
      CostCenter  = "Production"
    }
  }
}

# AWS Provider for us-east-1 (required for CloudFront ACM certificates)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "Botanical-Audit-Framework"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
