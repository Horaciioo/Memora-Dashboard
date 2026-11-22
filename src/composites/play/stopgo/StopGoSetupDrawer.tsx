'use client'

import { useState } from 'react'

import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { stopGoSettingsOf } from '@/core/lib/play/stopgo/settings'
import type { StopGoGameSettings } from '@/core/lib/play/stopgo/settings'
import { STOPGO_SETUP_COPY } from '@/declarations/play/stopgo/copy'
import { FIELD_STYLES, STOPGO_SETUP } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

// Distance and clock are voted at launch
const TABS = [{ value: 'rules', label: STOPGO_SETUP_COPY.tabRules, icon: 'playRules' as const }]

/**
 * Distance and clock of a turn, picked before a Stop & Go race opens
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const StopGoSetupDrawer = ({
  open,
  isSaving,
  onClose,
  onSubmit,
  current,
}: PlaySetupProps) => {
  const [settings, setSettings] = useState<StopGoGameSettings>(() =>
    stopGoSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof StopGoGameSettings>(key: K) =>
    (value: StopGoGameSettings[K]) =>
      setSettings((previous) => ({ ...previous, [key]: value }))

  return (
    <PlaySetupDrawer
      open={open}
      game={PlayGames.StopGo}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={STOPGO_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {() => (
        <div className={STOPGO_SETUP.body}>
          <div className={STOPGO_SETUP.switchRow}>
            <span className={FIELD_STYLES.labelRow}>
              <span className={STOPGO_SETUP.switchLabel}>{STOPGO_SETUP_COPY.safeties}</span>
              <InfoHint text={STOPGO_SETUP_COPY.safetiesHint} align="start" />
            </span>
            <Toggle
              bare
              checked={settings.safeties}
              onChange={set('safeties')}
              label={STOPGO_SETUP_COPY.safeties}
            />
          </div>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
