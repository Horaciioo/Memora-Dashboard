import { PlatformError } from '@/core/lib/platforms/http'
import { TIMEOUT_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Tokens a platform handed over
 * @typedef {Object} PlatformGrant
 * @property {string} accessToken - Bearer token
 * @property {string} refreshToken - Renewal token
 * @property {string[]} scopes - Scopes granted
 * @property {Date} expiresAt - Access token end
 */

export interface PlatformGrant {
  accessToken: string
  refreshToken: string
  scopes: string[]
  expiresAt: Date
}

/**
 * Who a grant belongs to
 * @typedef {Object} PlatformIdentity
 * @property {string} id - Platform user identifier
 * @property {string} login - Login shown in the account address
 * @property {string} displayName - Display name
 */

export interface PlatformIdentity {
  id: string
  login: string
  displayName: string
}

/**
 * Post a token form and read the grant
 * @param {string} endpoint - Token endpoint
 * @param {Record<string, string>} form - Form fields
 * @return {Promise<PlatformGrant>} - Grant
 */

export const postGrant = async (
  endpoint: string,
  form: Record<string, string>
): Promise<PlatformGrant> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_SETTINGS.externalMs),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(form),
  })
  const payload = (await response.json().catch(() => null)) as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    // A list for Twitch, a spaced string for Google
    scope?: string[] | string
    message?: string
    error_description?: string
  } | null

  if (!response.ok || !payload?.access_token || !payload.refresh_token) {
    throw new PlatformError(
      response.status,
      payload?.message ?? payload?.error_description ?? 'grant refused'
    )
  }

  const scopes =
    typeof payload.scope === 'string' ? payload.scope.split(' ').filter(Boolean) : payload.scope

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    scopes: scopes ?? [],
    expiresAt: new Date(Date.now() + (payload.expires_in ?? 0) * 1000),
  }
}
