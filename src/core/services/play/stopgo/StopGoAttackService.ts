import 'server-only'

import { after } from '@/core/lib/play/clock'
import { applyCard, hitBy, raceOf, respondersOf } from '@/core/lib/play/stopgo'
import type { StopGoHandCard, StopGoWindow } from '@/core/lib/play/stopgo'
import { giveTurn, passTurn } from '@/core/services/play/stopgo/StopGoFlowService'
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
 * Close the window: the malus lands on every target who did not counter, the card is spent
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

  // The first target who countered plays next, else the turn goes on
  const [counterId] = window.saved.filter((id) => table.seats.some((seat) => seat.accountId === id))
  if (counterId && racing(table).some((seat) => seat.accountId === counterId)) {
    return giveTurn(table, counterId, lines)
  }

  return passTurn(table, window.fromId, lines)
}

/**
 * Throw an attack at its targets
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Attacker
 * @param {StopGoHandCard} card - Attack card from the hand
 * @param {string[]} targets - Players aimed at, already checked
 * @return {Promise<EngineStep>} - Step
 */

export const launchAttack = async (
  table: StopGoLockedTable,
  accountId: string,
  card: StopGoHandCard,
  targets: string[]
): Promise<EngineStep> => {
  const seat = seatOf(table, accountId)!
  await saveSeat(table, accountId, {
    hand: seat.hand.filter((entry) => entry.id !== card.id),
    strikes: 0,
  })
  const hands = Object.fromEntries(table.seats.map((entry) => [entry.accountId, entry.hand]))
  const window: StopGoWindow = {
    kind: 'counter',
    cardId: card.id,
    card: card.key,
    fromId: accountId,
    targets,
    waiting: respondersOf(targets, card.key, hands),
    saved: [],
  }
  const line: StopGoMoveInput = {
    kind: StopGoMoveKinds.Attack,
    accountId,
    card: card.key,
    targetIds: targets,
  }

  // Always a pause, so the table never learns who holds a safety
  table.game.pending = window
  table.game.pendingEndsAt = after(table.now, STOPGO_SETTINGS.counterSeconds)
  await writeMoves(table, [line])

  return { changed: true, finished: false, deadline: table.game.pendingEndsAt }
}
