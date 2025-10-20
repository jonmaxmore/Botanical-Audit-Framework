#!/bin/bash
# Database Clone and Management Scripts for GACP System
# สคริปต์จัดการฐานข้อมูล GACP

echo "🌾 GACP Database Management Toolkit"
echo "=================================="

# Set database configuration
DB_NAME="gacp_production"
BACKUP_DIR="./database-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        echo "📁 Created backup directory: $BACKUP_DIR"
    fi
}

# Function to backup database
backup_database() {
    echo "💾 Creating database backup..."
    create_backup_dir
    
    # Create MongoDB dump
    mongodump --db "$DB_NAME" --out "$BACKUP_DIR/backup_$TIMESTAMP"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database backup created: $BACKUP_DIR/backup_$TIMESTAMP"
        
        # Create compressed archive
        tar -czf "$BACKUP_DIR/gacp_backup_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"
        echo "📦 Compressed backup: $BACKUP_DIR/gacp_backup_$TIMESTAMP.tar.gz"
        
        # Clean up uncompressed files
        rm -rf "$BACKUP_DIR/backup_$TIMESTAMP"
    else
        echo "❌ Database backup failed"
        exit 1
    fi
}

# Function to restore database
restore_database() {
    local backup_path=$1
    
    if [ -z "$backup_path" ]; then
        echo "❌ Please provide backup path"
        echo "Usage: restore_database <backup_path>"
        return 1
    fi
    
    if [ ! -f "$backup_path" ]; then
        echo "❌ Backup file not found: $backup_path"
        return 1
    fi
    
    echo "🔄 Restoring database from: $backup_path"
    
    # Extract backup if it's compressed
    if [[ "$backup_path" == *.tar.gz ]]; then
        temp_dir="/tmp/gacp_restore_$TIMESTAMP"
        mkdir -p "$temp_dir"
        tar -xzf "$backup_path" -C "$temp_dir"
        restore_dir="$temp_dir/backup_*"
    else
        restore_dir="$backup_path"
    fi
    
    # Restore database
    mongorestore --db "$DB_NAME" --drop "$restore_dir/$DB_NAME"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database restored successfully"
    else
        echo "❌ Database restore failed"
        exit 1
    fi
    
    # Clean up temporary files
    if [[ "$backup_path" == *.tar.gz ]]; then
        rm -rf "$temp_dir"
    fi
}

# Function to clone database from remote
clone_remote_database() {
    local source_uri=$1
    local source_db=$2
    
    if [ -z "$source_uri" ] || [ -z "$source_db" ]; then
        echo "❌ Please provide source URI and database name"
        echo "Usage: clone_remote_database <source_uri> <source_db>"
        return 1
    fi
    
    echo "🔄 Cloning database from remote source..."
    echo "Source: $source_uri/$source_db"
    echo "Target: $DB_NAME"
    
    # Create temporary dump
    temp_dump="/tmp/gacp_clone_$TIMESTAMP"
    mkdir -p "$temp_dump"
    
    # Dump from source
    mongodump --uri "$source_uri" --db "$source_db" --out "$temp_dump"
    
    if [ $? -eq 0 ]; then
        echo "✅ Remote database dumped successfully"
        
        # Restore to local database
        mongorestore --db "$DB_NAME" --drop "$temp_dump/$source_db"
        
        if [ $? -eq 0 ]; then
            echo "✅ Database cloned successfully"
        else
            echo "❌ Database restore failed"
            exit 1
        fi
    else
        echo "❌ Remote database dump failed"
        exit 1
    fi
    
    # Clean up
    rm -rf "$temp_dump"
}

# Function to initialize database with sample data
init_sample_data() {
    echo "📦 Initializing database with sample data..."
    node scripts/database-setup.js
}

# Function to export data to JSON
export_to_json() {
    echo "📤 Exporting database to JSON..."
    node -e "
    const GACPDatabaseSetup = require('./scripts/database-setup.js');
    (async () => {
        const db = new GACPDatabaseSetup();
        await db.connect();
        await db.exportData();
        await db.disconnect();
    })();
    "
}

# Function to show database status
show_status() {
    echo "📊 Database Status"
    echo "=================="
    echo "Database: $DB_NAME"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check MongoDB connection
    if mongo --eval "db.adminCommand('ismaster')" >/dev/null 2>&1; then
        echo "✅ MongoDB connection: OK"
        
        # Show collection statistics
        node -e "
        const { MongoClient } = require('mongodb');
        (async () => {
            const client = new MongoClient('mongodb://localhost:27017');
            await client.connect();
            const db = client.db('$DB_NAME');
            
            const collections = await db.listCollections().toArray();
            console.log('📄 Collections:');
            
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(\`   \${col.name}: \${count} documents\`);
            }
            
            await client.close();
        })().catch(console.error);
        "
    else
        echo "❌ MongoDB connection: Failed"
    fi
}

# Function to reset database
reset_database() {
    echo "⚠️  WARNING: This will completely reset the database!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        echo "🗑️  Resetting database..."
        
        # Drop database
        mongo "$DB_NAME" --eval "db.dropDatabase()"
        
        if [ $? -eq 0 ]; then
            echo "✅ Database reset successfully"
            echo "🔄 Initializing with fresh sample data..."
            init_sample_data
        else
            echo "❌ Database reset failed"
        fi
    else
        echo "❌ Database reset cancelled"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "🛠️  Available Commands:"
    echo "====================="
    echo "1. backup     - Create database backup"
    echo "2. restore    - Restore database from backup"
    echo "3. clone      - Clone database from remote source"
    echo "4. init       - Initialize with sample data"
    echo "5. export     - Export database to JSON"
    echo "6. status     - Show database status"
    echo "7. reset      - Reset database (WARNING: Destructive)"
    echo "8. help       - Show this help menu"
    echo ""
}

# Handle command line arguments
case "$1" in
    "backup")
        backup_database
        ;;
    "restore")
        restore_database "$2"
        ;;
    "clone")
        clone_remote_database "$2" "$3"
        ;;
    "init")
        init_sample_data
        ;;
    "export")
        export_to_json
        ;;
    "status")
        show_status
        ;;
    "reset")
        reset_database
        ;;
    "help"|*)
        show_menu
        ;;
esac