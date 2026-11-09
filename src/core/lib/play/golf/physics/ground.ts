import type { GolfBody } from '@/core/lib/play/golf/physics/body'
import { halt, isInPlay } from '@/core/lib/play/golf/physics/body'
import { fallCup, rollCup } from '@/core/lib/play/golf/course/cup'
import { crossObstacles } from '@/core/lib/play/golf/physics/obstacles'
import { pickOrbs } from '@/core/lib/play/golf/course/orbs'
import { padHeight, padHolds, padUnder } from '@/core/lib/play/golf/physics/terrain'
import type { GolfPad } from '@/core/lib/play/golf/types'
import type { GolfWorld } from '@/core/lib/play/golf/physics/world'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfSurfaces } from '@/utils/constants/play'

const { physics } = GOLF_SETTINGS

/**
 * Ball lost in the void or the water
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {'fall' | 'splash'} kind - Sound
 * @return {void}
 */

const loseBall = (world: GolfWorld, body: GolfBody, kind: 'fall' | 'splash'): void => {
  body.hasFallen = true
  halt(body)
  world.emit(kind, body.id)
}

/**
 * Ghost floats over everything, back to its spot when it stops in the void
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {boolean} isResting - Just stopped
 * @return {void}
 */

const floatGhost = (world: GolfWorld, body: GolfBody, isResting: boolean): void => {
  const { pads, bounds } = world.input.hole
  // Course box keeps it in
  if (body.x < bounds.x0 || body.x > bounds.x1) body.vx *= -1
  if (body.z < bounds.z0 || body.z > bounds.z1) body.vz *= -1
  body.x = Math.min(bounds.x1, Math.max(bounds.x0, body.x))
  body.z = Math.min(bounds.z1, Math.max(bounds.z0, body.z))

  const pad = padUnder(pads, body.x, body.z)
  const isLost = !pad || pad.surface === GolfSurfaces.Water
  if (isResting && isLost) {
    body.x = body.originX
    body.z = body.originZ
    world.emit('fall', body.id)
  }
  body.pad = isLost && !isResting ? null : padUnder(pads, body.x, body.z)
  if (body.pad) body.y = padHeight(body.pad, body.x, body.z)
}

/**
 * Ball leaving the ground, its slope speed kept
 * @param {GolfBody} body - Body
 * @return {void}
 */

const takeOff = (body: GolfBody): void => {
  // Ramp lip throws it up
  body.vy = body.pad ? body.pad.gx * body.vx + body.pad.gz * body.vz : 0
  body.isAirborne = true
  body.pad = null
}

/**
 * Ball meeting the ground, bouncing when it lands hard
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {GolfPad} pad - Slab landed on
 * @return {void}
 */

const land = (world: GolfWorld, body: GolfBody, pad: GolfPad): void => {
  body.y = padHeight(pad, body.x, body.z)
  body.pad = pad
  if (pad.surface === GolfSurfaces.Water) return loseBall(world, body, 'splash')
  const impact = -body.vy
  if (impact > physics.hitSound) world.emit('land', body.id, impact)

  // Hard landings hop again
  body.vx *= physics.landKeep
  body.vz *= physics.landKeep
  if (impact > physics.hopSpeed) body.vy = impact * physics.groundBounce
  else {
    body.vy = 0
    body.isAirborne = false
  }
}

/**
 * Flight under gravity until a slab or the void
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {number} dt - Seconds
 * @return {void}
 */

const fly = (world: GolfWorld, body: GolfBody, dt: number): void => {
  body.vy -= physics.fall * dt
  body.y += body.vy * dt
  const pad = padUnder(world.input.hole.pads, body.x, body.z, body.y)
  if (pad && body.vy <= 0 && body.y <= padHeight(pad, body.x, body.z)) return land(world, body, pad)
  if (body.y < world.voidFloor) loseBall(world, body, 'fall')
}

/**
 * Rolling on a slab, off the edge into the air
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

const roll = (world: GolfWorld, body: GolfBody): void => {
  // Same slab while it holds, else the one under
  const { pads } = world.input.hole
  const pad =
    body.pad && padHolds(body.pad, body.x, body.z)
      ? body.pad
      : padUnder(pads, body.x, body.z, body.y)
  if (!pad || padHeight(pad, body.x, body.z) < body.y - physics.stepUp) return takeOff(body)
  if (pad.surface === GolfSurfaces.Water) return loseBall(world, body, 'splash')
  body.pad = pad
  body.y = padHeight(pad, body.x, body.z)
}

/**
 * Ground under a ball after a move: roll, flight, cup and orbs
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {Object} step - Moment
 * @param {number} step.at - Server ms
 * @param {number} step.dt - Seconds moved
 * @param {boolean} [isResting] - Just stopped
 * @return {void}
 */

export const settleGround = (
  world: GolfWorld,
  body: GolfBody,
  { at, dt }: { at: number; dt: number },
  isResting = false
): void => {
  if (body.cupStage === 'falling') return fallCup(world, body, dt)
  if (!isInPlay(body)) return
  if (body.isGhost) floatGhost(world, body, isResting)
  else if (body.isAirborne) fly(world, body, dt)
  else roll(world, body)
  if (!isInPlay(body)) return
  crossObstacles(world, body)
  if (!body.isAirborne) rollCup(world, body)
  if (isInPlay(body)) pickOrbs(world, body, at)
}
