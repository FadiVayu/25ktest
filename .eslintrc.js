module.exports = {
  root: true,
  env: {
      node: true
  },
  extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
  ],
  rules: {
      '@typescript-eslint/member-delimiter-style': [
          'warn',
          {
              multiline: {
                  delimiter: 'none',
                  requireLast: true
              },
              singleline: {
                  delimiter: 'semi',
                  requireLast: false
              }
          }
      ],
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
  },
  parserOptions: {
      parser: '@typescript-eslint/parser'
  }
}