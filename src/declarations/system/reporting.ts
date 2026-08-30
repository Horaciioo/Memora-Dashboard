/**
 * Property names whose value never leaves the server
 * @type {string[]}
 */

export const SCRUBBED_KEYS = [
  'token',
  'secret',
  'password',
  'authorization',
  'cookie',
  'email',
  'phone',
  'birthday',
  'discordid',
  'displayname',
  'username',
  'avatar',
  'body',
  'reason',
  'note',
  'review',
  'summary',
]

/**
 * Error reporting bounds
 * @type {{ tracesSampleRate: number, scrubDepth: number, redaction: string }}
 */

export const SENTRY_SETTINGS = {
  tracesSampleRate: 0.1,
  scrubDepth: 6,
  redaction: '[redacted]',
}
