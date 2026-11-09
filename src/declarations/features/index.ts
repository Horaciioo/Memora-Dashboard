import { PAGE_FEATURES } from '@/declarations/features/pages'
import { PLAY_FEATURES } from '@/declarations/features/play'
import { SHELL_FEATURES } from '@/declarations/features/shell'
import { buildPatterns, matchPath } from '@/declarations/features/match'
import type { FeatureDefinition, FeatureSection } from '@/declarations/features/types'

export { gameFeatureKey } from '@/declarations/features/play'
export * from '@/declarations/features/types'

/**
 * Everything that can be switched, parents before children
 * @type {FeatureDefinition[]}
 */

export const FEATURES: FeatureDefinition[] = [...PAGE_FEATURES, ...PLAY_FEATURES, ...SHELL_FEATURES]

/**
 * Features by key
 * @type {Map<string, FeatureDefinition>}
 */

export const FEATURE_MAP = new Map(FEATURES.map((feature) => [feature.key, feature]))

const ROUTE_PATTERNS = buildPatterns(FEATURES, 'routes')
const API_PATTERNS = buildPatterns(FEATURES, 'api')

/**
 * Feature behind a screen path
 * @param {string} pathname - Path of the screen
 * @return {string | null} - Feature key
 */

export const featureOfPath = (pathname: string): string | null =>
  matchPath(ROUTE_PATTERNS, pathname)

/**
 * Feature behind an endpoint path
 * @param {string} pathname - Path of the endpoint
 * @return {string | null} - Feature key
 */

export const featureOfApi = (pathname: string): string | null => matchPath(API_PATTERNS, pathname)

/**
 * Direct children of a feature
 * @param {string} key - Parent key
 * @return {FeatureDefinition[]} - Children in display order
 */

export const childrenOf = (key: string): FeatureDefinition[] =>
  FEATURES.filter((feature) => feature.parent === key)

/**
 * Parent chain of a feature, nearest first
 * @param {string} key - Feature key
 * @return {string[]} - Ancestor keys
 */

export const ancestorsOf = (key: string): string[] => {
  const parent = FEATURE_MAP.get(key)?.parent

  return parent ? [parent, ...ancestorsOf(parent)] : []
}

/**
 * A feature and everything under it
 * @param {string} key - Feature key
 * @return {string[]} - Keys
 */

export const subtreeOf = (key: string): string[] => [
  key,
  ...childrenOf(key).flatMap((child) => subtreeOf(child.key)),
]

/**
 * Top-level features of one console section
 * @param {FeatureSection} section - Section
 * @return {FeatureDefinition[]} - Roots in display order
 */

export const rootsOfSection = (section: FeatureSection): FeatureDefinition[] =>
  FEATURES.filter((feature) => feature.section === section)

/**
 * Screen open to a viewer, given the features closed to them
 * @param {Record<string, unknown>} closed - Closed features by key
 * @param {string} pathname - Path of the screen
 * @return {boolean} - Open
 */

export const isPathOpenIn = (closed: Record<string, unknown>, pathname: string): boolean => {
  const key = featureOfPath(pathname)

  return !key || !(key in closed)
}
