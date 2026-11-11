import type { WorldBoard } from '@/composites/play/naval/world/geometry'
import { fbm, pieceRng, valueNoise } from '@/composites/play/naval/world/noise'
import type { Pen } from '@/composites/play/naval/world/pen'
import type { NavalMapLook } from '@/declarations/play/naval/maps'

// Squares of one swell of the depth noise
const DEPTH_SCALE = 7
// Pixels of one ripple of light on the bed
const RIPPLE_PX = 11
// Wave crests per ten thousand pixels
const CRESTS_PER_AREA = 5.5

/**
 * Hex colour as three channels
 * @param {string} hex - Colour
 * @return {number[]} - Red, green, blue
 */

const channels = (hex: string): number[] => {
  const value = parseInt(hex.replace('#', ''), 16)

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

/**
 * Water bed, pixel by pixel: depth swells, lighter towards the coasts, light ripples,
 * worked out every few pixels on a large picture and stretched back
 * @param {Pen} pen - Pen, no transform
 * @param {Object} view - Board, its fit and the pixel step
 * @return {void}
 */

export const paintBed = (
  pen: Pen,
  {
    board,
    look,
    fit,
    seed,
    step = 1,
  }: {
    board: WorldBoard
    look: NavalMapLook
    fit: { scale: number; x: number; y: number }
    seed: number
    step?: number
  }
): void => {
  const { width: fullWidth, height: fullHeight } = pen.canvas
  const width = Math.ceil(fullWidth / step)
  const height = Math.ceil(fullHeight / step)
  const image = pen.createImageData(width, height)
  const [deep, mid, shallow] = ['deep', 'mid', 'shallow'].map((key) => channels(look.water[key]))
  const middle = { x: board.left + board.size / 2, y: board.top + board.size / 2 }
  const reach = Math.max(board.width, board.height) / 2
  for (let py = 0; py < height; py += 1) {
    for (let px = 0; px < width; px += 1) {
      const bx = (px * step - fit.x) / fit.scale
      const by = (py * step - fit.y) / fit.scale
      const coast = Math.min(1, Math.hypot(bx - middle.x, by - middle.y) / reach)
      const swell = fbm(bx / DEPTH_SCALE, by / DEPTH_SCALE, seed)
      const depth = Math.min(1, Math.max(0, swell * 0.7 + coast * coast * 0.55 - 0.12))
      const ridge = 1 - Math.abs(valueNoise((px * step) / RIPPLE_PX, (py * step) / RIPPLE_PX, seed + 3) * 2 - 1)
      const glint = ridge ** 12 * 9 * (0.3 + depth)
      const [from, to, share] = depth < 0.6 ? [deep, mid, depth / 0.6] : [mid, shallow, (depth - 0.6) / 0.4]
      const at = (py * width + px) * 4
      for (let channel = 0; channel < 3; channel += 1) {
        image.data[at + channel] = from[channel] + (to[channel] - from[channel]) * share + glint
      }
      image.data[at + 3] = 255
    }
  }
  if (step === 1) return pen.putImageData(image, 0, 0)
  const small = document.createElement('canvas')
  small.width = width
  small.height = height
  small.getContext('2d')?.putImageData(image, 0, 0)
  pen.drawImage(small, 0, 0, width * step, height * step)
  small.width = 0
}

/**
 * Wave crests: short bright arcs scattered over the water, a dark trough under each
 * @param {Pen} pen - Pen in squares
 * @param {Object} view - Board, look and seed
 * @return {void}
 */

export const paintCrests = (
  pen: Pen,
  { board, look, seed }: { board: WorldBoard; look: NavalMapLook; seed: number }
): void => {
  const rng = pieceRng(seed + 41)
  const scale = pen.getTransform().a
  const count = Math.round(((board.width * board.height * scale * scale) / 10000) * CRESTS_PER_AREA)
  const width = 1 / scale
  pen.lineCap = 'round'
  for (let crest = 0; crest < count; crest += 1) {
    const x = rng() * board.width
    const y = rng() * board.height
    const length = width * (4 + rng() * 7)
    const bend = length * (0.18 + rng() * 0.16)
    pen.lineWidth = width * (1 + rng() * 1.2)
    pen.strokeStyle = look.light.shade
    pen.globalAlpha = 0.35
    pen.beginPath()
    pen.moveTo(x - length, y + width * 1.5)
    pen.quadraticCurveTo(x, y - bend + width * 1.5, x + length, y + width * 1.5)
    pen.stroke()
    pen.strokeStyle = look.water.sheen
    pen.globalAlpha = 0.6 + rng() * 0.4
    pen.beginPath()
    pen.moveTo(x - length, y)
    pen.quadraticCurveTo(x, y - bend, x + length, y)
    pen.stroke()
  }
  pen.globalAlpha = 1
}

/**
 * Soft shadows of passing clouds
 * @param {Pen} pen - Pen in squares
 * @param {Object} view - Board, look and seed
 * @return {void}
 */

export const paintCloudShadows = (
  pen: Pen,
  { board, look, seed }: { board: WorldBoard; look: NavalMapLook; seed: number }
): void => {
  const rng = pieceRng(seed + 77)
  const span = Math.max(board.width, board.height)
  for (let cloud = 0; cloud < (look.life.clouds ?? 0); cloud += 1) {
    const x = rng() * board.width
    const y = rng() * board.height
    const radius = span * (0.14 + rng() * 0.12)
    const shadow = pen.createRadialGradient(x, y, 0, x, y, radius)
    shadow.addColorStop(0, look.light.shade)
    shadow.addColorStop(1, 'rgba(0,0,0,0)')
    pen.save()
    pen.globalAlpha = 0.32
    pen.translate(x, y)
    pen.scale(1.7, 1)
    pen.translate(-x, -y)
    pen.fillStyle = shadow
    pen.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    pen.restore()
  }
}
