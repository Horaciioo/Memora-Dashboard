import 'server-only'

import { BACCALAUREAT_BOT } from '@/core/bots/play/baccalaureat'
import { BOMB_BOT } from '@/core/bots/play/bomb'
import { ECHO_BOT } from '@/core/bots/play/echo'
import { GLITCH_BOT } from '@/core/bots/play/glitch'
import { GOLF_BOT } from '@/core/bots/play/golf'
import { JUMBLE_BOT } from '@/core/bots/play/jumble'
import { LUDO_BOT } from '@/core/bots/play/ludo'
import { NAVAL_BOT } from '@/core/bots/play/naval'
import type { PlayBotStrategy } from '@/types/play'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Bot strategy per game
 * @type {Record<PlayGameName, PlayBotStrategy>}
 */

export const PLAY_BOTS: Record<PlayGameName, PlayBotStrategy> = {
  [PlayGames.Baccalaureat]: BACCALAUREAT_BOT,
  [PlayGames.Bomb]: BOMB_BOT,
  [PlayGames.Golf]: GOLF_BOT,
  [PlayGames.Ludo]: LUDO_BOT,
  [PlayGames.Naval]: NAVAL_BOT,
  [PlayGames.Jumble]: JUMBLE_BOT,
  [PlayGames.Glitch]: GLITCH_BOT,
  [PlayGames.Echo]: ECHO_BOT,
}
