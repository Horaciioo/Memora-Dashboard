// Shorthand and full length hexadecimal notations
const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Tell a stored accent apart from a tone key
 * @param {string | null | undefined} raw - Stored accent
 * @return {boolean} - Reads as hexadecimal
 */

export const isHexColour = (raw: string | null | undefined): boolean =>
  typeof raw === 'string' && HEX_PATTERN.test(raw.trim())

/**
 * Bring a typed colour back to its six digit form
 * @param {string} raw - Typed colour
 * @return {string | null} - Normalised colour
 */

export const normaliseHex = (raw: string): string | null => {
  const trimmed = raw.trim()
  const candidate = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (!HEX_PATTERN.test(candidate)) return null

  const digits = candidate.slice(1).toLowerCase()

  // Shorthand doubles every digit
  return digits.length === 3
    ? `#${digits
        .split('')
        .map((digit) => digit + digit)
        .join('')}`
    : `#${digits}`
}
