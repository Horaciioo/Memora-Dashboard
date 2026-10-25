import type { GolfBody } from '@/core/lib/play/golf/body'
import { speedOf } from '@/core/lib/play/golf/body'
import { isEffectActive } from '@/core/lib/play/golf/effects'
import type { GolfHazard, GolfPad, GolfPoint } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

const { physics, surfaces } = GOLF_SETTINGS

/**
 * Friction factor of a slab
 * @param {GolfPad | null} pad - Slab
 * @return {number} - Factor
 */

const surfaceGrip = (pad: GolfPad | null): number =>
  pad ? (surfaces[pad.surface as keyof typeof surfaces] ?? 1) : 1

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
 * @return {boolean} - Can rest
 */

export const canRest = (body: GolfBody): boolean =>
  speedOf(body) < physics.restSpeed &&
  !body.pad?.push &&
  slopePull(body.pad) <= physics.rolling * surfaceGrip(body.pad)

/**
 * Swirl of the tornados met
 * @param {GolfBody} body - Body
 * @param {GolfHazard[]} hazards - Laid powers
 * @param {number} at - Server ms
 * @return {[number, number]} - Acceleration
 */

const tornadoPull = (body: GolfBody, hazards: GolfHazard[], at: number): [number, number] => {
  const { radius, swirl, push } = GOLF_SETTINGS.powers.tornado
  let ax = 0
  let az = 0
  for (const hazard of hazards) {
    if (hazard.power !== GolfPowers.Tornado || hazard.ownerId === body.id) continue
    if (!isEffectActive(hazard, at)) continue
    const dx = body.x - hazard.x
    const dz = body.z - hazard.z
    const distance = Math.hypot(dx, dz)
    if (distance >= radius || distance < 1e-3) continue
    // Round and out
    const strength = 1 - distance / radius
    ax += ((-dz * swirl + dx * push) / distance) * strength
    az += ((dx * swirl + dz * push) / distance) * strength
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
 * One step of slopes, boosts, tornados, cup and friction
 * @param {GolfBody} body - Body
 * @param {Object} context - Course state
 * @param {GolfHazard[]} context.hazards - Laid powers
 * @param {GolfPoint} context.cup - Cup
 * @param {number} context.at - Server ms
 * @param {number} dt - Seconds
 * @return {void}
 */

export const pushBody = (
  body: GolfBody,
  { hazards, cup, at }: { hazards: GolfHazard[]; cup: GolfPoint; at: number },
  dt: number
): void => {
  const pad = body.pad
  const [swirlX, swirlZ] = body.isGhost ? [0, 0] : tornadoPull(body, hazards, at)
  const [cupX, cupZ] = cupPull(body, cup)
  const boost = pad?.push ? physics.boostAccel : 0

  // Accelerations
  body.vx +=
    (-physics.gravity * (pad?.gx ?? 0) + (pad?.push?.[0] ?? 0) * boost + swirlX + cupX) * dt
  body.vz +=
    (-physics.gravity * (pad?.gz ?? 0) + (pad?.push?.[1] ?? 0) * boost + swirlZ + cupZ) * dt

  // Rolling friction, never reversing
  const speed = speedOf(body)
  if (speed < 1e-9) return
  const slowed =
    Math.max(0, speed - physics.rolling * surfaceGrip(pad) * dt) * (1 - physics.damping * dt)
  const capped = Math.min(slowed, physics.speedCap)
  body.vx *= capped / speed
  body.vz *= capped / speed
}
