import { postGrant } from '@/core/lib/platforms/grant'
import type { PlatformGrant, PlatformIdentity } from '@/core/lib/platforms/grant'
import { PlatformError, platformRequest } from '@/core/lib/platforms/http'
import { TIMEOUT_SETTINGS } from '@/declarations/configurations/settings'
import {
  HELIX_PATHS,
  TWITCH_CREDENTIALS,
  TWITCH_ENDPOINTS,
  TWITCH_SCOPES,
} from '@/declarations/platforms/twitch'
import { MINUTE_MS } from '@/utils/constants/time'

// Shared shapes of a platform link
export type TwitchGrant = PlatformGrant
export type TwitchIdentity = PlatformIdentity

/**
 * Credentials
 * @return {{ clientId: string, clientSecret: string, redirectUri: string }} - Credentials
 */

const requireCredentials = () => {
  const { clientId, clientSecret, redirectUri } = TWITCH_CREDENTIALS
  if (!clientId || !clientSecret || !redirectUri) {
    throw new PlatformError(0, 'twitch application not configured')
  }

  return { clientId, clientSecret, redirectUri }
}

/**
 * Headers of a Helix call
 * @param {string} accessToken - Bearer token
 * @return {Record<string, string>} - Headers
 */

export const helixHeaders = (accessToken: string): Record<string, string> => ({
  authorization: `Bearer ${accessToken}`,
  'client-id': requireCredentials().clientId,
})

/**
 * Where to send the moderator to grant access
 * @param {string} state - Anti-forgery token
 * @return {string} - Authorization URL
 */

export const buildTwitchAuthorizeUrl = (state: string): string => {
  const { clientId, redirectUri } = requireCredentials()
  const url = new URL(TWITCH_ENDPOINTS.authorize)

  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: TWITCH_SCOPES.join(' '),
    state,
    // The member picks the account each time
    force_verify: 'true',
  }).toString()

  return url.toString()
}

/**
 * Post a token form
 * @param {Record<string, string>} form - Form fields
 * @return {Promise<TwitchGrant>} - Grant
 */

const postToken = (form: Record<string, string>): Promise<TwitchGrant> =>
  postGrant(TWITCH_ENDPOINTS.token, form)

/**
 * Trade an authorization code for a grant
 * @param {string} code - Authorization code
 * @return {Promise<TwitchGrant>} - Grant
 */

export const exchangeTwitchCode = (code: string): Promise<TwitchGrant> => {
  const { clientId, clientSecret, redirectUri } = requireCredentials()

  return postToken({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })
}

/**
 * Renew an expiring grant
 * @param {string} refreshToken - Renewal token
 * @return {Promise<TwitchGrant>} - Grant
 */

export const refreshTwitchGrant = (refreshToken: string): Promise<TwitchGrant> => {
  const { clientId, clientSecret } = requireCredentials()

  return postToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
}

/**
 * Give a token back to Twitch
 * @param {string} accessToken - Token to revoke
 * @return {Promise<void>} - Revoked
 */

export const revokeTwitchToken = async (accessToken: string): Promise<void> => {
  const { clientId } = requireCredentials()

  await fetch(TWITCH_ENDPOINTS.revoke, {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_SETTINGS.externalMs),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, token: accessToken }),
  }).catch(() => null)
}

/**
 * Read who a token belongs to
 * @param {string} accessToken - Bearer token
 * @return {Promise<TwitchIdentity>} - Identity
 */

export const readTwitchUser = async (accessToken: string): Promise<TwitchIdentity> => {
  const answer = await platformRequest<{
    data: { id: string; login: string; display_name: string }[]
  }>({
    url: `${TWITCH_ENDPOINTS.helix}${HELIX_PATHS.users}`,
    headers: helixHeaders(accessToken),
    bucket: 'twitch:identify',
  })
  const user = answer?.data[0]
  if (!user) throw new PlatformError(401, 'no user behind the token')

  return { id: user.id, login: user.login, displayName: user.display_name }
}

// App token
let appToken: { value: string; expiresAt: number } | null = null

/**
 * Application token
 * @return {Promise<string>} - Bearer token
 */

export const readTwitchAppToken = async (): Promise<string> => {
  if (appToken && appToken.expiresAt - Date.now() > MINUTE_MS) return appToken.value

  const { clientId, clientSecret } = requireCredentials()
  const response = await fetch(TWITCH_ENDPOINTS.token, {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_SETTINGS.externalMs),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })
  const payload = (await response.json().catch(() => null)) as {
    access_token?: string
    expires_in?: number
  } | null
  if (!response.ok || !payload?.access_token)
    throw new PlatformError(response.status, 'app token refused')

  appToken = {
    value: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 0) * 1000,
  }

  return appToken.value
}

/**
 * Find a Twitch user by login, or by identifier
 * @param {string} value - Login or identifier
 * @param {'login' | 'id'} [by] - What the value is
 * @return {Promise<TwitchIdentity | null>} - User
 */

export const findTwitchUser = async (
  value: string,
  by: 'login' | 'id' = 'login'
): Promise<TwitchIdentity | null> => {
  const token = await readTwitchAppToken()
  const url = new URL(`${TWITCH_ENDPOINTS.helix}${HELIX_PATHS.users}`)
  url.search = new URLSearchParams({ [by]: value.trim().toLowerCase() }).toString()

  const answer = await platformRequest<{
    data: { id: string; login: string; display_name: string }[]
  }>({ url: url.toString(), headers: helixHeaders(token), bucket: 'twitch:app' })
  const user = answer?.data[0]

  return user ? { id: user.id, login: user.login, displayName: user.display_name } : null
}
