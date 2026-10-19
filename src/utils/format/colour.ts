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
 * Lighten a chat colour until it reads on a dark ground
 * @param {string} hex - Colour a chatter picked
 * @return {string} - Readable CSS colour
 */

export const readableOnDark = (hex: string): string => {
  const normal = normaliseHex(hex)
  if (!normal) return hex

  const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((start) =>
    parseInt(normal.slice(start, start + 2), 16)
  )
  const max = Math.max(red, green, blue) / 255
  const min = Math.min(red, green, blue) / 255
  const lightness = (max + min) / 2
  if (lightness >= 0.5) return normal

  // Mix with white up to the lightness Twitch's own dark theme keeps
  const share = (0.5 - lightness) / (1 - lightness)

  return `color-mix(in srgb, ${normal} ${Math.round((1 - share) * 100)}%, white)`
}
