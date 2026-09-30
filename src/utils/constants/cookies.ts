/**
 * Cookie key mapping
 * @type {Record<string, string>}
 */

export const CookieKeys = {
  session: 'session',
  oauthState: 'oauth_state',
  integrationClaim: 'integration_claim',
  navigationView: 'navigation_view',
  activeYoutuber: 'active_youtuber',
} as const

export type CookieKey = keyof typeof CookieKeys

// Cookie name prefix
export const CookiePrefix = 'memora_'

/**
 * Build a namespaced cookie name
 * @param {CookieKey} key - Cookie key
 * @return {string} - Prefixed name
 */

export const cookieName = (key: CookieKey): string => `${CookiePrefix}${CookieKeys[key]}`
