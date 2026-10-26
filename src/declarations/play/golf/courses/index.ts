import { createRegistry } from '@/core/lib/registry'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { ESPACE_HOLES } from '@/declarations/play/golf/courses/espace'
import { PLAGE_HOLES } from '@/declarations/play/golf/courses/plage'
import { TROPICAL_HOLES } from '@/declarations/play/golf/courses/tropical'
import type { GolfThemeName } from '@/declarations/play/golf/themes'
import { CANYON_HOLES } from '@/declarations/play/golf/courses/canyon'
import { scaleLayout } from '@/declarations/play/golf/courses/scale'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { PRAIRIE_HOLES } from '@/declarations/play/golf/courses/prairie'

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
 * Holes drawn at the corridor width of the game
 * @param {GolfHoleLayout[]} holes - Drawn holes
 * @return {GolfHoleLayout[]} - Scaled holes
 */

const narrowed = (holes: GolfHoleLayout[]): GolfHoleLayout[] =>
  holes.map((hole) => scaleLayout(hole, GOLF_SETTINGS.physics.layoutScale))

/**
 * Golf courses
 * @type {Registry<string, GolfCourseMeta>}
 */

export const GOLF_COURSES = createRegistry<string, GolfCourseMeta>({
  prairie: {
    label: 'La Prairie',
    tagline: 'Six trous pour apprendre le swing puis les pouvoirs.',
    theme: 'prairie',
    paint: '--play-golf-prairie',
    holes: narrowed(PRAIRIE_HOLES),
  },
  canyon: {
    label: 'Le Canyon',
    tagline: 'Six trous entre l’eau, les falaises et le tremplin.',
    theme: 'canyon',
    paint: '--play-golf-canyon',
    holes: narrowed(CANYON_HOLES),
  },
  tropical: {
    label: 'Les Tropiques',
    tagline: 'Six trous sous les palmiers, entre ventilateurs et passerelles.',
    theme: 'tropical',
    paint: '--play-golf-tropical',
    holes: narrowed(TROPICAL_HOLES),
  },
  espace: {
    label: 'L’Espace',
    tagline: 'Six trous en orbite, avec portails et trous noirs.',
    theme: 'espace',
    paint: '--play-golf-espace',
    holes: narrowed(ESPACE_HOLES),
  },
  plage: {
    label: 'La Plage',
    tagline: 'Six trous de sable, de vagues et de bouées.',
    theme: 'plage',
    paint: '--play-golf-plage',
    holes: narrowed(PLAGE_HOLES),
  },
})
