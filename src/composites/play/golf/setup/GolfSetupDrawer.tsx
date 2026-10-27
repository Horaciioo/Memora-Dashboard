'use client'

import { useState } from 'react'

import { GolfPowerPicker } from '@/composites/play/golf/setup/GolfPowerPicker'
import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupChips, SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { golfSettingsOf, holeRange } from '@/core/lib/play/golf'
import type { GolfGameSettings } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_SETUP_COPY } from '@/declarations/play/golf/copy'
import { GOLF_RANDOM_COURSE } from '@/declarations/play/golf/courses'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GOLF_SETUP } from '@/declarations/ui/variants'

// Tabs of the drawer
const TABS = [
  { value: 'rules', label: GOLF_SETUP_COPY.tabRules, icon: 'playRules' as const },
  { value: 'powers', label: GOLF_SETUP_COPY.tabPowers, icon: 'golfBumper' as const },
]

// Clock presets
const CLOCKS = GOLF_SETTINGS.holeSecondsPresets.map((seconds) => ({
  value: seconds,
  label: fillPlayMessage(GOLF_SETUP_COPY.seconds, { seconds }),
}))

// Collisions on or off
const COLLISIONS = [
  { value: 'on', label: GOLF_SETUP_COPY.on },
  { value: 'off', label: GOLF_SETUP_COPY.off },
]

// Stroke ceiling or none
const CEILINGS = [
  { value: 'limited', label: GOLF_SETUP_COPY.limited },
  { value: 'unlimited', label: GOLF_SETUP_COPY.unlimited },
]

/**
 * Rules and powers of a golf game, format and course are voted at launch
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const GolfSetupDrawer = ({ open, isSaving, onClose, onSubmit, current }: PlaySetupProps) => {
  const [settings, setSettings] = useState<GolfGameSettings>(() =>
    golfSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof GolfGameSettings>(key: K) =>
    (value: GolfGameSettings[K]) =>
      setSettings((current) => ({ ...current, [key]: value }))
  const steps = { less: GOLF_SETUP_COPY.less, more: GOLF_SETUP_COPY.more }

  return (
    <>
      <PlaySetupDrawer
        open={open}
        isSaving={isSaving}
        isEditing={Boolean(current)}
        canSubmit
        copy={GOLF_SETUP_COPY}
        tabs={TABS}
        onClose={onClose}
        onSubmit={() => onSubmit({ settings })}
      >
        {(tab) => (
          <div className={GOLF_SETUP.body}>
            {tab === 'rules' && (
              <>
                <SetupSection
                  styles={GOLF_SETUP}
                  title={GOLF_SETUP_COPY.holes}
                  hint={GOLF_SETUP_COPY.holesHint}
                >
                  <SetupStepper
                    styles={GOLF_SETUP}
                    value={settings.holes}
                    range={holeRange(GOLF_RANDOM_COURSE)}
                    display={fillPlayMessage(GOLF_SETUP_COPY.holesCount, { count: settings.holes })}
                    onChange={set('holes')}
                    labels={steps}
                  />
                </SetupSection>
                <SetupSection
                  styles={GOLF_SETUP}
                  title={GOLF_SETUP_COPY.holeSeconds}
                  hint={GOLF_SETUP_COPY.holeSecondsHint}
                >
                  <SetupChips
                    styles={GOLF_SETUP}
                    options={CLOCKS}
                    value={settings.holeSeconds}
                    onChange={set('holeSeconds')}
                  />
                </SetupSection>
                <SetupSection
                  styles={GOLF_SETUP}
                  title={GOLF_SETUP_COPY.maxStrokes}
                  hint={
                    settings.unlimitedStrokes
                      ? GOLF_SETUP_COPY.unlimitedHint
                      : fillPlayMessage(GOLF_SETUP_COPY.maxStrokesHint, {
                          penalty: GOLF_SETTINGS.missPenalty,
                        })
                  }
                >
                  <SetupChips
                    styles={GOLF_SETUP}
                    options={CEILINGS}
                    value={settings.unlimitedStrokes ? 'unlimited' : 'limited'}
                    onChange={(choice) => set('unlimitedStrokes')(choice === 'unlimited')}
                  />
                  {!settings.unlimitedStrokes && (
                    <SetupStepper
                      styles={GOLF_SETUP}
                      value={settings.maxStrokes}
                      range={GOLF_SETTINGS.maxStrokes}
                      display={fillPlayMessage(GOLF_SETUP_COPY.strokes, {
                        count: settings.maxStrokes,
                      })}
                      onChange={set('maxStrokes')}
                      labels={steps}
                    />
                  )}
                </SetupSection>
                <SetupSection
                  styles={GOLF_SETUP}
                  title={GOLF_SETUP_COPY.collisions}
                  hint={GOLF_SETUP_COPY.collisionsHint}
                >
                  <SetupChips
                    styles={GOLF_SETUP}
                    options={COLLISIONS}
                    value={settings.collisions ? 'on' : 'off'}
                    onChange={(choice) => set('collisions')(choice === 'on')}
                  />
                </SetupSection>
              </>
            )}

            {tab === 'powers' && (
              <SetupSection
                styles={GOLF_SETUP}
                title={GOLF_SETUP_COPY.powers}
                hint={GOLF_SETUP_COPY.powersHint}
                aside={
                  <span className={GOLF_SETUP.count}>
                    {fillPlayMessage(GOLF_SETUP_COPY.powersCount, {
                      count: settings.powers.length,
                      total: GOLF_POWERS.keys.length,
                    })}
                  </span>
                }
              >
                <GolfPowerPicker value={settings.powers} onChange={set('powers')} />
                <div className={GOLF_SETUP.quick}>
                  <button
                    type="button"
                    className={GOLF_SETUP.quickButton}
                    onClick={() => set('powers')(GOLF_POWERS.keys)}
                  >
                    {GOLF_SETUP_COPY.all}
                  </button>
                  <button
                    type="button"
                    className={GOLF_SETUP.quickButton}
                    onClick={() => set('powers')([])}
                  >
                    {GOLF_SETUP_COPY.none}
                  </button>
                </div>
              </SetupSection>
            )}
          </div>
        )}
      </PlaySetupDrawer>
    </>
  )
}
