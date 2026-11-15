import { STOPGO_CARDS } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey, StopGoHazard } from '@/declarations/play/stopgo/cards'

import { counterOf } from '@/core/lib/play/stopgo/rules'
import type { StopGoCard, StopGoTable } from '@/core/lib/play/stopgo/state'

/**
 * Attack waiting for a safety played out of turn (coup fourré)
 * @typedef {Object} StopGoWindow
 * @property {'counter'} kind - Window type
 * @property {string} cardId - Attack card, consumed once the window closes
 * @property {StopGoCardKey} card - Attack kind
 * @property {string} fromId - Attacker
 * @property {string[]} targets - Players aimed at
 * @property {string[]} waiting - Targets holding the matching safety who have not answered
 * @property {string[]} saved - Targets who played it, in order
 */

export interface StopGoWindow {
  kind: 'counter'
  cardId: string
  card: StopGoCardKey
  fromId: string
  targets: string[]
  waiting: string[]
  saved: string[]
}

/**
 * Stored window, typed
 * @param {unknown} pending - Stored pending choice
 * @return {StopGoWindow | null} - Window, null when none is open
 */

export const windowOf = (pending: unknown): StopGoWindow | null => {
  const window = pending as StopGoWindow | null

  return window?.kind === 'counter' ? window : null
}

/**
 * Hazard an attack card poses
 * @param {StopGoCardKey} card - Attack
 * @return {StopGoHazard} - Hazard
 */

export const hazardOf = (card: StopGoCardKey): StopGoHazard =>
  STOPGO_CARDS[card].hazard as StopGoHazard

/**
 * Targets who hold the matching safety in hand
 * @param {string[]} targets - Players aimed at
 * @param {StopGoCardKey} card - Attack
 * @param {Record<string, StopGoCard[]>} hands - Hand per player
 * @return {string[]} - Targets able to counter
 */

export const respondersOf = (
  targets: string[],
  card: StopGoCardKey,
  hands: Record<string, StopGoCard[]>
): string[] => targets.filter((id) => counterOf(hands[id] ?? [], hazardOf(card)))

/**
 * Window after one target answered
 * @param {StopGoWindow} window - Open window
 * @param {string} accountId - Target who answers
 * @param {boolean} isSaved - Safety played
 * @return {StopGoWindow} - New window
 */

export const answerWindow = (
  window: StopGoWindow,
  accountId: string,
  isSaved: boolean
): StopGoWindow => ({
  ...window,
  waiting: window.waiting.filter((id) => id !== accountId),
  saved: isSaved ? [...window.saved, accountId] : window.saved,
})

/**
 * Targets who suffer the attack once the window closes
 * @param {StopGoWindow} window - Window
 * @param {StopGoTable} table - Race
 * @return {string[]} - Targets without a played safety, still racing
 */

export const hitBy = (window: StopGoWindow, table: StopGoTable): string[] =>
  window.targets.filter((id) => !window.saved.includes(id) && table.cars[id])
