import { activePowers, ballScale } from '@/core/lib/play/golf/effects'
import { padHeight, padUnder } from '@/core/lib/play/golf/terrain'
import type { GolfBallInput, GolfPad, GolfShotInput } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

/**
 * Ball inside the simulation
 * @typedef {Object} GolfBody
 */

export interface GolfBody {
  id: string
  x: number
  z: number
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
  captureScale: number
  powerScale: number
  // Top roll speed, lifted by a flash
  speedCap: number
  // Stroke boosted by a flash
  isFlash: boolean
  canPick: boolean
  // Rolling over the cup
  inCup: boolean
  // Just out of a ring, until it leaves every ring
  isPortalLocked: boolean
  // Stroke leaves the ground
  isLob: boolean
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
    captureScale: powers.has(GolfPowers.Giant) ? GOLF_SETTINGS.powers.giant.capture : 1,
    powerScale:
      (powers.has(GolfPowers.Mini) ? GOLF_SETTINGS.powers.mini.power : 1) *
      (powers.has(GolfPowers.Turbo) ? GOLF_SETTINGS.powers.turbo.power : 1) *
      flashScale,
    speedCap: GOLF_SETTINGS.physics.speedCap * flashScale,
    isFlash,
    canPick: ball.canPick,
    inCup: false,
    isPortalLocked: false,
    isLob: ball.id === input.shooterId && powers.has(GolfPowers.Lob),
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
 * Body still on the course
 * @param {GolfBody} body - Body
 * @return {boolean} - In play
 */

export const isInPlay = (body: GolfBody): boolean => !body.isHoled && !body.hasFallen
