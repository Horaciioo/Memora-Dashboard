'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupChips, SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { croquisSettingsOf } from '@/core/lib/play/croquis/settings'
import type { CroquisGameSettings } from '@/core/lib/play/croquis/settings'
import {
  CROQUIS_LEVELS,
  CROQUIS_LEVEL_LABELS,
  CROQUIS_SETTINGS,
  CROQUIS_SETUP_COPY,
  fillPlayMessage,
} from '@/declarations/play'
import { CROQUIS_SETUP } from '@/declarations/ui/variants'

// Laps are voted at launch
const TABS = [{ value: 'words', label: CROQUIS_SETUP_COPY.tabWords, icon: 'playLetters' as const }]

// Difficulty choices
const LEVEL_OPTIONS = CROQUIS_LEVELS.map((value) => ({ value, label: CROQUIS_LEVEL_LABELS[value] }))

// Hint choices
const HINT_OPTIONS = [
  { value: 'on', label: CROQUIS_SETUP_COPY.hintOn },
  { value: 'off', label: CROQUIS_SETUP_COPY.hintOff },
]

/**
 * Rules picked before a Croquis game opens
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const CroquisSetupDrawer = ({
  open,
  isSaving,
  onClose,
  onSubmit,
  current,
}: PlaySetupProps) => {
  const [settings, setSettings] = useState<CroquisGameSettings>(() =>
    croquisSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof CroquisGameSettings>(key: K) =>
    (value: CroquisGameSettings[K]) =>
      setSettings((previous) => ({ ...previous, [key]: value }))
  const steps = { less: CROQUIS_SETUP_COPY.less, more: CROQUIS_SETUP_COPY.more }

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={CROQUIS_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {() => (
        <div className={CROQUIS_SETUP.body}>
          <SetupSection
            styles={CROQUIS_SETUP}
            title={CROQUIS_SETUP_COPY.difficulty}
            hint={CROQUIS_SETUP_COPY.difficultyHint}
          >
            <SetupChips
              styles={CROQUIS_SETUP}
              options={LEVEL_OPTIONS}
              value={settings.difficulty}
              onChange={set('difficulty')}
            />
          </SetupSection>
          <SetupSection
            styles={CROQUIS_SETUP}
            title={CROQUIS_SETUP_COPY.hint}
            hint={CROQUIS_SETUP_COPY.hintHint}
          >
            <SetupChips
              styles={CROQUIS_SETUP}
              options={HINT_OPTIONS}
              value={settings.hasHint ? 'on' : 'off'}
              onChange={(value) => set('hasHint')(value === 'on')}
            />
          </SetupSection>
          <SetupSection
            styles={CROQUIS_SETUP}
            title={CROQUIS_SETUP_COPY.roundSeconds}
            hint={CROQUIS_SETUP_COPY.roundSecondsHint}
          >
            <SetupStepper
              styles={CROQUIS_SETUP}
              value={settings.roundSeconds}
              range={CROQUIS_SETTINGS.roundSeconds}
              step={5}
              display={fillPlayMessage(CROQUIS_SETUP_COPY.seconds, {
                seconds: settings.roundSeconds,
              })}
              onChange={set('roundSeconds')}
              labels={steps}
            />
          </SetupSection>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
