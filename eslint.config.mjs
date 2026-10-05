import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

import commentStyle from './eslint-rules/comment-style.mjs'

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
  globalIgnores([
    '.next/**',
    '.next-*/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/generated/**',
  ]),
])

export default eslintConfig
