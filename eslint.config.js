import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  {
    files: ['server/**/*.ts', 'shared/**/*.ts', 'client/src/**/*.ts', 'client/src/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.client.json', './tsconfig.server.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        Buffer: 'readonly',
        randomBytes: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
];