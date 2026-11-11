import { baccalaureatAdapter } from '@/core/services/nexus/handlers/game/adapters/baccalaureat'
import { bombAdapter } from '@/core/services/nexus/handlers/game/adapters/bomb'
import { golfAdapter } from '@/core/services/nexus/handlers/game/adapters/golf'
import { ludoAdapter } from '@/core/services/nexus/handlers/game/adapters/ludo'
import { navalAdapter } from '@/core/services/nexus/handlers/game/adapters/naval'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * One adapter per game
 * @type {Record<PlayGameName, GameAdapter>}
 */

export const GAME_ADAPTERS: Record<PlayGameName, GameAdapter> = {
  [PlayGames.Baccalaureat]: baccalaureatAdapter,
  [PlayGames.Golf]: golfAdapter,
  [PlayGames.Bomb]: bombAdapter,
  [PlayGames.Ludo]: ludoAdapter,
  [PlayGames.Naval]: navalAdapter,
}
