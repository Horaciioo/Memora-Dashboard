import { clamp01, sightOf } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { joltOf, listOf, paintDamage } from '@/composites/play/naval/ocean/paint/damage'
import { paintHull } from '@/composites/play/naval/ocean/paint/hull'
import { paintSinking, SINK_MS } from '@/composites/play/naval/ocean/paint/sinking'
import { cellsOf } from '@/core/lib/play/naval/fleet'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { SeaMarks } from '@/core/lib/play/naval/sea'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { hullOf } from '@/declarations/play/naval/fleets'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

/**
 * Ship to paint and its state
 * @typedef {Object} OceanShip
 * @property {boolean} [isKnown] - Silhouette shown before it sinks
 * @property {number} [sinkFrom] - Clock it starts to sink
 * @property {number} [joltAt] - Clock of its last hit
 */

export interface OceanShip {
  ship: NavalShip
  isWreck?: boolean
  isGhost?: boolean
  isKnown?: boolean
  sinkFrom?: number
  joltAt?: number
}

/**
 * How far down a wreck is
 * @param {OceanShip} entry - Ship
 * @param {number} now - Clock
 * @return {number} - Zero to one, minus one before it sinks
 */

export const sunkOf = ({ isWreck, sinkFrom }: OceanShip, now: number): number => {
  if (!isWreck) return -1
  if (sinkFrom === undefined) return 1

  return now < sinkFrom ? -1 : clamp01((now - sinkFrom) / SINK_MS)
}

/**
 * Pose of a ship: centre and angle
 * @param {OceanFrame} frame - Frame
 * @param {NavalShip} ship - Ship
 * @return {{ x: number; y: number; angle: number }} - Pose
 */

const poseOf = ({ cell, left, top }: OceanFrame, ship: NavalShip) => {
  const across = ship.isHorizontal ? ship.length : 1
  const down = ship.isHorizontal ? 1 : ship.length

  return {
    x: left + (ship.x + across / 2) * cell,
    y: top + (ship.y + down / 2) * cell,
    angle: ship.isHorizontal ? 0 : Math.PI / 2,
  }
}

/**
 * Ship overlapping the squares in sight
 * @param {ReturnType<typeof sightOf>} sight - Squares in sight
 * @param {NavalShip} ship - Ship
 * @return {boolean} - Seen
 */

const isInSight = (sight: ReturnType<typeof sightOf>, ship: NavalShip): boolean => {
  const x1 = ship.x + (ship.isHorizontal ? ship.length - 1 : 0)
  const y1 = ship.y + (ship.isHorizontal ? 0 : ship.length - 1)

  return x1 >= sight.x0 && ship.x <= sight.x1 && y1 >= sight.y0 && ship.y <= sight.y1
}

/**
 * Hit squares along a hull, stern first
 * @param {NavalShip} ship - Ship
 * @param {SeaMark[]} marks - Marks
 * @param {number} size - Squares per side
 * @return {number[]} - Positions on the hull
 */

const holesOf = (ship: NavalShip, marks: SeaMark[], size: number): number[] =>
  cellsOf(ship).flatMap(({ x, y }, index) => (marks[y * size + x] === SeaMarks.Hit ? [index] : []))

/**
 * Ship afloat: rocking, shoved when hit, listing when badly damaged
 * @param {OceanFrame} frame - Frame
 * @param {OceanShip} entry - Ship
 * @param {SeaMark[]} marks - Marks
 * @return {void}
 */

const paintAfloat = (frame: OceanFrame, entry: OceanShip, marks: SeaMark[]): void => {
  const { ctx, cell, now } = frame
  const { ship } = entry
  const holes = holesOf(ship, marks, frame.size)
  const jolt = entry.joltAt === undefined ? 0 : joltOf(now - entry.joltAt, cell)
  const bob = Math.sin((now * hullOf(frame.skin, ship).sway) / 1300 + ship.id * 1.7 + ship.x * 0.3)
  ctx.translate(jolt, bob * cell * 0.03)
  ctx.rotate(bob * 0.025 + listOf(holes.length / ship.length))
  ctx.save()
  ctx.translate(-(ship.length * cell) / 2, 0)
  paintHull(frame, ship)
  ctx.restore()
  paintDamage(frame, ship, holes)
}

/**
 * One ship at its pose, shadow first
 * @param {OceanFrame} frame - Frame
 * @param {OceanShip} entry - Ship
 * @param {(entry: OceanShip) => void} paint - Body painter
 * @return {void}
 */

const atPose = (frame: OceanFrame, entry: OceanShip, paint: (entry: OceanShip) => void) => {
  const { ctx, cell } = frame
  const pose = poseOf(frame, entry.ship)
  const span = entry.ship.length * cell
  ctx.save()
  ctx.translate(pose.x, pose.y)
  ctx.rotate(pose.angle)
  ctx.globalAlpha = entry.isGhost ? 0.5 : 1
  ctx.fillStyle = NAVAL_WATER.shadow
  ctx.fillRect(-span / 2 + cell * 0.1, cell * 0.22, span - cell * 0.2, cell * 0.12)
  paint(entry)
  ctx.restore()
}

/**
 * Ships of a sea: afloat, or going down by their class
 * @param {OceanFrame} frame - Frame
 * @param {OceanShip[]} ships - Ships, wrecks at rest left out
 * @param {SeaMark[]} marks - Marks shown
 * @return {void}
 */

export const paintShips = (frame: OceanFrame, ships: OceanShip[], marks: SeaMark[]): void => {
  const sight = sightOf(frame)
  for (const entry of ships) {
    if (!isInSight(sight, entry.ship)) continue
    const sunk = sunkOf(entry, frame.now)
    // A hidden ship shows only once it sinks
    if (entry.isWreck && sunk < 0 && !entry.isKnown) continue
    atPose(frame, entry, () =>
      sunk < 0 ? paintAfloat(frame, entry, marks) : paintSinking(frame, entry.ship, sunk)
    )
  }
}

/**
 * Wrecks at rest, painted once into the still layer
 * @param {OceanFrame} frame - Frame
 * @param {OceanShip[]} wrecks - Wrecks down
 * @return {void}
 */

export const paintWrecks = (frame: OceanFrame, wrecks: OceanShip[]): void => {
  const sight = sightOf(frame)
  for (const entry of wrecks) {
    if (isInSight(sight, entry.ship)) atPose(frame, entry, () => paintSinking(frame, entry.ship, 1))
  }
}
