#!/usr/bin/env node

/**
 * Fix Syntax Errors from Logger Replacement
 */

const fs = require('fs');
const path = require('path');

const BACKEND_PATH = path.join(__dirname, 'apps', 'backend');

const files = [
  'modules/document-management/services/document-content-validation.service.js',
  'modules/notification-service/index.js',
  'modules/reporting-analytics/index.js',
  'modules/training/__tests__/integration/enhanced-training-module.integration.test.js',
  'scripts/analyze-training-module-status.js',
  'scripts/complete-system-integration-test.js',
  'scripts/test-application-module.js',
  'scripts/test-audit-module.js',
  'scripts/validate-application-module.js',
  'scripts/verify-payment-workflow.js',
  'services/gacp-enhanced-inspection.js',
  'services/health-check-service.js',
  'services/mock-database.js',
  'setup-mongodb-atlas.js',
  'setup-production-database.js',
  'shared/EnvironmentValidator.js',
  'simple-server.js',
];

function fixFile(filePath) {
  const fullPath = path.join(BACKEND_PATH, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipped (not found): ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const original = content;

  // Fix: .toLocaleDateString('th-TH');} -> .toLocaleDateString('th-TH')}
  content = content.replace(/\.toLocaleDateString\('th-TH'\);}/g, ".toLocaleDateString('th-TH')}");

  // Fix: .join(', ');} -> .join(', ')}
  content = content.replace(/\.join\(', '\);}/g, ".join(', ')}");

  // Fix: '='.repeat(60);) -> '='.repeat(60))
  content = content.replace(/'='.repeat\((\d+)\);/g, "'='.repeat($1)");

  // Fix: JSON.stringify(capabilities, null, 2);) -> JSON.stringify(capabilities, null, 2))
  content = content.replace(/JSON\.stringify\(([^)]+)\);/g, 'JSON.stringify($1)');

  // Fix: .keys();) -> .keys())
  content = content.replace(/\.keys\(\);/g, '.keys()');

  // Fix: new Date();.toISOString() -> new Date().toISOString()
  content = content.replace(/new Date\(\);\.toISOString\(\)/g, 'new Date().toISOString()');

  // Fix: error => logger.info(`..`);) -> error => logger.info(`..`))
  content = content.replace(/logger\.(info|error|warn)\(`([^`]+)`\);/g, 'logger.$1(`$2`)');

  // Fix malformed require placement in tests
  content = content.replace(
    /afterEach,\s*const logger = require\('\.\/shared\/logger'\);/g,
    "afterEach,\n} = require('@jest/globals');\nconst logger = require('./shared/logger');",
  );

  // Fix malformed require placement
  content = content.replace(
    /GACPApplicationStatus,\s*const logger = require\('\.\/shared\/logger'\);/g,
    "GACPApplicationStatus,\n} = require('../models/gacp-business-logic');\nconst logger = require('./shared/logger');",
  );

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`  Unchanged: ${filePath}`);
    return false;
  }
}

console.log('🔧 Fixing Syntax Errors\n');
let fixed = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixed++;
  }
});

console.log(`\n✅ Fixed ${fixed} files`);
