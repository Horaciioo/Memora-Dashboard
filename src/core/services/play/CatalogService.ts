import 'server-only'

import {
  BACCALAUREAT_CATEGORIES,
  BACCALAUREAT_PACKS,
  BACCALAUREAT_SETTINGS,
  PLAY_GAMES,
  PLAY_SETTINGS,
} from '@/declarations/play'
import { PLAY_ENGINES } from '@/core/engines/play'

/**
 * Games and their choices, for the lobby screens
 * @return {object} - Catalogue
 */

export const readCatalog = () => ({
  games: PLAY_GAMES.keys.map((game) => ({
    game,
    ...PLAY_GAMES.get(game),
    playable: PLAY_GAMES.get(game).playable && Boolean(PLAY_ENGINES[game]),
    defaults: PLAY_ENGINES[game]?.defaults() ?? null,
  })),
  tournament: PLAY_SETTINGS.tournament,
  baccalaureat: {
    categories: Object.entries(BACCALAUREAT_CATEGORIES).map(([id, entry]) => ({ id, ...entry })),
    packs: Object.entries(BACCALAUREAT_PACKS).map(([id, entry]) => ({ id, ...entry })),
    flash: BACCALAUREAT_SETTINGS.flash,
    jokersPerPlayer: BACCALAUREAT_SETTINGS.jokersPerPlayer,
    alphabet: BACCALAUREAT_SETTINGS.alphabet,
    rounds: BACCALAUREAT_SETTINGS.rounds,
    roundSeconds: BACCALAUREAT_SETTINGS.roundSeconds,
    categoryCount: BACCALAUREAT_SETTINGS.categories,
    customCategories: BACCALAUREAT_SETTINGS.customCategories,
    countdownSeconds: BACCALAUREAT_SETTINGS.countdownSeconds,
  },
})
