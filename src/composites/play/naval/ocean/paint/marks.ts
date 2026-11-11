import { centreOf, noise, sightOf } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { SeaMarks } from '@/core/lib/play/naval/sea'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { haloSprite } from '@/composites/play/naval/ocean/sprites'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// Smoke puffs over a burning square, and their climb time in milliseconds
const PUFFS = 3
const PUFF_MS = 2600

/**
 * Foam ring left by a shell in the water
 * @param {OceanFrame} frame - Frame
 * @param {{ x: number; y: number }} at - Pixel centre
 * @return {void}
 */

const paintMiss = ({ ctx, cell }: OceanFrame, at: { x: number; y: number }): void => {
  ctx.strokeStyle = NAVAL_WATER.clear
  ctx.lineWidth = Math.max(1, cell * 0.06)
  ctx.beginPath()
  ctx.arc(at.x, at.y, cell * 0.22, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = NAVAL_WATER.foam
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.arc(at.x, at.y, cell * 0.07, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

/**
 * Fire and the smoke that stays on a hit square
 * @param {OceanFrame} frame - Frame
 * @param {{ x: number; y: number }} at - Pixel centre
 * @param {number} seed - Square seed
 * @param {boolean} isHeavy - Black smoke
 * @return {void}
 */

const paintBurn = (
  frame: OceanFrame,
  at: { x: number; y: number },
  seed: number,
  isHeavy: boolean
): void => {
  const { ctx, cell, now, ratio, life } = frame
  ctx.globalAlpha = 0.75 + 0.25 * Math.sin(now / 90 + seed)
  ctx.drawImage(haloSprite('glow', cell, ratio), at.x - cell / 2, at.y - cell / 2, cell, cell)
  ctx.globalAlpha = 1
  const puffs = Math.max(1, Math.round(PUFFS * life))
  for (let puff = 0; puff < puffs; puff += 1) {
    const life = ((now + noise(seed + puff) * PUFF_MS) % PUFF_MS) / PUFF_MS
    ctx.globalAlpha = 0.55 * (1 - life)
    ctx.fillStyle = isHeavy ? NAVAL_WATER.blackSmoke : NAVAL_WATER.smoke
    ctx.beginPath()
    ctx.arc(
      at.x + Math.sin(life * 3 + puff) * cell * 0.15,
      at.y - life * cell * 0.9,
      cell * (0.14 + life * 0.22),
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/**
 * Marker of a ship square lit by a flare
 * @param {OceanFrame} frame - Frame
 * @param {{ x: number; y: number }} at - Pixel centre
 * @return {void}
 */

const paintSpotted = ({ ctx, cell, now }: OceanFrame, at: { x: number; y: number }): void => {
  const pulse = 0.3 + 0.08 * Math.sin(now / 260)
  ctx.strokeStyle = NAVAL_WATER.spotted
  ctx.lineWidth = Math.max(1.5, cell * 0.08)
  ctx.beginPath()
  ctx.moveTo(at.x, at.y - cell * pulse)
  ctx.lineTo(at.x + cell * pulse, at.y)
  ctx.lineTo(at.x, at.y + cell * pulse)
  ctx.lineTo(at.x - cell * pulse, at.y)
  ctx.closePath()
  ctx.stroke()
}

/**
 * Foam rings of the misses in sight, painted once into the marks layer
 * @param {OceanFrame} frame - Frame
 * @param {SeaMark[]} marks - One mark per square
 * @return {void}
 */

export const paintStillMarks = (frame: OceanFrame, marks: SeaMark[]): void => {
  const { x0, x1, y0, y1 } = sightOf(frame)
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if (marks[y * frame.size + x] === SeaMarks.Miss) paintMiss(frame, centreOf(frame, x, y))
    }
  }
}

/**
 * Moving marks in sight, flare markers then fires so their smoke tops the rest
 * @param {OceanFrame} frame - Frame
 * @param {SeaMark[]} marks - One mark per square
 * @param {Set<number>} [heavy] - Squares of heavy damage
 * @return {void}
 */

export const paintLiveMarks = (frame: OceanFrame, marks: SeaMark[], heavy?: Set<number>): void => {
  const { x0, x1, y0, y1 } = sightOf(frame)
  const burning: number[] = []
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const mark = marks[y * frame.size + x]
      if (mark === SeaMarks.Spotted) paintSpotted(frame, centreOf(frame, x, y))
      if (mark === SeaMarks.Hit) burning.push(y * frame.size + x)
    }
  }
  for (const square of burning) {
    const x = square % frame.size
    paintBurn(
      frame,
      centreOf(frame, x, (square - x) / frame.size),
      square,
      Boolean(heavy?.has(square))
    )
  }
}
