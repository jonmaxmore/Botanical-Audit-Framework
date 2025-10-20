# GACP Database Management Script (PowerShell)
# Database Clone and Management for GACP Certification System

param(
    [string]$Action = "help",
    [string]$Parameter1,
    [string]$Parameter2
)

$DB_NAME = "gacp_production"
$BACKUP_DIR = ".\database-backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "GACP Database Management Toolkit" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

function Show-Help {
    Write-Host ""
    Write-Host "Available Commands:" -ForegroundColor Cyan
    Write-Host "backup     - Create database backup"
    Write-Host "restore    - Restore from backup file"
    Write-Host "init       - Initialize with sample data"
    Write-Host "status     - Show database status"
    Write-Host "export     - Export to JSON"
    Write-Host "reset      - Reset database"
    Write-Host "help       - Show this help"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\database-manager.ps1 status"
    Write-Host "  .\database-manager.ps1 backup"
    Write-Host "  .\database-manager.ps1 init"
    Write-Host ""
}

function Test-DatabaseConnection {
    Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
    
    $testScript = @'
const { MongoClient } = require('mongodb');
(async () => {
    try {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        await client.db('admin').admin().ping();
        await client.close();
        console.log('SUCCESS');
    } catch (error) {
        console.log('FAILED: ' + error.message);
        process.exit(1);
    }
})();
'@
    
    $testScript | Out-File -FilePath "temp_test.js" -Encoding UTF8
    $result = node temp_test.js
    Remove-Item "temp_test.js" -ErrorAction SilentlyContinue
    
    if ($result -eq "SUCCESS") {
        Write-Host "MongoDB connection: OK" -ForegroundColor Green
        return $true
    } else {
        Write-Host "MongoDB connection: FAILED" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        return $false
    }
}

function Show-DatabaseStatus {
    Write-Host "Database Status" -ForegroundColor Cyan
    Write-Host "===============" -ForegroundColor Cyan
    Write-Host "Database: $DB_NAME"
    Write-Host "Timestamp: $(Get-Date)"
    Write-Host ""
    
    if (Test-DatabaseConnection) {
        $statusScript = @'
const { MongoClient } = require('mongodb');
(async () => {
    try {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        const db = client.db('gacp_production');
        
        const collections = await db.listCollections().toArray();
        console.log('Collections in database:');
        
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`  ${col.name}: ${count} documents`);
        }
        
        await client.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
'@
        
        $statusScript | Out-File -FilePath "temp_status.js" -Encoding UTF8
        node temp_status.js
        Remove-Item "temp_status.js" -ErrorAction SilentlyContinue
    }
}

function Initialize-Database {
    Write-Host "Initializing database with sample data..." -ForegroundColor Yellow
    
    if (Test-Path "scripts\database-setup.js") {
        node scripts\database-setup.js
    } else {
        Write-Host "Database setup script not found!" -ForegroundColor Red
    }
}

function Backup-Database {
    Write-Host "Creating database backup..." -ForegroundColor Yellow
    
    if (!(Test-Path $BACKUP_DIR)) {
        New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
        Write-Host "Created backup directory: $BACKUP_DIR" -ForegroundColor Cyan
    }
    
    $backupScript = @"
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        const db = client.db('$DB_NAME');
        
        const collections = await db.listCollections().toArray();
        const backup = {};
        
        for (const col of collections) {
            const data = await db.collection(col.name).find({}).toArray();
            backup[col.name] = data;
            console.log('Backed up ' + data.length + ' documents from ' + col.name);
        }
        
        const backupPath = path.join('$BACKUP_DIR', 'backup_$TIMESTAMP.json');
        fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
        console.log('Database backup created: ' + backupPath);
        
        await client.close();
    } catch (error) {
        console.error('Backup failed:', error.message);
        process.exit(1);
    }
})();
"@
    
    $backupScript | Out-File -FilePath "temp_backup.js" -Encoding UTF8
    node temp_backup.js
    Remove-Item "temp_backup.js" -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database backup completed successfully" -ForegroundColor Green
    } else {
        Write-Host "Database backup failed" -ForegroundColor Red
    }
}

function Export-Database {
    Write-Host "Exporting database to JSON..." -ForegroundColor Yellow
    
    $exportScript = @"
const GACPDatabaseSetup = require('./scripts/database-setup.js');
(async () => {
    try {
        const db = new GACPDatabaseSetup();
        await db.connect();
        await db.exportData();
        await db.disconnect();
        console.log('Database exported successfully');
    } catch (error) {
        console.error('Export failed:', error.message);
    }
})();
"@
    
    $exportScript | Out-File -FilePath "temp_export.js" -Encoding UTF8
    node temp_export.js
    Remove-Item "temp_export.js" -ErrorAction SilentlyContinue
}

function Reset-Database {
    Write-Host "WARNING: This will completely reset the database!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? Type 'yes' to confirm"
    
    if ($confirm -eq "yes") {
        Write-Host "Resetting database..." -ForegroundColor Yellow
        
        $resetScript = @"
const { MongoClient } = require('mongodb');
(async () => {
    try {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        await client.db('$DB_NAME').dropDatabase();
        console.log('Database reset successfully');
        await client.close();
    } catch (error) {
        console.error('Reset failed:', error.message);
        process.exit(1);
    }
})();
"@
        
        $resetScript | Out-File -FilePath "temp_reset.js" -Encoding UTF8
        node temp_reset.js
        Remove-Item "temp_reset.js" -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Initializing with fresh sample data..." -ForegroundColor Yellow
            Initialize-Database
        }
    } else {
        Write-Host "Database reset cancelled" -ForegroundColor Yellow
    }
}

# Main command handler
switch ($Action.ToLower()) {
    "status" { Show-DatabaseStatus }
    "backup" { Backup-Database }
    "init" { Initialize-Database }
    "export" { Export-Database }
    "reset" { Reset-Database }
    "help" { Show-Help }
    default { Show-Help }
}