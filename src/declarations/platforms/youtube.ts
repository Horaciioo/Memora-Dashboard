import { readSecret } from '@/declarations/platforms/credentials'

/**
 * Google and YouTube endpoints
 * @type {Record<string, string>}
 */

export const YOUTUBE_ENDPOINTS = {
  authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  revoke: 'https://oauth2.googleapis.com/revoke',
  channels: 'https://www.googleapis.com/youtube/v3/channels',
} as const

/**
 * Scopes asked of a member, the only one opening chat moderation
 * @type {readonly string[]}
 */

export const YOUTUBE_SCOPES: readonly string[] = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
]

/**
 * Credentials of the Google application
 * @typedef {Object} YoutubeCredentials
 * @property {string | null} clientId - Application identifier
 * @property {string | null} clientSecret - Application secret
 * @property {string | null} redirectUri - Registered callback
 */

export interface YoutubeCredentials {
  clientId: string | null
  clientSecret: string | null
  redirectUri: string | null
}

/**
 * Credentials of the Google application
 * @type {YoutubeCredentials}
 */

export const YOUTUBE_CREDENTIALS: YoutubeCredentials = {
  clientId: readSecret(process.env.GOOGLE_CLIENT_ID),
  clientSecret: readSecret(process.env.GOOGLE_CLIENT_SECRET),
  redirectUri: readSecret(process.env.YOUTUBE_REDIRECT_URI),
}

/**
 * Whether the YouTube link can be offered
 * @return {boolean} - Configured
 */

export const isYoutubeConfigured = (): boolean =>
  Boolean(
    YOUTUBE_CREDENTIALS.clientId &&
    YOUTUBE_CREDENTIALS.clientSecret &&
    YOUTUBE_CREDENTIALS.redirectUri
  )
