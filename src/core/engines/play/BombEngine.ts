import 'server-only'

import { conflict } from '@/core/lib/errors'
import { bombDefaults, readBombSettings } from '@/core/lib/play/bomb'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'
import { bombStats } from '@/core/services/play/bomb/BombStatsService'
import {
  openTable,
  settleTable,
  submitWord,
  typeDraft,
} from '@/core/services/play/bomb/BombTurnService'
import { bombView } from '@/core/services/play/bomb/BombViewService'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  submit: submitWord,
  type: typeDraft,
}

/**
 * Bomb Party rules
 * @type {PlayEngine}
 */

export const BOMB_ENGINE: PlayEngine = {
  defaults: () => bombDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readBombSettings,
  start: openTable,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: settleTable,
  view: bombView,
  extraStats: bombStats,
}
