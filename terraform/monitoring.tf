# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name              = "${var.project_name}-${var.environment}-alerts"
  display_name      = "GACP ${var.environment} Alerts"
  kms_master_key_id = "alias/aws/sns"
  
  tags = {
    Name = "${var.project_name}-${var.environment}-alerts"
  }
}

# SNS Topic Subscription (Email)
resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "admin@gacp-certify.com"  # Change to your email
}

# SNS Topic Policy
resource "aws_sns_topic_policy" "alerts" {
  arn = aws_sns_topic.alerts.arn
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "cloudwatch.amazonaws.com",
            "events.amazonaws.com",
            "rds.amazonaws.com",
            "elasticache.amazonaws.com"
          ]
        }
        Action = "SNS:Publish"
        Resource = aws_sns_topic.alerts.arn
      }
    ]
  })
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average" }],
            [".", "MemoryUtilization", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ECS Cluster Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", { stat = "Average", "DBInstanceIdentifier" = aws_db_instance.main.id }],
            [".", "DatabaseConnections", { stat = "Average", "DBInstanceIdentifier" = aws_db_instance.main.id }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", { stat = "Average" }],
            [".", "DatabaseMemoryUsagePercentage", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ElastiCache Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", { stat = "Average", "LoadBalancer" = aws_lb.main.arn_suffix }],
            [".", "RequestCount", { stat = "Sum", "LoadBalancer" = aws_lb.main.arn_suffix }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ALB Metrics"
        }
      }
    ]
  })
}

# EventBridge Rule for ECS Task State Changes
resource "aws_cloudwatch_event_rule" "ecs_task_state_change" {
  name        = "${var.project_name}-${var.environment}-ecs-task-state-change"
  description = "Capture ECS task state changes"
  
  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail-type = ["ECS Task State Change"]
    detail = {
      clusterArn = [aws_ecs_cluster.main.arn]
      lastStatus = ["STOPPED"]
    }
  })
}

resource "aws_cloudwatch_event_target" "ecs_task_state_change" {
  rule      = aws_cloudwatch_event_rule.ecs_task_state_change.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.alerts.arn
}

# EventBridge Rule for RDS Events
resource "aws_db_event_subscription" "rds" {
  name      = "${var.project_name}-${var.environment}-rds-events"
  sns_topic = aws_sns_topic.alerts.arn
  
  source_type = "db-instance"
  source_ids  = [aws_db_instance.main.id]
  
  event_categories = [
    "availability",
    "failure",
    "failover",
    "maintenance",
    "notification"
  ]
}

# EventBridge Rule for ElastiCache Events
resource "aws_elasticache_event_subscription" "redis" {
  name      = "${var.project_name}-${var.environment}-redis-events"
  sns_topic = aws_sns_topic.alerts.arn
  
  source_type = "replication-group"
  source_ids  = [aws_elasticache_replication_group.main.id]
}
