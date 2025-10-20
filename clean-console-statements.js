const fs = require('fs');
const path = require('path');

/**
 * Clean Console Statements from GACP Platform
 * Replaces console.log/error/warn with proper logger calls
 */

const filesToClean = [
  'apps/backend/server.js',
  'apps/backend/atlas-server.js',
  'apps/backend/config/mongodb-manager.js',
  'apps/backend/test-mongodb-connection.js',
  'apps/backend/test-ssl-connection.js',
  'analyze-gacp-platform-modules.js',
];

const loggerReplacements = {
  'console.log(': 'appLogger.info(',
  'console.error(': 'appLogger.error(',
  'console.warn(': 'appLogger.warn(',
  'console.debug(': 'appLogger.debug(',
  'console.info(': 'appLogger.info(',
};

function cleanConsoleStatements(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let changes = 0;

    // Replace console statements
    Object.entries(loggerReplacements).forEach(([search, replace]) => {
      const regex = new RegExp(search.replace('(', '\\('), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, replace);
        changes += matches.length;
      }
    });

    // Handle console statements in test files (keep them but add comment)
    if (filePath.includes('test-')) {
      content = content.replace(/appLogger\.(info|error|warn|debug)\(/g, '// appLogger.$1(');
      content = content.replace(/\/\/ appLogger/g, 'console');
    }

    // Add logger import if needed and not a test file
    if (changes > 0 && !filePath.includes('test-') && !content.includes('appLogger')) {
      const loggerImport = `
// Create structured logger for this module
const { logger } = require('./shared') || require('../shared') || { logger: { createLogger: () => console } };
const appLogger = logger.createLogger('${path.basename(filePath, '.js')}');
`;
      content = loggerImport + content;
    }

    if (changes > 0) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ ${filePath}: Cleaned ${changes} console statements`);
    } else {
      console.log(`✨ ${filePath}: No console statements found`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🧹 GACP Platform - Console Statements Cleanup');
  console.log('==============================================\n');

  filesToClean.forEach(cleanConsoleStatements);

  console.log('\n✅ Console cleanup completed!');
  console.log('📝 Please review the changes and test thoroughly');
  console.log('🔄 Run: npm run lint:check to verify changes');
}

if (require.main === module) {
  main();
}

module.exports = { cleanConsoleStatements };
