import { AUTH_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Discord endpoints the sign-in flow talks to
 * @type {Record<string, string>}
 */

export const DISCORD_ENDPOINTS = {
  authorize: 'https://discord.com/oauth2/authorize',
  token: 'https://discord.com/api/oauth2/token',
  user: 'https://discord.com/api/v10/users/@me',
  cdn: 'https://cdn.discordapp.com',
} as const

/**
 * Scopes asked for, kept to the strict minimum
 * @type {string[]}
 */

export const DISCORD_SCOPES = ['identify']

/**
 * Proof key exchange parameters
 * @type {{ method: string, verifierBytes: number, stateBytes: number }}
 */

export const DISCORD_PKCE = {
  method: 'S256',
  verifierBytes: 48,
  stateBytes: 32,
}

/**
 * What an incoming Discord webhook is checked against
 * @type {{ signatureHeader: string, timestampHeader: string, toleranceSeconds: number, derPrefix: string }}
 */

export const DISCORD_WEBHOOK = {
  signatureHeader: 'x-signature-ed25519',
  timestampHeader: 'x-signature-timestamp',
  toleranceSeconds: 300,
  // SubjectPublicKeyInfo header of a raw Ed25519 key
  derPrefix: '302a300506032b6570032100',
}

/**
 * Credentials of the Discord application
 * @typedef {Object} DiscordCredentials
 * @property {string | null} clientId - Application identifier
 * @property {string | null} clientSecret - Application secret
 * @property {string | null} redirectUri - Registered callback
 */

export interface DiscordCredentials {
  clientId: string | null
  clientSecret: string | null
  redirectUri: string | null
}

/**
 * Read one environment value, empty becoming absent
 * @param {string | undefined} raw - Environment value
 * @return {string | null} - Trimmed value
 */

const readSecret = (raw: string | undefined): string | null => {
  const value = raw?.trim() ?? ''

  return value.length > 0 ? value : null
}

/**
 * Discord application credentials, never written in a configuration file
 * @type {DiscordCredentials}
 */

export const DISCORD_CREDENTIALS: DiscordCredentials = {
  clientId: readSecret(process.env.DISCORD_CLIENT_ID),
  clientSecret: readSecret(process.env.DISCORD_CLIENT_SECRET),
  redirectUri: readSecret(process.env.DISCORD_REDIRECT_URI),
}

/**
 * Public key the application verifies incoming webhooks with
 * @type {string | null}
 */

export const DISCORD_PUBLIC_KEY = readSecret(process.env.DISCORD_PUBLIC_KEY)

/**
 * Check the application is wired
 * @return {boolean} - Sign-in through Discord is possible
 */

export const isDiscordConfigured = (): boolean =>
  DISCORD_CREDENTIALS.clientId !== null &&
  DISCORD_CREDENTIALS.clientSecret !== null &&
  DISCORD_CREDENTIALS.redirectUri !== null

/**
 * Build the portrait served by the Discord CDN
 * @param {string} discordId - Member identifier
 * @param {string | null} avatarHash - Portrait hash
 * @return {string | null} - Portrait URL
 */

export const discordAvatarUrl = (discordId: string, avatarHash: string | null): string | null => {
  if (!avatarHash) return null

  // An animated portrait keeps its extension, a still one is served as PNG
  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png'

  return `${DISCORD_ENDPOINTS.cdn}/avatars/${discordId}/${avatarHash}.${extension}?size=${AUTH_SETTINGS.avatarSize}`
}
