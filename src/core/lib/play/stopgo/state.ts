import type { StopGoCardKey, StopGoHazard, StopGoJoker } from '@/declarations/play/stopgo/cards'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

/**
 * One physical card
 * @typedef {Object} StopGoCard
 * @property {string} id - Stable id
 * @property {StopGoCardKey} key - Card kind
 */

export interface StopGoCard {
  id: string
  key: StopGoCardKey
}

/**
 * One player's car
 * @typedef {Object} StopGoCar
 * @property {number} km - Distance, never negative
 * @property {boolean} isGreen - Cleared to go
 * @property {StopGoHazard[]} hazards - Suffered, one per type
 * @property {Record<StopGoJoker, boolean>} jokers - Still held
 */

export interface StopGoCar {
  km: number
  isGreen: boolean
  hazards: StopGoHazard[]
  jokers: Record<StopGoJoker, boolean>
}

/**
 * Race state
 * @typedef {Object} StopGoTable
 * @property {number} targetKm - Distance to reach
 * @property {Record<string, StopGoCar>} cars - Cars still racing
 */

export interface StopGoTable {
  targetKm: number
  cars: Record<string, StopGoCar>
}

/**
 * Car at the start line
 * @return {StopGoCar} - Fresh car
 */

export const freshCar = (): StopGoCar => ({
  km: 0,
  isGreen: !STOPGO_SETTINGS.startsStopped,
  hazards: [],
  jokers: { immunity: true, cleanup: true },
})
