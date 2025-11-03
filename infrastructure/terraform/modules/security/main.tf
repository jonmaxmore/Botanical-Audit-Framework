# ============================================================================
# Security Module - Main Configuration
# Security Groups + KMS Encryption
# ============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ============================================================================
# ALB Security Group
# ============================================================================

resource "aws_security_group" "alb" {
  name        = "${local.name_prefix}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = var.vpc_id

  # HTTP from internet
  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_alb_cidr_blocks
  }

  # HTTPS from internet
  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_alb_cidr_blocks
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-alb-sg"
    }
  )
}

# ============================================================================
# Backend Security Group
# ============================================================================

resource "aws_security_group" "backend" {
  name        = "${local.name_prefix}-backend-sg"
  description = "Security group for backend application servers"
  vpc_id      = var.vpc_id

  # Backend port from ALB
  ingress {
    description     = "Backend port from ALB"
    from_port       = var.backend_port
    to_port         = var.backend_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # SSH access (if CIDR blocks provided)
  dynamic "ingress" {
    for_each = length(var.allowed_ssh_cidr_blocks) > 0 ? [1] : []
    content {
      description = "SSH access"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = var.allowed_ssh_cidr_blocks
    }
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-backend-sg"
    }
  )
}

# ============================================================================
# MongoDB Security Group (for future use with DocumentDB or self-hosted)
# ============================================================================

resource "aws_security_group" "mongodb" {
  name        = "${local.name_prefix}-mongodb-sg"
  description = "Security group for MongoDB/DocumentDB"
  vpc_id      = var.vpc_id

  # MongoDB port from backend
  ingress {
    description     = "MongoDB port from backend"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-mongodb-sg"
    }
  )
}

# ============================================================================
# Redis Security Group (for future use with ElastiCache)
# ============================================================================

resource "aws_security_group" "redis" {
  name        = "${local.name_prefix}-redis-sg"
  description = "Security group for Redis/ElastiCache"
  vpc_id      = var.vpc_id

  # Redis port from backend
  ingress {
    description     = "Redis port from backend"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-redis-sg"
    }
  )
}

# ============================================================================
# KMS Customer Master Key (CMK)
# ============================================================================

resource "aws_kms_key" "main" {
  count = var.enable_kms_encryption ? 1 : 0

  description             = "KMS key for ${local.name_prefix}"
  deletion_window_in_days = 30
  enable_key_rotation     = var.kms_key_rotation

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow services to use the key"
        Effect = "Allow"
        Principal = {
          Service = [
            "s3.amazonaws.com",
            "logs.amazonaws.com",
            "ec2.amazonaws.com"
          ]
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-kms-key"
    }
  )
}

# KMS Key Alias
resource "aws_kms_alias" "main" {
  count = var.enable_kms_encryption ? 1 : 0

  name          = "alias/${local.name_prefix}"
  target_key_id = aws_kms_key.main[0].key_id
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}
