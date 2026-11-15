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

// Weight of a place over any distance in the stored score
const PLACE_WEIGHT = 10000

/**
 * Places once the race is over
 * @param {StopGoTable} table - Race with every car
 * @param {string | null} winnerId - Player who won, if any
 * @return {Record<string, number>} - Place per player
 */

export const placesOf = (table: StopGoTable, winnerId: string | null): Record<string, number> => {
  const rest = { ...table, cars: { ...table.cars } }
  if (winnerId) delete rest.cars[winnerId]
  const offset = winnerId ? 1 : 0

  // The winner leads, the others rank by distance
  return Object.fromEntries([
    ...(winnerId ? [[winnerId, 1]] : []),
    ...rankByKm(rest).map(({ accountId, rank }) => [accountId, rank + offset]),
  ])
}

/**
 * Score stored on a seat, place first then distance
 * @param {number} place - Final place
 * @param {number} players - Players in the race
 * @param {number} km - Distance reached
 * @return {number} - Score
 */

export const scoreOf = (place: number, players: number, km: number): number =>
  (players + 1 - place) * PLACE_WEIGHT + km
