'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { jumbleSettingsOf } from '@/core/lib/play/jumble/settings'
import type { JumbleGameSettings } from '@/core/lib/play/jumble/settings'
import { JUMBLE_SETTINGS, JUMBLE_SETUP_COPY, fillPlayMessage } from '@/declarations/play'
import { JUMBLE_SETUP } from '@/declarations/ui/variants'

// Difficulty, rounds and hints are voted at launch
const TABS = [{ value: 'speed', label: JUMBLE_SETUP_COPY.tabSpeed, icon: 'playClock' as const }]

/**
 * Rules picked before a Jumble game opens, the rest is voted at launch
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
      {() => (
        <div className={JUMBLE_SETUP.body}>
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
              onChange={(roundSeconds) => setSettings((held) => ({ ...held, roundSeconds }))}
              labels={{ less: JUMBLE_SETUP_COPY.less, more: JUMBLE_SETUP_COPY.more }}
            />
          </SetupSection>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
