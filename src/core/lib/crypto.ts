import { logger } from '@/core/lib/logger'

/**
 * Cipher the application encrypts secrets with
 * @typedef {Object} SecretCipher
 * @property {(value: string) => string} encrypt - Encrypt one value
 * @property {(value: string) => string} decrypt - Decrypt one value
 */

export interface SecretCipher {
  encrypt: (value: string) => string
  decrypt: (value: string) => string
}

// Prefixes tell a stored value apart without a schema column
const ENCRYPTED_PREFIX = 'enc:'
const PLAIN_PREFIX = 'plain:'

let cipher: SecretCipher | null = null
let warned = false

/**
 * Bind the cipher once the encryption manager is loaded
 * @param {SecretCipher} implementation - Cipher
 * @return {void}
 */

export const bindSecretCipher = (implementation: SecretCipher): void => {
  cipher = implementation
}

/**
 * Drop the cipher, later writes landing in clear
 * @return {void}
 */

export const unbindSecretCipher = (): void => {
  cipher = null
}

/**
 * Whether stored secrets are protected at rest
 * @return {boolean} - Cipher available
 */

export const isEncryptionActive = (): boolean => cipher !== null

/**
 * Protect one secret before it reaches the database
 * @param {string} value - Clear value
 * @return {string} - Stored value
 */

export const encryptSecret = (value: string): string => {
  if (!cipher) {
    // Said once per process, not once per write
    if (!warned) {
      warned = true
      logger.warn('[crypto] encryption is off, secrets are stored in clear')
    }

    return `${PLAIN_PREFIX}${value}`
  }

  return `${ENCRYPTED_PREFIX}${cipher.encrypt(value)}`
}

/**
 * Read one stored secret whichever way it was written
 * @param {string} stored - Stored value
 * @return {string | null} - Clear value
 */

export const decryptSecret = (stored: string): string | null => {
  if (stored.startsWith(PLAIN_PREFIX)) return stored.slice(PLAIN_PREFIX.length)

  // A row written before encryption existed carries no marker at all
  if (!stored.startsWith(ENCRYPTED_PREFIX)) return stored

  const payload = stored.slice(ENCRYPTED_PREFIX.length)

  // A value written under a key that is gone cannot be recovered
  if (!cipher) {
    logger.warn('[crypto] an encrypted secret was read without a cipher')

    return null
  }

  try {
    return cipher.decrypt(payload)
  } catch {
    return null
  }
}

/**
 * Protect an optional column before it reaches the database
 * @param {string | null | undefined} value - Clear value
 * @return {string | null} - Stored value
 */

export const encryptField = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined || value.length === 0) return null

  return encryptSecret(value)
}

/**
 * Read an optional column whichever way it was written
 * @param {string | null} stored - Stored value
 * @return {string | null} - Clear value
 */

export const decryptField = (stored: string | null): string | null => {
  if (stored === null || stored.length === 0) return null

  return decryptSecret(stored)
}
