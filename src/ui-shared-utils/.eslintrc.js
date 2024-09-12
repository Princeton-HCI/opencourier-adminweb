module.exports = {
  root: true,
  extends: ['opencourier'],
  parserOptions: {
    project: true,
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.eslintrc.js', '*.config.js', '*.config.ts'],
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
}
