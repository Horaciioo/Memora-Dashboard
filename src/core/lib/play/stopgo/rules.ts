import {
  STOPGO_CARDS,
  STOPGO_HAZARDS,
  StopGoFamilies,
  StopGoHazardKinds,
  StopGoTargets,
} from '@/declarations/play/stopgo/cards'
import type {
  StopGoCardKey,
  StopGoCardSpec,
  StopGoHazard,
  StopGoJoker,
} from '@/declarations/play/stopgo/cards'
import { StopGoRefusals } from '@/declarations/play/stopgo/refusals'
import type { StopGoRefusal } from '@/declarations/play/stopgo/refusals'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

import type { StopGoCar, StopGoTable } from '@/core/lib/play/stopgo/state'

// Refusal or null
type Verdict = StopGoRefusal | null

/**
 * Car can gain distance
 * @param {StopGoCar} car - Car
 * @return {boolean} - Green and unblocked
 */

export const isMoving = (car: StopGoCar): boolean =>
  car.isGreen &&
  !car.hazards.some((hazard) => STOPGO_HAZARDS[hazard].kind !== StopGoHazardKinds.Limit)

/**
 * Other cars in the race
 * @param {StopGoTable} table - Race
 * @param {string} accountId - Player
 * @return {string[]} - Opponent ids
 */

export const opponentsOf = (table: StopGoTable, accountId: string): string[] =>
  Object.keys(table.cars).filter((id) => id !== accountId)

/**
 * Targets an attack needs
 * @param {StopGoCardSpec} spec - Card
 * @param {number} opponents - Opponent count
 * @return {number} - Minimum targets
 */

export const minTargetsOf = (spec: StopGoCardSpec, opponents: number): number =>
  spec.target === StopGoTargets.Many
    ? Math.min(STOPGO_SETTINGS.accidentMinTargets, opponents)
    : Number(spec.target === StopGoTargets.One)

/**
 * Distance card check
 * @param {StopGoCardSpec} spec - Card
 * @param {StopGoCar} car - Player car
 * @param {number} targetKm - Race length
 * @return {Verdict} - Refusal or null
 */

const distanceVerdict = (spec: StopGoCardSpec, car: StopGoCar, targetKm: number): Verdict => {
  const km = spec.km ?? 0
  if (!isMoving(car)) return StopGoRefusals.Stopped
  if (car.hazards.includes('limit') && km > STOPGO_SETTINGS.limitMaxKm) {
    return StopGoRefusals.Limited
  }

  return car.km + km > targetKm ? StopGoRefusals.Overshoot : null
}

/**
 * Remedy card check
 * @param {StopGoCardSpec} spec - Card
 * @param {StopGoCar} car - Player car
 * @return {Verdict} - Refusal or null
 */

const remedyVerdict = (spec: StopGoCardSpec, car: StopGoCar): Verdict => {
  const hazard = spec.hazard as StopGoHazard

  // Green also starts a stopped car
  if (hazard === 'red') {
    return car.isGreen && !car.hazards.includes('red') ? StopGoRefusals.AlreadyGreen : null
  }

  return car.hazards.includes(hazard) ? null : StopGoRefusals.NoHazard
}

/**
 * Targeted card check
 * @param {StopGoCardSpec} spec - Card
 * @param {string[]} targets - Chosen ids
 * @param {StopGoTable} table - Race
 * @param {string} accountId - Player
 * @return {Verdict} - Refusal or null
 */

const targetVerdict = (
  spec: StopGoCardSpec,
  targets: string[],
  table: StopGoTable,
  accountId: string
): Verdict => {
  const opponents = opponentsOf(table, accountId)
  const needed = minTargetsOf(spec, opponents.length)
  if (!opponents.length) return StopGoRefusals.NoOpponent
  if (spec.target === StopGoTargets.One && targets.length !== 1) {
    return StopGoRefusals.WrongTargetCount
  }
  if (targets.length < needed) return StopGoRefusals.TooFewTargets

  // Distinct opponents only
  const isValid =
    new Set(targets).size === targets.length && targets.every((id) => opponents.includes(id))
  if (!isValid) return StopGoRefusals.BadTarget

  // One malus per type
  const hazard = spec.hazard
  const isHit = hazard && targets.some((id) => table.cars[id].hazards.includes(hazard))

  return isHit ? StopGoRefusals.AlreadyHit : null
}

/**
 * Why a card cannot be played
 * @param {StopGoCardKey} key - Card
 * @param {string} accountId - Player
 * @param {string[]} targets - Chosen ids
 * @param {StopGoTable} table - Race
 * @return {Verdict} - Refusal or null
 */

export const canPlay = (
  key: StopGoCardKey,
  accountId: string,
  targets: string[],
  table: StopGoTable
): Verdict => {
  const spec: StopGoCardSpec = STOPGO_CARDS[key]
  const car = table.cars[accountId]
  if (!car) return StopGoRefusals.NotSeated

  // Per family
  if (spec.family === StopGoFamilies.Distance) return distanceVerdict(spec, car, table.targetKm)
  if (spec.family === StopGoFamilies.Remedy) return remedyVerdict(spec, car)
  if (spec.target === StopGoTargets.None) return null

  return targetVerdict(spec, targets, table, accountId)
}

/**
 * Why a Joker cannot be used
 * @param {StopGoJoker} joker - Joker
 * @param {StopGoCar} car - Holder car
 * @return {Verdict} - Refusal or null
 */

export const canUseJoker = (joker: StopGoJoker, car: StopGoCar): Verdict => {
  if (!car.jokers[joker]) return StopGoRefusals.JokerSpent

  return joker === 'cleanup' && !car.hazards.length ? StopGoRefusals.NothingToClean : null
}
