import { FEATURE_MAP, FEATURES, FeatureModes } from '@/declarations/features'
import type { FeatureModeName, FeatureState } from '@/declarations/features'

/**
 * Switch in force on a feature, and the feature holding it
 * @typedef {Object} FeatureVerdict
 * @property {FeatureModeName} mode - Position in force
 * @property {string | null} source - Feature whose switch decides, itself or an ancestor
 * @property {string | null} note - Words members read
 */

export interface FeatureVerdict {
  mode: FeatureModeName
  source: string | null
  note: string | null
}

// Strictest position wins
const STRICTNESS: Record<FeatureModeName, number> = {
  [FeatureModes.On]: 0,
  [FeatureModes.Admins]: 1,
  [FeatureModes.Off]: 2,
}

const OPEN: FeatureVerdict = { mode: FeatureModes.On, source: null, note: null }

/**
 * Position in force on a feature, its parents counted
 * @param {string} key - Feature key
 * @param {ReadonlyMap<string, FeatureState>} overrides - Switches away from default
 * @return {FeatureVerdict} - Verdict
 */

export const verdictOf = (
  key: string,
  overrides: ReadonlyMap<string, FeatureState>
): FeatureVerdict => {
  const feature = FEATURE_MAP.get(key)
  // Unknown or locked stays open whatever sits above it
  if (!feature || feature.locked) return OPEN

  const own = overrides.get(key)
  const inherited = feature.parent ? verdictOf(feature.parent, overrides) : OPEN

  if (!own || own.mode === FeatureModes.On) return inherited
  if (STRICTNESS[inherited.mode] > STRICTNESS[own.mode]) return inherited

  return { mode: own.mode, source: key, note: own.note }
}

/**
 * Verdict closes the feature to a viewer
 * @param {FeatureVerdict} verdict - Verdict
 * @param {boolean} isAdmin - Viewer holds the system
 * @return {boolean} - Closed
 */

export const isClosed = (verdict: FeatureVerdict, isAdmin: boolean): boolean =>
  verdict.mode === FeatureModes.Off || (verdict.mode === FeatureModes.Admins && !isAdmin)

/**
 * Every feature closed to a viewer, parents' switches included
 * @param {ReadonlyMap<string, FeatureState>} overrides - Switches away from default
 * @param {boolean} isAdmin - Viewer holds the system
 * @return {string[]} - Closed keys
 */

export const closedKeys = (
  overrides: ReadonlyMap<string, FeatureState>,
  isAdmin: boolean
): string[] =>
  FEATURES.filter((feature) => isClosed(verdictOf(feature.key, overrides), isAdmin)).map(
    (feature) => feature.key
  )
