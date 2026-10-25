import type { GolfBody } from '@/core/lib/play/golf/body'
import { halt, isInPlay, speedOf } from '@/core/lib/play/golf/body'
import { padHeight, padHolds, padUnder } from '@/core/lib/play/golf/terrain'
import type { GolfWorld } from '@/core/lib/play/golf/world'
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
 * Cup takes a slow ball, a fast one lips out
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

const reachCup = (world: GolfWorld, body: GolfBody): void => {
  const [cupX, cupZ] = world.input.hole.cup
  const isOver =
    Math.hypot(body.x - cupX, body.z - cupZ) < physics.cupRadius &&
    Math.abs(body.y - world.cupFloor) <= physics.stepUp
  if (!isOver) {
    body.inCup = false
    return
  }

  if (speedOf(body) <= physics.captureSpeed * body.captureScale) {
    body.x = cupX
    body.z = cupZ
    body.isHoled = true
    halt(body)
    world.emit('cup', body.id)
  } else if (!body.inCup) {
    body.inCup = true
    body.vx *= physics.lipKeep
    body.vz *= physics.lipKeep
    world.emit('lip', body.id)
  }
}

/**
 * Free hand takes an orb rolled over
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {number} at - Server ms
 * @return {void}
 */

const pickOrbs = (world: GolfWorld, body: GolfBody, at: number): void => {
  if (!body.canPick) return
  world.input.hole.orbs.forEach(([orbX, orbZ], index) => {
    if (!body.canPick || world.orbs[index] > at) return
    if (Math.hypot(body.x - orbX, body.z - orbZ) > GOLF_SETTINGS.orbs.radius + body.radius) return
    world.orbs[index] = at + GOLF_SETTINGS.orbs.respawnSeconds * 1000
    body.canPick = false
    world.pickups.push({ id: body.id, orb: index, at })
    world.emit('orb', body.id)
  })
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
 * Ground under a ball after a move: slab, drop, void, cup and orbs
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {number} at - Server ms
 * @param {boolean} [isResting] - Just stopped
 * @return {void}
 */

export const settleGround = (
  world: GolfWorld,
  body: GolfBody,
  at: number,
  isResting = false
): void => {
  if (!isInPlay(body)) return
  if (body.isGhost) floatGhost(world, body, isResting)
  else {
    // Same slab while it holds, else the one under
    const { pads } = world.input.hole
    const pad =
      body.pad && padHolds(body.pad, body.x, body.z)
        ? body.pad
        : padUnder(pads, body.x, body.z, body.y)
    if (!pad || pad.surface === GolfSurfaces.Water)
      return loseBall(world, body, pad ? 'splash' : 'fall')
    body.pad = pad
    body.y = padHeight(pad, body.x, body.z)
  }
  reachCup(world, body)
  pickOrbs(world, body, at)
}
