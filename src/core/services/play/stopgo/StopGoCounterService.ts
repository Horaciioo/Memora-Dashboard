import 'server-only'

import {
  applyCard,
  answerWindow,
  counterOf,
  drawFor,
  hazardOf,
  raceOf,
  secureRandom,
  windowOf,
} from '@/core/lib/play/stopgo'
import type { StopGoWindow } from '@/core/lib/play/stopgo'
import { resolveWindow } from '@/core/services/play/stopgo/StopGoAttackService'
import { refuse, requireLive } from '@/core/services/play/stopgo/StopGoGuards'
import {
  racing,
  saveCars,
  saveSeat,
  seatOf,
  withTable,
  writeMoves,
} from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable } from '@/core/services/play/stopgo/StopGoTable'
import { StopGoRefusals } from '@/declarations/play/stopgo/refusals'
import type { EngineSession, EngineStep } from '@/types/play'
import { StopGoMoveKinds } from '@/utils/constants/play'

/**
 * Window that waits for this player
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Target
 * @return {StopGoWindow} - Window
 */

const windowFor = (table: StopGoLockedTable, accountId: string): StopGoWindow => {
  const window = windowOf(table.game.pending)

  return window?.waiting.includes(accountId) ? window : refuse(StopGoRefusals.NoWindow)
}

/**
 * Record an answer, the window closes at once only when a safety was played and nobody is left
 * @param {StopGoLockedTable} table - Table
 * @param {StopGoWindow} window - Window answered
 * @param {string} accountId - Target
 * @param {boolean} isSaved - Safety played
 * @param {StopGoCardKey} [card] - Safety laid down
 * @return {Promise<EngineStep>} - Step
 */

const answer = async (
  table: StopGoLockedTable,
  window: StopGoWindow,
  accountId: string,
  isSaved: boolean,
  card?: string
): Promise<EngineStep> => {
  const next = answerWindow(window, accountId, isSaved)
  const lines = isSaved
    ? [{ kind: StopGoMoveKinds.Counter, accountId, targetIds: [window.fromId], card }]
    : []
  if (!next.waiting.length && next.saved.length) return resolveWindow(table, next, lines)
  table.game.pending = next
  table.isDirty = true
  if (lines.length) await writeMoves(table, lines)

  return { changed: true, finished: false, deadline: table.game.pendingEndsAt }
}

/**
 * Coup fourré: lay the matching safety from the hand, the attack falls, a card is drawn at once
 * @param {EngineSession} session - Game
 * @param {string} accountId - Target
 * @param {Record<string, unknown>} raw - Body with turnNo
 * @return {Promise<EngineStep>} - Step
 */

export const useCounter = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    requireLive(table, raw)
    const window = windowFor(table, accountId)
    const seat = seatOf(table, accountId)!
    const safety = counterOf(seat.hand, hazardOf(window.card))
    if (!safety) refuse(StopGoRefusals.NoCounter)

    // The safety lifts what it stops and stays on the car
    const race = raceOf(racing(table), table.settings.target)
    await saveCars(table, race, applyCard(safety!.key, accountId, [], race))

    // Replacement card at once, the turn comes right after
    const { game } = table
    const drawn = drawFor(game.drawPile, game.discard, game.reshuffles, secureRandom)
    game.drawPile = drawn.piles.pile
    game.discard = drawn.piles.discard
    game.reshuffles = drawn.piles.reshuffles
    const rest = seat.hand.filter((entry) => entry.id !== safety!.id)
    await saveSeat(table, accountId, { hand: drawn.card ? [...rest, drawn.card] : rest })

    return answer(table, window, accountId, true, safety!.key)
  })

/**
 * Let an attack land, the safety stays in hand
 * @param {EngineSession} session - Game
 * @param {string} accountId - Target
 * @param {Record<string, unknown>} raw - Body with turnNo
 * @return {Promise<EngineStep>} - Step
 */

export const declineAttack = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    requireLive(table, raw)

    return answer(table, windowFor(table, accountId), accountId, false)
  })
