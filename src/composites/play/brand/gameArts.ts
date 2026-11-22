import type { ComponentType } from 'react'

import { BaccalaureatCardArt } from '@/composites/play/baccalaureat/art/BaccalaureatCardArt'
import { BombCardArt } from '@/composites/play/bomb/art/BombCardArt'
import { ConcordatCardArt } from '@/composites/play/concordat/art/ConcordatCardArt'
import { EchoCardArt } from '@/composites/play/echo/art/EchoCardArt'
import { NavalCardArt } from '@/composites/play/naval/art/NavalCardArt'
import { CroquisCardArt } from '@/composites/play/croquis/art/CroquisCardArt'
import { GlitchCardArt } from '@/composites/play/glitch/art/GlitchCardArt'
import { GolfCardArt } from '@/composites/play/golf/art/GolfCardArt'
import { JumbleCardArt } from '@/composites/play/jumble/art/JumbleCardArt'
import { LudoCardArt } from '@/composites/play/ludo/art/LudoCardArt'
import { StopGoCardArt } from '@/composites/play/stopgo/art/StopGoCardArt'
import { SuspensCardArt } from '@/composites/play/suspens/art/SuspensCardArt'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Games drawn in their own direction, cut to a card or a tile
 * @type {Partial<Record<PlayGameName, ComponentType<{ frame: GameArtFrame }>>>}
 */

export const GAME_ARTS: Partial<Record<PlayGameName, ComponentType<{ frame: GameArtFrame }>>> = {
  [PlayGames.Bomb]: BombCardArt,
  [PlayGames.Echo]: EchoCardArt,
  [PlayGames.Concordat]: ConcordatCardArt,
  [PlayGames.Baccalaureat]: BaccalaureatCardArt,
  [PlayGames.Naval]: NavalCardArt,
  [PlayGames.Croquis]: CroquisCardArt,
  [PlayGames.Glitch]: GlitchCardArt,
  [PlayGames.Golf]: GolfCardArt,
  [PlayGames.Jumble]: JumbleCardArt,
  [PlayGames.Ludo]: LudoCardArt,
  [PlayGames.StopGo]: StopGoCardArt,
  [PlayGames.Suspens]: SuspensCardArt,
}
