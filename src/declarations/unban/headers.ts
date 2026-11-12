/**
 * Pages of a link a stranger holds
 * @type {{ prefix: string, headers: Record<string, string> }}
 */

export const UNBAN_PRIVATE_PAGES = {
  prefix: '/unban/',
  headers: {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  },
} as const
