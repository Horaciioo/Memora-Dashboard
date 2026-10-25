import 'server-only'

import { conflict } from '@/core/lib/errors'
import { golfDefaults, readGolfSettings } from '@/core/lib/play/golf'
import {
  golfStats,
  golfView,
  openCourse,
  playPower,
  playShot,
  settleCourse,
} from '@/core/services/play/golf'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  shot: playShot,
  power: playPower,
}

/**
 * Golf rules
 * @type {PlayEngine}
 */

export const GOLF_ENGINE: PlayEngine = {
  defaults: () => golfDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readGolfSettings,
  start: openCourse,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: settleCourse,
  view: golfView,
  extraStats: golfStats,
}
