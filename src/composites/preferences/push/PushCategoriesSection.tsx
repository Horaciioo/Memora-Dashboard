'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { Section } from '@/components/structures/page/Section'
import { PUSH_CATEGORY_REGISTRY } from '@/declarations/notifications/categories'
import type { PushCategoryName } from '@/declarations/notifications/categories'
import { PUSH_COPY } from '@/declarations/pwa/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PREFERENCE_STYLES, PUSH_STYLES } from '@/declarations/ui/variants'

export interface PushCategoriesSectionProps {
  muted: PushCategoryName[]
  onToggle: (category: PushCategoryName, isOn: boolean) => void
}

/**
 * One switch per push family
 * @param {PushCategoryName[]} muted - Silenced families
 * @param {(category: PushCategoryName, isOn: boolean) => void} onToggle - Switch handler
 * @return {JSX.Element}
 */

export const PushCategoriesSection = ({ muted, onToggle }: PushCategoriesSectionProps) => (
  <Section title={PUSH_COPY.categoriesTitle} description={PUSH_COPY.categoriesLead} padded>
    <div className={PREFERENCE_STYLES.rows}>
      {PUSH_CATEGORY_REGISTRY.keys.map((key) => {
        const category = PUSH_CATEGORY_REGISTRY.get(key)
        const Glyph = ICONS[category.icon]

        return (
          <div key={key} className={PREFERENCE_STYLES.row}>
            <div className={PUSH_STYLES.categoryLabel}>
              <Glyph className={PUSH_STYLES.categoryIcon} aria-hidden="true" />
              <div className={PUSH_STYLES.categoryText}>
                <span className={PUSH_STYLES.categoryName}>{category.label}</span>
                <span className={PUSH_STYLES.categoryLead}>{category.description}</span>
              </div>
            </div>
            <Toggle
              checked={!muted.includes(key)}
              onChange={(isOn) => onToggle(key, isOn)}
              label={category.label}
              bare
            />
          </div>
        )
      })}
    </div>
  </Section>
)
