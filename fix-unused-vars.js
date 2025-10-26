#!/usr/bin/env node
/**
 * Auto-fix unused variable warnings by prefixing with underscore
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendPath = path.join(__dirname, 'apps', 'backend');

// Get unused variable warnings from ESLint
function getUnusedVarsFromLint() {
  try {
    const output = execSync('pnpm run lint 2>&1', {
      cwd: backendPath,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024
    });

    return parseUnusedVars(output);
  } catch (error) {
    return parseUnusedVars(error.stdout || error.message);
  }
}

function parseUnusedVars(output) {
  const lines = output.split('\n');
  const unusedVars = [];
  let currentFile = null;

  for (const line of lines) {
    // Match file path
    if (line.match(/^[A-Z]:\\.*\.js$/)) {
      currentFile = line.trim()
        .replace(/\\/g, '/')
        .replace(/.*apps\/backend\//, '');
    }
    // Match unused var warning
    else if (currentFile && line.includes('is defined but never used') && line.includes('no-unused-vars')) {
      const match = line.match(/(\d+):(\d+)\s+warning\s+'([^']+)'/);
      if (match) {
        const [, lineNum, , varName] = match;
        unusedVars.push({
          file: currentFile,
          line: parseInt(lineNum),
          varName: varName
        });
      }
    }
    // Match assigned but never used
    else if (currentFile && line.includes('is assigned a value but never used') && line.includes('no-unused-vars')) {
      const match = line.match(/(\d+):(\d+)\s+warning\s+'([^']+)'/);
      if (match) {
        const [, lineNum, , varName] = match;
        unusedVars.push({
          file: currentFile,
          line: parseInt(lineNum),
          varName: varName
        });
      }
    }
  }

  return unusedVars;
}

function fixUnusedVar(filePath, lineNum, varName) {
  const fullPath = path.join(backendPath, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  if (lineNum > lines.length || lineNum < 1) {
    return false;
  }

  const line = lines[lineNum - 1];
  
  // Skip if already prefixed with underscore
  if (varName.startsWith('_')) {
    return true;
  }

  // Pattern 1: Function parameter - prefix with _
  // (param1, param2, param3) => { ... }
  // function name(param1, param2) { ... }
  const paramPatterns = [
    new RegExp(`\\b${varName}\\b(?=[,\\)])`, 'g'),
    new RegExp(`([,\\(]\\s*)${varName}(\\s*[,\\)])`, 'g')
  ];

  let modified = false;
  for (const pattern of paramPatterns) {
    if (line.match(pattern)) {
      // Replace parameter name with _varName
      lines[lineNum - 1] = line.replace(
        new RegExp(`\\b${varName}\\b(?=[,\\)])`, 'g'),
        `_${varName}`
      );
      modified = true;
      break;
    }
  }

  // Pattern 2: Variable declaration - comment out or prefix
  // const varName = ...
  // let varName = ...
  if (!modified && line.match(new RegExp(`^\\s*(const|let|var)\\s+${varName}\\s*=`))) {
    // Comment out the line if it's a simple assignment
    if (!line.includes('require(') && !line.includes('import ')) {
      lines[lineNum - 1] = line.replace(/^(\s*)/, '$1// ');
      modified = true;
    }
  }

  if (modified) {
    content = lines.join('\n');
    fs.writeFileSync(fullPath, content, 'utf8');
    return true;
  }

  return false;
}

console.log('🔍 Scanning for unused variable warnings...\n');

const unusedVars = getUnusedVarsFromLint();

console.log(`📝 Found ${unusedVars.length} unused variable warnings\n`);

if (unusedVars.length === 0) {
  console.log('✨ No unused variables found!');
  process.exit(0);
}

console.log('🔧 Fixing unused variables...\n');

// Group by file to avoid multiple writes
const byFile = unusedVars.reduce((acc, uv) => {
  if (!acc[uv.file]) acc[uv.file] = [];
  acc[uv.file].push(uv);
  return acc;
}, {});

let fixed = 0;
let failed = 0;

for (const [file, vars] of Object.entries(byFile)) {
  // Sort by line number descending to avoid line number shifts
  vars.sort((a, b) => b.line - a.line);
  
  let fileFixed = 0;
  for (const { line, varName } of vars) {
    if (fixUnusedVar(file, line, varName)) {
      fileFixed++;
      fixed++;
    } else {
      failed++;
    }
  }
  
  if (fileFixed > 0) {
    console.log(`✓ Fixed ${fileFixed} unused vars in: ${file}`);
  }
}

console.log(`\n✨ Summary:`);
console.log(`   Fixed: ${fixed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total: ${unusedVars.length}`);

// Run lint again
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
  if (e.stdout) {
    console.log('\n' + e.stdout);
  }
}
