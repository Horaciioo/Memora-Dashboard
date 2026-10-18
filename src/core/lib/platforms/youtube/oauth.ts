import { postGrant } from '@/core/lib/platforms/grant'
import type { PlatformGrant, PlatformIdentity } from '@/core/lib/platforms/grant'
import { PlatformError, platformRequest } from '@/core/lib/platforms/http'
import { TIMEOUT_SETTINGS } from '@/declarations/configurations/settings'
import {
  YOUTUBE_CREDENTIALS,
  YOUTUBE_ENDPOINTS,
  YOUTUBE_SCOPES,
} from '@/declarations/platforms/youtube'

/**
 * Credentials
 * @return {{ clientId: string, clientSecret: string, redirectUri: string }} - Credentials
 */

const requireCredentials = () => {
  const { clientId, clientSecret, redirectUri } = YOUTUBE_CREDENTIALS
  if (!clientId || !clientSecret || !redirectUri) {
    throw new PlatformError(0, 'google application not configured')
  }

  return { clientId, clientSecret, redirectUri }
}

/**
 * Where to send the member to grant access
 * @param {string} state - Anti-forgery token
 * @return {string} - Authorization URL
 */

export const buildYoutubeAuthorizeUrl = (state: string): string => {
  const { clientId, redirectUri } = requireCredentials()
  const url = new URL(YOUTUBE_ENDPOINTS.authorize)

  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_SCOPES.join(' '),
    state,
    // Offline access hands over the renewal token
    access_type: 'offline',
    // The member picks the account each time and Google always sends the renewal token
    prompt: 'consent select_account',
  }).toString()

  return url.toString()
}

/**
 * Trade an authorization code for a grant
 * @param {string} code - Authorization code
 * @return {Promise<PlatformGrant>} - Grant
 */

export const exchangeYoutubeCode = (code: string): Promise<PlatformGrant> => {
  const { clientId, clientSecret, redirectUri } = requireCredentials()

  return postGrant(YOUTUBE_ENDPOINTS.token, {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })
}

/**
 * Give a token back to Google
 * @param {string} token - Token to revoke
 * @return {Promise<void>} - Revoked
 */

export const revokeYoutubeToken = async (token: string): Promise<void> => {
  await fetch(YOUTUBE_ENDPOINTS.revoke, {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_SETTINGS.externalMs),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }),
  }).catch(() => null)
}

/**
 * Read the channel a token belongs to
 * @param {string} accessToken - Bearer token
 * @return {Promise<PlatformIdentity>} - Channel
 */

export const readYoutubeChannel = async (accessToken: string): Promise<PlatformIdentity> => {
  const url = new URL(YOUTUBE_ENDPOINTS.channels)
  url.search = new URLSearchParams({ part: 'snippet', mine: 'true' }).toString()

  const answer = await platformRequest<{
    items?: { id: string; snippet?: { title?: string; customUrl?: string } }[]
  }>({
    url: url.toString(),
    headers: { authorization: `Bearer ${accessToken}` },
    bucket: 'youtube:identify',
  })
  const channel = answer?.items?.[0]
  // A Google account can exist without any channel
  if (!channel) throw new PlatformError(404, 'no channel behind the token')

  return {
    id: channel.id,
    login: channel.snippet?.customUrl?.replace(/^@/, '') ?? channel.id,
    displayName: channel.snippet?.title ?? channel.id,
  }
}
