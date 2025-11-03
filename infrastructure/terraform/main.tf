# ============================================================================
# Main Terraform Configuration
# Botanical Audit Framework - Production Infrastructure
# ============================================================================

# Local variables for common configurations
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.additional_tags
  )
}

# ============================================================================
# VPC Module
# Supports both existing VPC (data source) and new VPC creation
# ============================================================================

module "vpc" {
  source = "./modules/vpc"

  project_name           = var.project_name
  environment            = var.environment
  
  # Existing VPC support
  use_existing_vpc       = var.use_existing_vpc
  existing_vpc_id        = var.existing_vpc_id
  existing_subnet_ids    = var.existing_subnet_ids
  
  # New VPC configuration (ignored if use_existing_vpc is true)
  vpc_cidr               = var.vpc_cidr
  availability_zones     = var.availability_zones
  public_subnet_cidrs    = var.public_subnet_cidrs
  private_subnet_cidrs   = var.private_subnet_cidrs
  enable_nat_gateway     = var.enable_nat_gateway
  single_nat_gateway     = var.single_nat_gateway
  
  tags                   = local.common_tags
}

# ============================================================================
# Security Module
# ============================================================================

module "security" {
  source = "./modules/security"

  project_name              = var.project_name
  environment               = var.environment
  vpc_id                    = module.vpc.vpc_id
  backend_port              = var.backend_port
  allowed_ssh_cidr_blocks   = var.allowed_ssh_cidr_blocks
  allowed_alb_cidr_blocks   = var.allowed_alb_cidr_blocks
  enable_kms_encryption     = var.enable_kms_encryption
  kms_key_rotation          = var.kms_key_rotation
  tags                      = local.common_tags
}

# ============================================================================
# Compute Module
# ============================================================================

module "compute" {
  source = "./modules/compute"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  public_subnet_ids          = module.vpc.public_subnet_ids
  private_subnet_ids         = module.vpc.private_subnet_ids
  alb_security_group_id      = module.security.alb_security_group_id
  backend_security_group_id  = module.security.backend_security_group_id
  
  # Existing instance support
  existing_instance_id       = var.existing_instance_id
  
  ec2_instance_type          = var.ec2_instance_type
  ec2_key_name               = var.ec2_key_name
  asg_min_size               = var.asg_min_size
  asg_max_size               = var.asg_max_size
  asg_desired_capacity       = var.asg_desired_capacity
  backend_port               = var.backend_port
  nodejs_version             = var.nodejs_version
  github_repo                = var.github_repo
  github_branch              = var.github_branch
  mongodb_connection_string  = var.mongodb_connection_string
  app_environment_vars       = var.app_environment_vars
  
  # ACM certificate from Networking module
  acm_certificate_arn        = module.networking.acm_certificate_arn
  
  tags                       = local.common_tags

  depends_on = [module.vpc, module.security, module.networking]
}

# ============================================================================
# Storage Module
# ============================================================================

module "storage" {
  source = "./modules/storage"

  project_name                 = var.project_name
  environment                  = var.environment
  kms_key_id                   = module.security.kms_key_id
  s3_force_destroy             = var.s3_force_destroy
  s3_versioning_enabled        = var.s3_versioning_enabled
  s3_lifecycle_glacier_days    = var.s3_lifecycle_glacier_days
  s3_lifecycle_expiration_days = var.s3_lifecycle_expiration_days
  cloudfront_price_class       = "PriceClass_200" # Asia, Europe, North America
  tags                         = local.common_tags

  depends_on = [module.security]
}

# ============================================================================
# Networking Module (Route53 & ACM)
# ============================================================================

module "networking" {
  source = "./modules/networking"

  project_name         = var.project_name
  environment          = var.environment
  domain_name          = var.domain_name
  api_subdomain        = var.api_subdomain
  create_route53_zone  = var.create_route53_zone
  alb_dns_name         = module.compute.alb_dns_name
  alb_zone_id          = module.compute.alb_zone_id
  cloudfront_domain_name = module.storage.cloudfront_domain_name
  cloudfront_zone_id     = module.storage.cloudfront_zone_id
  tags                 = local.common_tags

  depends_on = [module.compute, module.storage]
}

# ============================================================================
# Monitoring Module (CloudWatch)
# ============================================================================

module "monitoring" {
  source = "./modules/monitoring"

  project_name                = var.project_name
  environment                 = var.environment
  alarm_email                 = var.alarm_email
  autoscaling_group_name      = module.compute.autoscaling_group_name
  alb_arn_suffix              = split("/", module.compute.alb_arn)[1]
  target_group_arn_suffix     = split(":", module.compute.target_group_arn)[5]
  alarm_cpu_threshold         = var.alarm_cpu_threshold
  alarm_memory_threshold      = var.alarm_memory_threshold
  alarm_5xx_threshold         = var.alarm_5xx_threshold
  log_retention_days          = var.log_retention_days
  tags                        = local.common_tags

  depends_on = [module.compute]
}
