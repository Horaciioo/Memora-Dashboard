'use client'

import { useState } from 'react'

import { ConcordatRegionArt, ConcordatSizeArt } from '@/composites/play/concordat/ConcordatSetupArt'
import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import {
  SetupArtCards,
  SetupChips,
  SetupPicks,
  SetupSection,
  SetupStepper,
} from '@/composites/play/setup/PlaySetupFields'
import { concordatSettingsOf } from '@/core/lib/play/concordat/settings'
import type { ConcordatGameSettings } from '@/core/lib/play/concordat/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import {
  CONCORDAT_DIFFICULTY_LABELS,
  CONCORDAT_MODE_LABELS,
  CONCORDAT_SETUP_COPY,
  CONCORDAT_SIZE_LABELS,
  CONCORDAT_SPEED_LABELS,
  CONCORDAT_STYLE_CHOICE_LABELS,
} from '@/declarations/play/concordat/copy'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_SETTINGS, CONCORDAT_TEAMS } from '@/declarations/play/concordat/settings'
import { CONCORDAT_SETUP } from '@/declarations/ui/variants'
import { CONCORDAT_WEAPONS } from '@/utils/constants/concordat'

import { hasTeams } from '@/core/lib/play/concordat/modes/rules'

const TABS = [
  { value: 'game', label: CONCORDAT_SETUP_COPY.tabGame, icon: 'playPlayers' as const },
  { value: 'map', label: CONCORDAT_SETUP_COPY.tabMap, icon: 'globe' as const },
  { value: 'pace', label: CONCORDAT_SETUP_COPY.tabPace, icon: 'playClock' as const },
  { value: 'weapons', label: CONCORDAT_SETUP_COPY.tabWeapons, icon: 'playFlame' as const },
]

const MODES = CONCORDAT_SETTINGS.modes.map((value) => ({
  value,
  label: CONCORDAT_MODE_LABELS[value],
}))
const SIZES = CONCORDAT_SETTINGS.sizes.map((value) => ({
  value,
  label: CONCORDAT_SIZE_LABELS[value],
  art: <ConcordatSizeArt size={value} />,
}))
const STYLES = CONCORDAT_SETTINGS.styleChoices.map((value) => ({
  value,
  label: CONCORDAT_STYLE_CHOICE_LABELS[value],
  art: <ConcordatRegionArt style={value} />,
}))
const DIFFICULTIES = CONCORDAT_SETTINGS.difficulties.map((value) => ({
  value,
  label: CONCORDAT_DIFFICULTY_LABELS[value],
}))
const WEAPONS = CONCORDAT_WEAPONS.map((value) => ({
  value,
  label: CONCORDAT_HUD_COPY[value],
}))
const LIMITS = [
  { value: 'unlimited', label: CONCORDAT_SETUP_COPY.unlimited },
  { value: 'limited', label: CONCORDAT_SETUP_COPY.limited },
]
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
  const isUnlimited = settings.durationMinutes === CONCORDAT_SETTINGS.unlimited
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
      {(tab) => (
        <div className={CONCORDAT_SETUP.body}>
          {tab === 'game' && (
            <>
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
                    display={fillPlayMessage(CONCORDAT_SETUP_COPY.teamCount, {
                      count: settings.teams,
                    })}
                    onChange={set('teams')}
                    labels={labels}
                  />
                </SetupSection>
              )}
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
            </>
          )}
          {tab === 'map' && (
            <>
              <SetupSection
                styles={CONCORDAT_SETUP}
                title={CONCORDAT_SETUP_COPY.style}
                hint={CONCORDAT_SETUP_COPY.styleHint}
              >
                <SetupArtCards
                  styles={CONCORDAT_SETUP}
                  options={STYLES}
                  value={settings.style}
                  onChange={set('style')}
                />
              </SetupSection>
              <SetupSection
                styles={CONCORDAT_SETUP}
                title={CONCORDAT_SETUP_COPY.size}
                hint={CONCORDAT_SETUP_COPY.sizeHint}
              >
                <SetupArtCards
                  styles={CONCORDAT_SETUP}
                  options={SIZES}
                  value={settings.size}
                  onChange={set('size')}
                />
              </SetupSection>
            </>
          )}
          {tab === 'pace' && (
            <>
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
                <SetupChips
                  styles={CONCORDAT_SETUP}
                  options={LIMITS}
                  value={isUnlimited ? 'unlimited' : 'limited'}
                  onChange={(limit) =>
                    set('durationMinutes')(
                      limit === 'unlimited'
                        ? CONCORDAT_SETTINGS.unlimited
                        : CONCORDAT_SETTINGS.duration.initial
                    )
                  }
                />
                {!isUnlimited && (
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
                )}
              </SetupSection>
            </>
          )}
          {tab === 'weapons' && (
            <SetupSection
              styles={CONCORDAT_SETUP}
              title={CONCORDAT_SETUP_COPY.weapons}
              hint={CONCORDAT_SETUP_COPY.weaponsHint}
            >
              <SetupPicks
                styles={CONCORDAT_SETUP}
                options={WEAPONS}
                value={settings.weapons}
                onChange={set('weapons')}
              />
            </SetupSection>
          )}
        </div>
      )}
    </PlaySetupDrawer>
  )
}
