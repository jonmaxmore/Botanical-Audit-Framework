const fs = require('fs');
const path = require('path');

/**
 * Script to refactor MongoDB connection options to Apple-style
 * - Group related configurations
 * - Use descriptive constant names
 * - Add clear comments
 */

const filesToRefactor = [
  'apps/backend/src/config/environment.js',
  'apps/backend/modules/shared/config/environment.js',
  'apps/backend/config/environment.js',
  'apps/backend/modules/application/config/index.js',
  'apps/backend/config/database-mongo-only.js',
];

function refactorMongoDBOptions(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let modified = false;

    // Pattern 1: Refactor inline timeout values to constants
    // socketTimeoutMS: 45000, -> socketTimeout: 45000,
    const replacements = [
      {
        // Find maxPoolSize and minPoolSize and group them
        search: /maxPoolSize:\s*(\d+),\s*\n\s*minPoolSize:\s*(\d+),/g,
        replace: (match, maxSize, minSize) => {
          modified = true;
          return `// Connection pool configuration\n      maxPoolSize: ${maxSize},\n      minPoolSize: ${minSize},`;
        },
      },
      {
        // Add comment before socketTimeoutMS if not present
        search: /(\n\s*)(socketTimeoutMS:\s*\d+,)/g,
        replace: (match, indent, line) => {
          if (!content.includes('// Timeout settings') && !content.includes('// Network timeout')) {
            modified = true;
            return `${indent}// Network timeout configuration\n${indent}${line}`;
          }
          return match;
        },
      },
    ];

    replacements.forEach(({ search, replace }) => {
      if (typeof replace === 'function') {
        content = content.replace(search, replace);
      } else {
        if (search.test(content)) {
          content = content.replace(search, replace);
          modified = true;
        }
      }
    });

    if (content !== originalContent && modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Refactored: ${path.relative(process.cwd(), filePath)}`);
      return { modified: true };
    }

    console.log(`⏭️  Skipped (no changes): ${path.relative(process.cwd(), filePath)}`);
    return { modified: false };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return { modified: false, error: true };
  }
}

console.log('\n🔧 Refactoring MongoDB options to Apple-style...\n');

let updatedCount = 0;
let skippedCount = 0;
let errorCount = 0;

filesToRefactor.forEach(relativePath => {
  const fullPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    const result = refactorMongoDBOptions(fullPath);
    if (result.modified) {
      updatedCount++;
    } else if (result.error) {
      errorCount++;
    } else {
      skippedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${relativePath}`);
    skippedCount++;
  }
});

console.log('\n📊 Summary:');
console.log(`   ✅ Updated: ${updatedCount} files`);
console.log(`   ⏭️  Skipped: ${skippedCount} files`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log('\n✅ Refactoring complete!\n');
