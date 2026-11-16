import 'server-only'

import { conflict } from '@/core/lib/errors'
import { readStopGoSettings, stopGoDefaults } from '@/core/lib/play/stopgo'
import { pickCard, takeCard } from '@/core/services/play/stopgo/StopGoDrawService'
import { openRace } from '@/core/services/play/stopgo/StopGoDealService'
import { declineAttack, useCounter } from '@/core/services/play/stopgo/StopGoCounterService'
import { revealMystery } from '@/core/services/play/stopgo/StopGoMysteryService'
import { advance } from '@/core/services/play/stopgo/StopGoSettleService'
import { withTable } from '@/core/services/play/stopgo/StopGoTable'
import { discardCard, playCard } from '@/core/services/play/stopgo/StopGoTurnService'
import { stopGoStats } from '@/core/services/play/stopgo/StopGoStatsService'
import { stopGoBoards, stopGoView } from '@/core/services/play/stopgo/StopGoViewService'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  play: playCard,
  discard: discardCard,
  counter: useCounter,
  decline: declineAttack,
  pick: pickCard,
  draw: takeCard,
  reveal: revealMystery,
}

/**
 * Stop & Go rules
 * @type {PlayEngine}
 */

export const STOPGO_ENGINE: PlayEngine = {
  defaults: () => stopGoDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readStopGoSettings,
  start: openRace,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: (session) => withTable(session, advance),
  view: stopGoView,
  viewFor: stopGoBoards,
  extraStats: stopGoStats,
}
