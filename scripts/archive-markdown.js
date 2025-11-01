#!/usr/bin/env node
/**
 * Markdown archival helper
 *
 * Usage:
 *   node scripts/archive-markdown.js            # dry run (preview candidates)
 *   node scripts/archive-markdown.js --execute  # move files to archive/_holding
 *   node scripts/archive-markdown.js --pattern "draft" --execute
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(__dirname, '..');
const archiveRoot = path.join(rootDir, 'archive', '_holding');

const execute = process.argv.includes('--execute');
const patternIndex = process.argv.indexOf('--pattern');
const customPattern = patternIndex > -1 ? process.argv[patternIndex + 1] : null;

const defaultMatchers = [
  /_old\.[mM][dD]$/,
  /^draft.*\.[mM][dD]$/,
  /^notes?.*\.[mM][dD]$/,
  /^test.*\.[mM][dD]$/
];

let customMatcher;
if (customPattern) {
  try {
    customMatcher = new RegExp(customPattern, 'i');
  } catch (error) {
    console.error(`Invalid custom pattern: ${customPattern}`);
    process.exit(1);
  }
}

const MAX_DEPTH = 3;
const candidates = [];

function walk(currentDir, depth) {
  if (depth > MAX_DEPTH) {
    return;
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.git') || entry.name === 'node_modules') {
      continue;
    }

    const fullPath = path.join(currentDir, entry.name);
    const relative = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      walk(fullPath, depth + 1);
      continue;
    }

    if (!entry.name.toLowerCase().endsWith('.md')) {
      continue;
    }

    const matcherList = customMatcher ? [customMatcher] : defaultMatchers;
    if (matcherList.some(regex => regex.test(entry.name))) {
      candidates.push({ fullPath, relative });
    }
  }
}

walk(rootDir, 0);

if (candidates.length === 0) {
  console.log('No markdown files matched the archive patterns.');
  process.exit(0);
}

console.log('Markdown files that match the archive patterns:');
for (const item of candidates) {
  console.log(` - ${item.relative}`);
}

if (!execute) {
  console.log('\nDry run complete. Re-run with --execute to move the files.');
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('\nMove the files above into archive/_holding? (y/N) ', answer => {
  rl.close();

  if (!/^y(es)?$/i.test(answer.trim())) {
    console.log('Operation cancelled.');
    process.exit(0);
  }

  fs.mkdirSync(archiveRoot, { recursive: true });

  let moved = 0;

  for (const item of candidates) {
    const destinationDir = path.join(archiveRoot, path.dirname(item.relative));
    fs.mkdirSync(destinationDir, { recursive: true });

    let destinationPath = path.join(destinationDir, path.basename(item.relative));

    if (fs.existsSync(destinationPath)) {
      const timestamp = Date.now();
      destinationPath = path.join(destinationDir, `${path.basename(item.relative, '.md')}-${timestamp}.md`);
    }

    fs.renameSync(item.fullPath, destinationPath);
    moved += 1;
    console.log(`moved -> ${path.relative(rootDir, destinationPath)}`);
  }

  console.log(`\nCompleted. ${moved} file(s) moved to archive/_holding.`);
});
