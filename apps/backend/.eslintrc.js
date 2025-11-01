module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'prettier/prettier': ['error'],
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-undef': 'error'
  },
  overrides: [
    {
      files: [
        '**/__tests__/**/*.js',
        '**/*.test.js',
        '**/*.spec.js',
        '**/jest.config.js',
        '**/__tests__/setup.js'
      ],
      env: {
        jest: true,
        node: true
      }
    }
  ]
};
