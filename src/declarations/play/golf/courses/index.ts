import { createRegistry } from '@/core/lib/registry'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import type { GolfThemeName } from '@/declarations/play/golf/themes'
import { BOINGTOWN_HOLES } from '@/declarations/play/golf/courses/boingtown'
import { CANDY_HOLES } from '@/declarations/play/golf/courses/candy'
import { DROPPINHIT_HOLES } from '@/declarations/play/golf/courses/droppinhit'
import { RANDOMTOWN_HOLES } from '@/declarations/play/golf/courses/randomtown'
import { SINGLETOWN_HOLES } from '@/declarations/play/golf/courses/singletown'
import { SLIDETOWN_HOLES } from '@/declarations/play/golf/courses/slidetown'
import { ZARBLAND_HOLES } from '@/declarations/play/golf/courses/zarbland'
import { SPEEDTOWN_HOLES } from '@/declarations/play/golf/courses/speedtown'
import { ZIGZAG_HOLES } from '@/declarations/play/golf/courses/zigzag'

/**
 * One course of holes
 * @typedef {Object} GolfCourseMeta
 * @property {string} label - Display name
 * @property {string} tagline - Short pitch
 * @property {GolfThemeName} theme - Decor theme
 * @property {string} paint - Colour token prefix
 * @property {GolfHoleLayout[]} holes - Holes in order
 */

export interface GolfCourseMeta {
  label: string
  tagline: string
  theme: GolfThemeName
  paint: string
  holes: GolfHoleLayout[]
}

// Course drawn when the game starts
export const GOLF_RANDOM_COURSE = 'random'

/**
 * Golf courses
 * @type {Registry<string, GolfCourseMeta>}
 */

export const GOLF_COURSES = createRegistry<string, GolfCourseMeta>({
  randomtown: {
    label: 'RandomTown',
    tagline: 'Six descentes, cinq trous à points, beaucoup de hasard.',
    theme: 'randomtown',
    paint: '--play-golf-randomtown',
    holes: RANDOMTOWN_HOLES,
  },
  speedtown: {
    label: 'SpeedTown',
    tagline: 'Six parcours de plaques, où tout se joue sur la vitesse.',
    theme: 'speedtown',
    paint: '--play-golf-speedtown',
    holes: SPEEDTOWN_HOLES,
  },
  boingtown: {
    label: 'BoingTown',
    tagline: 'Rampes, vides et rebonds : la puissance du tir fait le saut.',
    theme: 'boingtown',
    paint: '--play-golf-boingtown',
    holes: BOINGTOWN_HOLES,
  },
  zigzag: {
    label: 'ZigZag',
    tagline: 'Six parcours à portails, difficiles mais jamais impossibles.',
    theme: 'zigzag',
    paint: '--play-golf-zigzag',
    holes: ZIGZAG_HOLES,
  },
  singletown: {
    label: 'SingleTown',
    tagline: 'Six trous, un seul tir décisif au-dessus du gouffre.',
    theme: 'singletown',
    paint: '--play-golf-singletown',
    holes: SINGLETOWN_HOLES,
  },
  slidetown: {
    label: 'SlideTown',
    tagline: 'Six toboggans, six trous à points au pied de la pente.',
    theme: 'slidetown',
    paint: '--play-golf-slidetown',
    holes: SLIDETOWN_HOLES,
  },
  zarbland: {
    label: 'ZarbLand',
    tagline: 'Six trous où le vent joue avec vous.',
    theme: 'zarbland',
    paint: '--play-golf-zarbland',
    holes: ZARBLAND_HOLES,
  },
  droppinhit: {
    label: 'DroppinHit',
    tagline: 'Six trous de golf classique, un piège chacun.',
    theme: 'droppinhit',
    paint: '--play-golf-droppinhit',
    holes: DROPPINHIT_HOLES,
  },
  candy: {
    label: 'Candy Kingdom',
    tagline: 'Six classiques sucrés, des bâtons de sucre au gâteau à étages.',
    theme: 'candy',
    paint: '--play-golf-candy',
    holes: CANDY_HOLES,
  },
})
