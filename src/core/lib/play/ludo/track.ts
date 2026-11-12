import type { LudoCell } from '@/declarations/play/ludo/board'
import { LUDO_CHAOS } from '@/declarations/play/ludo/chaos'
import type { LudoMap } from '@/core/lib/play/ludo/maps'

/**
 * Step of a pawn in its yard
 * @type {number}
 */

export const YARD_STEP = -1

/**
 * Step of a pawn hidden from a screen
 * @type {number}
 */

export const HIDDEN_STEP = -9

/**
 * Steps from this one on are the same squares seen on a detour
 * @type {number}
 */

export const BRANCH_STEP = 100

/**
 * Step on the track a detour step stands for
 * @param {number} step - Step
 * @return {number} - Step on the track
 */

export const baseStep = (step: number): number => (step >= BRANCH_STEP ? step - BRANCH_STEP : step)

/**
 * Step on a detour
 * @param {number} step - Step
 * @return {boolean} - On a detour
 */

export const isBranchStep = (step: number): boolean => step >= BRANCH_STEP

/**
 * Step of a pawn at home
 * @param {LudoMap} map - Board
 * @param {number} step - Step
 * @return {boolean} - Home
 */

export const isHomeStep = (map: LudoMap, step: number): boolean =>
  step >= map.goal && step < BRANCH_STEP

/**
 * Point turned toward a corner, clockwise, cell units
 * @param {LudoMap} map - Board
 * @param {LudoCell} point - Point, row then column
 * @param {number} turns - Corner steps
 * @return {LudoCell} - Turned point
 */

export const turnPoint = (map: LudoMap, [y, x]: LudoCell, turns: number): LudoCell => {
  const count = ((turns % map.corners) + map.corners) % map.corners
  if (map.name === 'cross') {
    let point: LudoCell = [y, x]
    for (let index = 0; index < count; index += 1) point = [point[1], map.size - point[0]]

    return point
  }

  const angle = (count * 2 * Math.PI) / map.corners
  const [dy, dx] = [y - map.size / 2, x - map.size / 2]

  return [
    map.size / 2 + dx * Math.sin(angle) + dy * Math.cos(angle),
    map.size / 2 + dx * Math.cos(angle) - dy * Math.sin(angle),
  ]
}

/**
 * Track square of a corner's step
 * @param {LudoMap} map - Board
 * @param {number} corner - Corner
 * @param {number} step - Step on the track
 * @return {number} - Square index
 */

export const squareOf = (map: LudoMap, corner: number, step: number): number =>
  (corner * map.quarter + baseStep(step)) % map.length

/**
 * Detour a track square belongs to the span of, if any
 * @param {LudoMap} map - Board
 * @param {number} square - Track square
 * @return {boolean} - A detour stands for it
 */

export const isBranchSquare = (map: LudoMap, square: number): boolean => {
  const offset = square % map.quarter

  return map.branch !== null && offset >= map.branch.first && offset <= map.branch.last
}

/**
 * Steps a pawn shows while it walks from one step to another, on the detour where it takes one
 * @param {LudoMap} map - Board
 * @param {number} corner - Pawn colour
 * @param {number} from - Step before
 * @param {number} to - Step after
 * @return {number[]} - Steps, the last one being the landing
 */

export const walkSteps = (map: LudoMap, corner: number, from: number, to: number): number[] => {
  if (from <= YARD_STEP) return [to]
  const wantsBranch = isBranchStep(from) || isBranchStep(to)
  const steps: number[] = []
  for (let step = baseStep(from) + 1; step <= baseStep(to); step += 1) {
    const isSpan = isOnTrack(map, step) && isBranchSquare(map, squareOf(map, corner, step))
    steps.push(wantsBranch && isSpan ? step + BRANCH_STEP : step)
  }

  return steps
}

/**
 * Kind of the detour of an arm: a bonus on even arms, nothing on odd ones
 * @param {LudoMap} map - Board
 * @param {number} square - Track square the detour stands for
 * @return {'bonus' | null} - Kind
 */

export const detourKindOf = (map: LudoMap, square: number): 'bonus' | null =>
  Math.floor(square / map.quarter) % 2 === 0 ? 'bonus' : null

/**
 * Where a pawn stands as a place name, equal for pawns sharing a square
 * @param {LudoMap} map - Board
 * @param {number} corner - Pawn colour
 * @param {number} step - Pawn step
 * @return {string | null} - Place, null in the yard, the lane or at home
 */

export const placeOf = (map: LudoMap, corner: number, step: number): string | null => {
  if (isBranchStep(step)) return `b${squareOf(map, corner, step)}`

  return isOnTrack(map, step) ? `r${squareOf(map, corner, step)}` : null
}

/**
 * Step still on the shared track
 * @param {LudoMap} map - Board
 * @param {number} step - Step
 * @return {boolean} - On the track
 */

export const isOnTrack = (map: LudoMap, step: number): boolean => step >= 0 && step < map.lap

/**
 * Where a pawn stands, cell units
 * @param {LudoMap} map - Board
 * @param {number} corner - Pawn colour
 * @param {number} step - Pawn step
 * @param {number} pawn - Pawn index
 * @return {LudoCell} - Point
 */

export const pawnPoint = (map: LudoMap, corner: number, step: number, pawn: number): LudoCell => {
  if (step <= YARD_STEP) return turnPoint(map, map.yardSpots[pawn % map.yardSpots.length], corner)
  if (isHomeStep(map, step)) return turnPoint(map, map.goalSpot, corner)
  if (isBranchStep(step)) return map.branch!.points[squareOf(map, corner, step)]!
  if (isOnTrack(map, step)) return map.track[squareOf(map, corner, step)]

  return turnPoint(map, map.lane[step - map.lap], corner)
}

/**
 * Stars with a pawn stopped on them, one bit per corner
 * @param {LudoMap} map - Board
 * @param {{ accountId: string, corner: number }[]} players - Colours on the board
 * @param {Record<string, number[]>} pawns - Steps on screen
 * @param {{ accountId: string, pawn: number } | null} walking - Pawn passing through
 * @return {number} - Bit mask
 */

export const heldStars = (
  map: LudoMap,
  players: { accountId: string; corner: number }[],
  pawns: Record<string, number[]>,
  walking: { accountId: string; pawn: number } | null
): number =>
  players.reduce(
    (mask, { accountId, corner }) =>
      (pawns[accountId] ?? []).reduce((held, step, pawn) => {
        const isPassing = walking?.accountId === accountId && walking.pawn === pawn
        const square = squareOf(map, corner, step)
        const isStar = isOnTrack(map, step) && square % map.quarter === map.starOffset

        return isStar && !isPassing ? held | (1 << Math.floor(square / map.quarter)) : held
      }, mask),
    0
  )

/**
 * Action kind of a track square
 * @param {LudoMap} map - Board
 * @param {number} square - Track square
 * @param {boolean} [isBranch] - The detour tile of that square
 * @return {'bonus' | 'malus' | null} - Kind
 */

export const chaosKindOf = (
  map: LudoMap,
  square: number,
  isBranch = false
): 'bonus' | 'malus' | null => {
  if (isBranch) return map.branch?.kinds[square] ?? null
  const offset = square % map.quarter
  if (LUDO_CHAOS.bonusSquares.includes(offset)) return 'bonus'

  return LUDO_CHAOS.malusSquares.includes(offset) ? 'malus' : null
}
