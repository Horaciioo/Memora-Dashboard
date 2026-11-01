import { readFileSync } from 'node:fs'

import type { NextConfig } from 'next'

import { stageOfBranch } from './src/scripts/versioning/versions'
import {
  STATIC_SECURITY_HEADERS,
  WORKER_HEADERS,
} from './src/declarations/system/security/securityHeaders'
import { WORKER_FILE } from './src/declarations/pwa/worker'
import { displayVersion } from './src/utils/format/version'

// Single version source
const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string }

// Branch decides the stage
const deployedBranch = process.env.APP_ENV || ''

const nextConfig: NextConfig = {
  // No framework banner
  poweredByHeader: false,
  // Second dev server
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Exposed to the browser
  env: { NEXT_PUBLIC_APP_VERSION: displayVersion(version, stageOfBranch(deployedBranch)) },
  // The content security policy carries a per-request nonce
  headers: async () => [
    { source: '/:path*', headers: STATIC_SECURITY_HEADERS },
    // A stale worker would pin an old version
    { source: WORKER_FILE.script, headers: WORKER_HEADERS },
  ],
  experimental: {
    // Enables forbidden()
    authInterrupts: true,
    // Keeps .next small
    turbopackFileSystemCacheForDev: false,
  },
}

export default nextConfig
