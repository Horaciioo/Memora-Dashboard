/**
 * Addresses of the console
 * @type {Record<string, string>}
 */

export const NEXUS_PATHS = {
  api: '/api/nexus',
  callback: '/api/nexus/auth/discord/callback',
  done: '/nexus/return',
  csrfHeader: 'x-nexus-csrf',
  commands: '/api/nexus/commands',
  registry: '/api/nexus/commands/registry',
  session: '/api/nexus/session',
  password: '/api/nexus/auth/password',
  reauth: '/api/nexus/auth/reauth',
  discord: '/api/nexus/auth/discord',
} as const
