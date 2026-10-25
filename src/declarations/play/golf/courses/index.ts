import { createRegistry } from '@/core/lib/registry'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { CANYON_HOLES } from '@/declarations/play/golf/courses/canyon'
import { PRAIRIE_HOLES } from '@/declarations/play/golf/courses/prairie'

/**
 * One course of holes
 * @typedef {Object} GolfCourseMeta
 * @property {string} label - Display name
 * @property {string} tagline - Short pitch
 * @property {string} paint - Colour token prefix
 * @property {GolfHoleLayout[]} holes - Holes in order
 */

export interface GolfCourseMeta {
  label: string
  tagline: string
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
  prairie: {
    label: 'La Prairie',
    tagline: 'Neuf trous pour apprendre le swing puis les pouvoirs.',
    paint: '--play-golf-prairie',
    holes: PRAIRIE_HOLES,
  },
  canyon: {
    label: 'Le Canyon',
    tagline: 'Six trous entre l’eau et les falaises.',
    paint: '--play-golf-canyon',
    holes: CANYON_HOLES,
  },
})
