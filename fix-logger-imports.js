#!/usr/bin/env node
/**
 * Auto-fix missing logger imports in files with logger errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files that need logger imports based on ESLint output
const filesToFix = [
  'middleware/audit.js',
  'modules/application-workflow/infrastructure/repositories/application-repository.js',
  'modules/application-workflow/presentation/controllers/application-controller.js',
  'modules/application-workflow/presentation/routes/application-routes.js',
  'modules/application/application/controllers/enhanced-application-processing.js',
  'modules/application/domain/services/advanced-application-processing.js',
];

function getRelativePath(filePath) {
  const depth = (filePath.match(/\//g) || []).length;
  return '../'.repeat(depth) + 'shared/logger';
}

function addLoggerImport(filePath) {
  const fullPath = path.join(__dirname, 'apps', 'backend', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if logger is already imported
  if (content.includes('createLogger') || content.includes("require('../shared/logger')") || content.includes("require('./shared/logger')")) {
    console.log(`✓ Logger already imported in: ${filePath}`);
    return true;
  }

  // Check if file uses logger
  if (!content.includes('logger.')) {
    console.log(`⊘ No logger usage in: ${filePath}`);
    return true;
  }

  // Find the right place to insert
  const lines = content.split('\n');
  let insertIndex = 0;
  let lastRequireIndex = -1;

  // Find last require statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('require(') && !lines[i].trim().startsWith('//')) {
      lastRequireIndex = i;
    }
    // Stop at first non-require, non-comment, non-empty line
    if (lastRequireIndex >= 0 && i > lastRequireIndex + 5) {
      break;
    }
  }

  insertIndex = lastRequireIndex >= 0 ? lastRequireIndex + 1 : 0;

  // Get module name from file path
  const moduleName = path.basename(filePath, '.js');
  const relativePath = getRelativePath(filePath);

  // Insert logger import
  const loggerImport = `const { createLogger } = require('${relativePath}');\nconst logger = createLogger('${moduleName}');\n`;
  
  lines.splice(insertIndex, 0, loggerImport);
  
  const newContent = lines.join('\n');
  fs.writeFileSync(fullPath, newContent, 'utf8');
  
  console.log(`✓ Added logger import to: ${filePath}`);
  return true;
}

console.log('🔧 Fixing missing logger imports...\n');

let fixed = 0;
let failed = 0;

for (const file of filesToFix) {
  if (addLoggerImport(file)) {
    fixed++;
  } else {
    failed++;
  }
}

console.log(`\n✨ Fixed ${fixed} files, ${failed} failed`);

// Run lint again to see improvements
console.log('\n📊 Running ESLint to check improvements...');
try {
  execSync('cd apps/backend && pnpm run lint 2>&1 | Select-String "problems"', { 
    stdio: 'inherit',
    shell: 'powershell.exe'
  });
} catch (e) {
  // ESLint exits with 1 if there are errors
}
