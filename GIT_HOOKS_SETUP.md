# Git Hooks Setup Guide

## Overview

Automated code quality checks are now configured to run:
- **On commit:** TypeScript + ESLint + Formatting
- **On push:** TypeScript + ESLint + Tests

## What Runs When

### Pre-Commit Hook (`.husky/pre-commit`)
Runs automatically before every commit:
1. **TypeScript type checking** - Validates types across all portals
2. **ESLint** - Checks code quality and style
3. **Prettier** - Auto-formats staged files

### Pre-Push Hook (`.husky/pre-push`)
Runs automatically before pushing to remote:
1. **TypeScript type checking**
2. **ESLint**
3. **Unit tests**

## Manual Commands

Run checks manually:

```bash
# TypeScript check
npm run type-check

# ESLint
npm run lint:all

# Fix ESLint issues
npm run lint:fix

# Run tests
npm run test

# Format code
npm run format
```

## Bypass Hooks (Emergency Only)

```bash
# Skip pre-commit
git commit --no-verify -m "message"

# Skip pre-push
git push --no-verify
```

⚠️ **Warning:** Only bypass hooks in emergencies. All code must pass checks before merging to main.

## Troubleshooting

**Hook not running:**
```bash
# Reinstall husky
npm run prepare
```

**Permission errors (Linux/Mac):**
```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

**Slow checks:**
- Pre-commit checks only staged files (fast)
- Pre-push checks entire codebase (slower but thorough)

## Configuration Files

- `.husky/pre-commit` - Commit hook
- `.husky/pre-push` - Push hook
- `package.json` - lint-staged config
- `.eslintrc.js` - ESLint rules
- `tsconfig.json` - TypeScript config
