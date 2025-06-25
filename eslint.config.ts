import eslint from '@eslint/js';
import astro from 'eslint-plugin-astro';
import * as mdx from 'eslint-plugin-mdx';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwind from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ignoreConfig = tseslint.config({
  ignores: [
    '**/node_modules/**',
    '**/.output/**',
    '.env',
    '**/dist/**',
    '**/*.d.ts',
    '**/.astro/**',
  ],
});

const baseConfig = tseslint.config({
  extends: [tseslint.configs.recommended, eslint.configs.recommended],
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Packages
          ['^@?\\w'],

          // Relative imports
          ['^\\$|^@(?!\\w)|^\\.\\.?/'],

          // Media and font imports
          ['^.+\\.(png|jpg|jpeg|gif|svg|ico|webp|avif|mp4|webm|woff|woff2|ttf|otf)$'],

          // Side effect imports (CSS)
          ['^.+\\.(css|scss|sass|less|styl)$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
  },
});

const astroConfig = tseslint.config(
  {
    files: ['**/*.astro'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      'astro/jsx-a11y/anchor-ambiguous-text': ['error'],
      'astro/jsx-a11y/lang': ['error'],
      'astro/semi': ['error', 'always'],
    },
  },

  {
    files: ['**/*.astro'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended']
);

const reactConfig = tseslint.config({
  files: ['**/*.{js,jsx,ts,tsx}'],

  ...react.configs.flat.recommended,
  ...react.configs.flat['jsx-runtime'],
  languageOptions: {
    ...react.configs.flat.recommended.languageOptions,
    globals: {
      ...globals.browser,
    },
  },

  plugins: { 'react-hooks': reactHooks },
  settings: { react: { version: 'detect' } },

  rules: {
    ...reactHooks.configs.recommended.rules,
  },
});

const mdxConfig = tseslint.config({
  files: ['**/*.mdx'],
  ...mdx.flat,
  languageOptions: {
    ...mdx.flat.languageOptions,
    globals: {
      ...globals.browser,
    },
  },
  processor: mdx.createRemarkProcessor({
    lintCodeBlocks: true,
  }),
  rules: {
    ...mdx.flat.rules,

    // MDX can't detect component usage in content
    '@typescript-eslint/no-unused-vars': 'off',
  },
});

export default tseslint.config(
  ignoreConfig,
  baseConfig,
  astroConfig,
  reactConfig,
  mdxConfig,

  tailwind.configs['flat/recommended']
);
