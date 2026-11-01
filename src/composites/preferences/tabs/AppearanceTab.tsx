'use client'

import { ColorVisionPreferences } from '@/composites/preferences/ColorVisionPreferences'
import { ComfortCards } from '@/composites/preferences/comfort/ComfortCards'
import { ThemePicker } from '@/composites/preferences/DisplayPreferences'
import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { SETTINGS_GROUP_COPY } from '@/declarations/preferences/settings'
import { PICKER_CARD, PREFERENCE_STYLES } from '@/declarations/ui/variants'

/**
 * Look of Memora: theme, frame and cards, shapes, colour vision
 * @return {JSX.Element}
 */

export const AppearanceTab = () => (
  <div className={PREFERENCE_STYLES.stack}>
    <SettingsGroup title={SETTINGS_GROUP_COPY.theme}>
      <ThemePicker />
      <p className={PICKER_CARD.note}>{PREFERENCES_COPY.storageNotice}</p>
    </SettingsGroup>
    <SettingsGroup title={SETTINGS_GROUP_COPY.frame}>
      <div className={PICKER_CARD.pair}>
        <ComfortCards settingKey="frame" />
        <ComfortCards settingKey="glass" />
      </div>
      <p className={PICKER_CARD.note}>{SETTINGS_GROUP_COPY.browserNotice}</p>
    </SettingsGroup>
    <SettingsGroup title={SETTINGS_GROUP_COPY.shape}>
      <ComfortCards settingKey="radius" />
    </SettingsGroup>
    <SettingsGroup
      title={PREFERENCES_COPY.colorVisionTitle}
      maturity="beta"
    >
      <ColorVisionPreferences />
    </SettingsGroup>
  </div>
)
