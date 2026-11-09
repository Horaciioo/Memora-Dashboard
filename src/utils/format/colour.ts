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

/**
 * Turn a stored colour aside from red and green when a vision mode asks for it
 * @param {string} hex - Stored colour
 * @return {string} - CSS colour, unchanged while no mode is on
 */

export const visionSafe = (hex: string): string =>
  `oklch(from ${hex} l c calc(h + var(--vision-shift-green) * max(0, 1 - abs(h - 140) / 45) + var(--vision-shift-red) * max(0, 1 - abs(h - 25) / 30)))`

/**
 * Bring a chat colour into the lightness range of the theme, set by the chat tokens
 * @param {string} hex - Colour a chatter picked
 * @return {string} - Readable CSS colour
 */

export const readableOnTheme = (hex: string): string => {
  const normal = normaliseHex(hex)

  // Perceived lightness held between the floor and the ceiling of the theme
  return normal ? `oklch(from ${normal} clamp(var(--chat-l-min), l, var(--chat-l-max)) c h)` : hex
}
