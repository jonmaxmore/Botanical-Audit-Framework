const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Fix Logger Import Paths
 * Fixes incorrect './shared/logger' imports in backend files
 */

console.log('\n🔧 Fixing logger import paths...\n');

// Find all JS files in apps/backend
const files = glob.sync('apps/backend/**/*.js', {
  ignore: ['**/node_modules/**', '**/dist/**'],
});

let fixedCount = 0;
let skippedCount = 0;

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if file has wrong import
    if (!content.includes("require('./shared/logger')")) {
      return;
    }

    // Calculate correct relative path
    const dir = path.dirname(filePath);
    const backendRoot = path.resolve('apps/backend');
    const relativePath = path.relative(dir, backendRoot);
    const correctPath = path.join(relativePath, 'shared', 'logger').replace(/\\/g, '/');

    // Replace wrong import with correct one
    const newContent = content.replace(
      /require\('\.\/shared\/logger'\)/g,
      `require('${correctPath}/logger')`,
    );

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      console.log(`   Changed to: require('${correctPath}/logger')`);
      fixedCount++;
    } else {
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
});

console.log('\n📊 Summary:');
console.log(`   ✅ Fixed: ${fixedCount} files`);
console.log(`   ⏭️  Skipped: ${skippedCount} files`);
console.log('\n✅ Done!\n');
