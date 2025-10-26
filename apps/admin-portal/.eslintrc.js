module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-undef': 'error',
    '@next/next/no-html-link-for-pages': 'off',
  },
  ignorePatterns: ['node_modules/', '.next/', 'dist/'],
};
