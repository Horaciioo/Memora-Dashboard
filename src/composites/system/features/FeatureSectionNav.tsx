import { sectionHoldsSwitch } from '@/core/lib/features/filter'
import { FEATURE_COPY, FEATURE_SECTIONS } from '@/declarations/features/copy'
import { ICONS } from '@/declarations/ui/icons'
import { FEATURE_STYLES } from '@/declarations/ui/variants'
import type { FeatureRow } from '@/types/features'

/**
 * Anchor of a console section
 * @param {string} key - Section key
 * @return {string} - Element id
 */

export const featureSectionId = (key: string): string => `feature-section-${key}`

/**
 * Jump list of the console, cut sections marked
 * @param {Object} props - Nav
 * @param {ReadonlyMap<string, FeatureRow>} props.rows - Rows by key
 * @return {JSX.Element}
 */

export const FeatureSectionNav = ({ rows }: { rows: ReadonlyMap<string, FeatureRow> }) => (
  <nav className={FEATURE_STYLES.nav} aria-label={FEATURE_COPY.sectionsNav}>
    {FEATURE_SECTIONS.map(({ key, title, icon }) => {
      const Icon = ICONS[icon]

      return (
        <a key={key} href={`#${featureSectionId(key)}`} className={FEATURE_STYLES.navLink}>
          <Icon className={FEATURE_STYLES.navIcon} aria-hidden="true" />
          {title}
          {sectionHoldsSwitch(key, rows) && (
            <span className={FEATURE_STYLES.navCut}>{FEATURE_COPY.sectionCut}</span>
          )}
        </a>
      )
    })}
  </nav>
)
