import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

// Service worker bundle, served from public/
export default defineConfig({
  resolve: { tsconfigPaths: true },
  publicDir: false,
  build: {
    outDir: fileURLToPath(new URL('../../public', import.meta.url)),
    emptyOutDir: false,
    target: 'es2020',
    minify: true,
    lib: {
      entry: fileURLToPath(new URL('./sw.ts', import.meta.url)),
      formats: ['iife'],
      name: 'memoraWorker',
      fileName: () => 'sw.js',
    },
  },
})
