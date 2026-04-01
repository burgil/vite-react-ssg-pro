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

// Compatibility shim for @typescript-eslint/no-deprecated which crashes in ESLint 10
// due to context.parserOptions being undefined.
const compatibilityPlugin = {
  rules: {
    'no-deprecated': {
      ... /** @type {any} */ (tseslint.plugin).rules['no-deprecated'],
      create(/** @type {any} */ context, /** @type {any[]} */ ...args) {
        const proxyContext = new Proxy(context, {
          get(target, prop) {
            if (prop === 'parserOptions') {
              return target.parserOptions || target.languageOptions?.parserOptions || {};
            }
            return target[prop];
          },
        });
        return /** @type {any} */ (tseslint.plugin).rules['no-deprecated'].create(proxyContext, ...args);
      },
    },
  },
};

export default defineConfig(
  {
    ignores: [
      'dist',
      'media',
      // 'functions',
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
      'eslint.config.mjs'
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parser: tsparser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react': react,
      'react-hooks': /** @type {any} */ (reactHooks),
      'react-refresh': reactRefresh,
      'eslint-comments': eslintComments,
      'import': importPlugin,
      'compat': compatibilityPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...importPlugin.flatConfigs.recommended.rules,
      'compat/no-deprecated': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'import/extensions': [
        'error',
        'never',
        {
          ignorePackages: true,
          pattern: {
            json: 'always',
            css: 'always',
          },
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
      'import/no-unresolved': 'off',
      'import/no-named-as-default': 'off',
      'import/no-duplicates': 'error',
      'import/named': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-expect-error': true,
          'ts-nocheck': true,
          'ts-check': true,
        },
      ],
      'no-void': 'error',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          'allowShortCircuit': true,
          'allowTernary': true,
          'allowTaggedTemplates': true,
          'enforceForJSX': true
        }
      ],
      'no-extra-boolean-cast': 'error',
      // "@typescript-eslint/no-deprecated": "error", // Using patched version via compat/no-deprecated
      '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-vars': ['error', {
        'caughtErrors': 'all',
      }],
    },
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: true,
    },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
      parser: tsparser,
    },
    rules: {
      ...eslint.configs.recommended.rules,
    },
  },
);