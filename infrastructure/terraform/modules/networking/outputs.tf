# ============================================================================
# Networking Module - Outputs
# ============================================================================

output "route53_zone_id" {
  description = "ID of the Route53 hosted zone"
  value       = local.zone_id
}

output "route53_name_servers" {
  description = "Name servers for the Route53 zone"
  value       = var.create_route53_zone ? aws_route53_zone.main[0].name_servers : data.aws_route53_zone.existing[0].name_servers
}

output "acm_certificate_arn" {
  description = "ARN of the ACM certificate for API"
  value       = aws_acm_certificate.api.arn
}

output "acm_certificate_domain" {
  description = "Domain name of the ACM certificate"
  value       = aws_acm_certificate.api.domain_name
}

output "acm_certificate_status" {
  description = "Status of the ACM certificate"
  value       = aws_acm_certificate.api.status
}

output "api_fqdn" {
  description = "Fully qualified domain name for API"
  value       = local.api_fqdn
}

output "api_url" {
  description = "Full HTTPS URL for API"
  value       = "https://${local.api_fqdn}"
}

output "cdn_fqdn" {
  description = "Fully qualified domain name for CDN"
  value       = local.cdn_fqdn
}

output "cdn_url" {
  description = "Full HTTPS URL for CDN"
  value       = "https://${local.cdn_fqdn}"
}

output "www_fqdn" {
  description = "Fully qualified domain name for www"
  value       = "www.${var.domain_name}"
}

output "health_check_id" {
  description = "ID of the Route53 health check"
  value       = aws_route53_health_check.api.id
}

output "dns_records" {
  description = "Summary of DNS records created"
  value = {
    api = {
      name   = aws_route53_record.api.name
      type   = aws_route53_record.api.type
      target = var.alb_dns_name
    }
    cdn = {
      name   = aws_route53_record.cdn.name
      type   = aws_route53_record.cdn.type
      target = var.cloudfront_domain_name
    }
    www = {
      name   = aws_route53_record.www.name
      type   = aws_route53_record.www.type
      target = local.api_fqdn
    }
  }
}
