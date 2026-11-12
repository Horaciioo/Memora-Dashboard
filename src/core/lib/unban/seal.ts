import { decryptSecret, encryptSecret } from '@/core/lib/crypto'

/**
 * Lock an object into a cookie or form safe string
 * @param {object} payload - Content to protect
 * @return {string} - Sealed text
 */

export const seal = (payload: object): string =>
  Buffer.from(encryptSecret(JSON.stringify(payload))).toString('base64url')

/**
 * Open a sealed string, null when it was tampered with or is not one
 * @param {string | null | undefined} packed - Sealed text
 * @return {Record<string, unknown> | null} - Content
 */

export const unseal = (packed: string | null | undefined): Record<string, unknown> | null => {
  if (!packed) return null

  try {
    const clear = decryptSecret(Buffer.from(packed, 'base64url').toString('utf8'))
    const parsed: unknown = clear ? JSON.parse(clear) : null

    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}
