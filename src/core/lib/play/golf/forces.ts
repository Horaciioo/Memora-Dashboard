import type { GolfBody } from '@/core/lib/play/golf/body'
import { speedOf } from '@/core/lib/play/golf/body'
import { isEffectActive } from '@/core/lib/play/golf/effects'
import { gustPush, hazardSpot, isIced, obstaclePull } from '@/core/lib/play/golf/obstacles'
import type { GolfHazard, GolfHole, GolfPad, GolfPoint } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

const { physics, surfaces } = GOLF_SETTINGS

/**
 * Friction factor of a slab, never above the grip of a frozen course
 * @param {GolfPad | null} pad - Slab
 * @param {boolean} iced - Course frozen
 * @return {number} - Factor
 */

const surfaceGrip = (pad: GolfPad | null, iced: boolean): number => {
  const grip = pad ? (surfaces[pad.surface as keyof typeof surfaces] ?? 1) : 1

  return iced ? Math.min(grip, GOLF_SETTINGS.powers.ice.grip) : grip
}

/**
 * Pull of a slope
 * @param {GolfPad | null} pad - Slab
 * @return {number} - Acceleration
 */

const slopePull = (pad: GolfPad | null): number =>
  pad ? physics.gravity * Math.hypot(pad.gx, pad.gz) : 0

/**
 * Body able to stop where it is
 * @param {GolfBody} body - Body
 * @param {boolean} iced - Course frozen
 * @return {boolean} - Can rest
 */

export const canRest = (body: GolfBody, iced: boolean): boolean =>
  !body.isAirborne &&
  speedOf(body) < physics.restSpeed &&
  !body.pad?.push &&
  slopePull(body.pad) <= physics.rolling * surfaceGrip(body.pad, iced)

/**
 * Swirl of the tornados met: spun fast round the eye, drawn in outside it, thrown out inside
 * @param {GolfBody} body - Body
 * @param {GolfHazard[]} hazards - Laid powers
 * @param {number} at - Server ms
 * @return {[number, number]} - Acceleration
 */

const tornadoPull = (body: GolfBody, hazards: GolfHazard[], at: number): [number, number] => {
  const { radius, swirl, push, pull, core } = GOLF_SETTINGS.powers.tornado
  const eye = radius * core
  let ax = 0
  let az = 0
  for (const hazard of hazards) {
    if (hazard.power !== GolfPowers.Tornado || hazard.ownerId === body.id) continue
    if (!isEffectActive(hazard, at)) continue
    const spot = hazardSpot(hazard, at)
    const dx = body.x - spot.x
    const dz = body.z - spot.z
    const distance = Math.hypot(dx, dz)
    if (distance >= radius || distance < 1e-3) continue
    // Fastest at the eye wall, fading to the edge
    const fade = 1 - distance / radius
    const wind = distance < eye ? distance / eye : eye / distance
    const radial = distance < eye ? push * (1 - distance / eye) : -pull * fade
    ax += (-dz * swirl * wind * fade + dx * radial) / distance
    az += (dx * swirl * wind * fade + dz * radial) / distance
  }

  return [ax, az]
}

/**
 * Pull of the cup on a slow ball
 * @param {GolfBody} body - Body
 * @param {GolfPoint} cup - Cup
 * @return {[number, number]} - Acceleration
 */

const cupPull = (body: GolfBody, cup: GolfPoint): [number, number] => {
  const reach = physics.cupRadius * physics.cupPullReach
  const dx = cup[0] - body.x
  const dz = cup[1] - body.z
  const distance = Math.hypot(dx, dz)
  if (distance >= reach || distance < 1e-3) return [0, 0]
  if (speedOf(body) > physics.captureSpeed * body.captureScale) return [0, 0]
  const strength = physics.cupPull * (1 - distance / reach)

  return [(dx / distance) * strength, (dz / distance) * strength]
}

/**
 * One step of slopes, boosts, winds, vortexes, cup and friction
 * @param {GolfBody} body - Body
 * @param {Object} context - Course state
 * @param {GolfHazard[]} context.hazards - Laid powers
 * @param {GolfHole} context.hole - Hole
 * @param {number} context.at - Server ms
 * @param {number} dt - Seconds
 * @return {void}
 */

export const pushBody = (
  body: GolfBody,
  { hazards, hole, at }: { hazards: GolfHazard[]; hole: GolfHole; at: number },
  dt: number
): void => {
  const pad = body.pad
  const cup = hole.cup
  // Gravity alone in the air
  if (body.isAirborne) return
  const [swirlX, swirlZ] = body.isGhost ? [0, 0] : tornadoPull(body, hazards, at)
  const [cupX, cupZ] = cupPull(body, cup)
  const [pullX, pullZ] = body.isGhost ? [0, 0] : obstaclePull(body, hole)
  const [gustX, gustZ] = gustPush(body, hazards, hole, at)
  const boost = pad?.push ? physics.boostAccel : 0

  // Accelerations
  body.vx +=
    (-physics.gravity * (pad?.gx ?? 0) +
      (pad?.push?.[0] ?? 0) * boost +
      swirlX +
      cupX +
      pullX +
      gustX) *
    dt
  body.vz +=
    (-physics.gravity * (pad?.gz ?? 0) +
      (pad?.push?.[1] ?? 0) * boost +
      swirlZ +
      cupZ +
      pullZ +
      gustZ) *
    dt

  // Rolling friction, never reversing
  const speed = speedOf(body)
  if (speed < 1e-9) return
  const grip = surfaceGrip(pad, isIced(hazards, at))
  const slowed = Math.max(0, speed - physics.rolling * grip * dt) * (1 - physics.damping * dt)
  const capped = Math.min(slowed, body.speedCap)
  body.vx *= capped / speed
  body.vz *= capped / speed
}
