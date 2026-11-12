import 'server-only'

import { conflict } from '@/core/lib/errors'
import { jumbleDefaults, readJumbleSettings } from '@/core/lib/play/jumble'
import { guessWord, openTable, settleTable } from '@/core/services/play/jumble/JumbleRoundService'
import { jumbleStats } from '@/core/services/play/jumble/JumbleStatsService'
import { jumbleBoards, jumbleView } from '@/core/services/play/jumble/JumbleViewService'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  guess: guessWord,
}

/**
 * Jumble rules
 * @type {PlayEngine}
 */

export const JUMBLE_ENGINE: PlayEngine = {
  defaults: () => jumbleDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readJumbleSettings,
  start: openTable,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: settleTable,
  view: jumbleView,
  isViewShared: true,
  viewFor: jumbleBoards,
  extraStats: jumbleStats,
}
