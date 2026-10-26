import type { GolfBody } from '@/core/lib/play/golf/body'
import { halt, speedOf } from '@/core/lib/play/golf/body'
import { isEffectActive } from '@/core/lib/play/golf/effects'
import { padByArea, padHeight, padUnder } from '@/core/lib/play/golf/terrain'
import type { GolfHazard, GolfHole, GolfPoint } from '@/core/lib/play/golf/types'
import type { GolfWorld } from '@/core/lib/play/golf/world'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers, GolfSurfaces } from '@/utils/constants/play'

const { obstacles, powers } = GOLF_SETTINGS

/**
 * Spot of a laid power, tornados drift and weave since laid
 * @param {GolfHazard} hazard - Laid power
 * @param {number} at - Server ms
 * @return {{ x: number, z: number }} - Spot
 */

export const hazardSpot = (hazard: GolfHazard, at: number): { x: number; z: number } => {
  if (hazard.power !== GolfPowers.Tornado || hazard.laidAt === undefined) return hazard
  const seconds = Math.max(0, at - hazard.laidAt) / 1000
  const vx = hazard.vx ?? 0
  const vz = hazard.vz ?? 0
  // Sideways swing across the heading
  const length = Math.hypot(vx, vz) || 1
  const weave = powers.tornado.meander * Math.sin(powers.tornado.sway * seconds)

  return {
    x: hazard.x + vx * seconds - (vz / length) * weave,
    z: hazard.z + vz * seconds + (vx / length) * weave,
  }
}

/**
 * Pull of the vortexes and push of the fans
 * @param {GolfBody} body - Body
 * @param {GolfHole} hole - Hole
 * @return {[number, number]} - Acceleration
 */

export const obstaclePull = (body: GolfBody, hole: GolfHole): [number, number] => {
  let ax = 0
  let az = 0
  for (const vortex of hole.vortexes) {
    const dx = vortex.x - body.x
    const dz = vortex.z - body.z
    const distance = Math.hypot(dx, dz)
    if (distance >= vortex.r || distance < 1e-3) continue
    const strength = obstacles.vortexPull * (1 - distance / vortex.r)
    ax += (dx / distance) * strength
    az += (dz / distance) * strength
  }
  for (const fan of hole.fans) {
    if (body.x < fan.x0 || body.x > fan.x1 || body.z < fan.z0 || body.z > fan.z1) continue
    ax += fan.push[0] * obstacles.fanAccel
    az += fan.push[1] * obstacles.fanAccel
  }

  return [ax, az]
}

// Fans already placed per gust
const FAN_SPOTS = new WeakMap<GolfHazard, GolfPoint[]>()

/**
 * Number in [0, 1) from a seed
 * @param {string} seed - Seed
 * @param {number} index - Draw index
 * @return {number} - Number
 */

const unitOf = (seed: string, index: number): number => {
  let hash = 2166136261 ^ index
  for (const letter of seed) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619)
  hash = Math.imul(hash ^ (hash >>> 15), 2246822519)
  hash ^= hash >>> 13

  return (hash >>> 0) / 4294967296
}

/**
 * Fans of a gust, spread over the slabs by area
 * @param {GolfHazard} hazard - Gust
 * @param {GolfHole} hole - Hole
 * @return {GolfPoint[]} - Fan spots
 */

export const gustFans = (hazard: GolfHazard, hole: GolfHole): GolfPoint[] => {
  const known = FAN_SPOTS.get(hazard)
  if (known) return known
  const pads = hole.pads.filter((pad) => pad.surface !== GolfSurfaces.Water)
  const spots = pads.length
    ? Array.from({ length: powers.gust.fans }, (_, index): GolfPoint => {
        const pad = padByArea(pads, unitOf(hazard.id, index * 3))

        return [
          pad.x0 + (pad.x1 - pad.x0) * (0.15 + 0.7 * unitOf(hazard.id, index * 3 + 1)),
          pad.z0 + (pad.z1 - pad.z0) * (0.15 + 0.7 * unitOf(hazard.id, index * 3 + 2)),
        ]
      })
    : []
  FAN_SPOTS.set(hazard, spots)

  return spots
}

/**
 * Push of the gusts on a ball, the layer's own ball spared, stronger by a fan
 * @param {GolfBody} body - Body
 * @param {GolfHazard[]} hazards - Laid powers
 * @param {GolfHole} hole - Hole
 * @param {number} at - Server ms
 * @return {[number, number]} - Acceleration
 */

export const gustPush = (
  body: GolfBody,
  hazards: GolfHazard[],
  hole: GolfHole,
  at: number
): [number, number] => {
  const { accel, radius, boost } = powers.gust
  let ax = 0
  let az = 0
  for (const hazard of hazards) {
    if (hazard.power !== GolfPowers.Gust || hazard.ownerId === body.id) continue
    if (!isEffectActive(hazard, at)) continue
    // Fans add where they stand
    let strength = accel
    for (const [fx, fz] of gustFans(hazard, hole)) {
      const distance = Math.hypot(body.x - fx, body.z - fz)
      if (distance < radius) strength += boost * (1 - distance / radius)
    }
    ax += (hazard.vx ?? 0) * strength
    az += (hazard.vz ?? 0) * strength
  }

  return [ax, az]
}

/**
 * Course frozen by an ice power still running
 * @param {GolfHazard[]} hazards - Laid powers
 * @param {number} at - Server ms
 * @return {boolean} - Frozen
 */

export const isIced = (hazards: GolfHazard[], at: number): boolean =>
  hazards.some((hazard) => hazard.power === GolfPowers.Ice && isEffectActive(hazard, at))

/**
 * Body set on a new spot of the ground
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {number} x - Spot x
 * @param {number} z - Spot z
 * @return {void}
 */

const placeBody = (world: GolfWorld, body: GolfBody, x: number, z: number): void => {
  body.x = x
  body.z = z
  body.pad = padUnder(world.input.hole.pads, x, z)
  if (body.pad) body.y = padHeight(body.pad, x, z)
}

/**
 * Rings send the ball out of their pair, speed kept
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

const passPortals = (world: GolfWorld, body: GolfBody): void => {
  const reach = obstacles.portalRadius
  const entry = world.input.hole.portals.find(
    (portal) => Math.hypot(body.x - portal.from[0], body.z - portal.from[1]) < reach
  )
  // Locked until out of every ring
  if (!entry) {
    body.isPortalLocked = false
    return
  }
  if (body.isPortalLocked) return

  placeBody(world, body, entry.to[0], entry.to[1])
  if (entry.heading !== null) {
    const speed = speedOf(body)
    body.vx = Math.sin(entry.heading) * speed
    body.vz = Math.cos(entry.heading) * speed
  }
  body.isPortalLocked = true
  world.emit('portal', body.id)
}

/**
 * Vortex core sends the ball back to its stroke spot
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

const swallow = (world: GolfWorld, body: GolfBody): void => {
  const isEaten = world.input.hole.vortexes.some(
    (vortex) => Math.hypot(body.x - vortex.x, body.z - vortex.z) < obstacles.vortexCore
  )
  if (!isEaten) return
  placeBody(world, body, body.originX, body.originZ)
  halt(body)
  world.emit('vortex', body.id)
}

/**
 * Rings and vortexes under a rolling ball
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

export const crossObstacles = (world: GolfWorld, body: GolfBody): void => {
  if (body.isAirborne || body.isGhost) return
  passPortals(world, body)
  swallow(world, body)
}
