import type { GolfCupStage } from '@/core/lib/play/golf/course/cup'
import { activePowers, ballScale, isEffectActive } from '@/core/lib/play/golf/powers/effects'
import { padHeight, padUnder } from '@/core/lib/play/golf/physics/terrain'
import type { GolfBallInput, GolfEffect, GolfPad, GolfShotInput } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

// Strong kick or a jump
export type GolfBounceKind = 'bumper' | 'boing'

/**
 * Bumper ball effect running
 * @param {GolfEffect[]} effects - Effects
 * @param {number} at - Server ms
 * @return {Pick<GolfBody, 'bounce' | 'bounceLeft'>} - Kind and hits left
 */

const bounceOf = (effects: GolfEffect[], at: number): Pick<GolfBody, 'bounce' | 'bounceLeft'> => {
  const running = effects.find(
    (effect) =>
      (effect.power === GolfPowers.BumperMan || effect.power === GolfPowers.BoingBoing) &&
      isEffectActive(effect, at)
  )
  if (!running) return { bounce: null, bounceLeft: 0 }

  return {
    bounce: running.power === GolfPowers.BumperMan ? 'bumper' : 'boing',
    bounceLeft: running.lives ?? 0,
  }
}

/**
 * Ball inside the simulation
 * @typedef {Object} GolfBody
 */

export interface GolfBody {
  id: string
  x: number
  z: number
  // Spot before the substep move
  lastX: number
  lastZ: number
  // Height of the ball bottom
  y: number
  vx: number
  vz: number
  vy: number
  radius: number
  mass: number
  // Rest spot before the shot
  originX: number
  originZ: number
  pad: GolfPad | null
  isMoving: boolean
  // Flying over the ground
  isAirborne: boolean
  hasMoved: boolean
  isHoled: boolean
  hasFallen: boolean
  isGhost: boolean
  isSticky: boolean
  isUntouchable: boolean
  powerScale: number
  // Top roll speed, lifted by a flash
  speedCap: number
  // Stroke boosted by a flash
  isFlash: boolean
  canPick: boolean
  // Funnel, pit or holed
  cupStage: GolfCupStage
  // Hole last met, in the cups of the hole
  cupIndex: number
  // Just out of a ring, until it leaves every ring
  isPortalLocked: boolean
  // Stroke leaves the ground
  isLob: boolean
  // Bumper ball sending others back, hits left
  bounce: GolfBounceKind | null
  bounceLeft: number
  path: number[]
}

/**
 * Ball at rest, its powers applied
 * @param {GolfBallInput} ball - Ball
 * @param {GolfShotInput} input - Shot
 * @return {GolfBody} - Body
 */

export const createBody = (ball: GolfBallInput, input: GolfShotInput): GolfBody => {
  const powers = activePowers(ball.effects, input.at)
  const scale = ballScale(powers)
  const pad = padUnder(input.hole.pads, ball.x, ball.z)
  // Flash only boosts its own stroke
  const isFlash = ball.id === input.shooterId && powers.has(GolfPowers.Flash)
  const flashScale = isFlash ? GOLF_SETTINGS.powers.flash.power : 1

  return {
    id: ball.id,
    x: ball.x,
    z: ball.z,
    lastX: ball.x,
    lastZ: ball.z,
    y: pad ? padHeight(pad, ball.x, ball.z) : 0,
    vx: 0,
    vz: 0,
    vy: 0,
    radius: GOLF_SETTINGS.physics.ballRadius * scale,
    mass: scale * scale,
    originX: ball.x,
    originZ: ball.z,
    pad,
    isMoving: false,
    isAirborne: false,
    hasMoved: false,
    isHoled: false,
    hasFallen: false,
    // Ghost only carries its own stroke
    isGhost: ball.id === input.shooterId && powers.has(GolfPowers.Ghost),
    isSticky: powers.has(GolfPowers.Sticky),
    isUntouchable: powers.has(GolfPowers.AntiCollision),
    powerScale: (powers.has(GolfPowers.Mini) ? GOLF_SETTINGS.powers.mini.power : 1) * flashScale,
    speedCap: GOLF_SETTINGS.physics.speedCap * flashScale,
    isFlash,
    canPick: ball.canPick,
    cupStage: 'none',
    cupIndex: 0,
    isPortalLocked: false,
    isLob: ball.id === input.shooterId && powers.has(GolfPowers.Lob),
    ...bounceOf(ball.effects, input.at),
    path: [],
  }
}

/**
 * Speed of a body
 * @param {GolfBody} body - Body
 * @return {number} - Metres per second
 */

export const speedOf = (body: GolfBody): number => Math.hypot(body.vx, body.vz)

/**
 * Body set in motion
 * @param {GolfBody} body - Body
 * @return {void}
 */

export const wake = (body: GolfBody): void => {
  body.isMoving = true
  body.hasMoved = true
}

/**
 * Body brought to rest
 * @param {GolfBody} body - Body
 * @return {void}
 */

export const halt = (body: GolfBody): void => {
  body.vx = 0
  body.vz = 0
  body.vy = 0
  body.isMoving = false
  body.isAirborne = false
}

/**
 * Body still on the course, a ball dropping in the pit gone from it
 * @param {GolfBody} body - Body
 * @return {boolean} - In play
 */

export const isInPlay = (body: GolfBody): boolean =>
  !body.isHoled && !body.hasFallen && body.cupStage !== 'falling'
