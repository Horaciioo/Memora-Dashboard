import { clamp01, noise } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { paintHull } from '@/composites/play/naval/ocean/paint/hull'
import { drawHalo, haloSprite } from '@/composites/play/naval/ocean/sprites'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// Length of the sinking, in milliseconds
export const SINK_MS = 1800
// What is left of a wreck once down
const REST_ALPHA = 0.42
// Blasts along a carrier deck
const CHAIN_BLASTS = 4

// One way of going down, ctx at the ship centre along its length
type SinkPainter = (frame: OceanFrame, ship: NavalShip, sunk: number) => void

/**
 * Hull drawn from its centre
 * @param {OceanFrame} frame - Frame
 * @param {NavalShip} ship - Ship
 * @return {void}
 */

const centredHull = (frame: OceanFrame, ship: NavalShip): void => {
  frame.ctx.save()
  frame.ctx.translate(-(ship.length * frame.cell) / 2, 0)
  paintHull(frame, ship)
  frame.ctx.restore()
}

/**
 * Water closing over the hull
 * @param {OceanFrame} frame - Frame
 * @param {NavalShip} ship - Ship
 * @param {number} share - Zero to one
 * @return {void}
 */

const flood = ({ ctx, cell }: OceanFrame, ship: NavalShip, share: number): void => {
  const span = ship.length * cell
  ctx.globalAlpha = share * 0.5
  ctx.fillStyle = NAVAL_WATER.deep
  ctx.fillRect(-span / 2, -cell / 2, span, cell)
  ctx.globalAlpha = 1
}

/**
 * Patrol boat: rolls over fast and shows its keel
 * @type {SinkPainter}
 */

const capsize: SinkPainter = (frame, ship, sunk) => {
  const roll = clamp01(sunk * 1.6)
  frame.ctx.save()
  frame.ctx.scale(1, Math.max(0.05, Math.abs(Math.cos(roll * Math.PI))))
  frame.ctx.globalAlpha = 1 - sunk * (1 - REST_ALPHA)
  centredHull(frame, ship)
  if (roll > 0.5) flood(frame, ship, 1)
  frame.ctx.restore()
  flood(frame, ship, sunk)
}

/**
 * Destroyer: breaks in the middle, halves lean apart
 * @type {SinkPainter}
 */

const breakMiddle: SinkPainter = (frame, ship, sunk) => {
  const { ctx, cell } = frame
  const span = ship.length * cell
  for (const side of [-1, 1]) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(side < 0 ? -span / 2 : 0, -cell, span / 2, cell * 2)
    ctx.clip()
    ctx.translate(side * sunk * cell * 0.12, sunk * cell * 0.05)
    ctx.rotate(side * sunk * 0.16)
    ctx.globalAlpha = 1 - sunk * (1 - REST_ALPHA)
    centredHull(frame, ship)
    ctx.restore()
  }
  flood(frame, ship, sunk)
}

/**
 * Battleship: the stern goes under first, the bow rises
 * @type {SinkPainter}
 */

const sternFirst: SinkPainter = (frame, ship, sunk) => {
  const { ctx, cell } = frame
  const span = ship.length * cell
  const under = span * sunk * 0.6
  ctx.save()
  ctx.rotate(sunk * 0.08)
  ctx.beginPath()
  ctx.rect(-span / 2 + under, -cell, span - under + cell, cell * 2)
  ctx.clip()
  ctx.globalAlpha = 1 - sunk * (1 - REST_ALPHA) * 0.8
  centredHull(frame, ship)
  ctx.restore()
  flood(frame, ship, sunk)
}

/**
 * Carrier: settles flat, blasts running along the deck
 * @type {SinkPainter}
 */

const flatChain: SinkPainter = (frame, ship, sunk) => {
  const { ctx, cell, ratio } = frame
  const span = ship.length * cell
  ctx.globalAlpha = 1 - sunk * (1 - REST_ALPHA)
  centredHull(frame, ship)
  ctx.globalAlpha = 1
  for (let blast = 0; blast < CHAIN_BLASTS; blast += 1) {
    const life = (sunk - blast * 0.15) / 0.3
    if (life <= 0 || life >= 1) continue
    const x = -span / 2 + span * (0.15 + 0.7 * noise(ship.id * 13 + blast))
    ctx.globalAlpha = 1 - life
    drawHalo(ctx, haloSprite('flash', cell, ratio), { x, y: 0 }, cell * (1 + life * 1.4))
  }
  ctx.globalAlpha = 1
  flood(frame, ship, sunk)
}

// Way down by length, the destroyer's for the rest
const SINKING: Record<number, SinkPainter> = {
  2: capsize,
  3: breakMiddle,
  4: sternFirst,
  5: flatChain,
}

/**
 * A ship going down by its class
 * @param {OceanFrame} frame - Frame
 * @param {NavalShip} ship - Ship
 * @param {number} sunk - Zero to one, one is the wreck at rest
 * @return {void}
 */

export const paintSinking = (frame: OceanFrame, ship: NavalShip, sunk: number): void =>
  (SINKING[ship.length] ?? breakMiddle)(frame, ship, sunk)
