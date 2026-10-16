/**
 * Header carrying the per-request nonce from the proxy to the document
 * @type {string}
 */

export const NONCE_HEADER = 'x-nonce'

// One year
const HSTS_MAX_AGE = 63_072_000

/**
 * Headers applied to every response
 * @type {{ key: string, value: string }[]}
 */

export const STATIC_SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: `max-age=${HSTS_MAX_AGE}; includeSubDomains` },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]
