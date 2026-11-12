import { NavalMapFace } from '@/composites/play/naval/world/NavalMapFace'
import { NavalModeFace, NavalReplayFace } from '@/composites/play/naval/world/NavalRuleFace'
import type { PlayVoteFace } from '@/composites/play/vote/PlayStartVote'
import { NAVAL_MAPS } from '@/declarations/play/naval/maps'
import { NavalModes } from '@/utils/constants/play'

/**
 * Drawn picture of a card: maps painted, modes and the replay rule sketched, the random map keeps its glyph
 * @type {PlayVoteFace}
 */

export const navalVoteFace: PlayVoteFace = (step, key) => {
  if (step === 'map') return NAVAL_MAPS.has(key) ? <NavalMapFace id={key} /> : null
  if (step === 'mode') return <NavalModeFace isMelee={key === NavalModes.Melee} />

  return step === 'hitReplay' ? <NavalReplayFace isOn={key === 'on'} /> : null
}
