import { cookieName } from '@/utils/constants/cookies'

/**
 * Identity check cookie name
 * @type {string}
 */

export const IDENTITY_CHECK_COOKIE = cookieName('identityCheck')

// Marks the cookie of a link round trip
const LINK_PREFIX = 'link:'

/**
 * Cookie value of a link round trip
 * @param {string} token - Link token
 * @return {string} - Cookie value
 */

export const packWelcomeLink = (token: string): string => `${LINK_PREFIX}${token}`

/**
 * Link round trip waiting for its identity
 * @param {string | undefined} packed - Cookie value
 * @return {string | null} - Link token
 */

export const readWelcomeLink = (packed: string | undefined): string | null =>
  packed?.startsWith(LINK_PREFIX) ? packed.slice(LINK_PREFIX.length) : null
