#!/bin/bash

# MongoDB Backup Script for GACP Platform
# This script creates a full backup of MongoDB Atlas cluster
# Usage: ./mongodb-backup.sh [backup-name]

set -e  # Exit on error
set -u  # Exit on undefined variable

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/mongodb}"
MONGODB_URI="${MONGODB_URI:-}"
BACKUP_NAME="${1:-mongodb-backup-$(date +%Y%m%d-%H%M%S)}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# AWS S3 Configuration (optional)
AWS_S3_BUCKET="${AWS_S3_BUCKET:-}"
AWS_REGION="${AWS_REGION:-ap-southeast-1}"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

check_requirements() {
    log "Checking requirements..."
    
    # Check mongodump
    if ! command -v mongodump &> /dev/null; then
        error "mongodump is not installed. Install MongoDB Database Tools: https://www.mongodb.com/docs/database-tools/"
    fi
    
    # Check MongoDB URI
    if [ -z "$MONGODB_URI" ]; then
        error "MONGODB_URI environment variable is not set"
    fi
    
    log "✓ All requirements met"
}

create_backup() {
    log "Starting MongoDB backup..."
    log "Backup name: ${BACKUP_NAME}"
    
    # Create backup directory
    mkdir -p "${BACKUP_PATH}"
    
    # Run mongodump
    log "Running mongodump..."
    mongodump \
        --uri="${MONGODB_URI}" \
        --gzip \
        --out="${BACKUP_PATH}" \
        --verbose
    
    if [ $? -eq 0 ]; then
        log "✓ Backup completed successfully"
    else
        error "Backup failed"
    fi
    
    # Calculate backup size
    BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)
    log "Backup size: ${BACKUP_SIZE}"
    
    # Create backup metadata
    cat > "${BACKUP_PATH}/backup-info.json" <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "backup_date": "$(date -Iseconds)",
  "mongodb_uri": "${MONGODB_URI%%@*}",
  "backup_size": "${BACKUP_SIZE}",
  "retention_days": ${RETENTION_DAYS}
}
EOF
    
    log "✓ Backup metadata created"
}

compress_backup() {
    log "Compressing backup..."
    
    COMPRESSED_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    tar -czf "${COMPRESSED_FILE}" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
    
    if [ $? -eq 0 ]; then
        COMPRESSED_SIZE=$(du -sh "${COMPRESSED_FILE}" | cut -f1)
        log "✓ Backup compressed: ${COMPRESSED_SIZE}"
        
        # Remove uncompressed backup
        rm -rf "${BACKUP_PATH}"
        log "✓ Uncompressed backup removed"
    else
        error "Compression failed"
    fi
}

upload_to_s3() {
    if [ -z "$AWS_S3_BUCKET" ]; then
        warn "AWS_S3_BUCKET not set, skipping S3 upload"
        return 0
    fi
    
    # Check if AWS CLI is available
    if ! command -v aws &> /dev/null; then
        warn "AWS CLI not found, skipping S3 upload"
        return 0
    fi
    
    log "Uploading to S3..."
    
    COMPRESSED_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    S3_PATH="s3://${AWS_S3_BUCKET}/backups/mongodb/${BACKUP_NAME}.tar.gz"
    
    aws s3 cp "${COMPRESSED_FILE}" "${S3_PATH}" \
        --region "${AWS_REGION}" \
        --storage-class STANDARD_IA
    
    if [ $? -eq 0 ]; then
        log "✓ Backup uploaded to S3: ${S3_PATH}"
        
        # Set lifecycle for automatic deletion after retention period
        aws s3api put-object-tagging \
            --bucket "${AWS_S3_BUCKET}" \
            --key "backups/mongodb/${BACKUP_NAME}.tar.gz" \
            --tagging "TagSet=[{Key=Retention,Value=${RETENTION_DAYS}days}]" \
            --region "${AWS_REGION}"
        
        log "✓ Retention policy applied: ${RETENTION_DAYS} days"
    else
        error "S3 upload failed"
    fi
}

cleanup_old_backups() {
    log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
    
    # Local cleanup
    find "${BACKUP_DIR}" -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    local DELETED_COUNT=$(find "${BACKUP_DIR}" -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS} | wc -l)
    
    if [ $DELETED_COUNT -gt 0 ]; then
        log "✓ Deleted ${DELETED_COUNT} old local backup(s)"
    else
        log "✓ No old backups to delete"
    fi
}

verify_backup() {
    log "Verifying backup integrity..."
    
    COMPRESSED_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    # Test tar file integrity
    tar -tzf "${COMPRESSED_FILE}" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        log "✓ Backup file integrity verified"
    else
        error "Backup file is corrupted"
    fi
}

send_notification() {
    local STATUS=$1
    local MESSAGE=$2
    
    # Line Notify (if configured)
    if [ ! -z "${LINE_NOTIFY_TOKEN:-}" ]; then
        curl -X POST https://notify-api.line.me/api/notify \
            -H "Authorization: Bearer ${LINE_NOTIFY_TOKEN}" \
            -F "message=[GACP Backup] ${STATUS}: ${MESSAGE}" \
            > /dev/null 2>&1
    fi
    
    # Email notification (if configured)
    # Add your email notification logic here
}

# Main execution
main() {
    log "=== MongoDB Backup Started ==="
    
    check_requirements
    create_backup
    compress_backup
    verify_backup
    
    # Optional: Upload to S3
    upload_to_s3
    
    # Cleanup old backups
    cleanup_old_backups
    
    log "=== Backup Completed Successfully ==="
    log "Backup location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    # Send success notification
    send_notification "SUCCESS" "Backup ${BACKUP_NAME} completed"
}

# Trap errors
trap 'error "Backup failed at line $LINENO"' ERR

# Run main function
main

exit 0
