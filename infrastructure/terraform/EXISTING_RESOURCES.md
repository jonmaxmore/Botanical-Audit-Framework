# ============================================================================
# Existing AWS Resources
# Use these values to import or reference existing infrastructure
# ============================================================================

# ------------------------------
# Existing EC2 Instance
# ------------------------------

# Instance ID: i-036cad13893eb6511
# Public IP: 47.130.0.164
# Public DNS: ec2-47-130-0-164.ap-southeast-1.compute.amazonaws.com
# Private IP: 47.130.0.164
# Private DNS: ip-172-31-20-15.ap-southeast-1.compute.internal
# Instance ARN: arn:aws:ec2:ap-southeast-1:426322450594:instance/i-036cad13893eb6511

# To import existing instance into Terraform:
# terraform import module.compute.aws_instance.existing i-036cad13893eb6511

# ------------------------------
# Existing VPC
# ------------------------------

# VPC ID: vpc-03768ea49251845c3
# Subnet ID: subnet-0a9aedf2d5d4793b4

# To import existing VPC:
# terraform import module.vpc.aws_vpc.main vpc-03768ea49251845c3
# terraform import module.vpc.aws_subnet.public[0] subnet-0a9aedf2d5d4793b4

# ------------------------------
# AWS Account Information
# ------------------------------

# AWS Account ID: 426322450594
# AWS Region: ap-southeast-1

# ============================================================================
# Option 1: Use Existing Resources (Data Sources)
# ============================================================================

# Uncomment in main.tf to use existing resources:

# data "aws_vpc" "existing" {
#   id = "vpc-03768ea49251845c3"
# }
#
# data "aws_subnet" "existing" {
#   id = "subnet-0a9aedf2d5d4793b4"
# }
#
# data "aws_instance" "existing" {
#   instance_id = "i-036cad13893eb6511"
# }

# ============================================================================
# Option 2: Import Existing Resources
# ============================================================================

# Step 1: Add resource to Terraform code
# Step 2: Run import command:
#   terraform import aws_instance.backend i-036cad13893eb6511
#   terraform import aws_vpc.main vpc-03768ea49251845c3
#   terraform import aws_subnet.public subnet-0a9aedf2d5d4793b4

# ============================================================================
# Option 3: Hybrid Approach (Recommended)
# ============================================================================

# Use existing VPC and subnet, but manage other resources with Terraform:
# - Keep existing EC2 instance running
# - Create new ALB pointing to existing instance
# - Add existing instance to new Auto Scaling Group
# - Create S3, Route53, CloudWatch with Terraform

# Configuration for hybrid approach:
use_existing_vpc      = true
existing_vpc_id       = "vpc-03768ea49251845c3"
existing_subnet_ids   = ["subnet-0a9aedf2d5d4793b4"]

use_existing_instance = true
existing_instance_id  = "i-036cad13893eb6511"
existing_instance_ip  = "47.130.0.164"

# ============================================================================
# Next Steps
# ============================================================================

# 1. Check what resources exist:
#    aws ec2 describe-instances --instance-ids i-036cad13893eb6511
#    aws ec2 describe-vpcs --vpc-ids vpc-03768ea49251845c3
#    aws ec2 describe-subnets --subnet-ids subnet-0a9aedf2d5d4793b4

# 2. Get VPC CIDR:
#    aws ec2 describe-vpcs --vpc-ids vpc-03768ea49251845c3 --query 'Vpcs[0].CidrBlock'

# 3. Check security groups:
#    aws ec2 describe-security-groups --filters "Name=vpc-id,Values=vpc-03768ea49251845c3"

# 4. Decide approach:
#    - Import all existing resources to Terraform (full management)
#    - Reference existing resources with data sources (read-only)
#    - Hybrid: Use existing VPC/Instance, add new resources around them
