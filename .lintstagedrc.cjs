/**
 * lint-staged configuration
 * Keeps staged files clean before commit without running full-project lint.
 */
module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  'package.json': ['prettier --write'],
};
