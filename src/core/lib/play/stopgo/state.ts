import type { StopGoCardKey, StopGoHazard, StopGoSafety } from '@/declarations/play/stopgo/cards'
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
 * @property {StopGoSafety[]} shields - Safeties laid down for good
 * @property {StopGoHazard | null} lastHazard - Last malus suffered, it cannot hit again at once
 */

export interface StopGoCar {
  km: number
  isGreen: boolean
  hazards: StopGoHazard[]
  shields: StopGoSafety[]
  lastHazard?: StopGoHazard | null
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
  shields: [],
  lastHazard: null,
})

/**
 * Card in a hand
 * @typedef {Object} StopGoHandCard
 * @property {boolean} [isPicking] - One of two cards of a Good draw still to choose
 */

export interface StopGoHandCard extends StopGoCard {
  isPicking?: boolean
}

/**
 * Seat of a race as stored
 * @typedef {Object} StopGoSeatState
 */

export interface StopGoSeatState {
  id: string
  accountId: string
  slot: number
  km: number
  hand: StopGoHandCard[]
  // Mystery cards, read by the mystery service only
  sealed: unknown
  isGreen: boolean
  hazards: StopGoHazard[]
  shields: StopGoSafety[]
  lastHazard?: StopGoHazard | null
  strikes: number
  finishedAt: Date | null
  place: number | null
}

/**
 * Race clock and piles as stored
 * @typedef {Object} StopGoGameState
 */

export interface StopGoGameState {
  phase: string
  turnId: string
  turnNo: number
  rev: number
  startsAt: Date
  turnEndsAt: Date
  drawPile: StopGoCard[]
  discard: StopGoCard[]
  reshuffles: number
  pending: unknown
  pendingEndsAt: Date | null
}

/**
 * Line of the public log
 * @typedef {Object} StopGoLogLine
 */

export interface StopGoLogLine {
  rev: number
  kind: string
  accountId: string
  targetIds: string[]
  card: StopGoCardKey | null
  km: number | null
  value: number | null
}
