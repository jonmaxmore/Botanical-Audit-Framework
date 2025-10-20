#!/usr/bin/env node

/**
 * Backend Code Quality and Connection Improvement Script
 * Apple-style guidelines compliance and connection optimization
 */

const fs = require('fs');
const path = require('path');

const BACKEND_PATH = path.join(__dirname, 'apps', 'backend');

// Statistics
const stats = {
  filesProcessed: 0,
  consoleReplaced: 0,
  errorsFound: [],
  warnings: [],
};

/**
 * Replace console.log with proper logger usage
 */
function replaceConsoleWithLogger(content, filePath) {
  let modified = content;
  let replacements = 0;

  // Check if logger is already imported
  const hasLoggerImport =
    /require\(['"].*logger.*['"]\)/.test(content) ||
    /from\s+['"].*logger.*['"]/.test(content) ||
    /const.*logger.*=.*require/.test(content);

  // Replace console.log
  const logPattern = /console\.log\((.*?)\);?/g;
  if (logPattern.test(content)) {
    if (!hasLoggerImport) {
      // Add logger import at the top
      const importStatement = "const logger = require('./shared/logger');\n";
      const firstRequire = content.indexOf('require(');
      if (firstRequire !== -1) {
        const lineStart = content.lastIndexOf('\n', firstRequire);
        modified = content.slice(0, lineStart + 1) + importStatement + content.slice(lineStart + 1);
      }
    }
    modified = modified.replace(logPattern, (match, args) => {
      replacements++;
      return `logger.info(${args});`;
    });
  }

  // Replace console.error
  const errorPattern = /console\.error\((.*?)\);?/g;
  if (errorPattern.test(modified)) {
    modified = modified.replace(errorPattern, (match, args) => {
      replacements++;
      return `logger.error(${args});`;
    });
  }

  // Replace console.warn
  const warnPattern = /console\.warn\((.*?)\);?/g;
  if (warnPattern.test(modified)) {
    modified = modified.replace(warnPattern, (match, args) => {
      replacements++;
      return `logger.warn(${args});`;
    });
  }

  if (replacements > 0) {
    stats.consoleReplaced += replacements;
    console.log(`  ✓ Replaced ${replacements} console statements in ${path.basename(filePath)}`);
  }

  return modified;
}

/**
 * Check for common connection issues
 */
function checkConnectionIssues(content, filePath) {
  const issues = [];

  // Check for hardcoded URLs
  if (/mongodb:\/\/localhost/.test(content) && !/process\.env/.test(content)) {
    issues.push('Hardcoded MongoDB localhost URL found');
  }

  // Check for missing error handling in connections
  if (/mongoose\.connect/.test(content) && !/catch/.test(content)) {
    issues.push('MongoDB connection missing error handling');
  }

  // Check for missing timeout configurations
  if (/mongoose\.connect/.test(content) && !/serverSelectionTimeoutMS/.test(content)) {
    issues.push('MongoDB connection missing timeout configuration');
  }

  // Check for API calls without error handling
  if (/(axios|fetch)\(/.test(content) && !/catch/.test(content)) {
    issues.push('API call missing error handling');
  }

  if (issues.length > 0) {
    stats.warnings.push({
      file: path.relative(BACKEND_PATH, filePath),
      issues,
    });
  }
}

/**
 * Process a single JavaScript file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let modified = content;

    // Replace console statements
    modified = replaceConsoleWithLogger(modified, filePath);

    // Check for connection issues
    checkConnectionIssues(content, filePath);

    // Write back if modified
    if (modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf-8');
    }

    stats.filesProcessed++;
  } catch (error) {
    stats.errorsFound.push({
      file: path.relative(BACKEND_PATH, filePath),
      error: error.message,
    });
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    // Skip node_modules and hidden directories
    if (item === 'node_modules' || item.startsWith('.')) {
      continue;
    }

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

/**
 * Generate connection health check file
 */
function generateConnectionHealthCheck() {
  const healthCheckContent = `/**
 * Connection Health Check Utility
 * Monitors all system connections (Database, Redis, External APIs)
 */

const mongoose = require('mongoose');

class ConnectionHealthChecker {
  constructor(logger) {
    this.logger = logger;
    this.connections = new Map();
  }

  /**
   * Register a connection to monitor
   */
  registerConnection(name, checkFn) {
    this.connections.set(name, checkFn);
  }

  /**
   * Check MongoDB connection
   */
  async checkMongoDB() {
    try {
      if (mongoose.connection.readyState === 1) {
        const result = await mongoose.connection.db.admin().ping();
        return { status: 'healthy', latency: result.ok ? 'low' : 'unknown' };
      }
      return { status: 'disconnected' };
    } catch (error) {
      this.logger.error('MongoDB health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Check all registered connections
   */
  async checkAll() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      connections: {},
    };

    // Check MongoDB
    results.connections.mongodb = await this.checkMongoDB();

    // Check other registered connections
    for (const [name, checkFn] of this.connections.entries()) {
      try {
        results.connections[name] = await checkFn();
      } catch (error) {
        this.logger.error(\`Health check failed for \${name}:\`, error);
        results.connections[name] = { status: 'error', error: error.message };
      }
    }

    // Determine overall health
    const statuses = Object.values(results.connections).map(c => c.status);
    if (statuses.some(s => s === 'unhealthy' || s === 'error')) {
      results.overall = 'unhealthy';
    } else if (statuses.some(s => s === 'degraded')) {
      results.overall = 'degraded';
    }

    return results;
  }

  /**
   * Express middleware for health check endpoint
   */
  middleware() {
    return async (req, res) => {
      const health = await this.checkAll();
      const statusCode = health.overall === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    };
  }
}

module.exports = ConnectionHealthChecker;
`;

  const outputPath = path.join(BACKEND_PATH, 'utils', 'connection-health-checker.js');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, healthCheckContent, 'utf-8');
  console.log('✓ Generated connection health checker');
}

/**
 * Generate improved environment configuration
 */
function generateEnvironmentConfig() {
  const envConfigContent = `/**
 * Environment Configuration with Validation
 * Apple-style configuration management
 */

const fs = require('fs');
const path = require('path');

class EnvironmentConfig {
  constructor() {
    this.required = [
      'NODE_ENV',
      'PORT',
      'MONGODB_URI',
      'JWT_SECRET',
    ];

    this.optional = {
      REDIS_URL: 'redis://localhost:6379',
      LOG_LEVEL: 'info',
      API_TIMEOUT: '30000',
    };
  }

  /**
   * Validate required environment variables
   */
  validate() {
    const missing = [];

    for (const key of this.required) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        \`Missing required environment variables: \${missing.join(', ')}\\n\` +
        \`Please check your .env file or environment configuration.\`
      );
    }

    return true;
  }

  /**
   * Get configuration value with fallback
   */
  get(key, defaultValue = null) {
    return process.env[key] || this.optional[key] || defaultValue;
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig() {
    return {
      uri: this.get('MONGODB_URI'),
      options: {
        serverSelectionTimeoutMS: parseInt(this.get('DB_TIMEOUT', '5000')),
        socketTimeoutMS: parseInt(this.get('DB_SOCKET_TIMEOUT', '45000')),
        maxPoolSize: parseInt(this.get('DB_POOL_SIZE', '10')),
        minPoolSize: parseInt(this.get('DB_MIN_POOL_SIZE', '2')),
      },
    };
  }

  /**
   * Get Redis configuration
   */
  getRedisConfig() {
    const redisUrl = this.get('REDIS_URL');
    if (!redisUrl) return null;

    return {
      url: redisUrl,
      options: {
        connectTimeout: parseInt(this.get('REDIS_TIMEOUT', '5000')),
        maxRetriesPerRequest: 3,
      },
    };
  }

  /**
   * Check if in production mode
   */
  isProduction() {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if in development mode
   */
  isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Generate example .env file
   */
  generateExample() {
    const example = [
      '# Application',
      'NODE_ENV=development',
      'PORT=5000',
      '',
      '# Database',
      'MONGODB_URI=mongodb://localhost:27017/gacp-platform',
      'DB_TIMEOUT=5000',
      '',
      '# Authentication',
      'JWT_SECRET=your-secret-key-here',
      'JWT_EXPIRES_IN=7d',
      '',
      '# Redis (Optional)',
      'REDIS_URL=redis://localhost:6379',
      '',
      '# Logging',
      'LOG_LEVEL=info',
      '',
    ].join('\\n');

    fs.writeFileSync(path.join(__dirname, '.env.example'), example, 'utf-8');
  }
}

module.exports = new EnvironmentConfig();
`;

  const outputPath = path.join(BACKEND_PATH, 'config', 'environment.js');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, envConfigContent, 'utf-8');
  console.log('✓ Generated environment configuration');
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Backend Code Quality Improvement');
  console.log('='.repeat(50));
  console.log('');

  // Process all backend files
  console.log('📝 Processing backend files...');
  processDirectory(BACKEND_PATH);

  console.log('');
  console.log('🔧 Generating utility files...');
  generateConnectionHealthCheck();
  generateEnvironmentConfig();

  // Display results
  console.log('');
  console.log('📊 Summary');
  console.log('='.repeat(50));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Console statements replaced: ${stats.consoleReplaced}`);
  console.log(`Warnings found: ${stats.warnings.length}`);
  console.log(`Errors encountered: ${stats.errorsFound.length}`);

  if (stats.warnings.length > 0) {
    console.log('');
    console.log('⚠️  Warnings:');
    stats.warnings.slice(0, 10).forEach(w => {
      console.log(`  ${w.file}:`);
      w.issues.forEach(issue => console.log(`    - ${issue}`));
    });
    if (stats.warnings.length > 10) {
      console.log(`  ... and ${stats.warnings.length - 10} more`);
    }
  }

  if (stats.errorsFound.length > 0) {
    console.log('');
    console.log('❌ Errors:');
    stats.errorsFound.forEach(e => {
      console.log(`  ${e.file}: ${e.error}`);
    });
  }

  console.log('');
  console.log('✅ Backend improvement complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run: pnpm format (to format all files)');
  console.log('  2. Run: pnpm lint:fix (to fix linting issues)');
  console.log('  3. Review connection configurations');
  console.log('  4. Test all endpoints');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };
