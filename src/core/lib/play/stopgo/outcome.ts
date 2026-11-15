import type { StopGoTable } from '@/core/lib/play/stopgo/state'

/**
 * Racer standing
 * @typedef {Object} StopGoStanding
 * @property {string} accountId - Player
 * @property {number} km - Distance
 * @property {number} rank - 1 is best, ties share
 */

export interface StopGoStanding {
  accountId: string
  km: number
  rank: number
}

/**
 * Player on the exact distance
 * @param {StopGoTable} table - Race
 * @return {string | null} - Winner id
 */

export const winnerOf = (table: StopGoTable): string | null =>
  Object.keys(table.cars).find((id) => table.cars[id].km === table.targetKm) ?? null

/**
 * Ranking by distance
 * @param {StopGoTable} table - Race
 * @return {StopGoStanding[]} - Best first
 */

export const rankByKm = (table: StopGoTable): StopGoStanding[] => {
  const sorted = Object.entries(table.cars)
    .map(([accountId, car]) => ({ accountId, km: car.km }))
    .sort((first, second) => second.km - first.km)

  // Ties share the rank
  return sorted.map((entry) => ({
    ...entry,
    rank: sorted.findIndex((other) => other.km === entry.km) + 1,
  }))
}
