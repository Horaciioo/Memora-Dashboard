'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupChips, SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { stopGoSettingsOf } from '@/core/lib/play/stopgo/settings'
import type { StopGoGameSettings } from '@/core/lib/play/stopgo/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { STOPGO_SETUP_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_SETUP } from '@/declarations/ui/variants'

// Distance and clock are voted at launch too
const TABS = [{ value: 'rules', label: STOPGO_SETUP_COPY.tabRules, icon: 'playRules' as const }]

// Distance chips in reading order
const TARGETS = STOPGO_SETTINGS.targets.map((km) => ({
  value: km,
  label: fillPlayMessage(STOPGO_SETUP_COPY.km, { km }),
}))

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
          <SetupSection
            styles={STOPGO_SETUP}
            title={STOPGO_SETUP_COPY.target}
            hint={STOPGO_SETUP_COPY.targetHint}
          >
            <SetupChips
              styles={STOPGO_SETUP}
              options={TARGETS}
              value={settings.target}
              onChange={set('target')}
            />
          </SetupSection>
          <SetupSection
            styles={STOPGO_SETUP}
            title={STOPGO_SETUP_COPY.turnSeconds}
            hint={STOPGO_SETUP_COPY.turnSecondsHint}
          >
            <SetupStepper
              styles={STOPGO_SETUP}
              value={settings.turnSeconds}
              range={STOPGO_SETTINGS.turnSeconds}
              step={STOPGO_SETTINGS.turnStep}
              display={fillPlayMessage(STOPGO_SETUP_COPY.seconds, {
                seconds: settings.turnSeconds,
              })}
              onChange={set('turnSeconds')}
              labels={{ less: STOPGO_SETUP_COPY.less, more: STOPGO_SETUP_COPY.more }}
            />
          </SetupSection>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
