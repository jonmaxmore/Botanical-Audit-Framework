# ============================================================================
# Monitoring Module - Outputs
# ============================================================================

output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.application.name
}

output "log_group_arn" {
  description = "ARN of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.application.arn
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  value       = aws_sns_topic.alarms.arn
}

output "sns_topic_name" {
  description = "Name of the SNS topic"
  value       = aws_sns_topic.alarms.name
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "dashboard_url" {
  description = "URL to view the CloudWatch dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "alarm_names" {
  description = "Names of all CloudWatch alarms"
  value = concat(
    [
      aws_cloudwatch_metric_alarm.alb_5xx_errors.alarm_name,
      aws_cloudwatch_metric_alarm.unhealthy_hosts.alarm_name,
      aws_cloudwatch_metric_alarm.alb_response_time.alarm_name,
      aws_cloudwatch_metric_alarm.application_errors.alarm_name
    ],
    var.autoscaling_group_name != null ? [aws_cloudwatch_metric_alarm.asg_high_cpu[0].alarm_name] : []
  )
}

output "alarm_arns" {
  description = "ARNs of all CloudWatch alarms"
  value = concat(
    [
      aws_cloudwatch_metric_alarm.alb_5xx_errors.arn,
      aws_cloudwatch_metric_alarm.unhealthy_hosts.arn,
      aws_cloudwatch_metric_alarm.alb_response_time.arn,
      aws_cloudwatch_metric_alarm.application_errors.arn
    ],
    var.autoscaling_group_name != null ? [aws_cloudwatch_metric_alarm.asg_high_cpu[0].arn] : []
  )
}
