'use client'

import { Button } from '@/components/elements/actions/Button'
import { ComfortRows } from '@/composites/preferences/comfort/ComfortRows'
import { TextSizePicker } from '@/composites/preferences/DisplayPreferences'
import { DockPreferences } from '@/composites/preferences/DockPreferences'
import { InstallSection } from '@/composites/preferences/InstallSection'
import { SettingRow } from '@/composites/preferences/SettingRow'
import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { replayGuides } from '@/app/(dashboard)/preferences/actions'
import { useComfortStore } from '@/core/store/appearance/comfort'
import { COMFORT_GROUPS } from '@/declarations/preferences/comfort'
import { PLAY_SOUND_COPY } from '@/declarations/play/sounds'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { SETTINGS_GROUP_COPY } from '@/declarations/preferences/settings'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { NavigationItem } from '@/declarations/navigation'
import { PICKER_CARD, PREFERENCE_STYLES, SETTINGS_GROUP } from '@/declarations/ui/variants'

export interface PreferencesTabProps {
  dock: { candidates: NavigationItem[]; saved: string[] }
}

/**
 * Habits: reading, accessibility, this device, explanations
 * @param {Object} dock - Pages offered and picked for the phone dock
 * @return {JSX.Element}
 */

export const PreferencesTab = ({ dock }: PreferencesTabProps) => {
  const reset = useComfortStore((state) => state.reset)
  const { notify } = useNotifications()

  return (
    <div className={PREFERENCE_STYLES.stack}>
      <SettingsGroup title={SETTINGS_GROUP_COPY.reading}>
        <div className={PREFERENCE_STYLES.stack}>
          <TextSizePicker />
          <ComfortRows keys={COMFORT_GROUPS.reading} />
        </div>
      </SettingsGroup>
      <SettingsGroup title={SETTINGS_GROUP_COPY.accessibility}>
        <ComfortRows keys={COMFORT_GROUPS.accessibility} />
        <div className={SETTINGS_GROUP.footer}>
          <p className={PICKER_CARD.noteInline}>{SETTINGS_GROUP_COPY.browserNotice}</p>
          <Button
            variant="ghost"
            icon="refresh"
            onClick={() => {
              reset()
              notify({ tone: 'success', title: SETTINGS_GROUP_COPY.resetDone })
            }}
          >
            {SETTINGS_GROUP_COPY.reset}
          </Button>
        </div>
      </SettingsGroup>
      <SettingsGroup title={PLAY_SOUND_COPY.title}>
        <SettingRow
          icon="golfSound"
          name={PLAY_SOUND_COPY.name}
          description={PLAY_SOUND_COPY.description}
        >
          <PlayVolume />
        </SettingRow>
      </SettingsGroup>
      <InstallSection />
      <DockPreferences candidates={dock.candidates} saved={dock.saved} />
      <SettingsGroup title={SETTINGS_GROUP_COPY.help} maturity="beta">
        <SettingRow
          icon="help"
          name={PREFERENCES_COPY.guidesTitle}
          description={PREFERENCES_COPY.guidesLead}
        >
          <form action={replayGuides}>
            <Button type="submit" variant="secondary" icon="refresh">
              {PREFERENCES_COPY.guidesAction}
            </Button>
          </form>
        </SettingRow>
      </SettingsGroup>
    </div>
  )
}
