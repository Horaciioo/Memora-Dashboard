import type { ComponentType } from 'react'

import { GolfPanorama } from '@/composites/play/golf/panorama/GolfPanorama'
import { PlayEmbers } from '@/composites/play/hub/PlayEmbers'
import { PlayConcordatMap } from '@/composites/play/hub/PlayConcordatMap'
import { PlayStopGoRoad } from '@/composites/play/hub/PlayStopGoRoad'
import { PlaySuspensLetters } from '@/composites/play/hub/PlaySuspensLetters'
import { PlayCroquisFloaters } from '@/composites/play/hub/PlayCroquisFloaters'
import { PlayEchoFloaters } from '@/composites/play/hub/PlayEchoFloaters'
import { PlayGlitchFloaters } from '@/composites/play/hub/PlayGlitchFloaters'
import { PlayJumbleLetters } from '@/composites/play/hub/PlayJumbleLetters'
import { NavalHubPhoto } from '@/composites/play/naval/NavalHubPhoto'
import { LudoHopField } from '@/composites/play/ludo/LudoHopField'
import { PlayPaperWords } from '@/composites/play/hub/PlayPaperWords'
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

export const GROUND_LAYERS: Record<string, ComponentType> = {
  [PLAY_PAPER.ground]: PlayPaperWords,
  [BOMB_EMBERS.ground]: PlayEmbers,
  [JUMBLE_HUB.ground]: PlayJumbleLetters,
  [ECHO_HUB.ground]: PlayEchoFloaters,
  [CROQUIS_HUB.ground]: PlayCroquisFloaters,
  [SUSPENS_HUB.ground]: PlaySuspensLetters,
  [GLITCH_HUB.ground]: PlayGlitchFloaters,
  [GOLF_TURF.ground]: GolfPanorama,
  [LUDO_FELT.ground]: LudoHopField,
  [NAVAL_SEA.ground]: NavalHubPhoto,
  [STOPGO_HUB.ground]: PlayStopGoRoad,
  [CONCORDAT_HUB.ground]: PlayConcordatMap,
}
