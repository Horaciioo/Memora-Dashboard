import { padUnder } from '@/core/lib/play/golf/physics/terrain'
import type { GolfCup, GolfHole } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPhases, GolfPowers, GolfSurfaces } from '@/utils/constants/play'
import type { GolfPhaseName, GolfPowerName } from '@/utils/constants/play'

// Moment as stored, sent or counted
type GolfMoment = Date | string | number

/**
 * Timers of the hole in play
 * @typedef {Object} GolfClock
 */

export interface GolfClock {
  hole: number
  startsAt: GolfMoment
  endsAt: GolfMoment
  closedAt: GolfMoment | null
}

/**
 * Milliseconds of a moment
 * @param {GolfMoment} date - Moment
 * @return {number} - Epoch ms
 */

const msOf = (date: GolfMoment): number => new Date(date).getTime()

/**
 * Stage of the hole at a moment
 * @param {GolfClock} clock - Hole timers
 * @param {number} now - Server ms
 * @param {number} holes - Holes of the game
 * @return {GolfPhaseName} - Stage
 */

export const golfPhase = (clock: GolfClock, now: number, holes: number): GolfPhaseName => {
  if (clock.closedAt && now >= msOf(clock.closedAt)) {
    return clock.hole + 1 >= holes ? GolfPhases.Over : GolfPhases.Closed
  }

  return now < msOf(clock.startsAt) ? GolfPhases.Countdown : GolfPhases.Playing
}

/**
 * Player finished with the hole
 * @param {{ holedAt: Date | string | null, strokes: number }} player - Player
 * @param {number} maxStrokes - Stroke ceiling
 * @return {boolean} - Done
 */

export const isHoleDone = (
  player: { holedAt: Date | string | null; strokes: number },
  maxStrokes: number
): boolean => Boolean(player.holedAt) || player.strokes >= maxStrokes

/**
 * Strokes written on the card
 * @param {{ holedAt: Date | string | null, strokes: number }} player - Player
 * @param {number} maxStrokes - Stroke ceiling
 * @return {number} - Hole score
 */

export const holeScore = (
  player: { holedAt: Date | string | null; strokes: number; x?: number; z?: number },
  maxStrokes: number,
  hole?: GolfHole
): number => {
  // Scoring hole: the points of the cup the ball sleeps in, written below zero
  if (hole?.isScoring)
    return 0 - (player.holedAt ? cupPoints(hole, player.x ?? 0, player.z ?? 0) : 0)

  return player.holedAt
    ? player.strokes
    : (Number.isFinite(maxStrokes) ? maxStrokes : player.strokes) + GOLF_SETTINGS.missPenalty
}

/**
 * Score of every player on a hole, the first ball holed winning the time bonus
 * @param {Object[]} players - Players of the hole
 * @param {number} maxStrokes - Stroke ceiling
 * @param {GolfHole} [hole] - Hole
 * @return {number[]} - Scores, in the order of the players
 */

export const holeScores = <
  T extends { holedAt: Date | string | null; strokes: number; x?: number; z?: number },
>(
  players: T[],
  maxStrokes: number,
  hole?: GolfHole
): number[] => {
  const times = players.map((player) => (player.holedAt ? msOf(player.holedAt) : Infinity))
  const first = Math.min(...times)

  return players.map((player, index) => {
    const base = holeScore(player, maxStrokes, hole)

    return hole?.timeBonus && Number.isFinite(first) && times[index] === first
      ? base - hole.timeBonus
      : base
  })
}

/**
 * Points of the cup nearest to a spot
 * @param {GolfHole} hole - Hole
 * @param {number} x - Ball x
 * @param {number} z - Ball z
 * @return {number} - Points
 */

export const cupPoints = (hole: GolfHole, x: number, z: number): number =>
  cupNear(hole, x, z).points

/**
 * Hole nearest to a spot, the first one when no spot is known
 * @param {GolfHole} hole - Hole
 * @param {number} x - Spot x
 * @param {number} z - Spot z
 * @return {GolfCup} - Hole
 */

export const cupNear = (hole: GolfHole, x: number, z: number): GolfCup =>
  hole.cups.reduce(
    (best, spot) =>
      Math.hypot(spot.x - x, spot.z - z) < Math.hypot(best.x - x, best.z - z) ? spot : best,
    hole.cups[0]
  )

/**
 * Card cell as shown: strokes, or points when written at or below zero
 * @param {number} value - Card cell
 * @return {string} - Text
 */

export const cardCell = (value: number): string => (value > 0 ? `${value}` : `${-value} pt`)

/**
 * Strokes of a whole card
 * @param {number[]} card - Hole scores
 * @return {number} - Total
 */

export const cardTotal = (card: number[]): number => card.reduce((sum, strokes) => sum + strokes, 0)

/**
 * Point where a laid power may stand
 * @param {GolfHole} hole - Hole
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @return {boolean} - Allowed
 */

export const canPlaceAt = (hole: GolfHole, x: number, z: number): boolean => {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false
  const pad = padUnder(hole.pads, x, z)
  if (!pad || pad.surface === GolfSurfaces.Water) return false
  const gap = GOLF_SETTINGS.placementGap

  return [...hole.cups.map((spot): [number, number] => [spot.x, spot.z]), hole.tee].every(
    ([pointX, pointZ]) => Math.hypot(x - pointX, z - pointZ) >= gap
  )
}

/**
 * Half side of the teleporter square, in metres
 * @return {number} - Reach from the ball
 */

export const teleportReach = (): number =>
  (GOLF_SETTINGS.powers.teleport.cells * GOLF_SETTINGS.grid.cell) / 2

/**
 * Spot a ball may teleport to: in its square, on a slab, clear of blocks and bumpers, walls crossed freely
 * @param {GolfHole} hole - Hole
 * @param {{ x: number, z: number }} ball - Ball at rest
 * @param {{ x: number, z: number }} spot - Spot asked
 * @return {boolean} - Allowed
 */

export const canTeleportTo = (
  hole: GolfHole,
  ball: { x: number; z: number },
  spot: { x: number; z: number }
): boolean => {
  const reach = teleportReach()
  if (Math.abs(spot.x - ball.x) > reach || Math.abs(spot.z - ball.z) > reach) return false
  if (!canPlaceAt(hole, spot.x, spot.z)) return false
  const radius = GOLF_SETTINGS.physics.ballRadius
  const isInBlock = hole.blocks.some(
    (block) =>
      spot.x > block.x0 - radius &&
      spot.x < block.x1 + radius &&
      spot.z > block.z0 - radius &&
      spot.z < block.z1 + radius
  )

  return (
    !isInBlock &&
    hole.bumpers.every(
      (bumper) => Math.hypot(spot.x - bumper.x, spot.z - bumper.z) > bumper.r + radius
    )
  )
}

/**
 * Hand after a pickup, nothing taken once full
 * @param {string[]} hand - Powers in hand
 * @param {string} power - Power picked
 * @param {number} [size] - Hand size
 * @return {string[]} - Hand
 */

export const addToHand = (hand: string[], power: string, size = GOLF_SETTINGS.hand): string[] =>
  hand.length >= size ? hand : [...hand, power]

/**
 * Free spot near a ball on its slab, for a push at random
 * @param {GolfHole} hole - Hole
 * @param {number} x - Ball x
 * @param {number} z - Ball z
 * @param {() => number} [random] - Random source
 * @return {{ x: number, z: number }} - Spot, the ball's own when none fits
 */

export const scatterSpot = (
  hole: GolfHole,
  x: number,
  z: number,
  random: () => number = Math.random
): { x: number; z: number } => {
  const { reach, tries } = GOLF_SETTINGS.powers.fart
  // Same slab, never through a wall
  const home = padUnder(hole.pads, x, z)
  for (let index = 0; index < tries; index += 1) {
    const angle = random() * 2 * Math.PI
    const distance = reach * (0.5 + random() / 2)
    const spot = { x: x + Math.sin(angle) * distance, z: z + Math.cos(angle) * distance }
    const pad = padUnder(hole.pads, spot.x, spot.z)
    const isInBlock = hole.blocks.some(
      (block) => spot.x > block.x0 && spot.x < block.x1 && spot.z > block.z0 && spot.z < block.z1
    )
    if (home && pad === home && pad.surface !== GolfSurfaces.Water && !isInBlock) return spot
  }

  return { x, z }
}

/**
 * Angle and length of a pull, zero angle toward +z
 * @param {number} dx - Shot x
 * @param {number} dz - Shot z
 * @return {{ angle: number, length: number }} - Direction
 */

export const shotVector = (dx: number, dz: number): { angle: number; length: number } => ({
  angle: Math.atan2(dx, dz),
  length: Math.hypot(dx, dz),
})

/**
 * Players by total, fewest strokes first, leavers last
 * @param {T[]} players - Players with their totals
 * @return {T[]} - Ranking
 */

export const rankCards = <T extends { hasLeft: boolean; total: number }>(players: T[]): T[] =>
  players.toSorted(
    (left, right) => Number(left.hasLeft) - Number(right.hasLeft) || left.total - right.total
  )

/**
 * Pull being aimed
 * @typedef {Object} GolfAimGesture
 */

export interface GolfAimGesture {
  // Pulled angle, zero toward +z
  angle: number
  power: number
  // Time aiming
  seconds: number
  // Camera look when the pull began, the mirror axis
  axis?: number
}

/**
 * Angle of the arrow, the one the ball leaves on: mirrored gesture, twist and sway
 * @param {GolfAimGesture} gesture - Pull
 * @param {Set<GolfPowerName>} [powers] - Powers on the ball
 * @return {number} - Angle
 */

export const aimOf = (
  { angle, power, seconds, axis = angle }: GolfAimGesture,
  powers: Set<GolfPowerName> = new Set()
): number => {
  // Mirror swaps left and right around the look
  const pulled = powers.has(GolfPowers.Mirror) ? 2 * axis - angle : angle
  const twist = powers.has(GolfPowers.Twist) ? GOLF_SETTINGS.powers.twist.turn * seconds : 0
  // Steady drops the sway, never the twist
  if (powers.has(GolfPowers.Steady)) return pulled + twist
  const { wobble, wobbleHz } = GOLF_SETTINGS.aim

  return pulled + twist + Math.sin(seconds * 2 * Math.PI * wobbleHz) * wobble * power
}

/**
 * Arrow and gauge hidden
 * @param {Set<GolfPowerName>} powers - Powers on the ball
 * @return {boolean} - Blind
 */

export const isAimHidden = (powers: Set<GolfPowerName>): boolean => powers.has(GolfPowers.Blind)

/**
 * Hole played in one stroke
 * @param {{ holedAt: Date | string | null, strokes: number }} player - Player
 * @return {boolean} - Hole in one
 */

export const isHoleInOne = (player: { holedAt: Date | string | null; strokes: number }): boolean =>
  Boolean(player.holedAt) && player.strokes === 1

/**
 * Players with the fewest strokes on a hole
 * @param {Object[]} players - Players with their card
 * @param {number} hole - Hole index
 * @return {Object[]} - Winners, none while nobody holed
 */

export const holeWinners = <T extends { hasLeft: boolean; card: number[] }>(
  players: T[],
  hole: number
): T[] => {
  const played = players.filter((player) => !player.hasLeft && player.card[hole] !== undefined)
  const best = Math.min(...played.map((player) => player.card[hole]))

  return played.filter((player) => player.card[hole] === best)
}

/**
 * Stroke speed from a pull, small pulls kept fine
 * @param {number} power - Pull, 0 to 1
 * @param {number} [scale] - Ball power factor
 * @return {number} - Metres per second
 */

export const shotSpeed = (power: number, scale = 1): number =>
  Math.min(1, Math.max(0, power)) ** GOLF_SETTINGS.aim.curve *
  GOLF_SETTINGS.physics.maxSpeed *
  scale
