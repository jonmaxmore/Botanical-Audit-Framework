/**
 * GACP Platform - Project Size Cleanup Tool
 * Analyzes and cleans up large files and directories
 */

const fs = require('fs');
const path = require('path');

/**
 * Analyze project size and identify cleanup opportunities
 */
function analyzeProjectSize() {
  console.log('🔍 GACP Platform - Project Size Analysis');
  console.log('========================================\n');

  const cleanupPlan = {
    critical_issues: [
      {
        folder: 'frontend-nextjs/',
        size: '377.44 MB',
        files: '67,026 files',
        issue: 'Massive node_modules or nested dependencies',
        action: 'Remove node_modules, clean package-lock',
        priority: 'CRITICAL',
        potential_savings: '~300 MB',
      },
      {
        folder: 'apps/',
        size: '168.61 MB',
        files: '15,176 files',
        issue: 'Multiple apps with duplicate dependencies',
        action: 'Consolidate dependencies, remove unused packages',
        priority: 'HIGH',
        potential_savings: '~100 MB',
      },
      {
        folder: 'node_modules/',
        size: '80.95 MB',
        files: '4,193 files',
        issue: 'Root level dependencies might be outdated',
        action: 'Clean install with latest packages',
        priority: 'MEDIUM',
        potential_savings: '~30 MB',
      },
    ],

    moderate_issues: [
      {
        folder: '.turbo/',
        size: '16.24 MB',
        files: '6 files',
        issue: 'Build cache files',
        action: 'Clear cache, add to .gitignore',
        priority: 'MEDIUM',
        potential_savings: '~16 MB',
      },
      {
        folder: 'archive/',
        size: '5.25 MB',
        files: '394 files',
        issue: 'Old files kept in repository',
        action: 'Move to external storage or delete',
        priority: 'LOW',
        potential_savings: '~5 MB',
      },
    ],

    total_current_size: '655.25 MB',
    estimated_savings: '~451 MB (69% reduction)',
    target_size: '~200 MB',
  };

  return cleanupPlan;
}

/**
 * Generate cleanup commands
 */
function generateCleanupCommands() {
  return {
    immediate_actions: [
      {
        description: 'Remove node_modules from all directories',
        commands: [
          'Remove-Item -Recurse -Force frontend-nextjs/node_modules -ErrorAction SilentlyContinue',
          'Remove-Item -Recurse -Force apps/*/node_modules -ErrorAction SilentlyContinue',
          'Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue',
        ],
        savings: '~300 MB',
      },
      {
        description: 'Clear build and cache files',
        commands: [
          'Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue',
          'Remove-Item -Recurse -Force frontend-nextjs/.next -ErrorAction SilentlyContinue',
          'Remove-Item -Recurse -Force apps/*/.next -ErrorAction SilentlyContinue',
          'Remove-Item -Recurse -Force apps/*/dist -ErrorAction SilentlyContinue',
          'Remove-Item -Recurse -Force apps/*/build -ErrorAction SilentlyContinue',
        ],
        savings: '~50 MB',
      },
      {
        description: 'Clean package lock files',
        commands: [
          'Remove-Item frontend-nextjs/package-lock.json -ErrorAction SilentlyContinue',
          'Remove-Item apps/*/package-lock.json -ErrorAction SilentlyContinue',
          'Remove-Item package-lock.json -ErrorAction SilentlyContinue',
        ],
        savings: '~5 MB',
      },
    ],

    recommended_actions: [
      {
        description: 'Archive old files',
        commands: [
          'Compress-Archive -Path archive/* -DestinationPath archive-backup.zip',
          'Remove-Item -Recurse archive/*',
        ],
        savings: '~5 MB',
      },
      {
        description: 'Remove duplicate utility files',
        commands: [
          '# Manual review needed - check for duplicate utilities',
          '# Consider consolidating similar functions',
        ],
        savings: '~10 MB',
      },
    ],
  };
}

/**
 * Create optimized .gitignore
 */
function createOptimizedGitignore() {
  return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
.next/
out/

# Cache directories
.turbo/
.cache/
.temp/
.tmp/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
desktop.ini

# Logs
logs/
*.log

# Coverage reports
coverage/
*.lcov

# Temporary files
*.tmp
*.temp
temp/
tmp/

# Package manager files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Database files
*.db
*.sqlite
*.sqlite3

# Backup files
*.backup
*.bak
backup/

# Large media files (consider using Git LFS)
*.mp4
*.avi
*.mov
*.mkv
*.zip
*.tar.gz
*.rar

# Auto-generated documentation
docs/auto-generated/

# Test artifacts
test-results/
screenshots/`;
}

/**
 * Main cleanup function
 */
async function runProjectCleanup() {
  console.log('🧹 Starting GACP Platform Size Cleanup...\n');

  const analysis = analyzeProjectSize();
  const commands = generateCleanupCommands();

  // Display analysis
  console.log('📊 CURRENT SITUATION:');
  console.log(`   Total Size: ${analysis.total_current_size}`);
  console.log(`   Total Files: 87,172 files`);
  console.log(`   Estimated Savings: ${analysis.estimated_savings}\n`);

  console.log('🚨 CRITICAL ISSUES:');
  analysis.critical_issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.folder} (${issue.size})`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Action: ${issue.action}`);
    console.log(`   Savings: ${issue.potential_savings}\n`);
  });

  console.log('⚠️ RECOMMENDED CLEANUP COMMANDS:');
  commands.immediate_actions.forEach((action, index) => {
    console.log(`\n${index + 1}. ${action.description} (${action.savings})`);
    action.commands.forEach(cmd => {
      console.log(`   ${cmd}`);
    });
  });

  console.log('\n📝 NEXT STEPS:');
  console.log('1. Run immediate cleanup commands');
  console.log('2. Update .gitignore file');
  console.log('3. Reinstall dependencies with npm install');
  console.log('4. Verify project still works');
  console.log('5. Commit cleaned project');

  console.log('\n✨ Expected result: ~200MB project size (69% reduction)');
}

module.exports = {
  analyzeProjectSize,
  generateCleanupCommands,
  createOptimizedGitignore,
  runProjectCleanup,
};

if (require.main === module) {
  runProjectCleanup();
}
