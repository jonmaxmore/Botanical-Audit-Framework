# ============================================================================
# VPC Module - Main Configuration
# Botanical Audit Framework - AWS VPC with Public/Private Subnets
# Supports both existing VPC (data source) and new VPC creation
# ============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Use existing or new VPC ID
  vpc_id = var.use_existing_vpc ? data.aws_vpc.existing[0].id : aws_vpc.main[0].id
  
  # Use existing or new subnet IDs
  subnet_ids = var.use_existing_vpc ? var.existing_subnet_ids : concat(
    aws_subnet.public[*].id,
    aws_subnet.private[*].id
  )
  
  # For existing VPC, use provided subnet IDs
  # For new VPC, use created public/private subnets
  public_subnet_ids = var.use_existing_vpc ? var.existing_subnet_ids : aws_subnet.public[*].id
  private_subnet_ids = var.use_existing_vpc ? [] : aws_subnet.private[*].id
}

# ============================================================================
# Data Sources for Existing VPC
# ============================================================================

data "aws_vpc" "existing" {
  count = var.use_existing_vpc ? 1 : 0
  id    = var.existing_vpc_id
}

data "aws_subnet" "existing" {
  count = var.use_existing_vpc ? length(var.existing_subnet_ids) : 0
  id    = var.existing_subnet_ids[count.index]
}

# ============================================================================
# VPC (only create if not using existing)
# ============================================================================

resource "aws_vpc" "main" {
  count = var.use_existing_vpc ? 0 : 1
  
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-vpc"
    }
  )
}

# ============================================================================
# Internet Gateway (only create if not using existing VPC)
# ============================================================================

resource "aws_internet_gateway" "main" {
  count = var.use_existing_vpc ? 0 : 1
  
  vpc_id = aws_vpc.main[0].id

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-igw"
    }
  )
}

# ============================================================================
# Public Subnets (only create if not using existing VPC)
# ============================================================================

resource "aws_subnet" "public" {
  count = var.use_existing_vpc ? 0 : length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.main[0].id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-public-subnet-${count.index + 1}"
      Tier = "Public"
      AZ   = var.availability_zones[count.index]
    }
  )
}

# ============================================================================
# Private Subnets (only create if not using existing VPC)
# ============================================================================

resource "aws_subnet" "private" {
  count = var.use_existing_vpc ? 0 : length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.main[0].id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-private-subnet-${count.index + 1}"
      Tier = "Private"
      AZ   = var.availability_zones[count.index]
    }
  )
}

# ============================================================================
# Elastic IPs for NAT Gateways (only create if not using existing VPC)
# ============================================================================

resource "aws_eip" "nat" {
  count = var.use_existing_vpc ? 0 : (var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.availability_zones)) : 0)

  domain = "vpc"

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-nat-eip-${count.index + 1}"
    }
  )

  depends_on = [aws_internet_gateway.main]
}

# ============================================================================
# NAT Gateways (only create if not using existing VPC)
# ============================================================================

resource "aws_nat_gateway" "main" {
  count = var.use_existing_vpc ? 0 : (var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.availability_zones)) : 0)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-nat-${count.index + 1}"
      AZ   = var.availability_zones[count.index]
    }
  )

  depends_on = [aws_internet_gateway.main]
}

# ============================================================================
# Public Route Table (only create if not using existing VPC)
# ============================================================================

resource "aws_route_table" "public" {
  count = var.use_existing_vpc ? 0 : 1
  
  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main[0].id
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-public-rt"
      Tier = "Public"
    }
  )
}

# ============================================================================
# Public Route Table Associations (only create if not using existing VPC)
# ============================================================================

resource "aws_route_table_association" "public" {
  count = var.use_existing_vpc ? 0 : length(var.public_subnet_cidrs)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[0].id
}

# ============================================================================
# Private Route Tables (only create if not using existing VPC)
# ============================================================================

resource "aws_route_table" "private" {
  count = var.use_existing_vpc ? 0 : (var.enable_nat_gateway ? length(var.availability_zones) : 1)

  vpc_id = aws_vpc.main[0].id

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-private-rt-${count.index + 1}"
      Tier = "Private"
      AZ   = var.availability_zones[count.index % length(var.availability_zones)]
    }
  )
}

# ============================================================================
# Private Route Table Routes to NAT Gateway (only create if not using existing VPC)
# ============================================================================

resource "aws_route" "private_nat_gateway" {
  count = var.use_existing_vpc ? 0 : (var.enable_nat_gateway ? length(var.availability_zones) : 0)

  route_table_id         = aws_route_table.private[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = var.single_nat_gateway ? aws_nat_gateway.main[0].id : aws_nat_gateway.main[count.index].id
}

# ============================================================================
# Private Route Table Associations (only create if not using existing VPC)
# ============================================================================

resource "aws_route_table_association" "private" {
  count = var.use_existing_vpc ? 0 : length(var.private_subnet_cidrs)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index % length(aws_route_table.private)].id
}

# ============================================================================
# VPC Flow Logs (Optional - only create if not using existing VPC)
# ============================================================================

resource "aws_flow_log" "main" {
  count = var.use_existing_vpc ? 0 : 1
  
  iam_role_arn    = aws_iam_role.flow_log[0].arn
  log_destination = aws_cloudwatch_log_group.flow_log[0].arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main[0].id

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-vpc-flow-log"
    }
  )
}

resource "aws_cloudwatch_log_group" "flow_log" {
  count = var.use_existing_vpc ? 0 : 1
  
  name              = "/aws/vpc/${local.name_prefix}-flow-log"
  retention_in_days = 7

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-vpc-flow-log-group"
    }
  )
}

resource "aws_iam_role" "flow_log" {
  count = var.use_existing_vpc ? 0 : 1
  
  name = "${local.name_prefix}-vpc-flow-log-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "flow_log" {
  count = var.use_existing_vpc ? 0 : 1
  
  name = "${local.name_prefix}-vpc-flow-log-policy"
  role = aws_iam_role.flow_log[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })
}
