import 'server-only'

import { concordatDefaults, readConcordatSettings } from '@/core/lib/play/concordat'
import {
  actInGame,
  concordatBoards,
  concordatView,
  openGame,
  settleGame,
} from '@/core/services/play/concordat/ConcordatGameService'
import { concordatStats } from '@/core/services/play/concordat/ConcordatStatsService'
import type { PlayEngine } from '@/types/play'

/**
 * Concordat rules
 * @type {PlayEngine}
 */

export const CONCORDAT_ENGINE: PlayEngine = {
  defaults: () => concordatDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readConcordatSettings,
  start: openGame,
  act: actInGame,
  settle: settleGame,
  view: concordatView,
  viewFor: concordatBoards,
  extraStats: concordatStats,
}
