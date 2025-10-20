const fs = require('fs');
const path = require('path');

const fixFile = filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Fix pattern: .toFixed(2);}% -> .toFixed(2)}%
    content = content.replace(/\);\}`/g, ')}`');

    // Fix pattern: / 1024);}MB -> / 1024)}MB
    content = content.replace(/\);\}M/g, ')}M');

    // Fix pattern: .repeat(80);); -> .repeat(80));
    content = content.replace(/\(80\);\);/g, '(80));');
    content = content.replace(/\(\);\);/g, '());');

    // Fix pattern: .toFixed(1);}%) -> .toFixed(1)}%)
    content = content.replace(/\.toFixed\(1\);\}/g, '.toFixed(1)}');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
    return false;
  }
};

const filesToFix = [
  'apps/backend/modules/application/tests/integration/application-integration-test-suite.js',
  'apps/backend/modules/audit/services/GovernmentIntegrationService.js',
  'apps/backend/modules/auth-dtam/container.js',
];

console.log('\n✅ Starting syntax error fixes...\n');
let fixedCount = 0;

filesToFix.forEach(relativePath => {
  const fullPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    if (fixFile(fullPath)) {
      fixedCount++;
    }
  } else {
    console.warn(`⚠️  File not found: ${relativePath}`);
  }
});

console.log(`\n✅ Fixed ${fixedCount} file(s)\n`);
