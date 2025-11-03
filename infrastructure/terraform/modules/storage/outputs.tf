# ============================================================================
# Storage Module - Outputs
# ============================================================================

# S3 Bucket - Certificates
output "certificates_bucket_id" {
  description = "ID of the certificates S3 bucket"
  value       = aws_s3_bucket.certificates.id
}

output "certificates_bucket_arn" {
  description = "ARN of the certificates S3 bucket"
  value       = aws_s3_bucket.certificates.arn
}

output "certificates_bucket_name" {
  description = "Name of the certificates S3 bucket"
  value       = aws_s3_bucket.certificates.bucket
}

output "certificates_bucket_regional_domain_name" {
  description = "Regional domain name of the certificates bucket"
  value       = aws_s3_bucket.certificates.bucket_regional_domain_name
}

# S3 Bucket - Photos
output "photos_bucket_id" {
  description = "ID of the photos S3 bucket"
  value       = aws_s3_bucket.photos.id
}

output "photos_bucket_arn" {
  description = "ARN of the photos S3 bucket"
  value       = aws_s3_bucket.photos.arn
}

output "photos_bucket_name" {
  description = "Name of the photos S3 bucket"
  value       = aws_s3_bucket.photos.bucket
}

output "photos_bucket_regional_domain_name" {
  description = "Regional domain name of the photos bucket"
  value       = aws_s3_bucket.photos.bucket_regional_domain_name
}

# S3 Bucket - Backups
output "backups_bucket_id" {
  description = "ID of the backups S3 bucket"
  value       = aws_s3_bucket.backups.id
}

output "backups_bucket_arn" {
  description = "ARN of the backups S3 bucket"
  value       = aws_s3_bucket.backups.arn
}

output "backups_bucket_name" {
  description = "Name of the backups S3 bucket"
  value       = aws_s3_bucket.backups.bucket
}

output "backups_bucket_regional_domain_name" {
  description = "Regional domain name of the backups bucket"
  value       = aws_s3_bucket.backups.bucket_regional_domain_name
}

# CloudFront Distribution
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.photos.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.photos.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.photos.domain_name
}

output "cloudfront_zone_id" {
  description = "Zone ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.photos.hosted_zone_id
}

output "cloudfront_oai_iam_arn" {
  description = "IAM ARN of the CloudFront Origin Access Identity"
  value       = aws_cloudfront_origin_access_identity.photos.iam_arn
}

# Summary
output "bucket_urls" {
  description = "URLs for all S3 buckets"
  value = {
    certificates = "https://${aws_s3_bucket.certificates.bucket_regional_domain_name}"
    photos       = "https://${aws_cloudfront_distribution.photos.domain_name}"
    backups      = "https://${aws_s3_bucket.backups.bucket_regional_domain_name}"
  }
}
