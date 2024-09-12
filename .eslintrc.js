module.exports = {
  root: true,
  extends: ['opencourier', 'plugin:@next/next/recommended'],
  parserOptions: {
    project: true,
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.eslintrc.js', '*.config.js', '*.config.ts', '**/*.spec.ts'],
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
}
