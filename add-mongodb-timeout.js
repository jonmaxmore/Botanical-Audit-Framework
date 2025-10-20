const fs = require('fs');
const path = require('path');

/**
 * Script to add serverSelectionTimeoutMS to mongoose.connect() calls
 * that are missing this timeout configuration
 */

const filesToUpdate = [
  'apps/backend/config/mongodb-manager.js',
  'apps/backend/src/config/database.js',
  'apps/backend/modules/application/tests/integration/application-integration-test-suite.js',
  'apps/backend/test-mongodb-connection.js',
  'apps/backend/test-ssl-connection.js',
  'apps/backend/services/compliance-seeder.js',
  'apps/backend/services/transaction-manager.js',
  'apps/backend/config/database-optimization.js',
  'apps/backend/modules/shared/database/connection.js',
  'apps/backend/modules/shared/config/database.js',
];

function addTimeoutToFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let modified = false;

    // Pattern 1: Options object without serverSelectionTimeoutMS
    // Look for mongoose.connect with options that don't have serverSelectionTimeoutMS
    const patterns = [
      // Pattern: useNewUrlParser: true, without serverSelectionTimeoutMS
      {
        search: /useNewUrlParser:\s*true,\s*\n\s*useUnifiedTopology:\s*true,\s*\n(\s*)\}/g,
        replace: (match, indent) =>
          `useNewUrlParser: true,\n${indent}useUnifiedTopology: true,\n${indent}serverSelectionTimeoutMS: 5000,\n${indent}}`,
      },
      // Pattern: retryReads: true, without serverSelectionTimeoutMS before closing brace
      {
        search: /retryReads:\s*true,\s*\n(\s*)\/\/ SSL/g,
        replace: (match, indent) =>
          `retryReads: true,\n${indent}serverSelectionTimeoutMS: 5000,\n${indent}// SSL`,
      },
      // Pattern: maxIdleTimeMS without serverSelectionTimeoutMS
      {
        search: /maxIdleTimeMS:\s*\d+,\s*\n(\s*)retryWrites:/g,
        replace: (match, indent) =>
          match.replace(
            /,\s*\n(\s*)retryWrites:/,
            `,\n${indent}serverSelectionTimeoutMS: 5000,\n${indent}retryWrites:`,
          ),
      },
    ];

    patterns.forEach(pattern => {
      if (pattern.search.test(content)) {
        content = content.replace(pattern.search, pattern.replace);
        modified = true;
      }
    });

    // Check if file already has serverSelectionTimeoutMS
    if (content.includes('serverSelectionTimeoutMS')) {
      if (originalContent.includes('serverSelectionTimeoutMS')) {
        console.log(`⏭️  Skipped (already has timeout): ${path.relative(process.cwd(), filePath)}`);
        return { modified: false, skipped: true };
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      return { modified: true, skipped: false };
    }

    console.log(`⚠️  No changes needed: ${path.relative(process.cwd(), filePath)}`);
    return { modified: false, skipped: false };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return { modified: false, skipped: false, error: true };
  }
}

console.log('\n🔧 Adding serverSelectionTimeoutMS to mongoose.connect() calls...\n');

let updatedCount = 0;
let skippedCount = 0;
let errorCount = 0;

filesToUpdate.forEach(relativePath => {
  const fullPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    const result = addTimeoutToFile(fullPath);
    if (result.modified) updatedCount++;
    if (result.skipped) skippedCount++;
    if (result.error) errorCount++;
  } else {
    console.log(`⚠️  File not found: ${relativePath}`);
  }
});

console.log('\n📊 Summary:');
console.log(`   ✅ Updated: ${updatedCount} files`);
console.log(`   ⏭️  Skipped: ${skippedCount} files`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log('\n✅ Done!\n');
