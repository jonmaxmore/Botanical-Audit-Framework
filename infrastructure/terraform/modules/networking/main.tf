# ============================================================================
# Networking Module - Main Configuration
# Route53 DNS + ACM SSL Certificates
# ============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  api_fqdn    = "${var.api_subdomain}.${var.domain_name}"
  cdn_fqdn    = "cdn.${var.domain_name}"
}

# ============================================================================
# Route53 Hosted Zone
# ============================================================================

resource "aws_route53_zone" "main" {
  count = var.create_route53_zone ? 1 : 0

  name = var.domain_name

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-hosted-zone"
    }
  )
}

# ============================================================================
# Data Source - Existing Route53 Zone (if not creating new)
# ============================================================================

data "aws_route53_zone" "existing" {
  count = var.create_route53_zone ? 0 : 1

  name         = var.domain_name
  private_zone = false
}

locals {
  zone_id = var.create_route53_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
}

# ============================================================================
# ACM Certificate for API (Regional - for ALB)
# ============================================================================

resource "aws_acm_certificate" "api" {
  domain_name               = local.api_fqdn
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-api-cert"
    }
  )
}

# ============================================================================
# Route53 Records for ACM Certificate Validation
# ============================================================================

resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.zone_id
}

# ============================================================================
# ACM Certificate Validation
# ============================================================================

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]
}

# ============================================================================
# Route53 A Record - API → ALB
# ============================================================================

resource "aws_route53_record" "api" {
  zone_id = local.zone_id
  name    = local.api_fqdn
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# ============================================================================
# Route53 A Record - CDN → CloudFront
# ============================================================================

resource "aws_route53_record" "cdn" {
  zone_id = local.zone_id
  name    = local.cdn_fqdn
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

# ============================================================================
# Route53 CNAME Record - www → api
# ============================================================================

resource "aws_route53_record" "www" {
  zone_id = local.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [local.api_fqdn]
}

# ============================================================================
# Route53 Health Check for ALB
# ============================================================================

resource "aws_route53_health_check" "api" {
  fqdn              = local.api_fqdn
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-api-health-check"
    }
  )
}

# ============================================================================
# CloudWatch Alarm for Health Check
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "health_check" {
  alarm_name          = "${local.name_prefix}-api-health-check-failed"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = 60
  statistic           = "Minimum"
  threshold           = 1
  alarm_description   = "API health check is failing"
  treat_missing_data  = "breaching"

  dimensions = {
    HealthCheckId = aws_route53_health_check.api.id
  }

  tags = var.tags
}
