import internxtConfig from '@internxt/eslint-config-internxt';
import pluginImport from 'eslint-plugin-import';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginSonarjs from 'eslint-plugin-sonarjs';
import pluginQuery from '@tanstack/eslint-plugin-query';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...internxtConfig,
  {
    ignores: ['**/assets.d.ts', 'node_modules/**', '**/schema.ts', 'dist/**', 'build/**'],
  },
  {
    plugins: {
      import: pluginImport,
      unicorn: pluginUnicorn,
      react: pluginReact,
      prettier: pluginPrettier,
      'simple-import-sort': pluginSimpleImportSort,
      sonarjs: pluginSonarjs,
      '@tanstack/query': pluginQuery,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unused-expressions': 'error',
      'array-callback-return': 'warn',
      'import/no-default-export': 'warn',
      'max-len': ['error', { code: 140, ignoreStrings: true, ignoreTemplateLiterals: true }],
      'no-async-promise-executor': 'warn',
      'no-await-in-loop': 'off',
      'no-empty': 'off',
      'no-extra-boolean-cast': 'error',
      'no-throw-literal': 'error',
      'no-unused-expressions': 'off',
      'no-use-before-define': ['warn', { functions: false }],
      'object-shorthand': 'error',
      'require-await': 'warn',
      'sonarjs/array-callback-without-return': 'off',
      'sonarjs/cognitive-complexity': 'warn',
      'sonarjs/different-types-comparison': 'warn',
      'sonarjs/no-empty-collection': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/no-ignored-exceptions': 'error',
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/no-nested-functions': 'warn',
      'sonarjs/no-os-command-from-path': 'off',
      'sonarjs/no-redundant-optional': 'off',
      'sonarjs/no-selector-parameter': 'off',
      'sonarjs/no-small-switch': 'off',
      'sonarjs/no-useless-intersection': 'warn',
      'sonarjs/prefer-read-only-props': 'off',
      'sonarjs/pseudo-random': 'warn',
      'sonarjs/public-static-readonly': 'warn',
      'sonarjs/redundant-type-aliases': 'off',
      'sonarjs/slow-regex': 'off',
      'sonarjs/todo-tag': 'off',
      'unicorn/filename-case': ['warn', { case: 'kebabCase' }],
      'unicorn/prefer-global-this': 'warn',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-string-raw': 'warn',
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'block' },
        { blankLine: 'always', prev: '*', next: 'class' },
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: 'multiline-expression', next: 'multiline-expression' },
      ],
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.test.*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'sonarjs/assertions-in-tests': 'off',
      'sonarjs/constructor-for-side-effects': 'off',
      'sonarjs/function-return-type': 'off',
      'sonarjs/no-empty-test-file': 'off',
      'sonarjs/os-command': 'off',
    },
  }
);
