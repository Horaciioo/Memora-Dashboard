import crypto from 'crypto'

import { DISCORD_PKCE } from '@/declarations/access/discord'

/**
 * What the start of the flow hands to its callback
 * @typedef {Object} OauthHandshake
 * @property {string} state - Anti-forgery token
 * @property {string} codeVerifier - Proof key secret
 * @property {string} [returnTo] - Path asked for before signing in
 */

export interface OauthHandshake {
  state: string
  codeVerifier: string
  returnTo?: string
}

/**
 * Build a URL-safe random string
 * @param {number} bytes - Entropy length
 * @return {string} - Random token
 */

const randomToken = (bytes: number): string => crypto.randomBytes(bytes).toString('base64url')

/**
 * Open a handshake for one sign-in attempt
 * @param {string} [returnTo] - Path asked for before signing in
 * @return {OauthHandshake} - Handshake
 */

export const createHandshake = (returnTo?: string): OauthHandshake => ({
  state: randomToken(DISCORD_PKCE.stateBytes),
  codeVerifier: randomToken(DISCORD_PKCE.verifierBytes),
  ...(returnTo ? { returnTo } : {}),
})

/**
 * Derive the challenge Discord stores against the verifier
 * @param {string} codeVerifier - Proof key secret
 * @return {string} - Code challenge
 */

export const deriveChallenge = (codeVerifier: string): string =>
  crypto.createHash('sha256').update(codeVerifier).digest('base64url')

/**
 * Serialise a handshake for its cookie
 * @param {OauthHandshake} handshake - Handshake
 * @return {string} - Cookie value
 */

export const packHandshake = (handshake: OauthHandshake): string =>
  Buffer.from(JSON.stringify(handshake)).toString('base64url')

/**
 * Read a handshake back from its cookie
 * @param {string | undefined} packed - Cookie value
 * @return {OauthHandshake | null} - Handshake
 */

export const unpackHandshake = (packed: string | undefined): OauthHandshake | null => {
  if (!packed) return null

  try {
    const parsed: unknown = JSON.parse(Buffer.from(packed, 'base64url').toString('utf8'))
    if (typeof parsed !== 'object' || parsed === null) return null

    const { state, codeVerifier, returnTo } = parsed as Record<string, unknown>
    if (typeof state !== 'string' || typeof codeVerifier !== 'string') return null

    return { state, codeVerifier, ...(typeof returnTo === 'string' ? { returnTo } : {}) }
  } catch {
    return null
  }
}

/**
 * Compare two tokens without leaking their difference through timing
 * @param {string} left - Expected token
 * @param {string} right - Received token
 * @return {boolean} - Tokens match
 */

export const matchesToken = (left: string, right: string): boolean => {
  const expected = Buffer.from(left)
  const received = Buffer.from(right)

  if (expected.length !== received.length) return false

  return crypto.timingSafeEqual(expected, received)
}
