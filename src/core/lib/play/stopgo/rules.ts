import {
  STOPGO_CARDS,
  STOPGO_HAZARDS,
  STOPGO_SAFETIES,
  safetyAgainst,
  StopGoFamilies,
  StopGoHazardKinds,
  StopGoTargets,
} from '@/declarations/play/stopgo/cards'
import type {
  StopGoCardKey,
  StopGoCardSpec,
  StopGoHazard,
  StopGoSafety,
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
 * @return {boolean} - Green (or siren) and unblocked
 */

export const isMoving = (car: StopGoCar): boolean =>
  (car.isGreen || car.shields.includes('siren')) &&
  !car.hazards.some((hazard) => STOPGO_HAZARDS[hazard].kind !== StopGoHazardKinds.Limit)

/**
 * Car is immune to a hazard
 * @param {StopGoCar} car - Car
 * @param {StopGoHazard} hazard - Attack key
 * @return {boolean} - A laid safety stops it
 */

export const isShielded = (car: StopGoCar, hazard: StopGoHazard): boolean =>
  car.shields.some((shield) => (STOPGO_SAFETIES[shield] as readonly string[]).includes(hazard))

/**
 * Remedies a stopped car still lacks to roll again
 * @param {StopGoCar} car - Car
 * @param {StopGoCardKey[]} held - Cards already in hand
 * @return {StopGoCardKey[]} - Remedies to find, none for a car that rolls
 */

export const needsOf = (car: StopGoCar, held: StopGoCardKey[] = []): StopGoCardKey[] => {
  if (isMoving(car)) return []
  const keys = car.hazards
    .filter((hazard) => STOPGO_HAZARDS[hazard].kind !== StopGoHazardKinds.Limit)
    .map((hazard) => STOPGO_HAZARDS[hazard].remedy as StopGoCardKey)

  // A car that never got the light also needs green
  if (!car.isGreen && !keys.includes('green')) keys.push('green')

  return keys.filter((key) => !held.includes(key))
}

/**
 * Card of a hand that stops a hazard right away
 * @param {{ id: string, key: StopGoCardKey }[]} hand - Hand
 * @param {StopGoHazard} hazard - Attack key
 * @return {{ id: string, key: StopGoCardKey } | undefined} - Safety held
 */

export const counterOf = <T extends { key: StopGoCardKey }>(
  hand: T[],
  hazard: StopGoHazard
): T | undefined => hand.find((card) => card.key === safetyAgainst(hazard))

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
    return isMoving(car) && !car.hazards.includes('red') ? StopGoRefusals.AlreadyGreen : null
  }

  return car.hazards.includes(hazard) ? null : StopGoRefusals.NoHazard
}

/**
 * Why a malus cannot land on a car
 * @param {StopGoHazard} hazard - Malus
 * @param {StopGoCar} car - Opponent car
 * @return {Verdict} - Refusal or null
 */

export const aimVerdict = (hazard: StopGoHazard, car: StopGoCar): Verdict => {
  if (isShielded(car, hazard)) return StopGoRefusals.Shielded
  if (car.hazards.includes(hazard)) return StopGoRefusals.AlreadyHit

  // The malus a car just suffered cannot come twice in a row
  return car.lastHazard === hazard ? StopGoRefusals.SameMalus : null
}

/**
 * Opponents a card can aim at
 * @param {StopGoCardSpec} spec - Card
 * @param {StopGoTable} table - Race
 * @param {string} accountId - Player
 * @return {string[]} - Opponent ids that can take the malus
 */

export const aimableOf = (spec: StopGoCardSpec, table: StopGoTable, accountId: string): string[] =>
  opponentsOf(table, accountId).filter(
    (id) => !spec.hazard || !aimVerdict(spec.hazard, table.cars[id])
  )

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
  if (!opponents.length) return StopGoRefusals.NoOpponent

  // A wide attack needs only as many as can take it
  const needed = Math.min(
    minTargetsOf(spec, opponents.length),
    Math.max(1, aimableOf(spec, table, accountId).length)
  )
  if (spec.target === StopGoTargets.One && targets.length !== 1) {
    return StopGoRefusals.WrongTargetCount
  }
  if (targets.length < needed) return StopGoRefusals.TooFewTargets

  // Distinct opponents only
  const isValid =
    new Set(targets).size === targets.length && targets.every((id) => opponents.includes(id))
  if (!isValid) return StopGoRefusals.BadTarget

  const hazard = spec.hazard
  if (!hazard) return null

  // First refusal among the targets
  for (const id of targets) {
    const verdict = aimVerdict(hazard, table.cars[id])
    if (verdict) return verdict
  }

  return null
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
  if (spec.family === StopGoFamilies.Safety) {
    return car.shields.includes(key as StopGoSafety) ? StopGoRefusals.AlreadyLaid : null
  }
  if (spec.target === StopGoTargets.None) return null

  const verdict = targetVerdict(spec, targets, table, accountId)
  if (verdict || key !== 'mystery') return verdict

  // The reveal is paid in km, a car without them cannot be sealed
  return targets.some((id) => table.cars[id].km < STOPGO_SETTINGS.mysteryCost)
    ? StopGoRefusals.TooShort
    : null
}
