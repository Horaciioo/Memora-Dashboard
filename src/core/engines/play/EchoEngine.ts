import 'server-only'

import { conflict } from '@/core/lib/errors'
import { echoDefaults, readEchoSettings } from '@/core/lib/play/echo'
import { openTable, pickSymbol, settleTable } from '@/core/services/play/echo/EchoRoundService'
import { echoStats } from '@/core/services/play/echo/EchoStatsService'
import { echoBoards, echoView } from '@/core/services/play/echo/EchoViewService'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  pick: pickSymbol,
}

/**
 * Echo rules
 * @type {PlayEngine}
 */

export const ECHO_ENGINE: PlayEngine = {
  defaults: () => echoDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readEchoSettings,
  start: openTable,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: settleTable,
  view: echoView,
  isViewShared: true,
  viewFor: echoBoards,
  extraStats: echoStats,
}
