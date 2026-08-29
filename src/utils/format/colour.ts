/**
 * Hue, saturation and value of a colour
 * @typedef {Object} ColourHsv
 * @property {number} hue - Angle in degrees
 * @property {number} saturation - Ratio from zero to one
 * @property {number} value - Ratio from zero to one
 */

export interface ColourHsv {
  hue: number
  saturation: number
  value: number
}

// Shorthand and full length hexadecimal notations
const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

// Degrees covered by one hue sector
const SECTOR = 60

// Sectors of the hue circle
const CIRCLE = 360

// Highest value one channel holds
const CHANNEL_MAX = 255

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
 * @return {string | null} - Normalised colour, null when unreadable
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
 * Turn a hue circle position into a colour
 * @param {ColourHsv} colour - Position on the circle
 * @return {string} - Six digit colour
 */

export const hsvToHex = ({ hue, saturation, value }: ColourHsv): string => {
  const sector = (((hue % CIRCLE) + CIRCLE) % CIRCLE) / SECTOR
  const chroma = value * saturation
  const second = chroma * (1 - Math.abs((sector % 2) - 1))
  const base = value - chroma

  // Channel triplet before the base is added back
  const [red, green, blue] = [
    [chroma, second, 0],
    [second, chroma, 0],
    [0, chroma, second],
    [0, second, chroma],
    [second, 0, chroma],
    [chroma, 0, second],
  ][Math.floor(sector) % 6]

  const toDigits = (channel: number) =>
    Math.round((channel + base) * CHANNEL_MAX)
      .toString(16)
      .padStart(2, '0')

  return `#${toDigits(red)}${toDigits(green)}${toDigits(blue)}`
}

/**
 * Read a colour back as a hue circle position
 * @param {string} hex - Six digit colour
 * @param {ColourHsv} fallback - Position used when unreadable
 * @return {ColourHsv} - Position on the circle
 */

export const hexToHsv = (hex: string, fallback: ColourHsv): ColourHsv => {
  const normalised = normaliseHex(hex)
  if (!normalised) return fallback

  const [red, green, blue] = [1, 3, 5].map(
    (offset) => parseInt(normalised.slice(offset, offset + 2), 16) / CHANNEL_MAX
  )

  const highest = Math.max(red, green, blue)
  const chroma = highest - Math.min(red, green, blue)

  // A grey has no angle of its own, so the previous hue is kept
  if (chroma === 0) return { hue: fallback.hue, saturation: 0, value: highest }

  // Sector the dominant channel sits in
  const sector =
    highest === red
      ? (green - blue) / chroma
      : highest === green
        ? (blue - red) / chroma + 2
        : (red - green) / chroma + 4

  return {
    hue: (sector * SECTOR + CIRCLE) % CIRCLE,
    saturation: chroma / highest,
    value: highest,
  }
}
