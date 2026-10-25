import 'server-only'

import crypto from 'node:crypto'

/**
 * Stored form of a session token
 * @param {string} token - Cookie token
 * @return {string} - SHA-256 hex
 */

export const digestSessionToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex')
