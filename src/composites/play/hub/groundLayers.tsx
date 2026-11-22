import type { ComponentType } from 'react'

import { PlayGroundFinish } from '@/composites/play/hub/PlayGroundFinish'

import { GolfHubBanner } from '@/composites/play/golf/art/GolfHubBanner'
import { BombHubBanner } from '@/composites/play/bomb/art/BombHubBanner'
import { PlayConcordatMap } from '@/composites/play/hub/PlayConcordatMap'
import { PlayStopGoRoad } from '@/composites/play/hub/PlayStopGoRoad'
import { SuspensHubBanner } from '@/composites/play/suspens/art/SuspensHubBanner'
import { CroquisHubBanner } from '@/composites/play/croquis/art/CroquisHubBanner'
import { EchoHubBanner } from '@/composites/play/echo/art/EchoHubBanner'
import { GlitchHubBanner } from '@/composites/play/glitch/art/GlitchHubBanner'
import { JumbleHubBanner } from '@/composites/play/jumble/art/JumbleHubBanner'
import { NavalHubBanner } from '@/composites/play/naval/art/NavalHubBanner'
import { LudoHubBanner } from '@/composites/play/ludo/art/LudoHubBanner'
import { BaccalaureatHubBanner } from '@/composites/play/baccalaureat/art/BaccalaureatHubBanner'
import { GOLF_TURF } from '@/declarations/play/golf/copy'
import { CROQUIS_HUB } from '@/declarations/play/croquis/copy'
import { SUSPENS_HUB } from '@/declarations/play/suspens/copy'
import { ECHO_HUB } from '@/declarations/play/echo/copy'
import { GLITCH_HUB } from '@/declarations/play/glitch/copy'
import { JUMBLE_HUB } from '@/declarations/play/jumble/copy'
import { LUDO_FELT } from '@/declarations/play/ludo/copy'
import { NAVAL_SEA } from '@/declarations/play/naval/copy'
import { STOPGO_HUB } from '@/declarations/play/stopgo/art'
import { CONCORDAT_HUB } from '@/declarations/play/concordat/hub'
import { BOMB_EMBERS, PLAY_PAPER } from '@/declarations/play'

/**
 * Animated layer of each game ground, shared by the hub and the lobby
 * @type {Record<string, ComponentType>}
 */

const LAYERS: Record<string, ComponentType> = {
  [PLAY_PAPER.ground]: BaccalaureatHubBanner,
  [BOMB_EMBERS.ground]: BombHubBanner,
  [JUMBLE_HUB.ground]: JumbleHubBanner,
  [ECHO_HUB.ground]: EchoHubBanner,
  [CROQUIS_HUB.ground]: CroquisHubBanner,
  [SUSPENS_HUB.ground]: SuspensHubBanner,
  [GLITCH_HUB.ground]: GlitchHubBanner,
  [GOLF_TURF.ground]: GolfHubBanner,
  [LUDO_FELT.ground]: LudoHubBanner,
  [NAVAL_SEA.ground]: NavalHubBanner,
  [STOPGO_HUB.ground]: PlayStopGoRoad,
  [CONCORDAT_HUB.ground]: PlayConcordatMap,
}

/**
 * Banner of each game ground with its print finish, shared by the hub and the lobby
 * @type {Record<string, ComponentType>}
 */

export const GROUND_LAYERS: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(LAYERS).map(([ground, Layer]) => [
    ground,
    () => (
      <>
        <Layer />
        <PlayGroundFinish ground={ground} />
      </>
    ),
  ])
)
