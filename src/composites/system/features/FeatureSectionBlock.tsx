import { Button } from '@/components/elements/actions/Button'
import { FeatureNode } from '@/composites/system/features/FeatureNode'
import { featureSectionId } from '@/composites/system/features/FeatureSectionNav'
import { FeatureModes } from '@/declarations/features'
import type { FeatureDefinition, FeatureModeName } from '@/declarations/features'
import { FEATURE_COPY, FEATURE_SECTIONS } from '@/declarations/features/copy'
import { ICONS } from '@/declarations/ui/icons'
import { FEATURE_STYLES } from '@/declarations/ui/variants'
import type { FeatureRow } from '@/types/features'

export interface FeatureSectionBlockProps {
  section: (typeof FEATURE_SECTIONS)[number]
  roots: FeatureDefinition[]
  rows: ReadonlyMap<string, FeatureRow>
  isShown: (key: string) => boolean
  isSearching: boolean
  isBusy: boolean
  onApply: (keys: string[], mode: FeatureModeName, note?: string) => void
}

/**
 * One category of the console
 * @param {FeatureSectionBlockProps} props - Section, its roots and handlers
 * @return {JSX.Element}
 */

export const FeatureSectionBlock = ({
  section,
  roots,
  rows,
  isShown,
  isSearching,
  isBusy,
  onApply,
}: FeatureSectionBlockProps) => {
  const Icon = ICONS[section.icon]
  const keys = roots.map((root) => root.key)

  return (
    <section id={featureSectionId(section.key)} className={FEATURE_STYLES.section}>
      <div className={FEATURE_STYLES.sectionHead}>
        <div className={FEATURE_STYLES.sectionText}>
          <Icon className={FEATURE_STYLES.sectionIcon} aria-hidden="true" />
          <div>
            <h2 className={FEATURE_STYLES.sectionTitle}>{section.title}</h2>
            <p className={FEATURE_STYLES.sectionLead}>{section.lead}</p>
          </div>
        </div>
        <div className={FEATURE_STYLES.sectionActions}>
          <Button variant="ghost" disabled={isBusy} onClick={() => onApply(keys, FeatureModes.Off)}>
            {FEATURE_COPY.sectionOff}
          </Button>
          <Button variant="ghost" disabled={isBusy} onClick={() => onApply(keys, FeatureModes.On)}>
            {FEATURE_COPY.sectionOn}
          </Button>
        </div>
      </div>
      <div className={FEATURE_STYLES.panel}>
        {roots.map((root) => (
          <FeatureNode
            key={root.key}
            featureKey={root.key}
            rows={rows}
            isShown={isShown}
            isSearching={isSearching}
            isBusy={isBusy}
            onChange={(key, mode, note) => onApply([key], mode, note)}
          />
        ))}
      </div>
    </section>
  )
}
