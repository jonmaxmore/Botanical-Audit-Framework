# ============================================================================
# Compute Module - Main Configuration
# Application Load Balancer + Target Groups + EC2/ASG
# Supports registering existing EC2 instances
# ============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ============================================================================
# Application Load Balancer
# ============================================================================

resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-alb"
    }
  )
}

# ============================================================================
# Target Group for Backend Application
# ============================================================================

resource "aws_lb_target_group" "backend" {
  name     = "${local.name_prefix}-backend-tg"
  port     = var.backend_port
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200-299"
  }

  deregistration_delay = 30

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400 # 24 hours
    enabled         = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-backend-tg"
    }
  )
}

# ============================================================================
# Register Existing EC2 Instance to Target Group
# ============================================================================

resource "aws_lb_target_group_attachment" "existing" {
  count = var.existing_instance_id != "" ? 1 : 0

  target_group_arn = aws_lb_target_group.backend.arn
  target_id        = var.existing_instance_id
  port             = var.backend_port
}

# ============================================================================
# ALB Listener - HTTPS (Primary)
# ============================================================================

resource "aws_lb_listener" "https" {
  count = var.acm_certificate_arn != "" ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  tags = var.tags
}

# ============================================================================
# ALB Listener - HTTP (Redirect to HTTPS or Forward)
# ============================================================================

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = var.acm_certificate_arn != "" ? "redirect" : "forward"

    # Redirect to HTTPS if certificate exists
    dynamic "redirect" {
      for_each = var.acm_certificate_arn != "" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }

    # Forward to target group if no HTTPS
    target_group_arn = var.acm_certificate_arn == "" ? aws_lb_target_group.backend.arn : null
  }

  tags = var.tags
}

# ============================================================================
# Launch Template for New Instances (Optional)
# Only created if github_repo is provided
# ============================================================================

resource "aws_launch_template" "backend" {
  count = var.github_repo != "" ? 1 : 0

  name_prefix   = "${local.name_prefix}-backend-"
  image_id      = data.aws_ami.ubuntu[0].id
  instance_type = var.ec2_instance_type
  key_name      = var.ec2_key_name

  vpc_security_group_ids = [var.backend_security_group_id]

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    nodejs_version            = var.nodejs_version
    github_repo               = var.github_repo
    github_branch             = var.github_branch
    backend_port              = var.backend_port
    mongodb_connection_string = var.mongodb_connection_string
    app_environment_vars      = var.app_environment_vars
  }))

  monitoring {
    enabled = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tag_specifications {
    resource_type = "instance"

    tags = merge(
      var.tags,
      {
        Name = "${local.name_prefix}-backend-instance"
      }
    )
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-backend-lt"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# ============================================================================
# Auto Scaling Group (Optional)
# Only created if github_repo is provided and private subnets exist
# ============================================================================

resource "aws_autoscaling_group" "backend" {
  count = var.github_repo != "" && length(var.private_subnet_ids) > 0 ? 1 : 0

  name                = "${local.name_prefix}-backend-asg"
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns   = [aws_lb_target_group.backend.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = var.asg_min_size
  max_size         = var.asg_max_size
  desired_capacity = var.asg_desired_capacity

  launch_template {
    id      = aws_launch_template.backend[0].id
    version = "$Latest"
  }

  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupMinSize",
    "GroupMaxSize",
    "GroupTotalInstances"
  ]

  tag {
    key                 = "Name"
    value               = "${local.name_prefix}-backend-instance"
    propagate_at_launch = true
  }

  dynamic "tag" {
    for_each = var.tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [desired_capacity]
  }
}

# ============================================================================
# Data Source - Latest Ubuntu AMI
# ============================================================================

data "aws_ami" "ubuntu" {
  count = var.github_repo != "" ? 1 : 0

  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}
