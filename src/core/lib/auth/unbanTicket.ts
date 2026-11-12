import { ROUTES } from '@/declarations/navigation'
import { cookieName } from '@/utils/constants/cookies'

/**
 * Deban. ticket cookie name
 * @type {string}
 */

export const UNBAN_TICKET_COOKIE = cookieName('unbanTicket')

/**
 * Attributes of the Deban. ticket cookie
 * @param {number} maxAge - Lifetime in seconds
 * @return {Object} - Cookie options
 */

export const unbanCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: ROUTES.home,
  maxAge,
})
