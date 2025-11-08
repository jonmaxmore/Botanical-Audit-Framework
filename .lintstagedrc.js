/**
 * Lint-Staged Configuration
 * Runs linting/formatting only on staged files before commit
 */

export default {
  // JavaScript/TypeScript files
  '*.{js,ts}': ['eslint --fix', 'prettier --write'],

  // Config files, Markdown, YAML
  '*.{json,md,yml,yaml}': ['prettier --write'],

  // Package.json (special handling)
  'package.json': ['prettier --write'],
};
