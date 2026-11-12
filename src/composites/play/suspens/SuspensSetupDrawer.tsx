'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { suspensSettingsOf } from '@/core/lib/play/suspens/settings'
import type { SuspensGameSettings } from '@/core/lib/play/suspens/settings'
import { fillPlayMessage, SUSPENS_SETTINGS, SUSPENS_SETUP_COPY } from '@/declarations/play'
import { SUSPENS_SETUP } from '@/declarations/ui/variants'

// Laps and errors are voted at launch
const TABS = [{ value: 'rules', label: SUSPENS_SETUP_COPY.tabRules, icon: 'playRules' as const }]

/**
 * Time of a turn and of the word choice, picked before a Suspens game opens
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const SuspensSetupDrawer = ({
  open,
  isSaving,
  onClose,
  onSubmit,
  current,
}: PlaySetupProps) => {
  const [settings, setSettings] = useState<SuspensGameSettings>(() =>
    suspensSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof SuspensGameSettings>(key: K) =>
    (value: SuspensGameSettings[K]) =>
      setSettings((previous) => ({ ...previous, [key]: value }))
  const steps = { less: SUSPENS_SETUP_COPY.less, more: SUSPENS_SETUP_COPY.more }

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={SUSPENS_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {() => (
        <div className={SUSPENS_SETUP.body}>
          <SetupSection
            styles={SUSPENS_SETUP}
            title={SUSPENS_SETUP_COPY.turnSeconds}
            hint={SUSPENS_SETUP_COPY.turnSecondsHint}
          >
            <SetupStepper
              styles={SUSPENS_SETUP}
              value={settings.turnSeconds}
              range={SUSPENS_SETTINGS.turnSeconds}
              step={2}
              display={fillPlayMessage(SUSPENS_SETUP_COPY.seconds, {
                seconds: settings.turnSeconds,
              })}
              onChange={set('turnSeconds')}
              labels={steps}
            />
          </SetupSection>
          <SetupSection
            styles={SUSPENS_SETUP}
            title={SUSPENS_SETUP_COPY.pickSeconds}
            hint={SUSPENS_SETUP_COPY.pickSecondsHint}
          >
            <SetupStepper
              styles={SUSPENS_SETUP}
              value={settings.pickSeconds}
              range={SUSPENS_SETTINGS.pickSeconds}
              step={5}
              display={fillPlayMessage(SUSPENS_SETUP_COPY.seconds, {
                seconds: settings.pickSeconds,
              })}
              onChange={set('pickSeconds')}
              labels={steps}
            />
          </SetupSection>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
