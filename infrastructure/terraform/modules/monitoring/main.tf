# ============================================================================
# Monitoring Module - Main Configuration
# CloudWatch Logs, Dashboards, Alarms, and SNS Notifications
# ============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ============================================================================
# CloudWatch Log Group for EC2 Application Logs
# ============================================================================

resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/ec2/${local.name_prefix}"
  retention_in_days = var.log_retention_days

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-app-logs"
    }
  )
}

# ============================================================================
# SNS Topic for Alarms
# ============================================================================

resource "aws_sns_topic" "alarms" {
  name         = "${local.name_prefix}-alarms"
  display_name = "${var.project_name} ${var.environment} Alarms"

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-alarms-topic"
    }
  )
}

resource "aws_sns_topic_subscription" "alarm_email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# ============================================================================
# CloudWatch Alarm - ALB 5xx Errors
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "${local.name_prefix}-alb-high-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = var.alarm_5xx_threshold
  alarm_description   = "ALB is returning too many 5xx errors"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = var.tags
}

# ============================================================================
# CloudWatch Alarm - Target Group Unhealthy Hosts
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "${local.name_prefix}-unhealthy-hosts"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = 1
  alarm_description   = "Less than 1 healthy target in target group"
  treat_missing_data  = "breaching"

  dimensions = {
    TargetGroup  = var.target_group_arn_suffix
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = var.tags
}

# ============================================================================
# CloudWatch Alarm - ALB Response Time
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "alb_response_time" {
  alarm_name          = "${local.name_prefix}-alb-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = 1 # 1 second
  alarm_description   = "ALB target response time is too high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = var.tags
}

# ============================================================================
# CloudWatch Alarm - ASG High CPU (Optional)
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "asg_high_cpu" {
  count = var.autoscaling_group_name != null ? 1 : 0

  alarm_name          = "${local.name_prefix}-asg-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = var.alarm_cpu_threshold
  alarm_description   = "ASG CPU utilization is too high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    AutoScalingGroupName = var.autoscaling_group_name
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = var.tags
}

# ============================================================================
# CloudWatch Dashboard
# ============================================================================

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.name_prefix}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", { stat = "Sum", label = "Total Requests" }],
            [".", "HTTPCode_Target_2XX_Count", { stat = "Sum", label = "2xx Responses" }],
            [".", "HTTPCode_Target_4XX_Count", { stat = "Sum", label = "4xx Errors" }],
            [".", "HTTPCode_Target_5XX_Count", { stat = "Sum", label = "5xx Errors" }]
          ]
          period = 300
          region = data.aws_region.current.name
          title  = "ALB Requests and Responses"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", { stat = "Average", label = "Avg Response Time" }],
            ["...", { stat = "Maximum", label = "Max Response Time" }]
          ]
          period = 300
          region = data.aws_region.current.name
          title  = "ALB Response Time (seconds)"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HealthyHostCount", { stat = "Average", label = "Healthy Hosts" }],
            [".", "UnHealthyHostCount", { stat = "Average", label = "Unhealthy Hosts" }]
          ]
          period = 300
          region = data.aws_region.current.name
          title  = "Target Health Status"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "ActiveConnectionCount", { stat = "Sum", label = "Active Connections" }],
            [".", "NewConnectionCount", { stat = "Sum", label = "New Connections" }]
          ]
          period = 300
          region = data.aws_region.current.name
          title  = "ALB Connections"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
      }
    ]
  })
}

# ============================================================================
# Metric Filter - Application Errors
# ============================================================================

resource "aws_cloudwatch_log_metric_filter" "application_errors" {
  name           = "${local.name_prefix}-application-errors"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[time, request_id, level = ERROR*, ...]"

  metric_transformation {
    name      = "ApplicationErrors"
    namespace = "BotanicalAudit/Application"
    value     = "1"
  }
}

# ============================================================================
# CloudWatch Alarm - Application Error Rate
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "application_errors" {
  alarm_name          = "${local.name_prefix}-application-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ApplicationErrors"
  namespace           = "BotanicalAudit/Application"
  period              = 300
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "Application is logging too many errors"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = var.tags
}

# ============================================================================
# Data Source - Current AWS Region
# ============================================================================

data "aws_region" "current" {}
