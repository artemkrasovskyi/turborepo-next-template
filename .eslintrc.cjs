module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: ['airbnb', 'airbnb-typescript', 'prettier'],
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.eslint.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
      },
      node: true,
    },
  },
  rules: {
    'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/dot-notation': ['error', { allowIndexSignaturePropertyAccess: true }],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
      },
    ],
    'react/jsx-props-no-spreading': 'off',
  },
  ignorePatterns: ['node_modules/', '.next/', '.turbo/', 'dist/', 'next-env.d.ts'],
};
