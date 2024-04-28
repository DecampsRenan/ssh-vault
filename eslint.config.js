import * as eslintrc from '@eslint/eslintrc';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default [
  eslintPluginUnicorn.configs['flat/recommended'],
  {
    rules: {
      'unicorn/better-regex': 'warn',
    },
  },
];
