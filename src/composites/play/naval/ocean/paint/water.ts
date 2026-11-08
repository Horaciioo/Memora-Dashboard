import { sightOf } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// Swell lines per square, and their drift speed in squares per second
const LINES_PER_SQUARE = 0.5
const DRIFT = 0.18

/**
 * Deep water, lighter towards the viewer
 * @param {OceanFrame} frame - Frame
 * @return {void}
 */

const paintBed = ({ ctx, width }: OceanFrame): void => {
  const bed = ctx.createLinearGradient(0, 0, 0, width)
  bed.addColorStop(0, NAVAL_WATER.deep)
  bed.addColorStop(0.6, NAVAL_WATER.mid)
  bed.addColorStop(1, NAVAL_WATER.light)
  ctx.fillStyle = bed
  ctx.fillRect(0, 0, width, width)
}

/**
 * Swell: soft sine strokes drifting across, two layers
 * @param {OceanFrame} frame - Frame
 * @return {void}
 */

const paintSwell = (frame: OceanFrame): void => {
  const { ctx, cell, left, top, now, width } = frame
  const { y0, y1 } = sightOf(frame)
  const seconds = now / 1000
  const gap = 1 / LINES_PER_SQUARE
  ctx.lineWidth = Math.max(1, cell * 0.05)
  for (const [layer, alpha] of [
    [0, 1],
    [0.5, 0.6],
  ] as const) {
    ctx.strokeStyle = NAVAL_WATER.sheen
    ctx.globalAlpha = alpha
    ctx.beginPath()
    for (let row = Math.floor(y0 / gap) * gap + layer * gap; row <= y1 + 1; row += gap) {
      const base = top + row * cell
      for (let px = 0; px <= width; px += Math.max(4, cell / 3)) {
        const phase = (px - left) / cell + seconds * DRIFT * (layer ? -1 : 1) * 4
        const lift = Math.sin(phase * 1.3 + row) * cell * 0.08
        if (px === 0) ctx.moveTo(px, base + lift)
        else ctx.lineTo(px, base + lift)
      }
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

/**
 * Edge of the sea when the view reaches it
 * @param {OceanFrame} frame - Frame
 * @return {void}
 */

const paintEdge = ({ ctx, cell, left, top, size }: OceanFrame): void => {
  ctx.strokeStyle = NAVAL_WATER.line
  ctx.lineWidth = Math.max(1, cell * 0.06)
  ctx.strokeRect(left, top, size * cell, size * cell)
}

/**
 * Animated water of a sea
 * @param {OceanFrame} frame - Frame
 * @return {void}
 */

export const paintWater = (frame: OceanFrame): void => {
  paintBed(frame)
  paintSwell(frame)
  paintEdge(frame)
}
