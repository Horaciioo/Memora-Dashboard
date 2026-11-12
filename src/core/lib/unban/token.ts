import { createHash, randomBytes, randomInt } from 'node:crypto'

import { UNBAN_TOKEN } from '@/utils/constants/unban'

// Alphabet and length of a well formed token
const TOKEN_PATTERN = new RegExp(`^[A-Za-z0-9_-]{${UNBAN_TOKEN.length}}$`)

/**
 * Fresh secret for a link
 * @return {string} - URL safe token
 */

export const createToken = (): string => randomBytes(UNBAN_TOKEN.bytes).toString('base64url')

/**
 * Fingerprint kept in place of the token
 * @param {string} token - Link secret
 * @return {string} - Hexadecimal SHA-256
 */

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex')

/**
 * Whether a string could be a token, checked before any query
 * @param {string} token - Value from the address
 * @return {boolean} - Right length and alphabet
 */

export const isWellFormedToken = (token: string): boolean => TOKEN_PATTERN.test(token)

/**
 * Short readable code of a request
 * @return {string} - Reference such as DB-7K3QX
 */

export const createReference = (): string => {
  const { referenceAlphabet, referenceLength, referencePrefix } = UNBAN_TOKEN
  const code = Array.from(
    { length: referenceLength },
    () => referenceAlphabet[randomInt(referenceAlphabet.length)]
  ).join('')

  return `${referencePrefix}${code}`
}
