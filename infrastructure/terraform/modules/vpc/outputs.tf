# ============================================================================
# VPC Module - Outputs
# Supports both existing VPC (data source) and new VPC creation
# ============================================================================

output "vpc_id" {
  description = "ID of the VPC (existing or created)"
  value       = local.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = var.use_existing_vpc ? data.aws_vpc.existing[0].cidr_block : aws_vpc.main[0].cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets (or existing subnets if using existing VPC)"
  value       = local.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of private subnets (empty if using existing VPC)"
  value       = local.private_subnet_ids
}

output "public_subnet_cidrs" {
  description = "CIDR blocks of public subnets"
  value       = var.use_existing_vpc ? data.aws_subnet.existing[*].cidr_block : aws_subnet.public[*].cidr_block
}

output "private_subnet_cidrs" {
  description = "CIDR blocks of private subnets"
  value       = var.use_existing_vpc ? [] : aws_subnet.private[*].cidr_block
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway (null if using existing VPC)"
  value       = var.use_existing_vpc ? null : aws_internet_gateway.main[0].id
}

output "nat_gateway_ids" {
  description = "IDs of NAT Gateways (empty if using existing VPC)"
  value       = var.use_existing_vpc ? [] : (var.enable_nat_gateway ? aws_nat_gateway.main[*].id : [])
}

output "nat_gateway_public_ips" {
  description = "Public IPs of NAT Gateways (empty if using existing VPC)"
  value       = var.use_existing_vpc ? [] : (var.enable_nat_gateway ? aws_eip.nat[*].public_ip : [])
}

output "public_route_table_id" {
  description = "ID of public route table (null if using existing VPC)"
  value       = var.use_existing_vpc ? null : aws_route_table.public[0].id
}

output "private_route_table_ids" {
  description = "IDs of private route tables (empty if using existing VPC)"
  value       = var.use_existing_vpc ? [] : aws_route_table.private[*].id
}

output "using_existing_vpc" {
  description = "Whether using an existing VPC (true) or created new VPC (false)"
  value       = var.use_existing_vpc
}
