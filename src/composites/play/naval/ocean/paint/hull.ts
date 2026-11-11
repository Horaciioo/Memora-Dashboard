import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import type { NavalSkin } from '@/declarations/play/naval/skins'

// Beam of a ship in squares, and the wooden deck inside the rim
const BEAM = 0.8
const DECK_BEAM = 0.62

// Longest ship that carries aircraft, and the one that carries guns
const CARRIER = 5
const BATTLESHIP = 4
const CRUISER = 3

type Pen = CanvasRenderingContext2D

/**
 * Hull outline along the x axis, stern rounded, bow pointed
 * @param {Pen} ctx - Pen
 * @param {number} length - Pixels
 * @param {number} beam - Pixels across
 * @return {void}
 */

const hullPath = (ctx: Pen, length: number, beam: number): void => {
  const half = beam / 2
  const bow = beam * 1.05
  ctx.beginPath()
  ctx.moveTo(half * 0.6, -half)
  ctx.lineTo(length - bow, -half)
  ctx.quadraticCurveTo(length - bow * 0.3, -half * 0.92, length, 0)
  ctx.quadraticCurveTo(length - bow * 0.3, half * 0.92, length - bow, half)
  ctx.lineTo(half * 0.6, half)
  ctx.quadraticCurveTo(0, half, 0, 0)
  ctx.quadraticCurveTo(0, -half, half * 0.6, -half)
  ctx.closePath()
}

/**
 * Rounded block on the deck
 * @param {Pen} ctx - Pen
 * @param {number[]} box - Left, top, width, height
 * @param {string} fill - Colour
 * @param {string} edge - Outline colour
 * @param {number} line - Outline width
 * @return {void}
 */

const block = (
  ctx: Pen,
  [x, y, width, height]: number[],
  fill: string,
  edge: string,
  line: number
): void => {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, Math.min(width, height) * 0.22)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = edge
  ctx.lineWidth = line
  ctx.stroke()
}

/**
 * Gun turret with its barrels pointing to the bow
 * @param {Pen} ctx - Pen
 * @param {NavalSkin} skin - Skin
 * @param {number[]} at - Centre column, row, size in pixels
 * @param {number} barrels - Barrels
 * @return {void}
 */

const turret = (ctx: Pen, skin: NavalSkin, [x, y, size]: number[], barrels: number): void => {
  ctx.fillStyle = skin.dark
  for (let index = 0; index < barrels; index += 1) {
    const offset = barrels === 1 ? 0 : (index - (barrels - 1) / 2) * size * 0.5
    ctx.fillRect(x, y + offset - size * 0.05, size * 1.1, size * 0.1)
  }
  ctx.beginPath()
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
  ctx.fillStyle = skin.metal
  ctx.fill()
  ctx.strokeStyle = skin.dark
  ctx.lineWidth = size * 0.08
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x - size * 0.06, y, size * 0.22, 0, Math.PI * 2)
  ctx.fillStyle = skin.top
  ctx.fill()
}

/**
 * Small aircraft parked on a flight deck
 * @param {Pen} ctx - Pen
 * @param {NavalSkin} skin - Skin
 * @param {number[]} at - Centre column, row, size in pixels
 * @return {void}
 */

const plane = (ctx: Pen, skin: NavalSkin, [x, y, size]: number[]): void => {
  ctx.fillStyle = skin.top
  ctx.strokeStyle = skin.dark
  ctx.lineWidth = size * 0.06
  ctx.beginPath()
  ctx.roundRect(x - size * 0.45, y - size * 0.07, size * 0.9, size * 0.14, size * 0.07)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.roundRect(x - size * 0.12, y - size * 0.42, size * 0.2, size * 0.84, size * 0.05)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = skin.accent
  ctx.fillRect(x + size * 0.28, y - size * 0.05, size * 0.1, size * 0.1)
}

/**
 * Pieces standing on the deck, by ship size
 * @param {Pen} ctx - Pen
 * @param {NavalSkin} skin - Skin
 * @param {NavalShip} ship - Ship
 * @param {number} cell - Pixels per square
 * @return {void}
 */

const paintDeck = (ctx: Pen, skin: NavalSkin, ship: NavalShip, cell: number): void => {
  const line = Math.max(1, cell * 0.04)
  const at = (squares: number) => squares * cell

  if (ship.length >= CARRIER) {
    // Runway, four aircraft and the tower aside
    ctx.setLineDash([cell * 0.22, cell * 0.2])
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = line * 1.5
    ctx.beginPath()
    ctx.moveTo(at(0.5), 0)
    ctx.lineTo(at(ship.length - 0.9), 0)
    ctx.stroke()
    ctx.setLineDash([])
    for (let index = 0; index < ship.length - 1; index += 1)
      plane(ctx, skin, [at(1.05 + index * 0.95), cell * 0.02, cell * 0.5])
    block(ctx, [at(0.25), cell * 0.12, cell * 0.7, cell * 0.2], skin.metal, skin.dark, line)
    block(ctx, [at(0.38), cell * 0.17, cell * 0.3, cell * 0.1], skin.top, skin.dark, line)
  } else if (ship.length === BATTLESHIP) {
    turret(ctx, skin, [at(0.75), 0, cell * 0.46], 2)
    turret(ctx, skin, [at(ship.length - 1.1), 0, cell * 0.46], 2)
    block(ctx, [at(1.4), -cell * 0.2, cell * 1.2, cell * 0.4], skin.metal, skin.dark, line)
    block(ctx, [at(1.65), -cell * 0.13, cell * 0.5, cell * 0.26], skin.top, skin.dark, line)
    ctx.fillStyle = skin.accent
    ctx.fillRect(at(2.7), -cell * 0.04, cell * 0.14, cell * 0.08)
  } else if (ship.length === CRUISER && ship.id % 2 === 0) {
    turret(ctx, skin, [at(ship.length - 0.85), 0, cell * 0.42], 2)
    block(ctx, [at(0.95), -cell * 0.19, cell * 0.95, cell * 0.38], skin.metal, skin.dark, line)
    block(ctx, [at(1.15), -cell * 0.12, cell * 0.4, cell * 0.24], skin.top, skin.dark, line)
    turret(ctx, skin, [at(0.5), 0, cell * 0.3], 1)
  } else if (ship.length === CRUISER) {
    // Two cargo hatches and a lifebuoy
    for (const column of [0.45, 1.55])
      block(ctx, [at(column), -cell * 0.22, cell * 0.85, cell * 0.44], skin.top, skin.dark, line)
    ctx.fillStyle = skin.accent
    ctx.beginPath()
    ctx.arc(at(ship.length - 0.45), cell * 0.18, cell * 0.06, 0, Math.PI * 2)
    ctx.fill()
  } else {
    block(ctx, [at(0.25), -cell * 0.2, cell * 0.65, cell * 0.4], skin.metal, skin.dark, line)
    block(ctx, [at(0.38), -cell * 0.12, cell * 0.3, cell * 0.24], skin.top, skin.dark, line)
    turret(ctx, skin, [at(ship.length - 0.55), 0, cell * 0.3], 1)
  }
}

/**
 * Wooden planks along the deck
 * @param {Pen} ctx - Pen
 * @param {NavalSkin} skin - Skin
 * @param {number} length - Pixels
 * @param {number} beam - Pixels across
 * @return {void}
 */

const paintPlanks = (ctx: Pen, skin: NavalSkin, length: number, beam: number): void => {
  ctx.strokeStyle = skin.plank
  ctx.lineWidth = Math.max(1, beam * 0.025)
  ctx.beginPath()
  for (const row of [-0.33, -0.11, 0.11, 0.33]) {
    ctx.moveTo(0, beam * row)
    ctx.lineTo(length, beam * row)
  }
  ctx.stroke()
}

/**
 * One ship drawn in its local frame, stern at zero, bow to the right
 * @param {OceanFrame} frame - Frame
 * @param {NavalShip} ship - Ship
 * @return {void}
 */

export const paintHull = (frame: OceanFrame, ship: NavalShip): void => {
  const { ctx, cell, skin } = frame
  const length = ship.length * cell - cell * 0.12
  const beam = cell * BEAM
  ctx.save()
  ctx.translate(cell * 0.06, 0)

  // Metal rim
  hullPath(ctx, length, beam)
  const rim = ctx.createLinearGradient(0, -beam / 2, 0, beam / 2)
  rim.addColorStop(0, skin.rim)
  rim.addColorStop(1, skin.rimDark)
  ctx.fillStyle = rim
  ctx.fill()
  ctx.strokeStyle = skin.dark
  ctx.lineWidth = Math.max(1, cell * 0.04)
  ctx.stroke()

  // Wooden deck inside it
  const inner = length - cell * 0.3
  const deckBeam = cell * DECK_BEAM
  ctx.save()
  ctx.translate(cell * 0.12, 0)
  hullPath(ctx, inner, deckBeam)
  const wood = ctx.createLinearGradient(0, -deckBeam / 2, 0, deckBeam / 2)
  wood.addColorStop(0, skin.wood)
  wood.addColorStop(1, skin.woodDark)
  ctx.fillStyle = wood
  ctx.fill()
  ctx.clip()
  paintPlanks(ctx, skin, inner, deckBeam)
  ctx.restore()
  ctx.save()
  ctx.translate(cell * 0.12, 0)
  paintDeck(ctx, skin, ship, cell)
  ctx.restore()
  ctx.restore()
}
