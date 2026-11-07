import 'server-only'

import { conflict } from '@/core/lib/errors'
import { navalDefaults, readNavalSettings, navalSettingsOf } from '@/core/lib/play/naval'
import {
  fire,
  openBattle,
  placeFleet,
  retractFleet,
} from '@/core/services/play/naval/NavalActService'
import { advance } from '@/core/services/play/naval/NavalFlowService'
import { navalStats } from '@/core/services/play/naval/NavalStatsService'
import { withTable } from '@/core/services/play/naval/NavalTable'
import { navalView } from '@/core/services/play/naval/NavalViewService'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  fleet: placeFleet,
  unready: (session, accountId) => retractFleet(session, accountId),
  fire,
}

/**
 * Naval battle rules
 * @type {PlayEngine}
 */

export const NAVAL_ENGINE: PlayEngine = {
  defaults: () => navalDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readNavalSettings,
  start: openBattle,
  act: (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: (session) => withTable(session, advance),
  view: navalView,
  extraStats: navalStats,
  winnerMultiplier: (settings) => NAVAL_SETTINGS.winnerXp[navalSettingsOf(settings).mode],
}
