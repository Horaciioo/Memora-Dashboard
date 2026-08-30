import type { NextConfig } from 'next'

import { STATIC_SECURITY_HEADERS } from './src/declarations/system/securityHeaders'

const nextConfig: NextConfig = {
  // The content security policy carries a per-request nonce, so it lives in the proxy
  headers: async () => [{ source: '/:path*', headers: STATIC_SECURITY_HEADERS }],
}

export default nextConfig
