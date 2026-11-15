import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'

import type { StopGoTable } from '@/core/lib/play/stopgo/state'

/**
 * Attack waiting on the answers of its targets
 * @typedef {Object} StopGoWindow
 * @property {'immunity'} kind - Window type
 * @property {string} cardId - Attack card, consumed once the window closes
 * @property {StopGoCardKey} card - Attack kind
 * @property {string} fromId - Attacker
 * @property {string[]} targets - Players aimed at
 * @property {string[]} waiting - Targets who still have to answer
 * @property {string[]} saved - Targets who played their Immunity
 */

export interface StopGoWindow {
  kind: 'immunity'
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

  return window?.kind === 'immunity' ? window : null
}

/**
 * Targets who can still cancel the attack
 * @param {string[]} targets - Players aimed at
 * @param {StopGoTable} table - Race
 * @return {string[]} - Targets holding their Immunity
 */

export const respondersOf = (targets: string[], table: StopGoTable): string[] =>
  targets.filter((id) => table.cars[id]?.jokers.immunity)

/**
 * Window after one target answered
 * @param {StopGoWindow} window - Open window
 * @param {string} accountId - Target who answers
 * @param {boolean} isSaved - Immunity played
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
 * @return {string[]} - Targets without a played Immunity, still racing
 */

export const hitBy = (window: StopGoWindow, table: StopGoTable): string[] =>
  window.targets.filter((id) => !window.saved.includes(id) && table.cars[id])
