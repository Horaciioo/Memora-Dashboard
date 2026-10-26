'use client'

import { useState } from 'react'

import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import {
  SetupChips,
  SetupLetters,
  SetupSection,
  SetupStepper,
} from '@/composites/play/setup/PlaySetupFields'
import { bombSettingsOf } from '@/core/lib/play/bomb/settings'
import type { BombGameSettings } from '@/core/lib/play/bomb/settings'
import { BOMB_SETTINGS, BOMB_SETUP_COPY, fillPlayMessage, PLAY_ERRORS } from '@/declarations/play'
import type { BombDifficulty } from '@/declarations/play'
import { BOMB_SETUP, FIELD_STYLES } from '@/declarations/ui/variants'

// Tabs of the drawer
const TABS = [
  { value: 'words', label: BOMB_SETUP_COPY.tabWords, icon: 'playLetters' as const },
  { value: 'lives', label: BOMB_SETUP_COPY.tabLives, icon: 'playHeart' as const },
  { value: 'turns', label: BOMB_SETUP_COPY.tabTurns, icon: 'playRounds' as const },
]

// Levels as chips, their threshold under the name
const DIFFICULTIES: { value: BombDifficulty; label: string }[] = [
  ...Object.entries(BOMB_SETTINGS.wordsPerPrompt).map(([value, count]) => ({
    value: value as BombDifficulty,
    label: `${BOMB_SETUP_COPY[value as keyof typeof BOMB_SETTINGS.wordsPerPrompt]} - ${fillPlayMessage(BOMB_SETUP_COPY.wordsPerPrompt, { count })}`,
  })),
  { value: 'custom', label: BOMB_SETUP_COPY.custom },
]

/**
 * Rules picked before a Bomb Party game opens, as on jklm
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const BombSetupDrawer = ({ open, isSaving, onClose, onSubmit, current }: PlaySetupProps) => {
  const [settings, setSettings] = useState<BombGameSettings>(() =>
    bombSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof BombGameSettings>(key: K) =>
    (value: BombGameSettings[K]) =>
      setSettings((current) => ({ ...current, [key]: value }))
  const steps = { less: BOMB_SETUP_COPY.less, more: BOMB_SETUP_COPY.more }

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit={settings.bonusAlphabet.length > 0}
      copy={BOMB_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {(tab) => (
        <div className={BOMB_SETUP.body}>
          {tab === 'words' && (
            <>
              <SetupSection
                styles={BOMB_SETUP}
                title={BOMB_SETUP_COPY.dictionary}
                hint={BOMB_SETUP_COPY.dictionaryHint}
                aside={<span className={BOMB_SETUP.value}>{BOMB_SETUP_COPY.dictionaryValue}</span>}
              />
              <SetupSection
                styles={BOMB_SETUP}
                title={BOMB_SETUP_COPY.difficulty}
                hint={BOMB_SETUP_COPY.difficultyHint}
              >
                <SetupChips
                  styles={BOMB_SETUP}
                  options={DIFFICULTIES}
                  value={settings.difficulty}
                  onChange={set('difficulty')}
                />
              </SetupSection>
              {settings.difficulty === 'custom' && (
                <SetupSection styles={BOMB_SETUP} title={BOMB_SETUP_COPY.customCount}>
                  <SetupStepper
                    styles={BOMB_SETUP}
                    value={settings.wordsPerPrompt}
                    range={BOMB_SETTINGS.customWordsPerPrompt}
                    step={BOMB_SETTINGS.customWordsStep}
                    onChange={set('wordsPerPrompt')}
                    labels={steps}
                  />
                </SetupSection>
              )}
            </>
          )}

          {tab === 'lives' && (
            <>
              <SetupSection styles={BOMB_SETUP} title={BOMB_SETUP_COPY.startLives}>
                <SetupStepper
                  styles={BOMB_SETUP}
                  value={settings.startLives}
                  range={BOMB_SETTINGS.startLives}
                  onChange={(startLives) =>
                    setSettings((current) => ({
                      ...current,
                      startLives,
                      maxLives: Math.max(current.maxLives, startLives),
                    }))
                  }
                  labels={steps}
                />
              </SetupSection>
              <SetupSection
                styles={BOMB_SETUP}
                title={BOMB_SETUP_COPY.maxLives}
                hint={BOMB_SETUP_COPY.maxLivesHint}
              >
                <SetupStepper
                  styles={BOMB_SETUP}
                  value={settings.maxLives}
                  range={{ ...BOMB_SETTINGS.maxLives, min: settings.startLives }}
                  onChange={set('maxLives')}
                  labels={steps}
                />
              </SetupSection>
            </>
          )}

          {tab === 'turns' && (
            <>
              <SetupSection
                styles={BOMB_SETUP}
                title={BOMB_SETUP_COPY.minTurn}
                hint={BOMB_SETUP_COPY.minTurnHint}
              >
                <SetupStepper
                  styles={BOMB_SETUP}
                  value={settings.minTurnSeconds}
                  range={BOMB_SETTINGS.minTurnSeconds}
                  display={fillPlayMessage(BOMB_SETUP_COPY.seconds, {
                    seconds: settings.minTurnSeconds,
                  })}
                  onChange={set('minTurnSeconds')}
                  labels={steps}
                />
              </SetupSection>
              <SetupSection
                styles={BOMB_SETUP}
                title={BOMB_SETUP_COPY.promptAge}
                hint={BOMB_SETUP_COPY.promptAgeHint}
              >
                <SetupStepper
                  styles={BOMB_SETUP}
                  value={settings.promptAge}
                  range={BOMB_SETTINGS.promptAge}
                  display={fillPlayMessage(BOMB_SETUP_COPY.turns, { count: settings.promptAge })}
                  onChange={set('promptAge')}
                  labels={steps}
                />
              </SetupSection>
              <SetupSection
                styles={BOMB_SETUP}
                title={BOMB_SETUP_COPY.bonus}
                hint={BOMB_SETUP_COPY.bonusHint}
                aside={
                  <span className={BOMB_SETUP.count}>
                    {fillPlayMessage(BOMB_SETUP_COPY.bonusCount, {
                      count: settings.bonusAlphabet.length,
                      total: BOMB_SETTINGS.alphabet.length,
                    })}
                  </span>
                }
              >
                <SetupLetters
                  styles={BOMB_SETUP}
                  alphabet={BOMB_SETTINGS.alphabet}
                  value={settings.bonusAlphabet}
                  onChange={set('bonusAlphabet')}
                  labels={BOMB_SETUP_COPY}
                />
                {!settings.bonusAlphabet.length && (
                  <p className={FIELD_STYLES.error}>{PLAY_ERRORS.bonusEmpty}</p>
                )}
              </SetupSection>
            </>
          )}
        </div>
      )}
    </PlaySetupDrawer>
  )
}
