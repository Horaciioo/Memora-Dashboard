import type { FeatureDefinition } from '@/declarations/features/types'

/**
 * Segments of a path, empty ones dropped
 * @param {string} path - Path
 * @return {string[]} - Segments
 */

const segmentsOf = (path: string): string[] => path.split('/').filter(Boolean)

/**
 * Pattern covers a path, as a prefix where * stands for one segment
 * @param {string[]} pattern - Pattern segments
 * @param {string[]} path - Path segments
 * @return {boolean} - Covered
 */

const covers = (pattern: string[], path: string[]): boolean =>
  pattern.length <= path.length &&
  pattern.every((segment, index) => segment === '*' || segment === path[index])

/**
 * Entry of the lookup table
 * @typedef {Object} FeaturePattern
 * @property {string[]} segments - Pattern segments
 * @property {string} key - Feature owning the pattern
 */

interface FeaturePattern {
  segments: string[]
  key: string
}

/**
 * Longest pattern first, so a sub-page beats its page
 * @param {FeatureDefinition[]} features - Registry
 * @param {'routes' | 'api'} side - Screens or endpoints
 * @return {FeaturePattern[]} - Sorted patterns
 */

export const buildPatterns = (
  features: FeatureDefinition[],
  side: 'routes' | 'api'
): FeaturePattern[] =>
  features
    .flatMap((feature) =>
      (feature[side] ?? []).map((path) => ({ segments: segmentsOf(path), key: feature.key }))
    )
    .sort((a, b) => b.segments.length - a.segments.length)

/**
 * Feature owning a path
 * @param {FeaturePattern[]} patterns - Sorted patterns
 * @param {string} path - Path, query ignored
 * @return {string | null} - Feature key
 */

export const matchPath = (patterns: FeaturePattern[], path: string): string | null => {
  const segments = segmentsOf(path.split(/[?#]/)[0] ?? '')

  return patterns.find((pattern) => covers(pattern.segments, segments))?.key ?? null
}
