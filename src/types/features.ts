import type { FeatureModeName } from '@/declarations/features/types'

/**
 * Features closed to the viewer, by key
 * @typedef {Record<string, { mode: FeatureModeName, note: string | null }>} ClosedFeatures
 */

export type ClosedFeatures = Record<string, { mode: FeatureModeName; note: string | null }>

/**
 * Console row
 * @typedef {Object} FeatureRow
 * @property {string} key - Feature key
 * @property {FeatureModeName} own - Position of its own switch
 * @property {FeatureModeName} mode - Position in force, parents counted
 * @property {string | null} source - Feature holding the position in force
 * @property {string | null} note - Words members read
 * @property {boolean} isPaused - Asleep in the code
 */

export interface FeatureRow {
  key: string
  own: FeatureModeName
  mode: FeatureModeName
  source: string | null
  note: string | null
  isPaused: boolean
}
