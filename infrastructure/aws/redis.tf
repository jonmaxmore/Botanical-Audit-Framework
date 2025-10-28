# ElastiCache Redis

resource "aws_elasticache_subnet_group" "main" {
  name       = "gacp-redis-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "gacp-redis"
  description                = "Redis for GACP Platform"
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = var.redis_node_type
  num_cache_clusters         = var.redis_num_nodes
  port                       = 6379
  parameter_group_name       = "default.redis7"
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.redis.id]
  automatic_failover_enabled = var.redis_num_nodes > 1
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  snapshot_retention_limit = 5
  snapshot_window          = "03:00-05:00"
  maintenance_window       = "sun:05:00-sun:07:00"
}
