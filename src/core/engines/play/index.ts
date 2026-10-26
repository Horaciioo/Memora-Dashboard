import 'server-only'

import { BACCALAUREAT_ENGINE } from '@/core/engines/play/BaccalaureatEngine'
import { BOMB_ENGINE } from '@/core/engines/play/BombEngine'
import { GOLF_ENGINE } from '@/core/engines/play/GolfEngine'
import type { PlayEngine } from '@/types/play'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Engines shipped so far
 * @type {Partial<Record<PlayGameName, PlayEngine>>}
 */

export const PLAY_ENGINES: Partial<Record<PlayGameName, PlayEngine>> = {
  [PlayGames.Baccalaureat]: BACCALAUREAT_ENGINE,
  [PlayGames.Bomb]: BOMB_ENGINE,
  [PlayGames.Golf]: GOLF_ENGINE,
}

export type { EngineSession, EngineStep, PlayEngine } from '@/types/play'
