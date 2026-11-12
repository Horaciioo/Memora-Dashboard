import 'server-only'

import { conflict } from '@/core/lib/errors'
import { ludoDefaults, readLudoSettings } from '@/core/lib/play/ludo'
import { ludoStats } from '@/core/services/play/ludo/LudoStatsService'
import {
  answerJoker,
  movePawn,
  openBoard,
  pickDie,
  rollDice,
  rollDuel,
  rollStorm,
  settleBoard,
} from '@/core/services/play/ludo/LudoTurnService'
import { ludoBoards, ludoView } from '@/core/services/play/ludo/LudoViewService'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  roll: (session, accountId) => rollDice(session, accountId),
  move: movePawn,
  pick: pickDie,
  joker: answerJoker,
  duelRoll: (session, accountId) => rollDuel(session, accountId),
  stormRoll: (session, accountId) => rollStorm(session, accountId),
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
  viewFor: ludoBoards,
  extraStats: ludoStats,
}
