import 'server-only'

import {
  answerWindow,
  applyCleanup,
  canUseJoker,
  carOf,
  raceOf,
  windowOf,
} from '@/core/lib/play/stopgo'
import type { StopGoWindow } from '@/core/lib/play/stopgo'
import { resolveWindow } from '@/core/services/play/stopgo/StopGoAttackService'
import { refuse, requireLive, requireTurn } from '@/core/services/play/stopgo/StopGoGuards'
import {
  movedStep,
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
 * Record an answer, close the window when everybody answered
 * @param {StopGoLockedTable} table - Table
 * @param {StopGoWindow} window - Window answered
 * @param {string} accountId - Target
 * @param {boolean} isSaved - Immunity played
 * @return {Promise<EngineStep>} - Step
 */

const answer = async (
  table: StopGoLockedTable,
  window: StopGoWindow,
  accountId: string,
  isSaved: boolean
): Promise<EngineStep> => {
  const next = answerWindow(window, accountId, isSaved)
  const lines = isSaved
    ? [
        {
          kind: StopGoMoveKinds.Immunity,
          accountId,
          targetIds: [window.fromId],
          card: window.card,
        },
      ]
    : []
  if (!next.waiting.length) return resolveWindow(table, next, lines)
  table.game.pending = next
  table.isDirty = true
  if (lines.length) await writeMoves(table, lines)

  return { changed: true, finished: false, deadline: table.game.pendingEndsAt }
}

/**
 * Cancel an attack with the Immunity Joker
 * @param {EngineSession} session - Game
 * @param {string} accountId - Target
 * @param {Record<string, unknown>} raw - Body with turnNo
 * @return {Promise<EngineStep>} - Step
 */

export const useImmunity = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    requireLive(table, raw)
    const window = windowFor(table, accountId)
    const seat = seatOf(table, accountId)!
    const verdict = canUseJoker('immunity', carOf(seat))
    if (verdict) refuse(verdict)
    await saveSeat(table, accountId, { immunityUsedAt: table.now })

    return answer(table, window, accountId, true)
  })

/**
 * Let an attack land
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

/**
 * Clear every malus, the turn goes on
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player on turn
 * @param {Record<string, unknown>} raw - Body with turnNo
 * @return {Promise<EngineStep>} - Step
 */

export const useCleanup = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    requireTurn(table, accountId, raw)
    const seat = seatOf(table, accountId)!
    const car = carOf(seat)
    const verdict = canUseJoker('cleanup', car)
    if (verdict) refuse(verdict)
    const race = raceOf(racing(table), table.settings.target)
    await saveCars(table, race, applyCleanup(race, accountId))
    await saveSeat(table, accountId, { cleanupUsedAt: table.now })
    await writeMoves(table, [{ kind: StopGoMoveKinds.Cleanup, accountId }])

    return movedStep(table)
  })
