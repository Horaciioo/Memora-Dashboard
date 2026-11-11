import { fbm } from '@/composites/play/naval/world/noise'

export type Pen = CanvasRenderingContext2D

// A closed outline, in squares
export type Outline = Array<[number, number]>

// Screen shift of a solid's top, in squares
export type Lift = [number, number]

/**
 * Colour mixed towards another
 * @param {string} from - Hex or rgb colour
 * @param {string} to - Hex or rgb colour
 * @param {number} amount - Share of the second, 0 to 1
 * @return {string} - Rgb colour
 */

export const mix = (from: string, to: string, amount: number): string => {
  // Hex or rgb() channels, so mixes can chain
  const read = (colour: string) => {
    if (!colour.startsWith('#')) return (colour.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
    const value = parseInt(colour.replace('#', ''), 16)

    return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  }
  const [a, b] = [read(from), read(to)]
  const channel = (index: number) => Math.round(a[index] + (b[index] - a[index]) * amount)

  return `rgb(${channel(0)},${channel(1)},${channel(2)})`
}

/**
 * Colour lit or darkened
 * @param {string} hex - Hex or rgb colour
 * @param {number} amount - Above 0 lighter, under 0 darker
 * @return {string} - Rgb colour
 */

export const shade = (hex: string, amount: number): string =>
  amount >= 0 ? mix(hex, '#ffffff', amount) : mix(hex, '#000000', -amount)

/**
 * Trace an outline, lifted and shifted
 * @param {Pen} pen - Pen
 * @param {Outline} outline - Points
 * @param {number} [dx] - Shift across
 * @param {number} [dy] - Shift down
 * @return {void}
 */

export const trace = (pen: Pen, outline: Outline, dx = 0, dy = 0): void => {
  pen.beginPath()
  outline.forEach(([x, y], index) =>
    index ? pen.lineTo(x + dx, y + dy) : pen.moveTo(x + dx, y + dy)
  )
  pen.closePath()
}

/**
 * Organic outline around a centre, its radius shaken by noise
 * @param {Object} shape - Blob
 * @param {number} shape.x - Centre column
 * @param {number} shape.y - Centre row
 * @param {number} shape.rx - Radius across
 * @param {number} shape.ry - Radius down
 * @param {number} shape.seed - Seed
 * @param {number} [shape.rough] - Shake, 0 smooth
 * @return {Outline} - Points
 */

export const blob = ({
  x,
  y,
  rx,
  ry,
  seed,
  rough = 0.35,
}: {
  x: number
  y: number
  rx: number
  ry: number
  seed: number
  rough?: number
}): Outline =>
  Array.from({ length: 72 }, (_, index) => {
    const angle = (index / 72) * Math.PI * 2
    const wave = fbm(Math.cos(angle) * 1.6 + 5, Math.sin(angle) * 1.6 + 5, seed, 3)
    const radius = 1 - rough / 2 + wave * rough

    return [x + Math.cos(angle) * rx * radius, y + Math.sin(angle) * ry * radius]
  })

/**
 * Outline grown or shrunk around its centre
 * @param {Outline} outline - Points
 * @param {number} factor - Scale
 * @return {Outline} - Points
 */

export const grow = (outline: Outline, factor: number): Outline => {
  const cx = outline.reduce((sum, [x]) => sum + x, 0) / outline.length
  const cy = outline.reduce((sum, [, y]) => sum + y, 0) / outline.length

  return outline.map(([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor])
}

/**
 * Soft blurred fill of an outline, the outline itself kept off the page
 * @param {Pen} pen - Pen
 * @param {Outline} outline - Points
 * @param {Object} glow - Look
 * @param {string} glow.colour - Colour
 * @param {number} glow.blur - Blur in squares
 * @param {number} [glow.dx] - Shift across
 * @param {number} [glow.dy] - Shift down
 * @return {void}
 */

export const haze = (
  pen: Pen,
  outline: Outline,
  { colour, blur, dx = 0, dy = 0 }: { colour: string; blur: number; dx?: number; dy?: number }
): void => {
  const scale = pen.getTransform().a
  // The shape drawn far away, only its shadow lands
  const away = 10000
  pen.save()
  pen.shadowColor = colour
  pen.shadowBlur = blur * scale
  pen.shadowOffsetX = (away + dx) * scale
  pen.shadowOffsetY = dy * scale
  pen.fillStyle = '#000'
  trace(pen, outline, -away, 0)
  pen.fill()
  pen.restore()
}

/**
 * Solid lifted off the water: its side, then its lit top
 * @param {Pen} pen - Pen
 * @param {Object} solid - Solid
 * @param {Outline} solid.outline - Footprint
 * @param {Lift} solid.lift - Shift of its top
 * @param {string} solid.side - Side colour
 * @param {string | CanvasGradient} solid.top - Top fill
 * @return {void}
 */

export const extrude = (
  pen: Pen,
  {
    outline,
    lift,
    side,
    top,
  }: { outline: Outline; lift: Lift; side: string; top: string | CanvasGradient }
): void => {
  const steps = Math.max(1, Math.ceil(Math.hypot(...lift) * pen.getTransform().a))
  for (let step = 0; step < steps; step += 1) {
    const share = step / steps
    pen.fillStyle = shade(side, -0.3 * (1 - share))
    trace(pen, outline, lift[0] * share, lift[1] * share)
    pen.fill()
  }
  pen.fillStyle = top
  trace(pen, outline, lift[0], lift[1])
  pen.fill()
}

/**
 * Outline shifted
 * @param {Outline} outline - Points
 * @param {Lift} lift - Shift
 * @return {Outline} - Points
 */

export const shift = (outline: Outline, [dx, dy]: Lift): Outline =>
  outline.map(([x, y]) => [x + dx, y + dy])

/**
 * Lift scaled
 * @param {Lift} lift - Lift
 * @param {number} share - Share
 * @return {Lift} - Lift
 */

export const part = ([dx, dy]: Lift, share: number): Lift => [dx * share, dy * share]

/**
 * Light falling across a box, bright on the sun side
 * @param {Pen} pen - Pen
 * @param {Object} box - Box and colour
 * @return {CanvasGradient} - Fill
 */

export const sunlit = (
  pen: Pen,
  {
    x,
    y,
    radius,
    sun,
    colour,
    strength = 0.22,
  }: { x: number; y: number; radius: number; sun: [number, number]; colour: string; strength?: number }
): CanvasGradient => {
  const fill = pen.createLinearGradient(
    x + sun[0] * radius,
    y + sun[1] * radius,
    x - sun[0] * radius,
    y - sun[1] * radius
  )
  fill.addColorStop(0, shade(colour, strength))
  fill.addColorStop(0.55, colour)
  fill.addColorStop(1, shade(colour, -strength))

  return fill
}
