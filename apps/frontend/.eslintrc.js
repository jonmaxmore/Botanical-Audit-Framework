module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@next/next/no-page-custom-font': 'off',
    'react/no-unescaped-entities': 'off'
  },
  overrides: [
    {
      files: ['components/gacp/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        ]
      }
    }
  ]
};
