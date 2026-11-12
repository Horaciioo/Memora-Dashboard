import 'server-only'

import { conflict } from '@/core/lib/errors'
import { readSuspensSettings, suspensDefaults } from '@/core/lib/play/suspens'
import { guessLetter, guessWord } from '@/core/services/play/suspens/SuspensGuessService'
import {
  drawForSetter,
  openTable,
  pickWord,
  settleTable,
} from '@/core/services/play/suspens/SuspensRoundService'
import { suspensStats } from '@/core/services/play/suspens/SuspensStatsService'
import { suspensBoards, suspensView } from '@/core/services/play/suspens/SuspensViewService'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  pick: pickWord,
  draw: drawForSetter,
  letter: guessLetter,
  word: guessWord,
}

/**
 * Suspens rules
 * @type {PlayEngine}
 */

export const SUSPENS_ENGINE: PlayEngine = {
  defaults: () => suspensDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readSuspensSettings,
  start: openTable,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: settleTable,
  view: suspensView,
  viewFor: suspensBoards,
  extraStats: suspensStats,
}
