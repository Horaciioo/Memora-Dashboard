'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { glitchSettingsOf } from '@/core/lib/play/glitch/settings'
import type { GlitchGameSettings } from '@/core/lib/play/glitch/settings'
import { GLITCH_SETTINGS, GLITCH_SETUP_COPY, fillPlayMessage } from '@/declarations/play'
import { GLITCH_SETUP } from '@/declarations/ui/variants'

// Rounds and differences are voted at launch
const TABS = [{ value: 'speed', label: GLITCH_SETUP_COPY.tabSpeed, icon: 'playClock' as const }]

/**
 * Rules picked before a Glitch game opens, rounds and differences are voted at launch
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const GlitchSetupDrawer = ({
  open,
  isSaving,
  onClose,
  onSubmit,
  current,
}: PlaySetupProps) => {
  const [settings, setSettings] = useState<GlitchGameSettings>(() =>
    glitchSettingsOf(current?.settings ?? null)
  )

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={GLITCH_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {() => (
        <div className={GLITCH_SETUP.body}>
          <SetupSection
            styles={GLITCH_SETUP}
            title={GLITCH_SETUP_COPY.roundSeconds}
            hint={GLITCH_SETUP_COPY.roundSecondsHint}
          >
            <SetupStepper
              styles={GLITCH_SETUP}
              value={settings.roundSeconds}
              range={GLITCH_SETTINGS.roundSeconds}
              display={fillPlayMessage(GLITCH_SETUP_COPY.seconds, {
                seconds: settings.roundSeconds,
              })}
              onChange={(roundSeconds) => setSettings((held) => ({ ...held, roundSeconds }))}
              labels={{ less: GLITCH_SETUP_COPY.less, more: GLITCH_SETUP_COPY.more }}
            />
          </SetupSection>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
