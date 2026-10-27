import 'server-only'

import { conflict } from '@/core/lib/errors'
import { ludoDefaults, readLudoSettings } from '@/core/lib/play/ludo'
import { ludoStats } from '@/core/services/play/ludo/LudoStatsService'
import {
  movePawn,
  openBoard,
  rollDice,
  settleBoard,
} from '@/core/services/play/ludo/LudoTurnService'
import { ludoView } from '@/core/services/play/ludo/LudoViewService'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  roll: (session, accountId) => rollDice(session, accountId),
  move: movePawn,
}

/**
 * Ludo rules
 * @type {PlayEngine}
 */

export const LUDO_ENGINE: PlayEngine = {
  defaults: () => ludoDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readLudoSettings,
  start: openBoard,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: settleBoard,
  view: ludoView,
  extraStats: ludoStats,
}
