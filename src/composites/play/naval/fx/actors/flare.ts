import type { ActorPainter } from '@/composites/play/naval/fx/actors/scene'
import { centreOf, clamp01 } from '@/composites/play/naval/ocean/paint/frame'
import { drawHalo, haloSprite } from '@/composites/play/naval/ocean/sprites'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// Share of the run spent climbing
const CLIMB = 0.3

/**
 * Flare climbing, bursting, then drifting down under its chute as its light spreads
 * @type {ActorPainter}
 */

export const paintFlare: ActorPainter = ({ frame, strike }, _span, progress) => {
  const { ctx, cell, ratio } = frame
  const xs = strike.cells.map((c) => c.x)
  const ys = strike.cells.map((c) => c.y)
  const mid = centreOf(
    frame,
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2
  )
  const reach = ((Math.max(...xs) - Math.min(...xs)) / 2 + 1) * cell
  const climb = clamp01(progress / CLIMB)
  const fall = clamp01((progress - CLIMB) / (1 - CLIMB))
  const height = (climb - fall * 0.85) * reach * 1.5

  // Light circle once burst
  if (fall > 0) {
    ctx.globalAlpha = Math.min(1, fall * 3) * (1 - fall * 0.4)
    drawHalo(ctx, haloSprite('light', cell, ratio), mid, reach * 2.8 * Math.min(1, fall * 2))
    ctx.fillStyle = NAVAL_WATER.foam
    ctx.beginPath()
    ctx.arc(mid.x, mid.y - height - cell * 0.5, cell * 0.35, Math.PI, 0)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = NAVAL_WATER.fire
  ctx.beginPath()
  ctx.arc(mid.x, mid.y - height, cell * (fall > 0 ? 0.12 : 0.08), 0, Math.PI * 2)
  ctx.fill()
}
