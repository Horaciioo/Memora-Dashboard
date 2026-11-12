'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupChips, SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { jumbleSettingsOf } from '@/core/lib/play/jumble/settings'
import type { JumbleGameSettings } from '@/core/lib/play/jumble/settings'
import { JUMBLE_SETTINGS, JUMBLE_SETUP_COPY, fillPlayMessage } from '@/declarations/play'
import { JUMBLE_SETUP } from '@/declarations/ui/variants'

// Tabs of the drawer
const TABS = [
  { value: 'rounds', label: JUMBLE_SETUP_COPY.tabRounds, icon: 'playRounds' as const },
  { value: 'speed', label: JUMBLE_SETUP_COPY.tabSpeed, icon: 'playClock' as const },
]

// Hint choices
const HINT_OPTIONS = [
  { value: 'on', label: JUMBLE_SETUP_COPY.hintOn },
  { value: 'off', label: JUMBLE_SETUP_COPY.hintOff },
]

/**
 * Rules picked before a Jumble game opens
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const JumbleSetupDrawer = ({
  open,
  isSaving,
  onClose,
  onSubmit,
  current,
}: PlaySetupProps) => {
  const [settings, setSettings] = useState<JumbleGameSettings>(() =>
    jumbleSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof JumbleGameSettings>(key: K) =>
    (value: JumbleGameSettings[K]) =>
      setSettings((previous) => ({ ...previous, [key]: value }))
  const steps = { less: JUMBLE_SETUP_COPY.less, more: JUMBLE_SETUP_COPY.more }

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={JUMBLE_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {(tab) => (
        <div className={JUMBLE_SETUP.body}>
          {tab === 'rounds' && (
            <SetupSection
              styles={JUMBLE_SETUP}
              title={JUMBLE_SETUP_COPY.rounds}
              hint={JUMBLE_SETUP_COPY.roundsHint}
            >
              <SetupStepper
                styles={JUMBLE_SETUP}
                value={settings.rounds}
                range={JUMBLE_SETTINGS.rounds}
                display={fillPlayMessage(JUMBLE_SETUP_COPY.count, { count: settings.rounds })}
                onChange={set('rounds')}
                labels={steps}
              />
            </SetupSection>
          )}

          {tab === 'speed' && (
            <>
              <SetupSection
                styles={JUMBLE_SETUP}
                title={JUMBLE_SETUP_COPY.roundSeconds}
                hint={JUMBLE_SETUP_COPY.roundSecondsHint}
              >
                <SetupStepper
                  styles={JUMBLE_SETUP}
                  value={settings.roundSeconds}
                  range={JUMBLE_SETTINGS.roundSeconds}
                  display={fillPlayMessage(JUMBLE_SETUP_COPY.seconds, {
                    seconds: settings.roundSeconds,
                  })}
                  onChange={set('roundSeconds')}
                  labels={steps}
                />
              </SetupSection>
              <SetupSection
                styles={JUMBLE_SETUP}
                title={JUMBLE_SETUP_COPY.hint}
                hint={JUMBLE_SETUP_COPY.hintHint}
              >
                <SetupChips
                  styles={JUMBLE_SETUP}
                  options={HINT_OPTIONS}
                  value={settings.hasHint ? 'on' : 'off'}
                  onChange={(value) => set('hasHint')(value === 'on')}
                />
              </SetupSection>
            </>
          )}
        </div>
      )}
    </PlaySetupDrawer>
  )
}
