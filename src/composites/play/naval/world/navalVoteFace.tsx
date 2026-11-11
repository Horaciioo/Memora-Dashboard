import { NavalMapFace } from '@/composites/play/naval/world/NavalMapFace'
import type { PlayVoteFace } from '@/composites/play/vote/PlayStartVote'
import { NAVAL_MAPS } from '@/declarations/play/naval/maps'

/**
 * Drawn picture of a map card, the random card keeps its glyph
 * @type {PlayVoteFace}
 */

export const navalVoteFace: PlayVoteFace = (step, key) =>
  step === 'map' && NAVAL_MAPS.has(key) ? <NavalMapFace id={key} /> : null
