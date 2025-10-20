#!/bin/bash

# MongoDB Restore Script for GACP Platform
# This script restores MongoDB from a backup file
# Usage: ./mongodb-restore.sh <backup-file> [database-name]

set -e
set -u

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
MONGODB_URI="${MONGODB_URI:-}"
TEMP_DIR="./temp/restore"

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

confirm() {
    local PROMPT=$1
    echo -e "${YELLOW}${PROMPT} (yes/no)${NC}"
    read -r RESPONSE
    if [ "$RESPONSE" != "yes" ]; then
        log "Operation cancelled by user"
        exit 0
    fi
}

check_requirements() {
    log "Checking requirements..."
    
    # Check mongorestore
    if ! command -v mongorestore &> /dev/null; then
        error "mongorestore is not installed. Install MongoDB Database Tools."
    fi
    
    # Check MongoDB URI
    if [ -z "$MONGODB_URI" ]; then
        error "MONGODB_URI environment variable is not set"
    fi
    
    log "✓ Requirements met"
}

extract_backup() {
    local BACKUP_FILE=$1
    
    log "Extracting backup file..."
    
    # Create temp directory
    mkdir -p "${TEMP_DIR}"
    
    # Extract backup
    tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"
    
    if [ $? -eq 0 ]; then
        log "✓ Backup extracted to ${TEMP_DIR}"
    else
        error "Failed to extract backup"
    fi
}

restore_database() {
    local DATABASE_NAME=${1:-}
    
    log "Starting restore..."
    
    # Find backup directory
    BACKUP_PATH=$(find "${TEMP_DIR}" -maxdepth 1 -type d -name "mongodb-backup-*" | head -n 1)
    
    if [ -z "$BACKUP_PATH" ]; then
        error "No backup directory found in archive"
    fi
    
    log "Backup path: ${BACKUP_PATH}"
    
    # Display backup info
    if [ -f "${BACKUP_PATH}/backup-info.json" ]; then
        log "Backup information:"
        cat "${BACKUP_PATH}/backup-info.json"
    fi
    
    # Confirm restore
    confirm "⚠️  This will restore data to MongoDB. Continue?"
    
    # Run mongorestore
    if [ -z "$DATABASE_NAME" ]; then
        log "Restoring all databases..."
        mongorestore \
            --uri="${MONGODB_URI}" \
            --gzip \
            --dir="${BACKUP_PATH}" \
            --drop \
            --verbose
    else
        log "Restoring database: ${DATABASE_NAME}"
        mongorestore \
            --uri="${MONGODB_URI}" \
            --gzip \
            --nsFrom="${DATABASE_NAME}.*" \
            --nsTo="${DATABASE_NAME}.*" \
            --dir="${BACKUP_PATH}" \
            --drop \
            --verbose
    fi
    
    if [ $? -eq 0 ]; then
        log "✓ Restore completed successfully"
    else
        error "Restore failed"
    fi
}

cleanup() {
    log "Cleaning up temporary files..."
    rm -rf "${TEMP_DIR}"
    log "✓ Cleanup completed"
}

# Main execution
main() {
    local BACKUP_FILE=${1:-}
    local DATABASE_NAME=${2:-}
    
    if [ -z "$BACKUP_FILE" ]; then
        error "Usage: $0 <backup-file.tar.gz> [database-name]"
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found: ${BACKUP_FILE}"
    fi
    
    log "=== MongoDB Restore Started ==="
    log "Backup file: ${BACKUP_FILE}"
    
    check_requirements
    extract_backup "$BACKUP_FILE"
    restore_database "$DATABASE_NAME"
    cleanup
    
    log "=== Restore Completed Successfully ==="
}

# Trap errors and cleanup
trap 'cleanup; error "Restore failed at line $LINENO"' ERR

# Run main
main "$@"

exit 0
