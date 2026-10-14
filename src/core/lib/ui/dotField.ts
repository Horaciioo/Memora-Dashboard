// Pitch of the dot grid in pixels
export const DOT_PITCH = 5

// Whitening of a lit dot
const PASTEL_BASE = 0.4
const PASTEL_SPREAD = 0.35

export type Rgb = [number, number, number]

/**
 * Stable noise of one dot
 * @param {number} column - Dot column
 * @param {number} row - Dot row
 * @param {number} salt - Noise channel
 * @return {number} - Value from 0 to 1
 */

const noise = (column: number, row: number, salt: number): number => {
  const seed = Math.sin(column * 127.1 + row * 311.7 + salt * 74.7) * 43758.5453

  return seed - Math.floor(seed)
}

/**
 * Colour read from a computed `rgb()` string
 * @param {string} value - Computed colour
 * @return {Rgb} - Channels
 */

export const parseRgb = (value: string): Rgb => {
  const channels = value
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number)

  return channels && channels.length === 3 ? (channels as Rgb) : [255, 255, 255]
}

/**
 * Step one colour toward another
 * @param {Rgb} from - Current channels
 * @param {Rgb} to - Target channels
 * @param {number} amount - Share of the way, 0 to 1
 * @return {Rgb} - Channels
 */

export const mixRgb = (from: Rgb, to: Rgb, amount: number): Rgb => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
  from[2] + (to[2] - from[2]) * amount,
]

/**
 * Dot matrix whose dots light up toward the thumb and flicker on and off
 * @param {Object} input - Frame
 * @param {CanvasRenderingContext2D} input.context - Drawing context, scaled to CSS pixels
 * @param {number} input.width - Field width
 * @param {number} input.height - Field height
 * @param {number} input.reach - Position the lit trail runs to
 * @param {Rgb} input.tint - Colour of the lit dots
 * @param {number} input.time - Seconds, 0 freezes the flicker
 * @param {number} [input.energy] - Thumb speed, 0 to 1, flares the dots while it moves
 * @return {void}
 */

export const drawDotField = ({
  context,
  width,
  height,
  reach,
  tint,
  time,
  energy = 0,
}: {
  context: CanvasRenderingContext2D
  width: number
  height: number
  reach: number
  tint: Rgb
  time: number
  energy?: number
}): void => {
  context.clearRect(0, 0, width, height)

  const columns = Math.floor(width / DOT_PITCH)
  const rows = Math.max(Math.floor(height / DOT_PITCH), 1)
  const left = (width - columns * DOT_PITCH) / 2 + DOT_PITCH / 2
  const top = (height - rows * DOT_PITCH) / 2 + DOT_PITCH / 2
  const shade = (spread: number, lift: number): string => {
    // Pastel cousin of the tint
    const amount = Math.min(PASTEL_BASE + Math.abs(spread) * PASTEL_SPREAD + lift, 0.92)
    const [r, g, b] = tint.map((channel) => Math.round(channel + (255 - channel) * amount))

    return `${r}, ${g}, ${b}`
  }

  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows; row++) {
      const x = left + column * DOT_PITCH
      const y = top + row * DOT_PITCH

      // Share of the way to the thumb, a fading spill beyond it
      const progress = x <= reach ? Math.max((x / reach - 0.1) / 0.9, 0) : 0
      const spill = x > reach ? 0.75 * Math.exp(-(x - reach) / 60) : 0
      const ramp = Math.max(progress * progress * (3 - 2 * progress), spill)

      // Each dot fades in and out at its own pace, a few stay dim
      const pace = 2.6 + noise(column, row, 1) * 4.4
      const wave = 0.5 + 0.5 * Math.sin(time * pace + noise(column, row, 2) * 6.283)
      const breath = wave * wave
      const dim = noise(column, row, 3) > 0.92 ? 0.3 : 1
      const level = Math.min(ramp * (0.2 + 0.8 * breath) * dim * (1 + energy * 0.6), 1)

      // Crest running along the lit trail, ahead of the thumb
      const gap = reach - x
      const crest =
        Math.exp(-Math.abs(gap) / (gap >= 0 ? 22 : 40)) *
        (0.6 + 0.4 * Math.sin(time * 11 - x * 0.35))

      // Faint grid underneath
      context.fillStyle = `rgba(${shade(0, 0.1)}, 0.3)`
      context.beginPath()
      context.roundRect(x - 1.25, y - 1.25, 2.5, 2.5, 0.6)
      context.fill()

      if (level < 0.02) continue

      // Square that swells as it lights, each in its own shade of the tint
      const spread = (noise(column, row, 4) - 0.5) * 2
      const half = 1.25 + level * 1.15 + crest * 0.7
      context.fillStyle = `rgba(${shade(spread, crest * 0.5)}, ${Math.min(0.12 + level * 0.88, 1)})`
      context.beginPath()
      context.roundRect(x - half, y - half, half * 2, half * 2, 0.8)
      context.fill()
    }
  }
}
