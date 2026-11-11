import crypto from 'node:crypto'

import { matchesToken } from '@/core/lib/auth/oauthState'

// Tokens already spent, until they would have expired anyway
const spent = new Map<string, number>()

// The confirmation argument never belongs to the command itself
const CONFIRM_ARGUMENT = /\s--confirm=("[^"]*"|\S+)/

/**
 * Text a confirmation is bound to
 * @param {string} input - Typed command
 * @return {string} - Text without its confirmation argument
 */

export const canonicalInput = (input: string): string =>
  input.normalize('NFC').trim().replace(CONFIRM_ARGUMENT, '')

// Signature of a token
const sign = (secret: string, input: string, expires: number, nonce: string): string =>
  crypto
    .createHmac('sha256', secret)
    .update(`${canonicalInput(input)}|${expires}|${nonce}`)
    .digest('base64url')

/**
 * Value typed to confirm a risky change
 * @param {string} input - Typed command
 * @return {string | null} - Confirmation text or null
 */

export const readConfirmArgument = (input: string): string | null => {
  const match = CONFIRM_ARGUMENT.exec(input)

  return match ? match[1].replace(/^"|"$/g, '') : null
}

/**
 * Sign a preview for one exact command
 * @param {string} secret - Server side secret of the session
 * @param {string} input - Typed command
 * @param {number} now - Current time in ms
 * @param {number} ttlSeconds - Lifetime
 * @return {string} - Token to send back
 */

export const issueConfirmToken = (
  secret: string,
  input: string,
  now: number,
  ttlSeconds: number
): string => {
  const expires = now + ttlSeconds * 1000

  // Two previews of one text never share a token
  const nonce = crypto.randomBytes(8).toString('base64url')

  return `${expires}.${nonce}.${sign(secret, input, expires, nonce)}`
}

/**
 * Check a token and spend it
 * @param {string} secret - Server side secret of the session
 * @param {string} input - Typed command
 * @param {string} token - Token received
 * @param {number} now - Current time in ms
 * @return {boolean} - Token is good and fresh
 */

export const spendConfirmToken = (
  secret: string,
  input: string,
  token: string,
  now: number
): boolean => {
  // Forget what could not be replayed anymore
  for (const [key, expires] of spent) if (expires < now) spent.delete(key)

  const [expiresText, nonce = '', signature = ''] = token.split('.')
  const expires = Number(expiresText)
  if (!Number.isFinite(expires) || expires < now || spent.has(token)) return false
  if (!matchesToken(sign(secret, input, expires, nonce), signature)) return false

  spent.set(token, expires)

  return true
}
