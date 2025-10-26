#!/usr/bin/env node
/**
 * Auto-fix ALL missing logger imports by parsing ESLint output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendPath = path.join(__dirname, 'apps', 'backend');

// Get all files with logger errors from ESLint
function getFilesWithLoggerErrors() {
  try {
    const output = execSync('pnpm run lint 2>&1', {
      cwd: backendPath,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });

    const lines = output.split('\n');
    const files = new Set();
    let currentFile = null;

    for (const line of lines) {
      // Match file path lines
      if (line.match(/^[A-Z]:\\.*\.js$/)) {
        currentFile = line.trim();
      } else if (currentFile && line.includes("'logger' is not defined")) {
        // Convert absolute path to relative
        const relativePath = currentFile
          .replace(/\\/g, '/')
          .replace(/.*apps\/backend\//, '');
        files.add(relativePath);
      }
    }

    return Array.from(files);
  } catch (error) {
    // ESLint exits with 1 if there are errors, but we still get output
    const output = error.stdout || error.message;
    const lines = output.split('\n');
    const files = new Set();
    let currentFile = null;

    for (const line of lines) {
      if (line.match(/^[A-Z]:\\.*\.js$/)) {
        currentFile = line.trim();
      } else if (currentFile && line.includes("'logger' is not defined")) {
        const relativePath = currentFile
          .replace(/\\/g, '/')
          .replace(/.*apps\/backend\//, '');
        files.add(relativePath);
      }
    }

    return Array.from(files);
  }
}

function getRelativePath(filePath) {
  const depth = (filePath.match(/\//g) || []).length;
  return '../'.repeat(depth) + 'shared/logger';
}

function getModuleName(filePath) {
  const basename = path.basename(filePath, '.js');
  const dirname = path.dirname(filePath);
  
  // Create descriptive module name
  if (dirname.includes('modules/')) {
    const parts = dirname.split('/');
    const moduleIndex = parts.indexOf('modules');
    const moduleName = parts[moduleIndex + 1];
    return `${moduleName}-${basename}`;
  }
  
  return basename;
}

function addLoggerImport(filePath) {
  const fullPath = path.join(backendPath, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if logger is already imported
  if (content.includes('createLogger') || content.match(/const logger = require/)) {
    console.log(`✓ Logger already imported: ${filePath}`);
    return true;
  }

  // Check if file uses logger
  if (!content.includes('logger.')) {
    console.log(`⊘ No logger usage: ${filePath}`);
    return true;
  }

  const lines = content.split('\n');
  let insertIndex = 0;
  let lastRequireIndex = -1;
  let inComment = false;

  // Find the right place to insert (after last require, before first non-import code)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Track multi-line comments
    if (line.includes('/*')) inComment = true;
    if (line.includes('*/')) inComment = false;
    
    if (inComment || line.startsWith('//') || line.startsWith('*')) {
      continue;
    }

    if (line.includes('require(') && !line.startsWith('//')) {
      lastRequireIndex = i;
    }
    
    // Stop at first substantial code after requires
    if (lastRequireIndex >= 0 && i > lastRequireIndex + 2) {
      if (line && !line.startsWith('//') && !line.startsWith('/*')) {
        break;
      }
    }
  }

  insertIndex = lastRequireIndex >= 0 ? lastRequireIndex + 1 : 0;

  // Get module name and relative path
  const moduleName = getModuleName(filePath);
  const relativePath = getRelativePath(filePath);

  // Insert logger import with proper formatting
  const loggerImport = `const { createLogger } = require('${relativePath}');\nconst logger = createLogger('${moduleName}');\n`;
  
  lines.splice(insertIndex, 0, loggerImport);
  
  const newContent = lines.join('\n');
  fs.writeFileSync(fullPath, newContent, 'utf8');
  
  console.log(`✓ Added logger import: ${filePath}`);
  return true;
}

console.log('🔍 Scanning for files with logger errors...\n');

const filesToFix = getFilesWithLoggerErrors();

console.log(`📝 Found ${filesToFix.length} files with logger errors\n`);

if (filesToFix.length === 0) {
  console.log('✨ No logger errors found!');
  process.exit(0);
}

console.log('🔧 Fixing logger imports...\n');

let fixed = 0;
let failed = 0;
let skipped = 0;

for (const file of filesToFix) {
  const result = addLoggerImport(file);
  if (result === true) {
    if (fs.readFileSync(path.join(backendPath, file), 'utf8').includes('createLogger')) {
      fixed++;
    } else {
      skipped++;
    }
  } else {
    failed++;
  }
}

console.log(`\n✨ Summary:`);
console.log(`   Fixed: ${fixed}`);
console.log(`   Skipped: ${skipped}`);
console.log(`   Failed: ${failed}`);

// Run lint again to see improvements
console.log('\n📊 Running ESLint to check improvements...');
try {
  const result = execSync('pnpm run lint 2>&1 | Select-String "problems"', {
    cwd: backendPath,
    encoding: 'utf8',
    shell: 'powershell.exe',
    maxBuffer: 10 * 1024 * 1024
  });
  console.log('\n' + result);
} catch (e) {
  // Ignore exit code
  if (e.stdout) {
    console.log('\n' + e.stdout);
  }
}
