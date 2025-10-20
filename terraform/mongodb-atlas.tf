# MongoDB Atlas Configuration for GACP Platform
# This file creates a MongoDB Atlas cluster for production deployment

terraform {
  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.14.0"
    }
  }
}

# MongoDB Atlas Provider
provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

# MongoDB Atlas Project
resource "mongodbatlas_project" "gacp" {
  name   = "${var.project_name}-${var.environment}"
  org_id = var.mongodb_atlas_org_id
  
  # Enable advanced security features
  is_collect_database_specifics_statistics_enabled = true
  is_data_explorer_enabled                         = true
  is_extended_storage_sizes_enabled               = true
  is_performance_advisor_enabled                  = true
  is_realtime_performance_panel_enabled           = true
  is_schema_advisor_enabled                       = true
}

# IP Access List (Whitelist)
resource "mongodbatlas_project_ip_access_list" "vpc" {
  project_id = mongodbatlas_project.gacp.id
  cidr_block = var.vpc_cidr
  comment    = "VPC CIDR block for ${var.environment}"
}

# IP Access List for Application Load Balancer
resource "mongodbatlas_project_ip_access_list" "alb" {
  count = length(var.alb_ip_addresses)
  
  project_id = mongodbatlas_project.gacp.id
  ip_address = var.alb_ip_addresses[count.index]
  comment    = "ALB IP ${count.index + 1}"
}

# Database User
resource "mongodbatlas_database_user" "app" {
  username           = var.mongodb_username
  password           = var.mongodb_password
  project_id         = mongodbatlas_project.gacp.id
  auth_database_name = "admin"
  
  roles {
    role_name     = "readWrite"
    database_name = var.mongodb_database_name
  }
  
  roles {
    role_name     = "dbAdmin"
    database_name = var.mongodb_database_name
  }
  
  scopes {
    name = mongodbatlas_cluster.gacp.name
    type = "CLUSTER"
  }
  
  labels {
    key   = "Environment"
    value = var.environment
  }
}

# MongoDB Atlas Cluster
resource "mongodbatlas_cluster" "gacp" {
  project_id = mongodbatlas_project.gacp.id
  name       = "${var.project_name}-${var.environment}"
  
  # Cluster Configuration
  cluster_type = "REPLICASET"
  
  # Cloud Provider Settings (AWS - Bangkok Region)
  provider_name               = "AWS"
  provider_region_name        = "AP_SOUTHEAST_1" # Bangkok
  provider_instance_size_name = var.mongodb_instance_size # M10, M20, M30, etc.
  
  # MongoDB Version
  mongo_db_major_version = "6.0"
  
  # Replication
  replication_specs {
    num_shards = 1
    
    regions_config {
      region_name     = "AP_SOUTHEAST_1"
      electable_nodes = 3  # 3-node replica set for high availability
      priority        = 7
      read_only_nodes = 0
    }
  }
  
  # Auto-Scaling Configuration
  auto_scaling_disk_gb_enabled            = true
  auto_scaling_compute_enabled            = var.mongodb_auto_scale_compute
  auto_scaling_compute_scale_down_enabled = var.mongodb_auto_scale_compute
  
  # Backup Configuration
  backup_enabled                     = true
  pit_enabled                       = true # Point-in-time recovery
  cloud_backup                      = true
  retain_backups_enabled            = true
  
  # Advanced Configuration
  advanced_configuration {
    javascript_enabled                   = true
    minimum_enabled_tls_protocol        = "TLS1_2"
    no_table_scan                       = false
    oplog_size_mb                       = 2048
    sample_size_bi_connector            = 5000
    sample_refresh_interval_bi_connector = 300
  }
  
  # Disk Configuration
  disk_size_gb = var.mongodb_disk_size_gb # Starting disk size
  
  # Encryption at Rest
  encryption_at_rest_provider = "AWS"
  
  # BI Connector (disable for production, enable if needed)
  bi_connector_config {
    enabled         = false
    read_preference = "secondary"
  }
  
  # Labels
  labels {
    key   = "Environment"
    value = var.environment
  }
  
  labels {
    key   = "Project"
    value = var.project_name
  }
  
  labels {
    key   = "ManagedBy"
    value = "Terraform"
  }
  
  # Lifecycle
  lifecycle {
    prevent_destroy = true # Prevent accidental deletion
  }
}

# Database Auditing Configuration
resource "mongodbatlas_auditing" "gacp" {
  project_id                  = mongodbatlas_project.gacp.id
  audit_filter                = jsonencode({
    atype = "authenticate"
    "param.db" = var.mongodb_database_name
  })
  audit_authorization_success = true
  enabled                     = true
}

# Cloud Backup Snapshot Policy
resource "mongodbatlas_cloud_backup_schedule" "gacp" {
  project_id   = mongodbatlas_project.gacp.id
  cluster_name = mongodbatlas_cluster.gacp.name
  
  # Snapshot Retention
  reference_hour_of_day    = 3  # 3 AM UTC
  reference_minute_of_hour = 0
  restore_window_days      = 7
  
  # Daily Snapshots
  policy_item_daily {
    frequency_interval = 1        # Every 1 day
    retention_unit     = "days"
    retention_value    = 7        # Keep for 7 days
  }
  
  # Weekly Snapshots
  policy_item_weekly {
    frequency_interval = 6        # Saturday
    retention_unit     = "weeks"
    retention_value    = 4        # Keep for 4 weeks
  }
  
  # Monthly Snapshots
  policy_item_monthly {
    frequency_interval = 1        # 1st of month
    retention_unit     = "months"
    retention_value    = 12       # Keep for 12 months
  }
}

# Network Peering (Optional - for better security)
resource "mongodbatlas_network_peering" "vpc" {
  count = var.enable_vpc_peering ? 1 : 0
  
  project_id            = mongodbatlas_project.gacp.id
  container_id          = mongodbatlas_cluster.gacp.container_id
  accepter_region_name  = var.aws_region
  provider_name         = "AWS"
  route_table_cidr_block = var.vpc_cidr
  vpc_id                = aws_vpc.main.id
  aws_account_id        = data.aws_caller_identity.current.account_id
}

# Alert Configurations
resource "mongodbatlas_alert_configuration" "cpu_usage" {
  project_id = mongodbatlas_project.gacp.id
  enabled    = true
  
  event_type = "OUTSIDE_METRIC_THRESHOLD"
  
  threshold_config {
    operator    = "GREATER_THAN"
    threshold   = 85.0
    units       = "RAW"
  }
  
  metric_threshold_config {
    metric_name = "PROCESS_CPU_USER"
    operator    = "GREATER_THAN"
    threshold   = 85.0
    units       = "RAW"
    mode        = "AVERAGE"
  }
  
  notification {
    type_name     = "EMAIL"
    email_enabled = true
    email_address = var.alert_email
    delay_min     = 5
  }
}

resource "mongodbatlas_alert_configuration" "disk_usage" {
  project_id = mongodbatlas_project.gacp.id
  enabled    = true
  
  event_type = "OUTSIDE_METRIC_THRESHOLD"
  
  threshold_config {
    operator    = "GREATER_THAN"
    threshold   = 80.0
    units       = "RAW"
  }
  
  metric_threshold_config {
    metric_name = "DISK_PARTITION_SPACE_USED_DATA"
    operator    = "GREATER_THAN"
    threshold   = 80.0
    units       = "RAW"
    mode        = "AVERAGE"
  }
  
  notification {
    type_name     = "EMAIL"
    email_enabled = true
    email_address = var.alert_email
    delay_min     = 5
  }
}

resource "mongodbatlas_alert_configuration" "replication_lag" {
  project_id = mongodbatlas_project.gacp.id
  enabled    = true
  
  event_type = "REPLICATION_OPLOG_WINDOW_RUNNING_OUT"
  
  threshold_config {
    operator    = "LESS_THAN"
    threshold   = 1.0
    units       = "HOURS"
  }
  
  notification {
    type_name     = "EMAIL"
    email_enabled = true
    email_address = var.alert_email
    delay_min     = 0
  }
}

# Data for AWS Account ID
data "aws_caller_identity" "current" {}

# Outputs
output "mongodb_atlas_cluster_id" {
  description = "MongoDB Atlas Cluster ID"
  value       = mongodbatlas_cluster.gacp.cluster_id
}

output "mongodb_atlas_connection_string" {
  description = "MongoDB Atlas Connection String"
  value       = mongodbatlas_cluster.gacp.connection_strings[0].standard_srv
  sensitive   = true
}

output "mongodb_atlas_connection_string_private" {
  description = "MongoDB Atlas Private Connection String (VPC Peering)"
  value       = try(mongodbatlas_cluster.gacp.connection_strings[0].private_srv, "")
  sensitive   = true
}

output "mongodb_atlas_state" {
  description = "Current state of the cluster"
  value       = mongodbatlas_cluster.gacp.state_name
}

output "mongodb_atlas_srv_address" {
  description = "SRV address for MongoDB connection"
  value       = mongodbatlas_cluster.gacp.srv_address
}

output "mongodb_atlas_mongo_uri" {
  description = "Full MongoDB connection URI with credentials"
  value       = "mongodb+srv://${var.mongodb_username}:${var.mongodb_password}@${mongodbatlas_cluster.gacp.srv_address}/${var.mongodb_database_name}?retryWrites=true&w=majority"
  sensitive   = true
}
