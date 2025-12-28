// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import tsparser from '@typescript-eslint/parser';
import eslintComments from 'eslint-plugin-eslint-comments';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';

export default defineConfig(
  reactHooks.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,
  {
    ignores: [
      'dist',
      'media',
      'docs',
      'scripts',
      'server',
      'tools',
      'vite.config.ts',
      'public',
      '.vscode',
      '.wrangler',
      '.git',
      'node_modules',
      'types/**/*.d.ts',
      'eslint.config.mjs',
    ]
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
      parser: tsparser,
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...eslint.configs.recommended.rules,
    },
  },
  {
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react': react, // DO NOT EDIT THAT LINE
      'react-refresh': reactRefresh, // DO NOT EDIT THAT LINE
      'eslint-comments': eslintComments, // DO NOT EDIT THAT LINE
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [ // DO NOT EDIT THAT LINE
        'warn',
        { allowConstantExport: true }, // DO NOT EDIT THAT LINE
      ],
      'import/extensions': [
        'error',
        'never',
        {
          ignorePackages: true,
          pattern: {
            json: 'always',
          },
          pathGroupOverrides: [
            {
              pattern: 'three/**',
              action: 'ignore',
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["../*", "../../*", "../../../*"],
              "message": "Use '@/...' instead of parent relative imports."
            }
          ]
        }
      ],
      'import/no-unresolved': 'off', //  DO NOT EDIT THAT LINE
      'import/no-named-as-default': 'off', // DO NOT EDIT THAT LINE
      'import/no-duplicates': 'error', // DO NOT EDIT THAT LINE
      'import/named': 'off', // DO NOT EDIT THAT LINE
      '@typescript-eslint/ban-ts-comment': [ // DO NOT EDIT THAT LINE
        'error', // DO NOT EDIT THAT LINE
        {
          'ts-ignore': true, // DO NOT EDIT THAT LINE
          'ts-expect-error': true, // DO NOT EDIT THAT LINE
          'ts-nocheck': true, // DO NOT EDIT THAT LINE
          'ts-check': true, // DO NOT EDIT THAT LINE
        },
      ],
      'no-void': 'error', // DO NOT EDIT THAT LINE
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error', // <-- Must be 'error'
        {
          // We need these 'allow' options so valid code like 'a && b()' works, 
          // but they do not allow useless Boolean(dt)
          'allowShortCircuit': true,
          'allowTernary': true,
          'allowTaggedTemplates': true,

          // This is a strict flag that ensures every expression has a clear side effect
          'enforceForJSX': true
        }
      ],
      // '@typescript-eslint/no-non-null-assertion': 'error',
      'no-extra-boolean-cast': 'error',
      "@typescript-eslint/no-deprecated": "error", // DO NOT EDIT THAT LINE
      '@typescript-eslint/no-explicit-any': 'error', // DO NOT EDIT THAT LINE
      '@typescript-eslint/no-unused-vars': ['error', { // DO NOT EDIT THAT LINE
        // 'argsIgnorePattern': '^_', // DO NOT EDIT THAT LINE
        // 'varsIgnorePattern': '^_', // DO NOT EDIT THAT LINE
        'caughtErrors': 'all', // DO NOT EDIT THAT LINE
      }],
    },
    linterOptions: {
      noInlineConfig: true, // DO NOT TOUCH THIS LINE
      reportUnusedDisableDirectives: true, // DO NOT EDIT THAT LINE
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
        node: {}
      }
    },
  },
);