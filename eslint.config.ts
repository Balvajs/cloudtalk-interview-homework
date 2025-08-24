import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { flatConfigs as importPlugin } from 'eslint-plugin-import-x';
import nodePlugin from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  /**
   * Common plugin and rules
   */
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  stylistic.configs.recommended,
  unicorn.configs.recommended,
  {
    rules: {
      /**
       * Stylistic rules colliding with Prettier
       */
      '@stylistic/semi': 'off',
      '@stylistic/member-delimiter-style': 'off',
      '@stylistic/arrow-parens': 'off',
      '@stylistic/operator-linebreak': 'off',

      // adjust abbreviations config to reflect industry standards
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            // this is common abbreviation for request and is almost universally understood
            req: true,
            // this is common abbreviation for response and is almost universally understood
            res: true,
          },
        },
      ],
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports.
            [String.raw`^\u0000`],
            // Node.js builtins prefixed with `node:`.
            ['^node:'],
            // Packages.
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
            [String.raw`^@?\w`],
            // Absolute imports and other imports such as Vue-style `@/foo`.
            // Anything not matched in another group.
            ['^'],
            // Parent imports
            [String.raw`^\.\.`],
            // Relative imports.
            // Anything that starts with a single dot.
            [String.raw`^\.(?=.*/)`],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  /**
   * Backend specific plugins and rules
   */
  { files: ['backend/**'], ...nodePlugin.configs['flat/recommended-module'] },
  { files: ['backend/**'], ...importPlugin.recommended },
  { files: ['backend/**'], ...importPlugin.typescript },
  {
    files: ['backend/**'],
    rules: {
      // handled by unicorn/no-process-exit
      'n/no-process-exit': 'off',
      // make sure that the .ts file extension is always present
      'import-x/extensions': [
        'error',
        'always',
        {
          ignorePackages: true,
          checkTypeImports: true,
          fix: true,
          pattern: {
            '': 'never',
            '.js': 'never',
            '.ts': 'always',
          },
        },
      ],
      'import-x/newline-after-import': 'error',
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    },
  },
);
