import 'server-only'

import { conflict } from '@/core/lib/errors'
import { readStopGoSettings, stopGoDefaults } from '@/core/lib/play/stopgo'
import { openRace } from '@/core/services/play/stopgo/StopGoDealService'
import { advance } from '@/core/services/play/stopgo/StopGoFlowService'
import { withTable } from '@/core/services/play/stopgo/StopGoTable'
import { discardCard, playCard } from '@/core/services/play/stopgo/StopGoTurnService'
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
  extraStats: async () => new Map(),
}
