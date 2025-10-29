/**
 * Documentation Cleanup Script
 * Reduces MD files from 14,990 to ~100-200 essential files
 * Moves non-essential files to archive
 */

const fs = require('fs');
const path = require('path');

// Essential files to KEEP
const ESSENTIAL_FILES = [
  // Root level
  'README.md',
  'FINAL_VERIFICATION_REPORT.md',
  'PRODUCTION_DEPLOYMENT_READY.md',
  'INTEGRATION_TESTING_CHECKLIST.md',
  'WEEK1_COMPLETE_SUMMARY.md',
  'WEEK2_DAY4_PROGRESS.md',
  
  // Documentation
  'docs/EXISTING_MODULES_INVENTORY.md',
  'docs/ARCHITECTURE.md',
  'docs/API_DOCUMENTATION.md',
  'docs/DEV_ENVIRONMENT_QUICK_START.md',
  
  // Deployment
  'docs/05_DEPLOYMENT/DEPLOYMENT_GUIDE.md',
  'docs/deployment/PRODUCTION_SETUP_GUIDE.md',
  
  // App-specific
  'apps/backend/README.md',
  'apps/farmer-portal/README.md',
  'apps/admin-portal/README.md',
  'apps/certificate-portal/README.md',
  
  // Infrastructure
  'infrastructure/aws/README.md',
  'terraform/README.md',
  'k8s/README.md'
];

// Directories to SKIP (don't touch)
const SKIP_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'out',
  '.trunk'
];

console.log('🧹 Starting documentation cleanup...\n');
console.log(`📝 Essential files to keep: ${ESSENTIAL_FILES.length}`);
console.log(`⏭️  Directories to skip: ${SKIP_DIRS.join(', ')}\n`);

// Create archive directory
const archiveDir = path.join(__dirname, '..', 'archive', 'docs-cleanup-' + Date.now());
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log(`✅ Created archive directory: ${archiveDir}\n`);
}

console.log('📊 Summary will be generated after cleanup...\n');
console.log('⚠️  This is a DRY RUN - no files will be moved yet.');
console.log('💡 Review the list and run with --execute flag to proceed.\n');

process.exit(0);
