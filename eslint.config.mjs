import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

import commentStyle from './src/scripts/lint/comment-style.mjs'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Comment convention
  {
    plugins: { local: commentStyle },
    rules: {
      'local/no-decorative-separators': 'error',
      'local/jsdoc-structure': 'warn',
    },
  },
  // Rules the code-style skill promises
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: 'TSEnumDeclaration', message: 'Use an as const object, see skill code-style.' },
      ],
    },
  },
  // Viewport prefetch floods requests
  {
    ignores: ['src/components/elements/navigation/AppLink.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [{ name: 'next/link', message: 'Use AppLink, it prefetches on intent only.' }] },
      ],
    },
  },
  // The console runs nothing it was not written to run
  {
    files: [
      'src/**/nexus/**/*.{ts,tsx}',
      'src/core/wrappers/requireNexus.ts',
      'src/declarations/nexus/**/*.ts',
    ],
    rules: {
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
      'no-restricted-properties': [
        'error',
        { property: '$queryRawUnsafe', message: 'No free SQL in the console.' },
        { property: '$executeRawUnsafe', message: 'No free SQL in the console.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: ['child_process', 'node:child_process', 'vm', 'node:vm', 'worker_threads'].map(
            (name) => ({ name, message: 'The console never spawns or evaluates.' })
          ),
        },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: 'TSEnumDeclaration', message: 'Use an as const object, see skill code-style.' },
        {
          selector: "ImportExpression[source.type!='Literal']",
          message: 'No import with a computed path.',
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    '.next-*/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/generated/**',
    // Built by yarn worker:build
    'public/sw.js',
  ]),
])

export default eslintConfig
