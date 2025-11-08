# 🛠️ Development Tooling Guide

> **Note:** Auto-run is disabled to prevent performance issues. Run tools manually when needed.

## ✅ Current Setup

- **ESLint**: Installed but disabled auto-run
- **Prettier**: Installed but disabled auto-format
- **TypeScript**: Installed and ready to use
- **Husky**: Pre-commit/Pre-push hooks configured

---

## 🎯 How to Use Tools Manually

### 1. **Lint Code (ESLint)**

```bash
# Lint entire backend
cd apps/backend
npx eslint .

# Lint with auto-fix
npx eslint . --fix

# Lint specific file
npx eslint path/to/file.js

# Lint with environment
npx cross-env NODE_ENV=production npx eslint .
```

### 2. **Format Code (Prettier)**

```bash
# Format entire backend
npx prettier --write apps/backend/

# Format specific files
npx prettier --write "apps/backend/**/*.{js,ts,json}"

# Check formatting without changing
npx prettier --check apps/backend/
```

### 3. **Type Check (TypeScript)**

```bash
# Type check backend
cd apps/backend
npx tsc --noEmit

# Type check with watch mode
npx tsc --noEmit --watch
```

### 4. **Run Tests**

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Specific test file
npm test -- path/to/test.js

# With coverage
npm test -- --coverage
```

---

## 🔧 VSCode Settings

Current `.vscode/settings.json`:
- ✅ ESLint: **Disabled** (manual run only)
- ✅ TypeScript validation: **Disabled** (use `npx tsc` instead)
- ✅ Format on save: **Disabled** (manual format only)
- ✅ Auto-fix on save: **Disabled**

---

## 🚀 Recommended Workflow

### Before Commit:

```bash
# 1. Format code
npx prettier --write apps/backend/

# 2. Lint and auto-fix
cd apps/backend
npx eslint . --fix

# 3. Type check
npx tsc --noEmit

# 4. Run tests
npm test
```

### Quick Quality Check:

```bash
# Run all checks at once
npm run check:full  # (if configured in package.json)
```

---

## 📝 Package.json Scripts

Add these to your `package.json` for convenience:

```json
{
  "scripts": {
    "lint": "cd apps/backend && npx eslint .",
    "lint:fix": "cd apps/backend && npx eslint . --fix",
    "format": "npx prettier --write apps/backend/",
    "format:check": "npx prettier --check apps/backend/",
    "type-check": "cd apps/backend && npx tsc --noEmit",
    "test": "cd apps/backend && npm test",
    "check:all": "npm run format && npm run lint:fix && npm run type-check && npm test"
  }
}
```

---

## ⚠️ Why Auto-run is Disabled

**Issue:** ESLint/Prettier auto-run causes VS Code to hang/freeze on large files.

**Solution:** 
- Tools are still installed and configured
- Run manually when needed (fast and reliable)
- Use pre-commit hooks for automated checks before git commit

---

## 🎓 Tips

1. **Run lint before commit:** `npx eslint . --fix`
2. **Format entire project weekly:** `npx prettier --write .`
3. **Type check continuously:** `npx tsc --noEmit --watch` (in separate terminal)
4. **Use git hooks:** They run automatically on commit/push (if not bypassed)

---

## 🔄 Re-enabling Auto-run (If Issues Fixed)

Edit `.vscode/settings.json`:

```json
{
  "eslint.enable": true,
  "typescript.validate.enable": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

Then **reload VS Code**.

---

**Last Updated:** November 8, 2025
