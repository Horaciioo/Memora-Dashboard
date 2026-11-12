import 'server-only'

import { conflict } from '@/core/lib/errors'
import { glitchDefaults, readGlitchSettings } from '@/core/lib/play/glitch'
import { openTable, pickSpot, settleTable } from '@/core/services/play/glitch/GlitchRoundService'
import { glitchStats } from '@/core/services/play/glitch/GlitchStatsService'
import {
  glitchBoards,
  glitchBotView,
  glitchView,
} from '@/core/services/play/glitch/GlitchViewService'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  spot: pickSpot,
}

/**
 * Glitch rules
 * @type {PlayEngine}
 */

export const GLITCH_ENGINE: PlayEngine = {
  defaults: () => glitchDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readGlitchSettings,
  start: openTable,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: settleTable,
  view: glitchView,
  viewFor: glitchBoards,
  botView: glitchBotView,
  extraStats: glitchStats,
}
