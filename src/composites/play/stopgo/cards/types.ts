import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'

/**
 * Card of the reader's hand
 * @typedef {Object} StopGoHandCardView
 */

export interface StopGoHandCardView {
  id: string
  key: StopGoCardKey
  isPicking: boolean
}

/**
 * Opponent a card may aim at
 * @typedef {Object} StopGoOpponent
 */

export interface StopGoOpponent {
  id: string
  name: string
  color: StopGoCarColor
}
