import 'server-only'

import { after } from '@/core/lib/play/clock'
import { applyCard, hitBy, raceOf, respondersOf } from '@/core/lib/play/stopgo'
import type { StopGoHandCard, StopGoTable, StopGoWindow } from '@/core/lib/play/stopgo'
import { passTurn } from '@/core/services/play/stopgo/StopGoFlowService'
import {
  racing,
  saveCars,
  saveSeat,
  seatOf,
  writeMoves,
} from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable, StopGoMoveInput } from '@/core/services/play/stopgo/StopGoTable'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import type { EngineStep } from '@/types/play'
import { StopGoMoveKinds } from '@/utils/constants/play'

/**
 * Close the window: the malus lands on every target who kept quiet, the card is spent
 * @param {StopGoLockedTable} table - Table
 * @param {StopGoWindow} window - Window to close
 * @param {StopGoMoveInput[]} lines - Lines of the move that closes it
 * @return {Promise<EngineStep>} - Step after the turn passed
 */

export const resolveWindow = async (
  table: StopGoLockedTable,
  window: StopGoWindow,
  lines: StopGoMoveInput[] = []
): Promise<EngineStep> => {
  const { game, settings } = table
  const race = raceOf(racing(table), settings.target)
  const next = applyCard(window.card, window.fromId, hitBy(window, race), race)
  await saveCars(table, race, next)

  // One write: malus, card to the discard, window gone
  game.discard = [...game.discard, { id: window.cardId, key: window.card }]
  game.pending = null
  game.pendingEndsAt = null
  table.isDirty = true

  return passTurn(table, window.fromId, lines)
}

/**
 * Throw an attack at its targets
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Attacker
 * @param {StopGoHandCard} card - Attack card from the hand
 * @param {string[]} targets - Players aimed at, already checked
 * @param {StopGoTable} race - Race before the attack
 * @return {Promise<EngineStep>} - Step
 */

export const launchAttack = async (
  table: StopGoLockedTable,
  accountId: string,
  card: StopGoHandCard,
  targets: string[],
  race: StopGoTable
): Promise<EngineStep> => {
  const seat = seatOf(table, accountId)!
  await saveSeat(table, accountId, {
    hand: seat.hand.filter((entry) => entry.id !== card.id),
    strikes: 0,
  })
  const window: StopGoWindow = {
    kind: 'immunity',
    cardId: card.id,
    card: card.key,
    fromId: accountId,
    targets,
    waiting: respondersOf(targets, race),
    saved: [],
  }
  const line: StopGoMoveInput = {
    kind: StopGoMoveKinds.Attack,
    accountId,
    card: card.key,
    targetIds: targets,
  }

  // Nobody can answer: the malus lands now
  if (!window.waiting.length) return resolveWindow(table, window, [line])

  table.game.pending = window
  table.game.pendingEndsAt = after(table.now, STOPGO_SETTINGS.immunitySeconds)
  await writeMoves(table, [line])

  return { changed: true, finished: false, deadline: table.game.pendingEndsAt }
}
