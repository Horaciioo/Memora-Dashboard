'use client'

import { AppearanceToggle } from '@/components/elements/actions/AppearanceToggle'
import { ColorVisionSelect } from '@/components/elements/actions/ColorVisionSelect'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { Section } from '@/components/structures/Section'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'

/**
 * Appearance settings
 * @return {JSX.Element}
 */

export const DisplayPreferences = () => (
  <Section title={PREFERENCES_COPY.displayTitle} padded>
    <div className={PREFERENCE_STYLES.rows}>
      <div className={PREFERENCE_STYLES.row}>
        <span className={PREFERENCE_STYLES.label}>{PREFERENCES_COPY.themeTitle}</span>
        <ThemeToggle />
      </div>
      <div className={PREFERENCE_STYLES.row}>
        <span className={PREFERENCE_STYLES.label}>
          {PREFERENCES_COPY.textSizeTitle}
          <MaturityTag maturity="beta" />
        </span>
        <AppearanceToggle />
      </div>
      <div className={PREFERENCE_STYLES.row}>
        <span className={PREFERENCE_STYLES.label}>
          {PREFERENCES_COPY.colorVisionTitle}
          <MaturityTag maturity="beta" />
        </span>
        <ColorVisionSelect />
      </div>
    </div>
    <p className={PREFERENCE_STYLES.notice}>{PREFERENCES_COPY.storageNotice}</p>
  </Section>
)
