import { GOAL_STEP, isOnTrack, SAFE_SQUARES, squareOf, YARD_STEP } from '@/core/lib/play/ludo/track'
import type { LudoGameSettings } from '@/core/lib/play/ludo/settings'

/**
 * Colour in play as the rules read it
 * @typedef {Object} LudoSeat
 */

export interface LudoSeat {
  accountId: string
  corner: number
  pawns: number[]
}

/**
 * Pawn standing on a square
 * @typedef {Object} LudoTaken
 */

export interface LudoTaken {
  accountId: string
  pawn: number
  from: number
}

/**
 * One move a die allows
 * @typedef {Object} LudoPlan
 */

export interface LudoPlan {
  pawn: number
  from: number
  to: number
  captures: LudoTaken[]
  isExit: boolean
  isHome: boolean
  isSafe: boolean
  isBarrier: boolean
}

// Weight of each gain when the move is picked for a player
const AUTO_WEIGHTS = { capture: 100, home: 80, exit: 60, safe: 20, progress: 10 }

/**
 * Pawns of the others on a track square
 * @param {LudoSeat[]} seats - Board
 * @param {string} moverId - Player moving
 * @param {number} square - Track square
 * @return {LudoTaken[][]} - Groups by owner
 */

const rivalsOn = (seats: LudoSeat[], moverId: string, square: number): LudoTaken[][] =>
  seats
    .filter((seat) => seat.accountId !== moverId)
    .map((seat) =>
      seat.pawns.flatMap((step, pawn) =>
        isOnTrack(step) && squareOf(seat.corner, step) === square
          ? [{ accountId: seat.accountId, pawn, from: step }]
          : []
      )
    )
    .filter((group) => group.length > 0)

/**
 * Rival wall across the way
 * @param {Object} input - Path
 * @param {LudoSeat[]} input.seats - Board
 * @param {LudoSeat} input.mover - Player moving
 * @param {number} input.first - First step crossed
 * @param {number} input.last - Landing step
 * @return {boolean} - Blocked
 */

const isWalled = ({
  seats,
  mover,
  first,
  last,
}: {
  seats: LudoSeat[]
  mover: LudoSeat
  first: number
  last: number
}): boolean => {
  for (let step = first; step <= last; step += 1) {
    if (!isOnTrack(step)) break
    const groups = rivalsOn(seats, mover.accountId, squareOf(mover.corner, step))
    if (groups.some((group) => group.length > 1)) return true
  }

  return false
}

/**
 * Plan of one pawn, null when the die forbids it
 * @param {Object} input - Move
 * @param {LudoSeat[]} input.seats - Board
 * @param {LudoSeat} input.mover - Player moving
 * @param {number} input.pawn - Pawn index
 * @param {number} input.dice - Die face
 * @param {LudoGameSettings} input.settings - Rules
 * @return {LudoPlan | null} - Plan
 */

const planOf = ({
  seats,
  mover,
  pawn,
  dice,
  settings,
}: {
  seats: LudoSeat[]
  mover: LudoSeat
  pawn: number
  dice: number
  settings: LudoGameSettings
}): LudoPlan | null => {
  const from = mover.pawns[pawn]
  if (from >= GOAL_STEP) return null
  const isExit = from <= YARD_STEP
  if (isExit && !settings.exitFaces.includes(dice)) return null

  // Landing step, overshoot held at home or refused
  const reach = isExit ? 0 : from + dice
  if (reach > GOAL_STEP && settings.rules.exactFinish) return null
  const to = Math.min(reach, GOAL_STEP)

  const { barriers, safeSquares } = settings.rules
  if (barriers && isWalled({ seats, mover, first: isExit ? 0 : from + 1, last: to })) return null

  // Who stands on the landing square
  const square = isOnTrack(to) ? squareOf(mover.corner, to) : null
  const isSafe = square !== null && SAFE_SQUARES.has(square)
  const rivals = square === null ? [] : rivalsOn(seats, mover.accountId, square).flat()
  const mates = isOnTrack(to)
    ? mover.pawns.filter((step, index) => index !== pawn && step === to).length
    : 0

  return {
    pawn,
    from,
    to,
    captures: safeSquares && isSafe ? [] : rivals,
    isExit,
    isHome: to === GOAL_STEP,
    isSafe: safeSquares && isSafe,
    isBarrier: barriers && mates > 0,
  }
}

/**
 * Every move a die allows a player
 * @param {LudoSeat[]} seats - Board, players still in
 * @param {string} moverId - Player on turn
 * @param {number} dice - Die face
 * @param {LudoGameSettings} settings - Rules
 * @return {LudoPlan[]} - Moves, captures only when forced
 */

export const legalMoves = (
  seats: LudoSeat[],
  moverId: string,
  dice: number,
  settings: LudoGameSettings
): LudoPlan[] => {
  const mover = seats.find((seat) => seat.accountId === moverId)
  if (!mover) return []

  const plans = mover.pawns
    .map((_, pawn) => planOf({ seats, mover, pawn, dice, settings }))
    .filter((plan): plan is LudoPlan => plan !== null)
  const captures = plans.filter((plan) => plan.captures.length > 0)

  return settings.rules.forcedCapture && captures.length ? captures : plans
}

/**
 * Moves leading to the same board count once
 * @param {LudoPlan[]} plans - Moves
 * @return {boolean} - Only one real choice
 */

export const isOnlyChoice = (plans: LudoPlan[]): boolean =>
  new Set(plans.map((plan) => `${plan.from}:${plan.to}`)).size === 1

/**
 * Move played for a player who lets the clock run
 * @param {LudoPlan[]} plans - Moves
 * @return {LudoPlan | null} - Best move
 */

export const autoMove = (plans: LudoPlan[]): LudoPlan | null => {
  const worth = (plan: LudoPlan) =>
    Number(plan.captures.length > 0) * AUTO_WEIGHTS.capture +
    Number(plan.isHome) * AUTO_WEIGHTS.home +
    Number(plan.isExit) * AUTO_WEIGHTS.exit +
    Number(plan.isSafe) * AUTO_WEIGHTS.safe +
    (plan.to / GOAL_STEP) * AUTO_WEIGHTS.progress

  return plans.toSorted((left, right) => worth(right) - worth(left))[0] ?? null
}

/**
 * Pawns home for good
 * @param {number[]} pawns - Steps
 * @return {boolean} - All home
 */

export const isAllHome = (pawns: number[]): boolean => pawns.every((step) => step >= GOAL_STEP)

/**
 * Distance covered by a colour
 * @param {number[]} pawns - Steps
 * @return {number} - Steps walked
 */

export const progressOf = (pawns: number[]): number =>
  pawns.reduce((total, step) => total + step + 1, 0)

/**
 * Next colour clockwise still in the game
 * @param {LudoSeat[]} seats - Players still in
 * @param {number} corner - Corner on turn
 * @return {string | null} - Next player
 */

export const nextTurn = (seats: LudoSeat[], corner: number): string | null => {
  const sorted = seats.toSorted((left, right) => left.corner - right.corner)
  const next = sorted.find((seat) => seat.corner > corner) ?? sorted[0]

  return next?.accountId ?? null
}

/**
 * Die face, fair
 * @param {() => number} [random] - Random source
 * @return {number} - One to six
 */

export const rollDie = (random: () => number = Math.random): number => 1 + Math.floor(random() * 6)
