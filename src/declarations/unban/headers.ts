/**
 * Public address of a creator's Deban. form, /<creator>/contest
 * @type {RegExp}
 */

export const UNBAN_CONTEST_PATH = /^\/[a-z0-9-]+\/contest$/

/**
 * Pages a stranger opens, never cached nor leaking the origin
 * @type {{ prefix: string, headers: Record<string, string> }}
 */

export const UNBAN_PRIVATE_PAGES = {
  prefix: '/unban/',
  headers: {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  },
} as const
