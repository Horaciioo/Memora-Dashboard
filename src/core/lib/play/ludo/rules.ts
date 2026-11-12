import { mapOf } from '@/core/lib/play/ludo/maps'
import type { LudoMap } from '@/core/lib/play/ludo/maps'
import type { LudoGameSettings } from '@/core/lib/play/ludo/settings'
import {
  baseStep,
  BRANCH_STEP,
  isBranchSquare,
  detourKindOf,
  isBranchStep,
  isHomeStep,
  isOnTrack,
  placeOf,
  squareOf,
  YARD_STEP,
} from '@/core/lib/play/ludo/track'

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
  // Kind of the detour taken, null on the track
  detour?: 'bonus' | 'malus' | null
}

// Weight of each gain when the move is picked for a player
const AUTO_WEIGHTS = { capture: 100, home: 80, exit: 60, safe: 20, progress: 10, detour: 25 }

/**
 * Pawns of the others standing on a place
 * @param {LudoMap} map - Board
 * @param {LudoSeat[]} seats - Board
 * @param {string} moverId - Player moving
 * @param {string} place - Place name, a track square or its detour
 * @return {LudoTaken[][]} - Groups by owner
 */

const rivalsOn = (map: LudoMap, seats: LudoSeat[], moverId: string, place: string): LudoTaken[][] =>
  seats
    .filter((seat) => seat.accountId !== moverId)
    .map((seat) =>
      seat.pawns.flatMap((step, pawn) =>
        placeOf(map, seat.corner, step) === place
          ? [{ accountId: seat.accountId, pawn, from: step }]
          : []
      )
    )
    .filter((group) => group.length > 0)

/**
 * Plan of one pawn landing on a step, null when a rule forbids it
 * @param {Object} input - Move
 * @param {LudoSeat[]} input.seats - Board
 * @param {LudoSeat} input.mover - Player moving
 * @param {number} input.pawn - Pawn index
 * @param {number} input.to - Step landed on, flagged when on a detour
 * @param {boolean} input.isExit - Pawn leaves its yard
 * @param {LudoGameSettings} input.settings - Rules
 * @return {LudoPlan | null} - Plan
 */

const landing = ({
  seats,
  mover,
  pawn,
  to,
  isExit,
  settings,
}: {
  seats: LudoSeat[]
  mover: LudoSeat
  pawn: number
  to: number
  isExit: boolean
  settings: LudoGameSettings
}): LudoPlan | null => {
  const map = mapOf(settings.rules.chaos)
  const { safeSquares } = settings.rules

  // Who stands on the landing place
  const place = placeOf(map, mover.corner, to)
  const square = isOnTrack(map, to) ? squareOf(map, mover.corner, to) : null
  const isSafe = square !== null && map.safe.has(square)
  const rivals = place === null ? [] : rivalsOn(map, seats, mover.accountId, place).flat()

  // One pawn per square: never on one of your own, never on a safe square a rival holds
  const isOwnSquare =
    !isHomeStep(map, to) && mover.pawns.some((step, index) => index !== pawn && step === to)
  if (isOwnSquare) return null

  // Safe squares protect: a rival sitting there stays and blocks. A pawn leaving the yard eats whoever sits on its start
  const isShielded = safeSquares && isSafe && !isExit
  if (isShielded && rivals.length) return null

  return {
    pawn,
    from: mover.pawns[pawn],
    to,
    captures: isShielded ? [] : rivals,
    isExit,
    isHome: to === map.goal,
    isSafe: safeSquares && isSafe,
    detour: isBranchStep(to) && !isExit ? detourKindOf(map, squareOf(map, mover.corner, to)) : null,
  }
}

/**
 * Plans of one pawn: the track, and a detour when the die lands in one's span
 * @param {Object} input - Move
 * @param {LudoSeat[]} input.seats - Board
 * @param {LudoSeat} input.mover - Player moving
 * @param {number} input.pawn - Pawn index
 * @param {number} input.dice - Die face
 * @param {LudoGameSettings} input.settings - Rules
 * @return {LudoPlan[]} - Plans, none when the die forbids it
 */

const plansOf = ({
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
}): LudoPlan[] => {
  const map = mapOf(settings.rules.chaos)
  const from = mover.pawns[pawn]
  if (isHomeStep(map, from)) return []
  const isExit = from <= YARD_STEP
  if (isExit && !settings.exitFaces.includes(dice)) return []

  // Exact count only: past the goal, the pawn stays put
  const base = isExit ? 0 : baseStep(from) + dice
  if (base > map.goal) return []
  const common = { seats, mover, pawn, isExit, settings }

  // The start square stands on the detour: a pawn leaving its yard lands there
  if (isExit && map.branch)
    return [landing({ ...common, to: BRANCH_STEP })].filter(
      (plan): plan is LudoPlan => plan !== null
    )
  const isInSpan = isOnTrack(map, base) && isBranchSquare(map, squareOf(map, mover.corner, base))
  const isFromBranch = isBranchStep(from)

  // On a detour the pawn stays on it while its span lasts
  if (isFromBranch && isInSpan)
    return [landing({ ...common, to: base + BRANCH_STEP })].filter(Boolean) as LudoPlan[]

  // Coming from outside the span, a pawn landing in it picks the track or the detour
  const fromSquare = squareOf(map, mover.corner, baseStep(from))
  const wasInSpan =
    isOnTrack(map, baseStep(from)) &&
    isBranchSquare(map, fromSquare) &&
    Math.floor(fromSquare / map.quarter) ===
      Math.floor(squareOf(map, mover.corner, base) / map.quarter)
  const tos = isInSpan && !wasInSpan ? [base, base + BRANCH_STEP] : [base]

  return tos
    .map((to) => landing({ ...common, to }))
    .filter((plan): plan is LudoPlan => plan !== null)
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

  const plans = mover.pawns.flatMap((_, pawn) => plansOf({ seats, mover, pawn, dice, settings }))
  const captures = plans.filter((plan) => plan.captures.length > 0)

  return settings.rules.forcedCapture && captures.length ? captures : plans
}

/**
 * Squares a move walks
 * @param {LudoPlan} plan - Move
 * @return {number} - Squares
 */

export const stepsOf = (plan: LudoPlan): number =>
  plan.isExit ? 1 : baseStep(plan.to) - baseStep(plan.from)

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
 * @param {LudoMap} map - Board
 * @return {LudoPlan | null} - Best move
 */

export const autoMove = (plans: LudoPlan[], map: LudoMap): LudoPlan | null => {
  const worth = (plan: LudoPlan) =>
    Number(plan.captures.length > 0) * AUTO_WEIGHTS.capture +
    Number(plan.isHome) * AUTO_WEIGHTS.home +
    Number(plan.isExit) * AUTO_WEIGHTS.exit +
    Number(plan.isSafe) * AUTO_WEIGHTS.safe +
    (baseStep(plan.to) / map.goal) * AUTO_WEIGHTS.progress +
    (plan.detour === 'bonus'
      ? AUTO_WEIGHTS.detour
      : plan.detour === 'malus'
        ? -AUTO_WEIGHTS.detour
        : 0)

  return plans.toSorted((left, right) => worth(right) - worth(left))[0] ?? null
}

/**
 * Pawns home for good
 * @param {LudoMap} map - Board
 * @param {number[]} pawns - Steps
 * @return {boolean} - All home
 */

export const isAllHome = (map: LudoMap, pawns: number[]): boolean =>
  pawns.every((step) => isHomeStep(map, step))

/**
 * Distance covered by a colour
 * @param {LudoMap} map - Board
 * @param {number[]} pawns - Steps
 * @return {number} - Steps walked
 */

export const progressOf = (map: LudoMap, pawns: number[]): number =>
  pawns.reduce((total, step) => total + Math.min(baseStep(step), map.goal) + 1, 0)

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
