/**
 * 🌿 Botanical-Audit-Framework
 * ESLint Configuration — Multi-Profile (Production / Dev / Test)
 *
 * ────────────────────────────────────────────
 * Profiles:
 *  1️⃣ Production – strict rules, no console/debugger
 *  2️⃣ Development – allows console/debugger for local debug
 *  3️⃣ Test – jest environment, relaxed rules
 *
 * Rules auto-applied by NODE_ENV:
 *  NODE_ENV=production → production
 *  NODE_ENV=development → dev
 *  NODE_ENV=test → test
 */

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
  globals: {
    // Node.js globals
    Buffer: 'readonly',
    console: 'readonly',
    global: 'readonly',
    process: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    // Timer functions
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    setImmediate: 'readonly',
    clearImmediate: 'readonly',
    // Web APIs available in Node
    URL: 'readonly',
    URLSearchParams: 'readonly',
    Intl: 'readonly',
    // Performance API
    performance: 'readonly',
    // Fetch API (Node 18+)
    fetch: 'readonly',
  },
  rules: {
    // ─────────────── Base Rules ───────────────
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',

    // ─────────────── Environment-specific Rules ───────────────
    'no-console': isProd ? 'error' : 'off',
    'no-debugger': isProd ? 'error' : 'off',

    // ─────────────── Best Practice Rules ───────────────
    eqeqeq: ['error', 'always'],
    curly: 'error',
    'prefer-const': 'warn',
    'no-trailing-spaces': 'warn',
    semi: ['error', 'always'],
  },
  overrides: [
    // ─────────────── Test Files (Relaxed Rules) ───────────────
    {
      files: [
        '**/__tests__/**/*.js',
        '**/__tests__/**/*.ts',
        '**/*.test.ts',
        '**/*.test.js',
        '**/*.spec.js',
        '**/*.spec.ts',
      ],
      env: {
        jest: true,
        node: true,
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        console: 'readonly', // Explicitly allow console in tests
      },
      rules: {
        'no-console': 'off',
        'no-undef': 'off',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
    // ─────────────── Development Overrides ───────────────
    {
      files: ['**/*.dev.js', '**/*.dev.ts'],
      rules: {
        'no-console': 'off',
        'no-debugger': 'off',
      },
    },
    // ─────────────── TypeScript Files ───────────────
    {
      files: ['**/*.ts'],
      parserOptions: {
        project: null, // Don't require tsconfig for basic parsing
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'build/',
    'coverage/',
    'node_modules/',
    '**/*.config.js',
    '**/*.spec.js',
    '**/*.spec.ts',
  ],
};
