'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { echoSettingsOf } from '@/core/lib/play/echo/settings'
import type { EchoGameSettings } from '@/core/lib/play/echo/settings'
import { ECHO_SETTINGS, ECHO_SETUP_COPY, fillPlayMessage } from '@/declarations/play'
import { ECHO_SETUP } from '@/declarations/ui/variants'

// Rounds are voted at launch
const TABS = [{ value: 'speed', label: ECHO_SETUP_COPY.tabSpeed, icon: 'playClock' as const }]

/**
 * Rules picked before an Echo game opens, rounds are voted at launch
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const EchoSetupDrawer = ({ open, isSaving, onClose, onSubmit, current }: PlaySetupProps) => {
  const [settings, setSettings] = useState<EchoGameSettings>(() =>
    echoSettingsOf(current?.settings ?? null)
  )

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={ECHO_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {() => (
        <div className={ECHO_SETUP.body}>
          <SetupSection
            styles={ECHO_SETUP}
            title={ECHO_SETUP_COPY.roundSeconds}
            hint={ECHO_SETUP_COPY.roundSecondsHint}
          >
            <SetupStepper
              styles={ECHO_SETUP}
              value={settings.roundSeconds}
              range={ECHO_SETTINGS.roundSeconds}
              display={fillPlayMessage(ECHO_SETUP_COPY.seconds, {
                seconds: settings.roundSeconds,
              })}
              onChange={(roundSeconds) => setSettings((held) => ({ ...held, roundSeconds }))}
              labels={{ less: ECHO_SETUP_COPY.less, more: ECHO_SETUP_COPY.more }}
            />
          </SetupSection>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
