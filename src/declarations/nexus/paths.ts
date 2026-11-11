/**
 * Addresses of the console
 * @type {{ api: string, callback: string, done: string, csrfHeader: string }}
 */

export const NEXUS_PATHS = {
  api: '/api/nexus',
  callback: '/api/nexus/auth/discord/callback',
  done: '/nexus/return',
  csrfHeader: 'x-nexus-csrf',
} as const
