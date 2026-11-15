import 'server-only'

import { conflict } from '@/core/lib/errors'
import { readBodyInteger } from '@/core/lib/play/parse'
import { isStale } from '@/core/lib/play/stopgo'
import type { StopGoLockedTable } from '@/core/services/play/stopgo/StopGoTable'
import { STOPGO_ERRORS } from '@/declarations/play/stopgo/copy'
import { StopGoRefusals } from '@/declarations/play/stopgo/refusals'
import type { StopGoRefusal } from '@/declarations/play/stopgo/refusals'
import { StopGoPhases } from '@/utils/constants/play'

/**
 * Refuse a move with the message of a refusal
 * @param {StopGoRefusal} refusal - Why
 * @return {never} - Always throws
 */

export const refuse = (refusal: StopGoRefusal): never => {
  throw conflict(STOPGO_ERRORS[refusal])
}

/**
 * Guards of any move: race running and turn seen
 * @param {StopGoLockedTable} table - Table
 * @param {Record<string, unknown>} raw - Body
 * @return {void}
 */

export const requireLive = (table: StopGoLockedTable, raw: Record<string, unknown>): void => {
  const { game } = table
  if (game.phase !== StopGoPhases.Playing) refuse(StopGoRefusals.RaceOver)
  if (isStale(game.turnNo, readBodyInteger(raw, 'turnNo'))) refuse(StopGoRefusals.StaleTurn)
  if (table.now < game.startsAt) refuse(StopGoRefusals.NotYourTurn)
}

/**
 * Guards of a move on the player's own turn
 * @param {StopGoLockedTable} table - Table
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body
 * @return {void}
 */

export const requireTurn = (
  table: StopGoLockedTable,
  accountId: string,
  raw: Record<string, unknown>
): void => {
  requireLive(table, raw)
  if (table.game.turnId !== accountId) refuse(StopGoRefusals.NotYourTurn)
  if (table.game.pending) refuse(StopGoRefusals.Waiting)
}
