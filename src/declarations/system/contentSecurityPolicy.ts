import { DISCORD_ENDPOINTS } from '@/declarations/access/discord'
import { APP_FONTS } from '@/declarations/app'

/**
 * Read the origin of one declared URL
 * @param {string} url - Absolute URL
 * @return {string} - Origin
 */

const originOf = (url: string): string => new URL(url).origin

/**
 * Optional URL origin
 * @param {string} [url] - Absolute URL
 * @return {string[]} - Origin, or nothing
 */

const optionalOrigin = (url?: string): string[] => {
  if (!url) return []

  try {
    return [new URL(url).origin]
  } catch {
    return []
  }
}

/**
 * Every origin the browser may reach, derived from what the app already declares
 * @type {{ images: string[], fonts: string[], styles: string[], connect: string[] }}
 */

const ALLOWED_ORIGINS = {
  images: [originOf(DISCORD_ENDPOINTS.cdn)],
  fonts: [...APP_FONTS.preconnect],
  styles: [originOf(APP_FONTS.stylesheet)],
  // The client SDK posts crash reports straight to the Sentry ingest host
  connect: optionalOrigin(process.env.NEXT_PUBLIC_SENTRY_DSN),
}

/**
 * Build the content security policy of one request
 * @param {string} nonce - Per-request nonce
 * @param {boolean} isDevelopment - Development server running
 * @return {string} - Policy header value
 */

export const buildContentSecurityPolicy = (nonce: string, isDevelopment: boolean): string => {
  // The dev server evaluates its own refresh runtime, production never does
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
  ]

  const directives = [
    ['default-src', "'self'"],
    ['script-src', ...scriptSources],
    ['style-src', "'self'", "'unsafe-inline'", ...ALLOWED_ORIGINS.styles],
    ['img-src', "'self'", 'data:', 'blob:', ...ALLOWED_ORIGINS.images],
    ['font-src', "'self'", 'data:', ...ALLOWED_ORIGINS.fonts],
    ['connect-src', "'self'", ...ALLOWED_ORIGINS.connect],
    ['frame-ancestors', "'none'"],
    ['base-uri', "'self'"],
    ['form-action', "'self'"],
    ['object-src', "'none'"],
    ['manifest-src', "'self'"],
  ]

  const policy = directives.map((parts) => parts.join(' ')).join('; ')

  // Upgrading only makes sense once the deployment actually serves HTTPS
  return isDevelopment ? policy : `${policy}; upgrade-insecure-requests`
}
