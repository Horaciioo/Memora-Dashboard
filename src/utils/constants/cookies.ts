/**
 * Cookie key mapping
 * @type {Record<string, string>}
 */

export const CookieKeys = {
  session: 'session',
} as const

export type CookieKey = keyof typeof CookieKeys

// Cookie name prefix
export const CookiePrefix = 'template_'
