import {
  STOPGO_CARDS,
  STOPGO_HAZARDS,
  StopGoFamilies,
  StopGoHazardKinds,
} from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey, StopGoJoker } from '@/declarations/play/stopgo/cards'
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

  // Pose a hazard
  const hazard = spec.hazard
  if (spec.family !== StopGoFamilies.Attack || !hazard) return table

  return targets.reduce(
    (next, id) => patchCar(next, id, { hazards: [...next.cars[id].hazards, hazard] }),
    table
  )
}

/**
 * Spend a Joker token
 * @param {StopGoCar} car - Holder car
 * @param {StopGoJoker} joker - Joker
 * @return {StopGoCar} - Car after
 */

const spendJoker = (car: StopGoCar, joker: StopGoJoker): StopGoCar => ({
  ...car,
  jokers: { ...car.jokers, [joker]: false },
})

/**
 * Cancel an attack
 * @param {StopGoTable} table - Race
 * @param {string} accountId - Targeted player
 * @return {StopGoTable} - New race
 */

export const applyImmunity = (table: StopGoTable, accountId: string): StopGoTable =>
  patchCar(table, accountId, spendJoker(table.cars[accountId], 'immunity'))

/**
 * Clear every hazard
 * @param {StopGoTable} table - Race
 * @param {string} accountId - Player
 * @return {StopGoTable} - New race
 */

export const applyCleanup = (table: StopGoTable, accountId: string): StopGoTable =>
  patchCar(table, accountId, { ...spendJoker(table.cars[accountId], 'cleanup'), hazards: [] })

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
