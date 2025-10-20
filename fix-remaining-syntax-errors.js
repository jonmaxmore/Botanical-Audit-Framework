const fs = require('fs');
const path = require('path');

const logger = {
  info: msg => console.log(`\n✅ ${msg}`),
  error: msg => console.log(`\n❌ ${msg}`),
  warn: msg => console.log(`\n⚠️  ${msg}`),
};

const fixFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let fixed = false;

    // Fix pattern: .toFixed(2);}% -> .toFixed(2)}%
    if (content.includes(');}`')) {
      content = content.replace(/\);\}`/g, ')}`');
      fixed = true;
    }

    // Fix pattern: / 1024);}MB -> / 1024)}MB
    if (content.includes(');}M')) {
      content = content.replace(/\);\}M/g, ')}M');
      fixed = true;
    }

    // Fix pattern: .join(', ');} -> .join(', ')}
    if (content.includes(");}`")) {
      content = content.replace(/\"\);\}`/g, '")}`');
      content = content.replace(/\'\);\}`/g, "')}`");
      fixed = true;
    }

    // Fix pattern: .repeat(80);); -> .repeat(80));
    if (content.includes(';);')) {
      content = content.replace(/\(80\);\);/g, '(80));');
      content = content.replace(/\(\);\);/g, '());');
      fixed = true;
    }

    // Fix pattern: .toFixed(1);}%) -> .toFixed(1)}%)
    if (content.includes('.toFixed(1);})')) {
      content = content.replace(/\.toFixed\(1\);\}/g, '.toFixed(1)}');
      fixed = true;
    }

    if (fixed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      logger.info(`Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Error fixing ${filePath}: ${error.message}`);
    return false;
  }
};
      content = content.replace(/\'\);\}`/g, "')}`");
      fixed = true;
    }

    if (fixed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      logger.info(`Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Error fixing ${filePath}: ${error.message}`);
    return false;
  }
};

// Target specific files with issues
const filesToFix = [
  'apps/backend/modules/application/tests/integration/application-integration-test-suite.js',
  'apps/backend/modules/audit/services/GovernmentIntegrationService.js',
  'apps/backend/modules/auth-dtam/container.js',
];

logger.info('Starting syntax error fixes...');
let fixedCount = 0;

filesToFix.forEach(relativePath => {
  const fullPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    if (fixFile(fullPath)) {
      fixedCount++;
    }
  } else {
    logger.warn(`File not found: ${relativePath}`);
  }
});

logger.info(`\n✅ Fixed ${fixedCount} file(s)`);
