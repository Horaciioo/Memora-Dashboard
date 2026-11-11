import { clamp01, noise } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { HEAVY_SHARE } from '@/core/lib/play/naval/events'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// List of a heavily hit ship, in radians
const LIST_MIN = (2 * Math.PI) / 180
const LIST_MAX = (6 * Math.PI) / 180
// Debris floating around a heavy wreck
const DEBRIS = 5
// Jolt of a ship just hit, in milliseconds
const JOLT_MS = 420

/**
 * Heavily hit, half the squares or more
 * @param {number} share - Hit share
 * @return {boolean} - Heavy
 */

export const isHeavy = (share: number): boolean => share >= HEAVY_SHARE

/**
 * List of a damaged ship, growing with the damage
 * @param {number} share - Hit share
 * @return {number} - Radians
 */

export const listOf = (share: number): number =>
  isHeavy(share)
    ? LIST_MIN + (LIST_MAX - LIST_MIN) * clamp01((share - HEAVY_SHARE) / HEAVY_SHARE)
    : 0

/**
 * Shove of a ship just hit, fading out
 * @param {number} since - Milliseconds since the hit
 * @param {number} cell - Square in pixels
 * @return {number} - Pixel offset
 */

export const joltOf = (since: number, cell: number): number =>
  since < 0 || since > JOLT_MS ? 0 : Math.sin(since / 30) * (1 - since / JOLT_MS) * cell * 0.06

/**
 * Scorched holes, a darker hull and floating debris, ctx at the ship centre
 * @param {OceanFrame} frame - Frame
 * @param {NavalShip} ship - Ship
 * @param {number[]} holes - Hit squares along the hull
 * @return {void}
 */

export const paintDamage = (frame: OceanFrame, ship: NavalShip, holes: number[]): void => {
  if (!holes.length) return
  const { ctx, cell, now } = frame
  const span = ship.length * cell

  // Blackened hole on each hit square
  ctx.fillStyle = NAVAL_WATER.scorch
  for (const hole of holes) {
    ctx.beginPath()
    ctx.ellipse(-span / 2 + (hole + 0.5) * cell, 0, cell * 0.24, cell * 0.18, hole, 0, Math.PI * 2)
    ctx.fill()
  }
  if (!isHeavy(holes.length / ship.length)) return

  // Darker hull, debris drifting off
  ctx.fillStyle = NAVAL_WATER.hullDark
  ctx.fillRect(-span / 2 + cell * 0.1, -cell * 0.38, span - cell * 0.2, cell * 0.76)
  ctx.fillStyle = frame.skin.dark
  for (let bit = 0; bit < DEBRIS; bit += 1) {
    const drift = ((now / 4000 + noise(ship.id + bit)) % 1) * cell * 0.5
    const side = bit % 2 ? 1 : -1
    ctx.fillRect(
      -span / 2 + span * noise(ship.id * 7 + bit),
      side * (cell * 0.5 + drift),
      cell * 0.1,
      cell * 0.06
    )
  }
}
