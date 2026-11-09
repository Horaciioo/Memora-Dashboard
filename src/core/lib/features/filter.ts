import { FEATURE_MAP, childrenOf, rootsOfSection, subtreeOf } from '@/declarations/features'
import type {
  FeatureDefinition,
  FeatureGroup,
  FeatureModeName,
  FeatureSection,
} from '@/declarations/features'
import type { FeatureRow } from '@/types/features'

/**
 * Console filter
 * @type {'all' | FeatureModeName}
 */

export type FeatureFilter = 'all' | FeatureModeName

/**
 * A feature or anything under it matches the search and the filter
 * @param {string} key - Feature key
 * @param {ReadonlyMap<string, FeatureRow>} rows - Rows by key
 * @param {string} term - Lowercased search term
 * @param {FeatureFilter} filter - Position asked
 * @return {boolean} - Shown
 */

export const showsFeature = (
  key: string,
  rows: ReadonlyMap<string, FeatureRow>,
  term: string,
  filter: FeatureFilter
): boolean =>
  subtreeOf(key).some((entry) => {
    const feature = FEATURE_MAP.get(entry)
    const row = rows.get(entry)
    if (!feature || !row) return false

    const isNamed = !term || `${feature.label} ${feature.description}`.toLowerCase().includes(term)

    return isNamed && (filter === 'all' || row.mode === filter)
  })

/**
 * A feature has a child whose position is not the default
 * @param {string} key - Feature key
 * @param {ReadonlyMap<string, FeatureRow>} rows - Rows by key
 * @return {boolean} - Holds a switch away from default
 */

export const holdsSwitch = (key: string, rows: ReadonlyMap<string, FeatureRow>): boolean =>
  childrenOf(key).some((child) =>
    subtreeOf(child.key).some((entry) => rows.get(entry)?.own !== 'ON')
  )

/**
 * A section holds a switch away from default
 * @param {FeatureSection} section - Section
 * @param {ReadonlyMap<string, FeatureRow>} rows - Rows by key
 * @return {boolean} - Holds one
 */

export const sectionHoldsSwitch = (
  section: FeatureSection,
  rows: ReadonlyMap<string, FeatureRow>
): boolean =>
  rootsOfSection(section).some((root) =>
    subtreeOf(root.key).some((entry) => rows.get(entry)?.own !== 'ON')
  )

/**
 * Siblings split by family, in reading order
 * @param {FeatureDefinition[]} features - Siblings
 * @return {{ group: FeatureGroup | null, features: FeatureDefinition[] }[]} - Families
 */

export const familiesOf = (
  features: FeatureDefinition[]
): { group: FeatureGroup | null; features: FeatureDefinition[] }[] =>
  [...Map.groupBy(features, (feature) => feature.group ?? null)].map(([group, members]) => ({
    group,
    features: members,
  }))
