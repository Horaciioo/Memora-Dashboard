import { readFileSync } from 'node:fs'

import type { NextConfig } from 'next'

import { stageOfBranch } from './scripts/versioning/versions'
import { STATIC_SECURITY_HEADERS } from './src/declarations/system/securityHeaders'
import { displayVersion } from './src/utils/format/version'

// Single version source
const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string }

// Branch decides the stage
const deployedBranch = process.env.APP_ENV || process.env.VERCEL_GIT_COMMIT_REF || ''

const nextConfig: NextConfig = {
  // Second dev server, own cache
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Exposed to the browser
  env: { NEXT_PUBLIC_APP_VERSION: displayVersion(version, stageOfBranch(deployedBranch)) },
  // The content security policy carries a per-request nonce, so it lives in the proxy
  headers: async () => [{ source: '/:path*', headers: STATIC_SECURITY_HEADERS }],
  experimental: {
    // Keeps .next small
    turbopackFileSystemCacheForDev: false,
  },
}

export default nextConfig
