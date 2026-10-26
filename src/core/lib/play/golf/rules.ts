import { padUnder } from '@/core/lib/play/golf/terrain'
import type { GolfHole } from '@/core/lib/play/golf/types'
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
  player: { holedAt: Date | string | null; strokes: number },
  maxStrokes: number
): number =>
  player.holedAt
    ? player.strokes
    : (Number.isFinite(maxStrokes) ? maxStrokes : player.strokes) + GOLF_SETTINGS.missPenalty

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

  return [hole.cup, hole.tee].every(([pointX, pointZ]) => Math.hypot(x - pointX, z - pointZ) >= gap)
}

/**
 * Hand after a pickup, nothing taken once full
 * @param {string[]} hand - Powers in hand
 * @param {string} power - Power picked
 * @return {string[]} - Hand
 */

export const addToHand = (hand: string[], power: string): string[] =>
  hand.length >= GOLF_SETTINGS.hand ? hand : [...hand, power]

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
 * Rival nearest the cup, still on the hole
 * @param {T[]} players - Players
 * @param {GolfHole} hole - Hole
 * @param {string} selfId - Player asking
 * @return {string | null} - Account, none when alone
 */

export const closestRival = <
  T extends { accountId: string; x: number; z: number; isDone: boolean; hasLeft: boolean },
>(
  players: T[],
  hole: GolfHole,
  selfId: string
): string | null => {
  const [cupX, cupZ] = hole.cup
  const rivals = players
    .filter((player) => player.accountId !== selfId && !player.isDone && !player.hasLeft)
    .toSorted(
      (left, right) =>
        Math.hypot(left.x - cupX, left.z - cupZ) - Math.hypot(right.x - cupX, right.z - cupZ)
    )

  return rivals[0]?.accountId ?? null
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
 * Aim swaying side to side, wider the harder the pull, bent by the aim powers
 * @param {number} angle - Pulled angle
 * @param {number} power - Pull
 * @param {number} seconds - Time aiming
 * @param {Set<GolfPowerName>} [powers] - Powers on the ball
 * @return {number} - Angle shot
 */

export const swayedAngle = (
  angle: number,
  power: number,
  seconds: number,
  powers: Set<GolfPowerName> = new Set()
): number => {
  const twist = powers.has(GolfPowers.Twist) ? GOLF_SETTINGS.powers.twist.turn * seconds : 0
  if (powers.has(GolfPowers.Steady)) return angle + twist

  return (
    angle +
    twist +
    Math.sin(seconds * 2 * Math.PI * GOLF_SETTINGS.aim.wobbleHz) * GOLF_SETTINGS.aim.wobble * power
  )
}

/**
 * Angle the arrow shows, turned around by the mirror
 * @param {number} angle - Angle shot
 * @param {Set<GolfPowerName>} powers - Powers on the ball
 * @return {number} - Angle drawn
 */

export const shownAngle = (angle: number, powers: Set<GolfPowerName>): number =>
  powers.has(GolfPowers.Mirror) ? angle + Math.PI : angle

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
