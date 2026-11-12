import 'server-only'

import { conflict } from '@/core/lib/errors'
import { croquisDefaults, readCroquisSettings } from '@/core/lib/play/croquis'
import {
  drawStroke,
  guessWord,
  openTable,
  settleTable,
} from '@/core/services/play/croquis/CroquisRoundService'
import { croquisStats } from '@/core/services/play/croquis/CroquisStatsService'
import {
  croquisBoards,
  croquisBotView,
  croquisView,
} from '@/core/services/play/croquis/CroquisViewService'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  guess: guessWord,
  stroke: drawStroke,
  undo: drawStroke,
  clear: drawStroke,
}

/**
 * Croquis rules
 * @type {PlayEngine}
 */

export const CROQUIS_ENGINE: PlayEngine = {
  defaults: () => croquisDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readCroquisSettings,
  start: openTable,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: settleTable,
  view: croquisView,
  viewFor: croquisBoards,
  botView: croquisBotView,
  extraStats: croquisStats,
}
