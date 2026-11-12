import { centreOf, clamp01 } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { drawHalo, haloSprite } from '@/composites/play/naval/ocean/sprites'
import type { NavalTimeline } from '@/core/lib/play/naval/choreography'
import { isHitCode, NavalCodes } from '@/core/lib/play/naval/state'
import type { NavalShotView } from '@/core/lib/play/naval/state'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'
import { NavalImpacts } from '@/utils/constants/play'

// Foam rings of a splash, their delays
const RINGS = [0, 0.25]
// Shock ring reach, in squares
const SHOCK_REACH = 1.8

/**
 * Foam rings spreading from a splash
 * @param {OceanFrame} frame - Frame
 * @param {{ x: number; y: number }} at - Pixel centre
 * @param {number} life - Zero to one
 * @return {void}
 */

const paintSplash = ({ ctx, cell }: OceanFrame, at: { x: number; y: number }, life: number) => {
  ctx.strokeStyle = NAVAL_WATER.foam
  ctx.lineWidth = cell * 0.05
  for (const ring of RINGS) {
    const grow = clamp01(life - ring)
    ctx.globalAlpha = 1 - grow
    ctx.beginPath()
    ctx.ellipse(
      at.x,
      at.y,
      cell * (0.15 + grow * 0.6),
      cell * (0.1 + grow * 0.4),
      0,
      0,
      Math.PI * 2
    )
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

/**
 * Ring of the blast wave
 * @param {OceanFrame} frame - Frame
 * @param {{ x: number; y: number }} at - Pixel centre
 * @param {number} life - Zero to one
 * @return {void}
 */

const paintShock = ({ ctx, cell }: OceanFrame, at: { x: number; y: number }, life: number) => {
  ctx.globalAlpha = (1 - life) * 0.7
  ctx.strokeStyle = NAVAL_WATER.foam
  ctx.lineWidth = cell * 0.08 * (1 - life)
  ctx.beginPath()
  ctx.arc(at.x, at.y, cell * SHOCK_REACH * Math.sqrt(life), 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
}

/**
 * One landing: a splash on a miss, a flash on a hit, a wave for bombs
 * @param {OceanFrame} frame - Frame
 * @param {NavalShotView} cell - Square
 * @param {number} age - Milliseconds since landing
 * @param {NavalTimeline} timeline - Strike timeline
 * @return {void}
 */

export const paintImpact = (
  frame: OceanFrame,
  cell: NavalShotView,
  age: number,
  timeline: NavalTimeline
): void => {
  if (timeline.impact === NavalImpacts.Light) return
  const { ctx, cell: px, ratio } = frame
  const at = centreOf(frame, cell.x, cell.y)
  const life = clamp01(age / timeline.impactMs)
  if (timeline.impact === NavalImpacts.Shockwave && frame.life > 0) paintShock(frame, at, life)
  if (!isHitCode(cell.code)) {
    paintSplash(frame, at, life)

    return
  }
  const reach = cell.code === NavalCodes.Sunk ? 3.2 : 2
  ctx.globalAlpha = 1 - life
  drawHalo(ctx, haloSprite('flash', px, ratio), at, px * reach * (0.6 + life * 0.6))
  ctx.globalAlpha = 1
}
