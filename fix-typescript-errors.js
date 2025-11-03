/**
 * Fix common TypeScript errors across frontend codebase
 * - Replace workflowState with currentState
 * - Replace submittedAt with submittedDate
 * - Fix Application type issues
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // Fix workflowState -> currentState
  {
    pattern: /(\w+)\.workflowState/g,
    replacement: '$1.currentState',
    description: 'Replace workflowState with currentState',
  },
  {
    pattern: /Application\['workflowState'\]/g,
    replacement: "Application['currentState']",
    description: 'Fix Application workflowState type reference',
  },
  {
    pattern: /workflowState:/g,
    replacement: 'currentState:',
    description: 'Fix workflowState property assignment',
  },
  // Fix submittedAt -> submittedDate
  {
    pattern: /(\w+)\.submittedAt/g,
    replacement: '$1.submittedDate',
    description: 'Replace submittedAt with submittedDate',
  },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fixes.forEach((fix) => {
    const before = content;
    content = content.replace(fix.pattern, fix.replacement);
    if (content !== before) {
      console.log(`  ✓ ${fix.description}`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (
      stat.isFile() &&
      (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))
    ) {
      callback(filePath);
    }
  });
}

// Main execution
const frontendDir = path.join(__dirname, 'app', 'frontend', 'src');
let filesFixed = 0;

console.log('Fixing TypeScript errors in frontend files...\n');

walkDir(frontendDir, (filePath) => {
  const relativePath = path.relative(frontendDir, filePath);
  const modified = fixFile(filePath);

  if (modified) {
    filesFixed++;
    console.log(`Fixed: ${relativePath}\n`);
  }
});

console.log(`\n✅ Fixed ${filesFixed} files`);
