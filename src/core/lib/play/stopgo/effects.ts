import {
  STOPGO_CARDS,
  STOPGO_HAZARDS,
  StopGoFamilies,
  StopGoHazardKinds,
} from '@/declarations/play/stopgo/cards'
import { STOPGO_SAFETIES } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey, StopGoSafety } from '@/declarations/play/stopgo/cards'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

import type { StopGoCar, StopGoTable } from '@/core/lib/play/stopgo/state'

/**
 * Update one car
 * @param {StopGoTable} table - Race
 * @param {string} accountId - Car owner
 * @param {Partial<StopGoCar>} patch - Fields to change
 * @return {StopGoTable} - New race
 */

const patchCar = (
  table: StopGoTable,
  accountId: string,
  patch: Partial<StopGoCar>
): StopGoTable => ({
  ...table,
  cars: { ...table.cars, [accountId]: { ...table.cars[accountId], ...patch } },
})

/**
 * Play a legal card
 * @param {StopGoCardKey} key - Card
 * @param {string} accountId - Player
 * @param {string[]} targets - Chosen ids
 * @param {StopGoTable} table - Race
 * @return {StopGoTable} - New race
 */

export const applyCard = (
  key: StopGoCardKey,
  accountId: string,
  targets: string[],
  table: StopGoTable
): StopGoTable => {
  const spec = STOPGO_CARDS[key]
  const car = table.cars[accountId]

  // Gain distance
  if (spec.family === StopGoFamilies.Distance) {
    return patchCar(table, accountId, { km: car.km + (spec.km ?? 0) })
  }

  // Lift a hazard
  if (spec.family === StopGoFamilies.Remedy && spec.hazard) {
    const hazard = spec.hazard
    const isBreakdown = STOPGO_HAZARDS[hazard].kind === StopGoHazardKinds.Breakdown
    const needsGreen = isBreakdown && STOPGO_SETTINGS.remedyNeedsGreen

    return patchCar(table, accountId, {
      hazards: car.hazards.filter((current) => current !== hazard),
      isGreen: hazard === 'red' ? true : car.isGreen && !needsGreen,
    })
  }

  // Lay a safety down: it lifts the hazards it stops and keeps them away
  if (spec.family === StopGoFamilies.Safety) {
    const stopped: readonly string[] = STOPGO_SAFETIES[key as StopGoSafety]

    return patchCar(table, accountId, {
      shields: [...car.shields, key as StopGoSafety],
      hazards: car.hazards.filter((current) => !stopped.includes(current)),
    })
  }

  // Pose a hazard
  const hazard = spec.hazard
  if (spec.family !== StopGoFamilies.Attack || !hazard) return table

  return targets.reduce((next, id) => {
    const target = next.cars[id]
    const isSafe = target.shields.some((shield) =>
      (STOPGO_SAFETIES[shield] as readonly string[]).includes(hazard)
    )

    return isSafe
      ? next
      : patchCar(next, id, { hazards: [...target.hazards, hazard], lastHazard: hazard })
  }, table)
}

/**
 * Pay to reveal a mystery card
 * @param {StopGoTable} table - Race
 * @param {string} accountId - Player
 * @return {StopGoTable} - New race
 */

export const applyMysteryReveal = (table: StopGoTable, accountId: string): StopGoTable =>
  patchCar(table, accountId, {
    km: Math.max(0, table.cars[accountId].km - STOPGO_SETTINGS.mysteryCost),
  })
