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

/**
 * Hue, saturation and brightness of a colour, each from 0 to 1 (hue in degrees)
 * @typedef {Object} Hsv
 */

export interface Hsv {
  h: number
  s: number
  v: number
}

/**
 * Hexadecimal colour of a hue, saturation and brightness
 * @param {Hsv} hsv - Wheel position
 * @return {string} - Six digit hexadecimal
 */

export const hsvToHex = ({ h, s, v }: Hsv): string => {
  const channel = (offset: number) => {
    const k = (offset + h / 60) % 6

    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }

  return `#${[5, 3, 1]
    .map((offset) =>
      Math.round(channel(offset) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`
}

/**
 * Wheel position of a hexadecimal colour
 * @param {string} hex - Stored colour
 * @return {Hsv} - Hue, saturation and brightness, white when unreadable
 */

export const hexToHsv = (hex: string): Hsv => {
  const digits = normaliseHex(hex)
  if (!digits) return { h: 0, s: 0, v: 1 }
  const [red, green, blue] = [1, 3, 5].map(
    (start) => parseInt(digits.slice(start, start + 2), 16) / 255
  ) as [number, number, number]
  const max = Math.max(red, green, blue)
  const delta = max - Math.min(red, green, blue)
  const sector =
    delta === 0
      ? 0
      : max === red
        ? ((green - blue) / delta) % 6
        : max === green
          ? (blue - red) / delta + 2
          : (red - green) / delta + 4

  return { h: (sector * 60 + 360) % 360, s: max === 0 ? 0 : delta / max, v: max }
}
