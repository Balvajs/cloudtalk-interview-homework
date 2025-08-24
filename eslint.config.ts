import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import nodePlugin from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  stylistic.configs.recommended,
  unicorn.configs.recommended,
  { files: ['backend/**'], ...nodePlugin.configs['flat/recommended-module'] },
  {
    rules: {
      // collides with Prettier
      '@stylistic/semi': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            // this is common abbreviation for request and is almost universally understood
            req: true,
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
);
