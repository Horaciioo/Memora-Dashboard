import 'server-only'

import { dropDrawn, windowOf } from '@/core/lib/play/stopgo'
import { resolveWindow } from '@/core/services/play/stopgo/StopGoAttackService'
import { closeRace, passTurn } from '@/core/services/play/stopgo/StopGoFlowService'
import { racing, saveSeat, seatOf } from '@/core/services/play/stopgo/StopGoTable'
import type { StopGoLockedTable } from '@/core/services/play/stopgo/StopGoTable'
import type { EngineStep } from '@/types/play'
import { StopGoMoveKinds, StopGoPhases } from '@/utils/constants/play'

/**
 * Clock ran out on the player's turn
 * @param {StopGoLockedTable} table - Table
 * @return {Promise<EngineStep>} - Step
 */

const timeOut = async (table: StopGoLockedTable): Promise<EngineStep> => {
  const { game } = table
  const seat = seatOf(table, game.turnId)!
  const { hand, dropped } = dropDrawn(seat.hand)
  if (dropped) game.discard = [...game.discard, { id: dropped.id, key: dropped.key }]
  await saveSeat(table, seat.accountId, { hand, strikes: seat.strikes + 1 })

  return passTurn(table, seat.accountId, [
    { kind: StopGoMoveKinds.Timeout, accountId: seat.accountId, card: dropped?.key },
  ])
}

/**
 * Play every overdue move of the race
 * @param {StopGoLockedTable} table - Table
 * @return {Promise<EngineStep>} - Step
 */

export const advance = async (table: StopGoLockedTable): Promise<EngineStep> => {
  const { game, now } = table
  if (game.phase === StopGoPhases.Over) return { changed: false, finished: true, deadline: null }

  // Nobody left to race against
  const road = racing(table)
  if (road.length < 2) return closeRace(table, road[0]?.accountId ?? null)

  // Attack waiting for answers: the window clock rules, not the turn clock
  const window = windowOf(game.pending)
  if (window) {
    if (game.pendingEndsAt && now < game.pendingEndsAt) {
      return { changed: false, finished: false, deadline: game.pendingEndsAt }
    }

    return resolveWindow(table, window)
  }

  // Player on turn walked away
  if (!road.some((seat) => seat.accountId === game.turnId)) {
    return passTurn(table, game.turnId, [])
  }
  if (now < game.turnEndsAt) return { changed: false, finished: false, deadline: game.turnEndsAt }

  return timeOut(table)
}
