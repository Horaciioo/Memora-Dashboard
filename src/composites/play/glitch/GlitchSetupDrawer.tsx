'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { glitchSettingsOf } from '@/core/lib/play/glitch/settings'
import type { GlitchGameSettings } from '@/core/lib/play/glitch/settings'
import { GLITCH_SETTINGS, GLITCH_SETUP_COPY, fillPlayMessage } from '@/declarations/play'
import { GLITCH_SETUP } from '@/declarations/ui/variants'

// Tabs of the drawer
const TABS = [
  { value: 'rounds', label: GLITCH_SETUP_COPY.tabRounds, icon: 'playRounds' as const },
  { value: 'speed', label: GLITCH_SETUP_COPY.tabSpeed, icon: 'playClock' as const },
]

/**
 * Rules picked before a Glitch game opens
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
  const set =
    <K extends keyof GlitchGameSettings>(key: K) =>
    (value: GlitchGameSettings[K]) =>
      setSettings((previous) => ({ ...previous, [key]: value }))
  const steps = { less: GLITCH_SETUP_COPY.less, more: GLITCH_SETUP_COPY.more }

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
      {(tab) => (
        <div className={GLITCH_SETUP.body}>
          {tab === 'rounds' && (
            <>
              <SetupSection
                styles={GLITCH_SETUP}
                title={GLITCH_SETUP_COPY.rounds}
                hint={GLITCH_SETUP_COPY.roundsHint}
              >
                <SetupStepper
                  styles={GLITCH_SETUP}
                  value={settings.rounds}
                  range={GLITCH_SETTINGS.rounds}
                  display={fillPlayMessage(GLITCH_SETUP_COPY.count, { count: settings.rounds })}
                  onChange={set('rounds')}
                  labels={steps}
                />
              </SetupSection>
              <SetupSection
                styles={GLITCH_SETUP}
                title={GLITCH_SETUP_COPY.differences}
                hint={GLITCH_SETUP_COPY.differencesHint}
              >
                <SetupStepper
                  styles={GLITCH_SETUP}
                  value={settings.differences}
                  range={GLITCH_SETTINGS.differences}
                  display={fillPlayMessage(GLITCH_SETUP_COPY.differenceCount, {
                    count: settings.differences,
                  })}
                  onChange={set('differences')}
                  labels={steps}
                />
              </SetupSection>
            </>
          )}

          {tab === 'speed' && (
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
                onChange={set('roundSeconds')}
                labels={steps}
              />
            </SetupSection>
          )}
        </div>
      )}
    </PlaySetupDrawer>
  )
}
