import 'server-only'

import { prisma } from '@/core/lib/db'
import { decryptSecret, encryptSecret } from '@/core/lib/crypto'
import { notAuthenticated } from '@/core/lib/errors'
import { deriveChallenge } from '@/core/lib/auth/oauthState'
import { isDiscordId } from '@/core/lib/auth/session'
import {
  DISCORD_CREDENTIALS,
  DISCORD_ENDPOINTS,
  DISCORD_PKCE,
  DISCORD_SCOPES,
} from '@/declarations/access/discord'
import { SIGN_IN_ERRORS } from '@/declarations/access/signIn'

/**
 * Grant returned by the token endpoint
 * @typedef {Object} DiscordGrant
 * @property {string} accessToken - Bearer token
 * @property {string} refreshToken - Renewal token
 * @property {string} scope - Granted scopes
 * @property {Date} expiresAt - Bearer expiry
 */

export interface DiscordGrant {
  accessToken: string
  refreshToken: string
  scope: string
  expiresAt: Date
}

/**
 * Identity read from the Discord API
 * @typedef {Object} DiscordIdentity
 * @property {string} id - Member identifier
 * @property {string} username - Handle
 * @property {string | null} avatar - Portrait hash
 * @property {string | null} globalName - Display name
 */

export interface DiscordIdentity {
  id: string
  username: string
  avatar: string | null
  globalName: string | null
}

/**
 * Read the credentials or refuse to start the flow
 * @return {{ clientId: string, clientSecret: string, redirectUri: string }} - Credentials
 */

const requireCredentials = (): { clientId: string; clientSecret: string; redirectUri: string } => {
  const { clientId, clientSecret, redirectUri } = DISCORD_CREDENTIALS
  if (!clientId || !clientSecret || !redirectUri) throw notAuthenticated(SIGN_IN_ERRORS.Offline)

  return { clientId, clientSecret, redirectUri }
}

/**
 * Build the screen a member is sent to
 * @param {string} state - Anti-forgery token
 * @param {string} codeVerifier - Proof key secret
 * @return {string} - Authorization URL
 */

export const buildAuthorizationUrl = (state: string, codeVerifier: string): string => {
  const { clientId, redirectUri } = requireCredentials()

  const parameters = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: DISCORD_SCOPES.join(' '),
    state,
    code_challenge: deriveChallenge(codeVerifier),
    code_challenge_method: DISCORD_PKCE.method,
    prompt: 'none',
  })

  return `${DISCORD_ENDPOINTS.authorize}?${parameters.toString()}`
}

/**
 * Shape the token endpoint answers with
 * @typedef {Object} TokenPayload
 * @property {string} access_token - Bearer token
 * @property {string} refresh_token - Renewal token
 * @property {string} scope - Granted scopes
 * @property {number} expires_in - Seconds before expiry
 */

interface TokenPayload {
  access_token: string
  refresh_token: string
  scope: string
  expires_in: number
}

/**
 * Read a token response or refuse the sign-in
 * @param {Response} response - Discord answer
 * @return {Promise<DiscordGrant>} - Grant
 */

const readGrant = async (response: Response): Promise<DiscordGrant> => {
  if (!response.ok) throw notAuthenticated(SIGN_IN_ERRORS.Refused)

  const payload = (await response.json()) as Partial<TokenPayload>
  const { access_token, refresh_token, scope, expires_in } = payload

  if (!access_token || !refresh_token || typeof expires_in !== 'number') {
    throw notAuthenticated(SIGN_IN_ERRORS.Refused)
  }

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    scope: scope ?? DISCORD_SCOPES.join(' '),
    expiresAt: new Date(Date.now() + expires_in * 1000),
  }
}

/**
 * Trade an authorization code for a grant
 * @param {string} code - Authorization code
 * @param {string} codeVerifier - Proof key secret
 * @return {Promise<DiscordGrant>} - Grant
 */

export const exchangeCode = async (code: string, codeVerifier: string): Promise<DiscordGrant> => {
  const { clientId, clientSecret, redirectUri } = requireCredentials()

  const response = await fetch(DISCORD_ENDPOINTS.token, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  return readGrant(response)
}

/**
 * Renew an expiring grant
 * @param {string} refreshToken - Renewal token
 * @return {Promise<DiscordGrant>} - Grant
 */

export const refreshGrant = async (refreshToken: string): Promise<DiscordGrant> => {
  const { clientId, clientSecret } = requireCredentials()

  const response = await fetch(DISCORD_ENDPOINTS.token, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  return readGrant(response)
}

/**
 * Read who the grant belongs to
 * @param {string} accessToken - Bearer token
 * @return {Promise<DiscordIdentity>} - Identity
 */

export const readDiscordUser = async (accessToken: string): Promise<DiscordIdentity> => {
  const response = await fetch(DISCORD_ENDPOINTS.user, {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw notAuthenticated(SIGN_IN_ERRORS.Refused)

  const payload = (await response.json()) as Record<string, unknown>
  const id = typeof payload.id === 'string' ? payload.id : ''

  // A malformed identifier never reaches an account lookup
  if (!isDiscordId(id)) throw notAuthenticated(SIGN_IN_ERRORS.Refused)

  return {
    id,
    username: typeof payload.username === 'string' ? payload.username : id,
    avatar: typeof payload.avatar === 'string' ? payload.avatar : null,
    globalName: typeof payload.global_name === 'string' ? payload.global_name : null,
  }
}

/**
 * Keep the grant of one member, both halves encrypted at rest
 * @param {string} accountId - Account identifier
 * @param {DiscordGrant} grant - Grant
 * @return {Promise<void>} - Stored
 */

export const storeGrant = async (accountId: string, grant: DiscordGrant): Promise<void> => {
  const payload = {
    accessToken: encryptSecret(grant.accessToken),
    refreshToken: encryptSecret(grant.refreshToken),
    scope: grant.scope,
    expiresAt: grant.expiresAt,
  }

  await prisma.discordToken.upsert({
    where: { accountId },
    update: payload,
    create: { accountId, ...payload },
  })
}

/**
 * Read a usable bearer token, renewing it when it has expired
 * @param {string} accountId - Account identifier
 * @return {Promise<string | null>} - Bearer token
 */

export const readAccessToken = async (accountId: string): Promise<string | null> => {
  const stored = await prisma.discordToken.findUnique({ where: { accountId } })
  if (!stored) return null

  // A live token is handed back as it is
  if (stored.expiresAt > new Date()) return decryptSecret(stored.accessToken)

  const refreshToken = decryptSecret(stored.refreshToken)
  if (!refreshToken) return null

  const renewed = await refreshGrant(refreshToken)
  await storeGrant(accountId, renewed)

  return renewed.accessToken
}
