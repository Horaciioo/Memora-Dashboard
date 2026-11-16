'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupChips, SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { concordatSettingsOf } from '@/core/lib/play/concordat/settings'
import type { ConcordatGameSettings } from '@/core/lib/play/concordat/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import {
  CONCORDAT_DIFFICULTY_LABELS,
  CONCORDAT_MODE_LABELS,
  CONCORDAT_SETUP_COPY,
  CONCORDAT_SIZE_LABELS,
  CONCORDAT_SPEED_LABELS,
  CONCORDAT_STYLE_LABELS,
} from '@/declarations/play/concordat/copy'
import { CONCORDAT_SETTINGS, CONCORDAT_TEAMS } from '@/declarations/play/concordat/settings'
import { CONCORDAT_SETUP } from '@/declarations/ui/variants'

import { hasTeams } from '@/core/lib/play/concordat/modes/rules'

// Rules are shown in their own drawer
const TABS = [{ value: 'rules', label: CONCORDAT_SETUP_COPY.tabRules, icon: 'playRules' as const }]

const MODES = CONCORDAT_SETTINGS.modes.map((value) => ({
  value,
  label: CONCORDAT_MODE_LABELS[value],
}))
const SIZES = CONCORDAT_SETTINGS.sizes.map((value) => ({
  value,
  label: CONCORDAT_SIZE_LABELS[value],
}))
const STYLES = CONCORDAT_SETTINGS.styles.map((value) => ({
  value,
  label: CONCORDAT_STYLE_LABELS[value],
}))
const DIFFICULTIES = CONCORDAT_SETTINGS.difficulties.map((value) => ({
  value,
  label: CONCORDAT_DIFFICULTY_LABELS[value],
}))
const SPEEDS = CONCORDAT_SETTINGS.speeds.map((value) => ({
  value,
  label: CONCORDAT_SPEED_LABELS[value],
}))

/**
 * Map, speed and clock, picked before a Concordat game opens
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const ConcordatSetupDrawer = ({
  open,
  isSaving,
  onClose,
  onSubmit,
  current,
}: PlaySetupProps) => {
  const [settings, setSettings] = useState<ConcordatGameSettings>(() =>
    concordatSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof ConcordatGameSettings>(key: K) =>
    (value: ConcordatGameSettings[K]) =>
      setSettings((previous) => ({ ...previous, [key]: value }))
  const labels = { less: CONCORDAT_SETUP_COPY.less, more: CONCORDAT_SETUP_COPY.more }

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={CONCORDAT_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {() => (
        <div className={CONCORDAT_SETUP.body}>
          <SetupSection
            styles={CONCORDAT_SETUP}
            title={CONCORDAT_SETUP_COPY.mode}
            hint={CONCORDAT_SETUP_COPY.modeHint}
          >
            <SetupChips
              styles={CONCORDAT_SETUP}
              options={MODES}
              value={settings.mode}
              onChange={set('mode')}
            />
          </SetupSection>
          {hasTeams(settings.mode) && (
            <SetupSection
              styles={CONCORDAT_SETUP}
              title={CONCORDAT_SETUP_COPY.teams}
              hint={CONCORDAT_SETUP_COPY.teamsHint}
            >
              <SetupStepper
                styles={CONCORDAT_SETUP}
                value={settings.teams}
                range={CONCORDAT_TEAMS}
                display={fillPlayMessage(CONCORDAT_SETUP_COPY.teamCount, { count: settings.teams })}
                onChange={set('teams')}
                labels={labels}
              />
            </SetupSection>
          )}
          <SetupSection
            styles={CONCORDAT_SETUP}
            title={CONCORDAT_SETUP_COPY.size}
            hint={CONCORDAT_SETUP_COPY.sizeHint}
          >
            <SetupChips
              styles={CONCORDAT_SETUP}
              options={SIZES}
              value={settings.size}
              onChange={set('size')}
            />
          </SetupSection>
          <SetupSection
            styles={CONCORDAT_SETUP}
            title={CONCORDAT_SETUP_COPY.style}
            hint={CONCORDAT_SETUP_COPY.styleHint}
          >
            <SetupChips
              styles={CONCORDAT_SETUP}
              options={STYLES}
              value={settings.style}
              onChange={set('style')}
            />
          </SetupSection>
          <SetupSection
            styles={CONCORDAT_SETUP}
            title={CONCORDAT_SETUP_COPY.difficulty}
            hint={CONCORDAT_SETUP_COPY.difficultyHint}
          >
            <SetupChips
              styles={CONCORDAT_SETUP}
              options={DIFFICULTIES}
              value={settings.difficulty}
              onChange={set('difficulty')}
            />
          </SetupSection>
          <SetupSection
            styles={CONCORDAT_SETUP}
            title={CONCORDAT_SETUP_COPY.speed}
            hint={CONCORDAT_SETUP_COPY.speedHint}
          >
            <SetupChips
              styles={CONCORDAT_SETUP}
              options={SPEEDS}
              value={settings.speed}
              onChange={set('speed')}
            />
          </SetupSection>
          <SetupSection
            styles={CONCORDAT_SETUP}
            title={CONCORDAT_SETUP_COPY.duration}
            hint={CONCORDAT_SETUP_COPY.durationHint}
          >
            <SetupStepper
              styles={CONCORDAT_SETUP}
              value={settings.durationMinutes}
              range={CONCORDAT_SETTINGS.duration}
              step={5}
              display={fillPlayMessage(CONCORDAT_SETUP_COPY.minutes, {
                minutes: settings.durationMinutes,
              })}
              onChange={set('durationMinutes')}
              labels={labels}
            />
          </SetupSection>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
